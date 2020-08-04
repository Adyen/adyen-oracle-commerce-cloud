import pubsub from 'pubsub'
import notifier from 'notifier'
import $ from 'jquery'
import { store } from './components'
import { createSpinner, destroySpinner, eventEmitter } from './utils'
import createError from './utils/createError'
import * as constants from './constants'
import { presentToShopper, setBoletoConfig } from './components'

class ViewModel {
    setGatewaySettings = ({
        installmentsOptionsId,
        environment,
        storedPayment,
        boletoDeliveryDate,
        boletoShopperStatement,
        paymentMethodTypes,
        originDomain,
        holderNameEnabled,
    }) => {
        eventEmitter.store.emit(constants.environment, environment)

        store.get(constants.isAllowedCountryForInstallments) &&
            this.setInstallments(installmentsOptionsId)
        eventEmitter.store.emit(constants.storedPaymentType, storedPayment)
        eventEmitter.store.emit(constants.originDomain, originDomain)
        eventEmitter.store.emit(constants.holderNameEnabled, holderNameEnabled)

        setBoletoConfig({
            boletoDeliveryDate: Number(boletoDeliveryDate),
            boletoShopperStatement,
            paymentMethodTypes,
        })
    }

    setSiteSettings = () => {
        this.setSiteCountryAndCurrency()

        const { AdyenGenericGateway } = this.site().extensionSiteSettings
        this.setGatewaySettings(AdyenGenericGateway)
    }

    setInstallments = installmentsOptions => {
        try {
            eventEmitter.store.emit(
                constants.installmentsOptions,
                JSON.parse(installmentsOptions)
            )
        } catch (e) {
            const translate = store.get(constants.translate)
            const { installmentsConfiguration } = constants.errorMessages
            const errMsg = translate(installmentsConfiguration)
            notifier.sendError('installments', errMsg, true)
        }
    }

    setSiteCountryAndCurrency = () => {
        const {
            brazil: { currency, locale },
        } = constants.countries

        const siteLocale = store.get(constants.locale).toLowerCase()
        const currencyCode = this.cart()
            .currencyCode()
            .toLowerCase()
        const localeIsBr = locale === siteLocale
        const curIsBr = currencyCode === currency

        eventEmitter.store.emit(constants.brazilEnabled, localeIsBr && curIsBr)
    }

    handlePageChanged = pageData => {
        const isCheckout = pageData.pageId === 'checkout'
        isCheckout && eventEmitter.order.emit(constants.pageChanged, pageData)
    }

    beforeAppear = () => {
        this.reset()
    }

    onLoad = widget => {
        Object.assign(this, widget)
        store.init(widget)

        this.setSiteSettings()

        this.subscribeToTopics()
    }

    onRender = () => {
        eventEmitter.component.emit(constants.render)
    }

    getStore = key => {
        const hasKey = store.has(key)
        return hasKey ? store.get(key) : undefined
    }

    reset = () => {
        eventEmitter.store.emit(constants.isSubmitting, false)
        eventEmitter.store.emit(constants.installments, [])
    }

    orderSubmitted = () => {
        if (store.has(constants.orderPayload)) {
            const { resultCode, customPaymentProperties } = store.get(
                constants.orderPayload
            )
            const isPresentToShopper = resultCode === constants.presentToShopper
            isPresentToShopper && presentToShopper(customPaymentProperties)
        }
    }

    subscribeToTopics = () => {
        const {
            ORDER_CREATED_INITIAL,
            ORDER_CREATE,
            ORDER_SUBMISSION_FAIL,
            ORDER_COMPLETED,
            ORDER_CREATED,
            PAGE_CHANGED,
            ORDER_SUBMISSION_SUCCESS,
        } = pubsub.topicNames

        const emitInitialOrder = ev => {
            eventEmitter.order.emit(constants.initialOrderCreated, ev)
        }
        $.Topic(ORDER_CREATED_INITIAL).subscribe(emitInitialOrder)
        $.Topic(ORDER_CREATE).subscribe(createSpinner)

        const redirectLink = this.order().checkoutLink
        const errorCallback = createError({ redirectLink })

        $.Topic(ORDER_SUBMISSION_FAIL).subscribe(errorCallback)
        $.Topic(ORDER_COMPLETED).subscribe(destroySpinner)
        $.Topic(ORDER_CREATED).subscribe(this.reset)
        $.Topic(PAGE_CHANGED).subscribe(this.handlePageChanged)
        $.Topic(ORDER_SUBMISSION_SUCCESS).subscribe(this.orderSubmitted)
    }
}

export default new ViewModel()
