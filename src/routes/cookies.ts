import { FastifyInstance } from 'fastify'
import { CookiesController } from '../controllers/CookiesController'
import { paths } from '../../types/cookies-scraper.openapi-types'

const cookieScrapperController = new CookiesController()

const basePath: keyof paths = '/cookies'

// eslint-disable-next-line @typescript-eslint/require-await
async function cookieRouter(fastify: FastifyInstance) {
  fastify.route({
    method: 'GET',
    url: basePath,
    handler: cookieScrapperController.getByUrl,
  })
}

export default cookieRouter
