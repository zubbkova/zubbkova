/* global DataSeries */
/**
 * -----------
 * ProxySeries
 * -----------
 * @constructor
 * @extends {DataSeries}
 * @param {DataAggregator} [a]
 * @param {number} [i]
 */
function ProxySeries(a, i) {
    DataSeries.call(this);
    this._scaleFactor = 1.0;
    this._parent = a;
    this._proxyField = i;
    this._realTimeStart = new Date(8640000000000000);
    this._realTimeEnd = new Date(0);
}
/**
 * Inheriting
 */
ProxySeries.prototype = Object.create(DataSeries.prototype);
ProxySeries.prototype.constructor = ProxySeries;
ProxySeries.prototype.initTimes = function() {
    this._realTimeStart = new Date(8640000000000000);
    this._realTimeEnd = new Date(0);
}
ProxySeries.prototype.clear = function() {
    this._parent.clear();
    this.initTimes();
}
ProxySeries.prototype.size = function() {
    return this._parent.size();
}
/** @override */
ProxySeries.prototype.timeByIndex = function(index) {
    return this._parent.timeByIndex(index);
}
ProxySeries.prototype.timeStart = function() {
    return this._realTimeStart;
}
ProxySeries.prototype.timeEnd = function() {
    return this._realTimeEnd;
}
/** @override */
ProxySeries.prototype.setTimeStart = function(d) {
    this._realTimeStart = d;
}
/** @override */
ProxySeries.prototype.setTimeEnd = function(d) {
    this._realTimeEnd = d;
}
/** @override */
ProxySeries.prototype.getByIndex = function(index) {
    if (typeof this._proxyField !== 'undefined')
        return this._parent.getByIndex(this._proxyField, index) * this.getScaleFactor();
}
/** @override */
ProxySeries.prototype.get = function(d) {
    if (typeof this._proxyField !== 'undefined')
        return this._parent.get(d, this._proxyField) * this.getScaleFactor();
}
/** @override */
ProxySeries.prototype.getUnscaled = function(d) {
    if (typeof this._proxyField !== 'undefined')
        return this._parent.get(d, this._proxyField);
}
/** @override */
ProxySeries.prototype.getIndexByDate = function(d) {
    return this._parent.getIndexByDate(d);
}
/** @override */
ProxySeries.prototype.getNoInterpolate = function(d) {
    return this.get(d);
}
/** @override */
ProxySeries.prototype.set = function(d, value) {
    if (typeof this._proxyField == 'undefined')
        return NaN;
    var idx = this._parent.set(d, this._proxyField, value);
    if (!isNaN(value)) {
        if (d < this._realTimeStart) 
            this._realTimeStart = d;
        if (d > this._realTimeEnd) 
            this._realTimeEnd = d;
    }
    return idx;
}
/** @override */
ProxySeries.prototype.calcScaleFactor = function(baseValue, myValue) {
    this._scaleFactor = isNaN(myValue) ? 1.0 : baseValue / myValue;
}
/** @override */
ProxySeries.prototype.setScaleFactor = function(factor) {
    this._scaleFactor = factor;
}
/** @override */
ProxySeries.prototype.getScaleFactor = function() {
    return this._scaleFactor === 0.0 ? 1.0 : this._scaleFactor;
}
/** @override */
ProxySeries.prototype.toString = function() {
    return "ProxySeries - " + this._parent._symbol + " (" + this._parent._frequency + ") field = " + this._proxyField;
}