import test from 'ava'
import superkoa from 'superkoa'
import config from '../../../../config/sys'
import mongoose from 'mongoose'
var ObjectId = mongoose.Types.ObjectId

var testApp = superkoa('../../app.js')

var mock = {
    ip : '1',
    commentId: new ObjectId(),  //评论Id
    threadId: new ObjectId(),    //评论实例Id
    userId: new ObjectId(),        //操作用户Id
}

var mockUpdate = {
    ip : '12',
    commentId: new ObjectId(),  //评论Id
    threadId: new ObjectId(),    //评论实例Id
    userId: new ObjectId(),        //操作用户Id
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


test('test like api', function * (t) {
    
    // *  POST   /api/likes[/]        => like.api.create()
    var res = yield testApp
                .post('/api/likes')
                .send(mock)
                .set('x-access-token',tokenRequest)
    var json = res.body.data 
    var savedId = json.result._id

    t.is(200, res.status, 'POST /api/likes pass')
    t.truthy(savedId)
    
    //GET    /api/likes/:id       => likes.api.show()
    res = yield testApp
                .get(`/api/likes/${savedId}`)
                .set('x-access-token',tokenRequest)

    json = res.body.data 
    t.is(200, res.status, `GET /api/likes/${savedId} pass`)
    t.is(mock.ip, json.result.ip)
    
    //GET    /api/likes[/]        => likes.api.list()
    res = yield testApp
                .get('/api/likes')
                .query({
                    where : JSON.stringify({
                        ip : mock.ip
                    })
                })
                .set('x-access-token',tokenRequest)
    json = res.body.data 
    t.is(200, res.status)
    t.is(1, json.result.count)


    //PATCH  /api/likes/:id       => likes.api.update()
    res = yield testApp
                .patch(`/api/likes/${savedId}`)
                .send(mockUpdate)
                .set('x-access-token',tokenRequest)

    json = res.body.data 
    
    t.is(200, res.status, `PATCH /api/likes/${savedId} pass`)

    res = yield testApp
                .get(`/api/likes/${savedId}`)
                .set('x-access-token',tokenRequest)

    json = res.body.data 
    t.is(200, res.status, `GET /api/likes/${savedId} pass`)
    t.not(mock.ip, json.result.ip)


    res = yield testApp
            .del(`/api/likes/${savedId}`)
            .set('x-access-token',tokenRequest)

    t.is(200, res.status)     

    res = yield testApp
            .get(`/api/likes/${savedId}`)
            .set('x-access-token',tokenRequest)

    json = res.body.data 
    t.is(200, res.status)
    t.is('no this data', json.message)   

})




