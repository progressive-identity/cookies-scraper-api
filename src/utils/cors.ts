import { CorsOptions } from 'cors'
import { RequestError } from './errors/RequestError'
import { GenericErrorNames } from './errors/types/GenericErrorUtils'

const whitelist = (process.env.CORS_WHITELIST &&
  process.env.CORS_WHITELIST.split(',')) || ['']
const methods = ['GET', 'POST', 'PUT', 'DELETE']
export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (whitelist.includes(origin as string) || !origin) {
      callback(null, true)
    } else {
      callback(new RequestError(GenericErrorNames.CorsRequestBlocked))
    }
  },
  methods: methods,
}
