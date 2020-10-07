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
