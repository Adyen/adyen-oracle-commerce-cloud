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

export const createFromAction = ({ action, selector, checkoutComponent }) => {
    checkoutComponent.createFromAction(action).mount(selector)
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

    _onSubmit = onChange => ({ detail: { state, component } }) => {
        onChange && onChange(state, component)
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
