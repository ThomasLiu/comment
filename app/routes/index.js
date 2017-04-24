

var router = require('koa-router')()

const logger = require('../common/logger')(__filename.replace(__dirname, ''))

var $middlewares  = require('../common/mount-middlewares')(__dirname)
// core controller
var $ = require('../common/mount-controllers')(__dirname).index

/**
 * Auto generate RESTful url routes.
 *
 * URL routes:
 *
 *  GET   /
 *
 */

router.get('/' ,$middlewares.auth.userRequired, $.index)


module.exports = router
