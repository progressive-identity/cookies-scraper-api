import express from 'express'
import {catchError} from '../utils/catchError'
import {CookieScrapperController} from '../controllers/CookieScrapperController'

export const routerPrivacyPolicies = express.Router()

const cookieScrapperController = new CookieScrapperController()

// TODO see how to properly use the new way of generating paths in openapi-typescript package
const privacyPolicyPath = '/cookies'
routerPrivacyPolicies.post(
  privacyPolicyPath,
  catchError(cookieScrapperController.create)
)

