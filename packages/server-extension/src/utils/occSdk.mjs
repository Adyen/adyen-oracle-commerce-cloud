/**
 * Oracle Cloud Commerce rest client is designed to connect to an Oracle Cloud Commerce
 * Server from a Node.js application. Currently, this client supports only Storefront
 * and admin servers’ public REST APIs and third party application APIs for admin server.
 */

import http from 'http'
import https from 'https'
import url from 'url'
import debug from 'debug'

const sdkDebugLog = debug('commerce-sdk:log')
sdkDebugLog.log = console.log.bind(console)

const VALID_JSON_CONTENT_TYPES = [
    'application/json',
    'application/json;charset=utf-8',
    'application/json;charset=UTF-8',
    'application/json; charset=utf-8',
    'application/json; charset=UTF-8',
]

/**
 * Returns http|s instance according to the given protocol
 * @param {String} url
 * @returns {http|https}
 */
function getHttp(url) {
    'use strict'
    if (url.startsWith('http:')) {
        return http
    }
    return https
}

/**
 * @class
 * This constructor function creates CommerceSDK instance.
 * <p>
 * @param {Object} configuration required. This configuration object is used to setup
 *        the hostname and port for the SDK. The applicationlKey is required
 *        for Third party application
 *        If the configuration object is not provided, this function will
 *        throw an error.
 * @returns {CommerceSDK} The SDK instance
 */
function CommerceSDK(configuration) {
    ;('use strict')
    if (!configuration) {
        throw new Error('The configuration object is null')
    }
    this.host = configuration.hostname
    this.port = configuration.port
    this.applicationKey = configuration.apiKey
    //this application context will be updated by the init function and
    //this will be initialized only once.
    this.applicationContext = null
    this.protocol = null
    let serverUrl = url.parse(this.host)
    this.hostname = serverUrl.hostname
    //populate protocol value from hostname
    if (!this.protocol) {
        this.protocol = serverUrl.protocol
    }
    if (!this.port) {
        this.port = serverUrl.port
    }
    //still if the port is not set, based on the protocol set the
    //default ports
    if (!this.port || this.port === null) {
        this.port = this.protocol === 'http:' ? 80 : 443
    }
    this.logger = configuration.logger
}

/**
 * This function strigifies the primitives..
 * @param {object} primitive
 * @return {String} returns string value
 */
CommerceSDK.stringifyPrimitive = function (primitive) {
    'use strict'
    if (primitive) {
        var primitiveType = typeof primitive
        //console.log ('The primitive type is ::' + primitiveType);
        var primitiveStringValue = null
        switch (primitiveType) {
            case 'boolean':
                primitiveStringValue = primitive ? true : false
                break
            case 'number':
                primitiveStringValue = isFinite(primitive) ? primitive : ''
                break
            case 'string':
                primitiveStringValue = primitive
                break
            default:
                primitiveStringValue = ''
        }
        //console.log ('The primitive stringified value is ::' + primitiveStringValue);
        return primitiveStringValue
    }
}

/**
 * This function strigifies the given object
 * @param {object} The object that needs to be stringified
 * @returns {String} Stringified version of the query string parameters
 */
CommerceSDK.stringifyQueryString = function (object) {
    'use strict'
    var separatorSymbol = '&'
    var equalSymbol = '='

    if (object) {
        return Object.keys(object)
            .sort()
            .map(function (key) {
                //if the key is simple primitive, then encode it. Otherwise if this is an
                //array, then do the samething for arrays.
                var keyComponentAsString = encodeURIComponent(CommerceSDK.stringifyPrimitive(key)) + equalSymbol
                var keyValue = object[key]

                if (Array.isArray(keyValue)) {
                    return keyValue
                        .map(function (subValue) {
                            var arrayValue =
                                keyComponentAsString + encodeURIComponent(CommerceSDK.stringifyPrimitive(subValue))
                            //console.log ('The key value pair is :' + arrayValue);
                            return arrayValue
                        })
                        .join(separatorSymbol)
                } else {
                    //return key=value
                    var returnValue =
                        keyComponentAsString + encodeURIComponent(CommerceSDK.stringifyPrimitive(keyValue))
                    //console.log ('The key value pair is :' + returnValue);
                    return returnValue
                }
            })
            .join(separatorSymbol)
    } else {
        return ''
    }
}

/**
 * This function preserves the access token
 * for the CommerceSDK instance.
 * <p>
 * @param {String} token - The access token needs to be preserved
 */
