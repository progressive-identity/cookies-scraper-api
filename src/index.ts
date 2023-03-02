import './utils/logging/initapm'
import 'regenerator-runtime/runtime.js'
import fastify from 'fastify'
import helmet from '@fastify/helmet'
import cors from '@fastify/cors'
import middleware from '@fastify/middie'
import xXssProtection from 'x-xss-protection'
import cookieRouter from './routes/cookies'
import { aliasLogger } from './utils/logging/aliasLogger'
import { ApiPrefixes } from './routes/urlConstants'
import dotenv from 'dotenv'

dotenv.config()

const port = process.env.API_PORT ?? 8080
const host = process.env.HOST ?? 'localhost'
const whitelist =
  (process.env.CORS_WHITELIST && process.env.CORS_WHITELIST.split(',')) || true

/**
 *
 */
export async function startServer() {
  try {
    const server = await fastify({
      // TODO improves logger
      logger: true,
    })

    // Middlewares managed by a @fastify package
    await server.register(helmet)
    // https://github.com/fastify/fastify-cors#options
    await server.register(cors, {
      origin: whitelist,
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
        process.on(signal, () => {
          void (async () => {
            await server.close().then((err) => {
              aliasLogger.error(`close application on ${signal}`)
              process.exit(err ? 1 : 0)
            })
          })()
        })
      }
    }

    // Starting the server
    await server.listen({ port: Number(port), host })

    process.on('uncaughtException' || 'unhandledRejection', (err) => {
      aliasLogger.error(err)
      process.exit(1)
    })
  } catch (e) {
    aliasLogger.error(e)
  }
}

void startServer()
