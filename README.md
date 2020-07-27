
# Power BI Adapter

Power BI Adapter provides a simple NodeJS API construct to interact with [PowerBI Rest APIs](https://docs.microsoft.com/en-us/rest/api/power-bi/)

### Installation

```shell
npm i powerbi-adapter
```

### Usage

```javascript

const PowerBI = require("powerbi-adapter")

let credentials = {
    "clientId": "<specify client id here>",
    "username": "<specify username here>",
    "password": "<specify password here>"
}

let options = {}

let powerBI = new PowerBI(credentials, options)

// query available groups in Power BI
powerBI.groups()
    .then (groups => {

        console.log(groups)
    })
    .catch(err => {

        // handle err
        console.error(err)
    })

```