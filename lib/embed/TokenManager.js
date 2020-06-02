
const Token = require('../Token')
const EmbedToken = require('../EmbedToken')

class TokenManager {

    constructor() {

        this._tokens = {}
    }

    tokenBuilder() {
        return new TokenBuilder(this)
    }

    getToken(tokenKey) {

        let token = null

        let path = this._tokens
        for (let i = 0; i < tokenKey.length; i++) {
            if (path[tokenKey[i]]) {
                path = path[tokenKey[i]]
            } else {
                break;
            }
        }

        if (path instanceof Token) {
            token = path
        }

        return token
    }
}

module.exports = TokenManager

// TODO: add identities support (https://docs.microsoft.com/en-us/rest/api/power-bi/embedtoken/generatetoken#generate-embedtoken-for-two-datasets-with-rls-identities-and-a-single-report-with-read-only-permissions.-this-token-allows-to-view-the-report-dynamically-bound-to-two-different-datasets)
class TokenBuilder {

    constructor(manager) {

        this.manager = manager

        this._payload = {}
    }

    tokenKey() {

        let key0 = [], key1 = [], key2 = []

        if (this._payload.targetWorkspaces) {
            let workspaces = this._payload.targetWorkspaces
            workspaces.forEach(elem => {
                key0.push(elem.id)
            })
        } else {
            key0.push("-")
        }

        if (this._payload.datasets) {
            let datasets = this._payload.datasets
            datasets.forEach(elem => {
                key1.push(elem.id)
            })
        } else {
            key1.push("-")
        }

        if (this._payload.reports) {
            let reports = this._payload.reports
            reports.forEach(elem => {
                key2.push(`${elem.id}/${elem.allowEdit}`)
            })
        } else {
            key2.push("-")
        }

        return [key0.join(";"), key1.join(";"), key2.join(";")]
    }

    forGroups(groups) {

        let targetWorkspaces = []

        if (typeof groups == "string") {
            groups.split(",").forEach(elem => {
                targetWorkspaces.push({
                    "id": elem
                })
            })
        } else if (Array.isArray(groups)) {
            groups.forEach(elem => {
                if (elem.id) {
                    targetWorkspaces.push({
                        "id": elem.id
                    })
                }
            })
        } else {
            return;
        }

        this._payload["targetWorkspaces"] = targetWorkspaces
    }

    forReports(reports) {

        let _reports = []

        if (typeof reports == "string") {
            reports.split(",").forEach(elem => {
                _reports.push({
                    "id": elem
                })
            })
        } else if (Array.isArray(reports)) {
            reports.forEach(elem => {
                if (elem.id) {
                    _reports.push({
                        "id": elem.id,
                        "allowEdit": elem.allowEdit == true
                    })
                }
            })
        } else {
            return;
        }

        this._payload["reports"] = _reports
    }

    forDatasets(datasets) {

        let _datasets = []

        if (typeof datasets == "string") {
            datasets.split(",").forEach(elem => {
                _datasets.push({
                    "id": elem
                })
            })
        } else if (Array.isArray(datasets)) {
            datasets.forEach(elem => {
                if (elem.id) {
                    _datasets.push({
                        "id": elem.id
                    })
                }
            })
        } else {
            return;
        }

        this._payload["datasets"] = _datasets
    }

    token(accessToken, params) {

        let tokenKey = this.tokenKey()
        let token = this.manager.getToken(tokenKey)

        if (token && !token.isExpired())
            return Promise.resolve(token)

        return this.generate(accessToken, params)
        .then(token => {

            this.manager.setToken(tokenKey, token)
            return token
        })
    }

    generate(accessToken, params) {

        const url = `https://api.powerbi.com/v1.0/myorg/GenerateToken`

        let form = {}

        if (params.accessLevel)
            form.accessLevel = params.accessLevel

        let options = {
            'method': 'POST',
            'url': url,
            'headers': {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Bearer ' + accessToken.token()
            },
            form
        }

        return new Promise((resolve, reject) => {

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
        }).then(result => {

            this.token = new EmbedToken(result.token, null, result.expiration, null)
            return this.token
        })
    }
}