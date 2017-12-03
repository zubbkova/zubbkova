/* global RelativeSymbolInfo */
/**
 * --------------------
 * RelativeToSymbolInfo
 * --------------------
 * @constructor
 * @extends {RelativeSymbolInfo}
 * @param {ChartInfo} base
 * @param {number} rp - relative price
 */
function RelativeToSymbolInfo(base, rp) {
    RelativeSymbolInfo.call(this, base);
    this._relativePrice = (rp === 0.0) ? 1 : rp;
}
/**
 * Inheriting
 */
RelativeToSymbolInfo.prototype = Object.create(RelativeSymbolInfo.prototype);
RelativeToSymbolInfo.prototype.constructor = RelativeToSymbolInfo;
RelativeToSymbolInfo.prototype.getYesterdaysClose = function() {
    return 0.0;
}
/**
 * @param {number} v
 */
RelativeToSymbolInfo.prototype.modify = function(v) {
    return v / this._relativePrice;
}