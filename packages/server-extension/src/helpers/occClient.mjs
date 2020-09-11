import nconf from 'nconf/lib/nconf.js'
import CommerceSDK from '../utils/occSdk.mjs'

export default function occClient(logger) {
    return new CommerceSDK({
        hostname: nconf.get('atg.server.admin.url'),
        apiKey: nconf.get('atg.application.credentials:atg.application.token'),
        logger,
    })
}
