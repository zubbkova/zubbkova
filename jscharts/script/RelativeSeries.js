/* eslint no-unused-vars: "off" */
/* global DataSeries */
/**
 * --------------
 * RelativeSeries
 * --------------
 * @constructor
 * @extends {DataSeries}
 * @param {DataSeries} b
 * @param {ChartSymbolSet} css
 * @param {DataSeries=} o
 */
function RelativeSeries(b, css, o) {
    DataSeries.call(this, b);
    this._symbolSet = css;
    this._relativeSeries = o;
}
/**
 * Inheriting
 */
RelativeSeries.prototype = Object.create(DataSeries.prototype);
RelativeSeries.prototype.constructor = RelativeSeries;
/** @override */
RelativeSeries.prototype.getByIndex = function(index) {
    return this.get(this.timeByIndex(index));
}
/** @override */
RelativeSeries.prototype.get = function(d) {
    return this.modify(d, DataSeries.prototype.get.call(this, d));
}
/** @override */
RelativeSeries.prototype.getUnscaled = function(d) {
    return this.modify(d, DataSeries.prototype.getUnscaled.call(this, d));
}
/**
 * @param {Date} d
 */
RelativeSeries.prototype.getBase = function(d) {
    return DataSeries.prototype.get.call(this, d);
}
/**
 * @param {Date} d
 * @param {number} v
 * @returns {number}
 */
RelativeSeries.prototype.modify = function(d, v) {}