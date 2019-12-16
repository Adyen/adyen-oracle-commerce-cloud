import Widget from '../../../../__mocks__/widget'
import paymentMethodsResponseMock from '../../../../__mocks__/paymentMethods'
import viewModel from '../adyen-checkout'

jest.mock('../utils/checkout')
import { presentToShopper } from '../components/boleto'
import { Checkout, createFromAction } from '../utils'
import { createBoletoCheckout } from '../components'
import * as constants from '../constants'
import generateTemplate from '../utils/tests/koTemplate'

describe('Boleto', () => {
    let widget
    beforeEach(() => {
        widget = new Widget()
    })

    it('should present to shopper', function() {
        const action = { data: 'mocked_custom_property' }
        const options = { action, selector: '#present-shopper' }

        viewModel.onLoad(widget)
        presentToShopper(action)

        expect(createFromAction).toHaveBeenCalledWith(options)
    })

    it('should create boleto checkout', function() {
        Checkout.prototype.createCheckout = jest.fn()
        Checkout.prototype.onChange = jest.fn()
        Checkout.prototype.onSubmit = jest.fn()

        createBoletoCheckout(paymentMethodsResponseMock)
        expect(Checkout.prototype.createCheckout).toHaveBeenCalled()
    })

    it('should display boleto component', function() {
        const { countries, paymentMethodTypes } = constants
        const { brazil } = countries
        widget.setCurrencyCode(brazil.currency)
        widget.setLocale(brazil.locale)
        widget.setGatewaySettings('paymentMethodTypes', [
            paymentMethodTypes.boleto,
        ])

        const template = generateTemplate(widget)
        expect(template).toMatchSnapshot()
    })
})
