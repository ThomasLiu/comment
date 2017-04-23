"use strict"

const validator = require('validator')

const logger = require('../common/logger')(__filename.replace(__dirname, ''))
const log = require('../common/require_logger_util')
const restful = require('../common/restful_util')

const $models = require('../common/mount-models')(__dirname)
const Report = $models.report
const User = $models.user
const Comment = $models.comment
const Thread = $models.thread

// -- custom api
exports.api = {
    list: function *(next){
        log(logger, '/api/reports[/] => api.list', this)

        var findObj = {
            model: Report,
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

        this.body = yield restful.list(findObj)

    },
    create: function *(next){
        log(logger, '/api/reports[/] => api.create', this)
        
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
        log(logger, '/api/reports/:id => api.show', this)

        var session = this.session,
            appSecretId = session.appSecretId

        this.body = yield restful.show({
            model: Report,
            id: this.params.id,
            json : _json,
            appSecretId : appSecretId
        })
    },
    update: function *(next){
        log(logger, '/api/reports/:id => api.update', this)

        var session = this.session,
            appSecretId = session.appSecretId
        
        this.body = yield restful.update({
            body: this.request.body,
            id: this.params.id,
            getEditError : _getUpdateEditError,
            update: _update,
            model: Report,
            appSecretId : appSecretId
        })

    },
    destroy: function *(next){
        log(logger, '/api/reports/:id => api.destroy', this)

        var session = this.session,
            appSecretId = session.appSecretId
        
        this.body = yield restful.destroy({
            model: Report,
            id: this.params.id,
            appSecretId : appSecretId,
            updateCount : _updateCount
        })
    },
}

var _update = function *(obj, id) {
    return yield Report.update(obj,id)
}

var _create = function *(obj) {
    var saved = yield Report.create(obj)

    yield _updateCount(obj)
    
    return saved
}

var _updateCount = function *(obj){
    if (obj.commentId) {
        var count = yield Report.count({
            commentId : obj.commentId,
            appSecretId : obj.appSecretId
        })
        yield Comment.update({ reports : count}, obj.rootId)
    }

    if (obj.threadId) {
        var count = yield Report.count({
            threadId : obj.threadId,
            appSecretId : obj.appSecretId
        })
        yield Thread.update({ reports : count}, obj.threadId)
    }
}


var _json = (report) => {
    return {
        id : report._id,

        ip : report.ip,
        commentId : report.commentId,
        threadId : report.threadId,
        userId : report.userId,

        create_at : report.create_at,
        update_at : report.update_at,
        createdAtFormat: report.createdAtFormat,
        updatedAtFormat: report.updatedAtFormnpmat
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