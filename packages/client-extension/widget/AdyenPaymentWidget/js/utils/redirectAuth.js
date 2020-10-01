import storageApi from 'storageApi'
import * as constants from '../constants'
import { store } from '../components'
import { createFromAction } from './index'
import { createModal } from './modal'

export default ({ order, customPaymentProperties }, cb) => {
    const checkoutCard = store.get(constants.checkout.card)
    const action = getAction(customPaymentProperties)

    createModal()
    const redirect = createRedirect(customPaymentProperties, checkoutCard, order)

    action ? redirect(action) : cb(order)
}

function getAction({ additionalData, action }) {
    const hasPaymentData = additionalData && 'paymentData' in additionalData
    return hasPaymentData ? additionalData : action
}

function createRedirect(customPaymentProperties, checkoutComponent, order) {
    return (action) => {
        const options = {
            action,
            selector: '#present-shopper',
            checkoutComponent,
        }

        const instance = storageApi.getInstance()

        if (customPaymentProperties.additionalData) {
            instance.setItem(constants.storage.paymentData, customPaymentProperties.additionalData.paymentData)
            instance.setItem(constants.storage.order, JSON.stringify(order))
        }

        createFromAction(options)
    }
}
