/*!
 *
 * Copyright(c) 2015-2019 Thomas Lau <thomas_0836@qq.com>
 * MIT Licensed
 */


const path = require('path')
const serve = require('koa-static')

// 检查用户会话
module.exports = serve(path.join(__dirname, '../../public'))