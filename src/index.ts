import fastify from 'fastify'
import 'regenerator-runtime/runtime.js'
import helmet from '@fastify/helmet'
import xXssProtection from 'x-xss-protection'
import middleware from '@fastify/middie'
import dotenv from 'dotenv'
import { ApiPrefixes } from './routes/urlConstants'
import cookieRouter from './routes/cookies'
import { aliasLogger } from './utils/logging/aliasLogger'
import cors from '@fastify/cors'

dotenv.config()

const port = process.env.API_PORT ?? 8080
const whitelist = (process.env.CORS_WHITELIST &&
  process.env.CORS_WHITELIST.split(',')) || ['']

/**
 *
 */
export async function startServer() {
  try {
    const server = await fastify({
      // TODO improves logger
      logger: aliasLogger,
    })

    // Middlewares managed by a @fastify package
    await server.register(helmet)
    await server.register(cors, {
      origin: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    })

    // Additional middlewares : https://www.fastify.io/docs/latest/Reference/Middleware/
    await server.register(middleware)
    server.use(xXssProtection())

    // TODO maybe could be improved and extracted in a separate function
    await server.register(cookieRouter, { prefix: ApiPrefixes.V1 })

    // TODO improves error handling
    server.setErrorHandler((error, request, reply) => {
      server.log.error(error)
    })

    if (process.env.NODE_ENV === 'production') {
      for (const signal of ['SIGINT', 'SIGTERM']) {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        process.on(signal, () =>
          server.close().then((err) => {
            aliasLogger.error(`close application on ${signal}`)
            process.exit(err ? 1 : 0)
          })
        )
      }
    }

    // Starting the server
    await server.listen({ port: Number(port) })

    process.on('uncaughtException' || 'unhandledRejection', (e) => {
      aliasLogger.error(e)
      process.exit(1)
    })
  } catch (e) {
    aliasLogger.error(e)
  }
}

void startServer()
