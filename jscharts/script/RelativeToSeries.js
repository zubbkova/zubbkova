/* global RelativeSeries */
/**
 * ----------------
 * RelativeToSeries
 * ----------------
 * @constructor
 * @extends {RelativeSeries}
 * @param {DataSeries} b
 * @param {ChartSymbolSet} css
 * @param {DataSeries} relativeSeries
 */
function RelativeToSeries(b, css, relativeSeries) {
    RelativeSeries.call(this, b, css, relativeSeries);
}
/**
 * Inheriting
 */
RelativeToSeries.prototype = Object.create(RelativeSeries.prototype);
RelativeToSeries.prototype.constructor = RelativeToSeries;
/** @override */
RelativeToSeries.prototype.modify = function(d, v) {
    var relativeVal = this._relativeSeries.getUnscaled(d);
    return relativeVal === 0.0 ? v : v / relativeVal;
}
RelativeToSeries.prototype.toString = function() {
    var r = this.getRootSeries();
    return 'RelativeToSeries - {0} ({1}) field = {2} - against {3}'.format(r._parent.getSymbol(), r._parent.getFrequency(), r._proxyField, this._relativeSeries._parent.getSymbol());
}