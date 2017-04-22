



var log = function (logger, txt, that) {
    logger.info(`${that.method} ${txt}, query: ${JSON.stringify(that.query)}, params: ${JSON.stringify(that.params)}, body: ${JSON.stringify(that.request.body)}`)
}

module.exports = log