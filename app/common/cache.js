
var redis  = require('./redis')
var logger = require('./logger')(__filename.replace(__dirname, ''))
var _      = require('lodash')

var get = function *(key) {
    var t = new Date()
    var data = yield redis.get(key)

    if (!data) {
        return null
    }
    data = JSON.parse(data)
    var duration = (new Date() - t)
    logger.debug(`Cache get ${key},data : ${JSON.stringify(data)} , ${duration} ms`)

    return data
}

exports.get = get

//time 参数可选，秒为单位
var set = function *(key, value ,time) {
    var t = new Date()

    value = JSON.stringify(value)

    if (!time) {
        yield redis.set(key, value)
    } else {
        yield redis.setex(key, time, value)
    }
    var duration = (new Date() - t)
    logger.debug(`Cache set ${key} ,value : ${value}, ${duration} ms`)
}

exports.set = set