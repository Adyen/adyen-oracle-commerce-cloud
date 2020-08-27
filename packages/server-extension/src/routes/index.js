import express from 'express'
import payments from './payments/index'
import paymentMethods from './paymentMethods/index'
import errorMiddleware from '../middlewares/errorHandler'
import validateWebhookMiddleware from '../middlewares/validateWebhook'
import loggerMiddleware from '../middlewares/logger'
import createClient from '../middlewares/createClient'
import uaParser from '../middlewares/uaParser'
import occClient from '../middlewares/occClient'
import cache from '../helpers/serverCache'
import clearCache from './clearCache/index'

const router = express.Router()
const oneWeek = 604800

router.use(loggerMiddleware)
router.use(uaParser)
router.use(occClient, createClient)

router.use('/v1/payments', validateWebhookMiddleware, payments)
router.use('/v1/paymentMethods', cache(oneWeek), paymentMethods)
router.use('/v1/clearCache', clearCache)

router.use(errorMiddleware)

const adyenRouter = router.use('/adyen', router)

export default adyenRouter
