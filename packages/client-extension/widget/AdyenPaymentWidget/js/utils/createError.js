import notifier from 'notifier'
import navigation from 'navigation'
import { destroySpinner } from './spinner'

const createError = (options, preserveUrl = false) => () => {
    'redirectLink' in options && navigation.goTo(options.redirectLink, preserveUrl)
    destroySpinner()
    notifier.sendError('adyen', 'The payment is REFUSED.', true)
}

export default createError
