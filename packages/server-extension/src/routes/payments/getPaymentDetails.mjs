import getCheckout from '../../utils/checkout.mjs'
import mcache from 'memory-cache'
import { getExternalProperties } from '../../utils/checkout.mjs'

function getResponse(paymentResponse, { req }) {
    const isSuccess = !('refusalReason' in paymentResponse)
    return {
        amount: req.body.amount,
        hostTimestamp: req.body.transactionTimestamp,
        paymentId: req.body.paymentId,
        ...getExternalProperties(paymentResponse),
        merchantTransactionId: req.body.transactionId,
        response: { success: isSuccess },
        orderId: req.body.orderId,
        transactionType: req.body.transactionType,
    }
}

async function getPaymentResponse(orderId, checkout, paymentDetails, cb) {
    const key = `__express__d${orderId}`
    const cachedResponse = await mcache.get(key)
    if (cachedResponse) {
        return cachedResponse
    }

    const paymentResponse = await checkout.paymentsDetails(paymentDetails)
    cb(paymentResponse)

    if (paymentResponse.resultCode === 'Authorised') {
        await mcache.put(key, paymentResponse, 3600 * 1000)
    }

    return paymentResponse
}

export default async (req, res, next) => {
    const { logger } = req.app.locals
    logger.info(`${req.protocol.toUpperCase()} ${req.method.toUpperCase()} /payments/details`)

    try {
        const { customProperties, orderId } = req.body
        const checkout = getCheckout(req)

        const details = JSON.parse(customProperties.details)
        const payload = {
            paymentData: customProperties.paymentData,
            details,
        }
        const paymentResponse = await getPaymentResponse(orderId, checkout, payload, function (pr) {
            req.app.locals.logger.info({ paymentResponse: pr })
        })

        return res.json(getResponse(paymentResponse, { req }))
    } catch (e) {
        next(e)
    }
}
