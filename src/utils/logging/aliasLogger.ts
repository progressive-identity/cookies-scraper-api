import './initapm'
import ecsFormat from '@elastic/ecs-pino-format'
import pino, { Logger } from 'pino'
import dotenv from 'dotenv'
import packageJson from './../../../package.json'

dotenv.config()
const nodeEnv = process.env.NODE_ENV ?? 'development'
const logLevel = process.env.LOG_LEVEL ?? 'info'

/**
 * @see {@link https://getpino.io/#/}
 * @see {@link https://www.elastic.co/guide/en/ecs-logging/nodejs/current/pino.html#pino}
 * @see {@link https://betterstack.com/community/guides/logging/how-to-install-setup-and-use-pino-to-log-node-js-applications/}
 */
export let aliasLogger: Logger
if (nodeEnv !== 'test' && nodeEnv !== 'development') {
  aliasLogger = pino(ecsFormat({ convertReqRes: true }))
} else {
  aliasLogger = pino({
    name: packageJson.name,
    level: logLevel,
  })
}
aliasLogger.info(
  `Logger started on ${nodeEnv} environment, level :${aliasLogger.level}`
)
