/* global StudyWithPeriod, Series, Language, TimeIterator */
/**
 * @constructor
 * @extends {StudyWithPeriod}
 * @param {Overlay} o
 */
function StudyKurtosis(o) {
    StudyWithPeriod.call(this, o, 20);
    this._series = new Series();
}
/**
 * Inheriting
 */
StudyKurtosis.prototype = Object.create(StudyWithPeriod.prototype);
StudyKurtosis.prototype.constructor = StudyKurtosis;
/** @static */
StudyKurtosis.getItems = function() {
    return StudyWithPeriod.getItems();
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyKurtosis.newInstance = function(o) {
    return new StudyKurtosis(o);
}
/** @static */
StudyKurtosis.mnemonic = "Kurtosis";
/** @static */
StudyKurtosis.helpID = 434;
/** @static */
StudyKurtosis.ownOverlay = true;
/** @override */
StudyKurtosis.prototype.setName = function() {
    this._name = Language.getString("study_kurtosis") + " (" + this._period + ")";
}
/** @override */
StudyKurtosis.prototype.update = function(start, end) {
    this._series.clear(); // clear output
    var i = TimeIterator.forwardRangeIterator(this._parent._chart.getMasterTimeList(), start, end);
    var buf_size = i._count;
    if (buf_size === 0) {
        return;
    }
    // add one so new XTIterator count doesnt break.
    var buf_closes = new Array(buf_size + 1);
    buf_closes.fillArrayWithValue(0.0);
    var buf_mean = new Array(buf_size + 1);
    buf_mean.fillArrayWithValue(0.0);
    var n = 0;
    do {
        var curDate = i._d;
        buf_closes[n] = this._close.get(curDate);
        var beg = n - this._period + 1;
        if (beg < 0) {
            beg = 0;
        }
        var len = n - beg + 1;
        var sumdev2 = 0.0;
        var sumdev4 = 0.0;
        for (var k = beg; k <= n; k++) {
            var dev = buf_mean[k] - buf_closes[n];
            var dev2 = dev * dev;
            sumdev2 += dev2;
            sumdev4 += dev2 * dev2;
        }
        var var1 = sumdev2 / len;
        var kurt = sumdev4 / (len * var1 * var1) - 3;
        if (len < this._period) {
            kurt = 0;
        }
        this._series.append(new Date(curDate.getTime()), kurt);
        n++;
    } while (i.move());
}