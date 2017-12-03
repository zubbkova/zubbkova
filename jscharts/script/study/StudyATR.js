/* global StudyWithPeriod, Series, Language, TimeIterator */
/**
 * @constructor
 * @extends {StudyWithPeriod}
 * @param {Overlay} o
 */
function StudyATR(o) {
    StudyWithPeriod.call(this, o, 20);
    this._series = new Series();
}
/**
 * Inheriting
 */
StudyATR.prototype = Object.create(StudyWithPeriod.prototype);
StudyATR.prototype.constructor = StudyATR;
/** @static */
StudyATR.getItems = function() {
    return StudyWithPeriod.getItems();
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyATR.newInstance = function(o) {
    return new StudyATR(o);
}
/** @static */
StudyATR.mnemonic = "ATR";
/** @static */
StudyATR.helpID = 428;
/** @static */
StudyATR.ownOverlay = true;
 /** @override */
StudyATR.prototype.setName = function() {
    this._name = Language.getString("study_averagetruerange") + " (" + this._period + ")";
}
/** @override */
StudyATR.prototype.update = function(start, end) {
    this._series.clear(); // clear output
    var i = TimeIterator.forwardRangeIterator(this._parent._chart.getMasterTimeList(), start, end);
    var buf_tr = new Array(this._period);
    buf_tr.fillArrayWithValue(0.0);
    var lastclose = 0.0;
    var running_total = 0.0;
    var n = 0;
    var buf_ptr = 0;
    do {
        var curDate = i._d;
        var highVal = this._high.get(curDate);
        var lowVal = this._low.get(curDate);
        var closeVal = this._close.get(curDate);
        var tr = highVal - lowVal;
        if (n !== 0) {
            var a = Math.abs(lastclose - highVal);
            if (a > tr) {
                tr = a;
            }
            a = Math.abs(lastclose - lowVal);
            if (a > tr) {
                tr = a;
            }
        }
        var  len = this._period;
        if (len > n) {
            len = n + 1;
        }
        running_total += tr;
        buf_tr[buf_ptr++] = tr;
        if (buf_ptr >= this._period) {
            buf_ptr = 0;
        }
        if (n >= this._period) {
            running_total -= buf_tr[buf_ptr];
        }
        var out = running_total / len;
        this._series.append(new Date(curDate.getTime()), out);
        n++;
        lastclose = closeVal;
    } while (i.move());
}