# updown.io dashboard

This is a dashboard for updown.io the config file config.js (see `example-config.js` for example settings) 
allows you to specify a url which when accessed will probe the checks on updown.io and display a page 
showing the status, apdex and last downtime.

## Install

1. Clone this repo
2. Run npm i
3. Create your `config.js` file
4. Run node index.js

Or use the Docker image

```sh
docker run \
-v $PWD/config.js:/app/config.js \
-e NODE_ENV=production \
-p 3000:3000 \
--name updown-dash \
--restart always \
rwky/updownio-dash
```
