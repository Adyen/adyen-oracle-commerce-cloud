import nock from 'nock'
import Widget from '../../../../__mocks__/widget'
import paymentMethodsResponseMock from '../../../../__mocks__/paymentMethods'
import originKeysResponseMock from '../../../../__mocks__/originKeys'
import * as constants from '../constants'
import viewModel from '../adyen-checkout'
import { store, Component } from '../components'
import { eventEmitter } from '../utils'

jest.mock('../components/boleto', () => {
    require.requireActual('../components/store').default
    return {
        __esModule: true,
        default: jest.fn(),
        setBoletoConfig: jest.fn(),
    }
})

jest.mock('../components/card')

describe('Component', () => {
    let widget
    beforeEach(() => {
        delete global.window.location
        global.window = Object.create(window)
        global.window.location = {
            hostname: 'localhost',
            protocol: 'http',
            port: '80',
        }
        widget = new Widget()
    })

    it('should fetch origin key, payment methods and adyen checkout script', async done => {
        const scope = nock('http://localhost/ccstorex/custom/adyen/v1')
            .get('/originKeys')
            .reply(200, originKeysResponseMock)
            .post('/paymentMethods')
            .reply(200, paymentMethodsResponseMock)

        widget.setLocale('pt_BR')
        widget.setCurrencyCode('BRL')
        viewModel.onLoad(widget)

        const component = new Component()
        component.importAdyenCheckout = jest.fn(paymentMethodsResponse => {
            const paymentMethods = store.get(constants.paymentMethodsResponse)
            expect(paymentMethodsResponse).toEqual(paymentMethods)
            expect(scope.isDone()).toBeTruthy()
            done()
        })

        component.render()
    })

    it('should have comboCard options when card is debit', () => {
        viewModel.onLoad(widget)
        const component = new Component()

        eventEmitter.store.emit(
            constants.selectedComboCard,
            constants.comboCards.debit
        )
        eventEmitter.store.emit(constants.selectedBrand, 'maestro')

        component.getComboCardOptions()
        const comboCardOptions = store.get(constants.comboCardOptions)
        const additionalData = { overwriteBrand: true }
        const expected = { selectedBrand: 'maestro', additionalData }
        expect(comboCardOptions).toEqual(expected)
    })

    it('should have electron as brand when card is Visa', () => {
        viewModel.onLoad(widget)
        const component = new Component()

        eventEmitter.store.emit(
            constants.selectedComboCard,
            constants.comboCards.debit
        )
        eventEmitter.store.emit(constants.selectedBrand, 'visa')

        component.getComboCardOptions()
        const comboCardOptions = store.get(constants.comboCardOptions)
        const additionalData = { overwriteBrand: true }
        const expected = { selectedBrand: 'electron', additionalData }
        expect(comboCardOptions).toEqual(expected)
    })

    it('should not have comboCard options when card is debit', () => {
        viewModel.onLoad(widget)
        const component = new Component()

        eventEmitter.store.emit(
            constants.selectedComboCard,
            constants.comboCards.credit
        )
        eventEmitter.store.emit(constants.selectedBrand, 'maestro')

        component.getComboCardOptions()
        const comboCardOptions = store.get(constants.comboCardOptions)
        expect(comboCardOptions).toEqual({})
    })
})
