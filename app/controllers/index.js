"use strict"

const jwt = require('jsonwebtoken')
const validator = require('validator')

const logger = require('../common/logger')(__filename.replace(__dirname, ''))
const apiFormat = require('../common/res_api_format')
const tools = require('../common/tools')
const api = require('../common/api')

const auth = require('../middlewares/auth')
const authServices = require('../services/auth')

// -- custom api
exports.api = {
    index: function *(next){
        logger.info(`${this.method} /api => list, query: ${JSON.stringify(this.query)}`)

        this.body = apiFormat.api({
            authorizations_url : {
                title: 'get token',
                href: `post: ${Config.host}/api/auth`,
                params: [
                  {name: 'username' , type: 'string'},
                  {name: 'password' , type: 'string'},
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
    check: function *(next){
        logger.info(`${this.method} /api/auth => auth, query: ${JSON.stringify(this.query)} , params: ${JSON.stringify(this.params)} , body: ${JSON.stringify(this.request.body)}`)

        const username = validator.trim(this.request.body.username || '').toLowerCase()
        const password = validator.trim(this.request.body.password || '')

        var baseCheckRequest
        if (username && password) {
            baseCheckRequest = yield api.request({
                url: `${Config.base_host}/api/auth/check`,
                method: 'post',
                send : {username: username , password: password}
            })
        }

        this.body = yield authServices.check(this.request.body, baseCheckRequest)
    },

    auth: function *(next){
        logger.info(`${this.method} /api/auth => auth, query: ${JSON.stringify(this.query)} , params: ${JSON.stringify(this.params)} , body: ${JSON.stringify(this.request.body)}`)

        const username = validator.trim(this.request.body.username || '')
        const password = validator.trim(this.request.body.password || '')

        var editError,
            data = {
                success: false,
                message: 'Enjoy your data!'
            }
        if (!username) {
          editError = 'Please enter the username'
        } else if (!password) {
          editError = 'Please enter the password'
        }

        if (!editError) {
            if (!(username === Config.appId && password === Config.appSecret)) {
                editError = 'the username or password error'
            }
        }

        if (editError) {
            data.message = editError
            this.body = apiFormat.api_error(data)
        } else {
            var new_token = jwt.sign({username: username, password: password}, Config.session_secret, {
                expiresIn : 60 * 10 // 设置过期时间 10分钟
            })
            data.success = true
            data.token = new_token
            yield auth.gen_session(data,this)
            this.body = apiFormat.api(data)
        }
    }
}

