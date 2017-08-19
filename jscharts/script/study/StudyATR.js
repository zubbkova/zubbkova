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
    let i = TimeIterator.forwardRangeIterator(this._parent._chartCanvas._chart.getMasterTimeList(), start, end);
    let buf_tr = new Array(this._period);
    buf_tr.fill(0.0);
    let lastclose = 0.0;
    let running_total = 0.0;
    let n = 0;
    let buf_ptr = 0;
    do {
        let curDate = i._d;
        let highVal = this._high.get(curDate);
        let lowVal = this._low.get(curDate);
        let closeVal = this._close.get(curDate);
        let tr = highVal - lowVal;
        if (n !== 0) {
            let a = Math.abs(lastclose - highVal);
            if (a > tr) {
                tr = a;
            }
            a = Math.abs(lastclose - lowVal);
            if (a > tr) {
                tr = a;
            }
        }
        let  len = this._period;
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
        let out = running_total / len;
        this._series.append(new Date(curDate.getTime()), out);
        n++;
        lastclose = closeVal;
    } while (i.move());
}