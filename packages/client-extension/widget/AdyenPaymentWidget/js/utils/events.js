import $ from 'jquery'

class Emitter {
    store = {
        emit: (key, value) => $.Topic('store').publish(key, value),
        listen: cb => $.Topic('store').subscribe(cb),
    }

    _ev = suffix => ({
        emit: (event, ...args) => $.Topic(`${suffix}-${event}`).publish(...args),
        on: (event, cb) => $.Topic(`${suffix}-${event}`).subscribe(cb),
    })

    emit = (key, ...args) => $.Topic(key).publish(...args)

    payment = this._ev('payment')
    order = this._ev('order')
    component = this._ev('component')

    on = (event, cb) => $.Topic(event).subscribe(cb)
}

export default new Emitter()
