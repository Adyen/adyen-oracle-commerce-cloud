import { cacheInstance } from '../helpers/serverCache.mjs'
import occClient from '../helpers/occClient.mjs'

const getKey = (req) => {
    const siteId = req.headers['x-ccsite'] || (req.body && req.body.siteId)
    req.app.locals.siteId = siteId
    return { key: `occ-gateway-settings-${siteId}`, siteId }
}
export default async (req, res, next) => {
    const { key, siteId } = getKey(req)
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
            headers: {
                'x-ccsite': siteId,
            },
        })
    } catch (e) {
        return next(e)
    }
}
