
class Token {

    /**
     * 
     * @param {String} accessToken access token
     * @param {CSV} scope Scope for which access is provided
     * @param {Number} expiry access token expires at date value in number (with milliseconds)
     */
    constructor (accessToken, scope, expiry, refresh_token) {

        this.accessToken = accessToken
        this.scope = scope
        this.expiry = expiry
        
        // if (isNaN(this.expiresIn))
        //     this.expiresIn = 60 * 60 - 1

        // this.iat = new Date().valueOf() / 1000
    }

    isExpired() {

        let val = (new Date().valueOf() / 1000) - (60) // for clock drift

        // return this.iat + this.expiresIn < val
        return this.expiry < val.valueOf()
    }

    token () {

        return this.accessToken
    }
}

module.exports = Token