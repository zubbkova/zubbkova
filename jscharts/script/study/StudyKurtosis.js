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
    let i = TimeIterator.forwardRangeIterator(this._parent._chartCanvas._chart.getMasterTimeList(), start, end);
    let buf_size = i._count;
    if (buf_size === 0) {
        return;
    }
    // add one so new XTIterator count doesnt break.
    let buf_closes = new Array(buf_size + 1);
    buf_closes.fill(0.0);
    let buf_mean = new Array(buf_size + 1);
    buf_mean.fill(0.0);
    let n = 0;
    do {
        let curDate = i._d;
        buf_closes[n] = this._close.get(curDate);
        let beg = n - this._period + 1;
        if (beg < 0) {
            beg = 0;
        }
        let len = n - beg + 1;
        let sumdev2 = 0.0;
        let sumdev4 = 0.0;
        for (let k = beg; k <= n; k++) {
            let dev = buf_mean[k] - buf_closes[n];
            let dev2 = dev * dev;
            sumdev2 += dev2;
            sumdev4 += dev2 * dev2;
        }
        let var1 = sumdev2 / len;
        let kurt = sumdev4 / (len * var1 * var1) - 3;
        if (len < this._period) {
            kurt = 0;
        }
        this._series.append(new Date(curDate.getTime()), kurt);
        n++;
    } while (i.move());
}