import getCheckout from '../../utils/checkout'
import nconf from 'nconf/lib/nconf'
import mcache from 'memory-cache'
import { getExternalProperties } from '../../utils/checkout'

export default async (req, res, next) => {
    const { customProperties } = req.body
    const hasPaymentData = 'paymentData' in customProperties

    if (hasPaymentData) {
        return next()
    }

    const { userAgent, gatewaySettings } = req.app.locals
    const checkout = getCheckout(req)

    const {
        amount,
        transactionId,
        orderId,
        customProperties: {
            paymentDetails,
            nameOnCard,
            storedPayment,
            numberOfInstallments,
            selectedBrand,
            additionalData,
        },
        currencyCode,
        profile,
        channel,
    } = req.body

    const { merchantId: merchantAccount } = gatewaySettings[channel]

    try {
        const host = {
            preview: nconf.get('atg.server.admin.url'),
            storefront: nconf.get('atg.server.url'),
        }

        const returnUrl = `${host[channel]}/checkout?orderId=${orderId}`

        const getPaymentResponse = async () => {
            const key = `__express__${orderId}`
            const cachedResponse = mcache.get(key)
            if (cachedResponse) {
                return cachedResponse
            }

            const paymentDetailsJson = JSON.parse(paymentDetails)
            const { type } = paymentDetailsJson.paymentMethod
            const installments = numberOfInstallments && {
                installments: { value: numberOfInstallments },
            }
            const details = {
                scheme: {
                    enableRecurring: storedPayment.includes('recurring'),
                    enableOneClick: storedPayment.includes('oneClick'),
                    redirectToIssuerMethod: 'GET',
                    redirectFromIssuerMethod: 'GET',
                    shopperName: nameOnCard,
                    returnUrl,
                    ...installments,
                    ...paymentDetailsJson,
                },
                boletobancario: paymentDetailsJson,
            }

            const paymentResponse = await checkout.payments(
                {
                    amount: { value: amount, currency: currencyCode },
                    ...(additionalData && {
                        additionalData: JSON.parse(additionalData),
                    }),
                    merchantAccount,
                    applicationInfo: {
                        externalPlatform: {
                            integrator: '',
                            name: 'Oracle Commerce Cloud',
                            version: '', // TODO: get version from OCC
                        },
                        adyenPaymentSource: {
                            version: '', // TODO: create static file with version num
                            name: 'adyen-oracle-commerce-cloud',
                        },
                    },
                    browserInfo: {
                        userAgent: userAgent.ua,
                    },
                    reference: transactionId,
                    selectedBrand,
                    shopperEmail: profile.email,
                    shopperReference: profile.id,
                    ...details[type],
                },
                { idempotencyKey: `${orderId}-${transactionId}` }
            )

            if (paymentResponse.resultCode === 'Authorised') {
                await mcache.put(key, paymentResponse, 3600 * 1000)
            }

            return paymentResponse
        }

        const paymentResponse = await getPaymentResponse()
        const isSuccess = !('refusalReason' in paymentResponse)

        const additionalProperties =
            paymentResponse.action || paymentResponse.additionalData

        const merchantTransactionId =
            paymentResponse.pspReference ||
            `${merchantAccount}:${transactionId}`

        const response = {
            transactionType: req.body.transactionType,
            currencyCode: req.body.currencyCode,
            locale: req.body.locale,
            channel: req.body.channel,
            siteId: req.body.siteId,
            orderId: req.body.orderId,
            amount: req.body.amount,
            hostTimestamp: new Date().toISOString(),
            paymentId: req.body.paymentId,
            response: { success: isSuccess },
            merchantTransactionId,
            ...getExternalProperties({
                additionalData: additionalProperties,
                resultCode: paymentResponse.resultCode,
            }),
        }

        res.json(response)
    } catch (e) {
        next(e)
    }
}
