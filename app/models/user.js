"use strict"

var db = require('../../db')

var BaseModel = require("./BaseModel")
var base_methods = require("./base_methods")

var Schema    = db.Schema
var ObjectId  = Schema.ObjectId

var UserSchema = new Schema({
    
    name : {type: String},      //评论上显示的名字
    headimgurl: {type: String}, //评论上显示的用户头像链接
    lastIp : {type: String},    //最后一次登陆的IP
    key: {type: String},        //自己系统上的ID，用来区分唯一性

    appSecretId : { type: ObjectId , ref: 'AppSecret' },  //开发者用户Id

    createAt: { type: Date, default: Date.now },
    updateAt: { type: Date, default: Date.now },
})
UserSchema.plugin(base_methods)
var user = db.model('User', UserSchema)

module.exports = new BaseModel(user)
