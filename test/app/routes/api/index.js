import test from 'ava'
import superkoa from 'superkoa'

var testApp = superkoa('../../app.js')
//
// var model = 'users'
//
// var user
//
// var mockUser = {
//     // 'appId': 'alfred',
//     // 'appSecret': '000000'
// }

test.before(function * (t) {
    // var res = yield testApp
    //             .post('/api/auth')
    //             .send(mockUser)
    
    // var json = res.body.data            

    // t.is(200, res.status)
    // t.truthy(json.token)

    // t.context.token = json.token
})

/**
 * Auto generate RESTful url routes.
 *
 * URL routes:
 *
 *  GET    /api[/]        => index.index()
 *
 */

// *  GET    /api[/]        => index.index()
test('GET /api[/]', function * (t) {
    var res = yield testApp
                .get('/api/')
    t.is(200, res.status)

})


//
// // *  GET    /users[/]        => user.list()
// test('GET /' + model, function * (t) {
//    var res = yield testApp
//        .get('/' + model)
//
//    t.is(200, res.status)
//    t.regex(res.text, /table/g)
// })
