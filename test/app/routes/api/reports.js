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
    appSecretId : new ObjectId(),  //开发者用户Id
}

var mockUpdate = {
    ip : '12',
    commentId: new ObjectId(),  //评论Id
    threadId: new ObjectId(),    //评论实例Id
    userId: new ObjectId(),        //操作用户Id
    appSecretId : new ObjectId(),  //开发者用户Id
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


test('test report api', function * (t) {
    
    // *  POST   /api/reports[/]        => report.api.create()
    var res = yield testApp
                .post('/api/reports')
                .send(mock)
                .set('x-access-token',tokenRequest)
    var json = res.body.data 
    var savedId = json.result._id

    t.is(200, res.status, 'POST /api/reports pass')
    t.truthy(savedId)
    
    //GET    /api/reports/:id       => reports.api.show()
    res = yield testApp
                .get(`/api/reports/${savedId}`)
                .set('x-access-token',tokenRequest)

    json = res.body.data 
    t.is(200, res.status, `GET /api/reports/${savedId} pass`)
    t.is(mock.ip, json.result.ip)
    
    //GET    /api/reports[/]        => reports.api.list()
    res = yield testApp
                .get('/api/reports')
                .query({
                    where : JSON.stringify({
                        ip : mock.ip
                    })
                })
                .set('x-access-token',tokenRequest)
    json = res.body.data 
    t.is(200, res.status)
    t.is(1, json.result.count)


    //PATCH  /api/reports/:id       => reports.api.update()
    res = yield testApp
                .patch(`/api/reports/${savedId}`)
                .send(mockUpdate)
                .set('x-access-token',tokenRequest)

    json = res.body.data 
    
    t.is(200, res.status, `PATCH /api/reports/${savedId} pass`)

    res = yield testApp
                .get(`/api/reports/${savedId}`)
                .set('x-access-token',tokenRequest)

    json = res.body.data 
    t.is(200, res.status, `GET /api/reports/${savedId} pass`)
    t.not(mock.ip, json.result.ip)


    res = yield testApp
            .del(`/api/reports/${savedId}`)
            .set('x-access-token',tokenRequest)

    t.is(200, res.status)     

    res = yield testApp
            .get(`/api/reports/${savedId}`)
            .set('x-access-token',tokenRequest)

    json = res.body.data 
    t.is(200, res.status)
    t.is('no this data', json.message)   

})




