
const logger = require('../common/logger')(__filename.replace(__dirname, ''))

class BaseModel {
    constructor(model) {
        this.model = model
    }

    findById (id) {
        var Model = this.model
        return new Promise(function(resolve, reject) {
            Model.findOne({_id: id}, function (err, result) {
                if (err) {
                    logger.error(`findById err : ${err}`)
                    reject(err)
                } else {
                    resolve(result)
                }
            })
        })
    }

    findAndCountAll ({
        where, offset, limit, order = '-createdAt', field = {}
    }) {
        var Model = this.model
        return new Promise(function(resolve, reject) {

            Model.count(where, function (countErr, count){
                if (countErr) {
                    logger.error(`findAndCountAll countErr : ${countErr}`)
                    reject(countErr)
                } else if (count === 0) {
                    resolve({ count: 0 , rows: []})
                }else {
                    Model.find(
                        where, 
                        field , 
                        {   
                            skip: offset, 
                            limit: limit, 
                            sort: order
                        }, function (err, result) {
                            if (err) {
                                logger.error(`findAndCountAll err : ${err}`)
                                reject(err)
                            } else {
                                resolve({ count: count , rows: result})
                            }
                    })
                }
            })
        })
    }

    destroy (delObj) {
        var Model = this.model
        return new Promise(function(resolve, reject) {
            Model.remove(delObj, function (err, result) {
                if (err) {
                    logger.error(`destroy err : ${err}`)
                    reject(err)
                } else {
                    resolve(result)
                }
            })
        })
    }

    create (obj) {
        var Model = this.model
        return new Promise(function(resolve, reject) {
            (new Model(obj)).save(function (err, result) {
                if (err) {
                    logger.error(`create err : ${err}`)
                    reject(err)
                } else {
                    resolve(result)
                }
            })
        })
    }

    update (updateObj, id) {
        var Model = this.model
        return new Promise(function(resolve, reject) {
            Model.update({_id: id}, {$set: updateObj}, function (err, result) {
                if (err) {
                    logger.error(`update err : ${err}`)
                    reject(err)
                } else {
                    resolve(result)
                }
            })
        })
    }

}


module.exports = BaseModel