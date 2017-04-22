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

// -- custom api
exports.api = {
    index: function *(next){
        logger.info(`${this.method} /api => list, query: ${JSON.stringify(this.query)}`)

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
            ojb = AppSecret.findOne({
                appId: appId,
                appSecret: appSecret
            })
            if (ojb) {
                var new_token = jwt.sign({
                    id: ojb._id,
                    appId: appId,
                    appSecret: appSecret
                }, Config.session_secret, {
                    expiresIn : 60 * 10 // 设置过期时间 10分钟
                })
                data.token = new_token
                data.appSecretId = ojb._id
            } else {
                editError = 'error appId and appSecret'
            }
        }

        if (editError) {
            data.message = editError
            this.body = apiFormat.api_error(data)
        } else {
            data.success = true
            yield auth.gen_session(data,this)
            this.body = apiFormat.api(data)
        }
    }
}

