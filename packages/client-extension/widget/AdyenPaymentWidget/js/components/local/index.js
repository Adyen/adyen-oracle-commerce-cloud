import * as constants from '../../constants'
import { Checkout, eventEmitter } from '../../utils'
import { store } from '../index'

const unsupportedTypes = ['wechatpayWeb', 'scheme', 'boleto', 'boletobancario']
const checkDetails = (isValidType, paymentMethod) => isValidType && 'details' in paymentMethod
const checkIfIsValid = (hasType, paymentMethod) => hasType && !unsupportedTypes.includes(paymentMethod.type)
const checkType = paymentMethod => 'type' in paymentMethod

const createValidator = paymentMethod => {
    return {
        // eslint-disable-next-line complexity
        validate: (key, value) => {
            const hasType = checkType(paymentMethod)
            const isValidType = checkIfIsValid(hasType, paymentMethod)
            const hasDetails = checkDetails(isValidType, paymentMethod)
            const hasOneItem = hasDetails && paymentMethod.details.length === 1
            const detail = hasOneItem && paymentMethod.details[0]
            const keyIsIssuerAndTypeIsSelect = detail && detail[key] === value
            const isValid = !hasDetails || keyIsIssuerAndTypeIsSelect
            return isValidType && isValid
        },
    }
}

export const isLocalPaymentMethod = paymentMethod => {
    const { validate } = createValidator(paymentMethod)
    const keyIsIssuer = validate('key', 'issuer')
    const typeIsSelect = validate('type', 'select')
    return keyIsIssuer && typeIsSelect
}

export const submitPayByLink = paymentMethod => {
    const hasDetails = checkDetails(true, paymentMethod)

    const createDetails = () => {
        const { type } = paymentMethod
        const paymentDetails = store.get(constants.paymentDetails)
        const order = store.get(constants.order)
        const shippingAddress = order().shippingAddress()
        const countryCode = shippingAddress.selectedCountry()
        const payload = { paymentMethod: { ...paymentMethod, countryCode } }

        eventEmitter.store.emit(constants.paymentDetails, { ...paymentDetails, [type]: payload })
    }

    !hasDetails && createDetails()
}

const createLocalCheckout = (acc, localPaymentMethod) => {
    const { type } = localPaymentMethod
    const checkout = new Checkout(type)
    const onChange = checkout.onChange()
    const submit = checkout.onSubmit()
    const onSubmit = () => {
        submitPayByLink(localPaymentMethod)
        submit()
    }

    const configuration = { onSubmit, onChange, showPayButton: true }

    const checkoutOptions = type => ({ configuration, selector: `#adyen-${type}-payment`, type })
    checkout.createCheckout(checkoutOptions(type), checkout => ({ ...acc, [type]: checkout }))
}

const createLocalPaymentCheckout = ({ paymentMethods }) => {
    const localPaymentMethods = paymentMethods.filter(isLocalPaymentMethod)
    eventEmitter.store.emit(constants.localPaymentMethods, localPaymentMethods)
    const localPaymentMethodsCheckout = localPaymentMethods.reduce(createLocalCheckout, {})

    eventEmitter.store.emit(constants.checkout.local, localPaymentMethodsCheckout)
}

export default createLocalPaymentCheckout
