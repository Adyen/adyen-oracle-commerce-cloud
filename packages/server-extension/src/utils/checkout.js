import { CheckoutAPI } from '@adyen/api-library'

function getCheckout(req) {
    const { client } = req.app.locals
    const checkout = new CheckoutAPI(client)

    return checkout
}

export function getExternalProperties({ additionalData, resultCode }) {
    return {
        additionalProperties: {
            ...(additionalData && {
                data: JSON.stringify(additionalData),
            }),
            resultCode,
        },
        externalProperties: additionalData
            ? ['data', 'resultCode']
            : ['resultCode'],
    }
}

export default getCheckout
