
const Session = require("./lib/Session")
const request = require("request")

const EmbedTokenManager = require("./lib/embed/TokenManager")

class PowerBI {

    constructor(credentials, options) {

        this.session = new Session(credentials, options)

        this.embedTokenManager = new EmbedTokenManager()
    }

    /**
     * Hits power bi rest API using specified request options
     * @param {JSON} options power bi rest api `request` options
     */
    api(options) {

        return new Promise((resolve, reject) => {

            console.log(options.url)

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
    }

    gateways(gateway) {

        return this
            .session
            .login()
            .then(token => {

                let url = `https://api.powerbi.com/v1.0/myorg/gateways`

                if (gateway)
                    url = `${url}/${gateway}`

                let options = {
                    'method': 'GET',
                    'url': url,
                    'headers': {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': 'Bearer ' + token.accessToken
                    }
                };

                return this.api(options)
            })
    }

    groups(group, path) {

        return this
            .session
            .login()
            .then(token => {

                let url = `https://api.powerbi.com/v1.0/myorg/groups`

                if (group)
                    url = `${url}/${group}`

                if (path)
                    url = `${url}/${path}`

                let options = {
                    'method': 'GET',
                    'url': url,
                    'headers': {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': 'Bearer ' + token.accessToken
                    }
                };

                return this.api(options)
            })
    }

    datasets(group, dataset, path) {

        return this
            .session
            .login()
            .then(token => {

                let url = `https://api.powerbi.com/v1.0/myorg/datasets`

                if (group) {
                    url = `https://api.powerbi.com/v1.0/myorg/groups/${group}/datasets`
                }

                if (dataset)
                    url = `${url}/${dataset}`

                if (path)
                    url = `${url}/${path}`

                let options = {
                    'method': 'GET',
                    'url': url,
                    'headers': {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': 'Bearer ' + token.accessToken
                    }
                };

                return this.api(options)
            })
    }

    datasources(dataset, group, gateway, datasource, path) {

        if (!dataset) return Promise.reject('Invalid "datasources" request. No "dataset" specified')

        return this
            .session
            .login()
            .then(token => {

                let url = `https://api.powerbi.com/v1.0/myorg/datasets/${dataset}/datasources`

                if (group) {
                    url = `https://api.powerbi.com/v1.0/myorg/groups/${group}/datasets/${dataset}/datasources`
                } else if (gateway) {
                    url = `https://api.powerbi.com/v1.0/myorg/gateways/${gateway}/datasources`
                }

                if (datasource)
                    url = `${url}/${datasource}`

                if (path)
                    url = `${url}/${path}`

                let options = {
                    'method': 'GET',
                    'url': url,
                    'headers': {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': 'Bearer ' + token.accessToken
                    }
                };

                return this.api(options)
            })
    }

    reports(group) {

        return this
            .session
            .login()
            .then(token => {

                let url = `https://api.powerbi.com/v1.0/myorg/reports`

                if (group) {
                    url = `https://api.powerbi.com/v1.0/myorg/groups/${group}/reports`
                }

                let options = {
                    'method': 'GET',
                    'url': url,
                    'headers': {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': 'Bearer ' + token.token()
                    }
                };

                return this.api(options)
            })
    }

    token() {

        return this
            .session
            .login()
    }

    embedToken(params) {

        params = params || {}

        let group = params.group
        let report = params.report
        let dataset = params.dataset

        let tokenBuilder = this
            .embedTokenManager
            .tokenBuilder();

        if (group)
            tokenBuilder.forGroups(group)

        if (report)
            tokenBuilder.forReports(report)

        if (dataset)
            tokenBuilder.forDatasets(dataset)

        return this
            .session
            .login()
            .then(token => {

                return tokenBuilder
                    .token(token, params)
            })
    }
}
module.exports = PowerBI