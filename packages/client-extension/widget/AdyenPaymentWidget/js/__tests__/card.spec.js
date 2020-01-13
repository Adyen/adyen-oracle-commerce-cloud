import * as constants from '../constants'
import Widget from '../../../../__mocks__/widget'
import viewModel from '../adyen-checkout'
import paymentMethodsResponseMock from '../../../../__mocks__/paymentMethods'

jest.mock('../utils/checkout')
jest.mock('../utils/getInstallmentOptions')
import { Checkout, eventEmitter, getInstallmentOptions } from '../utils'
import { createCardCheckout, createStoredCards, store } from '../components'
import { onBrand } from '../components/card'
import generateTemplate from '../utils/tests/koTemplate'

describe('Card', () => {
    let widget
    beforeEach(() => {
        widget = new Widget()
    })

    it('should create card checkout', function() {
        viewModel.onLoad(widget)

        Checkout.prototype.createCheckout = jest.fn()
        Checkout.prototype.onChange = jest.fn()
        Checkout.prototype.onSubmit = jest.fn()

        createCardCheckout(paymentMethodsResponseMock)
        expect(Checkout.prototype.createCheckout).toHaveBeenCalled()
    })

    it('should create stored cards checkout', function() {
        viewModel.onLoad(widget)

        Checkout.prototype.getCheckout = jest.fn(() => ({ paymentMethodsResponse: { storedPaymentMethods: [] }}))
        Checkout.prototype.onChange = jest.fn()
        Checkout.prototype.onSubmit = jest.fn()

        createStoredCards()
        expect(Checkout.prototype.getCheckout).toHaveBeenCalled()
    })

    it('should set brand', function() {
        const brand = 'visa'
        onBrand({ brand })
        const selectedBrand = store.get(constants.selectedBrand)
        const installments = store.get(constants.installments)

        expect(selectedBrand).toEqual(brand)
        expect(installments()).toEqual([])
    })

    it('should set brand with installments', function() {
        const brand = 'visa'
        eventEmitter.store.emit(constants.installmentsOptions, 'mocked_installments_options')
        onBrand({ brand })

        const expected = ['mocked_installments_options', '1000', 'visa']
        expect(getInstallmentOptions).toHaveBeenCalledWith(...expected)
    })

    it('should display installments', function() {
        const {
            countries: { mexico },
            paymentMethodTypes,
        } = constants
        widget.setLocale(mexico.locale)
        widget.setGatewaySettings('paymentMethodTypes', [paymentMethodTypes.boleto])

        const template = generateTemplate(widget, viewModel => {
            eventEmitter.store.emit(constants.installments, [{ numberOfInstallments: 3 }, { numberOfInstallments: 5 }])
            eventEmitter.store.emit(constants.isLoaded, true)
        })

        expect(template).toMatchSnapshot()
    })

    it('should display combo card', function() {
        const { countries, paymentMethodTypes } = constants
        const { brazil } = countries
        widget.setCurrencyCode(brazil.currency)
        widget.setLocale(brazil.locale)
        widget.setGatewaySettings('paymentMethodTypes', [paymentMethodTypes.scheme])

        const template = generateTemplate(widget, () => {
            eventEmitter.store.emit(constants.installments, [])
            eventEmitter.store.emit(constants.isLoaded, true)
        })
        expect(template).toMatchSnapshot()
    })

    it('should display stored cards', function() {
        const template = generateTemplate(widget, () => {
            const storedPaymentMethods = [{ brand:"visa", expiryMonth:"10", expiryYear:"2020", holderName:"Checkout Shopper PlaceHolder", id:"8415785841327892", lastFour:"1111", name:"VISA", supportedShopperInteractions:["Ecommerce","ContAuth"], type:"scheme"}]
            eventEmitter.store.emit(constants.storedPaymentMethods, storedPaymentMethods)
            eventEmitter.store.emit(constants.isLoaded, true)
        })
        expect(template).toMatchSnapshot()
    })
})
