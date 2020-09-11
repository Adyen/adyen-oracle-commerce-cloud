import express from 'express'
import payments from './payments/index.mjs'
import paymentMethods from './paymentMethods/index.mjs'
import errorMiddleware from '../middlewares/errorHandler.mjs'
import validateWebhookMiddleware from '../middlewares/validateWebhook.mjs'
import loggerMiddleware from '../middlewares/logger.mjs'
import createClient from '../middlewares/createClient.mjs'
import uaParser from '../middlewares/uaParser.mjs'
import occClient from '../middlewares/occClient.mjs'
import cache from '../helpers/serverCache.mjs'
import clearCache from './clearCache/index.mjs'

const router = express.Router()
const oneDay = 86400

router.use(loggerMiddleware)
router.use(uaParser)
router.use(occClient, createClient)

router.use('/v1/paymentMethods', cache(oneDay), paymentMethods)
router.use('/v1/clearCache', clearCache)
router.use('/v1/payments', validateWebhookMiddleware, payments)

router.use(errorMiddleware)

const adyenRouter = router.use('/adyen', router)

export default adyenRouter
