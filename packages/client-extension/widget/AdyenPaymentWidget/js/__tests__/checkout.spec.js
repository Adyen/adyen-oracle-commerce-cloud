jest.mock('../components/static/bundle')

import { createStoredCards } from '../components'
import * as constants from '../constants'
import ccConstants from '../../../../__mocks__/ccConstants'
import { createFromAction} from '../utils/checkout'
import { eventEmitter } from '../utils'

describe('Checkout', () => {
    
    let widget
    let Checkout;
    let viewModel;
    let store;
    beforeEach(() => {
        jest.clearAllMocks();

        Checkout = require("../utils/checkout").default
        const Widget = require('../../../../__mocks__/widget').default
        widget = new Widget()
        viewModel = require('../adyen-checkout').default
        store = require('../components').store
    })

    afterEach(() => {
        jest.resetModules()
    })
    
    it('should handle on submit', function() {
        viewModel.onLoad(widget)

        eventEmitter.store.emit(constants.paymentDetails, { scheme: {} })
        const checkout = new Checkout(constants.paymentMethodTypes.scheme)
        const createOnSubmit = checkout.onSubmit()
        createOnSubmit()

        const order = store.get(constants.order)
        expect(order().op()).toEqual(ccConstants.ORDER_OP_INITIATE)
        expect(order().handlePlaceOrder).toHaveBeenCalled()
    })

    it('should return default config', function() {
        const { getDefaultConfig } = require('../utils/checkout')
        viewModel.onLoad(widget)
        const result = getDefaultConfig()
        expect(result).toMatchSnapshot()
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
        viewModel.onLoad(widget)

        const configuration = { data: 'mocked_extra_config' }
        const cb = jest.fn()
        const mount = jest.fn()
        const create = jest.fn(() => ({ mount }))
        global.AdyenCheckout = jest.fn(() => ({ create }))
        const checkout = new Checkout(constants.paymentMethodTypes.scheme)
        const selector = '#id'
        const type = 'boleto'
        checkout.createCheckout({ configuration, type, selector }, cb)

        expect(create).toHaveBeenCalledWith(type, configuration)
        expect(mount).toHaveBeenCalledWith(selector)
        expect(global.AdyenCheckout.mock.calls).toMatchSnapshot()
        expect(cb).toHaveBeenCalled()
    })

    it('should create stored payments checkout', function() {
        viewModel.onLoad(widget)
        
        eventEmitter.store.emit(constants.environment, 'TEST');

        const mount = jest.fn()
        const create = jest.fn(() => ({ mount }))
        const paymentMethod = { id: 1 }
        global.AdyenCheckout = jest.fn(() => ({ create, paymentMethodsResponse: { storedPaymentMethods: [ paymentMethod ] }}))

        createStoredCards()

        expect(create).toHaveBeenCalledWith(constants.card, paymentMethod)
        expect(mount).toHaveBeenCalledWith(`#adyen-stored_${paymentMethod.id}-payment`)
        expect(global.AdyenCheckout.mock.calls).toMatchSnapshot()
    })

    it('should handle on change', function() {
        viewModel.onLoad(widget)

        eventEmitter.store.emit(constants.paymentDetails, {})
        const checkout = new Checkout(constants.paymentMethodTypes.scheme)
        const createOnSubmit = checkout.onChange()
        const data = { foo: 'bar' }
        createOnSubmit({ data }, { isValid: true })

        const paymentDetails = store.get(constants.paymentDetails)
        const isValid = store.get(constants.isValid)
        const expected = { [constants.paymentMethodTypes.scheme]: data }

        expect(isValid).toBeTruthy()
        expect(paymentDetails).toEqual(expected)
    })
})
