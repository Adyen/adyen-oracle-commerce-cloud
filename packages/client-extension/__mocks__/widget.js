import * as constants from '../widget/AdyenPaymentWidget/js/constants'
import ko from 'knockout'

const defaultCart = ko.observable({
    combineLineItems: 'true',
    currencyCode: ko.observable('USD'),
    amount: ko.observable('1000'),
})

const { scheme } = constants.paymentMethodTypes
const defaultSiteSettings = {
    extensionSiteSettings: {
        AdyenGenericGateway: {
            paymentMethodTypes: [scheme],
            installmentsOptionsId: '',
            environment: 'TEST',
        },
    },
}
const defaultSite = ko.observable({ ...defaultSiteSettings })

const shippingAddress = { city: 'mocked_shipping_city' }
const billingAddress = { city: 'mocked_billing_city' }
export const mockedOrder = {
    billingAddress,
    shippingAddress,
    id: 'mocked_id',
    orderProfileId: 'mocked_order_profile_id',
    shippingMethod: 'mocked_shipping_method',
    shoppingCart: 'mocked_shopping_cart',
}

const address = {
    city: ko.observable('city'),
    selectedCountry: ko.observable('NL'),
    country: ko.observable('NL'),
    firstName: ko.observable('firstName'),
    lastName: ko.observable('lastName'),
    postalCode: ko.observable('1000DK'),
    selectedState: ko.observable('NH'),
    address1: ko.observable('address_1'),
}

const defaultOrderOptions = {
    id: ko.observable(''),
    op: ko.observable(),
    handlePlaceOrder: jest.fn(),
    updatePayments: function(payment) {
        this.payments(payment)
    },
    shippingAddress: ko.observable(address),
    billingAddress: ko.observable(address),
    cart: defaultCart,
    paymentGateway: ko.observable({ type: 'AdyenPaymentGateway' }),
    payments: ko.observable([]),
    order: ko.observable(mockedOrder),
    checkoutLink: '/checkout',
}
const defaultOrder = ko.observable({ ...defaultOrderOptions })
const defaultUser = ko.observable({
    id: ko.observable('1234')
})

class Widget {
    id = ko.observable('random_mocked_id')
    order = defaultOrder
    site = defaultSite
    cart = defaultCart
    user = defaultUser
    isPreview = ko.observable
    locale = ko.observable('en_US')
    translate = jest.fn(x => `translated_${x}`)
    storedPaymentType = ko.observable('')

    setGatewaySettings(key, value) {
        this.site().extensionSiteSettings.AdyenGenericGateway[key] = value
    }

    setCurrencyCode(currencyCode) {
        this.cart().currencyCode(currencyCode)
    }

    setLocale(locale) {
        this.locale(locale)
    }
}

export default Widget
