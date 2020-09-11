import express from 'express'
import getCheckout from '../../utils/checkout.mjs'

const router = express.Router()

router.post('/', async function (req, res, next) {
    const payload = JSON.parse(req.body.json)
    try {
        const { merchantAccount } = req.app.locals
        const checkout = getCheckout(req)

        const paymentMethodsResponse = await checkout.paymentMethods({
            merchantAccount,
            channel: 'Web',
            ...payload,
        })

        res.json(paymentMethodsResponse)
    } catch (e) {
        next(e)
    }
})

export default router
