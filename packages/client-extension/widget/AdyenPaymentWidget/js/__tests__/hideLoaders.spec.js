import Widget from '../../../../__mocks__/widget'
import generateTemplate from '../utils/tests/koTemplate'
import { eventEmitter, hideLoaders } from '../utils'
import * as constants from '../constants'

describe('Hide Loaders', () => {
    let widget
    beforeEach(() => {
        widget = new Widget()
    })

    it('should hide loaders', () => {
        eventEmitter.store.emit(constants.paymentMethodTypes.scheme, true)
        generateTemplate(widget)

        const node = document.querySelectorAll('.loader-wrapper')[0]
        node.classList.toggle('hide', false)

        expect(node.classList.contains('hide')).toBeFalsy()
        hideLoaders()
        expect(node.classList.contains('hide')).toBeTruthy()
    })
})
