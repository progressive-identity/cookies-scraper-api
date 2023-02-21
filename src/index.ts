import './utils/logging/initapm'
import dotenv from 'dotenv'
import app from './server'
import 'regenerator-runtime/runtime.js'
import { aliasLogger } from './utils/logging/aliasLogger'
import { Server } from 'http'

dotenv.config()

const port = process.env.PORT ?? ''

let server: Server

if (app) {
  server = app.listen(port, () => {
    aliasLogger.info(
      `⚡️[server]: Server is running at https://localhost:${port}`
    )
  })
}

const gracefulShutdown = () => {
  aliasLogger.info(`Process ${process.pid} is shutting down gracefully!`)

  server.close(() => {
    aliasLogger.info('Closing remaining connections')
    process.kill(process.pid, 'SIGUSR2')
    process.exit(0)
  })
}

process.on('uncaughtException' || 'unhandledRejection', (err: Error) => {
  aliasLogger.error(err.message)
  process.exit(1)
})

process.once('SIGTERM' || 'SIGINT' || 'SIGUSR2', gracefulShutdown)
