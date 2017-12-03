/* global StudyWithPeriod, Series, Language, TimeIterator, Color */
/**
 * @constructor
 * @extends {StudyWithPeriod}
 * @param {Overlay} o
 */
function StudyDonchian(o) {
    this._highs = new Series();
    this._mids = new Series();
    this._lows = new Series();
    this._series = this._mids;
    StudyWithPeriod.call(this, o, 20);
}
/**
 * Inheriting
 */
StudyDonchian.prototype = Object.create(StudyWithPeriod.prototype);
StudyDonchian.prototype.constructor = StudyDonchian;
/** @static */
StudyDonchian.getItems = function() {
    return StudyWithPeriod.getItems();
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyDonchian.newInstance = function(o) {
    return new StudyDonchian(o);
}
/** @static */
StudyDonchian.mnemonic = "Donchian";
/** @static */
StudyDonchian.helpID = 472;
/** @static */
StudyDonchian.ownOverlay = false;
/** @override */
StudyDonchian.prototype.setName = function() {
    this._name = Language.getString("study_donchianchannels") + " (" + this._period + ")";
}
/** @override */
StudyDonchian.prototype.update = function(start, end) {
    var buffer_high = new Array(this._period);
    var buffer_low = new Array(this._period);
    this._highs.clear();
    this._mids.clear();
    this._lows.clear();
    var i = TimeIterator.forwardRangeIterator(this._parent._chart.getMasterTimeList(), start, end);
    var highest = -100.0;
    var lowest = 10000000.0;
    var highn = 0, lown = 0, n = 0, pos = 0;
    var pos1, j;
    do {
        var d = i._d;
        var chigh = this._high.get(d);
        var clow = this._low.get(d);
        if (chigh < 0.0) {
            chigh = highest;
        }
        if (clow < 0.0) {
            clow = lowest;
        }
        buffer_high[pos] = chigh;
        buffer_low[pos] = clow;
        if (chigh > highest) {
            highn = n;
            highest = chigh;
        }
        if (clow < lowest) {
            lown = n;
            lowest = clow;
        }
        if (n - highn >= this._period) {
            highest = -100.0;
            pos1 = pos;
            for (j = 0; j < this._period; j++) {
                if (buffer_high[pos1] > highest) {
                    highest = buffer_high[pos1];
                    highn = n - j;
                }
                pos1--;
                if (pos1 < 0) {
                    pos1 = this._period - 1;
                }
            }
        }
        if (n - lown >= this._period) {
            lowest = 10000000.0;
            pos1 = pos;
            for (j = 0; j < this._period; j++) {
                if (buffer_low[pos1] < lowest) {
                    lowest = buffer_low[pos1];
                    lown = n - j;
                }
                pos1--;
                if (pos1 < 0) {
                    pos1 = this._period - 1;
                }
            }
        }
        this._highs.append(d, highest);
        this._lows.append(d, lowest);
        this._mids.append(d, (highest + lowest) / 2.0);
        n++;
        pos++;
        if (pos >= this._period) {
            pos = 0;
        }
    } while (i.move());
}
/** @override */
StudyDonchian.prototype.getMaxMin = function(i) {
    this._range.reset();
    if (this._highs.size() === 0)
        return;
    do {
        var high = this._highs.get(i._d);
        var low = this._lows.get(i._d);
        if (high > this._range._max)
            this._range._max = high;
        else if (low < this._range._min)
            this._range._min = low;
    } while (i.move());
}
/** @override */
StudyDonchian.prototype.draw = function() {
    this.updateY();
    if (this._highs.size() === 0)
        return;
    var col = new Color(255, 0, 255);
    this._parent.drawLineNormal(this._highs, col);
    this._parent.drawLineNormal(this._mids, this._colour);
    this._parent.drawLineNormal(this._lows, col);
}