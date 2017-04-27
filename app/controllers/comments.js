"use strict"

const validator = require('validator')

const logger = require('../common/logger')(__filename.replace(__dirname, ''))
const log = require('../common/require_logger_util')
const restful = require('../common/restful_util')
const jwt = require('jsonwebtoken')//用来创建和确认用户信息摘要

const $models = require('../common/mount-models')(__dirname)
const Comment = $models.comment
const User = $models.user
const Thread = $models.thread

// -- custom api
exports.api = {
    list: function *(next){
        log(logger, '/api/comments[/] => api.list', this)

        var findObj = {
            model: Comment,
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
        log(logger, '/api/comments[/] => api.create', this)
        
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
        log(logger, '/api/comments/:id => api.show', this)

        var session = this.session,
            appSecretId = session.appSecretId
        
        var json = yield restful.show({
            model: Comment,
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
        log(logger, '/api/comments/:id => api.update', this)

        var session = this.session,
            appSecretId = session.appSecretId
        
        this.body = yield restful.update({
            body: this.request.body,
            id: this.params.id,
            getEditError : _getUpdateEditError,
            update: _update,
            model: Comment,
            appSecretId : appSecretId
        })

    },
    destroy: function *(next){
        log(logger, '/api/comments/:id => api.destroy', this)

        var session = this.session,
            appSecretId = session.appSecretId

        this.body = yield restful.destroy({
            model: Comment,
            id: this.params.id,
            appSecretId : appSecretId,
            updateCount : _updateCount
        })
    },
}

var _getCustomer = function *(obj) {
    if (obj.rootId) {
        obj.root = yield Comment.findById(obj.rootId)
        if (obj.root && obj.root.userId ) {
            obj.root.user = yield User.findById(obj.root.userId)
        }
    }
    if (obj.parentId) {
        obj.parent = yield Comment.findById(obj.parentId)
        if (obj.parent && obj.parent.userId ) {
            obj.parent.user = yield User.findById(obj.parent.userId)
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
    return yield Comment.update(obj,id)
}

var _create = function *(obj) {
    var saved = yield Comment.create(obj)

    yield _updateCount(obj)
    return saved
}

var _updateCount = function *(obj){
    if (obj.parentId) {
        var count = yield Comment.count({
            parentId : obj.parentId,
            appSecretId : obj.appSecretId
        })
        yield Comment.update({ comments : count}, obj.parentId)
    }

    if (obj.rootId) {
        var count = yield Comment.count({
            rootId : obj.rootId,
            appSecretId : obj.appSecretId
        })
        yield Comment.update({ comments : count}, obj.rootId)
    }

    if (obj.threadId) {
        var count = yield Comment.count({
            threadId : obj.threadId,
            appSecretId : obj.appSecretId
        })
        yield Thread.update({ comments : count}, obj.threadId)
    }
}

var _json = (comment) => {
    return {
        id : comment._id,

        ip : comment.ip,
        message : comment.message,
        status : comment.status,

        likes : comment.likes,
        reports : comment.reports,
        comments : comment.comments,
        reposts : comment.reposts,

        rootId : comment.rootId,
        parentId : comment.parentId,
        threadId : comment.threadId,
        userId : comment.userId,

        create_at : comment.create_at,
        update_at : comment.update_at,
        createdAtFormat: comment.createdAtFormat,
        updatedAtFormat: comment.updatedAtFormnpmat
    }
}

var _getEditError = (body) => {
    const message = validator.trim(body.message || '')
    
    const threadId = validator.trim(body.threadId || '')
    const userId = validator.trim(body.userId || '')
    var editError

    if ([message, threadId, userId].some(function (item) { return item === ''})) {
        editError = 'We need your message, threadId and userId'
    }
    return editError
}

var _getUpdateEditError = (body) => {
    var editError
    return editError
}