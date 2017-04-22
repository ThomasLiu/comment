"use strict"

var db = require('../../db')

var BaseModel = require("./BaseModel")
var base_methods = require("./base_methods")

var Schema    = db.Schema
var ObjectId  = Schema.ObjectId

var LikeSchema = new Schema({

    ip : {type: String},
    commentId: { type: ObjectId , ref: 'Comment' },  //评论Id
    threadId: { type: ObjectId , ref: 'Thread' },    //评论实例Id
    userId: { type: ObjectId , ref: 'User' },        //操作用户Id
    appSecretId : { type: ObjectId , ref: 'AppSecret' },  //开发者用户Id

    createAt: { type: Date, default: Date.now },
    updateAt: { type: Date, default: Date.now },
})
LikeSchema.plugin(base_methods)
var like = db.model('Like', LikeSchema)

module.exports = new BaseModel(like)
