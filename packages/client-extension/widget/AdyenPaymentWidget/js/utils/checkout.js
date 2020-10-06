import ccConstants from 'ccConstants'
import AdyenCheckout from '@adyen/adyen-web'
import '@adyen/adyen-web/dist/adyen.css'
import { store } from '../components'
import * as constants from '../constants'
import { eventEmitter } from './index'
import { hideModal, showModal } from './modal'

export const getDefaultConfig = (type, additionalOptions) => {
    const cart = store.get(constants.cart)
    const { amount, currencyCode } = cart()
    const environment = store.get(constants.environment)
    const countryCode = store.get(constants.countryCode)
    const clientKey = store.get(constants.clientKey)
    const paymentMethodsResponse = store.get(constants.paymentMethodsResponse)

    return {
        amount: {
            value: amount() * 100,
            currency: currencyCode(),
        },
        countryCode,
        showPayButton: true,
        environment: environment.toLowerCase(),
        clientKey,
        paymentMethodsResponse,
        ...additionalOptions,
    }
}

export const createFromAction = ({ action, selector, checkoutComponent }) => {
    action.type === 'threeDS2Challenge' ? showModal() : hideModal()
    checkoutComponent.createFromAction(action).mount(selector)
}

class Checkout {
    constructor(type) {
        this.type = type
    }

    getCheckout = () => {
        const checkout = store.get(constants.checkoutComponent)
        if (checkout) {
            return checkout
        }

        const defaultConfig = getDefaultConfig(this.type, { onAdditionalDetails: this.onAdditionalDetails })
        const newCheckout = new AdyenCheckout(defaultConfig)
        eventEmitter.store.emit(constants.checkoutComponent, newCheckout)
        return newCheckout
    }

    createCheckout = ({ configuration, selector, type, options = {} }, cb) => {
        const checkout = this.getCheckout()
        try {
            checkout.create(type, { ...options, ...configuration }).mount(selector)
            cb && cb(checkout)
        } catch (e) {
            console.warn(`Payment method not supported: ${type}`)
        }
    }

    onAdditionalDetails = (state /*, component */) => {
        eventEmitter.store.emit(constants.additionalDetails, state.data)
        this.initiateOrder()
    }

    onSubmit = (onChange) => (state, component) => {
        onChange && onChange(state, component)
        this.initiateOrder()
    }

    onChange = (options) => (state, component) => {
        this.setPaymentDetails(component, state, options)
    }

    setPaymentDetails(component, state, options = {}) {
        const paymentDetails = store.get(constants.paymentDetails)
        const isValid = component.isValid && typeof state.data === 'object'
        eventEmitter.store.emit(constants.isValid, isValid)

        const payload = { ...paymentDetails, [this.type]: { ...state.data, ...options } }
        eventEmitter.store.emit(constants.paymentDetails, payload)
    }

    initiateOrder() {
        const loader = document.querySelector(`.loader-wrapper`)
        loader && loader.classList.toggle('hide', false)

        const order = store.get(constants.order)
        eventEmitter.payment.emit(constants.setPayment, this.type)

        order().op(ccConstants.ORDER_OP_INITIATE)
        order().handlePlaceOrder()
    }
}

export default Checkout
