import ko from 'knockout'
import { comboCards, noInstallmentsMsg, countries } from '../constants'
import { ajax, eventEmitter } from '../utils'
import { Component, Order, Payment } from './index'

class Store {
    constructor() {
        this.startEventListeners()
    }

    get installmentsEnabled() {
        const hasInstallments = !!this.installments().length
        const cardIsCredit = this.selectedComboCard() === comboCards.credit
        return ko.observable(
            this.isAllowedCountryForInstallments &&
                hasInstallments &&
                cardIsCredit
        )
    }

    get isAllowedCountryForInstallments() {
        return this.installmentsAllowedCountries.includes(
            this.locale.toLowerCase()
        )
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
        this.brazilEnabled = false

        this.noInstallmentsMsg = viewModel.translate(noInstallmentsMsg)
        this.storedPaymentType = ko.observable('')
        this.environment = undefined
        this.pageParams = undefined

        // Component
        this.component = new Component()
        this.checkout = undefined
        this.holderNameEnabled = false
        this.originDomain = ''
        this.originKey = ''
        this.isValid = false
        this.selectedBrand = undefined
        this.creditCard = comboCards.credit
        this.debitCard = comboCards.debit
        this.comboCards = ko.observable([this.creditCard, this.debitCard])
        this.comboCardOptions = {}
        this.selectedComboCard = ko.observable(this.creditCard)
        this.isPaymentStored = ko.observable(false)
        this.paymentMethodsResponse = undefined
        this.paymentDetails = undefined
        this.isLoaded = ko.observable(false)
        this.installments = ko.observable([])
        this.selectedInstallment = ko.observable({})
        this.installmentsAllowedCountries = [
            countries.mexico.locale,
            countries.brazil.locale,
        ]
        this.installmentsOptions = []

        // Payment
        this.paymentComponent = new Payment()
        this.genericPayment = { type: 'generic' }
        this.isSubmitting = ko.observable(false)

        // Order
        this.orderComponent = new Order()
        this.isDone = ko.observable(false)

        // Boleto
        this.boletoEnabled = false
        this.boletoDeliveryDate = ''
        this.boletoShopperStatement = ''
    }
}

export default new Store()
