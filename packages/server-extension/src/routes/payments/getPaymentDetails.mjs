import getCheckout from '../../utils/checkout.mjs'
import mcache from 'memory-cache'
import { getExternalProperties } from '../../utils/checkout.mjs'

export default async (paymentData, req, res, next) => {
    try {
        const { customProperties, orderId } = req.body
        const checkout = getCheckout(req)

        const paymentDetails = JSON.parse(customProperties.paymentDetails)
        const getPaymentResponse = async () => {
            const key = `__express__d${orderId}`
            const cachedResponse = await mcache.get(key)
            if (cachedResponse) {
                return cachedResponse
            }
            const paymentResponse = await checkout.paymentsDetails(paymentDetails)

            const isSuccess = !('refusalReason' in paymentResponse)
            if (isSuccess) {
                await mcache.put(key, paymentResponse, 3600 * 1000)
            }

            return paymentResponse
        }

        const paymentResponse = await getPaymentResponse()
        const isSuccess = !('refusalReason' in paymentResponse)

        const response = {
            amount: req.body.amount,
            hostTimestamp: req.body.transactionTimestamp,
            paymentId: req.body.paymentId,
            ...getExternalProperties(paymentResponse),
            merchantTransactionId: req.body.transactionId,
            response: { success: isSuccess },
            orderId: req.body.orderId,
            transactionType: req.body.transactionType,
        }

        res.json(response)
    } catch (e) {
        next(e)
    }
}
