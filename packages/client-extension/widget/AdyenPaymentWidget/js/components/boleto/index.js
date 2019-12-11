import * as constants from '../../constants'
import { addDays, Checkout, createPresentToShopperModal, eventEmitter, createFromAction } from '../../utils'
import { store } from '../index'

const { boleto } = constants
const { deliveryDate, shopperStatement } = boleto

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
    const hasBoleto = paymentMethods.some(({ type }) => type.includes(boleto.paymentMethod))
    eventEmitter.store.emit(constants.boleto.enabled, hasBoleto)

    if (hasBoleto) {
        const checkout = new Checkout(constants.paymentMethodTypes.invoice)
        const onChange = checkout.onChange({
            deliveryDate: addDays(store.get(constants.boleto.deliveryDate)),
            shopperStatement: store.get(constants.boleto.shopperStatement),
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
        const checkoutOptions = { configuration, selector: '#adyen-boleto-payment', type: 'boletobancario', options }

        checkout.createCheckout(checkoutOptions, setComponent)
    }
}

export default createBoletoCheckout
