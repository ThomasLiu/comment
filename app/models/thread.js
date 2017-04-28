"use strict"

var db = require('../../db')

var BaseModel = require("./BaseModel")
var base_methods = require("./base_methods")

var Schema    = db.Schema
var ObjectId  = Schema.ObjectId

var ThreadSchema = new Schema({
    
    ip : {type: String},
    title : {type: String},    //文章标题
    message: {type: String},   //文章内容
    type: {type: String},      //文章类别

    likes : {type: Number, default: 0}, //like 数量
    reports : {type: Number, default: 0}, //report 数量
    comments : {type: Number, default: 0}, //comment 数量
    reposts : {type: Number, default: 0}, //repost 转发数量
    
    userId: { type: ObjectId , ref: 'User' },
    appSecretId : { type: ObjectId , ref: 'AppSecret' },  //开发者用户Id

    createAt: { type: Date, default: Date.now },
    updateAt: { type: Date, default: Date.now },
})
ThreadSchema.plugin(base_methods)
var thread = db.model('Thread', ThreadSchema)

module.exports = new BaseModel(thread)