CommerceSDK.prototype.setAccessToken = function (token) {
    'use strict'
    this.accessToken = token
}

/**
 * This function skips the login if there is no application key. Otherwise
 * it proceeds with the login.
 * <p>
 * @return {Promise} returns a Promise for Asynchronous processing
 */
CommerceSDK.prototype.login = function () {
    'use strict'
    var self = this // this instance is used in the callback function..

    var loginPromise = new Promise(function (resolve, reject) {
        CommerceSDK.printDebugMessage('Executing login promise', self.logger)
        if (!self.applicationKey) {
            CommerceSDK.printDebugMessage('The end user is trying to use just the public api', self.logger)
            resolve(self)
            //TODO:
            //Usually after the resolve, the remainder statements should not
            //be executed. But after resolving the promise, the remainder statements
            //are executed. Need to figure out why this is happening.
            //for now return after the resolve to avoid this issue.
            return
        }

        var data = CommerceSDK.stringifyQueryString({
            grant_type: 'client_credentials', // jshint ignore:line
        })

        //requestOptions.headers.Authorization = 'Bearer' + accessToken;
        //store requests does not require any access token.
        //admin requests require access token.
        var loginOptions = function (requestOptions) {
            requestOptions.headers.Authorization = 'Bearer ' + self.applicationKey
            requestOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded' // since this has a special character, we need to use [ instead of .
        }

        CommerceSDK.printDebugMessage('Executing request', self.logger)

        self.request({
            url: '/ccadmin/v1/login',
            method: 'post',
            requestOptions: loginOptions,
            data: data,
            callback: function (err, response) {
                CommerceSDK.printDebugMessage('Executing request callback', self.logger)
                if (err || response.errorCode || response.error) {
                    CommerceSDK.printError('There was an error while trying to login', response, self.logger)
                    reject(new Error('There was an error while trying to login', err))
                    return
                }
                var accessToken = response.access_token // jshint ignore:line
                self.setAccessToken(accessToken)
                CommerceSDK.printDebugMessage('user logged in with access token ::' + self.accessToken, self.logger)
                resolve(self)
            },
        })
    })
    return loginPromise
}

/**
 * This function logs out from the configured server.
 * @return {Promise} returns a Promise for Asynchronous processing
 */
CommerceSDK.prototype.logout = function () {
    'use strict'
    var self = this // this instance is used in the callback function..

    var logoutPromise = new Promise(
        function (resolve, reject) {
            CommerceSDK.printDebugMessage('Executing logout promise with url /ccadmin/v1/logout', self.logger)
            self.post({
                url: '/ccadmin/v1/logout',
                data: {},
                callback: function (err, response) {
                    if (err || response.errorCode) {
                        CommerceSDK.printError('There was error while loging out ::', response, self.logger)
                        reject(new Error('There was error while loging out', err))
                        return
                    }
                    if (response.result === true) {
                        self.setAccessToken(null)
                        CommerceSDK.printDebugMessage(
                            'user logged out and the accessToken value is ::' + self.accessToken,
                            self.logger
                        )
                        resolve(self)
                    }
                },
            }) //end of post
        } // end of resolver function
    )
    return logoutPromise
}

/**
 * This function checks whether the current token in the current CommerceSDK
 * is valid.
 * <p>
 * @return {Promise} returns true/false based on the token validity. If the token is valid
 * 		   returns true. Otherwise false.
 *         Also retutuns Promise for asynchronous processing.
 */
CommerceSDK.prototype.isValidToken = function () {
    'use strict'
    var self = this // this instance is used in the callback function..
    CommerceSDK.printDebugMessage('Executing isValidToken', self.logger)
    var validPromise = new Promise(
        function (resolve, reject) {
            CommerceSDK.printDebugMessage('Executing valid promise', self.logger)
            var requestData = JSON.stringify({})
            self.request({
                url: '/ccadmin/v1/verify',
                method: 'post',
                data: requestData,
                callback: function (err, response) {
                    //If the auth token is invalid, we will regenerate the token. So we do not need to
                    //reject the promise. If there is a real error, then we will reject the promise.
                    //The initializing code api will re-initialize the authtoken based on the the success flag
                    if (err) {
                        CommerceSDK.printDebugMessage('There was error while trying to validate token :: ', self.logger)
                        CommerceSDK.printProperties(response, self.logger)
                        reject(new Error('There was error trying to validate token ', err))
                        return
                    }
                    var success = response.success
                    CommerceSDK.printDebugMessage('Token is validated and its validity is :: ' + success, self.logger)
                    resolve(success)
                },
            }) //end of request
        } // end of resolver function
    ) //end of promise
    return validPromise
}

