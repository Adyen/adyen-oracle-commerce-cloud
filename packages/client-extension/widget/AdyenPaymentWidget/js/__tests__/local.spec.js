import Widget from '../../../../__mocks__/widget'
import paymentMethodsResponseMock from '../../../../__mocks__/paymentMethods'
import { createLocalPaymentCheckout } from '../components'
import store from '../components/store'

jest.mock('../utils/checkout')
import { Checkout, eventEmitter } from '../utils'
import generateTemplate, { mockTemplate } from '../utils/tests/koTemplate'
import { isLocalPaymentMethod, submitPayByLink } from '../components/local'
import * as constants from '../constants'

describe('Local', () => {
    let widget
    let tmplWidget
    let template

    beforeEach(() => {
        jest.clearAllMocks()
        tmplWidget = mockTemplate('Tmpl_Widget')
        widget = new Widget()
        template = generateTemplate(widget)

        Checkout.prototype.createCheckout = jest.fn()
        Checkout.prototype.onChange = jest.fn()
        Checkout.prototype.onSubmit = jest.fn()
    })

    it('should create local checkout component', function() {
        createLocalPaymentCheckout(paymentMethodsResponseMock)
        expect(Checkout.prototype.createCheckout).toHaveBeenCalled()
    })

    it('should have 5 items', function() {
        createLocalPaymentCheckout(paymentMethodsResponseMock)
        expect(Checkout.prototype.createCheckout.mock.calls).toHaveLength(16)
    })

    it('should have correct options', function() {
        createLocalPaymentCheckout(paymentMethodsResponseMock)
        const { type, selector } = Checkout.prototype.createCheckout.mock.calls[0][0]
        const expectedType = 'directEbanking'
        expect(type).toEqual(expectedType)
        expect(selector).toEqual(`#adyen-${expectedType}-payment`)

        const el = document.querySelector(`#adyen-${expectedType}-payment`)
        expect(el).not.toBeUndefined()
    })

    it('should have correct callback', function() {
        createLocalPaymentCheckout(paymentMethodsResponseMock)
        const cb = Checkout.prototype.createCheckout.mock.calls[0][1]
        expect('directEbanking' in cb()).toBeTruthy()
    })

    it('should render', function() {
        createLocalPaymentCheckout(paymentMethodsResponseMock)
        expect(template).toMatchSnapshot()
    })

    it('should create details', function() {
        const [localPaymentMethod] = paymentMethodsResponseMock.paymentMethods.filter(isLocalPaymentMethod)
        submitPayByLink(localPaymentMethod)
        const { type, name, supportsRecurring } = localPaymentMethod
        const paymentDetails = store.get(constants.paymentDetails)
        const { shippingAddress } = store.get(constants.order)()
        const countryCode = shippingAddress().selectedCountry()
        const paymentMethod = { countryCode, name, supportsRecurring, type }
        const expected = { [type]: { paymentMethod } }
        expect(paymentDetails).toEqual(expected)
    })
})
