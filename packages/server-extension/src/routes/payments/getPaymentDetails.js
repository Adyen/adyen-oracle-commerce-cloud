import getCheckout from '../../utils/checkout'
import { getExternalProperties } from '../../utils/checkout'

export default async (req, res, next) => {
    const { customProperties } = req.body
    const checkout = getCheckout(req)

    try {
        const body = {
            paymentData: customProperties.paymentData,
            details: {
                MD: customProperties.MD,
                PaRes: customProperties.PaRes,
            },
        }

        const paymentResponse = await checkout.paymentsDetails(body)

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
