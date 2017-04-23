import test from 'ava'
import superkoa from 'superkoa'
import config from '../../../../config/sys'
import mongoose from 'mongoose'
var ObjectId = mongoose.Types.ObjectId

var testApp = superkoa('../../app.js')

var mock = {
    ip: '1213',
    message: '123123',
    status: '',

    likes : 1, //like 数量
    reports : 2, //report 数量
    comments : 3, //comment 数量
    reposts : 4, //repost 转发数量

    rootId: new ObjectId(),    //回复评论根Id
    parentId: new ObjectId(),  //回复评论Id
    threadId: new ObjectId(),   //评论实例Id
    userId: new ObjectId(),       //评论用户Id
}

var mockUpdate = {
    ip: '12113',
    message: '1231123',
    status: '',

    likes : 11, //like 数量
    reports : 21, //report 数量
    comments : 31, //comment 数量
    reposts : 41, //repost 转发数量

    rootId: new ObjectId(),    //回复评论根Id
    parentId: new ObjectId(),  //回复评论Id
    threadId: new ObjectId(),   //评论实例Id
    userId: new ObjectId(),       //评论用户Id
}
var tokenRequest

test.before('get token before', function *(t) {
    var res = yield testApp
                .post('/api/auth')
                .send({
                    'appId': config.appId,
                    'appSecret': config.appSecret
                })
    
    var json = res.body.data            

    t.is(200, res.status)
    t.truthy(json.token)

    tokenRequest = json.token
})


test.only('test comment api', function * (t) {
    
    // *  POST   /api/comments[/]        => comment.api.create()
    var res = yield testApp
                .post('/api/comments')
                .send(mock)
                .set('x-access-token',tokenRequest)
    var json = res.body.data 
    var savedId = json.result._id

    t.is(200, res.status, 'POST /api/comments pass')
    t.truthy(savedId)
    
    //GET    /api/comments/:id       => comments.api.show()
    res = yield testApp
                .get(`/api/comments/${savedId}`)
                .set('x-access-token',tokenRequest)

    json = res.body.data 
    t.is(200, res.status, `GET /api/comments/${savedId} pass`)
    t.is(mock.ip, json.result.ip)
    
    //GET    /api/comments[/]        => comments.api.list()
    res = yield testApp
                .get('/api/comments')
                .query({
                    where : JSON.stringify({
                        ip : mock.ip
                    })
                })
                .set('x-access-token',tokenRequest)
    json = res.body.data 
    t.is(200, res.status)
    t.is(1, json.result.count)


    //PATCH  /api/comments/:id       => comments.api.update()
    res = yield testApp
                .patch(`/api/comments/${savedId}`)
                .send(mockUpdate)
                .set('x-access-token',tokenRequest)

    json = res.body.data 
    
    t.is(200, res.status, `PATCH /api/comments/${savedId} pass`)

    res = yield testApp
                .get(`/api/comments/${savedId}`)
                .set('x-access-token',tokenRequest)

    json = res.body.data 
    t.is(200, res.status, `GET /api/comments/${savedId} pass`)
    t.not(mock.ip, json.result.ip)


    res = yield testApp
            .del(`/api/comments/${savedId}`)
            .set('x-access-token',tokenRequest)

    t.is(200, res.status)     

    res = yield testApp
            .get(`/api/comments/${savedId}`)
            .set('x-access-token',tokenRequest)

    json = res.body.data 
    t.is(200, res.status)
    t.is('no this data', json.message)   

})




