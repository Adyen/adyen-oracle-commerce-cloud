import AdyenApiLibrary from '@adyen/api-library'
const { CheckoutAPI } = AdyenApiLibrary

function getCheckout(req) {
    const { client } = req.app.locals
    const checkout = new CheckoutAPI(client)

    return checkout
}

export function getExternalProperties(properties) {
    const additionalProperties = Object.entries(properties).reduce(
        (acc, [key, value]) => ({
            ...acc,
            [key]: JSON.stringify(value),
        }),
        {}
    )
    const externalProperties = Object.keys(properties)

    return {
        additionalProperties,
        externalProperties,
    }
}

export default getCheckout
