/* global StudyWithPeriod, Series, Language, TimeIterator */
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
    var i = TimeIterator.forwardRangeIterator(this._parent._chart.getMasterTimeList(), start, end);
    var n = 0;
    var buf = new Array(4 * i._count + 4);
    buf.fillArrayWithValue(0);
    var lastclose = -1;
    var totalmovement = 0.0;
    var count = 0;
    var d;
    do {
        d = new Date(i._d.getTime());
        var closeVal = this._close.get(d);
        if (closeVal === -1 || lastclose === -1) {
            lastclose = closeVal;
            n += 4;
            continue;
        }
        var openVal = this._open.get(d);
        var highVal = this._high.get(d);
        var lowVal = this._low.get(d);
        totalmovement += buf[n++] = Math.abs(openVal - lastclose);
        // We'll take the biggest of the moves
        totalmovement += buf[n++] = Math.abs(highVal - lowVal); // Order doesn't matter here
        var ol = Math.abs(openVal - lowVal);
        var oh = Math.abs(openVal - highVal);
        var lc = Math.abs(lowVal - closeVal);
        var hc = Math.abs(highVal - closeVal);
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
    var averagemovement = totalmovement / count;
    var buf1 = new Array(this._period);
    buf1.fillArrayWithValue(0);
    var xt = TimeIterator.forwardRangeIterator(this._parent._chart.getMasterTimeList(), start, end);
    d = new Date(xt._d.getTime());
    this._series.append(d, NaN);
    var insert = 0;
    var running = 0.0;
    var ready = false;
    for (var j = 0; j < n; j += 4) {
        xt.move();
        d = new Date(xt._d.getTime());
        var x = buf[j] / averagemovement;
        var path = Math.sqrt(1.0 + x * x);
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