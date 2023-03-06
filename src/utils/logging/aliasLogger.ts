import pino, { Logger } from 'pino'
import dotenv from 'dotenv'
import ecsFormat from '@elastic/ecs-pino-format'
import packageJson from './../../../package.json'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import pinoElastic from 'pino-elasticsearch'

dotenv.config()
const logLevel = process.env.LOG_LEVEL ?? 'info'
const nodeEnv = process.env.NODE_ENV ?? 'development'
const kibanaUrl = process.env.ELASTIC_KIBANA_SERVER_URL ?? ''

/**
 * @see {@link https://www.notion.so/aliasdev/Logging-ed0ddeecd04b440490ad5a0fe04ac23c} internal documentation
 * @see {@link https://getpino.io/#/} pino documentation
 * @see {@link https://www.elastic.co/guide/en/ecs-logging/nodejs/current/pino.html#pino} elastic documentation
 * @see {@link https://betterstack.com/community/guides/logging/how-to-install-setup-and-use-pino-to-log-node-js-applications/} a tutorial
 */
export let aliasLogger: Logger = pino({
  name: packageJson.name,
  level: logLevel,
})
if (nodeEnv !== 'development') {
  if (kibanaUrl) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const streamToElastic = pinoElastic({
      index: 'pino',
      node: kibanaUrl,
    }) as NodeJS.WriteStream
    const streams = [{ stream: process.stdout }, { stream: streamToElastic }]
    aliasLogger = pino(
      { level: logLevel, ...ecsFormat() },
      pino.multistream(streams)
    )
  } else {
    aliasLogger.warn("No url found for Kibana, logs won't be send to elastic.")
  }
}

aliasLogger.info(
  `Logger started on ${nodeEnv} environment, level :${aliasLogger.level}`
)
