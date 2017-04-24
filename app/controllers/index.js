"use strict"

const jwt = require('jsonwebtoken')
const validator = require('validator')

const logger = require('../common/logger')(__filename.replace(__dirname, ''))
const apiFormat = require('../common/res_api_format')
const tools = require('../common/tools')
const api = require('../common/api')

const auth = require('../middlewares/auth')

const $models = require('../common/mount-models')(__dirname)
const AppSecret = $models.appSecret


const notJump = [
    '/active_account', //active page
    '/reset_pass',     //reset appSecret page, avoid to reset twice
    '/login',         //regist page
    '/search_pass'    //serch pass page
]

exports.index = function *(next){
    logger.info(`${this.method} / => index, query: ${JSON.stringify(this.query)}`)

    yield this.render('index', {
    })
    
}


exports.login = function *(next){
    logger.info(`${this.method} /login => login, query: ${JSON.stringify(this.query)} , params: ${JSON.stringify(this.params)} , body: ${JSON.stringify(this.request.body)}`)

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
        logger.info(`${this.method} /api => api.index, query: ${JSON.stringify(this.query)}`)

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
        logger.info(`${this.method} /api/auth => auth, query: ${JSON.stringify(this.query)} , params: ${JSON.stringify(this.params)} , body: ${JSON.stringify(this.request.body)}`)

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

