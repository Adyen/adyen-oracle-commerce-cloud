jest.mock('../components/static/bundle')

import Widget from '../../../../__mocks__/widget'
import notifier from '../../../../__mocks__/notifier'
import viewModel from '../adyen-checkout'
import * as constants from '../constants'
import { eventEmitter } from '../utils'
import { store } from '../components'

const installmentsOptionsId = 'installmentsOptionsId'
const paymentMethodTypes = 'paymentMethodTypes'
const storedPaymentType = 'storedPayment'

describe('View Model', () => {
    let widget
    beforeEach(() => {
        jest.clearAllMocks()
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
            widget.setLocale(locale)
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
        widget.setLocale('pt_BR')
        widget.setCurrencyCode('BRL')
        viewModel.onLoad(widget)
        expect(store.get(constants.brazilEnabled)).toBeTruthy()
    })

    it('should have JSON installment options', () => {
        widget.setLocale('pt_BR')
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
        widget.setLocale('pt_BR')
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

    it('should have boleto with delivery date and shopper statement', () => {
        const { boleto } = constants.paymentMethodTypes
        const boletoDeliveryDate = '1574064504643'
        const boletoShopperStatement = 'Mocked shopper statement'
        widget.setGatewaySettings(paymentMethodTypes, [boleto])
        widget.setGatewaySettings('boletoDeliveryDate', boletoDeliveryDate)
        widget.setGatewaySettings(
            'boletoShopperStatement',
            boletoShopperStatement
        )
        viewModel.onLoad(widget)

        const deliveryDate = store.get(constants.boletoOptions.deliveryDate)
        expect(deliveryDate).toEqual(Number(boletoDeliveryDate))

        const shopperStatement = store.get(constants.boletoOptions.shopperStatement)
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
