import $ from 'jquery'
import hideLoaders from './hideLoaders'

export const createModal = () => {
    const modal = document.querySelector('#cc-editPane')
    if (!modal) {
        const node = `
        <!-- Edit Personalization Modal -->
        <div class="modal fade" id="cc-editPane" tabindex="-1" role="dialog">
            <div class="modal-dialog cc-modal-dialog">
                <div class="modal-content">
                    <div class="modal-body cc-modal-body">
                        <div id="present-shopper"></div>
                    </div>
                </div>
            </div>
        </div>
    `
        const template = document.createElement('template')
        template.innerHTML = node
        document.body.appendChild(template.content)
    }
}

export const showModal = () => {
    hideLoaders()
    $('#cc-editPane').modal('show')
}

export const hideModal = () => {
    $('#cc-editPane').modal('hide')
}

export const createPresentToShopperModal = (cb) => {
    const node = document.createElement('div')
    node.setAttribute(
        'style',
        'display: flex;justify-content: center;align-content: center;top: 0;position: fixed;z-index: 999;' +
            'align-items: center;'
    )

    const wrapper = document.createElement('div')
    wrapper.setAttribute('style', 'height: 100vh; width: 100vw; background-color: #a4a4a494; z-index: 999;')
    wrapper.setAttribute('id', 'present-shopper-wrapper')

    const modal = document.createElement('div')
    modal.setAttribute('id', 'present-shopper')
    modal.setAttribute('style', 'z-index: 9999;position: absolute;')

    const clickEvent = () => {
        wrapper.removeEventListener('click', clickEvent)
        node.remove()
    }

    wrapper.addEventListener('click', clickEvent)

    node.appendChild(modal)
    node.appendChild(wrapper)

    document.body.appendChild(node)
    cb(node)
}
