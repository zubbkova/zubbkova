/* global DataSeries, TimeList */
/**
 * ------
 * Series
 * ------
 * @constructor
 * @extends {DataSeries}
 */
function Series() {
    DataSeries.call(this);
    this._realTimeStart = new Date(8640000000000000);
    this._realTimeEnd = new Date(0);
    this._time = new TimeList();
    this._data = [];
}
/**
 * Inheriting
 */
Series.prototype = Object.create(DataSeries.prototype);
Series.prototype.constructor = Series;
/** @static */
Series.INITIAL_SIZE = 480;
Series.prototype.initTimes = function() {
    this._realTimeStart = new Date(8640000000000000);
    this._realTimeEnd = new Date(0);
}
Series.prototype.copy = function() {
    var s = new Series();
    s._time = this._time.copy();
    s._data = this._data.slice();
    return s;
}
Series.prototype.clear = function() {
    if (this._time)
        this._time.clear();
    this._data = [];
}
Series.prototype.size = function() {
    return this._time.size();
}
/** @override */
Series.prototype.timeByIndex = function(i) {
    return new Date(this._time.getByIndex(i));
}
/** @override */
Series.prototype.timeStart = function() {
    return this.timeByIndex(0);
}
/** @override */
Series.prototype.timeEnd = function() {
    return this.timeByIndex(-1);
}
/** @override */
Series.prototype.getByIndex = function(i) {
    if (i >= 0) {
        return this._data[i];
    } else {
        return this._data[this._data.length + i];
    }
}
/** @override */
Series.prototype.get = function(d) {
    var index = this._time.get(d);
    if (index === -1) return NaN;
    while (isNaN(this.getByIndex(index)) && index > 0) {
        index--;
    }
    return this.getByIndex(index);
}
/** @override */
Series.prototype.getIndexByDate = function(d) {
    return this._time.get(d);
}
/** @override */
Series.prototype.getNoInterpolate = function(d) {
    var index = this._time.get(d);
    if (index === -1 || !this._time._has) {
        return NaN;
    }
    return this.getByIndex(index);
}
/** @override */
Series.prototype.append = function(d, value) {
    this._data.push(value);
    this._time.set(d);
    if (d > this._realTimeEnd) {
        this._realTimeEnd = d;
    }
}
/** @override */
Series.prototype.set = function(d, value) {
    var idx = this._time.set(d);
    if (this._time._has) {
        this._data[idx] = value;
    } else {
        this._data.splice(idx, 0, value);
        if (d < this._realTimeStart) {
            this._realTimeStart = d;
        }
        if (d > this._realTimeEnd) {
            this._realTimeEnd = d;
        }
    }
    return idx;
}