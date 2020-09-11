import { CheckoutUtility } from '@adyen/api-library'

function getCheckoutUtility(req) {
    const { client } = req.app.locals
    const checkout = new CheckoutUtility(client)

    return checkout
}

export default getCheckoutUtility
