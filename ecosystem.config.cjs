module.exports = {
    apps: [{
        name: 'Synctify',
        port: '15298',
        exec_mode: 'cluster',
        instances: 'max',
        script: './.output/server/index.mjs'
    }]
}