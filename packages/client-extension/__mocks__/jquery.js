const EventEmitter = require('events')
const fetch = require('node-fetch')
const emitter = new EventEmitter()

const $ = jest.fn(() => ({
    removeClass: jest.fn(arg => null),
    show: jest.fn(),
    hide: jest.fn(),
}))

const methods = {
    Topic: eventName => ({
        subscribe: cb => emitter.on(eventName, cb),
        publish: (...payload) => emitter.emit(eventName, ...payload),
    }),
    ajax: async ({ url, method, headers, success }) => {
        try {
            const res = await fetch(`http://localhost${url}`, {
                method,
                headers,
            })
            const body = await res.json()
            process.nextTick(() => success(body))
        } catch (e) {
            throw new Error(e)
        }
    },
    getScript: async (url, cb) => {
        try {
            global.AdyenCheckout = jest.fn(config => ({
                create: (type, options) => ({
                    mount: selector => 'mock_data',
                }),
            }))
            cb()
            await fetch(url)
        } catch (e) {
            throw new Error(e)
        }
    },
}

methods.Topic.removeAll = emitter.removeAllListeners
Object.assign($, methods)

emitter.setMaxListeners(0)
module.exports = $
