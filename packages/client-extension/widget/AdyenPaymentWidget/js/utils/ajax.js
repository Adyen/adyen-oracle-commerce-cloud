import $ from 'jquery'
import { baseAPIUrl, channels } from '../constants'

export default (siteId, isPreview = true) => {
    return (path, cb, method = 'get') => {
        $.ajax({
            url: `${baseAPIUrl}/${path}`,
            method,
            headers: {
                channel: isPreview ? channels.preview : channels.storefront,
                'x-ccsite': siteId
            },
            success: cb,
        })
    }
}
