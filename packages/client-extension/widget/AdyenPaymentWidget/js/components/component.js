import $ from 'jquery'
import * as constants from '../constants'
import { eventEmitter } from '../utils'
import { createBoletoCheckout, createCardCheckout, store } from './index'

class Component {
    constructor() {
        this.startEventListeners()
    }

    startEventListeners = () => {
        eventEmitter.component.on(constants.render, this.render)
        eventEmitter.component.on(
            constants.comboCardOptions,
            this.getComboCardOptions
        )
    }

    getComboCardOptions = () => {
        const brands = { visa: constants.bins.electron }
        const selectedComboCard = store.get(constants.selectedComboCard)()
        const isDebitCard = selectedComboCard === constants.comboCards.debit
        const brand = store.get(constants.selectedBrand)
        const selectedBrand =
            brand in brands
                ? brands[store.get(constants.selectedBrand)]
                : store.get(constants.selectedBrand)

        const options = {
            selectedBrand,
            additionalData: { overwriteBrand: true },
        }

        eventEmitter.store.emit(
            constants.comboCardOptions,
            isDebitCard ? options : {}
        )
    }

    getOriginKeysSuccessResponse = originKeysRes => {
        const { origin } = window.location
        eventEmitter.store.emit(
            constants.originKey,
            originKeysRes.originKeys[origin]
        )
        store.get(constants.ajax)('paymentMethods', this.getPaymentMethods)
    }

    render = () => {
        store.get(constants.ajax)(
            'originKeys',
            this.getOriginKeysSuccessResponse
        )
    }

    getPaymentMethods = paymentMethodsResponse => {
        eventEmitter.store.emit(
            constants.paymentMethodsResponse,
            paymentMethodsResponse
        )

        $.getScript(constants.adyenCheckoutComponentUrl, () => {
            createCardCheckout()
            store.get(constants.brazilEnabled) && createBoletoCheckout()
        })
    }
}

export default Component
