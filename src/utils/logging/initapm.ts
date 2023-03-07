import apm from 'elastic-apm-node'
import dotenv from 'dotenv'
import packageJson from './../../../package.json'

dotenv.config()

/**
 * APM is started in its own module so that it can be imported on the top of the main file (index.ts).
 * https://www.elastic.co/guide/en/apm/agent/nodejs/current/starting-the-agent.html#start-option-separate-init-module
 */
if (process.env.NODE_ENV !== 'development') {
  apm.start({
    serverUrl: process.env.ELASTIC_APM_SERVER_URL,
    secretToken: process.env.ELASTIC_APM_SECRET_TOKEN,
    serviceName: packageJson.name,
  })
}
