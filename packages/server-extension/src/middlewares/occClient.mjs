import { cacheInstance } from '../helpers/serverCache.mjs'
import occClient from '../helpers/occClient.mjs'

export default async (req, res, next) => {
    const key = 'occ-gateway-settings'
    const cachedBody = cacheInstance.get(key)

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
        })
    } catch (e) {
        return next(e)
    }
}
