const config = require('./config.js')
const express = require('express')
const axios = require('axios')
const path = require('path')
const app = express()
app.use(express.static('public'))

app.get('/api/checks/', async (req, res) => {
    let apiKey = req.query['api-key'];
    res.header('Access-Control-Allow-Origin','*')
    if (!config.internalApiKeys[apiKey]) {
        return res.sendStatus(404)
    }
    let checks = await axios.get('https://updown.io/api/checks?api-key=' + config.apiKey);
    checks = checks.data.filter((check) => {
        return config.internalApiKeys[apiKey].indexOf(check.token) !== -1
    })
    res.json(checks)
});

app.get('/:apiKey', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'))
})


app.listen(config.port, config.host, () => {
    console.log('Server listening on ' + config.host + ':' + config.port)
})
