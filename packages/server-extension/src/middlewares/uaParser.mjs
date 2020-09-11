import parser from 'ua-parser-js'

function uaParser(req, res, next) {
    req.app.locals.userAgent = parser(req.headers['user-agent'])
    next()
}

export default uaParser
