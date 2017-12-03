/* global RelativeSymbolInfo */
/**
 * --------------------------
 * PercentageChangeSymbolInfo
 * --------------------------
 * @constructor
 * @extends {RelativeSymbolInfo}
 * @param {ChartInfo} base
 * @param {number} startValue
 */
function PercentageChangeSymbolInfo(base, startValue) {
    RelativeSymbolInfo.call(this, base);
    this._startValue = startValue;
}
/**
 * Inheriting
 */
PercentageChangeSymbolInfo.prototype = Object.create(RelativeSymbolInfo.prototype);
PercentageChangeSymbolInfo.prototype.constructor = PercentageChangeSymbolInfo;
PercentageChangeSymbolInfo.prototype.getYesterdaysClose = function() {
    var difference = RelativeSymbolInfo.prototype.getYesterdaysClose.call(this) - this._startValue;
    return 100.0 * (difference / this._startValue);
}
/** @override */
PercentageChangeSymbolInfo.prototype.modify = function(v) {
    return v;
}