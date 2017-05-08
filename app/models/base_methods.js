/**
 * Created by user on 15/6/15.
 */
"use strict"
var tools = require('../common/tools')

module.exports = function (schema) {
    schema.methods.createdAtFormat = function () {
        return tools.formatDate({date: this.createAt})
    }

    schema.methods.updatedAtFormnpmat = function () {
        return tools.formatDate({date: this.updateAt})
    }
    
}
