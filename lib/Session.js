
const Token = require('./Token')
const request = require("request")

class Session {

    constructor(credentials, options) {
        this.credentials = credentials
        this.options = options

        this._grant_type = options.grantType || "password"
        this.token = null
    }

    login() {

        if (this.token && !this.token.isExpired())
            return Promise.resolve(this.token)

        let form = {
            'client_id': this.credentials.clientId,
            'resource': this.options.resource || 'https://analysis.windows.net/powerbi/api',
            'grant_type': this._grant_type
        }

        if (this._grant_type == "password") {
            form['username'] = this.credentials.username
            form['password'] = this.credentials.password
        } else if (this._grant_type == "client_credentials") {
            form['client_secret'] = this.credentials.clientSecret
        }

        let options = {
            'method': 'POST',
            'url': 'https://login.microsoftonline.com/common/oauth2/token',
            'headers': {
                'Content-Type': 'application/x-www-url-form-urlencoded'
            },
            form
        };

        return new Promise((resolve, reject) => {

            request(options, function (error, response) {

                if (error) return reject(error)

                if (response.statusCode >= 200 && response.statusCode < 300) {

                    let result = null
                    try { result = JSON.parse(response.body) } catch (e) { error = e }

                    if (error) return reject(error)
                    return resolve(result)
                }

                reject({
                    statusCode: response.statusCode,
                    body: response.body
                })
            })
        })
            .then(result => {

                this.token = new Token(result.access_token, result.scope, result.expires_in, result.refresh_token)
                return this.token
            })
    }
}

module.exports = Session