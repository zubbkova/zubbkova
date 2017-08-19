/**
 * @author Barry Adams
 *
 * This study plots, how much long the length of the path is
 * then an average.
 * @constructor
 * @extends {StudyWithPeriod}
 * @param {Overlay} o
 */
function StudyPathLength(o) {
    StudyWithPeriod.call(this, o, 20);
    this._series = new Series();
}
/**
 * Inheriting
 */
StudyPathLength.prototype = Object.create(StudyWithPeriod.prototype);
StudyPathLength.prototype.constructor = StudyPathLength;
/** @static */
StudyPathLength.getItems = function() {
    return StudyWithPeriod.getItems();
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyPathLength.newInstance = function(o) {
    return new StudyPathLength(o);
}
/** @static */
StudyPathLength.mnemonic = "PathLength";
/** @static */
StudyPathLength.helpID = 471;
/** @static */
StudyPathLength.ownOverlay = true;
/** @override */
StudyPathLength.prototype.setName = function() {
    this._name = Language.getString("study_pathlength") + " (" + this._period + ")";
}
/** @override */
StudyPathLength.prototype.update = function(start, end) {
    this._series.clear();
    let i = TimeIterator.forwardRangeIterator(this._parent._chartCanvas._chart.getMasterTimeList(), start, end);
    let n = 0;
    let buf = new Array(4 * i._count + 4);
    buf.fill(0);
    let lastclose = -1;
    let totalmovement = 0.0;
    let count = 0;
    do {
        let d = new Date(i._d.getTime());
        let closeVal = this._close.get(d);
        if (closeVal === -1 || lastclose === -1) {
            lastclose = closeVal;
            n += 4;
            continue;
        }
        let openVal = this._open.get(d);
        let highVal = this._high.get(d);
        let lowVal = this._low.get(d);
        totalmovement += buf[n++] = Math.abs(openVal - lastclose);
        // We'll take the biggest of the moves
        totalmovement += buf[n++] = Math.abs(highVal - lowVal); // Order doesn't matter here
        let ol = Math.abs(openVal - lowVal);
        let oh = Math.abs(openVal - highVal);
        let lc = Math.abs(lowVal - closeVal);
        let hc = Math.abs(highVal - closeVal);
        if (ol + hc > oh + lc) {
            //  Take the longs possible path.
            totalmovement += buf[n++] = ol;
            totalmovement += buf[n++] = hc;
        } else {
            totalmovement += buf[n++] = oh;
            totalmovement += buf[n++] = lc;
        }
        count += 4;
    } while (i.move());
    if (count < 2) {
        return;
    }
    let averagemovement = totalmovement / count;
    let buf1 = new Array(this._period);
    buf1.fill(0);
    let xt = TimeIterator.forwardRangeIterator(this._parent._chartCanvas._chart.getMasterTimeList(), start, end);
    let d = new Date(xt._d.getTime());
    this._series.append(d, NaN);
    let insert = 0;
    let running = 0.0;
    let ready = false;
    for (let j = 0; j < n; j += 4) {
        xt.move();
        d = new Date(xt._d.getTime());
        let x = buf[j] / averagemovement;
        let path = Math.sqrt(1.0 + x * x);
        x = buf[j + 1] / averagemovement;
        path += Math.sqrt(1.0 + x * x);
        x = buf[j + 2] / averagemovement;
        path += Math.sqrt(1.0 + x * x);
        x = buf[j + 3] / averagemovement;
        path += Math.sqrt(1.0 + x * x);
        if (this._period <= 1) {
            this._series.append(d, path / 4.0);
        } else {
            running += (buf1[insert++] = path);
            if (insert >= this._period) {
                insert = 0;
                ready = true;
            }
            if (ready) {
                running -= buf1[insert];
                this._series.append(d, (running / this._period) / 4.0);
            } else {
                this._series.append(d, NaN);
            }
        }
    }
}