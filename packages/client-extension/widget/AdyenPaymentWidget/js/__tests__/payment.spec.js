jest.mock('../components/static/bundle')

import Widget from '../../../../__mocks__/widget'
import viewModel from '../adyen-checkout'
import { Payment, store } from '../components'
import { eventEmitter } from '../utils'
import * as constants from '../constants'

const mockedPaymentDetails = { scheme: { paymentMethod: { type: 'scheme' } } }
const getPaymentResponse = (type, id) => [
    {
        customProperties: {
            numberOfInstallments: 3,
            paymentDetails: mockedPaymentDetails[type],
            storedPayment: undefined,
        },
        id,
        type: 'generic',
    },
]
describe('Payment', () => {
    let widget
    beforeEach(() => {
        widget = new Widget()
    })

    it('should create a payment', function () {
        viewModel.onLoad(widget)

        const payment = new Payment()
        const id = store.get(constants.id)
        const paymentMethodType = constants.paymentMethodTypes.scheme
        const paymentResponse = getPaymentResponse(paymentMethodType, id())

        eventEmitter.store.emit(constants.selectedInstallment, { numberOfInstallments: 3 })
        eventEmitter.store.emit(constants.genericPayment, paymentResponse[0])
        eventEmitter.store.emit(constants.paymentDetails, mockedPaymentDetails)
        payment.setPayment(constants.paymentMethodTypes.scheme)

        const order = store.get(constants.order)
        expect(order().payments()).toMatchSnapshot();
    })

    it('should have different payment method type on combo card', function () {
        viewModel.onLoad(widget)

        const payment = new Payment()
        const id = store.get(constants.id)
        const paymentMethodType = constants.paymentMethodTypes.scheme
        const paymentResponse = getPaymentResponse(paymentMethodType, id())
        const bin = constants.bins.electron

        eventEmitter.store.emit(constants.genericPayment, paymentResponse[0])
        eventEmitter.store.emit(constants.selectedComboCard, constants.comboCards.debit)
        eventEmitter.store.emit(constants.selectedBrand, bin)
        eventEmitter.store.emit(constants.paymentDetails, mockedPaymentDetails)
        payment.setPayment(constants.paymentMethodTypes.scheme)

        const order = store.get(constants.order)
        expect(order().payments()).toMatchSnapshot();
    })
})
