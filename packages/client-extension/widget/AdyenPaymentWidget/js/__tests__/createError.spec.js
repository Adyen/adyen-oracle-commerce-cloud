jest.mock('../components/static/bundle')

import spinner from '../../../../__mocks__/spinner'
import navigation from '../../../../__mocks__/navigation'
import notifier from '../../../../__mocks__/notifier'
import createError from '../utils/createError'
import Widget from '../../../../__mocks__/widget'
import viewModel from '../adyen-checkout'

describe('Create Error', function() {
    const preserveUrl = false
    const redirectLink = 'mocked_link'
    let widget

    beforeEach(() => {
        widget = new Widget()
        viewModel.onLoad(widget)
    })

    it('should create error with default err message', function() {
        const error = createError({ redirectLink }, preserveUrl)
        error()

        expect(navigation.goTo).toHaveBeenCalledWith(redirectLink, preserveUrl)
        expect(spinner.destroy).toHaveBeenCalled()
        expect(notifier.sendError).toHaveBeenCalledWith(
            'adyen',
            'The payment is REFUSED.',
            true
        )
    })
})
