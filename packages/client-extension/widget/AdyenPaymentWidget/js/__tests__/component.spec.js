import nock from 'nock'
import Widget from '../../../../__mocks__/widget'
import * as constants from '../constants'
import viewModel from '../adyen-checkout'
import { store, Component } from '../components'
import { eventEmitter } from '../utils'
import mocks from '../utils/tests/mocks'

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
        widget.locale = jest.fn(() => 'pt_BR')
        widget.cart = jest.fn(() => ({
            currencyCode: jest.fn(() => 'BRL'),
        }))
        viewModel.onLoad(widget)
        const component = new Component()

        const scope = nock('http://localhost/ccstorex/custom/adyen/v1')
            .get('/originKeys')
            .reply(200, mocks.originKeys)
            .get('/paymentMethods')
            .reply(200, mocks.paymentMethods)

        const getScriptCb = () => {
            const paymentMethods = store.get(constants.paymentMethodsResponse)
            expect(paymentMethods).toEqual(paymentMethods)
            expect(scope.isDone()).toBeTruthy()
            done()
        }

        nock('https://checkoutshopper-live.adyen.com')
            .get('/checkoutshopper/sdk/3.3.0/adyen.js')
            .reply(200, getScriptCb)

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
