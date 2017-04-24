

var router = require('koa-router')()

const logger = require('../common/logger')(__filename.replace(__dirname, ''))

/**
 * Auto generate RESTful url routes.
 *
 * URL routes:
 *
 *  GET   /signout
 *
 */

router.get('/' , function *(next){
    logger.info(`${this.method} /signout , query: ${JSON.stringify(this.query)}`)
    yield this.sessionStore.destroy(this.sessionId)
    this.redirect('/login')
})


module.exports = router
