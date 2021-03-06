
### Quick start
```
git clone https://github.com/ThomasLiu/comment.git
cd comment
npm install
```

### Run test
```
npm run test
```
运行test之前需要 通过 GET    /api/appSecrets/new 获取 appId 和 appSecret 然后更新/config/sys.js 内的appId 和 appSecret

### Run 
```
npm start
```

### Run pm2 for production
```
NODE_ENV=production pm2 start bin/www -i 0 --name 'commnet'
```

### Run pm2 for test
```
NODE_ENV=test pm2 start bin/www -i 0 --name 'test-commnet'
```


## API

#### 获取请求appId 和 appSecret
GET    /api/appSecrets/new <br>
请记住您的 appId 和 appSecret，只生成一次。

#### 获取请求Token
POST /api/auth <br>
send : {appId : yourAppId, appSecret : yourAppSecret} 
```
{
    "data": {
        "success":true,
        "message":"Enjoy your data!",
        "token":"yourToken"
    },
    "status":{
        "code":0,
        "msg":"request success!"
        },
    "http_code":200
}
```



#### RESTful API 返回格式都是json
每一个Model都有对应的RESTful API，以下以comment这个model为例<br>
GET    /api/comments[/]        => comments.api.list()<br>
GET    /api/comments/:id       => comments.api.show()<br>
POST   /api/comments[/]        => comments.api.create()<br>
PATCH  /api/comments/:id       => comments.api.update()<br>
DELETE /api/comments/:id       => comments.api.destroy()<br>

##### GET    /api/comments[/]

| 参数           | 类型      | 必填  | 默认值                        | 说明                                                                                    |
| ------------- |:---------:|:----:| :--------------------------  | :--------------------------------------------------------------------------------------|
| page          | int       | 否   | 1                            | 获取列表的第几页                                                                          |
| limit         | int       | 否   | /config/sys.js 的list_count   | 一页中获取多小个对象                                                                      |
| sort          | string    | 否   | '-createdAt'                 | 按照怎样的规则排序，参数规则按mongoose的sort规则，将对例 JSON.stringify({createdAt: -1})       |
| where         | string    | 否   | 默认搜索全部                   | 按照怎样的规则搜索，参数规则按mongoose的find()的参数规则，例 JSON.stringify({attribute1: 'a'}) |
| attributes    | string    | 否   | 默认显示全部                   | 返回的列表对象中的字段，例 JSON.stringify(['attribute1','attribute2','attribute3'])         |
| needCustomer  | int       | 否   | 0                            | 返回对象是否包含关联对象，如userId，当该参数值为1时，对象中就会有user属性，装上userId对应的对象      |

###### 返回json
```
{
    "data": {
        "success":true,
        "message":"Enjoy your data!",
        "result":{
            "count": 2,
            "rows":[
                {commentModel},{commentModel}
            ]
        }
    },
    "status":{
        "code":0,
        "msg":"request success!"
        },
    "http_code":200
}
```

##### GET    /api/comments/:id
| 参数           | 类型      | 必填  | 默认值                        | 说明                                                                                    |
| ------------- |:---------:|:----:| :--------------------------  | :--------------------------------------------------------------------------------------|
| id            | ObjectId  | 是   |                              | 需要获取对象的id                                                                          |
| needCustomer  | int       | 否   | 0                            | 返回对象是否包含关联对象，如userId，当该参数值为1时，对象中就会有user属性，装上userId对应的对象      |

###### 返回json
```
{
    "data": {
        "success":true,
        "message":"Enjoy your data!",
        "result":{commentModel}
    },
    "status":{
        "code":0,
        "msg":"request success!"
        },
    "http_code":200
}
```

##### POST   /api/comments[/]
###### 参数
| 参数           | 类型      | 必填  | 默认值                        | 说明                                                                                    |
| ------------- |:---------:|:----:| :--------------------------  | :--------------------------------------------------------------------------------------|
| message       | string    | 是   | 无                           | 评论内容，可包含html结构                                                                   |
| threadId      | ObjectId  | 是   | 无                           | 评论实例Id                                                                               |
| parentId      | ObjectId  | 否   | 无                           | 回复评论Id                                                                               |
| userJwt       | string    | 是   | 无                           | 评论者Jwt加密                                                                            |

```
//userJwt 生成代码样例
import jwt from 'jsonwebtoken'

var secret = `${yourAppId}|${yourAppSecret}`
var user = {
    name: 'Thomas Lau',
    headimgurl: 'http://image.hiredchina.com/FqaRXhs-501g_Bv0pKAByc91TgqD?imageMogr2/interlace/1',
    lastIp: '192.168.1.1',
    key: '111111'    //自己系统上的ID，用来区分唯一性
}
var userJwt = jwt.sign(user, secret, {
    expiresIn : 60 * 10 // 设置过期时间 10分钟
})
```

