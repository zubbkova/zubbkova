/* exported CacheIndexEntry */
/**
 * ---------------
 * CacheIndexEntry
 * ---------------
 * @constructor
 * @param {number} s - startDate
 * @param {number} e - endDate
 * @param {number} c - clearCache
 */
function CacheIndexEntry(s, e, c) {
    this._startDate = s;
    this._endDate = e;
    this._clearCache = c;
    this._crc = 0;
}