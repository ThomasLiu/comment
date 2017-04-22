import test from 'ava'
import superkoa from 'superkoa'
import config from '../../../../config/sys'
import mongoose from 'mongoose'
var ObjectId = mongoose.Types.ObjectId

var testApp = superkoa('../../app.js')

var mock = {
    name : '1',      //评论上显示的名字
    headimgurl: '1', //评论上显示的用户头像链接
    lastIp : '1',    //最后一次登陆的IP

    appSecretId : new ObjectId(),  //开发者用户Id

}

var mockUpdate = {
    name : '12',      //评论上显示的名字
    headimgurl: '12', //评论上显示的用户头像链接
    lastIp : '12',    //最后一次登陆的IP

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


test('test user api', function * (t) {
    
    // *  POST   /api/users[/]        => user.api.create()
    var res = yield testApp
                .post('/api/users')
                .send(mock)
                .set('x-access-token',tokenRequest)
    var json = res.body.data 
    var savedId = json.result._id

    t.is(200, res.status, 'POST /api/users pass')
    t.truthy(savedId)
    
    //GET    /api/users/:id       => users.api.show()
    res = yield testApp
                .get(`/api/users/${savedId}`)
                .set('x-access-token',tokenRequest)

    json = res.body.data 
    t.is(200, res.status, `GET /api/users/${savedId} pass`)
    t.is(mock.name, json.result.name)
    
    //GET    /api/users[/]        => users.api.list()
    res = yield testApp
                .get('/api/users')
                .query({
                    where : JSON.stringify({
                        name : mock.name
                    })
                })
                .set('x-access-token',tokenRequest)
    json = res.body.data 
    t.is(200, res.status)
    t.is(1, json.result.count)


    //PATCH  /api/users/:id       => users.api.update()
    res = yield testApp
                .patch(`/api/users/${savedId}`)
                .send(mockUpdate)
                .set('x-access-token',tokenRequest)

    json = res.body.data 
    
    t.is(200, res.status, `PATCH /api/users/${savedId} pass`)

    res = yield testApp
                .get(`/api/users/${savedId}`)
                .set('x-access-token',tokenRequest)

    json = res.body.data 
    t.is(200, res.status, `GET /api/users/${savedId} pass`)
    t.not(mock.name, json.result.name)


    res = yield testApp
            .del(`/api/users/${savedId}`)
            .set('x-access-token',tokenRequest)

    t.is(200, res.status)     

    res = yield testApp
            .get(`/api/users/${savedId}`)
            .set('x-access-token',tokenRequest)

    json = res.body.data 
    t.is(200, res.status)
    t.is('no this data', json.message)   

})




