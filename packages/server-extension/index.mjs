import express from 'express'
import winston from 'winston'
import bodyParser from 'body-parser'
import configureApp from './src/index.mjs'

const { createLogger } = winston

const levels = { error: 0, warn: 1, info: 2 }
const logger = createLogger({ levels })

const app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

logger.info('OCC Server Side Extension')
app.locals.logger = logger

const port = 3000

configureApp(app)

app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Example app listening at http://localhost:${port}`)
})
