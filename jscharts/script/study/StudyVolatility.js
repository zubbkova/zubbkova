/* global StudyWithPeriod, Series, Language, TimeIterator */
/**
 * @constructor
 * @extends {StudyWithPeriod}
 * @param {Overlay} o
 */
function StudyVolatility(o) {
    StudyWithPeriod.call(this, o, 20);
    this._series = new Series();
}
/**
 * Inheriting
 */
StudyVolatility.prototype = Object.create(StudyWithPeriod.prototype);
StudyVolatility.prototype.constructor = StudyVolatility;
/** @static */
StudyVolatility.getItems = function() {
    return StudyWithPeriod.getItems();
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyVolatility.newInstance = function(o) {
    return new StudyVolatility(o);
}
/** @static */
StudyVolatility.mnemonic = "Volatility";
/** @static */
StudyVolatility.helpID = 427;
/** @static */
StudyVolatility.ownOverlay = true;
/** @override */
StudyVolatility.prototype.setName = function() {
    this._name = Language.getString("study_volatility") + " (" + this._period + ")";
}
/** @override */
StudyVolatility.prototype.update = function(start, end) {
    this._series.clear(); // clear output
    var i = TimeIterator.forwardRangeIterator(this._parent._chart.getMasterTimeList(), start, end);
    var buf_size = i._count;
    var buf_closes = new Array(buf_size);
    buf_closes.fillArrayWithValue(0);
    var buf_mean = new Array(buf_size);
    buf_mean.fillArrayWithValue(0);
    var running_total = 0.0;
    var n = 0;
    do {
        var curDate = i._d;
        buf_closes[n] = this._source.get(curDate);
        var beg = n - this._period + 1;
        if (beg < 0) {
            beg = 0;
        }
        var len = n - beg + 1;
        running_total += buf_closes[n];
        if (beg > 0) {
            running_total -= buf_closes[beg - 1];
        }
        var mean = buf_mean[n] = running_total / len;
        var sumdev2 = 0.0;
        for (var k = beg; k <= n; k++) {
            var dev = buf_closes[k] - mean;
            sumdev2 += dev * dev;
        }
        var std = Math.sqrt(sumdev2 / this._period);
        if (len < this._period) {
            std = 0;
        }
        this._series.append(this._parent._chart.timeAdjust(curDate, 0), std);
        n++;
    } while (i.move());
}