/**
 * This function makes the request to the configured server
 * <p>
 * @param {object} args - required. The args object contains the following properties:
 * <UL>
 * <LI>
 * url:
 *	The url config option is used to pass the rest endpoint url.
 * </LI>
 * <LI>
 * data:
 *  The data config option is used to pass any input data needed for the endpoint.
 * </LI>
 * <LI>
 * headers:
 * 	The headers config option is used to pass in any custom headers such as
 *  'x-ccasset-language'.  This header is used to pass in any asset language that is
 *  supported by an asset.
 * </LI>
 * <LI>
 * callback:
 *	The callback config option is used to pass a callback function. The callback
 *  function is called for the error and successful case.
 * </LI>
 * </UL>
 */
CommerceSDK.prototype.request = function (args) {
    'use strict'
    var self = this
    //if a method is not provided, then use GET as a default request method.
    var requestMethod = args.method ? args.method.toLowerCase() : 'get'
    CommerceSDK.printDebugMessage('The request method is :: ' + requestMethod, self.logger)
    var requestData = args.data ? args.data : {}
    CommerceSDK.printDebugMessage('The request data value is :: ' + requestData, self.logger)
    var requestModule = getHttp(self.protocol)

    var requestOptions = {
        hostname: self.hostname,
        port: self.port,
        path: args.url,
        method: requestMethod,
        headers: {
            'Content-Type': 'application/json',
            'x-ccasset-language': 'en_US',
        },
    }

    if (self.accessToken) {
        requestOptions.headers.Authorization = 'Bearer ' + self.accessToken
    }

    if (requestMethod === 'post' || requestMethod === 'put' || requestMethod === 'delete') {
        requestOptions.headers['Content-Length'] = new Buffer(requestData).length
        CommerceSDK.printDebugMessage(
            'The content type values is :: ' + requestOptions.headers['Content-Type'],
            self.logger
        )
        CommerceSDK.printDebugMessage(
            'The content length values is :: ' + requestOptions.headers['Content-Length'],
            self.logger
        )
    }

    if (args.headers) {
        //copy headers to request options..
        for (var prop in args.headers) {
            requestOptions.headers[prop] = args.headers[prop]
        }
    }
    CommerceSDK.printDebugMessage('Setting any specical request options.', self.logger)

    if (args.requestOptions) {
        args.requestOptions(requestOptions)
    }

    CommerceSDK.printDebugMessage('The requestData is :: ' + requestData, self.logger)
    CommerceSDK.printDebugMessage('The requestOptions is :: ' + requestOptions, self.logger)

    CommerceSDK.printProperties(requestOptions, self.logger)

    var currentRequest = requestModule.request(requestOptions, function (response) {
        CommerceSDK.printDebugMessage('Made request and the response is formulated ::', self.logger)
        let jsonType = false
        let rct = response.headers['Content-Type'] || response.headers['content-type']
        if (rct) {
            jsonType = VALID_JSON_CONTENT_TYPES.includes(rct) ? true : false
        }

        if (jsonType === true) {
            response.setEncoding('utf8')
        }

        var responseData = []
        response.on('data', function (data) {
            responseData.push(data)
        })

        response.on('end', function () {
            CommerceSDK.printDebugMessage('The request is complete.', self.logger)
            var returnResponse = null

            try {
                if (responseData && jsonType === true) {
                    returnResponse = JSON.parse(responseData.join(''))
                } else {
                    returnResponse = Buffer.concat(responseData)
                }
            } catch (ex) {
                CommerceSDK.printError('there was an error while trying to parse the JSON response', ex, self.logger)
                throw new Error('Failed to parse response' + ex)
            }

            if (CommerceSDK.isErrorResponse(returnResponse) === true) {
                CommerceSDK.printDebugMessage('error is true', self.logger)
                CommerceSDK.printError('There was an error in the response.', returnResponse, self.logger)
                args.callback('There was an error in the response.', returnResponse)
            } else {
                CommerceSDK.printDebugMessage('error is false', self.logger)
                args.callback(null, returnResponse)
            }
        })

        response.on('error', function () {
            CommerceSDK.printDebugMessage('There is an error with the request', self.logger)
            CommerceSDK.printError('There was an error while trying process request', self.logger)
            throw new Error('There was an error while trying process request')
        })
    })

    if (requestMethod === 'post' || requestMethod === 'put' || requestMethod === 'delete') {
        CommerceSDK.printDebugMessage('Writing request data.', self.logger)
        currentRequest.write(requestData)
    }

    currentRequest.end()
}

