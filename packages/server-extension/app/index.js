const express = require('express')
const logger = require('../../../../lib/logging')()
const configureApp = require('./bundle')

const app = express()

logger.info('OCC Server Side Extension')
app.locals.logger = logger

configureApp(app)

module.exports = app
