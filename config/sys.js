var config = {
  name: 'Comment api', // 网站名名字
  description: 'Comment api', // 网站的描述
  keywords: 'Comment; api',

  session_secret: 'comment_secret', // 务必修改
  auth_cookie_name: 'comment',

  port: 3000,

  list_count: 20,

  host: 'http://localhost:3008',
  appId: 'd41d8cd98f00b204e9800998ecf8427e',
  appSecret: 'abf5b082009649ca1b2f6136e8e75e7c'
}

if (process.env.NODE_ENV === 'production') {
  config.host = 'http://comment.guideinchina.cn'
} else if (process.env.NODE_ENV === 'test') {
  config.host = 'http://test.comment.guideinchina.cn'
  config.port = 3100
}

module.exports = config
