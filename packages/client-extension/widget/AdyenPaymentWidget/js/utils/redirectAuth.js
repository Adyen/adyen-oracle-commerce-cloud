import storageApi from 'storageApi'
import * as constants from '../constants'
import { store } from '../components'
import { createFromAction } from './index'
import { createModal } from './modal'

export default ({ order, customPaymentProperties }, cb) => {
    const checkoutCard = store.get(constants.checkout.card)

    createModal()
    const redirect = createRedirect(customPaymentProperties, checkoutCard, order)

    customPaymentProperties.action ? redirect(customPaymentProperties.action) : cb(order)
}

function createRedirect(customPaymentProperties, checkoutComponent, order) {
    return (action) => {
        const options = {
            action,
            selector: '#present-shopper',
            checkoutComponent,
        }

        const instance = storageApi.getInstance()
        instance.setItem(constants.storage.paymentData, customPaymentProperties.action.paymentData)
        instance.setItem(constants.storage.order, JSON.stringify(order))

        createFromAction(options)
    }
}
