import { store } from '../components'
import * as constants from '../constants'

export const createPresentToShopperModal = cb => {
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

    const environment = store.get(constants.environment)

    node.innerHTML = `<link 
        rel="stylesheet" 
        href="https://checkoutshopper-${environment}.adyen.com/checkoutshopper/sdk/3.2.0/adyen.css" 
        />`

    node.appendChild(modal)
    node.appendChild(wrapper)

    document.body.appendChild(node)
    cb(node)
}
