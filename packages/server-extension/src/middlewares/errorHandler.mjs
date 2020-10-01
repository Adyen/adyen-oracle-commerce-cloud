function errorHandler(err, req, res, next) {
    try {
        if (!err) {
            if (next) {
                return next()
            }

            return res.end()
        }
        const statusCode = err.statusCode || 500
        const logger = req.app.locals.logger
        logger.error('[Request Error]: ' + JSON.stringify(err, Object.getOwnPropertyNames(err)))

        res.status(statusCode)
        res.json({
            statusCode,
            message: err.message,
        })
    } catch (e) {
        const logger = req.app.locals.logger
        logger.error('[General error]:' + e.message)
    }
}

export default errorHandler
