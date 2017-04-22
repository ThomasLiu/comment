"use strict"

var router = require('koa-router')()
const co = require('co')

var $middlewares  = require('../../common/mount-middlewares')(__dirname)

// core controller
var $ = require('../../common/mount-controllers')(__dirname).users

/**
 * Auto generate RESTful url routes.
 *
 * URL routes:
 *
 *  GET    /api/users[/]        => users.api.list()
 *  GET    /api/users/:id       => users.api.show()
 *  POST   /api/users[/]        => users.api.create()
 *  PATCH  /api/users/:id       => users.api.update()
 *  DELETE /api/users/:id       => users.api.destroy()
 *  
 */

// -- custom routes

router.get('/', $middlewares.check_api_token , $.api.list)

router.post('/', $middlewares.check_api_token , $.api.create)

router.get('/:id', $middlewares.check_api_token , $.api.show)

router.patch('/:id', $middlewares.check_api_token , $.api.update)

router.delete('/:id', $middlewares.check_api_token , $.api.destroy)


module.exports = router