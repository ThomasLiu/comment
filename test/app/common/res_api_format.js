import test from 'ava'
import res_api_format from '../../../app/common/res_api_format.js'

//res_api_format.api
test('res_api_format.api 1 arguments', t => {
    var json = res_api_format.api(1),
        data = json.data,
        status = json.status,
        http_code = json.http_code

    //one    
    t.is(data, 1, 'one data')   
    t.is(http_code, 200, 'one http_code')   
    t.is(status.code, 0, 'one status.code')
    t.is(status.msg, 'request success!', 'one status.code')    
})

test('res_api_format.api 2 arguments', t => {
    var json = res_api_format.api(1,{
            code: 200,
            msg: 'request success!'
        }),
        data = json.data,
        status = json.status,
        http_code = json.http_code

    //two    
    t.is(data, 1, 'two data')   
    t.is(http_code, 200, 'two http_code')   
    t.is(status.code, 200, 'two status.code')
    t.is(status.msg, 'request success!', 'two status.code')    
})

test('res_api_format.api 3 arguments', t => {
    var json = res_api_format.api(300,1,{
            code: 200,
            msg: 'request success!'
        }),
        data = json.data,
        status = json.status,
        http_code = json.http_code

    //three    
    t.is(data, 1, 'three data')   
    t.is(http_code, 300, 'three http_code')   
    t.is(status.code, 200, 'three status.code')
    t.is(status.msg, 'request success!', 'three status.code')    
})

test('res_api_format.api 3 arguments', t => {
    var json = res_api_format.api(),
        data = json.data,
        status = json.status,
        http_code = json.http_code

    //else    
    t.truthy(data, 'else data')   
    t.is(http_code, 200, 'else http_code')   
    t.is(status.code, 222222222, 'else status.code')
    t.is(status.msg, 'res.api params error or res is not a express.response object!', 'else status.code')    
})

//res_api_format.api_error
test('res_api_format.api_error', t => {
    var json = res_api_format.api_error(1),
        data = json.data,
        status = json.status,
        http_code = json.http_code

    t.is(data, 1, 'api_error data')   
    t.is(http_code, 200, 'api_error http_code')   
    t.is(status.code, -1, 'api_error status.code')
    t.is(status.msg, 'api error', 'api_error status.code')       

})