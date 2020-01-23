import $ from 'jquery'
import * as constants from '../constants'
import { eventEmitter } from '../utils'
import { createCardCheckout, store } from './index'

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

    getOriginKeysSuccessResponse = originKeysRes => {
        const { origin } = window.location
        const cart = store.get(constants.cart)
        const user = store.get(constants.user)
        const { amount, currencyCode } = cart()

        eventEmitter.store.emit(constants.originKey, originKeysRes.originKeys[origin]) // TODO: re-fetch whenever billing country code changes
        store.get(constants.ajax)('paymentMethods', this.getPaymentMethods, {
            method: 'post',
            body: { amount: { currency: currencyCode(), value: amount() }, shopperReference: user().id() }, // TODO: Add Country Code to Payload
        })
    }

    render = () => {
        const environment = store.get(constants.environment)
        const href = constants.adyenCssUrl(environment)
        const cssLink = `<link rel="stylesheet" href="${href}" />`

        $('head').append(cssLink)

        store.get(constants.ajax)('originKeys', this.getOriginKeysSuccessResponse)
    }

    importAdyenCheckout = paymentMethodsResponse => {
        const environment = store.get(constants.environment)
        const url = constants.adyenCheckoutComponentUrl(environment)

        import(url).then(module => {
            window.AdyenCheckout = module.default
            const scripts = `
              <script type="module" src="https://unpkg.com/generic-component@latest/dist/adyen-checkout/adyen-checkout.esm.js"></script>
              <script nomodule src="https://unpkg.com/generic-component@latest/dist/adyen-checkout/adyen-checkout.js"></script>
           `

            const getScheme = paymentMethod => paymentMethod.type === constants.paymentMethodTypes.scheme
            const storedPaymentType = store.get(constants.storedPaymentType)
            const [card] = paymentMethodsResponse.paymentMethods.filter(getScheme)
            const cardConfiguration = card && {
                card: {
                    enableStoreDetails: !!storedPaymentType(),
                    hasHolderName: false,
                    brands: card.brands,
                    showPayButton: true,
                },
            }

            const paymentMethodsConfiguration = JSON.stringify({
                ...cardConfiguration,
            })

            $('head').append(scripts)
            const node = `
                <adyen-checkout
                    origin-key="${store.get(constants.originKey)}"
                    locale="${store.get(constants.locale)}"
                    environment="${environment}"
                    payment-methods='${JSON.stringify(paymentMethodsResponse)}'
                    payment-methods-configuration='${paymentMethodsConfiguration}'
                >
                    <adyen-payment-method-card></adyen-payment-method-card>
                </adyen-checkout>
            `

            $('#adyen-wc').append(node)
            createCardCheckout()
        })
        // import(url).then(module => {
        //     window.AdyenCheckout = module.default
        //     createStoredCards()
        //     createLocalPaymentCheckout(paymentMethodsResponse)
        //     createBoletoCheckout(paymentMethodsResponse)
        // })
    }

    getPaymentMethods = paymentMethodsResponse => {
        eventEmitter.store.emit(constants.paymentMethodsResponse, paymentMethodsResponse)
        this.importAdyenCheckout(paymentMethodsResponse)
    }
}

export default Component
