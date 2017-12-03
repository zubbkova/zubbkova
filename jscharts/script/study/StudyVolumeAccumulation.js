/* global StudyWithPeriod, Series, Language, Utils, TimeIterator, Color */
/**
 * @constructor
 * @extends {StudyWithPeriod}
 * @param {Overlay} o
 */
function StudyVolumeAccumulation(o) {
    StudyWithPeriod.call(this, o, 15);
    this._series = new Series();
}
/**
 * Inheriting
 */
StudyVolumeAccumulation.prototype = Object.create(StudyWithPeriod.prototype);
StudyVolumeAccumulation.prototype.constructor = StudyVolumeAccumulation;
/** @static */
StudyVolumeAccumulation.getItems = function() {
    return StudyWithPeriod.getItems();
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyVolumeAccumulation.newInstance = function(o) {
    return new StudyVolumeAccumulation(o);
}
/** @static */
StudyVolumeAccumulation.mnemonic = "VolumeAccumulation";
/** @static */
StudyVolumeAccumulation.helpID = 489;
/** @static */
StudyVolumeAccumulation.ownOverlay = true;
/** @override */
StudyVolumeAccumulation.prototype.setName = function() {
    this._name = Language.getString("study_volumeaccumulation") + " (" + this._period + ")";
}
/** @override */
StudyVolumeAccumulation.prototype.update = function(start, end) {
    this._series.clear();
    var i = TimeIterator.forwardRangeIterator(this._parent._chart.getMasterTimeList(), start, end);
    var va = 0.0; // volume accumulator
    var lastclose = -1.0;
    var closesarray = new Array(this._period); // the last (period) closes
    closesarray.fillArrayWithValue(0.0);
    var closeVal, IPMP, volVal, ratio;
    // loop for < period
    for (var n = 0; n < this._period; n++) {
        closeVal = this._close.get(i._d);
        // work out the intra-period mean price
        closesarray[n] = closeVal;
        IPMP = Utils.sumArray(closesarray) / (n + 1);
        volVal = this._vol.get(i._d); // get the relevant volume
        ratio = 0.0;
        if ((lastclose > 0) && (lastclose != closeVal)) {
            // compare the closing price to the IPMP.
            ratio = closeVal / IPMP;
            va = volVal * ((closeVal > lastclose) ? 1 : -1) * ratio;
            this._series.append(i._d, va);
        }
        lastclose = closeVal;
    }
    var buf_ptr = 0; // pointer within the array
    // loop through the rest
    do {
        closeVal = this._close.get(i._d);
        // add the close into the array
        closesarray[buf_ptr] = closeVal;
        IPMP = Utils.sumArray(closesarray) / this._period;
        volVal = this._vol.get(i._d); // get the relevant volume
        ratio = 0.0;
        if ((lastclose > 0) && (lastclose !== closeVal)) {
            // compare the closing price to the IPMP.
            ratio = closeVal / IPMP;
            va = volVal * ((closeVal > lastclose) ? 1 : -1) * ratio;
            this._series.append(i._d, va);
        }
        // prepare for next iteration
        lastclose = closeVal;
        buf_ptr++;
        if (buf_ptr === this._period)
            buf_ptr = 0;
    } while (i.move());
}
/** @override */
StudyVolumeAccumulation.prototype.draw = function() {
    this.updateY();
    this._parent.drawLineNormal(this._series, this._colour);
    // draw a line at zero to reinforce
    this._parent._chartCanvas.setStrokeColor(Color.darkGray);
    var y = parseInt(this._parent.getY(0), 10);
    this._parent._chartCanvas.drawLineWithAdjust(this._parent._chart._drawX, y, this._parent._chart._drawX + this._parent._chart._drawWidth, y);
}