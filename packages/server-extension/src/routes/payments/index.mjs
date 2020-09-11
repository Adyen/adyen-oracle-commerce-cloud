import express from 'express'
import getPayment from './getPayment.mjs'
import getPaymentDetails from './getPaymentDetails.mjs'

const router = express.Router()
router.post('/', getPayment, getPaymentDetails)

export default router
