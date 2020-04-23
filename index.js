
const Session = require("./lib/Session")
const request = require("request")

class PowerBI {

    constructor(credentials, options) {

        this.session = new Session(credentials, options)
    }

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
                        'Authorization': 'Bearer ' + token.accessToken
                    }
                };

                return this.api(options)
            })
    }

    data(e, user, params, callback) {

        if (!params.type) return callback("Please specify 'type' to fetch data for")

        if (params.type == "groups") return this.groups(params.group).then(result => callback(null, result)).catch(callback)

        else if (params.type == "datasets") return this.datasets(params.group, params.dataset, params.path).then(result => callback(null, result)).catch(callback)

        else if (params.type == "datasources") return this.datasources(params.dataset, params.group, params.datasource, params.path).then(result => callback(null, result)).catch(callback)

        else if (params.type == "reports") return this.reports(params.group, params.report, params.path).then(result => callback(null, result)).catch(callback)

        else if (params.type == "gateways") return this.gateways(params.gateway, params.path).then(result => callback(null, result)).catch(callback)

        callback(`Invalid type: "${params.type}". Only "groups", "datasets", "datasources" and "reports" is supported`)
    }

    embedToken(e, user, params, callback) {

        let group = params.group
        let report = params.report
        let dataset = params.dataset

        let url = `https://api.powerbi.com/v1.0/myorg/GenerateToken`

        if (group) {
            url = `https://api.powerbi.com/v1.0/myorg/groups/${group}/reports/GenerateToken`
        }

        if (report || dataset) {
            if (!group) return callback('Specify "group" if to create embed token for report or dataset')
        }

        if (report) {
            url = `https://api.powerbi.com/v1.0/myorg/groups/${group}/reports/${report}/GenerateToken`
        } else if (dataset) {
            url = `https://api.powerbi.com/v1.0/myorg/groups/${group}/datasets/${dataset}/GenerateToken`
        }

        this
            .session
            .login()
            .then(token => {

                let options = {
                    'method': 'POST',
                    'url': url,
                    'headers': {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': 'Bearer ' + token.accessToken
                    },
                    form: {
                        'accessLevel': 'View'
                    }
                }

                this.api(options).then(result => callback(null, result.token)).catch(err => {
                    console.log(err)
                    callback(err)
                })
            })
            .catch(callback)
    }
}
module.exports = PowerBI