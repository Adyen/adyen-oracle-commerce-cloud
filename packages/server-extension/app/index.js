const express = require('express')
const configureApp = require('./bundle')
const winston = require('winston')

const levels = { error: 0, warn: 1, info: 2 }
const logger = winston.createLogger({ levels })

const app = express()

logger.info('OCC Server Side Extension')
app.locals.logger = logger

configureApp(app)

module.exports = app
