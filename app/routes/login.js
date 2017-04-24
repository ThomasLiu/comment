

var router = require('koa-router')()

const logger = require('../common/logger')(__filename.replace(__dirname, ''))

// core controller
var $ = require('../common/mount-controllers')(__dirname).index


/**
 * Auto generate RESTful url routes.
 *
 * URL routes:
 *
 *  GET    /login
 *  POST   /login    => index.login()
 *
 */

router.get('/', function *(next){
  logger.info(`${this.method} /login , query: ${JSON.stringify(this.query)}`)

  var session = this.sessionStore.get(this.sessionId)
  session._loginReferer = this.headers.referer

  yield this.render('login/index', {
    editError : this.query.editError,
    title: 'Sign in Comment System'
  })
})

router.post('/', $.login);


module.exports = router
