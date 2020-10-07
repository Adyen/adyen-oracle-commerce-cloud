import storageApi from 'storageApi'
import * as constants from '../constants'
import { store } from '../components'
import { createFromAction } from './index'
import { createModal } from './modal'

export default ({ order, customPaymentProperties }, cb) => {
    const checkoutCard = store.get(constants.checkout.card)

    createModal()
    const executeAction = createAction(customPaymentProperties, checkoutCard, order)

    customPaymentProperties.action ? executeAction(customPaymentProperties.action, cb) : cb(order)
}

function createAction(customPaymentProperties, checkoutComponent, order) {
    return (action, cb) => {
        const options = {
            action,
            selector: '#present-shopper',
            checkoutComponent,
        }

        const instance = storageApi.getInstance()
        if (Array.isArray(customPaymentProperties.details)) {
            instance.setItem(constants.storage.details, JSON.stringify(customPaymentProperties.details))
        }
        instance.setItem(constants.storage.paymentData, customPaymentProperties.action.paymentData)
        instance.setItem(constants.storage.order, JSON.stringify(order))

        createFromAction(options)

        if (customPaymentProperties.resultCode === 'PresentToShopper') {
            cb(order)
        }
    }
}
