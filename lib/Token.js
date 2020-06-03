
class Token {

    /**
     * 
     * @param {String} accessToken access token
     * @param {CSV} scope Scope for which access is provided
     * @param {Number} expiresIn access token expires in provided seconds
     */
    constructor (accessToken, scope, expiresIn, refresh_token) {

        this.accessToken = accessToken
        this.scope = scope
        this.expiresIn = parseInt(expiresIn || (60 * 60 - 1)) // 1 hour
        
        if (isNaN(this.expiresIn))
            this.expiresIn = 60 * 60 - 1

        this.iat = new Date().valueOf() / 1000
    }

    isExpired() {

        let val = new Date().valueOf() / 1000

        return this.iat + this.expiresIn < val
    }

    token () {

        return this.accessToken
    }
}

module.exports = Token