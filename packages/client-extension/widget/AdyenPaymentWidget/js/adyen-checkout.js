import pubsub from 'pubsub'
import notifier from 'notifier'
import $ from 'jquery'
import { store } from './components'
import { createSpinner, destroySpinner, eventEmitter, hideLoaders } from './utils'
import createError from './utils/createError'
import * as constants from './constants'
import { presentToShopper, setBoletoConfig } from './components'

class ViewModel {
    store = store

    setGatewaySettings = ({
        installmentsOptionsId,
        environment,
        storedPayment,
        boletoDeliveryDate,
        boletoShopperStatement,
    }) => {
        eventEmitter.store.emit(constants.environment, environment)

        store.get(constants.isAllowedCountryForInstallments) && this.setInstallments(installmentsOptionsId)
        eventEmitter.store.emit(constants.storedPaymentType, storedPayment)

        setBoletoConfig({ boletoDeliveryDate: Number(boletoDeliveryDate), boletoShopperStatement })
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
        const { currency, locale } = brazil

        const siteLocale = store.get(constants.locale).toLowerCase()
        const currencyCode = this.cart().currencyCode()
        const localeIsBr = locale === siteLocale
        const curIsBr = currencyCode.toLowerCase() === currency

        eventEmitter.store.emit(constants.brazilEnabled, localeIsBr && curIsBr)
    }

    handlePageChanged = (pageData) => {
        const isCheckout = pageData.pageId === 'checkout'
        isCheckout && eventEmitter.order.emit(constants.pageChanged, pageData)
    }

    beforeAppear = () => {
        this.reset()
    }

    onLoad = (widget) => {
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

    presentToShopper = () => {
        const { resultCode, customPaymentProperties } = store.get(constants.orderPayload)
        const isPresentToShopper = resultCode === constants.presentToShopper
        isPresentToShopper && presentToShopper(customPaymentProperties)
    }
    orderSubmitted = () => store.has(constants.orderPayload) && this.presentToShopper()

    subscribeToTopics = () => {
        const {
            ORDER_CREATED_INITIAL,
            ORDER_CREATE,
            ORDER_SUBMISSION_FAIL,
            ORDER_COMPLETED,
            ORDER_CREATED,
            PAGE_CHANGED,
            ORDER_SUBMISSION_SUCCESS,
            NOTIFICATION_ADD,
        } = pubsub.topicNames

        const emitInitialOrder = (ev) => {
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

        $.Topic(NOTIFICATION_ADD).subscribe(hideLoaders)
    }
}

const vm = new ViewModel()
export default vm
