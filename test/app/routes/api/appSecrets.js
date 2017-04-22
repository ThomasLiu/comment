import test from 'ava'
import superkoa from 'superkoa'
import config from '../../../../config/sys.js'
//
// var model = 'appSecrets'
//
// var appSecret
//
var mock = {
    appId: '1213',
    appSecret : '123123',
}

var mockUpdate = {
    appId: '1213123',
    appSecret : '123112123',
}
var tokenRequest

test.before('get token before', function *(t) {
    var res = yield superkoa('../../app.js')
                .post('/api/auth')
                .send({
                    'username': config.appId,
                    'password': config.appSecret
                })
    
    var json = res.body.data            

    t.is(200, res.status)
    t.truthy(json.token)

    tokenRequest = json.token
})


/**
 * Auto generate RESTful url routes.
 *
 * URL routes:
 *
 *  GET    /api/appSecrets[/]        => appSecrets.api.list()
 *  GET    /api/appSecrets/:id       => appSecrets.api.show()
 *  POST   /api/appSecrets[/]        => appSecret.api.create()
 *  PATCH  /api/appSecrets/:id       => appSecrets.api.update()
 *  DELETE /api/appSecrets/:id       => appSecrets.api.destroy()
 *
 */

test.only('test appSecret api', function * (t) {
    
    // *  POST   /api/appSecrets[/]        => appSecret.api.create()
    var res = yield superkoa('../../app.js')
                .post('/api/appSecrets')
                .send(mock)
                .set('x-access-token',tokenRequest)
    var json = res.body.data 
    var savedId = json.result._id

    t.is(200, res.status, 'POST /api/appSecrets pass')
    t.truthy(savedId)
    
    //GET    /api/appSecrets/:id       => appSecrets.api.show()
    res = yield superkoa('../../app.js')
                .get(`/api/appSecrets/${savedId}`)
                .set('x-access-token',tokenRequest)

    json = res.body.data 
    t.is(200, res.status, `GET /api/appSecrets/${savedId} pass`)
    t.is(mock.appId, json.result.appId)
    
    //GET    /api/appSecrets[/]        => appSecrets.api.list()
    res = yield superkoa('../../app.js')
                .get('/api/appSecrets')
                .query({
                    where : JSON.stringify({
                        appId : mock.appId
                    })
                })
                .set('x-access-token',tokenRequest)
    json = res.body.data 
    t.is(200, res.status)
    t.is(1, json.result.count)


    //PATCH  /api/appSecrets/:id       => appSecrets.api.update()
    res = yield superkoa('../../app.js')
                .patch(`/api/appSecrets/${savedId}`)
                .send(mockUpdate)
                .set('x-access-token',tokenRequest)

    json = res.body.data 
    
    t.is(200, res.status, `PATCH /api/appSecrets/${savedId} pass`)

    res = yield superkoa('../../app.js')
                .get(`/api/appSecrets/${savedId}`)
                .set('x-access-token',tokenRequest)

    json = res.body.data 
    t.is(200, res.status, `GET /api/appSecrets/${savedId} pass`)
    t.not(mock.appId, json.result.appId)


    res = yield superkoa('../../app.js')
            .del(`/api/appSecrets/${savedId}`)
            .set('x-access-token',tokenRequest)

    t.is(200, res.status)     

    res = yield superkoa('../../app.js')
            .get(`/api/appSecrets/${savedId}`)
            .set('x-access-token',tokenRequest)

    json = res.body.data 
    t.is(200, res.status)
    t.is('no this data', json.message)   

})




