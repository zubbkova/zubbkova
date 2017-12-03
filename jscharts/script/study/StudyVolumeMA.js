/* global StudyWithPeriod, Series, Language, TimeIterator, XTIterator, Color */
/**
 * @constructor
 * @extends {StudyWithPeriod}
 * @param {Overlay} o
 */
function StudyVolumeMA(o) {
    StudyWithPeriod.call(this, o, 15);
    this._series = new Series();
}
/**
 * Inheriting
 */
StudyVolumeMA.prototype = Object.create(StudyWithPeriod.prototype);
StudyVolumeMA.prototype.constructor = StudyVolumeMA;
/** @static */
StudyVolumeMA.getItems = function() {
    return StudyWithPeriod.getItems();
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyVolumeMA.newInstance = function(o) {
    return new StudyVolumeMA(o);
}
/** @static */
StudyVolumeMA.mnemonic = "VolumeMA";
/** @static */
StudyVolumeMA.helpID = 499;
/** @static */
StudyVolumeMA.ownOverlay = true;
/** @override */
StudyVolumeMA.prototype.setName = function() {
    this._name = Language.getString("study_volumesma") + " (" + this._period + ")";
}
/** @override */
StudyVolumeMA.prototype.getMaxMin = function(i) {
    this._range.reset();
    this._range.getMaxMin(this._vol, i);
    // hardcode to force away problems with low number of data points
    this._range._min = 0;
}
/** @override */
StudyVolumeMA.prototype.draw = function() {
    this.updateY();
    var c = this._parent._chart;
    var i = XTIterator.reverseScreenIterator(c);
    var cx = parseInt(c._currentSymbol._unitWidth / 2, 10); // width to draw
    var curVol; // current Volume, used for MA
    var start_y = parseInt(this._parent.getY(0), 10);
    do {
        // Volume stuff
        if (this._vol.get(i._d) === 0.0)
            continue;
        curVol = this._vol.get(i._d);
        var end_y = this._parent.getY(curVol);
        // plot the volume chart
        if (!isNaN(end_y) && !(i._d > (c._currentSymbol._time))) {
            var width = Math.max(parseInt(c._currentSymbol._unitWidth - 2, 10), 1);
            // draw volume stuff
            this._parent._chartCanvas.setFillColor(Color.lightGray);
            this._parent._chartCanvas.fillRectWithAdjust(i._x - cx + 1, parseInt(end_y, 10), width, parseInt(start_y - end_y + 1, 10));
        }
    } while (i.move());
    // now plot the MA over the top
    var n = 0, pos = 0; // loop counters
    var total = 0.0; // running total for MA
    var buffer = new Array(this._period); // buffer for MA results
    buffer.fillArrayWithValue(0.0);
    var start = this._vol.timeStart();
    var end = c._parent._currentSymbol._time;
    var i2 = TimeIterator.forwardRangeIterator(c.getMasterTimeList(), start, end);
    this._series.clear();
    do {
        curVol = this._vol.get(i2._d);
        if (n < this._period) {
            buffer[n] = curVol;
            total += buffer[n];
            this._series.append(i2._d, total / (n + 1));
        } else {
            total -= buffer[pos];
            total += curVol;
            buffer[pos] = curVol;
            this._series.append(i2._d, total / this._period);
        }
        // iterate
        n++;
        if (++pos === this._period)
            pos = 0;
    } while (i2.move());
    // and draw!
    this._parent.drawLineNormal(this._series, this._colour);
}