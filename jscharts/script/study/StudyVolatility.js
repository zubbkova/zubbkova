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
    let i = TimeIterator.forwardRangeIterator(this._parent._chartCanvas._chart.getMasterTimeList(), start, end);
    let buf_size = i._count;
    let buf_closes = new Array(buf_size);
    buf_closes.fill(0);
    let buf_mean = new Array(buf_size);
    buf_mean.fill(0);
    let running_total = 0.0;
    let n = 0;
    do {
        let curDate = i._d;
        buf_closes[n] = this._source.get(curDate);
        let beg = n - this._period + 1;
        if (beg < 0) {
            beg = 0;
        }
        let len = n - beg + 1;
        running_total += buf_closes[n];
        if (beg > 0) {
            running_total -= buf_closes[beg - 1];
        }
        let mean = buf_mean[n] = running_total / len;
        let sumdev2 = 0.0;
        for (let k = beg; k <= n; k++) {
            let dev = buf_closes[k] - mean;
            sumdev2 += dev * dev;
        }
        let std = Math.sqrt(sumdev2 / this._period);
        if (len < this._period) {
            std = 0;
        }
        this._series.append(this._parent._chartCanvas._chart.timeAdjust(curDate, 0), std);
        n++;
    } while (i.move());
}