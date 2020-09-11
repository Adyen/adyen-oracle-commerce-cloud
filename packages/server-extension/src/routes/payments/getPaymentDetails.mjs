import getCheckout from '../../utils/checkout.mjs'
import mcache from 'memory-cache'
import { getExternalProperties } from '../../utils/checkout.mjs'

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
            const getBody = () => {
                if (customProperties.details) {
                    return { paymentData, details: JSON.parse(customProperties.details) }
                }
                return { paymentData, details }
            }
            const body = getBody()
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
            ...(req.body.amount && { amount: req.body.amount }),
            hostTimestamp: new Date().toISOString(),
            ...(req.body.paymentId && { paymentId: req.body.paymentId }),
            ...getExternalProperties(paymentResponse),
            ...(paymentResponse.pspReference && { merchantTransactionId: paymentResponse.pspReference }),
            response: { success: isSuccess },
            ...(customProperties.orderId && { orderId: customProperties.orderId }),
            ...(req.body.transactionType && { transactionType: req.body.transactionType }),
        }

        res.json(response)
    } catch (e) {
        next(e)
    }
}
