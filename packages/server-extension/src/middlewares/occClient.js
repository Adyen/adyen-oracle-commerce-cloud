import { cacheInstance } from '../helpers/serverCache'
import occClient from '../helpers/occClient'

export default async (req, res, next) => {
    const siteId = req.headers['x-ccsite'] || (req.body && req.body.siteId)
    const key = 'occ-gateway-settings-' + siteId
    const cachedBody = cacheInstance.get(key)

    req.app.locals.siteId = siteId

    if (cachedBody) {
        req.app.locals.logger.info('!-- OCC_CACHED --!')
        req.app.locals.gatewaySettings = cachedBody
        return next()
    }

    const { logger } = req.app.locals
    const sdk = occClient(logger)

    const getGatewaySettings = (err, res) => {
        if (err) {
            return next(err)
        }
        req.app.locals.logger.info('!-- OCC_NOT_CACHED --!')
        req.app.locals.gatewaySettings = res.data
        cacheInstance.put(key, res.data, 31600000)

        return next()
    }

    try {
        await sdk.login()
        await sdk.get({
            url: '/ccadmin/v1/sitesettings/AdyenGenericGateway',
            callback: getGatewaySettings,
            headers: {
                'x-ccsite': siteId
            }
        })
    } catch (e) {
        return next(e)
    }
}
