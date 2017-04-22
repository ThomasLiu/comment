"use strict"

var router = require('koa-router')()
const co = require('co')

var $middlewares  = require('../../common/mount-middlewares')(__dirname)

// core controller
var $ = require('../../common/mount-controllers')(__dirname).reports

/**
 * Auto generate RESTful url routes.
 *
 * URL routes:
 *
 *  GET    /api/reports[/]        => reports.api.list()
 *  GET    /api/reports/:id       => reports.api.show()
 *  POST   /api/reports[/]        => reports.api.create()
 *  PATCH  /api/reports/:id       => reports.api.update()
 *  DELETE /api/reports/:id       => reports.api.destroy()
 *  
 */

// -- custom routes

router.get('/', $middlewares.check_api_token , $.api.list)

router.post('/', $middlewares.check_api_token , $.api.create)

router.get('/:id', $middlewares.check_api_token , $.api.show)

router.patch('/:id', $middlewares.check_api_token , $.api.update)

router.delete('/:id', $middlewares.check_api_token , $.api.destroy)


module.exports = router