import * as constants from '../../constants'
import { addDays, Checkout, createPresentToShopperModal, eventEmitter, createFromAction } from '../../utils'
import { store } from '../index'

const { boletoOptions, paymentMethodTypes } = constants
const { boleto } = paymentMethodTypes
const { deliveryDate, shopperStatement } = boletoOptions

const setField = (data, field) => data && eventEmitter.store.emit(field, data)
const setDeliveryDate = boletoDeliveryDate => setField(boletoDeliveryDate, deliveryDate)
const setShopperStatement = boletoShopperStatement => setField(boletoShopperStatement, shopperStatement)

export const setBoletoConfig = ({ boletoDeliveryDate, boletoShopperStatement }) => {
    setDeliveryDate(boletoDeliveryDate)
    setShopperStatement(boletoShopperStatement)
}

export const presentToShopper = customPaymentProperties => {
    const checkoutBoleto = store.get(constants.checkout.boleto)
    const options = { action: customPaymentProperties, selector: '#present-shopper', checkoutComponent: checkoutBoleto }

    const runAction = () => createFromAction(options)
    createPresentToShopperModal(runAction)
}

const setComponent = checkout => eventEmitter.store.emit(constants.checkout.boleto, checkout)

const createBoletoCheckout = ({ paymentMethods }) => {
    const hasBoleto = paymentMethods.some(({ type }) => type.includes(boleto))

    if (hasBoleto) {
        const type = constants.paymentMethodTypes.boleto
        eventEmitter.store.emit(constants.paymentMethodTypes.boleto, true)
        const checkout = new Checkout(type)
        const onChange = checkout.onChange({
            deliveryDate: addDays(store.get(constants.boletoOptions.deliveryDate)),
            shopperStatement: store.get(constants.boletoOptions.shopperStatement),
        })

        const onSubmit = checkout.onSubmit()

        const configuration = { onSubmit, onChange }
        const order = store.get(constants.order)

        const address = order().billingAddress()

        const shopperName = { firstName: address.firstName(), lastName: address.lastName() }
        const billingAddress = {
            city: address.city(),
            country: address.selectedCountry(),
            // houseNumberOrName:"952",
            postalCode: address.postalCode(),
            stateOrProvince: address.selectedState(),
            street: address.address1(),
        }

        const showEmailAddress = true
        const options = { showEmailAddress, data: { shopperName, billingAddress } }
        const checkoutOptions = { configuration, selector: `#adyen-${type}-payment`, type, options }

        checkout.createCheckout(checkoutOptions, setComponent)
    }
}

export default createBoletoCheckout
