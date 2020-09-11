import storageApi from 'storageApi'
import * as constants from '../constants'
import { store } from '../components'
import { createFromAction } from './index'

export default ({ order, customPaymentProperties }, cb) => {
    const checkoutCard = store.get(constants.checkout.card)
    const isAuthRedirect = 'paymentData' in customPaymentProperties.additionalData
    const redirect = () => {
        const action = {
            action: customPaymentProperties.additionalData,
            selector: '#adyen-card-payment',
            checkoutComponent: checkoutCard,
        }

        const instance = storageApi.getInstance()
        instance.setItem(constants.storage.paymentData, customPaymentProperties.additionalData.paymentData)
        instance.setItem(constants.storage.order, JSON.stringify(order))

        createFromAction(action)
    }

    isAuthRedirect ? redirect() : cb(order)
}
