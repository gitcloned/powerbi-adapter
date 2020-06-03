
const assert = require("assert")


describe('PowerBI Datasets', function () {

    before(function (done) {

        require('https').globalAgent.options.ca = require('ssl-root-cas/latest').create();
        process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0

        require("dotenv").config()
        if (!process.env.POWERBI_TEST_WORKSPACE_ID) return done("specify POWERBI_TEST_WORKSPACE_ID to run this test")
    
        require("./stubs/PowerBI")((err, stub) => {
    
            if (err) return done(err)

            this.powerbi = stub
            done(null)
        })
    });

    describe("datasets request", function () {

        it("should return a Promise", function () {

            let datasetsRequest = this.powerbi.datasets(process.env.POWERBI_TEST_WORKSPACE_ID)

            assert(datasetsRequest instanceof Promise, "Embed Token request didnt returned a promise")

            this.datasetsRequest = datasetsRequest
        })

        it("should return list of datasets in a group", function (done) {

            this.datasetsRequest
                .then(datasets => {

                    console.log(datasets)

                    assert.notEqual(datasets, null)
                    assert(typeof datasets == "object", "response is not object")
                    assert(datasets.value instanceof Array, "response does not have 'value' as Array")

                    done()
                })
                .catch(done)
        })
    })
});