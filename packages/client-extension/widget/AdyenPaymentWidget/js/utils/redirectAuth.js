import storageApi from 'storageApi'
import * as constants from '../constants'
import { store } from '../components'
import { createFromAction } from './index'

export default ({ order, customPaymentProperties }, cb) => {
    const checkoutCard = store.get(constants.checkout.card)
    const isAuthRedirect = 'paymentData' in customPaymentProperties
    const redirect = () => {
        const action = {
            action: customPaymentProperties,
            selector: '#adyen-card-payment',
            checkoutComponent: checkoutCard,
        }

        const instance = storageApi.getInstance()
        instance.setItem(constants.storage.paymentData, customPaymentProperties.paymentData)
        instance.setItem(constants.storage.order, JSON.stringify(order))

        createFromAction(action)
    }

    isAuthRedirect ? redirect() : cb(order)
}
