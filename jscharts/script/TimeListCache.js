/**
 * -------------
 * TimeListCache
 * -------------
 * @constructor
 */
function TimeListCache() {
    this._cache = new Map();
    this._count = new Map();
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
    let key = this._getMarket(s) + tl._frequency;
    let c = this._count.has(key) ? this._count.get(key) : 0;
    this._count.set(key, ++c);
    this._cache.set(key, tl);
}
/**
 * @param {string} s
 * @param {string} f
 */
TimeListCache.prototype.get = function(s, f) {
    let key = this._getMarket(s) + f;
    return this._cache.get(key);
}
/**
 * @param {string} s
 * @param {string} f
 */
TimeListCache.prototype.contains = function(s, f) {
    return this._cache.has(this._getMarket(s) + f);
}
/**
 * @param {string} s
 * @param {string} f
 */
TimeListCache.prototype.remove = function(s, f) {
    let key = this._getMarket(s) + f;
    let c = this._count.has(key) ? this._count.get(key) : 0;
    if (c > 1) {
        this._count.set(key, --c);
    } else if (c === 1) {
        let d = this._cache.get(key); // MasterTimeList
        d.destroy();
        this._count.delete(key);
        this._cache.delete(key);
    }
}
TimeListCache.prototype.destroy = function() {
    this._cache.forEach(function(value, key, map){
        value.destroy();
    });
    this._cache.clear();
    this._count.clear();
    this._cache = undefined;
    this._count = undefined;
}