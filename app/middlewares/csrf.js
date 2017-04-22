/*!
 *
 * Copyright(c) 2015-2019 Thomas Lau <thomas_0836@qq.com>
 * MIT Licensed
 */


const csrf = require('koa-csrf')

// 检查用户会话
module.exports = csrf()