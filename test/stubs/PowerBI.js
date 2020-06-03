
const PowerBI = require("../../powerbi")

module.exports = (done) => {

    let config = require("dotenv").config()

    if (!process.env.POWERBI_USERNAME) return done("cannot find power bi username")

    if (!process.env.POWERBI_PASSWORD) return done("cannot find power bi password")

    if (!process.env.POWERBI_APP_CLIENT_ID) return done("cannot find power bi app client id")

    let credentials = {
        "username": process.env.POWERBI_USERNAME,
        "password": process.env.POWERBI_PASSWORD,
        "clientId": process.env.POWERBI_APP_CLIENT_ID
    }

    let powerbi = new PowerBI(credentials, {})

    return done(null, powerbi)
}