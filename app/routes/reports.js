

var router = require('koa-router')()

var $middlewares  = require('../common/mount-middlewares')(__dirname)
// core controller
var $ = require('../common/mount-controllers')(__dirname).reports

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
