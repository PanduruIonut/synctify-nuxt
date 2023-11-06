module.exports = {
    apps: [{
        name: 'Synctify',
        port: '3131',
        exec_mode: 'cluster',
        instances: 'max',
        script: './.output/server/index.mjs'
    }]
}