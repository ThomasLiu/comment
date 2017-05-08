const validator = require('validator')
var moment = require('moment')

moment.locale('zh-cn') // 使用中文

// 格式化时间
exports.formatDate = function ({date, fromat}) {
    date = moment(date);

    if(fromat){
        return date.format(fromat);
    }else {
        return date.format('YYYY-MM-DD HH:mm');
    }
}

exports.validateId = function (str) {
    return (/^[a-zA-Z0-9\-_]+$/i).test(str)
}

exports.toUrlFormat = function (str) {
  var temp = str.toLowerCase()
  
  if (temp.indexOf('https://') >= 0) {
    temp = str.substring('https://'.length,temp.length)
    temp = 'https://' + temp
  } else if (temp.indexOf('http://') >= 0){
    temp = str.substring('http://'.length,temp.length)
    temp = 'http://' + temp
  } else {
    temp = 'http://' + str
  }
  return temp
}

exports.objArrayToIdStr = function (inputArray, fild) {
    fild = fild || 'id'
    var array = new Array()
    for (var index in inputArray){
        var item = inputArray[index]
        if(item[fild]){
            array.push(item[fild])
        }
    }
    return array.join(',')
}




