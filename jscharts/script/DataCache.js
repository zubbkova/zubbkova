/**
 * ---------
 * DataCache
 * ---------
 * @constructor
 * @param {PriceDataLoader} p
 */
function DataCache(p) {
    this._parent = p;
    this._cache = new Map();
    this._count = new Map();
}
/**
 * Insert a FrequencyData object into the cache - if it already exists then
 * simply update the reference count.
 * @param {DataAggregator} d
 */
DataCache.prototype.put = function(d) {
    let key = d._symbol + d._frequency;
    let c = this._count.has(key) ? parseInt(this._count.get(key), 10) : 0;
    this._count.set(key, ++c);
    this._cache.set(key, d);
}
/**
 * Get the data for a given symbol and frequency. In the event we don't have it and
 * we're not a root frequency we check to see whether we have the root and if so
 * aggregate the root data to create a new set and store and return that. If we're
 * asking for root data or data for which we have no root data we return null and
 * let the caller deal with it.
 * @param {string} s
 * @param {number} f
 */
DataCache.prototype.get = function(s, f) {
    let key = s + f;
    if (this._cache.has(key)) {
        return this._cache.get(key);
    }
    if (PriceDataUtils.isRootFreq(f)) {
        return undefined;
    }
    let rootKey = s + PriceDataUtils.rootFreq(f);
    if (this._cache.has(rootKey)) {
        let r = this._cache.get(rootKey); // DataAggregator
        let d = new DataAggregator(r, this._parent.getMasterTimeList(s, f), this._parent.getMasterTimeList(s, PriceDataConstants.FREQUENCY_1), this._parent.getMasterTimeList(s, PriceDataConstants.FREQUENCY_D));
        this._cache.set(key, d);
        this._count.set(key, 1);
        return d;
    }
    return undefined;
}
/**
 * @param {string} s
 * @param {number} f
 */
DataCache.prototype.count = function(s, f) {
    let key = s + f;
    return this._count.has(key) ? this._count.get(key) : 0;
}
/**
 * @param {string} s
 * @param {number} f
 */
DataCache.prototype.contains = function(s, f) {
    return this._cache.has(s + f);
}
/**
 * @param {string} s
 * @param {number} f
 */
DataCache.prototype.canContain = function(s, f) {
    if (this._cache.has(s + f)) 
        return true;
    return this._cache.has(s + PriceDataUtils.rootFreq(f));
}
/**
 * @param {string} s
 * @param {number} f
 */
DataCache.prototype.remove = function(s, f) {
    let key = s + f;
    let c = this._count.has(key) ? this._count.get(key) : 0;
    if (c > 1) {
        this._count.set(key, --c);
    } else if (c === 1) {
        if (!PriceDataUtils.isRootFreq(f)) {
            let d = this._cache.get(key); // DataAggregator
            d.destroy();
            d = undefined;
            this._count.delete(key);
            this._cache.delete(key);
        }
    }
}
DataCache.prototype.destroy = function() {
    this._cache.forEach(function(value, key, map){
        value.destroy();
    });
    this._cache.clear();
    this._count.clear();
    this._cache = undefined;
    this._count = undefined;
}