"use strict"

const validator = require('validator')

const logger = require('../common/logger')(__filename.replace(__dirname, ''))
const log = require('../common/require_logger_util')
const restful = require('../common/restful_util')

const $models = require('../common/mount-models')(__dirname)
const User = $models.user

// -- custom api
exports.api = {
    list: function *(next){
        log(logger, '/api/users[/] => api.list', this)

        var findObj = {
            model: User,
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
        log(logger, '/api/users[/] => api.create', this)
        
        var session = this.session,
            appSecretId = session.appSecretId,
            body = this.request.body
        body.appSecretId = appSecretId
            
        this.body = yield restful.create({
            body : body,
            getEditError : _getEditError,
            create : _create
        })
    },
    show: function *(next){
        log(logger, '/api/users/:id => api.show', this)

        var session = this.session,
            appSecretId = session.appSecretId

        this.body = yield restful.show({
            model: User,
            id: this.params.id,
            json : _json,
            appSecretId : appSecretId
        })
    },
    update: function *(next){
        log(logger, '/api/users/:id => api.update', this)

        var session = this.session,
            appSecretId = session.appSecretId
        
        this.body = yield restful.update({
            body: this.request.body,
            id: this.params.id,
            getEditError : _getUpdateEditError,
            update: _update,
            model: User,
            appSecretId : appSecretId
        })

    },
    destroy: function *(next){
        log(logger, '/api/users/:id => api.destroy', this)

        var session = this.session,
            appSecretId = session.appSecretId

        this.body = yield restful.destroy({
            model: User,
            id: this.params.id,
            appSecretId : appSecretId
        })
    },
}

var _update = function *(obj, id) {
    return yield User.update(obj,id)
}

var _create = function *(obj) {
    return yield User.create(obj)
}

var _json = (user) => {
    return {
        id : user._id,

        name : user.name,
        headimgurl : user.headimgurl,
        lastIp : user.lastIp,

        createAt : user.createAt,
        updateAt : user.updateAt,
        createdAtFormat: user.createdAtFormat(),
        updatedAtFormat: user.updatedAtFormnpmat()
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