"use strict"

var db = require('../../db')

var BaseModel = require("./BaseModel")
var base_methods = require("./base_methods")

var Schema    = db.Schema
var ObjectId  = Schema.ObjectId

var ReportSchema = new Schema({
    
    ip : {type: String},
    commentId: { type: ObjectId , ref: 'Comment' },  //评论Id
    threadId: { type: ObjectId , ref: 'Thread' },    //评论实例Id
    userId: { type: ObjectId , ref: 'User' },        //操作用户Id
    appSecretId : { type: ObjectId , ref: 'AppSecret' },  //开发者用户Id

    createAt: { type: Date, default: Date.now },
    updateAt: { type: Date, default: Date.now },
})
ReportSchema.plugin(base_methods)
var report = db.model('Report', ReportSchema)

module.exports = new BaseModel(report)
