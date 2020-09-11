
const assert = require("assert")


describe('PowerBI Embed Token', function () {

    before(function (done) {

        require('https').globalAgent.options.ca = require('ssl-root-cas/latest').create();
        process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0

        require("dotenv").config()
        if (!process.env.POWERBI_TEST_WORKSPACE_ID) return done("specify POWERBI_TEST_WORKSPACE_ID to run this test")
        if (!process.env.POWERBI_TEST_DATASET_ID) return done("specify POWERBI_TEST_WORKSPACE_ID to run this test")
    
        require("./stubs/PowerBI")((err, stub) => {
    
            if (err) return done(err)

            this.powerbi = stub
            done(null)
        })
    });

    describe("embed token request", function () {

        it("should return a Promise", function () {

            let tokenRequest = this.powerbi.embedToken({
                "report": process.env.POWERBI_TEST_REPORT_ID,
                "group": process.env.POWERBI_TEST_WORKSPACE_ID
            })
            assert(tokenRequest instanceof Promise, "Embed Token request didnt returned a promise")

            this.tokenRequest = tokenRequest
        })

        it("should return a valid token", function (done) {

            this.timeout(5000000);

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



        it("should return a valid token, even after the access token is expired", function (done) {

            this.timeout(5000000);

            // this.powerbi.session.token.expiry = new Date("01/01/2000").valueOf() / 1000
            this.powerbi.session.token.accessToken = "bad value"

            let tokenRequest = this.powerbi.embedToken({
                "report": process.env.POWERBI_TEST_REPORT_ID,
                "group": process.env.POWERBI_TEST_WORKSPACE_ID
            })

            tokenRequest
                .then(token => {

                    assert.notEqual(token, null)
                    assert.equal(token.isExpired(), false)
                    assert(token.token())

                    this.tokenObject = token

                    done()
                })
                .catch((error) => {
                    done(error)
                })
        })
    })
});