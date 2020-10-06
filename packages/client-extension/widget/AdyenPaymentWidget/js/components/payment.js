import * as constants from '../constants'
import { eventEmitter } from '../utils'
import { store } from './index'

class Payment {
    constructor() {
        this.startEventListeners()
    }

    startEventListeners = () => {
        eventEmitter.payment.on(constants.setPayment, this.setPayment)
    }

    setPayment = (type) => {
        const order = store.get(constants.order)
        const id = store.get(constants.id)

        const genericPayment = store.get(constants.genericPayment)
        const updatedGenericPayment = { ...genericPayment, id: id() }

        eventEmitter.store.emit(constants.genericPayment, updatedGenericPayment)
        eventEmitter.component.emit(constants.comboCardOptions)

        const payments = [updatedGenericPayment]

        order().updatePayments(payments)

        this.updatePayment(this.createPayment(type))
    }

    updatePayment = (pPayment) => {
        const order = store.get(constants.order)
        const id = store.get(constants.id)

        const payments = order().payments()
        const checkId = (curId, id) => curId && curId === id()
        const setPayments = (payment, index) => {
            const curPayment = payments[index]
            const { id: curId } = curPayment
            const isSameId = checkId(curId, id)
            return isSameId ? pPayment : curPayment
        }

        const newPayments = payments.map(setPayments)
        order().payments(newPayments)
    }

    updatePaymentMethodType = (type, paymentDetails) => {
        const brandType = this.getBrandType(type)
        const paymentMethod = paymentDetails.paymentMethod && { ...paymentDetails.paymentMethod, ...brandType }
        const payload = { ...paymentDetails, paymentMethod }
        return payload
    }

    getBasketItems = () => {
        const cart = store.get(constants.cart)
        const getItem = (acc, item, idx) => ({
            ...acc,
            [`item${idx + 1}`]: {
                itemID: item.commerceItemId,
                quantity: item.quantity(),
                productTitle: item.productData().displayName,
                category: item.productData().parentCategory.repositoryId,
                brand: item.productData().brand,
                sku: item.catRefId,
            },
        })
        return cart().items().reduce(getItem, {})
    }

    getAccountInfo = () => {
        const user = store.get(constants.user)
        return {
            accountCreationDate: user().registrationDate,
        }
    }

    createPayment = (type) => {
        const storedPaymentType = store.get(constants.storedPaymentType)
        const isPaymentStored = store.get(constants.isPaymentStored)
        const paymentDetails = store.get(constants.paymentDetails)
        const selectedInstallment = store.get(constants.selectedInstallment)
        const selectedComboCard = store.get(constants.selectedComboCard)
        const comboCardOptions = store.get(constants.comboCardOptions)
        const additionalDetails = store.get(constants.additionalDetails)

        const hasInstallments = this.checkSelectedInstallment(selectedInstallment)

        const isCreditCard = selectedComboCard() === constants.comboCards.credit
        const isValid = this.validateInstallment(hasInstallments, isCreditCard)

        const storedPayment = this.getStoredPayment(isPaymentStored, storedPaymentType)
        const numberOfInstallments = this.getInstallments(isValid, selectedInstallment)

        const genericPayment = store.get(constants.genericPayment)
        const updatedPaymentDetails = this.updatePaymentMethodType(type, paymentDetails[type])
        const basketItems = this.getBasketItems()
        const accountInfo = this.getAccountInfo()

        if (additionalDetails && 'paymentData' in additionalDetails) {
            return { ...genericPayment, customProperties: additionalDetails }
        }

        const customProperties = {
            accountInfo,
            paymentDetails: updatedPaymentDetails,
            storedPayment,
            riskData: {
                basket: basketItems,
            },
            ...additionalDetails,
            ...(numberOfInstallments && { numberOfInstallments }),
            ...comboCardOptions,
        }

        return { ...genericPayment, customProperties }
    }

    checkSelectedInstallment = (selectedInstallment) =>
        selectedInstallment() && 'numberOfInstallments' in selectedInstallment()
    getInstallments = (isValid, selectedInstallment) => isValid && parseInt(selectedInstallment().numberOfInstallments)
    validateInstallment = (hasInstallments, isCreditCard) => hasInstallments && isCreditCard
    getStoredPayment = (isPaymentStored, storedPaymentType) => (isPaymentStored ? storedPaymentType() : '')

    getBrandType = (type) => {
        const selectedComboCard = store.get(constants.selectedComboCard)()
        const isDebitCard = selectedComboCard === constants.comboCards.debit
        const brand = store.get(constants.selectedBrand)
        const isGeneric = type === constants.paymentMethodTypes.scheme
        const isComboCard = isGeneric && isDebitCard

        const brandType = isComboCard && { type: brand }
        return brandType
    }
}

export default Payment
