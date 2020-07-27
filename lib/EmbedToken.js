
const Token = require("./Token")

class EmbedToken extends Token {

    /**
     * 
     * @param {String} name name of the token
     * @param {Array} datasets List of datasets, this token has access to
     * @param {Reports} reports list of reports, this token has access to
     * @param {String} accessToken access token
     * @param {String} scope scope
     * @param {Date} expiration expiration datetime
     * @param {String} refresh_token related refresh token
     */
    constructor (accessToken, scope, expiresIn, refresh_token) {

        super(accessToken, scope, expiresIn, refresh_token)
    }
}

module.exports = EmbedToken