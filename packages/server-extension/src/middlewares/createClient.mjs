import AdyenApiLibrary from '@adyen/api-library'
const { Client, Config, HttpURLConnectionClient } = AdyenApiLibrary

const createClient = async (req, res, next) => {
    const { gatewaySettings } = req.app.locals
    const { channel } = req.headers

    const settings = gatewaySettings[(req.body && req.body.channel) || channel || 'preview']
    const { merchantId, merchantPasscode, environment } = settings

    req.app.locals.merchantAccount = merchantId
    req.app.locals.apiKey = merchantPasscode

    const config = new Config({
        apiKey: merchantPasscode,
        merchantAccount: merchantId,
        environment: environment.toUpperCase(),
    })

    const client = new Client({ config })

    if (req.app.disabled('development')) {
        const httpClient = new HttpURLConnectionClient()
        httpClient.proxy = {
            host: 'omcs-proxy.oracleoutsourcing.com',
            port: 80,
        }
        client.httpClient = httpClient
    }

    req.app.locals.client = client
    return next()
}

export default createClient
