# comment

## quick start
```
git clone https://github.com/ThomasLiu/comment.git
cd comment
npm install
```

### Run test
```
npm run test
```

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
每一个Model都有对应的RESTful API，以下已comment这个model为例<br>
GET    /api/comments[/]        => comments.api.list()<br>
GET    /api/comments/:id       => comments.api.show()<br>
POST   /api/comments[/]        => comments.api.create()<br>
PATCH  /api/comments/:id       => comments.api.update()<br>
DELETE /api/comments/:id       => comments.api.destroy()<br>

###### GET    /api/comments[/]



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
message: {type: String},   //文章内容

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

appSecretId : { type: ObjectId , ref: 'AppSecret' },  //开发者用户Id

createAt: { type: Date, default: Date.now },
updateAt: { type: Date, default: Date.now },

```