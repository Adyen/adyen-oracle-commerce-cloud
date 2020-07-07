import $ from 'jquery'
import { baseAPIUrl, channels } from '../constants'

const getData = (method, body) => method === 'post' && { data: { json: JSON.stringify(body) } }
export default (isPreview = true) => {
    return (path, cb, { body, method } = { body: '', method: 'get' }) => {
        const data = getData(method, body)
        $.ajax({
            url: `${baseAPIUrl}/${path}`,
            method,
            headers: {
                channel: isPreview ? channels.preview : channels.storefront,
            },
            success: cb,
            ...data,
        })
    }
}
