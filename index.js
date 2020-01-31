const config = require('./config.js')
const UpdownClient = require('node-updown').UpdownClient
const updown = new UpdownClient(config.apiKey)
const express = require('express')
const app = express()
const nunjucks = require('nunjucks')
const moment = require('moment')
const LRU = require('lru-cache')
const cache = new LRU(config.cache) 
const debug = require('debug')('dash')

nunjucks.configure('views', {
    autoescape: true,
    express: app,
	noCache: process.env.NODE_ENV === 'dev'
})

app.set('views', __dirname + '/views')
app.set('view engine', 'html')
app.use(express.static('public'))

getToken = async (token) => {
    return new Promise(async (resolve, reject) => {
        let data = cache.get(token)
        let metrics = cache.get(token + '-metrics')
        let downtimes = cache.get(token + '-downtimes')
        try {
            // check the cache
            // get status
            if (!data) {
                debug('Data for ' + token + ' not in cache')
                data = await updown.getCheck(token)
                // cache for a minute
                cache.set(token, data, 60000)
            }
            // get metrics for last 24 hours
            if (!metrics) {
                debug('Metrics for ' + token + ' not in cache')
                metrics = await updown.getMetrics(token, { 
                    from: moment().subtract(1, 'days').format('YYYY-MM-DDTHH:00:00'),
                    to: moment().add(1, 'hours').format('YYYY-MM-DDTHH:00:00')
                })
                // cache for an hour
                cache.set(token + '-metrics', metrics, 3600000)
            }

            // get latest 100 downtimes
            if (!downtimes) {
                debug('Downtimes for ' + token + ' not in cache')
                downtimes = await updown.getDowntimes(token);
                // if down then only cache for a minute, else cache for an hour
                let ttl = data.down ? 60000 : 3600000
                cache.set(token + '-downtimes', downtimes, ttl) 
            }

            data.metrics = metrics
                
            if (data.down) {
                data.alert = 'danger'
            } else if (data.metrics.apdex < 1) {
                data.alert = 'warning'
            } else {
                data.alert = 'success'
            }

            data.downtimes = downtimes
            resolve(data)
        } catch (e) {
            reject(e)
        }
       
    })
}

app.get(/^\/([a-z0-9]+)$/, async (req, res) => {
    let checks = []
    let url = req.params[0]
    let promises = [];
    if (!config.urls[url]) {
        return res.sendStatus(404)
    }

    try {
        for(token of config.urls[url].tokens) {
            promises.push(getToken(token))
        }
        checks = await Promise.all(promises)
        // sort depending on down, poor apdex, all ok
        checks.sort((a, b) => {
            let anum, bnum
            anum = a.alert === 'danger' ? 0 : a.alert === 'warning' ? 1 : 2
            bnum = b.alert === 'danger' ? 0 : b.alert === 'warning' ? 1 : 2
            if (anum === 1 && bnum === 1) {
                return a.metrics.apdex - b.metrics.apdex
            }
            return anum - bnum
        })
    } catch (e) {
        console.log(e)
        return res.sendStatus(500);
    }
    res.render('dash.html', { checks: checks })
});

app.listen(config.port, config.host, () => {
    console.log('Server listening on ' + config.host + ':' + config.port)
})
