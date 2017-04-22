"use strict"

var router = require('koa-router')()
const co = require('co')

var $middlewares  = require('../../common/mount-middlewares')(__dirname)

// core controller
var $ = require('../../common/mount-controllers')(__dirname).appSecrets

/**
 * Auto generate RESTful url routes.
 *
 * URL routes:
 *
 *  GET    /api/appSecrets/new       => appSecrets.api.getNew()
 *  GET    /api/appSecrets[/]        => appSecrets.api.list()
 *  GET    /api/appSecrets/:id       => appSecrets.api.show()
 *  POST   /api/appSecrets[/]        => appSecrets.api.create()
 *  PATCH  /api/appSecrets/:id       => appSecrets.api.update()
 *  DELETE /api/appSecrets/:id       => appSecrets.api.destroy()
 *  
 */

// -- custom routes

router.get('/new', $.api.getNew)

// router.get('/', $middlewares.check_api_token , $.api.list)

// router.post('/', $middlewares.check_api_token , $.api.create)

// router.get('/:id', $middlewares.check_api_token , $.api.show)

// router.patch('/:id', $middlewares.check_api_token , $.api.update)

// router.delete('/:id', $middlewares.check_api_token , $.api.destroy)


module.exports = router