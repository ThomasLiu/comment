"use strict"

const validator = require('validator')
const jwt = require('jsonwebtoken')

const logger = require('../common/logger')(__filename.replace(__dirname, ''))
const log = require('../common/require_logger_util')
const restful = require('../common/restful_util')

const $models = require('../common/mount-models')(__dirname)
const Report = $models.report
const User = $models.user
const Comment = $models.comment
const Thread = $models.thread

const threadController = require('./threads')
const commentController = require('./comments')


exports.index = function *(next){
    log(logger, '/ => index', this)

    var page = parseInt(this.query.page, 10) || 1
    page = page > 0 ? page : 1
    var sort = this.query.sortby || '-createdAt'
    const limit = Config.list_count

    var session = this.session,
        appSecretId = session.appSecretId,
        id = this.query.id || '',
        fled = this.query.fled || '',
        where = {
            appSecretId : appSecretId
        },
        attributes = null,
        result,
        logErr,
        data = {
            current_page: page,
            sortby: sort,
            fled: fled,
            id: id,
            title: 'Report List'
        }
    
    if (fled && id) {
        where[fled] = id
    }

    try {
        result = yield Report.findAndCountAll({
            where : where,
            offset: (page - 1) * limit,
            limit: limit,
            sort: sort,
            field: attributes
        })
        const all_count = result.count
        data.pages = Math.ceil(all_count / limit)
        data.all_count = all_count
        if (result.rows && result.rows.length > 0) {
            var rows = result.rows,
                newRows = new Array()
            for (var i in rows) {
                if(rows[i]) {
                    var item = _json(rows[i])
                    var newItem = yield _getCustomer(item)
                    newRows.push(newItem)
                }
            }
            data.list = newRows
        }
    } catch (error) {
        logErr = error
    }
    
    if (logErr){
        yield this.render('error', {
            message: logErr,
            error: {status: 204, stack: 'api error' }
        })
    } else {
        const all_count = result.count
        const pages = Math.ceil(all_count / limit)

        yield this.render('reports/index', data)
    }
}



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

        var json = yield restful.show({
            model: Report,
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

var _getCustomer = function *(obj) {
    logger.debug(`_getCustomer : ${JSON.stringify(obj)}`)
    if (obj.commentId) {
        var comment = yield Comment.findById(obj.commentId)
        if (comment) {
            obj.comment = commentController._json(comment)
            if (obj.comment && obj.comment.userId ) {
                obj.comment.user = yield User.findById(obj.comment.userId)
            }
        }
        logger.debug(`_getCustomer comment 3: ${JSON.stringify(obj)}`)
    }
    if (obj.threadId) {
        var thread = yield Thread.findById(obj.threadId)
        if (thread) {
            obj.thread = threadController._json(thread)
            if (obj.thread && obj.thread.userId ) {
                obj.thread.user = yield User.findById(obj.thread.userId)
            }
        }
    }
    if (obj.userId) {
        obj.user = yield User.findById(obj.userId)
    }
    return obj
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
        yield Comment.update({ reports : count}, obj.commentId)
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
        message : report.message,

        ip : report.ip,
        commentId : report.commentId,
        threadId : report.threadId,
        userId : report.userId,

        createAt : report.createAt,
        updateAt : report.updateAt,
        createdAtFormat: report.createdAtFormat(),
        updatedAtFormat: report.updatedAtFormnpmat()
    }
}

var _getEditError = (body) => {
    const userId = body.userId || ''
    
    const commentId = validator.trim(body.commentId || '')
    const threadId = validator.trim(body.threadId || '')
    var editError

    if ([userId].some(function (item) { return item === ''})) {
        editError = 'We need your userJwt'
    } else if (!(commentId || threadId)){
        editError = 'We need your threadId or commentId'
    }
    return editError
}

var _getUpdateEditError = (body) => {
    var editError
    return editError
}