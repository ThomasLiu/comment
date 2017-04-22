"use strict"

var router = require('koa-router')()
const co = require('co')

var $middlewares  = require('../../common/mount-middlewares')(__dirname)

// core controller
var $ = require('../../common/mount-controllers')(__dirname).comments

/**
 * Auto generate RESTful url routes.
 *
 * URL routes:
 *
 *  GET    /api/comments[/]        => comments.api.list()
 *  GET    /api/comments/:id       => comments.api.show()
 *  POST   /api/comments[/]        => comments.api.create()
 *  PATCH  /api/comments/:id       => comments.api.update()
 *  DELETE /api/comments/:id       => comments.api.destroy()
 *  
 */

// -- custom routes

router.get('/', $middlewares.check_api_token , $.api.list)

router.post('/', $middlewares.check_api_token , $.api.create)

router.get('/:id', $middlewares.check_api_token , $.api.show)

router.patch('/:id', $middlewares.check_api_token , $.api.update)

router.delete('/:id', $middlewares.check_api_token , $.api.destroy)


module.exports = router