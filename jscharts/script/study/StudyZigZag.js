/**
 * @constructor
 * @extends {Study}
 * @param {Overlay} o
 */
function StudyZigZag(o) {
    Study.call(this, o);
    this._percentage = 10;
    this._series = new Series();
    this.setName();
    this.initLegend(Color.red);
};
/**
 * Inheriting
 */
StudyZigZag.prototype = Object.create(Study.prototype);
StudyZigZag.prototype.constructor = StudyZigZag;
/** @static */
StudyZigZag.getItems = function() {
    return [new StudyDialog_StudyEditParameter("percentage", Language.getString("toolbardialogs_percentage"))];
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyZigZag.newInstance = function(o) {
    return new StudyZigZag(o);
}
/** @static */
StudyZigZag.mnemonic = "ZigZag";
/** @static */
StudyZigZag.helpID = 481;
/** @static */
StudyZigZag.ownOverlay = false;
/** @override */
StudyZigZag.prototype.setName = function() {
    this._name = Language.getString("study_zigzag") + " (" + this._percentage + ")";
}
/** @override */
StudyZigZag.prototype.getParams = function() {
    return "percentage-" + this._percentage;
}
/** @override */
StudyZigZag.prototype.setParams = function(params) {
    let items = Utils.convertStringParams(params, ":", "-");
    if (items.has("percentage"))
        this._percentage = parseInt(items.get("percentage"), 10);
    Study.prototype.setParams.call(this, params);
}
/** @override */
StudyZigZag.prototype.draw = function() {
    this.updateY();
    /* run through the series and look for points where we pass the threshhold
     * set by the percentage.  at that point draw a line connecting the points and continue.
     */
    let c = this._parent._chartCanvas._chart;
    let end = c._parent._currentSymbol._time;
    // start is first *visible* data point, not first in memory.
    let start = c._parent._currentSymbol._timeStart < this._source.timeStart() ?
            this._source.timeStart() : c._parent._currentSymbol._timeStart;
    let curVal = 0; // current value we're working with
    let triggerUp, triggerDown; // values that will trigger a line being drawn
    let delta = 0; // +1 / -1, going up or down.  0 for unset.
    let tracker; // are we looking for a trigger or the end of one?
    let curExtreme; // the most extreme point while tracking (value)
    let curExtremeDate; // the most extreme point while tracking (date)
    let i = TimeIterator.forwardRangeIterator(c.getMasterTimeList(), start, end);
    // get start points
    this._series.clear();
    curExtreme = triggerUp = triggerDown = 0.0;
    // cannot just use = as will end up to pointers to the same object!  :p
    curExtremeDate = new Date(i._d.getTime());
    tracker = false;
    curVal = this._source.get(i._d);
    // add in first point
    this._series.append(i._d, curVal);
    // set up triggers for next point
    triggerUp = curVal * (1 + (this._percentage / 100));
    triggerDown = curVal * (1 - (this._percentage / 100));
    do {
        curVal = this._source.get(i._d);
        if (tracker) {
            // check value against current max or min.
            if (((delta === 1) && (curVal > curExtreme)) || ((delta === -1) && (curVal < curExtreme))) {
                // new extreme value
                curExtreme = curVal;
                curExtremeDate = new Date(i._d.getTime());
            }
            // looking for the trigger to end.  10% threshhold from current extreme.
            if (((delta === 1) && (curVal < (curExtreme * (1 - (this._percentage / 100)))))
                || ((delta === -1) && (curVal > (curExtreme * (1 + (this._percentage / 100)))))) {
                // trigger ends
                // add it to a series to be plotted
                this._series.append(curExtremeDate, curExtreme);
                // reset the values for next iteration
                tracker = false;
                // work out trigger points from percentages given (upper and lower separately)
                triggerUp = curExtreme * (1 + (this._percentage / 100));
                triggerDown = curExtreme * (1 - (this._percentage / 100));
                // change the direction
                delta = -delta;
            }
        } else {
            // we're looking to be triggered.
            // if a trigger point is invoked, track the most extreme point until "untriggered"
            // by falling or rising back into the range
            // need to keep track by direction.
            if (delta === 0) {
                // we've not been triggered before.
                if ((curVal >= triggerUp) || (curVal <= triggerDown)) {
                    // we have a new trigger
                    tracker = true;
                    // set up direction
                    if (curVal >= triggerUp) {
                        delta = 1;
                    } else {
                        delta = -1;
                    }
                    // set up the current "extreme"
                    curExtreme = curVal;
                    curExtremeDate = new Date(i._d.getTime());
                }
            } else {
                // direction is set
                if (((delta === 1) && (curVal >= triggerUp)) || ((delta === -1) && (curVal <= triggerDown))) {
                    // we have a new trigger
                    tracker = true;
                    // set up direction
                    if (curVal >= triggerUp) {
                        delta = 1;
                    } else {
                        delta = -1;
                    }
                    // set up the current "extreme"
                    curExtreme = curVal;
                    curExtremeDate = new Date(i._d.getTime());
                }
            }
        } // end tracker check
    } while (i.move());
    // add on the last point with the current value.
    this._series.append(i._d, curVal);
    // done with the series, plot it.
    this._parent.drawLineNormalNoIterator(this._series, this._colour);
}