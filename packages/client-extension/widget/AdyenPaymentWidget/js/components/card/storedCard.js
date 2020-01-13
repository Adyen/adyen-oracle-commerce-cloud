import { Checkout, eventEmitter } from '../../utils'
import * as constants from '../../constants'

const createStoredCards = () => {
    const checkout = new Checkout(constants.paymentMethodTypes.scheme)
    const onChange = checkout.onChange()
    const configuration = { onChange, onSubmit: checkout.onSubmit(onChange) }
    const checkoutComponent = checkout.getCheckout(configuration)

    eventEmitter.store.emit(
        constants.storedPaymentMethods,
        checkoutComponent.paymentMethodsResponse.storedPaymentMethods
    )

    checkoutComponent.paymentMethodsResponse.storedPaymentMethods.forEach(storedPaymentMethod => {
        const selector = `#adyen-stored_${storedPaymentMethod.id}-payment`
        checkoutComponent.create(constants.card, storedPaymentMethod).mount(selector)
    })
}

export default createStoredCards
