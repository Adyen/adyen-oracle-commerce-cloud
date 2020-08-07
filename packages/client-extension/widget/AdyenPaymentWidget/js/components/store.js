import ko from 'knockout'
import { comboCards, noInstallmentsMsg } from '../constants'
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
    checkoutComponent = undefined
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
    selectedInstallment = ko.observable({})
    installmentsOptions = []
    holderNameEnabled = false
    originDomain = ''
    countryCode = undefined

    // Card
    scheme = ko.observable(false)
    storedPaymentMethods = ko.observableArray([])

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

    get installments() {
        return ko.observable(this.installmentsOptions || [])
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

    get = (key) => (this.has(key) ? this[key] : undefined)

    has = (key) => key in this

    init = (viewModel) => {
        this.id = viewModel.id
        this.order = viewModel.order
        this.cart = viewModel.cart
        this.user = viewModel.user
        this.ajax = ajax(viewModel.isPreview())
        this.translate = viewModel.translate
        this.noInstallmentsMsg = viewModel.translate(noInstallmentsMsg)
    }
}

export default new Store()
