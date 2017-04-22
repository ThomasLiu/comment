import test from 'ava'
import authServices from '../../../app/services/auth.js'

test.beforeEach('init data', t => {
    var body = {
        username: 'test',
        password: 'test'
    }, baseCheckRequest = {
        err: null,
        json: {
            data: {
                success: true,
                message: 'Enjoy your Data!',
                roleType: 1,
                clientId: 1
            }
        }
    }
    t.context.body = body
    t.context.baseCheckRequest = baseCheckRequest
})

// *  authServices.check
test('authServices.check normal', t => {
    var check = authServices.check(t.context.body, t.context.baseCheckRequest)
    , data = check.data  
    , status = check.status

    //normal test
    t.is(true, data.success, 'normal success')
    t.is(1, data.roleType, 'normal roleType')
    t.is(1, data.clientId, 'normal clientId')
    t.is('Enjoy your Data!', data.message, 'normal message')
    t.is(0, status.code, 'normal code')
    t.is('request success!', status.msg, 'normal success')
})

test('authServices.check Lack of username', t => {
    t.context.body.username = undefined
    var check = authServices.check(t.context.body, t.context.baseCheckRequest)
    , data = check.data  
    , status = check.status

    t.is('Please enter the username', data.message, 'Lack of parameter test')
})

test('authServices.check Lack of password', t => {
    t.context.body.password = undefined
    var check = authServices.check(t.context.body, t.context.baseCheckRequest)
    , data = check.data  
    , status = check.status

    t.is('Please enter the password', data.message, 'Lack of parameter test')
})

test('authServices.check err', t => {
    t.context.baseCheckRequest.err = 'test err'
    var check = authServices.check(t.context.body, t.context.baseCheckRequest)
    , data = check.data  
    , status = check.status

    t.is(t.context.baseCheckRequest.err, data.message, 'baseCheckRequest err test')
})

test('authServices.check baseCheckRequest success false', t => {
    t.context.baseCheckRequest.json.data.success = false
    t.context.baseCheckRequest.json.data.message = 'test err'
    var check = authServices.check(t.context.body, t.context.baseCheckRequest)
    , data = check.data  
    , status = check.status

    t.is(t.context.baseCheckRequest.json.data.message, data.message, 'baseCheckRequest success false')
})
