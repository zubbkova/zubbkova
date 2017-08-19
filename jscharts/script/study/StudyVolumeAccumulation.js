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
    let i = TimeIterator.forwardRangeIterator(this._parent._chartCanvas._chart.getMasterTimeList(), start, end);
    let va = 0.0; // volume accumulator
    let lastclose = -1.0;
    let closesarray = new Array(this._period); // the last (period) closes
    closesarray.fill(0.0);
    // loop for < period
    for (let n = 0; n < this._period; n++) {
        let closeVal = this._close.get(i._d);
        // work out the intra-period mean price
        closesarray[n] = closeVal;
        let IPMP = Utils.sumArray(closesarray) / (n + 1);
        let volVal = this._vol.get(i._d); // get the relevant volume
        let ratio = 0.0;
        if ((lastclose > 0) && (lastclose != closeVal)) {
            // compare the closing price to the IPMP.
            ratio = closeVal / IPMP;
            va = volVal * ((closeVal > lastclose) ? 1 : -1) * ratio;
            this._series.append(i._d, va);
        }
        lastclose = closeVal;
    }
    let buf_ptr = 0; // pointer within the array
    // loop through the rest
    do {
        let closeVal = this._close.get(i._d);
        // add the close into the array
        closesarray[buf_ptr] = closeVal;
        let IPMP = Utils.sumArray(closesarray) / this._period;
        let volVal = this._vol.get(i._d); // get the relevant volume
        let ratio = 0.0;
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
    let y = parseInt(this._parent.getY(0), 10);
    this._parent._chartCanvas.drawLineWithAdjust(this._parent._chartCanvas._chart._drawX, y, this._parent._chartCanvas._chart._drawX + this._parent._chartCanvas._chart._drawWidth, y);
}