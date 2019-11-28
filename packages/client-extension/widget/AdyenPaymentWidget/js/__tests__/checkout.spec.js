import { store } from '../components'
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
        const createFromActionMock = jest.fn(() => ({ mount }))
        const checkoutComponent = { createFromAction: createFromActionMock }
        const args = {
            action: 'mocked_action',
            selector: '#id',
            checkoutComponent,
        }
        createFromAction(args)
        expect(createFromActionMock).toHaveBeenCalledWith(args.action)
        expect(mount).toHaveBeenCalledWith(args.selector)
    })

    it('should create checkout', function() {
        const defaultConfig = getDefaultConfig()
        const configuration = { data: 'mocked_extra_config' }
        const cb = jest.fn()
        const mount = jest.fn()
        const create = jest.fn(() => ({ mount }))
        global.AdyenCheckout = jest.fn(() => ({ create }))
        const checkout = new Checkout(constants.paymentMethodTypes.generic)
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

    it('should handle on submit', function() {
        eventEmitter.store.emit(constants.paymentDetails, {})
        const checkout = new Checkout(constants.paymentMethodTypes.generic)
        const createOnSubmit = checkout.onSubmit()
        createOnSubmit()

        const order = store.get(constants.order)
        expect(order().id()).toEqual(null)
        expect(order().op()).toEqual(ccConstants.ORDER_OP_INITIATE)
        expect(order().handlePlaceOrder).toHaveBeenCalled()
    })

    it('should handle on change', function() {
        eventEmitter.store.emit(constants.paymentDetails, {})
        const checkout = new Checkout(constants.paymentMethodTypes.generic)
        const createOnSubmit = checkout.onChange()
        const data = { foo: 'bar' }
        createOnSubmit({ data }, { isValid: true })

        const paymentDetails = store.get(constants.paymentDetails)
        const isValid = store.get(constants.isValid)
        const expected = { [constants.paymentMethodTypes.generic]: data }

        expect(isValid).toBeTruthy()
        expect(paymentDetails).toEqual(expected)
    })
})