/**
 * This function makes the get request.
 * @param {object} urlOptions - required. The url options required to make the request
 * @see CommerceSDK#request method for url options properties.
 * @see CommerceSDK#init option for initializing the CommerceSDK instance.
 */
CommerceSDK.prototype.get = function (urlOptions) {
    //url, method, data, header, callback
    'use strict'
    //TODO add validation for urlOptions
    if (!urlOptions) {
        throw new Error('The url options cannot be null')
    }

    var data = urlOptions.data

    if (data) {
        var appendChar = urlOptions.url.indexOf('?' === -1) ? '?' : '&'
        urlOptions.url = urlOptions.url + appendChar + CommerceSDK.stringifyQueryString(data)
        urlOptions.data = null
    }
    var self = this
    urlOptions.method = 'GET'
    var initPromise = self.init(urlOptions.url)
    initPromise
        .then(function (success) {
            if (success === true) {
                self.request(urlOptions)
            }
        })
        .catch(function (err) {
            CommerceSDK.printError('There was an error while trying to execute get request ::', err, self.logger)
            urlOptions.callback('There was an error while trying to execute get request.', err)
            return
        })
}

/**
 * This function makes the post request.
 * @param {object} urlOptions - required. The url options required to make the request
 * @see CommerceSDK#request method for url options properties.
 * @see CommerceSDK#init option for initializing the CommerceSDK instance.
 */
CommerceSDK.prototype.post = function (urlOptions) {
    'use strict'
    var self = this
    if (!urlOptions) {
        throw new Error('The url options cannot be null')
    }

    if (!urlOptions.data) {
        urlOptions.data = {}
    }
    urlOptions.method = 'POST'
    var initPromise = self.init(urlOptions.url)

    initPromise
        .then(function (success) {
            if (success === true) {
                urlOptions.data = JSON.stringify(urlOptions.data)

                self.request(urlOptions)
            }
        })
        .catch(function (err) {
            CommerceSDK.printError('There was an error while trying to execute post', err, self.logger)
            urlOptions.callback(new Error('There was an error while trying to execute post request ', err), null)
            return
        })
}

/**
 * This function makes the put request.
 * @param {object} urlOptions - required. The url options required to make the request
 * @see CommerceSDK#request method for url options properties.
 * @see CommerceSDK#init option for initializing the CommerceSDK instance.
 */
CommerceSDK.prototype.put = function (urlOptions) {
    'use strict'
    var self = this
    if (!urlOptions) {
        throw new Error('The url options cannot be null')
    }

    if (!urlOptions.data) {
        urlOptions.data = {}
    }
    urlOptions.method = 'PUT'
    var initPromise = self.init(urlOptions.url)

    initPromise
        .then(function (success) {
            if (success === true) {
                urlOptions.data = JSON.stringify(urlOptions.data)
                self.request(urlOptions)
            }
        })
        .catch(function (err) {
            CommerceSDK.printError('There was an error while trying to execute put', err, self.logger)
            urlOptions.callback(new Error('There was an error while trying to execute put request ', err), null)
            return
        })
}

/**
 * This function makes the delete request.
 * @param {object} urlOptions - required. The url options required to make the request
 * @see CommerceSDK#request method for url options properties.
 * @see CommerceSDK#init option for initializing the CommerceSDK instance.
 */
CommerceSDK.prototype.delete = function (urlOptions) {
    'use strict'
    var self = this
    if (!urlOptions) {
        throw new Error('The url options cannot be null')
    }

    if (!urlOptions.data) {
        urlOptions.data = {}
    }
    urlOptions.method = 'DELETE'
    var initPromise = self.init(urlOptions.url)

    initPromise
        .then(function (success) {
            if (success === true) {
                urlOptions.data = JSON.stringify(urlOptions.data)
                self.request(urlOptions)
            }
        })
        .catch(function (err) {
            CommerceSDK.printError('There was an error while trying to execute delete', err, self.logger)
            urlOptions.callback(new Error('There was an error while trying to execute delete request ', err), null)
            return
        })
}

