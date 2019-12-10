import getCheckout from '../../utils/checkout'
import mcache from 'memory-cache'

export default async (req, res, next) => {
    const { customProperties } = req.body
    const checkout = getCheckout(req)

    const { paymentData, ...details } = customProperties

    try {
        const getPaymentResponse = async () => {
            const key = `__express__d${customProperties.orderId}`
            const cachedResponse = mcache.get(key)
            if (cachedResponse) {
                return cachedResponse
            }

            const body = { paymentData, details }
            const paymentResponse = await checkout.paymentsDetails(body)

            const isSuccess = paymentResponse.resultCode === 'Authorised'
            if (isSuccess) {
                await mcache.put(key, paymentResponse, 3600 * 1000)
            }

            return paymentResponse
        }

        const paymentResponse = await getPaymentResponse()
        const isSuccess = paymentResponse.resultCode === 'Authorised'

        const response = {
            amount: req.body.amount,
            hostTimestamp: new Date().toISOString(),
            paymentId: req.body.paymentId,
            additionalProperties: {
                data: JSON.stringify(paymentResponse.additionalData),
                resultCode: paymentResponse.resultCode,
            },
            externalProperties: ['data', 'resultCode'],
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
