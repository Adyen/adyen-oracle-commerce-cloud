function loggerMiddleware(req, res, next) {
    const { logger } = req.app.locals

    logger.info(
        `${req.protocol.toUpperCase()} ${req.method.toUpperCase()} ${req.url}`
    )

    next()
}

export default loggerMiddleware
