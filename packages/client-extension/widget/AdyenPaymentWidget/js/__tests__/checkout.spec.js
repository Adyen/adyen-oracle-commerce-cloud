import { createStoredCards, store } from '../components'
import * as constants from '../constants'
import Widget from '../../../../__mocks__/widget'
import ccConstants from '../../../../__mocks__/ccConstants'
import viewModel from '../adyen-checkout'
import Checkout, { createFromAction, getDefaultConfig } from '../utils/checkout'
import { eventEmitter } from '../utils'

const defaultConfig = {
    environment: 'test',
    locale: 'en_US',
    originKey: '',
    paymentMethodsResponse: undefined,
    showPayButton: true,
}

describe('Checkout', () => {
    let widget
    beforeEach(() => {
        widget = new Widget()
    })

    it('should return default config', function() {
        viewModel.onLoad(widget)
        const result = getDefaultConfig()
        expect(result).toEqual(defaultConfig)
    })

    it('should create from action', function() {
        viewModel.onLoad(widget)
        const mount = jest.fn()
        const addEventListener = jest.fn()
        const createFromAction = jest.fn()
        const action = { action: 'mocked_action' }
        document.querySelector = jest.fn(() => ({ addEventListener, createFromAction }))
        createFromAction(action)
        expect(createFromAction).toHaveBeenCalledWith(action)
    })

    it('should create checkout', function() {
        const defaultConfig = getDefaultConfig()
        const configuration = { data: 'mocked_extra_config' }
        const cb = jest.fn()
        const mount = jest.fn()
        const create = jest.fn(() => ({ mount }))
        global.AdyenCheckout = jest.fn(() => ({ create }))
        const checkout = new Checkout(constants.paymentMethodTypes.scheme)
        const selector = '#id'
        const type = 'boleto'
        checkout.createCheckout({ configuration, type, selector }, cb)

        expect(create).toHaveBeenCalledWith(type, {})
        expect(mount).toHaveBeenCalledWith(selector)
        expect(global.AdyenCheckout).toHaveBeenCalledWith({
            ...defaultConfig,
            ...configuration,
        })
        expect(cb).toHaveBeenCalled()
    })

    it('should create stored payments checkout', function() {
        eventEmitter.store.emit(constants.environment, 'TEST');

        const mount = jest.fn()
        const create = jest.fn(() => ({ mount }))
        const paymentMethod = { id: 1 }
        global.AdyenCheckout = jest.fn(() => ({ create, paymentMethodsResponse: { storedPaymentMethods: [ paymentMethod ] }}))
        createStoredCards()

        expect(create).toHaveBeenCalledWith(constants.card, paymentMethod)
        expect(mount).toHaveBeenCalledWith(`#adyen-stored_${paymentMethod.id}-payment`)
        expect(global.AdyenCheckout).toHaveBeenCalled()
    })

    it('should handle on submit', function() {
        eventEmitter.store.emit(constants.paymentDetails, { scheme: {} })
        const checkout = new Checkout(constants.paymentMethodTypes.scheme)
        const onSubmit = checkout.createOnSubmit()
        const toggle = jest.fn()
        document.querySelector = jest.fn(() => ({ classList: { toggle }}))
        onSubmit()

        const order = store.get(constants.order)
        expect(order().op()).toEqual(ccConstants.ORDER_OP_INITIATE)
        expect(order().handlePlaceOrder).toHaveBeenCalled()
    })

    it('should handle on change', function() {
        eventEmitter.store.emit(constants.paymentDetails, {})
        const checkout = new Checkout(constants.paymentMethodTypes.scheme)
        const createOnSubmit = checkout._onChange()
        const data = { foo: 'bar' }
        createOnSubmit({ detail: { state: { data }, component: { isValid: true }} })

        const paymentDetails = store.get(constants.paymentDetails)
        const isValid = store.get(constants.isValid)
        const expected = { [constants.paymentMethodTypes.scheme]: data }

        expect(isValid).toBeTruthy()
        expect(paymentDetails).toEqual(expected)
    })
})
