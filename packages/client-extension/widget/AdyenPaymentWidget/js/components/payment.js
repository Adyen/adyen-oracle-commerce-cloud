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

    setPayment = type => {
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

    updatePayment = pPayment => {
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
        const selectedComboCard = store.get(constants.selectedComboCard)()
        const isDebitCard = selectedComboCard === constants.comboCards.debit
        const brand = store.get(constants.selectedBrand)
        const isGeneric = type === constants.paymentMethodTypes.generic
        const isComboCard = isGeneric && isDebitCard

        const brandType = isComboCard && { type: brand }
        const paymentMethod = paymentDetails.paymentMethod && { ...paymentDetails.paymentMethod, ...brandType }
        const payload = { ...paymentDetails, paymentMethod }
        return payload
    }

    createPayment = type => {
        const storedPaymentType = store.get(constants.storedPaymentType)
        const isPaymentStored = store.get(constants.isPaymentStored)
        const paymentDetails = store.get(constants.paymentDetails)
        const selectedInstallment = store.get(constants.selectedInstallment)
        const selectedComboCard = store.get(constants.selectedComboCard)
        const comboCardOptions = store.get(constants.comboCardOptions)

        const hasInstallments = this.checkSelectedInstallment(selectedInstallment)

        const isCreditCard = selectedComboCard() === constants.comboCards.credit
        const isValid = this.validateInstallment(hasInstallments, isCreditCard)

        const storedPayment = this.getStoredPayment(isPaymentStored, storedPaymentType)
        const numberOfInstallments = this.getInstallments(isValid, selectedInstallment)

        const genericPayment = store.get(constants.genericPayment)
        const updatedPaymentDetails = this.updatePaymentMethodType(type, paymentDetails[type])

        const customProperties = {
            paymentDetails: updatedPaymentDetails,
            storedPayment,
            ...(numberOfInstallments && { numberOfInstallments }),
            ...comboCardOptions,
        }
        const updatedGenericPayment = { ...genericPayment, customProperties }

        return updatedGenericPayment
    }

    checkSelectedInstallment = selectedInstallment =>
        selectedInstallment() && 'numberOfInstallments' in selectedInstallment()
    getInstallments = (isValid, selectedInstallment) => isValid && parseInt(selectedInstallment().numberOfInstallments)
    validateInstallment = (hasInstallments, isCreditCard) => hasInstallments && isCreditCard
    getStoredPayment = (isPaymentStored, storedPaymentType) => (isPaymentStored ? storedPaymentType() : '')
}

export default Payment
