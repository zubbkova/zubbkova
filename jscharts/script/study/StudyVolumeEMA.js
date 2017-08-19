/**
 * @constructor
 * @extends {StudyWithPeriod}
 * @param {Overlay} o
 */
function StudyVolumeEMA(o) {
    StudyWithPeriod.call(this, o, 15);
    this._series = new Series();
}
/**
 * Inheriting
 */
StudyVolumeEMA.prototype = Object.create(StudyWithPeriod.prototype);
StudyVolumeEMA.prototype.constructor = StudyVolumeEMA;
/** @static */
StudyVolumeEMA.getItems = function() {
    return StudyWithPeriod.getItems();
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyVolumeEMA.newInstance = function(o) {
    return new StudyVolumeEMA(o);
}
/** @static */
StudyVolumeEMA.mnemonic = "VolumeEMA";
/** @static */
StudyVolumeEMA.helpID = 500;
/** @static */
StudyVolumeEMA.ownOverlay = true;
/** @override */
StudyVolumeEMA.prototype.setName = function() {
    this._name = Language.getString("study_volumeema") + " (" + this._period + ")";
}
/** @override */
StudyVolumeEMA.prototype.getMaxMin = function(i) {
    this._range.reset();
    this._range.getMaxMin(this._vol, i);
    // hardcode to force away problems with low number of data points
    this._range._min = 0;
}
/** @override */
StudyVolumeEMA.prototype.draw = function() {
    this.updateY();
    let c = this._parent._chartCanvas._chart;
    let i = XTIterator.reverseScreenIterator(c);
    let cx = parseInt(c._currentSymbol._unitWidth / 2, 10); // width to draw
    let curVol; // current Volume, used for MA
    let start_y = parseInt(this._parent.getY(0), 10);
    do {
        // Volume stuff
        if (this._vol.get(i._d) === 0.0)
            continue;
        curVol = this._vol.get(i._d);
        let end_y = this._parent.getY(curVol);
        // plot the volume chart
        if (!isNaN(end_y) && !(i._d > (c._currentSymbol._time))) {
            let width = Math.max(parseInt(c._currentSymbol._unitWidth, 10) - 2, 1);
            // draw volume stuff
            this._parent._chartCanvas.setFillColor(Color.lightGray);
            this._parent._chartCanvas.fillRectWithAdjust(i._x - cx + 1, parseInt(end_y, 10), width, parseInt(start_y - end_y + 1, 10));
        }
    } while (i.move());
    // now plot the EMA over the top
    let n = 0; // loop counter
    let total = 0.0; // running total for EMA
    let current = 0.0; // working value for EMA
    let smooth = 2.0 / (1 + this._period); // smoothing value of EMA
    let start = this._vol.timeStart();
    let end = c._parent._currentSymbol._time;
    let i2 = TimeIterator.forwardRangeIterator(c.getMasterTimeList(), start, end);
    this._series.clear();
    // Use simple average for initial period.
    for (; n < this._period; i2.move()) {
        total += this._vol.get(i2._d);
        current = total / (++n);
        this._series.append(i2._d, current);
    }
    // Use exp. average for the rest.
    do {
        current = current + smooth * (this._vol.get(i2._d) - current);
        this._series.append(i2._d, current);
    } while (i2.move());
    // and draw!
    this._parent.drawLineNormal(this._series, this._colour);
}