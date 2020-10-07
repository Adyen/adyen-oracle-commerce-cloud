export const baseAPIUrl = '/ccstorex/custom/adyen/v1'
export const channels = { preview: 'preview', storefront: 'storefront' }
export const errorMessages = {
    paymentRefused: 'paymentRefused',
    installmentsConfiguration: 'installmentsConfiguration',
    failed3dsValidation: 'failed3dsValidation',
}
export const paymentMethodTypes = {
    scheme: 'scheme',
    boleto: 'boletobancario',
    local: 'local',
}
export const adyenUrl = (env) => `https://checkoutshopper-${env.toLowerCase()}.adyen.com`
export const adyenCssUrl = (env) => `${adyenUrl(env)}/checkoutshopper/sdk/3.4.0/adyen.css`

export const locale = 'locale'
export const countries = {
    brazil: { locale: 'pt_br', currency: 'brl', countryCode: 'br' },
    mexico: { locale: 'es_mx', currency: 'mxn', countryCode: 'mx' },
}
export const brazilEnabled = 'brazilEnabled'
export const comboCards = { debit: 'debitCard', credit: 'creditCard' }
export const bins = { electron: 'electron', maestro: 'maestro', elodebit: 'elodebit' }
export const storage = { paymentData: 'AdyenPaymentData', order: 'AdyenOrder', details: 'AdyenDetails' }
export const noInstallmentsMsg = 'noInstallmentsMsg'

export const render = 'render'
export const id = 'id'
export const order = 'order'
export const checkout = {
    card: 'checkoutCard',
    boleto: 'checkoutBoleto',
    local: 'checkoutLocal',
}
export const isLoaded = 'isLoaded'
export const ajax = 'ajax'
export const installments = 'installments'
export const cart = 'cart'
export const user = 'user'
export const setPayment = 'setPayment'
export const initialOrderCreated = 'initialOrderCreated'
export const pageChanged = 'pageChanged'
export const installmentsEnabled = 'installmentsEnabled'
export const isAllowedCountryForInstallments = 'isAllowedCountryForInstallments'
export const environment = 'environment'
export const selectedBrand = 'selectedBrand'
export const selectedComboCard = 'selectedComboCard'
export const installmentsOptions = 'installmentsOptions'
export const storedPaymentType = 'storedPaymentType'
export const storedPaymentMethods = 'storedPaymentMethods'
export const paymentMethodsResponse = 'paymentMethodsResponse'
export const translate = 'translate'
export const isPaymentStored = 'isPaymentStored'
export const paymentDetails = 'paymentDetails'
export const selectedInstallment = 'selectedInstallment'
export const comboCardOptions = 'comboCardOptions'
export const genericPayment = 'genericPayment'
export const isDone = 'isDone'
export const isValid = 'isValid'
export const pageParams = 'pageParams'
export const presentToShopper = 'PresentToShopper'
export const orderPayload = 'orderPayload'
export const boletoOptions = {
    deliveryDate: 'boletoDeliveryDate',
    shopperStatement: 'boletoShopperStatement',
}
export const localPaymentMethods = 'localPaymentMethods'
export const card = 'card'
export const clientKey = 'clientKey'
export const holderNameEnabled = 'holderNameEnabled'
export const checkoutComponent = 'checkoutComponent'
export const countryCode = 'countryCode'
export const additionalDetails = 'additionalDetails'
