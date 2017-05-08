import test from 'ava'
import superkoa from 'superkoa'
import jwt from 'jsonwebtoken'
import config from '../../../../config/sys'
import mongoose from 'mongoose'
var ObjectId = mongoose.Types.ObjectId

var testApp = superkoa('../../app.js')

var secret = `${config.appId}|${config.appSecret}`
var user1 = {
    name: 'Thomas Lau',
    headimgurl: 'http://image.hiredchina.com/FqaRXhs-501g_Bv0pKAByc91TgqD?imageMogr2/interlace/1',
    lastIp: '192.168.1.1',
    key: '111111'
}
var user2 = {
    name: 'Cow',
    headimgurl: 'http://image.hiredchina.com/5840edba54b7d.png?imageMogr2/interlace/1',
    lastIp: '192.168.1.1',
    key: '222222'
}
var userJwt1 = jwt.sign(user1, secret, {
    expiresIn : 60 * 10 // 设置过期时间 10分钟
})
var userJwt2 = jwt.sign(user2, secret, {
    expiresIn : 60 * 10 // 设置过期时间 10分钟
})

var comment1 = {
    ip: '192.168.1.1',
    message: 'this is message1',
}

var comment2 = {
    ip: '192.168.1.2',
    message: 'this is message2 , <img src="http://image.hiredchina.com/FqaRXhs-501g_Bv0pKAByc91TgqD?imageMogr2/interlace/1" style="width: 50px;height : 50px;">',
}

var comment3 = {
    ip: '192.168.1.3',
    message: 'this is message3',
}


var thread1 = {
    ip: '192.168.1.1',
    title: 'Thread1',
    message: 'this is Thread <img src="http://image.hiredchina.com/FqaRXhs-501g_Bv0pKAByc91TgqD?imageMogr2/interlace/1" style="width: 50px;height : 50px;">',
    type: 'img',
}

var thread2 = {
    ip: '192.168.1.2',
    title: 'Thread2',
    message: 'this is Thread',
    type: 'text',
}

var reportThread = {
    ip: '192.168.1.4',
    message: 'this is Report Thread',
}

var reportComment = {
    ip: '192.168.1.3',
    message: 'this is Report Comment',
}

var tokenRequest

