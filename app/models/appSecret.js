"use strict"

var db = require('../../db')

var BaseModel = require("./BaseModel")
var base_methods = require("./base_methods")

var Schema    = db.Schema

var AppSecretSchema = new Schema({

    appId:     {type: String},
    appSecret: {type: String},

    createAt: { type: Date, default: Date.now },
    updateAt: { type: Date, default: Date.now },
})
AppSecretSchema.plugin(base_methods)
var appSecret = db.model('AppSecret', AppSecretSchema)

module.exports = new BaseModel(appSecret)
