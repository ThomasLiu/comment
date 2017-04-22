/**
 * Created by user on 22/6/15.
 */
"use strict"
const logger = require('../common/logger')()

function *gen_session(data, t) {
    var auth_token = `${data.token}$$$$`//以后可能会存储更多信息，用 $$$$ 来分嗝

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
        return yield this.render('error', {
            message: 'forbidden',
            error: {status: 403, stack: 'You need Login before' }
        })
    }
    yield next
}
