import $ from 'jquery'
import * as constants from '../constants'
import { eventEmitter } from '../utils'
import { createBoletoCheckout, createCardCheckout, createLocalPaymentCheckout, store } from './index'

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
        const brands = { visa: constants.bins.electron, mc: constants.bins.maestro }
        const selectedComboCard = store.get(constants.selectedComboCard)()
        const isDebitCard = selectedComboCard === constants.comboCards.debit
        const brand = store.get(constants.selectedBrand)
        const selectedBrand = this.getBrand(brands, brand)

        const options = { selectedBrand, additionalData: { overwriteBrand: true } }

        eventEmitter.store.emit(constants.comboCardOptions, isDebitCard ? options : {})
    }

    getOriginKeysSuccessResponse = originKeysRes => {
        const { origin } = window.location
        const cart = store.get(constants.cart)
        const { amount, currencyCode } = cart()

        eventEmitter.store.emit(constants.originKey, originKeysRes.originKeys[origin])
        store.get(constants.ajax)('paymentMethods', this.getPaymentMethods, {
            method: 'post',
            body: { amount: { currency: currencyCode(), value: amount() } },
        })
    }

    render = () => {
        const environment = store.get(constants.environment)
        const href = constants.adyenCssUrl(environment)
        const cssLink = `<link rel="stylesheet" href="${href}" />`
        $('head').append(cssLink)

        store.get(constants.ajax)('originKeys', this.getOriginKeysSuccessResponse)
    }

    getPaymentMethods = paymentMethodsResponse => {
        eventEmitter.store.emit(constants.paymentMethodsResponse, paymentMethodsResponse)
        const environment = store.get(constants.environment)
        const url = constants.adyenCheckoutComponentUrl(environment)

        const createComponents = () => {
            createCardCheckout(paymentMethodsResponse)
            createLocalPaymentCheckout(paymentMethodsResponse)
            createBoletoCheckout(paymentMethodsResponse)
        }

        $.getScript(url, createComponents)
    }
}

export default Component
