import pino from 'pino'
import packageJson from './../../../package.json'

export const aliasLogger = pino({
  name: packageJson.name,
  level: process.env.LOG_LEVEL ?? 'info',
})
