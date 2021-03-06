import * as constants from '../constants'
import { eventEmitter } from '../utils'
import { createBoletoCheckout, createCardCheckout, createStoredCards, createLocalPaymentCheckout, store } from './index'
import './static/bundle'

class Component {
    constructor() {
        this.startEventListeners()
    }

    startEventListeners = () => {
        eventEmitter.component.on(constants.render, this.render)
        eventEmitter.component.on(constants.comboCardOptions, this.getComboCardOptions)
    }

    getBrand = (brands, brand) => {
        const result = brand in brands ? brands[store.get(constants.selectedBrand)] : store.get(constants.selectedBrand)
        eventEmitter.store.emit(constants.selectedBrand, result)
        return result
    }

    getComboCardOptions = () => {
        const { electron, maestro, elodebit } = constants.bins
        const brands = { visa: electron, mc: maestro, elo: elodebit }
        const selectedComboCard = store.get(constants.selectedComboCard)()
        const isDebitCard = selectedComboCard === constants.comboCards.debit
        const brand = store.get(constants.selectedBrand)
        const selectedBrand = this.getBrand(brands, brand)

        const options = { selectedBrand, additionalData: { overwriteBrand: true } }

        eventEmitter.store.emit(constants.comboCardOptions, isDebitCard ? options : {})
    }

    render = () => {
        const cart = store.get(constants.cart)
        const user = store.get(constants.user)
        const { amount, currencyCode } = cart()

        store.get(constants.ajax)('paymentMethods', this.getPaymentMethods, {
            method: 'post',
            body: { amount: { currency: currencyCode(), value: amount() * 100 }, shopperReference: user().id() },
        })
    }

    importAdyenCheckout = (paymentMethodsResponse) => {
        createCardCheckout(paymentMethodsResponse)
        createStoredCards()
        createLocalPaymentCheckout(paymentMethodsResponse)
        createBoletoCheckout(paymentMethodsResponse)
    }

    getPaymentMethods = (paymentMethodsResponse) => {
        eventEmitter.store.emit(constants.paymentMethodsResponse, paymentMethodsResponse)
        this.importAdyenCheckout(paymentMethodsResponse)
    }
}

export default Component