test.before(function * (t) {
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


test.only('test all', function * (t) {
    //文章1为用户1所创作
    thread1.userJwt = userJwt1
    //创建文章1
    var res = yield testApp
                .post('/api/threads')
                .send(thread1)
                .set('x-access-token',tokenRequest)
    var json = res.body.data 
    var savedThread1 = json.result
    var thread1Id = savedThread1._id
    var user1Id = savedThread1.userId

    t.is(200, res.status)
    t.truthy(thread1Id)
    t.truthy(user1Id)

    //检查文章1是否在数据库
    res = yield testApp
                .get(`/api/threads/${thread1Id}`)
                .set('x-access-token',tokenRequest)

    json = res.body.data 
    t.is(200, res.status)
    t.is(thread1.title, json.result.title)
    t.is(user1Id, json.result.userId)
    t.is(0, json.result.likes)
    t.is(0, json.result.reports)
    t.is(0, json.result.comments)
    t.is(0, json.result.reposts)

    //检查用户1是否在数据库
    res = yield testApp
            .get(`/api/users/${user1Id}`)
            .set('x-access-token',tokenRequest)
    
    json = res.body.data 
    t.is(200, res.status)
    t.is(user1.name, json.result.name)

    //取出文章1的关联实体
    res = yield testApp
                .get(`/api/threads/${thread1Id}?needCustomer=1`)
                .set('x-access-token',tokenRequest)

    json = res.body.data 
    t.is(200, res.status)
    t.truthy(json.result.user)
    t.is(user1.name, json.result.user.name)


    //评论1为用户1的评论
    comment1.userJwt = userJwt1
    //评论1为文章1的评论
    comment1.threadId = thread1Id
    //创建评论1
    res = yield testApp
                .post('/api/comments')
                .send(comment1)
                .set('x-access-token',tokenRequest)
    json = res.body.data 
    var savedComment1 = json.result
    var comment1Id = savedComment1._id

    t.is(200, res.status)
    t.truthy(comment1Id)
    t.truthy(savedComment1.userId)
    
    //检查评论1是否在数据库
    res = yield testApp
                .get(`/api/comments/${comment1Id}`)
                .set('x-access-token',tokenRequest)

    json = res.body.data 
    t.is(200, res.status)
    t.is(comment1.message, json.result.message)
    t.is(user1Id, json.result.userId)
    t.is(0, json.result.likes)
    t.is(0, json.result.reports)
    t.is(0, json.result.comments)
    t.is(0, json.result.reposts)

    

    //检查用户1的key是否在数据库只有一个
    res = yield testApp
                .get('/api/users')
                .query({
                    where : JSON.stringify({
                        key : user1.key
                    })
                })
                .set('x-access-token',tokenRequest)
    json = res.body.data 
    t.is(200, res.status)
    t.is(1, json.result.count)

    //评论2为用户2的评论
    comment2.userJwt = userJwt2
    //评论2为评论1的评论
    comment2.parentId = comment1Id

    //创建评论2
    res = yield testApp
                .post('/api/comments')
                .send(comment2)
                .set('x-access-token',tokenRequest)
    json = res.body.data 
    var savedComment2 = json.result
    var comment2Id = savedComment2._id
    var user2Id = savedComment2.userId

    t.is(200, res.status)
    t.truthy(comment2Id)
    t.truthy(savedComment2.userId)

    //检查评论2是否在数据库
    res = yield testApp
                .get(`/api/comments/${comment2Id}`)
                .set('x-access-token',tokenRequest)

    json = res.body.data 
    t.is(200, res.status)
    t.is(comment2.message, json.result.message)
    t.is(user2Id, json.result.userId)
    t.is(comment1Id, json.result.rootId)
    t.is(comment1Id, json.result.parentId)
    t.is(thread1Id, json.result.threadId)
    t.is(0, json.result.likes)
    t.is(0, json.result.reports)
    t.is(0, json.result.comments)
    t.is(0, json.result.reposts)


    //检查文章1评论数
    res = yield testApp
                .get(`/api/threads/${thread1Id}`)
                .set('x-access-token',tokenRequest)

    json = res.body.data 
    t.is(200, res.status)
    t.is(2, json.result.comments)

    //检查评论1评论数
    res = yield testApp
                .get(`/api/comments/${comment1Id}`)
                .set('x-access-token',tokenRequest)

    json = res.body.data 
    t.is(200, res.status)
    t.is(1, json.result.comments)


    //评论3为用户1的评论
    comment3.userJwt = userJwt1
    //评论3为评论2的评论
    comment3.parentId = comment2Id

    //创建评论3
    res = yield testApp
                .post('/api/comments')
                .send(comment3)
                .set('x-access-token',tokenRequest)
    json = res.body.data 
    var savedComment3 = json.result
    var comment3Id = savedComment3._id

    t.is(200, res.status)
    t.truthy(comment3Id)
    t.truthy(savedComment3.userId)


    //取出评论3的关联实体
    res = yield testApp
                .get(`/api/comments/${comment3Id}?needCustomer=1`)
                .set('x-access-token',tokenRequest)

    json = res.body.data 
    t.is(200, res.status)

    t.truthy(json.result.user)
    t.is(user1.name, json.result.user.name)

    t.truthy(json.result.thread)
    t.is(thread1.title, json.result.thread.title)

    t.truthy(json.result.thread.user)
    t.is(user1.name, json.result.thread.user.name)

    t.truthy(json.result.root)
    t.is(comment1.message, json.result.root.message)

    t.truthy(json.result.parent)
    t.is(comment2.message, json.result.parent.message)

    t.truthy(json.result.root.user)
    t.is(user1.name, json.result.root.user.name)

    t.truthy(json.result.parent.user)
    t.is(user2.name, json.result.parent.user.name)
    t.is(0, json.result.likes)
    t.is(0, json.result.reports)
    t.is(0, json.result.comments)
    t.is(0, json.result.reposts)


    //检查文章1评论数
    res = yield testApp
                .get(`/api/threads/${thread1Id}`)
                .set('x-access-token',tokenRequest)

    json = res.body.data 
    t.is(200, res.status)
    t.is(3, json.result.comments)
    t.is(0, json.result.likes)
    t.is(0, json.result.reports)
    t.is(0, json.result.reposts)

    //检查评论1评论数
    res = yield testApp
                .get(`/api/comments/${comment1Id}`)
                .set('x-access-token',tokenRequest)

    json = res.body.data 
    t.is(200, res.status)
    t.is(2, json.result.comments)
    t.is(0, json.result.likes)
    t.is(0, json.result.reports)
    t.is(0, json.result.reposts)

    //检查评论2评论数
    res = yield testApp
                .get(`/api/comments/${comment2Id}`)
                .set('x-access-token',tokenRequest)

    json = res.body.data 
    t.is(200, res.status)
    t.is(1, json.result.comments)
    t.is(0, json.result.likes)
    t.is(0, json.result.reports)
    t.is(0, json.result.reposts)

    //文章举报为用户1的举报，为文章1的举报
    reportThread.userJwt = userJwt1
    reportThread.threadId = thread1Id

    //创建文章举报
    res = yield testApp
                .post('/api/reports')
                .send(reportThread)
                .set('x-access-token',tokenRequest)
    json = res.body.data 
    var savedReportThread = json.result
    var reportThreadId = savedReportThread._id

    t.is(200, res.status)
    t.truthy(reportThreadId)
    t.truthy(savedReportThread.userId)

    //取出文章举报的关联实体
    res = yield testApp
                .get(`/api/reports/${reportThreadId}?needCustomer=1`)
                .set('x-access-token',tokenRequest)

    json = res.body.data 
    t.is(200, res.status)

    t.is(reportThread.message, json.result.message)

    t.truthy(json.result.user)
    t.is(user1.name, json.result.user.name)

    t.truthy(json.result.thread)
    t.is(thread1.title, json.result.thread.title)

    t.truthy(json.result.thread.user)
    t.is(user1.name, json.result.thread.user.name)


    //评论举报为用户2的举报，为评论3的举报
    reportComment.userJwt = userJwt2
    reportComment.commentId = comment3Id

    //创建评论举报
    res = yield testApp
                .post('/api/reports')
                .send(reportComment)
                .set('x-access-token',tokenRequest)
    json = res.body.data 
    var savedReportComment = json.result
    var reportCommentId = savedReportComment._id

    t.is(200, res.status)
    t.truthy(reportCommentId)
    t.truthy(savedReportComment.userId)

    //取出评论举报的关联实体
    res = yield testApp
                .get(`/api/reports/${reportCommentId}?needCustomer=1`)
                .set('x-access-token',tokenRequest)

    json = res.body.data 
    t.is(200, res.status)

    t.is(reportComment.message, json.result.message)

    t.truthy(json.result.user)
    t.is(user2.name, json.result.user.name)

    t.truthy(json.result.comment)
    t.is(comment3.message, json.result.comment.message)

    t.truthy(json.result.comment.user)
    t.is(user1.name, json.result.comment.user.name)

    //检查文章1举报数
    res = yield testApp
                .get(`/api/threads/${thread1Id}`)
                .set('x-access-token',tokenRequest)

    json = res.body.data 
    t.is(200, res.status)
    t.is(3, json.result.comments)
    t.is(0, json.result.likes)
    t.is(1, json.result.reports)
    t.is(0, json.result.reposts)

    //检查评论1举报数
    res = yield testApp
                .get(`/api/comments/${comment1Id}`)
                .set('x-access-token',tokenRequest)

    json = res.body.data 
    t.is(200, res.status)
    t.is(2, json.result.comments)
    t.is(0, json.result.likes)
    t.is(0, json.result.reports)
    t.is(0, json.result.reposts)

    //检查评论2举报数
    res = yield testApp
                .get(`/api/comments/${comment2Id}`)
                .set('x-access-token',tokenRequest)

    json = res.body.data 
    t.is(200, res.status)
    t.is(1, json.result.comments)
    t.is(0, json.result.likes)
    t.is(0, json.result.reports)
    t.is(0, json.result.reposts)

    //检查评论3举报数
    res = yield testApp
                .get(`/api/comments/${comment3Id}`)
                .set('x-access-token',tokenRequest)

    json = res.body.data 
    t.is(200, res.status)
    t.is(0, json.result.comments)
    t.is(0, json.result.likes)
    t.is(1, json.result.reports)
    t.is(0, json.result.reposts)


    //用户1对文章1点赞
    res = yield testApp
                .post('/api/likes')
                .send({
                    threadId: thread1Id,
                    userJwt: userJwt1
                })
                .set('x-access-token',tokenRequest)
    json = res.body.data 
    var savedLikeThread = json.result
    var likeThreadId = savedLikeThread._id

    t.is(200, res.status)
    t.truthy(likeThreadId)
    t.truthy(savedLikeThread.userId)

    //取出文章点赞的关联实体
    res = yield testApp
                .get(`/api/likes/${likeThreadId}?needCustomer=1`)
                .set('x-access-token',tokenRequest)

    json = res.body.data 
    t.is(200, res.status)

    t.truthy(json.result.user)
    t.is(user1.name, json.result.user.name)

    t.truthy(json.result.thread)
    t.is(thread1.title, json.result.thread.title)

    t.truthy(json.result.thread.user)
    t.is(user1.name, json.result.thread.user.name)

    //用户1对评论2点赞
    res = yield testApp
                .post('/api/likes')
                .send({
                    commentId: comment2Id,
                    userJwt: userJwt1
                })
                .set('x-access-token',tokenRequest)
    json = res.body.data 
    var savedLikeComment = json.result
    var likeCommentId = savedLikeComment._id

    t.is(200, res.status)
    t.truthy(likeCommentId)
    t.truthy(savedLikeComment.userId)


    //取出评论点赞的关联实体
    res = yield testApp
                .get(`/api/likes/${likeCommentId}?needCustomer=1`)
                .set('x-access-token',tokenRequest)

    json = res.body.data 
    t.is(200, res.status)

    t.truthy(json.result.user)
    t.is(user1.name, json.result.user.name)

    t.truthy(json.result.comment)
    t.is(comment2.message, json.result.comment.message)

    t.truthy(json.result.comment.user)
    t.is(user2.name, json.result.comment.user.name)


    //检查文章1点赞数
    res = yield testApp
                .get(`/api/threads/${thread1Id}`)
                .set('x-access-token',tokenRequest)

    json = res.body.data 
    t.is(200, res.status)
    t.is(3, json.result.comments)
    t.is(1, json.result.likes)
    t.is(1, json.result.reports)
    t.is(0, json.result.reposts)

    //检查评论1点赞数
    res = yield testApp
                .get(`/api/comments/${comment1Id}`)
                .set('x-access-token',tokenRequest)

    json = res.body.data 
    t.is(200, res.status)
    t.is(2, json.result.comments)
    t.is(0, json.result.likes)
    t.is(0, json.result.reports)
    t.is(0, json.result.reposts)

    //检查评论2点赞数
    res = yield testApp
                .get(`/api/comments/${comment2Id}`)
                .set('x-access-token',tokenRequest)

    json = res.body.data 
    t.is(200, res.status)
    t.is(1, json.result.comments)
    t.is(1, json.result.likes)
    t.is(0, json.result.reports)
    t.is(0, json.result.reposts)

    //检查评论3点赞数
    res = yield testApp
                .get(`/api/comments/${comment3Id}`)
                .set('x-access-token',tokenRequest)

    json = res.body.data 
    t.is(200, res.status)
    t.is(0, json.result.comments)
    t.is(0, json.result.likes)
    t.is(1, json.result.reports)
    t.is(0, json.result.reposts)


    //文章2为用户2所创作
    thread2.userJwt = userJwt2
    //创建文章2
    var res = yield testApp
                .post('/api/threads')
                .send(thread2)
                .set('x-access-token',tokenRequest)
    var json = res.body.data 
    var savedThread2 = json.result
    var thread2Id = savedThread2._id

    t.is(200, res.status)
    t.truthy(thread2Id)
    t.truthy(savedThread2.userId)


    //获取评论最多的文章
    res = yield testApp
                .get('/api/threads')
                .query({
                    limit: 1,
                    sortby: '-comments'
                })
                .set('x-access-token',tokenRequest)
    json = res.body.data 
    t.is(200, res.status)
    t.is(thread1.title, json.result.rows[0].title)


    //获取文章1内的评论，按点赞排序
    res = yield testApp
                .get('/api/comments')
                .query({
                    where : JSON.stringify({
                        threadId : thread1Id
                    }),
                    sortby: '-likes'
                })
                .set('x-access-token',tokenRequest)
    json = res.body.data 
    t.is(200, res.status)
    t.is(3, json.result.count)
    t.is(comment2.message, json.result.rows[0].message)



    // //取消文章点赞
    // res = yield testApp
    //         .del(`/api/likes/${likeThreadId}`)
    //         .set('x-access-token',tokenRequest)

    // t.is(200, res.status) 
    // //检查文章1点赞数
    // res = yield testApp
    //             .get(`/api/threads/${thread1Id}`)
    //             .set('x-access-token',tokenRequest)

    // json = res.body.data 
    // t.is(200, res.status)
    // t.is(3, json.result.comments)
    // t.is(0, json.result.likes)
    // t.is(1, json.result.reports)
    // t.is(0, json.result.reposts)

    // //取消评论点赞
    // res = yield testApp
    //         .del(`/api/likes/${likeCommentId}`)
    //         .set('x-access-token',tokenRequest)

    // t.is(200, res.status) 
    // //检查评论2点赞数
    // res = yield testApp
    //             .get(`/api/comments/${comment2Id}`)
    //             .set('x-access-token',tokenRequest)

    // json = res.body.data 
    // t.is(200, res.status)
    // t.is(1, json.result.comments)
    // t.is(0, json.result.likes)
    // t.is(0, json.result.reports)
    // t.is(0, json.result.reposts)

    // //取消文章举报
    // res = yield testApp
    //         .del(`/api/reports/${reportThreadId}`)
    //         .set('x-access-token',tokenRequest)

    // t.is(200, res.status) 
    // //检查文章1举报数
    // res = yield testApp
    //             .get(`/api/threads/${thread1Id}`)
    //             .set('x-access-token',tokenRequest)

    // json = res.body.data 
    // t.is(200, res.status)
    // t.is(3, json.result.comments)
    // t.is(0, json.result.likes)
    // t.is(0, json.result.reports)
    // t.is(0, json.result.reposts)

    // //取消评论举报
    // res = yield testApp
    //         .del(`/api/reports/${reportCommentId}`)
    //         .set('x-access-token',tokenRequest)

    // t.is(200, res.status) 
    // //检查评论3点举报
    // res = yield testApp
    //             .get(`/api/comments/${comment3Id}`)
    //             .set('x-access-token',tokenRequest)

    // json = res.body.data 
    // t.is(200, res.status)
    // t.is(0, json.result.comments)
    // t.is(0, json.result.likes)
    // t.is(0, json.result.reports)
    // t.is(0, json.result.reposts)


    // res = yield testApp
    //         .del(`/api/comments/${comment1Id}`)
    //         .set('x-access-token',tokenRequest)
    // res = yield testApp
    //         .del(`/api/comments/${comment2Id}`)
    //         .set('x-access-token',tokenRequest)
    // res = yield testApp
    //         .del(`/api/comments/${comment3Id}`)
    //         .set('x-access-token',tokenRequest)
    // res = yield testApp
    //         .del(`/api/threads/${thread1Id}`)
    //         .set('x-access-token',tokenRequest)
    // res = yield testApp
    //         .del(`/api/threads/${thread2Id}`)
    //         .set('x-access-token',tokenRequest)
    // res = yield testApp
    //         .del(`/api/users/${user1Id}`)
    //         .set('x-access-token',tokenRequest)
    // res = yield testApp
    //         .del(`/api/users/${user2Id}`)
    //         .set('x-access-token',tokenRequest)


})
