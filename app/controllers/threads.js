"use strict"

const validator = require('validator')

const logger = require('../common/logger')(__filename.replace(__dirname, ''))
const log = require('../common/require_logger_util')
const restful = require('../common/restful_util')

const $models = require('../common/mount-models')(__dirname)
const Thread = $models.thread

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
        log(logger, '/api/threads[/] => api.create', this)
        
        this.body = yield restful.create({
            body : this.request.body,
            getEditError : _getEditError,
            create : _create
        })
    },
    show: function *(next){
        log(logger, '/api/threads/:id => api.show', this)

        this.body = yield restful.show({
            model: Thread,
            id: this.params.id,
            json : _json
        })
    },
    update: function *(next){
        log(logger, '/api/threads/:id => api.update', this)
        
        this.body = yield restful.update({
            body: this.request.body,
            id: this.params.id,
            getEditError : _getUpdateEditError,
            update: _update
        })

    },
    destroy: function *(next){
        log(logger, '/api/threads/:id => api.destroy', this)

        this.body = yield restful.destroy({
            model: Thread,
            id: this.params.id
        })
    },
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
        message : thread.message,

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

var _getEditError = (body) => {
    var editError
    return editError
}

var _getUpdateEditError = (body) => {
    var editError
    return editError
}