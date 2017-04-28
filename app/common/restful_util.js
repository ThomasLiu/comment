"use strict"
const apiFormat = require('./res_api_format')
const logger = require('../common/logger')(__filename.replace(__dirname, ''))


exports.list = function *({model, where, page, sort, limit = Config.list_count, attributes}){
    page = parseInt(page, 10) || 1
    page = page > 0 ? page : 1
    limit = parseInt(limit)

    // if (sort) {
    //     sort = JSON.parse(sort)
    // }

    var data = {
        success: false,
        message: 'Enjoy your data!'
    }

    var result = yield model.findAndCountAll({
        where : where,
        offset: (page - 1) * limit,
        limit: limit,
        sort: sort,
        field: attributes
    })

    data.success = true

    data.result = result
    return apiFormat.api(data)
}

exports.create = function *({body, getEditError, create}){
    var editError = getEditError(body)
        
    var data = {
        success: false,
        message: 'Enjoy your data!'
    }
    

    if (!editError) {
        try {
            var obj = yield create(body)
            data.result = obj
        } catch(err) {
            logger.error(`create err : ${err}`)
            editError = err.message
        }
    }

    if (editError) {
        data.message = editError
        return apiFormat.api_error(data)
    } else {
        data.success = true
        return apiFormat.api(data)
    }
}

exports.show = function *({model, id, json, appSecretId}){
    var data = {
        success: false,
        message: 'Enjoy your data!'
    },
    editError

    var obj = yield model.findById(id)

    if (!obj) {
        editError = 'no this data'
    }

    if (!editError) {
        editError = yield _checkAuth(obj, appSecretId)
    }

    if (editError) {
        data.message = editError
        return apiFormat.api_error(data)
    } else {
        data.success = true
        data.result = json(obj)
        return apiFormat.api(data)
    }
}

exports.update = function *({body, id, getEditError, update, model, appSecretId}){
    var editError = getEditError(body)

    var data = {
        success: false,
        message: 'update success!'
    }

    var old = yield model.findById(id)

    if (!editError) {
        editError = yield _checkAuth(old, appSecretId)
    }

    if (!editError) {
        try {
            var obj = yield update(body, id)
            data.result = obj
        } catch(err) {
            logger.error(`update err : ${err}`)
            editError = err.message
        }
    }

    if (editError) {
        data.message = editError
        return apiFormat.api_error(data)
    } else {
        data.success = true
        return apiFormat.api(data)
    }
}

exports.destroy = function *({model, id, appSecretId, updateCount}){
    var editError
    var data = {
        success: false,
        message: 'delete success!'
    }

    var old = yield model.findById(id)

    if (!editError) {
        editError = yield _checkAuth(old, appSecretId)
    }

    try {
        yield model.destroy({
                _id: id
            })
    } catch(err) {
        logger.error(`destroy err : ${err}`)
        editError = err.message
    }

    if (!editError && updateCount) {
        yield updateCount(old)
    }

    if (editError) {
        data.message = editError
        return apiFormat.api_error(data)
    } else {
        data.success = true
        return apiFormat.api(data)
    }
}

var _checkAuth = function *(obj, appSecretId){
    var isNotEq = `${obj.appSecretId}` !== `${appSecretId}`
    logger.debug(`${obj.appSecretId} !== ${appSecretId} : ${isNotEq}`)
    var editError
    if (isNotEq) {
        editError = 'this is not your data'
    }
    return editError
}
