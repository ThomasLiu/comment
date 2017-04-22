module.exports = {
  db: 'mongodb://' + (process.env.MONGOLAB_URI || '127.0.0.1') + '/comment'
}