/**
 * This function initializes the SDK.
 * <p>
 * If the SDK is configured as a public SDK, this function skips the initialization.
 * Alternatively if the SDK is configured as a third party application, then this SDK
 * login for the first time and for the remainder of the time, it checks the access token.
 * if the access token is invalid, the SDK refreshes or re-login based on the application key.
 * otherwise continues with the desired request.
 * <p>
 * @param {String} endpoint The rest end point url
 * @return returns Promise for asynchronous processing
 *         Once the prmoise is resolved, this function returns
 *         either true or false based on the successful initialization.
 *         If the initialization is successful, returns true;false otherwise
 */
CommerceSDK.prototype.init = function (endpoint) {
    'use strict'
    var self = this
    CommerceSDK.printDebugMessage('Executing init', self.logger)
    //take the context from the endpoint
    //if the applicationKey exists, then check authToken?
    //if auth_token exists, is it valid, if it is not valid, relogin and
    //get the token and set it in the object.
    //Then make the request.
    //if the token is valid, then proceed. If not relogin to

    var initPromise = new Promise(function (resolve, reject) {
        CommerceSDK.printDebugMessage('Executing init promise', self.logger)

        if (!self.applicationKey) {
            CommerceSDK.printDebugMessage('Init : SDK is setup as a public api.', self.logger)
            resolve(true)
        }

        //if the application context is null, then parse the endpoint url and
        //set the application context.
        if (!self.applicationContext) {
            var endpointParts = endpoint.split('/')
            CommerceSDK.printDebugMessage('Init : Endpoint parts :: ' + endpointParts, self.logger)
            self.applicationContext = '/' + endpointParts[1]
            CommerceSDK.printDebugMessage('Init : Setting applicaion context.', self.logger)
        }

        CommerceSDK.printDebugMessage('Init : access token value is :: ' + self.accessToken, self.logger)
        if (!self.accessToken) {
            var loginPromise = self.login()
            loginPromise
                .then(function (lp) {
                    // jshint ignore:line
                    resolve(true)
                })
                .catch(function (err) {
                    CommerceSDK.printError('There was an error while trying to initialize ', err, self.logger)
                    reject(false)
                })
        } else {
            var tokenPromise = self.isValidToken()
            tokenPromise
                .then(function (success) {
                    if (success === true) {
                        CommerceSDK.printDebugMessage('Init : Auth token is valid. Do nothing!!!', self.logger)
                        resolve(true)
                    } else {
                        let loginPromise = self.login()
                        loginPromise
                            .then(function (lp) {
                                // jshint ignore:line
                                resolve(true)
                            })
                            .catch(function (err) {
                                CommerceSDK.printError(
                                    'There was an error while trying to initialize ',
                                    err,
                                    self.logger
                                )
                                reject(false)
                            })
                    }
                })
                .catch(function (err) {
                    CommerceSDK.printError(
                        'There was an error while trying to initialize and trying to fix it ',
                        err,
                        self.logger
                    )
                    let loginPromise = self.login()
                    loginPromise
                        .then(function (lp) {
                            // jshint ignore:line
                            resolve(true)
                        })
                        .catch(function (err) {
                            CommerceSDK.printError('There was an error while trying to initialize ', err, self.logger)
                            reject(false)
                        })
                })
        }
    })
    return initPromise
} // end of init

/**
 * Utility function to find out whether response contains an error or not
 * @param JSON response
 * @returns {boolean} return true if this is an error response;otherwise false.
 */
CommerceSDK.isErrorResponse = function (response) {
    'use strict'
    if (response) {
        if (response.errorCode || response.error) {
            return true
        }
    }
    return false
}

/**
 * Utility function to log debug message to the logger. By default this logs to the
 * console.
 */
CommerceSDK.printDebugMessage = function (message) {
    'use strict'
    sdkDebugLog(message)
}

/**
 * Utility function to log error message and object to the logger. By default this logs to the
 * console.
 */
CommerceSDK.printError = function (message, error) {
    'use strict'
    if (message) {
        //console.log will be sent to the system logger. So ignoring the
        //passed logger and sending it to console.log
        console.error(message)
    }

    if (error) {
        console.error('%j', error)
    }
}

/**
 * Utility function to print out object properties.
 * @param obj The object to be printed
 * @return Prints out to the logger
 */
CommerceSDK.printProperties = function (obj) {
    'use strict'
    sdkDebugLog('%j', obj)
}

export default CommerceSDK
