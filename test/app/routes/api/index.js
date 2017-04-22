import test from 'ava'
import superkoa from 'superkoa'
//
// var model = 'users'
//
// var user
//
// var mockUser = {
//     // 'username': 'alfred',
//     // 'password': '000000'
// }

test.before(function * (t) {
    // var res = yield superkoa('../../app.js')
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
    var res = yield superkoa('../../app.js')
                .get('/api/')
    t.is(200, res.status)

})


//
// // *  GET    /users[/]        => user.list()
// test('GET /' + model, function * (t) {
//    var res = yield superkoa('../../app.js')
//        .get('/' + model)
//
//    t.is(200, res.status)
//    t.regex(res.text, /table/g)
// })
