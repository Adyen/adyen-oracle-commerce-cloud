import crypto from 'crypto'

function validateWebHookPayloadSignature(req) {
    const logger = req.app.locals.logger

    const hasSecretKey = req.url in process.env
    logger.info(':::SK ', hasSecretKey)
    logger.info(':::ENV ', req.url)
    if (hasSecretKey) {
        const secret_key = process.env[req.url]
        // Secret key is base64 encoded and must be decoded into bytes; </span><a class="oracle-km-link-bug oracl-km-link" href="https://support.oracle.com/rs?type=bug&id=24619421" target="_blank">BUG 24619421</a><span>::Documentation for HMAC SHA1 key from the raw key bytes
        const decoded_secret_key = Buffer.from(secret_key, 'base64')

        const calculated_signature = crypto
            .createHmac('sha1', decoded_secret_key)
            .update(req.rawBody)
            .digest('base64')

        if (
            calculated_signature != req.headers['x-oracle-cc-webhook-signature']
        ) {
            logger.error('Invalid signature. Access denied')
            logger.error(
                'current: ',
                req.headers['x-oracle-cc-webhook-signature'],
                ' / expected: ',
                calculated_signature
            )
            throw new Error('Invalid signature. Access denied')
        }
    } else {
        req.headers['x-oracle-cc-webhook-signature'] =
            'x-oracle-cc-webhook-signature'
    }
}

export default validateWebHookPayloadSignature
