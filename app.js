'use strict'

require('./init')
require('./db')
require('./config/global')

const path = require('path')
const Koa = require('koa')
const convert = require('koa-convert')
const mountRoutes = require('./app/common/mount-koa-routes')
const $middlewares = require('./app/common/mount-middlewares')(__dirname)

const app = new Koa()

app.keys = [Config.session_secret]

// middlewares
app.use(convert($middlewares.compress))
app.use(convert($middlewares.bodyparser))
app.use(convert($middlewares.session))
app.use(convert($middlewares.helmet))
app.use(convert($middlewares.json))
app.use(convert($middlewares.serve))
app.use(convert($middlewares.cors))

app.use(convert($middlewares.log4js))
app.use(convert($middlewares.request_logger))

// for production
if (process.env.NODE_ENV === 'production') {
  app.use(convert($middlewares.static_cache))

    // mount routes from app/routes folder
  mountRoutes(app, path.join(__dirname, 'app/routes'), false)
} else if (process.env.NODE_ENV === 'test') {
    // for test
  console.log('test')

    // mount routes from app/routes folder
  mountRoutes(app, path.join(__dirname, 'app/routes'), true)
} else {
    // mount routes from app/routes folder
  mountRoutes(app, path.join(__dirname, 'app/routes'), true)
}

// response
app.on('error', function (err, ctx) {
  console.log(err)
})

module.exports = app
