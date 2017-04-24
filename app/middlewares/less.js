/*!
 *
 * Copyright(c) 2015-2019 Thomas Lau <thomas_0836@qq.com>
 * MIT Licensed
 */


const path = require('path')
const lessMiddleware = require('koa-less')

// 检查用户会话
module.exports = lessMiddleware(path.join(__dirname, '../../public'),{force :true})