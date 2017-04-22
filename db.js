'use strict'

var mongoose = require('mongoose')
var config = require('./config/mongoDB')

mongoose.connect(config.db, function (err) {
  if (err) {
    console.error('connect to %s error: ', config.db, err.message)
    process.exit(1)
  }
})

module.exports = mongoose

