"use strict"

const jwt = require('jsonwebtoken')
const validator = require('validator')

const logger = require('../common/logger')(__filename.replace(__dirname, ''))
const log = require('../common/require_logger_util')
const apiFormat = require('../common/res_api_format')
const tools = require('../common/tools')
const api = require('../common/api')

const auth = require('../middlewares/auth')

const $models = require('../common/mount-models')(__dirname)
const AppSecret = $models.appSecret
const Comment = $models.comment

const commentsControllers = require('./comments')


const notJump = [
    '/active_account', //active page
    '/reset_pass',     //reset appSecret page, avoid to reset twice
    '/login',         //regist page
    '/search_pass'    //serch pass page
]

exports.index = function *(next){
    log(logger, '/ => index', this)

    var page = parseInt(this.query.page, 10) || 1
    page = page > 0 ? page : 1
    var sort = this.query.sortby || '-createdAt'
    const limit = Config.list_count

    var session = this.session,
        appSecretId = session.appSecretId

    var where = {
            appSecretId : appSecretId
        },
        attributes = null,
        result,
        logErr,
        data = {
            current_page: page,
            sortby: sort,
            title: 'Comment List'
        }
    logger.debug(`where : ${JSON.stringify(where)}`)
    try {
        result = yield Comment.findAndCountAll({
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
                    var item = commentsControllers._json(rows[i])
                    var newItem = yield commentsControllers._getCustomer(item)
                    newRows.push(newItem)
                }
            }
            data.list = newRows
        }
    } catch (error) {
        logErr = error
    }
    logger.debug(`result : ${JSON.stringify(data.list)}`)
    
    if (logErr){
        yield this.render('error', {
            message: logErr,
            error: {status: 204, stack: 'api error' }
        })
    } else {
        yield this.render('index', data)
    }
    
}


exports.login = function *(next){
    log(logger, '/login => login', this)

    const appId = validator.trim(this.request.body.appId || '').toLowerCase()
    const appSecret = validator.trim(this.request.body.appSecret || '')

    var editError,refer = '/'
    if (!appId) {
        editError = 'Please enter the appId'
    } else if (!appSecret) {
        editError = 'Please enter the appSecret'
    }

    if (!editError) {

        var ojb = yield AppSecret.findOne({
            appId: appId,
            appSecret: appSecret
        })

        if (ojb) {
            var tokebObj = {
                appSecretId: `${ojb._id}`,
                appId: appId,
                appSecret: appSecret
            }
            yield auth.gen_session(tokebObj,this)

            var session = yield this.sessionStore.get(this.sessionId)

            refer = session._loginReferer || '/'
            for (var i = 0, len = notJump.length ; i != len ; ++ i) {
                if (refer.indexOf(notJump[i]) >= 0) {
                    refer = '/'
                    break
                }
            }
        } else {
            editError = 'This appId have not exist or wrong appSecret' 
        }
    }

    if(editError){
        this.redirect(`/login?editError=${editError}&appId=${appId}`)
    } else {
        this.redirect(refer)
    }

}


// -- custom api
exports.api = {
    index: function *(next){
        log(logger, '/api => api.index', this)

        this.body = apiFormat.api({
            authorizations_url : {
                title: 'get token',
                href: `post: ${Config.host}/api/auth`,
                params: [
                  {name: 'appId' , type: 'string'},
                  {name: 'appSecret' , type: 'string'},
                ],
                res: {
                    data: {
                      success: false,
                      message: 'Enjoy your token!',
                      token: 'your token'
                    },
                    status: {
                      code : 0,
                      msg  : 'request success!'
                    }
                }
            }
        })
    },

    auth: function *(next){
        log(logger, '/api/auth => auth', this)

        const appId = validator.trim(this.request.body.appId || '')
        const appSecret = validator.trim(this.request.body.appSecret || '')

        var editError,
            data = {
                success: false,
                message: 'Enjoy your data!'
            },
            ojb
        if (!appId) {
          editError = 'Please enter the appId'
        } else if (!appSecret) {
          editError = 'Please enter the appSecret'
        }

        if (!editError) {
            ojb = yield AppSecret.findOne({
                appId: appId,
                appSecret: appSecret
            })
            if (ojb) {
                var tokebObj = {
                    appSecretId: `${ojb._id}`,
                    appId: appId,
                    appSecret: appSecret
                }
                var new_token = jwt.sign(tokebObj, Config.session_secret, {
                    expiresIn : 60 * 10 // 设置过期时间 10分钟
                })
                data.token = new_token
                yield auth.gen_session(tokebObj,this)
            } else {
                editError = 'error appId and appSecret'
            }
        }

        if (editError) {
            data.message = editError
            this.body = apiFormat.api_error(data)
        } else {
            data.success = true
            
            this.body = apiFormat.api(data)
        }
    }
}

