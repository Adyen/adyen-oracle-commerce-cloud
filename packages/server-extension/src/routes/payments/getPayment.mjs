import getCheckout from '../../utils/checkout.mjs'
import nconf from 'nconf/lib/nconf.js'
import mcache from 'memory-cache'
import { getExternalProperties } from '../../utils/checkout.mjs'
import pkgJson from '../../../package.json'

const getAdditionalProperties = (paymentResponse) => paymentResponse.action || paymentResponse.additionalData
const getMerchantTransactionId = (paymentResponse, { merchantAccount, transactionId }) =>
    paymentResponse.pspReference || `${merchantAccount}:${transactionId}`

export default async (req, res, next) => {
    const {
        customProperties,
        transactionType,
        currencyCode,
        locale,
        channel,
        transactionId,
        siteId,
        orderId,
        amount,
        paymentId,
    } = req.body

    const hasPaymentData = 'paymentData' in customProperties

    if (hasPaymentData) {
        return next(customProperties.paymentData)
    }

    const { gatewaySettings } = req.app.locals
    const { merchantId: merchantAccount } = gatewaySettings[channel]

    try {
        const paymentResponse = await getPaymentResponse(req, merchantAccount)
        const isSuccess = !('refusalReason' in paymentResponse)

        const response = {
            transactionType,
            currencyCode,
            locale,
            channel,
            siteId,
            orderId,
            amount,
            paymentId,
            hostTimestamp: new Date().toISOString(),
            response: { success: isSuccess },
            merchantTransactionId: getMerchantTransactionId(paymentResponse, { merchantAccount, transactionId }),
            ...getExternalProperties({
                additionalData: getAdditionalProperties(paymentResponse),
                resultCode: paymentResponse.resultCode,
            }),
        }

        res.json(response)
    } catch (e) {
        next(e)
    }
}

const getAdditionalData = ({ riskData, additionalData }) => {
    const parsedRiskData = JSON.parse(riskData)
    if (additionalData) {
        const data = JSON.parse(additionalData)
        return {
            ...data,
            riskData: {
                ...data.riskData,
                ...parsedRiskData,
            },
        }
    }

    return {
        riskData: parsedRiskData,
        allow3DS2: true,
    }
}

const getPaymentResponse = async (req, merchantAccount) => {
    const { transactionId, orderId } = req.body
    const key = `__express__${orderId}`
    const cachedResponse = mcache.get(key)

    if (cachedResponse) {
        return cachedResponse
    }

    const payload = getPayload(req, merchantAccount)
    const checkout = getCheckout(req)

    const paymentResponse = await checkout.payments(payload, { idempotencyKey: `${orderId}-${transactionId}` })

    if (paymentResponse.resultCode === 'Authorised') {
        await mcache.put(key, paymentResponse, 3600 * 1000)
    }

    return paymentResponse
}

const getField = (arg0, fieldKey) => (Array.isArray(arg0) ? arg0[0][fieldKey] : arg0[fieldKey])

const getAddress = (address) => ({
    city: getField(address, 'city'),
    country: getField(address, 'country'),
    postalCode: getField(address, 'postalCode'),
    stateOrProvince: getField(address, 'state'),
    street: getField(address, 'address1'),
    houseNumberOrName: getField(address, 'address2') || 'N/A',
})

function getPayload(req, merchantAccount) {
    const {
        amount,
        transactionId,
        orderId,
        customProperties: {
            accountInfo,
            browserInfo,
            paymentDetails,
            nameOnCard,
            storedPayment,
            numberOfInstallments,
            selectedBrand,
            additionalData,
            riskData,
        },
        currencyCode,
        profile,
        channel,
        shippingAddress,
        billingAddress,
    } = req.body

    const paymentDetailsJson = JSON.parse(paymentDetails)

    const { type, countryCode, ...paymentMethodRest } = paymentDetailsJson.paymentMethod
    const installments = getInstallments(numberOfInstallments)

    const host = {
        preview: nconf.get('atg.server.admin.url'),
        storefront: nconf.get('atg.server.url'),
    }

    const returnUrl = `${host[channel]}/checkout?orderId=${orderId}`

    const paymentMethod = { type, ...paymentMethodRest }
    const defaultDetails = {
        ...paymentDetailsJson,
        redirectFromIssuerMethod: 'GET',
        redirectToIssuerMethod: 'GET',
        returnUrl,
        paymentMethod,
    }

    const scheme = {
        enableRecurring: storedPayment.includes('recurring'),
        enableOneClick: storedPayment.includes('oneClick'),
        shopperName: nameOnCard,
        ...installments,
        ...defaultDetails,
    }
    const appName = 'adyen-oracle-commerce-cloud'
    const applicationInfo = { name: appName, version: pkgJson.occVersion }
    const details = getDetails(type, scheme, defaultDetails)

    return {
        amount: { value: amount, currency: currencyCode },
        additionalData: getAdditionalData({ additionalData, riskData }),
        ...(countryCode && { countryCode }),
        merchantAccount,
        applicationInfo: {
            externalPlatform: {
                name: 'Oracle Commerce Cloud',
                version: pkgJson.version,
            },
            adyenPaymentSource: applicationInfo,
            merchantApplication: applicationInfo,
        },
        browserInfo,
        reference: transactionId,
        selectedBrand,
        shopperEmail: profile.email,
        shopperReference: profile.id,
        deliveryAddress: getAddress(shippingAddress),
        billingAddress: getAddress(billingAddress),
        threeDS2RequestData: {
            deviceChannel: 'browser',
        },
        channel: 'Web',
        origin: host[channel],
        accountInfo: JSON.parse(accountInfo),
        ...details,
    }
}

const getDetails = (type, scheme, defaultDetails) => (type === 'scheme' ? scheme : defaultDetails)

const getInstallments = (numberOfInstallments) =>
    numberOfInstallments && { installments: { value: numberOfInstallments } }
