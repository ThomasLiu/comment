"use strict"

const validator = require('validator')
const jwt = require('jsonwebtoken')

const logger = require('../common/logger')(__filename.replace(__dirname, ''))
const log = require('../common/require_logger_util')
const restful = require('../common/restful_util')

const $models = require('../common/mount-models')(__dirname)
const Thread = $models.thread
const User = $models.user

// -- custom api
exports.api = {
    list: function *(next){
        log(logger, '/api/threads[/] => api.list', this)

        var findObj = {
            model: Thread,
            page : this.query.page,
            sort : this.query.sortby,
            limit : this.query.limit
        }
        if (this.query.where) {
            findObj.where = JSON.parse(this.query.where)
        }
        var session = this.session,
            appSecretId = session.appSecretId
        if (findObj.where) {
            findObj.where.appSecretId = appSecretId
        } else {
            findObj.where = {
                appSecretId : appSecretId
            }
        }
        if (this.query.attributes) {
            var array = JSON.parse(this.query.attributes)
            findObj.attributes = {}
            for (var i = 0 ; i < array.length; i++ ) {
                var item = array[i]
                attributes[item] = 1
            }
        }
        logger.debug(`1 ---------`)
        var json = yield restful.list(findObj)
        logger.debug(`2 ---------`)
        if (this.query.needCustomer 
            && json.data 
            && json.data.result
            && json.data.result.rows) {
            var rows = json.data.result.rows,
                newRows = new Array()
            for (var i in rows) {
                var item = _json(rows[i])
                var newItem = yield _getCustomer(item)
                newRows.push(newItem)
            }
            json.data.result.rows = newRows
        }

        this.body = json

    },
    create: function *(next){
        log(logger, '/api/threads[/] => api.create', this)
        
        var session = this.session,
            appSecretId = session.appSecretId,
            appId = session.appId,
            appSecret = session.appSecret,
            body = this.request.body
        body.appSecretId = appSecretId

        if (body.userJwt) {
            var user = jwt.verify(body.userJwt, `${appId}|${appSecret}`)
            if (user.key) {
                var obj = yield User.findOne({
                    appSecretId: appSecretId,
                    key: user.key
                })
                if (!obj) {
                    user.appSecretId = appSecretId
                    obj = yield User.create(user)
                } 
                if (obj && obj._id) {
                    body.userId = obj._id
                }
            }
            delete body.userJwt
        }
            
        this.body = yield restful.create({
            body : body,
            getEditError : _getEditError,
            create : _create
        })
    },
    show: function *(next){
        log(logger, '/api/threads/:id => api.show', this)

        var session = this.session,
            appSecretId = session.appSecretId

        var json = yield restful.show({
            model: Thread,
            id: this.params.id,
            json : _json,
            appSecretId : appSecretId
        })

        if (this.query.needCustomer) {
            json.data.result = yield _getCustomer(json.data.result)
        }
        this.body = json
    },
    update: function *(next){
        log(logger, '/api/threads/:id => api.update', this)

        var session = this.session,
            appSecretId = session.appSecretId
        
        this.body = yield restful.update({
            body: this.request.body,
            id: this.params.id,
            getEditError : _getUpdateEditError,
            update: _update,
            model: Thread,
            appSecretId : appSecretId
        })

    },
    destroy: function *(next){
        log(logger, '/api/threads/:id => api.destroy', this)

        var session = this.session,
            appSecretId = session.appSecretId

        this.body = yield restful.destroy({
            model: Thread,
            id: this.params.id,
            appSecretId : appSecretId
        })
    },
}

var _getCustomer = function *(obj) {
    if (obj.userId) {
        obj.user = yield User.findById(obj.userId)
    }
    return obj
}

var _update = function *(obj, id) {
    return yield Thread.update(obj,id)
}

var _create = function *(obj) {
    return yield Thread.create(obj)
}

var _json = (thread) => {
    return {
        id : thread._id,

        ip : thread.ip,
        title : thread.title,
        message : thread.message,
        type : thread.type,

        likes : thread.likes,
        reports : thread.reports,
        comments : thread.comments,
        reposts : thread.reposts,

        userId : thread.userId,

        create_at : thread.create_at,
        update_at : thread.update_at,
        createdAtFormat: thread.createdAtFormat,
        updatedAtFormat: thread.updatedAtFormnpmat
    }
}
exports._json = _json

var _getEditError = (body) => {
    var editError
    const message = validator.trim(body.message || '')
    
    const title = validator.trim(body.title || '')
    const type = validator.trim(body.type || '')
    const userId = body.userId || ''
    var editError
    
    logger.debug(`message : ${message}`)
    logger.debug(`title : ${title}`)
    logger.debug(`type : ${type}`)
    logger.debug(`userId : ${userId}`)
    

    if ([message, title, type, userId].some(function (item) { return item === ''})) {
        editError = 'We need your message, title, type and userJwt'
    }
    return editError
}

var _getUpdateEditError = (body) => {
    var editError
    return editError
}