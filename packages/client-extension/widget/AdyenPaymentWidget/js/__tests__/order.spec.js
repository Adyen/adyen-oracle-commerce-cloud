jest.mock('../components/static/bundle')

import nock from 'nock'
import Widget from '../../../../__mocks__/widget'
import pubsub from '../../../../__mocks__/pubsub'
import * as ccConstants from '../../../../__mocks__/ccConstants'
import viewModel from '../adyen-checkout'
import { Order } from '../components'
import { eventEmitter } from '../utils'

jest.mock('../utils/checkout', () => ({
    createFromAction: jest.fn(),
    default: jest.fn(),
}))
jest.mock('../utils/createError', () => ({
    __esModule: true,
    default: jest.fn(() => jest.fn()),
}))
import { createFromAction } from '../utils'
import * as constants from '../constants'

describe('Order', () => {
    let widget
    let order
    beforeEach(() => {
        jest.clearAllMocks()
        widget = new Widget()
        order = new Order()
    })

    it('should fail to create order', async done => {
        viewModel.onLoad(widget)

        const scope = nock('http://localhost')
            .post('/order')
            .reply(400, 'Failed to create order')

        const data = '{ "foo": "bar" }'
        const resultCode = 'Authorised'
        const customPayments = [
            { customPaymentProperties: { data, resultCode } },
        ]
        const mockedOrderEvent = { order: { payments: customPayments } }
        order.initialOrderCreated(mockedOrderEvent)

        eventEmitter.on(pubsub.topicNames.ORDER_SUBMISSION_FAIL, () => {
            expect(scope.isDone()).toBeTruthy()
            done()
        })
    })

    it('should fail to authorize payment', async done => {
        viewModel.onLoad(widget)

        const paymentState = 'NOT_AUTHORIZED'
        const payments = [{ paymentState }]
        const scope = nock('http://localhost')
            .post('/order')
            .once()
            .reply(200, { payments, id: 'mocked_id', uuid: 'mocked_uuid' })

        const data = '{ "foo": "bar" }'
        const resultCode = 'Refused'
        const customPayments = [
            { customPaymentProperties: { data, resultCode } },
        ]
        const mockedOrderEvent = { order: { payments: customPayments } }
        order.initialOrderCreated(mockedOrderEvent)


        eventEmitter.on(pubsub.topicNames.ORDER_SUBMISSION_FAIL, () => {
            expect(scope.isDone()).toBeTruthy()
            done()
        })
    })

    it('should redirect on initial order has paymentData', () => {
        const checkoutComponent = 'checkoutCard'
        order.createOrder = jest.fn()
        viewModel.onLoad(widget)

        eventEmitter.store.emit(constants.checkout.card, checkoutComponent)
        const data = '{ "paymentData": "mocked_payment_data" }'
        const resultCode = 'ChallengeShopper'
        const customPaymentProperties = { data, resultCode }
        const customPayments = [{ customPaymentProperties }]
        const mockedOrderEvent = { order: { payments: customPayments } }
        order.initialOrderCreated(mockedOrderEvent)

        const action = { paymentData: 'mocked_payment_data' }
        const payload = {
            action,
            checkoutComponent,
            selector: '#adyen-card-payment',
        }
        expect(createFromAction).toHaveBeenNthCalledWith(1, payload)
        expect(order.createOrder).toHaveBeenCalledTimes(0)
    })

    it('should create order', async done => {
        const spy = jest.spyOn(order, 'createOrder')
        viewModel.onLoad(widget)

        const paymentState = ccConstants.PAYMENT_GROUP_STATE_AUTHORIZED
        const payments = [{ paymentState }]
        const scope = nock('http://localhost')
            .post('/order')
            .twice()
            .reply(200, { payments, id: 'mocked_id', uuid: 'mocked_uuid' })

        const data = '{ "foo": "bar" }'
        const resultCode = 'Authorised'
        const customPayments = [
            { customPaymentProperties: { data, resultCode } },
        ]
        const mockedOrderEvent = { order: { payments: customPayments } }
        order.initialOrderCreated(mockedOrderEvent)
        expect(createFromAction).toHaveBeenCalledTimes(0)

        expect(spy).toHaveBeenCalled()

        eventEmitter.on(pubsub.topicNames.ORDER_SUBMISSION_SUCCESS, () => {
            expect(scope.isDone()).toBeTruthy()
            done()
        })
    })

    it('should correctly parse url parameters', () => {
        viewModel.onLoad(widget)
        const params = 'id=random_id&uuid=random_uuid'
        const result = order.getResult(params)
        expect(result).toMatchObject({ id: 'random_id', uuid: 'random_uuid' })
    })

    it('should create order after redirect', () => {
        const spy = jest.spyOn(order, 'createOrder')
        viewModel.onLoad(widget)
        const parameters = 'PaRes="mocked_pares"&MD="mocked_md"'
        order.getUrlParametersAndCreateOrder({ parameters })

        const payments = [
            {
                customProperties: {
                    MD: '"mocked_md"',
                    PaRes: '"mocked_pares"',
                    paymentData: '{ "AdyenPaymentData": "mocked_value" }',
                },
                type: 'generic',
            },
        ]
        const redirectOrderPayload = { AdyenOrder: 'mocked_value', payments }
        expect(spy).toHaveBeenNthCalledWith(1, redirectOrderPayload)
    })
})
