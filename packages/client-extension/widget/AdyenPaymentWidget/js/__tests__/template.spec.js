import Widget from '../../../../__mocks__/widget'
import generateTemplate, { mockTemplate } from '../utils/tests/koTemplate'

describe('Template', () => {
    let widget
    let tmplWidget
    beforeEach(() => {
        tmplWidget = mockTemplate('Tmpl_Widget')
        widget = new Widget()
    })

    afterEach(() => {
        tmplWidget.remove()
    })

    it('should render', function() {
        const template = generateTemplate(widget)
        expect(template).toMatchSnapshot()
    })
})
