
// url转化
function urlencode (data, limit) {
    var _result = [];
    for (var key in data) {
        var value = data[key];
        if (value.constructor == Array) {
            var _value = value.join(limit || ",");
            _result.push(key + "=" + _value);
        } else if (value.constructor == Object) {
            _result.push(key + '=' + JSON.stringify(value));
        } else {
            _result.push(key + '=' + value);
        }
    }

    return _result.join('&');
}

module.exports = {
    urlencode: urlencode
};