const express = require('express')
const winston = require('winston')
const appRoot = require('app-root-path')

const configureApp = require('./bundle')

const options = {
    file: {
        level: 'info',
        name: 'file.info',
        filename: `${appRoot}/logs/info.log`,
        handleExceptions: true,
        json: true,
        maxsize: 5242880, // 5MB
        maxFiles: 100,
        colorize: true,
    },
    errorFile: {
        level: 'error',
        name: 'file.error',
        filename: `${appRoot}/logs/error.log`,
        handleExceptions: true,
        json: true,
        maxsize: 5242880, // 5MB
        maxFiles: 100,
        colorize: true,
    },
    console: {
        level: 'debug',
        handleExceptions: true,
        json: false,
        colorize: true,
    },
}
const levels = { error: 0, warning: 1, info: 2, debug: 3 }

const logger = winston.createLogger({
    levels,
    transports: [
        new winston.transports.Console(options.console),
        new winston.transports.File(options.errorFile),
        new winston.transports.File(options.file),
    ],
    exitOnError: false,
})

const app = express()

logger.info('OCC Server Side Extension')
app.locals.logger = logger

configureApp(app)

module.exports = app
