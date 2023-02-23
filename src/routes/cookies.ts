import express from 'express'
import { catchError } from '../utils/catchError'
import { CookiesController } from '../controllers/CookiesController'
import { paths } from '../../types/cookies-scraper.openapi-types'

export const routerCookies = express.Router()

const cookieScrapperController = new CookiesController()

const basePath: keyof paths = '/cookies'
routerCookies.get(basePath, catchError(cookieScrapperController.getByUrl))
