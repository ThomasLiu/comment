"use strict"

const validator = require('validator')

const logger = require('../common/logger')(__filename.replace(__dirname, ''))
const log = require('../common/require_logger_util')
const restful = require('../common/restful_util')

const $models = require('../common/mount-models')(__dirname)
const Like = $models.like
const User = $models.user
const Comment = $models.comment
const Thread = $models.thread

// -- custom api
exports.api = {
    list: function *(next){
        log(logger, '/api/likes[/] => api.list', this)

        var findObj = {
            model: Like,
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

        var json = yield restful.list(findObj)

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
        log(logger, '/api/likes[/] => api.create', this)
        
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
        log(logger, '/api/likes/:id => api.show', this)

        var session = this.session,
            appSecretId = session.appSecretId

        var json = yield restful.show({
            model: Like,
            id: this.params.id,
            json : _json,
            appSecretId : appSecretId
        })

        if (this.query.needCustomer) {
            json.data.result = _getCustomer(json.data.result)
        }
        this.body = json
    },
    update: function *(next){
        log(logger, '/api/likes/:id => api.update', this)

        var session = this.session,
            appSecretId = session.appSecretId
        
        this.body = yield restful.update({
            body: this.request.body,
            id: this.params.id,
            getEditError : _getUpdateEditError,
            update: _update,
            model: Like,
            appSecretId : appSecretId
        })

    },
    destroy: function *(next){
        log(logger, '/api/likes/:id => api.destroy', this)

        var session = this.session,
            appSecretId = session.appSecretId
        
        this.body = yield restful.destroy({
            model: Like,
            id: this.params.id,
            appSecretId : appSecretId,
            updateCount : _updateCount
        })
    },
}

var _getCustomer = function *(obj) {
    if (obj.commentId) {
        obj.comment = yield Comment.findById(obj.commentId)
        if (obj.comment && obj.comment.userId ) {
            obj.comment.user = yield User.findById(obj.root.userId)
        }
    }
    if (obj.threadId) {
        obj.thread = yield Thread.findById(obj.threadId)
        if (obj.thread && obj.thread.userId ) {
            obj.thread.user = yield User.findById(obj.thread.userId)
        }
    }
    if (obj.userId) {
        obj.user = yield User.findById(obj.userId)
    }
    return obj
}

var _update = function *(obj, id) {
    return yield Like.update(obj,id)
}

var _create = function *(obj) {
    var saved = yield Like.create(obj)

    yield _updateCount(obj)

    return saved
}

var _updateCount = function *(obj){
    if (obj.commentId) {
        var count = yield Like.count({
            commentId : obj.commentId,
            appSecretId : obj.appSecretId
        })
        yield Comment.update({ likes : count}, obj.rootId)
    }

    if (obj.threadId) {
        var count = yield Like.count({
            threadId : obj.threadId,
            appSecretId : obj.appSecretId
        })
        yield Thread.update({ likes : count}, obj.threadId)
    }
}

var _json = (like) => {
    return {
        id : like._id,

        ip : like.ip,
        commentId : like.commentId,
        threadId : like.threadId,
        userId : like.userId,

        create_at : like.create_at,
        update_at : like.update_at,
        createdAtFormat: like.createdAtFormat,
        updatedAtFormat: like.updatedAtFormnpmat
    }
}

var _getEditError = (body) => {
    const userId = validator.trim(body.userId || '')
    
    const commentId = validator.trim(body.commentId || '')
    const threadId = validator.trim(body.threadId || '')
    var editError

    if ([userId].some(function (item) { return item === ''})) {
        editError = 'We need your userId'
    } else if (!(commentId || threadId)){
        editError = 'We need your threadId or commentId'
    }
    return editError
}

var _getUpdateEditError = (body) => {
    var editError
    return editError
}