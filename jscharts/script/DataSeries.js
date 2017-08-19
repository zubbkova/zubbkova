/**
 * ----------
 * DataSeries
 * ----------
 * @constructor
 * @param {DataSeries=} base
 */
function DataSeries(base) {
    this._baseSeries = base;
}
DataSeries.prototype.toString = function() {
    return this.constructor.name + " base = " + (this._baseSeries === undefined ? "undefined" : this._baseSeries.constructor.name);
}
DataSeries.prototype.getMaxMin = function() {
    if (this.size() === 0) 
        return undefined;
    let max = Number.MIN_VALUE;
    let min = Number.MAX_VALUE;
    for (let i = 0; i < this.size(); i++) {
        let curVal = this.getByIndex(i);
        if (!isNaN(curVal)) {
            max = Math.max(max, curVal);
            min = Math.min(min, curVal);
        }
    }
    return [min, max];
}
/**
 * @param {MasterTimeList} tl
 * @param {Date} start
 * @param {Date} end
 */
DataSeries.prototype.fitLeastSquares = function(tl, start, end) {
    let i = TimeIterator.forwardRangeIterator(tl, start, end);
    let sumX = 0.0, sumXSq = 0.0, sumXY = 0.0, sumY = 0.0;
    let n = i._count + 1;
    let x0 = i._d.getTime();
    do {
        let x = i._d.getTime() - x0;
        let y = this.get(i._d);
        sumX += x;
        sumXSq += x * x;
        sumXY += x * y;
        sumY += y;
    } while (i.move());
    let coeffs = new Array(2);
    coeffs[1] = (n * sumXY - sumX * sumY) / (n * sumXSq - sumX * sumX);
    coeffs[0] = (sumY - coeffs[1] * sumX) / n;
    return coeffs;
}
DataSeries.prototype.getAverage = function() {
    return this.getTotal() / this.size();
}
DataSeries.prototype.getTotal = function() {
    let total = 0.0;
    for (let i = 0; i < this.size(); i++) {
        total += this.getByIndex(i);
    }
    return total;
}
/**
 * @param {Date} d
 * @param {number} value
 */
DataSeries.prototype.append = function(d, value) {
    if (this._baseSeries) 
        this._baseSeries.append(d, value);
}
/**
 * @param {Date} d
 * @param {number} value
 */
DataSeries.prototype.set = function(d, value) {
    return this._baseSeries === undefined ? -1 :  this._baseSeries.set(d, value);
}
/**
 * @param {Date} d
 */
DataSeries.prototype.getNoInterpolate = function(d) {
    return this._baseSeries === undefined ? NaN : this._baseSeries.getNoInterpolate(d);
}
/**
 * @param {Date} d
 */
DataSeries.prototype.getUnscaled = function(d) {
    return this._baseSeries === undefined ? NaN : this._baseSeries.getUnscaled(d);
}
/**
 * @param {Date} d
 */
DataSeries.prototype.get = function(d) {
    return this._baseSeries === undefined ? NaN : this._baseSeries.get(d);
}
/**
 * @param {number} index
 */
DataSeries.prototype.getByIndex = function(index) {
    return this._baseSeries === undefined ? NaN : this._baseSeries.getByIndex(index);
}
/**
 * @param {Date} d
 */
DataSeries.prototype.getIndexByDate = function(d) {
    return this._baseSeries === undefined ? -1 : this._baseSeries.getIndexByDate(d);
}
DataSeries.prototype.getScaleFactor = function() {
    return this._baseSeries === undefined ? 1.0 : this._baseSeries.getScaleFactor();
}
/**
 * @param {number} scaleFactor
 */
DataSeries.prototype.setScaleFactor = function(scaleFactor) {
    if (this._baseSeries) this._baseSeries.setScaleFactor(scaleFactor);
}
/**
 * @param {number} baseValue
 * @param {number} myValue
 */
DataSeries.prototype.calcScaleFactor = function(baseValue, myValue) {
    if (this._baseSeries) this._baseSeries.calcScaleFactor(baseValue, myValue);
}
/**
 * @param {Date} d
 */
DataSeries.prototype.setTimeEnd = function(d) {
    if (this._baseSeries) this._baseSeries.setTimeEnd(d);
}
/**
 * @param {Date} d
 */
DataSeries.prototype.setTimeStart = function(d) {
    if (this._baseSeries) this._baseSeries.setTimeStart(d);
}
DataSeries.prototype.timeEnd = function() {
    return this._baseSeries === undefined ? undefined : this._baseSeries.timeEnd();
}
DataSeries.prototype.timeStart = function() {
    return this._baseSeries === undefined ? undefined : this._baseSeries.timeStart();
}
/**
 * @param {number} index
 */
DataSeries.prototype.timeByIndex = function(index) {
    return this._baseSeries === undefined ? undefined : this._baseSeries.timeByIndex(index);
}
DataSeries.prototype.size = function() {
    return this._baseSeries === undefined ? 0 : this._baseSeries.size();
}
DataSeries.prototype.clear = function() {
    if (this._baseSeries) this._baseSeries.clear();
}
/**
 * @param {string} k
 */
DataSeries.prototype.removeFromChain = function(k) {
    if (k === this.constructor.name) 
        return this._baseSeries;
    let curSeries = this;
    let nextSeries = this._baseSeries;
    do {
        if (k === curSeries.constructor.name) {
            curSeries._baseSeries = nextSeries._baseSeries;
            break;
        }
        curSeries = nextSeries;
        nextSeries = nextSeries._baseSeries;
    } while (nextSeries);
    return this;
}
/**
 * @param {string} k
 */
DataSeries.prototype.isInChain = function(k) {
    let curSeries = this;
    while (curSeries) {
        if (k === curSeries.constructor.name) 
            return true;
        curSeries = curSeries._baseSeries;
    }
    return false;
}
DataSeries.prototype.getRootSeries = function() {
    let curSeries = this;
    while (curSeries._baseSeries) {
        curSeries = curSeries._baseSeries;
    }
    return curSeries;
}