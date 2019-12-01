import Widget from "../../../../__mocks__/widget";
import generateTemplate, {mockTemplate} from "../utils/tests/koTemplate";
import * as constants from '../constants'
import {eventEmitter} from "../utils";

describe('Template', () => {
    let widget
    let tmplWidget;
    beforeEach(() => {
        tmplWidget = mockTemplate('Tmpl_Widget')
        widget = new Widget()
    })

    afterEach(() => {
        tmplWidget.remove();
    })

    it('should render', function () {
        const template = generateTemplate(widget)
        expect(template).toMatchSnapshot();
    })

    it('should display boleto component', function () {
        const {countries, paymentMethodTypes} = constants;
        const {brazil} = countries;
        widget.setCurrencyCode(brazil.currency)
        widget.setLocale(brazil.locale)
        widget.setGatewaySettings('paymentMethodTypes', [paymentMethodTypes.invoice])

        const template = generateTemplate(widget)
        expect(template).toMatchSnapshot();
    });

    it('should display spinner on submitting state', function () {
        const {countries, paymentMethodTypes} = constants;
        const {brazil} = countries;
        widget.setCurrencyCode(brazil.currency)
        widget.setLocale(brazil.locale)
        widget.setGatewaySettings('paymentMethodTypes', [paymentMethodTypes.invoice])

        const template = generateTemplate(widget, () => {
            eventEmitter.store.emit(constants.isSubmitting, true)
        })
        expect(template).toMatchSnapshot();
    });

    it('should display installments', function () {
        const {countries: {mexico}, paymentMethodTypes} = constants;
        widget.setLocale(mexico.locale)
        widget.setGatewaySettings('paymentMethodTypes', [paymentMethodTypes.generic])

        const template = generateTemplate(widget, () => {
            eventEmitter.store.emit(constants.installments, [{numberOfInstallments: 3}, {numberOfInstallments: 5}])
            eventEmitter.store.emit(constants.isLoaded, true)
        })

        expect(template).toMatchSnapshot();
    });

    it('should display combo card', function () {
        const {countries, paymentMethodTypes} = constants;
        const {brazil} = countries;
        widget.setCurrencyCode(brazil.currency)
        widget.setLocale(brazil.locale)
        widget.setGatewaySettings('paymentMethodTypes', [paymentMethodTypes.generic])

        const template = generateTemplate(widget, () => {
            eventEmitter.store.emit(constants.isLoaded, true)
        })
        expect(template).toMatchSnapshot();
    });
})