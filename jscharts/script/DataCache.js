/* global PriceDataUtils, DataAggregator, PriceDataConstants */
/**
 * ---------
 * DataCache
 * ---------
 * @constructor
 * @param {PriceDataLoader} p
 */
function DataCache(p) {
    this._parent = p;
    this._cache = new Object();
    this._count = new Object();
}
/**
 * Insert a FrequencyData object into the cache - if it already exists then
 * simply update the reference count.
 * @param {DataAggregator} d
 */
DataCache.prototype.put = function(d) {
    var key = d._symbol + d._frequency;
    var c = (this._count.hasOwnProperty(key) && this._count[key] !== undefined) ? parseInt(this._count[key], 10) : 0;
    this._count[key] = ++c;
    this._cache[key] = d;
}
/**
 * Get the data for a given symbol and frequency. In the event we don't have it and
 * we're not a root frequency we check to see whether we have the root and if so
 * aggregate the root data to create a new set and store and return that. If we're
 * asking for root data or data for which we have no root data we return null and
 * var the caller deal with it.
 * @param {string} s
 * @param {number} f
 */
DataCache.prototype.get = function(s, f) {
    var key = s + f;
    if (this._cache.hasOwnProperty(key) && this._cache[key] !== undefined) {
        return this._cache[key];
    }
    if (PriceDataUtils.isRootFreq(f)) {
        return undefined;
    }
    var rootKey = s + PriceDataUtils.rootFreq(f);
    if (this._cache.hasOwnProperty(rootKey) && this._cache[rootKey] !== undefined) {
        var r = this._cache[rootKey]; // DataAggregator
        var d = new DataAggregator(r, this._parent.getMasterTimeList(s, f), this._parent.getMasterTimeList(s, PriceDataConstants.FREQUENCY_1), this._parent.getMasterTimeList(s, PriceDataConstants.FREQUENCY_D));
        this._cache[key] = d;
        this._count[key] = 1;
        return d;
    }
    return undefined;
}
/**
 * @param {string} s
 * @param {number} f
 */
DataCache.prototype.count = function(s, f) {
    var key = s + f;
    return (this._count.hasOwnProperty(key) && this._count[key] !== undefined) ? this._count[key] : 0;
}
/**
 * @param {string} s
 * @param {number} f
 */
DataCache.prototype.contains = function(s, f) {
    return this._cache.hasOwnProperty(s + f);
}
/**
 * @param {string} s
 * @param {number} f
 */
DataCache.prototype.canContain = function(s, f) {
    if (this._cache.hasOwnProperty(s + f) && this._cache[s + f] !== undefined) 
        return true;
    return this._cache.hasOwnProperty(s + PriceDataUtils.rootFreq(f)) && this._cache[s + PriceDataUtils.rootFreq(f)] !== undefined;
}
/**
 * @param {string} s
 * @param {number} f
 */
DataCache.prototype.remove = function(s, f) {
    var key = s + f;
    var c = (this._count.hasOwnProperty(key) && this._count[key] !== undefined) ? this._count[key] : 0;
    if (c > 1) {
        this._count[key] = --c;
    } else if (c === 1) {
        if (!PriceDataUtils.isRootFreq(f)) {
            var d = this._cache[key]; // DataAggregator
            d.destroy();
            d = undefined;
            this._count[key] = undefined;
            this._cache[key] = undefined;
        }
    }
}
DataCache.prototype.destroy = function() {
    for (let prop in this._cache) {
        this._cache[prop].destroy();
    }
    this._cache = undefined;
    this._count = undefined;
}