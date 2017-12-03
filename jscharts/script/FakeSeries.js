/* global Series */
/**
 * Series that gets rescaled on the fly in order that we can display two series in the same window when they have
 * completely different scales e.g. -1 billion to +1 billion for volumes, 0-100 for the ratio average.
 * @author jamess
 * @constructor
 * @extends {Series}
 */
function FakeSeries() {
    Series.call(this);
    this._scaleFactor = 1.0;
    this._offset = 0.0;
}
/**
 * Inheriting
 */
FakeSeries.prototype = Object.create(Series.prototype);
FakeSeries.prototype.constructor = FakeSeries;
/**
 * @param {Date} d
 */
FakeSeries.prototype.get = function(d) {
    return Series.prototype.get.call(this, d) * this._scaleFactor - this._offset;
}