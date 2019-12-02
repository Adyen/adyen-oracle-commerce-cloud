import * as constants from '../../constants'
import {
    addDays,
    Checkout,
    createPresentToShopperModal,
    eventEmitter,
    createFromAction,
} from '../../utils'
import { store } from '../index'

export const setBoletoConfig = ({
    paymentMethodTypes,
    boletoDeliveryDate,
    boletoShopperStatement,
}) => {
    const hasBoleto = paymentMethodTypes.includes(
        constants.paymentMethodTypes.invoice
    )
    eventEmitter.store.emit(constants.boleto.enabled, hasBoleto)

    if (hasBoleto) {
        boletoDeliveryDate &&
            eventEmitter.store.emit(
                constants.boleto.deliveryDate,
                boletoDeliveryDate
            )
        boletoShopperStatement &&
            eventEmitter.store.emit(
                constants.boleto.shopperStatement,
                boletoShopperStatement
            )
    }
}

export const presentToShopper = customPaymentProperties => {
    const checkoutBoleto = store.get(constants.checkout.boleto)
    const options = {
        action: customPaymentProperties,
        selector: '#present-shopper',
        checkoutComponent: checkoutBoleto,
    }

    createPresentToShopperModal(() => {
        createFromAction(options)
    })
}

const createBoletoCheckout = () => {
    const checkout = new Checkout(constants.paymentMethodTypes.invoice)
    const onChange = checkout.onChange({
        deliveryDate: addDays(store.get(constants.boleto.deliveryDate)),
        shopperStatement: store.get(constants.boleto.shopperStatement),
    })

    const onSubmit = checkout.onSubmit()

    const configuration = { onSubmit, onChange }
    const order = store.get(constants.order)

    const address = order().billingAddress()

    const shopperName = {
        firstName: address.firstName(),
        lastName: address.lastName(),
    }
    const billingAddress = {
        city: address.city(),
        country: address.selectedCountry(),
        // houseNumberOrName:"952",
        postalCode: address.postalCode(),
        stateOrProvince: address.selectedState(),
        street: address.address1(),
    }
    const options = { data: { shopperName, billingAddress } }
    const checkoutOptions = {
        configuration,
        selector: '#adyen-boleto-payment',
        type: 'boletobancario',
        options,
    }

    checkout.createCheckout(checkoutOptions, checkout => {
        eventEmitter.store.emit(constants.checkout.boleto, checkout)
    })
}

export default createBoletoCheckout
