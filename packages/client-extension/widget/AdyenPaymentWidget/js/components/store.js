import ko from 'knockout'
import { comboCards, noInstallmentsMsg, countries } from '../constants'
import { ajax, eventEmitter } from '../utils'
import { Component, Order, Payment } from './index'

class Store {
    constructor() {
        this.startEventListeners()

        this.selectedComboCard.subscribe(() => this.selectedInstallment({}))
    }

    brazilEnabled = false

    storedPaymentType = ko.observable('')
    environment = undefined
    pageParams = undefined

    // Component
    component = new Component()
    checkout = undefined
    originKey = ''
    isValid = false
    selectedBrand = undefined
    creditCard = comboCards.credit
    debitCard = comboCards.debit
    comboCards = ko.observable([comboCards.credit, comboCards.debit])
    comboCardOptions = {}
    selectedComboCard = ko.observable(comboCards.credit)
    isPaymentStored = ko.observable(false)
    paymentMethodsResponse = undefined
    paymentDetails = undefined
    isLoaded = ko.observable(false)
    installments = ko.observable([])
    selectedInstallment = ko.observable({})
    installmentsAllowedCountries = [countries.mexico.locale, countries.brazil.locale]
    installmentsOptions = []

    // Card
    scheme = ko.observable(false)

    // Payment
    paymentComponent = new Payment()
    genericPayment = { type: 'generic' }

    // Order
    orderComponent = new Order()
    isDone = ko.observable(false)

    // Boleto
    boletobancario = ko.observable(false)
    boletoDeliveryDate = ''
    boletoShopperStatement = ''

    // Local
    checkoutLocal = ko.observable([])
    localPaymentMethods = ko.observableArray()

    get installmentsEnabled() {
        const hasInstallments = !!this.installments().length
        const cardIsCredit = this.selectedComboCard() === comboCards.credit
        return ko.observable(this.isAllowedCountryForInstallments && hasInstallments && cardIsCredit)
    }

    get isAllowedCountryForInstallments() {
        return this.installmentsAllowedCountries.includes(this.locale.toLowerCase())
    }

    startEventListeners = () => {
        eventEmitter.store.listen((key, value) => {
            if (typeof this[key] === 'function') {
                this[key](value)
            } else {
                this[key] = value
            }
        })
    }

    get = key => (this.has(key) ? this[key] : undefined)

    has = key => key in this

    init = viewModel => {
        this.id = viewModel.id
        this.order = viewModel.order
        this.cart = viewModel.cart
        this.ajax = ajax(viewModel.isPreview())
        this.translate = viewModel.translate
        this.locale = viewModel.locale()
        this.noInstallmentsMsg = viewModel.translate(noInstallmentsMsg)
    }
}

export default new Store()
