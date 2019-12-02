import Widget from '../../../../__mocks__/widget'
import notifier from '../../../../__mocks__/notifier'
import viewModel from '../adyen-checkout'
import * as constants from '../constants'
import store from '../components/store'
import { eventEmitter } from '../utils'

const installmentsOptionsId = 'installmentsOptionsId'
const paymentMethodTypes = 'paymentMethodTypes'
const storedPaymentType = 'storedPayment'

describe('View Model', () => {
    let widget
    beforeEach(() => {
        widget = new Widget()
    })

    it('should not have enabled installments', () => {
        viewModel.onLoad(widget)
        const isCountryAllowedForInstallments = store.get(
            constants.isAllowedCountryForInstallments
        )
        expect(isCountryAllowedForInstallments).toBeFalsy()
    })
    test.each(['pt_BR', 'es_MX'])(
        'should have enabled installments for %s',
        locale => {
            widget.locale = jest.fn(() => locale)
            viewModel.onLoad(widget)
            eventEmitter.store.emit(constants.installments, [
                { numberOfInstallments: 3 },
            ])
            const installmentsIsEnabled = store.get(
                constants.installmentsEnabled
            )
            expect(installmentsIsEnabled()).toBeTruthy()
        }
    )

    it('should have Brazil enabled', () => {
        widget.locale = jest.fn(() => 'pt_BR')
        widget.cart = jest.fn(() => ({
            currencyCode: jest.fn(() => 'BRL'),
        }))
        viewModel.onLoad(widget)
        expect(store.get(constants.brazilEnabled)).toBeTruthy()
    })

    it('should have JSON installment options', () => {
        widget.locale = jest.fn(() => 'pt_BR')
        const installmentOptionsString = '[[1,3,31],[5,5,24]]'
        widget.setGatewaySettings(
            installmentsOptionsId,
            installmentOptionsString
        )
        viewModel.onLoad(widget)

        const parsedInstallmentOptions = JSON.parse(installmentOptionsString)
        const installmentsOptions = store.get(constants.installmentsOptions)
        expect(installmentsOptions).toEqual(parsedInstallmentOptions)
    })

    it('should send error notification if installments code is wrong', () => {
        widget.locale = jest.fn(() => 'pt_BR')
        const installmentOptionsString = 'invalid_json'
        widget.setGatewaySettings(
            installmentsOptionsId,
            installmentOptionsString
        )
        viewModel.onLoad(widget)

        expect(notifier.sendError).toHaveBeenCalledWith(
            'installments',
            'translated_installmentsConfiguration',
            true
        )
    })

    it('should have boleto enabled', () => {
        const { invoice } = constants.paymentMethodTypes
        widget.setGatewaySettings(paymentMethodTypes, [invoice])
        viewModel.onLoad(widget)

        expect(store.get(constants.boleto.enabled)).toEqual(true)
    })

    it('should have boleto with delivery date and shopper statement', () => {
        const { invoice } = constants.paymentMethodTypes
        const boletoDeliveryDate = '1574064504643'
        const boletoShopperStatement = 'Mocked shopper statement'
        widget.setGatewaySettings(paymentMethodTypes, [invoice])
        widget.setGatewaySettings('boletoDeliveryDate', boletoDeliveryDate)
        widget.setGatewaySettings(
            'boletoShopperStatement',
            boletoShopperStatement
        )
        viewModel.onLoad(widget)

        const deliveryDate = store.get(constants.boleto.deliveryDate)
        expect(deliveryDate).toEqual(Number(boletoDeliveryDate))

        const shopperStatement = store.get(constants.boleto.shopperStatement)
        expect(shopperStatement).toEqual(boletoShopperStatement)
    })

    it('should have stored payment type', () => {
        const type = 'oneClick'
        widget.setGatewaySettings(storedPaymentType, type)
        viewModel.onLoad(widget)
        const paymentMethodTypes = store.get(constants.storedPaymentType)
        expect(paymentMethodTypes()).toEqual(type)
    })
})
