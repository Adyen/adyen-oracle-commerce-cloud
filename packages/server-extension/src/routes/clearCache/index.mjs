import { cacheInstance } from '../../helpers/serverCache.mjs'
import express from 'express'

const router = express.Router()

router.get('/', (req, res, next) => {
    try {
        const lastCache = cacheInstance.exportJson()
        const hits = cacheInstance.hits()
        const misses = cacheInstance.misses()

        cacheInstance.clear()
        res.json({ lastCache, hits, misses })
    } catch (e) {
        next(e)
    }
})

export default router
