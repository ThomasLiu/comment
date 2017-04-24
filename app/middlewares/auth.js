/**
 * Created by user on 22/6/15.
 */
"use strict"
const logger = require('../common/logger')()

function *gen_session(data, t) {
    var auth_token = `${data.appSecretId}$$$$${data.appId}$$$$${data.appSecret}`//以后可能会存储更多信息，用 $$$$ 来分嗝

    var session = t.session
    session[Config.auth_cookie_name] = auth_token
    yield t.sessionStore.set(t.sessionId,session)
}

exports.gen_session = gen_session

/**
 * 需要登录
 */
exports.userRequired = function *(next) {

    var session = this.session

    if (!session || !session[Config.auth_cookie_name]) {
        this.status = 403
        return this.redirect('/login')
    }
    yield next
}



// 验证用户是否登录
exports.authUser = function *(next) {
    var session = this.session
    // Ensure current_user always has defined.
    this.state.current_user = null

    if (!session) {
        return yield next
    }

    var appSecret
    if (session.appSecret) {
        appSecret = session.appSecret
    } else {
        var auth_token = session[Config.auth_cookie_name]
        if (!auth_token) {
            return yield next
        }

        var auth = auth_token.split('$$$$')
        if (auth.length < 2 ) {
            return yield next
        }

        var appSecretId = auth[0]
        var appId = auth[1]
        var appSecret = auth[2]

        appSecret = {
            appSecretId: appSecretId,
            appId: appId,
            appSecret: appSecret
        }
    }

    if (!appSecret) {
        return yield next
    }
    this.state.current_user = session.appSecret = appSecret

    yield next


    //如果req.session 是undefined 请检查 redies 是否正常

}