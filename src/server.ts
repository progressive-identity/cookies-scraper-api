import express, {Express} from 'express'
import errorHandler from './middlewares/errorHandler'
import helmet from 'helmet'
import cors from 'cors'
import {corsOptions} from './utils/cors'
import xXssProtection from 'x-xss-protection'
import {ApiPrefixes} from './routes/urlConstants'
import {router} from './routes/router'

const app: Express = express()

app.use(helmet())
app.use(xXssProtection())
app.use(cors(corsOptions))
app.use(express.json())

app.use(
  ApiPrefixes.V1,
  router
)

app.use(errorHandler)

export default app
