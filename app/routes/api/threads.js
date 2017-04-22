"use strict"

var router = require('koa-router')()
const co = require('co')

var $middlewares  = require('../../common/mount-middlewares')(__dirname)

// core controller
var $ = require('../../common/mount-controllers')(__dirname).threads

/**
 * Auto generate RESTful url routes.
 *
 * URL routes:
 *
 *  GET    /api/threads[/]        => threads.api.list()
 *  GET    /api/threads/:id       => threads.api.show()
 *  POST   /api/threads[/]        => threads.api.create()
 *  PATCH  /api/threads/:id       => threads.api.update()
 *  DELETE /api/threads/:id       => threads.api.destroy()
 *  
 */

// -- custom routes

router.get('/', $middlewares.check_api_token , $.api.list)

router.post('/', $middlewares.check_api_token , $.api.create)

router.get('/:id', $middlewares.check_api_token , $.api.show)

router.patch('/:id', $middlewares.check_api_token , $.api.update)

router.delete('/:id', $middlewares.check_api_token , $.api.destroy)


module.exports = router