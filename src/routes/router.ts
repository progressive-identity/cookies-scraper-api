import { Router } from 'express'

import * as entitiesRouters from './index'

export const router = Router()

Object.values(entitiesRouters).forEach((entityRouter) => {
  router.use(entityRouter)
})
