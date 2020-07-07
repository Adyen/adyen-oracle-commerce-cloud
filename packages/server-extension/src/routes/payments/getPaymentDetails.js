import getCheckout from '../../utils/checkout'
import mcache from 'memory-cache'
import { getExternalProperties } from '../../utils/checkout'

export default async (req, res, next) => {
    const { customProperties } = req.body
    const checkout = getCheckout(req)

    const { paymentData, ...details } = customProperties

    try {
        const getPaymentResponse = async () => {
            const key = `__express__d${details.orderId}`
            const cachedResponse = await mcache.get(key)
            if (cachedResponse) {
                return cachedResponse
            }
            const body = { paymentData, details }
            const paymentResponse = await checkout.paymentsDetails(body)

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
            hostTimestamp: new Date().toISOString(),
            paymentId: req.body.paymentId,
            ...getExternalProperties(paymentResponse),
            merchantTransactionId: paymentResponse.pspReference,
            response: { success: isSuccess },
            orderId: customProperties.orderId,
            transactionType: req.body.transactionType,
        }

        res.json(response)
    } catch (e) {
        next(e)
    }
}
