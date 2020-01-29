import ccConstants from 'ccConstants'
import { store } from '../components'
import * as constants from '../constants'
import { eventEmitter } from './index'

export const getDefaultConfig = () => {
    const environment = store.get(constants.environment)
    const locale = store.get(constants.locale)
    const originKey = store.get(constants.originKey)
    const paymentMethodsResponse = store.get(constants.paymentMethodsResponse)

    return {
        showPayButton: true,
        locale,
        environment: environment.toLowerCase(),
        originKey,
        paymentMethodsResponse,
    }
}

export const createFromAction = ({ action }) => {
    const cardComponent = document.querySelector('adyen-payment-method-card')
    const checkout = document.querySelector('adyen-checkout')
    checkout.addEventListener('adyenAdditionalDetails', ({ detail }) => {
        const { details, paymentData } = detail.state.data
        const order = store.get(constants.order)
        const payment = { type: 'generic', customProperties: { paymentData, orderId: order().id(), ...details } }
        order().payments([payment])
        order().handlePlaceOrder()
    })
    cardComponent.createFromAction(action)
}

class Checkout {
    constructor(type) {
        this.type = type
        this.checkout = undefined
    }

    getCheckout = configuration => {
        // eslint-disable-next-line no-undef
        this.checkout = this.checkout || new AdyenCheckout({ ...getDefaultConfig(), ...configuration })
        return this.checkout
    }

    createCheckout = ({ configuration, selector, type, options = {} }, cb) => {
        const checkout = this.getCheckout(configuration)
        checkout.create(type, options).mount(selector)

        cb && cb(checkout)
    }

    _onSubmit = onChange => ev => {
        onChange && onChange(ev)
        const loader = document.querySelector(`.loader-wrapper`)
        loader && loader.classList.toggle('hide', false)

        const order = store.get(constants.order)
        eventEmitter.payment.emit(constants.setPayment, this.type)

        order().op(ccConstants.ORDER_OP_INITIATE)
        order().handlePlaceOrder()
    }

    createOnSubmit = onChange => this._onSubmit(onChange)

    _onChange = options => ({ detail: { state, component } }) => {
        const paymentDetails = store.get(constants.paymentDetails)
        const isValid = component.isValid && typeof state.data === 'object'
        eventEmitter.store.emit(constants.isValid, isValid)

        const payload = { ...paymentDetails, [this.type]: { ...state.data, ...options } }

        eventEmitter.store.emit(constants.paymentDetails, payload)
    }

    createOnChange = options => this._onChange(options)
}

export default Checkout
