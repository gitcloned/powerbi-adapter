
const assert = require("assert")


describe('PowerBI Token', function () {

    before(function (done) {

        require('https').globalAgent.options.ca = require('ssl-root-cas/latest').create();
        process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0
    
        require("./stubs/PowerBI")((err, stub) => {
    
            if (err) return done(err)

            this.powerbi = stub
            done(null)
        })
    });

    describe("token request", function () {

        it("should return a Promise", function () {

            let tokenRequest = this.powerbi.token()
            assert(tokenRequest instanceof Promise)

            this.tokenRequest = tokenRequest
        })

        it("should return a valid token", function (done) {

            this.tokenRequest
                .then(token => {

                    assert.notEqual(token, null)
                    assert.equal(token.isExpired(), false)
                    assert(token.token())

                    this.tokenObject = token

                    done()
                })
                .catch(done)
        })

        it("should return expired after expiry", function () {

            this.tokenObject.expiry = new Date("01/01/2000").valueOf() / 1000
            assert(this.tokenObject.isExpired() == true)
        })

        it("should create a new token after expiry, and should not return same", function (done) {

            this.powerbi
                .token()
                .then(token => {

                    assert.notEqual(token, null)
                    assert.notEqual(token.token(), this.tokenObject.token())
                    this.tokenObject2 = token

                    done()
                })
                .catch(done)
        })

        it("new token should not already be expired", function () {

            assert.equal(this.tokenObject2.isExpired(), false)
        })
    })
});