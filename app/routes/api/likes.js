"use strict"

var router = require('koa-router')()
const co = require('co')

var $middlewares  = require('../../common/mount-middlewares')(__dirname)

// core controller
var $ = require('../../common/mount-controllers')(__dirname).likes

/**
 * Auto generate RESTful url routes.
 *
 * URL routes:
 *
 *  GET    /api/likes[/]        => likes.api.list()
 *  GET    /api/likes/:id       => likes.api.show()
 *  POST   /api/likes[/]        => likes.api.create()
 *  PATCH  /api/likes/:id       => likes.api.update()
 *  DELETE /api/likes/:id       => likes.api.destroy()
 *  
 */

// -- custom routes

router.get('/', $middlewares.check_api_token , $.api.list)

router.post('/', $middlewares.check_api_token , $.api.create)

router.get('/:id', $middlewares.check_api_token , $.api.show)

router.patch('/:id', $middlewares.check_api_token , $.api.update)

router.delete('/:id', $middlewares.check_api_token , $.api.destroy)


module.exports = router