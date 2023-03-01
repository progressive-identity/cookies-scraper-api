import './initapm'
import ecsFormat from '@elastic/ecs-pino-format'
import pino, { Logger } from 'pino'
import dotenv from 'dotenv'
import packageJson from './../../../package.json'

dotenv.config()

export let aliasLogger: Logger
/**
 * @see {@link https://getpino.io/#/}
 * @see {@link https://www.elastic.co/guide/en/ecs-logging/nodejs/current/pino.html#pino}
 * @see {@link https://betterstack.com/community/guides/logging/how-to-install-setup-and-use-pino-to-log-node-js-applications/}
 */
if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'development') {
  aliasLogger = pino(ecsFormat())
} else {
  aliasLogger = pino({
    name: packageJson.name,
    level: process.env.LOG_LEVEL ?? 'info',
  })
}
