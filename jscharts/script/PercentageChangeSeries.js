/**
 * ----------------------
 * PercentageChangeSeries
 * ----------------------
 * @constructor
 * @extends {RelativeSeries}
 * @param {DataSeries} b
 * @param {ChartSymbolSet} css
 */
function PercentageChangeSeries(b, css) {
    RelativeSeries.call(this, b, css);
}
/**
 * Inheriting
 */
PercentageChangeSeries.prototype = Object.create(RelativeSeries.prototype);
PercentageChangeSeries.prototype.constructor = PercentageChangeSeries;
/** @override */
PercentageChangeSeries.prototype.modify = function(v) {
    let startValue = this.getBase(this._symbolSet._timeStart);
    let difference = v - startValue;
    return 100.0 * (difference / startValue);
}
/** @override */
PercentageChangeSeries.prototype.calcScaleFactor = function() {
    this.setScaleFactor(1.0);
}