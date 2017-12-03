/**
 * -------------
 * TimeListCache
 * -------------
 * @constructor
 */
function TimeListCache() {
    this._cache = new Object();
    this._count = new Object();
}
/**
 * @private
 * @param {string} s
 */
TimeListCache.prototype._getMarket = function(s) {
    if (!s)
        return "";
    return s.split('^')[0];
}
/**
 * @param {TimeList} tl
 * @param {string} s
 */
TimeListCache.prototype.put = function(tl, s) {
    var key = this._getMarket(s) + tl._frequency;
    var c = (this._count.hasOwnProperty(key) && this._count[key] !== undefined) ? this._count[key] : 0;
    this._count[key] = ++c;
    this._cache[key] = tl;
}
/**
 * @param {string} s
 * @param {string} f
 */
TimeListCache.prototype.get = function(s, f) {
    var key = this._getMarket(s) + f;
    return this._cache[key];
}
/**
 * @param {string} s
 * @param {string} f
 */
TimeListCache.prototype.contains = function(s, f) {
    return this._cache.hasOwnProperty(this._getMarket(s) + f) && this._cache[this._getMarket(s) + f] !== undefined;
}
/**
 * @param {string} s
 * @param {string} f
 */
TimeListCache.prototype.remove = function(s, f) {
    var key = this._getMarket(s) + f;
    var c = (this._count.hasOwnProperty(key) && this._count[key] !== undefined) ? this._count[key] : 0;
    if (c > 1) {
        this._count[key] = --c;
    } else if (c === 1) {
        var d = this._cache[key]; // MasterTimeList
        d.destroy();
        this._count[key] = undefined;
        this._cache[key] = undefined;
    }
}
TimeListCache.prototype.destroy = function() {
    for (var prop in this._cache) {
        this._cache[prop].destroy();
    }
    this._cache = undefined;
    this._count = undefined;
}