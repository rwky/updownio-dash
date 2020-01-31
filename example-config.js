module.exports = {
    host: '127.0.0.',
    port: 3000,
    cache: {
        length: 268435456,
        maxAge: 3600000,
        length: (n, key) => { return JSON.stringify(n.length) }
    },
    apiKey: 'yourapikey',
    urls: {
        somerandomstring: {
            tokens: [
                'token1',
                'token2',
            ]       
        }
    }
}
