import pubsub from 'pubsub'
import notifier from 'notifier'
import $ from 'jquery'
import { store } from './components'
import { createSpinner, destroySpinner, eventEmitter, hideLoaders, hideModal } from './utils'
import createError from './utils/createError'
import * as constants from './constants'
import { setBoletoConfig } from './components'

class ViewModel {
    store = store

    setGatewaySettings = (options) => {
        eventEmitter.store.emit(constants.environment, options.environment)

        options.installmentsEnabled && this.setInstallments(options.installmentsOptionsId)
        eventEmitter.store.emit(constants.storedPaymentType, options.storedPayment)
        eventEmitter.store.emit(constants.clientKey, options.clientKey)
        eventEmitter.store.emit(constants.holderNameEnabled, options.holderNameEnabled)
        eventEmitter.store.emit(constants.countryCode, options.countryCode)

        setBoletoConfig({
            boletoDeliveryDate: Number(options.boletoDeliveryDate),
            boletoShopperStatement: options.boletoShopperStatement,
        })
    }

    setSiteSettings = () => {
        this.setSiteCountryAndCurrency()

        const { AdyenGenericGateway } = this.site().extensionSiteSettings
        this.setGatewaySettings(AdyenGenericGateway)
    }

    setInstallments = (installmentsOptions) => {
        try {
            eventEmitter.store.emit(constants.installmentsOptions, JSON.parse(installmentsOptions))
        } catch (e) {
            const translate = store.get(constants.translate)
            const { installmentsConfiguration } = constants.errorMessages
            const errMsg = translate(installmentsConfiguration)
            notifier.sendError('installments', errMsg, true)
        }
    }

    setSiteCountryAndCurrency = () => {
        const { brazil } = constants.countries
        const { currency } = brazil

        const currencyCode = this.cart().currencyCode().toLowerCase()
        const curIsBr = currencyCode.toLowerCase() === currency

        eventEmitter.store.emit(constants.brazilEnabled, curIsBr)
    }

    handlePageChanged = (pageData) => {
        const isCheckout = pageData.pageId === 'checkout'
        isCheckout && eventEmitter.order.emit(constants.pageChanged, pageData)
    }

    beforeAppear = () => {
        this.reset()
    }

    onLoad = (widget) => {
        Object.assign(this, widget)
        store.init(widget)
        Object.assign(this, widget, { store })

        this.setSiteSettings()
        this.subscribeToTopics()
    }

    onRender = () => {
        eventEmitter.component.emit(constants.render)
    }

    reset = () => {
        eventEmitter.store.emit(constants.installments, [])
    }

    orderSubmitted = () => {
        const { customPaymentProperties } = store.get(constants.orderPayload)

        if (customPaymentProperties.resultCode === 'Authorised') {
            hideModal()
        }
    }

    subscribeToTopics = () => {
        const tn = pubsub.topicNames

        const emitInitialOrder = (ev) => {
            eventEmitter.order.emit(constants.initialOrderCreated, ev)
        }
        $.Topic(tn.ORDER_CREATED_INITIAL).subscribe(emitInitialOrder)
        $.Topic(tn.ORDER_CREATE).subscribe(createSpinner)

        const redirectLink = this.order().checkoutLink
        const errorCallback = createError({ redirectLink })

        $.Topic(tn.ORDER_SUBMISSION_FAIL).subscribe(errorCallback)
        $.Topic(tn.ORDER_COMPLETED).subscribe(destroySpinner)
        $.Topic(tn.ORDER_CREATED).subscribe(this.reset)
        $.Topic(tn.PAGE_CHANGED).subscribe(this.handlePageChanged)
        $.Topic(tn.ORDER_SUBMISSION_SUCCESS).subscribe(this.orderSubmitted)

        $.Topic(tn.NOTIFICATION_ADD).subscribe(hideLoaders)
    }
}

const vm = new ViewModel()
export default vm
