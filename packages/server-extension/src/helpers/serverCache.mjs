import mcache from 'memory-cache'

export { mcache as cacheInstance }

const cache = duration => (req, res, next) => {
    const url = req.originalUrl || req.url
    const key = `__express__${url}`
    const cachedBody = mcache.get(key)
    if (cachedBody) {
        req.app.locals.logger.info('!-- CACHED --!')
        res.json(cachedBody)
        return
    }

    req.app.locals.logger.info('!-- NOT_CACHED --!')
    res.sendResponse = res.json
    res.json = body => {
        mcache.put(key, body, duration * 1000)
        res.sendResponse(body)
    }
    next()
}

export default cache
