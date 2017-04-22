"use strict"

var db = require('../../db')

var BaseModel = require("./BaseModel")
var base_methods = require("./base_methods")

var Schema    = db.Schema
var ObjectId  = Schema.ObjectId

var CommentSchema = new Schema({
    
    ip : {type: String},       //评论者目前Ip
    message: {type: String},   //评论内容
    status: {type: String},    //评论状态。创建评论时，可能的状态：approved：已经通过；pending：待审核；spam：垃圾评论。

    likes : {type: Number, default: 0}, //like 数量
    reports : {type: Number, default: 0}, //report 数量
    comments : {type: Number, default: 0}, //comment 数量
    reposts : {type: Number, default: 0}, //repost 转发数量

    rootId: { type: ObjectId , ref: 'Comment' },    //回复评论根Id
    parentId: { type: ObjectId , ref: 'Comment' },  //回复评论Id
    threadId: { type: ObjectId , ref: 'Thread' },   //评论实例Id
    userId: { type: ObjectId , ref: 'User' },       //评论用户Id
    appSecretId : { type: ObjectId , ref: 'AppSecret' },  //开发者用户Id
    
    createAt: { type: Date, default: Date.now },
    updateAt: { type: Date, default: Date.now },
})
CommentSchema.plugin(base_methods)
var comment = db.model('Comment', CommentSchema)

module.exports = new BaseModel(comment)