###### 返回json
```
{
    "data": {
        "success":true,
        "message":"Enjoy your data!",
        "result":{
            _id: ObjectId
        }
    },
    "status":{
        "code":0,
        "msg":"request success!"
        },
    "http_code":200
}
```

##### PATCH  /api/comments/:id
###### 参数
| 参数           | 类型      | 必填  | 默认值                        | 说明                                                                                    |
| ------------- |:---------:|:----:| :--------------------------  | :--------------------------------------------------------------------------------------|
| id            | ObjectId  | 是   |                              | 需要更新对象的id                                                                          |
将需要更新的对象属性作为参数 post

```
//代码样例
var res = yield testApp
    .post('/api/auth')
    .send({
        'appId': yourAppId,
        'appSecret': yourAppSecret
    })
var json = res.body.data     

var res = yield testApp
    .patch(`/api/comments/${id}`)
    .send({
        message : 'update message'
    })
    .set('x-access-token',json.token)
```

###### 返回json
```
{
    "data": {
        "success":true,
        "message":"update success!",
        "result":{
            "ok":1,
            "nModified":1,
            "n":1
        }
    },
    "status":{
        "code":0,
        "msg":"request success!"
        },
    "http_code":200
}
```

##### DELETE /api/comments/:id 
###### 参数
| 参数           | 类型      | 必填  | 默认值                        | 说明                                                                                    |
| ------------- |:---------:|:----:| :--------------------------  | :--------------------------------------------------------------------------------------|
| id            | ObjectId  | 是   |                              | 需要删除对象的id                                                                          |

###### 返回json
```
{
    "data": {
        "success":true,
        "message":"delete success!"
    },
    "status":{
        "code":0,
        "msg":"request success!"
        },
    "http_code":200
}
```

详细例子可以看测试用例 /test/app/routes/api/comments.js <br>
需求列表所有测试用例 /test/app/routes/api/test.js


#### Models

```
//Comment
ip : {type: String},       //评论者目前Ip
message: {type: String},   //评论内容
status: {type: String},    //评论状态。创建评论时，可能的状态：approved：已经通过；pending：待审核；spam：垃圾评论。

likes : {type: Number, default: 0}, //like 数量
reports : {type: Number, default: 0}, //report 数量
comments : {type: Number, default: 0}, //comment 数量
reposts : {type: Number, default: 0}, //repost 转发数量

rootId: { type: ObjectId , ref: 'Comment' },    //回复评论根Id
parentId: { type: ObjectId , ref: 'Comment' },  //回复评论Id
threadId: { type: ObjectId , ref: 'Thread' },   //评论实例Id
userId: { type: ObjectId , ref: 'User' },       //评论用户Id
appSecretId : { type: ObjectId , ref: 'AppSecret' },  //开发者用户Id

createAt: { type: Date, default: Date.now },
updateAt: { type: Date, default: Date.now },

```

```
//Like
ip : {type: String},
commentId: { type: ObjectId , ref: 'Comment' },  //评论Id
threadId: { type: ObjectId , ref: 'Thread' },    //评论实例Id
userId: { type: ObjectId , ref: 'User' },        //操作用户Id
appSecretId : { type: ObjectId , ref: 'AppSecret' },  //开发者用户Id

createAt: { type: Date, default: Date.now },
updateAt: { type: Date, default: Date.now },

```

```
//Report
ip : {type: String},
message: {type: String},   //评论内容

commentId: { type: ObjectId , ref: 'Comment' },  //评论Id
threadId: { type: ObjectId , ref: 'Thread' },    //评论实例Id
userId: { type: ObjectId , ref: 'User' },        //操作用户Id
appSecretId : { type: ObjectId , ref: 'AppSecret' },  //开发者用户Id

createAt: { type: Date, default: Date.now },
updateAt: { type: Date, default: Date.now },

```

```
//Thread 
ip : {type: String},
title : {type: String},    //文章标题
message: {type: String},   //文章内容
type: {type: String},      //文章类别

likes : {type: Number, default: 0}, //like 数量
reports : {type: Number, default: 0}, //report 数量
comments : {type: Number, default: 0}, //comment 数量
reposts : {type: Number, default: 0}, //repost 转发数量

userId: { type: ObjectId , ref: 'User' },
appSecretId : { type: ObjectId , ref: 'AppSecret' },  //开发者用户Id

createAt: { type: Date, default: Date.now },
updateAt: { type: Date, default: Date.now },

```

```
//User 
name : {type: String},      //评论上显示的名字
headimgurl: {type: String}, //评论上显示的用户头像链接
lastIp : {type: String},    //最后一次登陆的IP
key: {type: String},        //自己系统上的ID，用来区分唯一性

appSecretId : { type: ObjectId , ref: 'AppSecret' },  //开发者用户Id

createAt: { type: Date, default: Date.now },
updateAt: { type: Date, default: Date.now },

```