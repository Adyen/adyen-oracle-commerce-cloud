import getCheckout from '../../utils/checkout'
import nconf from 'nconf/lib/nconf'
import mcache from 'memory-cache'

export default async (req, res, next) => {
    const { customProperties } = req.body
    const hasPaymentData = 'paymentData' in customProperties

    if (hasPaymentData) {
        return next()
    }

    const { gatewaySettings } = req.app.locals
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
            const { type, countryCode, ...paymentMethodRest } = paymentDetailsJson.paymentMethod
            const installments = numberOfInstallments && {
                installments: { value: numberOfInstallments },
            }

            const paymentMethod = { type, ...paymentMethodRest }
            const defaultDetails = {
                ...paymentDetailsJson,
                redirectFromIssuerMethod: 'GET',
                redirectToIssuerMethod: 'GET',
                returnUrl,
                paymentMethod,
                additionalData: { allow3DS2: true },
                origin: host[channel],
                channel: 'web',
            }

            const scheme = {
                enableRecurring: storedPayment.includes('recurring'),
                enableOneClick: storedPayment.includes('oneClick'),
                shopperName: nameOnCard,
                ...installments,
                ...defaultDetails,
            }

            const details = type === 'scheme' ? scheme : defaultDetails

            const paymentResponse = await checkout.payments(
                {
                    amount: { value: amount, currency: currencyCode },
                    ...(additionalData && {
                        additionalData: JSON.parse(additionalData),
                    }),
                    ...(countryCode && { countryCode }),
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
                    reference: transactionId,
                    selectedBrand,
                    shopperEmail: profile.email,
                    shopperReference: profile.id,
                    ...details,
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

        const additionalProperties = paymentResponse.action || paymentResponse.additionalData

        const merchantTransactionId = paymentResponse.pspReference || `${merchantAccount}:${transactionId}`

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
            additionalProperties: {
                data: JSON.stringify(additionalProperties),
                resultCode: paymentResponse.resultCode,
            },
            externalProperties: ['data', 'resultCode'],
        }

        res.json(response)
    } catch (e) {
        next(e)
    }
}
