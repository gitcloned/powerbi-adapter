
const assert = require("assert")


describe('PowerBI Groups', function () {

    before(function (done) {

        require('https').globalAgent.options.ca = require('ssl-root-cas/latest').create();
        process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0
    
        require("./stubs/PowerBI")((err, stub) => {
    
            if (err) return done(err)

            this.powerbi = stub
            done(null)
        })
    });

    describe("groups request", function () {

        it("should return a Promise", function () {

            let groupRequest = this.powerbi.groups()
            assert(groupRequest instanceof Promise, "Embed Token request didnt returned a promise")

            this.groupRequest = groupRequest
        })

        it("should return list of groups", function (done) {

            this.groupRequest
                .then(groups => {

                    assert.notEqual(groups, null)
                    assert(typeof groups == "object", "response is not object")
                    assert(groups.value instanceof Array, "response does not have 'value' as Array")

                    done()
                })
                .catch(done)
        })
    })
});