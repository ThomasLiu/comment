
const redisConfig = require('../../config/redis')
var Redis = require('ioredis')
var logger = require('./logger')(__filename.replace(__dirname, ''))

var client = new Redis(redisConfig)

client.on('error', function (err) {
    if (err) {
        logger.error('connect to redis error, check your redis config', err)
        process.exit(1)
    }
})

exports = module.exports = client
