import express from 'express'
import nconf from 'nconf'
import getCheckoutUtility from '../../utils/checkoutUtility.mjs'

const router = express.Router()

router.get('/', async function (req, res, next) {
    try {
        const checkoutUtility = getCheckoutUtility(req)

        const originKeys = await checkoutUtility.originKeys({
            originDomains: [nconf.get('atg.server.url'), nconf.get('atg.server.admin.url')],
        })
        res.json(originKeys)
    } catch (e) {
        next(e)
    }
})

export default router
