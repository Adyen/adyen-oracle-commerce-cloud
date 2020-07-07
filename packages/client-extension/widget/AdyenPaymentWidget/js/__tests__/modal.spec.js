import { createPresentToShopperModal } from '../utils/modal'
import { eventEmitter } from '../utils'
import * as constants from '../constants'

describe('Modal', () => {
    it('should send node in the callback', function() {
        eventEmitter.store.emit(constants.environment, 'test')
        const spy = jest.fn()
        createPresentToShopperModal(spy)
        expect(spy.mock.calls[0][0]).toMatchSnapshot()
    })
})
