/* eslint no-unused-vars: "off" */
// String class extension
/**
 * @param {...string} strings
 */
String.prototype.format = function(strings) {
    var args = [].slice.call(arguments);
    return this.replace(/(\{\d+\})/g, function (a){
        return args[+(a.substr(1,a.length-2))||0];
    });
}
/**
 * @param {searchString} searchString
 * @param {number=} position
 */
String.prototype.startsWith = function(searchString, position) {
    var start = position;
    if (typeof position === "undefined") {
        start = 0;
    }
    for (var i = 0; i < searchString.length; i++) {
        if (start >= this.length) {
            return false;
        }
        if (this[start] !== searchString[i]) {
            return false;
        }
        start++;
    }
    return true;
}
/**
 * @param {Array} newArray
 */
Array.prototype.difference = function(newArray) {
    var result = this.slice();
    if (typeof newArray == 'undefined')
        return result;
    for (var i = 0; i < result.length; i++) {
        if (newArray.indexOf(result[i]) !== -1) {
            // if has - delete
            result.splice(i, 1);
        }
    }
    return result;
}
/**
 * @param {*} value
 * @param {number=} start
 * @param {number=} end
 */
Array.prototype.fillArrayWithValue = function(value, start, end) {
    var s = start;
    var e = end;
    if (typeof start === "undefined") {
        s = 0;
    }
    if (typeof end === "undefined") {
        e = this.length;
    }
    for (var i = s; i < e; i++) {
        this[i] = value;
    }
}
/**
 * @param {number} target
 * @param {number} start
 * @param {number=} end
 */
Array.prototype.copyWithin = function(target, start, end) {
    // [1, 2, 3, 4, 5].copyWithin(0, 3); => [4, 5, 3, 4, 5]
    var e = end;
    if (typeof end === "undefined") {
        e = this.length;
    }
    var value;
    var j = target;
    for (var i = start; i < e; i++) {
        value = this[i];
        if (j >= this.length) {
            break;
        }
        this[j] = value;
        j++;
    }
}
var Integer = new Object();
/**
 * @param {number} i
 */
Integer.highestOneBit = function(i) {
    // HD, Figure 3-1
    i |= (i >>  1);
    i |= (i >>  2);
    i |= (i >>  4);
    i |= (i >>  8);
    i |= (i >> 16);
    return i - (i >>> 1);
}