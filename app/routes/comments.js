"use strict"

var router = require('koa-router')()

var $middlewares = require('../common/mount-middlewares')(__dirname)
// core controller
var $ = require('../common/mount-controllers')(__dirname).comments

/**
 * Auto generate RESTful url routes.
 *
 * URL routes:
 *  DELETE /comments/:id       => comments.destroy()
 */


router.delete('/:id', $middlewares.auth.userRequired , $.api.destroy)

// -- custom routes




module.exports = router