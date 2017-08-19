// String class extension
/**
 * @param {...string} strings
 */
String.prototype.format = function (strings) {
    let args = [].slice.call(arguments);
    return this.replace(/(\{\d+\})/g, function (a){
        return args[+(a.substr(1,a.length-2))||0];
    });
}
Set.prototype.toArray = function() {
    let result = [];
    for (let item of this) {
        result.push(item);
    }
    return result;
}
/**
 * @param {Set} newSet
 */
Set.prototype.difference = function(newSet) {
    let result = new Set(this.values());
    for (let item of result) {
        if (newSet.has(item)) {
            result.delete(item);
        }
    }
    return result;
}
var Integer = {};
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