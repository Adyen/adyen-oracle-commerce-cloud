import * as constants from '../../constants'
import { Checkout, eventEmitter } from '../../utils'
import { store } from '../index'

const unsupportedTypes = ['wechatpayWeb', 'scheme', 'boleto', 'boletobancario']
const checkDetails = (isValidType, paymentMethod) => isValidType && 'details' in paymentMethod
const checkType = (paymentMethod) => 'type' in paymentMethod
const checkIfIsValid = (paymentMethod) => checkType(paymentMethod) && !unsupportedTypes.includes(paymentMethod.type)

const checkDetailsSize = (hasDetails, paymentMethod) => hasDetails && paymentMethod.details.length === 1
const getDetail = (hasDetails, paymentMethod) => checkDetailsSize(hasDetails, paymentMethod) && paymentMethod.details[0]
const checkIssuerAndType = (hasDetails, paymentMethod, { key, value }) => {
    const detail = getDetail(hasDetails, paymentMethod)
    return detail && detail[key] === value
}

const createValidator = (paymentMethod) => ({
    assert: (key, value) => {
        const isValidType = checkIfIsValid(paymentMethod)
        const hasDetails = checkDetails(isValidType, paymentMethod)
        const keyIsIssuerAndTypeIsSelect = checkIssuerAndType(hasDetails, paymentMethod, { key, value })
        const isValid = !hasDetails || keyIsIssuerAndTypeIsSelect
        return isValidType && isValid
    },
})

export const isLocalPaymentMethod = (paymentMethod) => {
    const { assert } = createValidator(paymentMethod)
    const keyIsIssuer = assert('key', 'issuer')
    const typeIsSelect = assert('type', 'select')
    return keyIsIssuer && typeIsSelect
}

export const submitPayByLink = (paymentMethod) => {
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

    const checkoutOptions = { configuration, selector: `#adyen-${type}-payment`, type }
    checkout.createCheckout(checkoutOptions, (c) => ({ ...acc, [type]: c }))
}

const createLocalPaymentCheckout = ({ paymentMethods }) => {
    const localPaymentMethods = paymentMethods.filter(isLocalPaymentMethod)
    eventEmitter.store.emit(constants.localPaymentMethods, localPaymentMethods)
    const localPaymentMethodsCheckout = localPaymentMethods.reduce(createLocalCheckout, {})

    eventEmitter.store.emit(constants.checkout.local, localPaymentMethodsCheckout)
}

export default createLocalPaymentCheckout
