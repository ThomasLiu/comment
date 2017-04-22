"use strict"

const validator = require('validator')

const logger = require('../common/logger')(__filename.replace(__dirname, ''))
const log = require('../common/require_logger_util')
const restful = require('../common/restful_util')

const $models = require('../common/mount-models')(__dirname)
const Like = $models.like

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
        log(logger, '/api/likes[/] => api.create', this)
        
        this.body = yield restful.create({
            body : this.request.body,
            getEditError : _getEditError,
            create : _create
        })
    },
    show: function *(next){
        log(logger, '/api/likes/:id => api.show', this)

        this.body = yield restful.show({
            model: Like,
            id: this.params.id,
            json : _json
        })
    },
    update: function *(next){
        log(logger, '/api/likes/:id => api.update', this)
        
        this.body = yield restful.update({
            body: this.request.body,
            id: this.params.id,
            getEditError : _getUpdateEditError,
            update: _update
        })

    },
    destroy: function *(next){
        log(logger, '/api/likes/:id => api.destroy', this)

        this.body = yield restful.destroy({
            model: Like,
            id: this.params.id
        })
    },
}

var _update = function *(obj, id) {
    return yield Like.update(obj,id)
}

var _create = function *(obj) {
    return yield Like.create(obj)
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