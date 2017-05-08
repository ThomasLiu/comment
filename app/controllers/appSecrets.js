"use strict"

const validator = require('validator')
const md5 = require('js-md5')

const logger = require('../common/logger')(__filename.replace(__dirname, ''))
const log = require('../common/require_logger_util')
const restful = require('../common/restful_util')
const apiFormat = require('../common/res_api_format')

const $models = require('../common/mount-models')(__dirname)
const AppSecret = $models.appSecret

// -- custom api
exports.api = {
    getNew: function *(next){
        log(logger, '/api/appSecrets/new => api.getNew', this)

        var l = (new Date()).getTime()

        var appSecret = {
            appId : md5(l),
            appSecret : md5(`${l - 10000}comment`)
        }

        yield _create(appSecret)
        var data = {
            success: false,
            message: '请记住您的 appId 和 appSecret，只生成一次。每组appSecret对应一套数据'
        }
        data.success = true

        data.result = appSecret
        this.body = apiFormat.api(data)
    },
    list: function *(next){
        log(logger, '/api/appSecrets[/] => api.list', this)

        var findObj = {
            model: AppSecret,
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
        log(logger, '/api/appSecrets[/] => api.create', this)
        
        this.body = yield restful.create({
            body : this.request.body,
            getEditError : _getEditError,
            create : _create
        })
    },
    show: function *(next){
        log(logger, '/api/appSecrets/:id => api.show', this)

        this.body = yield restful.show({
            model: AppSecret,
            id: this.params.id,
            json : _json
        })
    },
    update: function *(next){
        log(logger, '/api/appSecrets/:id => api.update', this)
        
        this.body = yield restful.update({
            body: this.request.body,
            id: this.params.id,
            getEditError : _getUpdateEditError,
            update: _update
        })

    },
    destroy: function *(next){
        log(logger, '/api/appSecrets/:id => api.destroy', this)

        this.body = yield restful.destroy({
            model: AppSecret,
            id: this.params.id
        })
    },
}

var _update = function *(obj, id) {
    return yield AppSecret.update(obj,id)
}

var _create = function *(obj) {
    return yield AppSecret.create(obj)
}

var _json = (appSecret) => {
    return {
        id : appSecret._id,
        appId : appSecret.appId,
        appSecret : appSecret.appSecret,
        createAt : appSecret.createAt,
        updateAt : appSecret.updateAt,
        createdAtFormat: appSecret.createdAtFormat(),
        updatedAtFormat: appSecret.updatedAtFormnpmat()
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