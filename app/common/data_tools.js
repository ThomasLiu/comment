
const cache = require('./cache')
const logger = require('./logger')(__filename.replace(__dirname, ''))

const api = require('./api')


var getSupportValue = function *(model,id) {
    var key = `${model}-${id}`
    var value = yield cache.get(key)
    if (value) {
        return value
    }

    var url = `${Config.api.support}/api/supports/${model}/${id}`
    var {err, json} = yield api.request({url:url})
    if (err) {
        logger.error(`${url} err: ${JSON.stringify(err)}`)
    } else if (json && json.data.result) {
        value = json.data.result.title
        yield cache.set(key, value , 3600 * 24)
    } else {
        logger.error(`${url} err: ${json.data.message}`)
    }

    return value
}

exports.getSupportValue = getSupportValue

var toList = function *(list,table,idField,field){
    var returnList = new Array()
    for (var index in list) {
        var item = list[index]
        var id = item[idField]
        var value = yield getValue(table, id, field)

        var obj = {
            [idField] : id,
            [field] : value
        }
        returnList.push(obj)
    }
    return returnList
}

exports.toList = toList