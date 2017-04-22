"use strict"

const validator = require('validator')

const logger = require('../common/logger')(__filename.replace(__dirname, ''))
const log = require('../common/require_logger_util')
const restful = require('../common/restful_util')

const $models = require('../common/mount-models')(__dirname)
const Comment = $models.comment

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
        log(logger, '/api/comments[/] => api.create', this)
        
        this.body = yield restful.create({
            body : this.request.body,
            getEditError : _getEditError,
            create : _create
        })
    },
    show: function *(next){
        log(logger, '/api/comments/:id => api.show', this)

        this.body = yield restful.show({
            model: Comment,
            id: this.params.id,
            json : _json
        })
    },
    update: function *(next){
        log(logger, '/api/comments/:id => api.update', this)
        
        this.body = yield restful.update({
            body: this.request.body,
            id: this.params.id,
            getEditError : _getUpdateEditError,
            update: _update
        })

    },
    destroy: function *(next){
        log(logger, '/api/comments/:id => api.destroy', this)

        this.body = yield restful.destroy({
            model: Comment,
            id: this.params.id
        })
    },
}

var _update = function *(obj, id) {
    return yield Comment.update(obj,id)
}

var _create = function *(obj) {
    return yield Comment.create(obj)
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