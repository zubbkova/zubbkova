/**
 * @constructor
 * @extends {StudyWithPeriod}
 * @param {Overlay} o
 */
function StudyVolatilityRatio(o) {
    StudyWithPeriod.call(this, o, 14);
    this._series = new Series();
}
/**
 * Inheriting
 */
StudyVolatilityRatio.prototype = Object.create(StudyWithPeriod.prototype);
StudyVolatilityRatio.prototype.constructor = StudyVolatilityRatio;
/** @static */
StudyVolatilityRatio.getItems = function() {
    return StudyWithPeriod.getItems();
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyVolatilityRatio.newInstance = function(o) {
    return new StudyVolatilityRatio(o);
}
/** @static */
StudyVolatilityRatio.mnemonic = "VolatilityRatio";
/** @static */
StudyVolatilityRatio.helpID = 485;
/** @static */
StudyVolatilityRatio.ownOverlay = true;
/** @override */
StudyVolatilityRatio.prototype.setName = function() {
    this._name = Language.getString("study_volatilityratio") + " (" + this._period + ")";
}
/** @override */
StudyVolatilityRatio.prototype.update = function(start, end) {
    this._series.clear(); // clear output
    let i = TimeIterator.forwardRangeIterator(this._parent._chartCanvas._chart.getMasterTimeList(), start, end);
    let lasthighs = new Array(this._period);
    lasthighs.fill(0.0);
    let lastlows = new Array(this._period);
    lastlows.fill(0.0);
    let lastclose = 0.0;
    let n = 0; // used to determine whether we've passed period
    let buf_ptr = 0; // used to cycle array values
    // special loop for first n periods as we wont have full data
    // repeat for the remaining ones after n.  we have full arrays now.
    do {
        // get this day's highs, lows and close.
        let highVal = this._high.get(i._d);
        let lowVal = this._low.get(i._d);
        let closeVal = this._close.get(i._d);
        // True Range - The day's High minus the Low; 
        let tr = highVal - lowVal;
        let th = 0.0; // highest high in n periods
        let tl = 0.0; // lowest low in n periods
        let trn = 0.0; // true range in n periods
        let vr = 0.0; // the volatility ratio
        if (n > 0) {
            // Today's High minus yesterday's Close
            tr = Math.max(tr, Math.abs(highVal - lastclose));
            // Yesterday's Close minus today's Low. 
            tr = Math.max(tr, Math.abs(lastclose - lowVal));
            // calculate true high (n periods) 
            // = maximum of the highest High in n-periods and the previous (n-1) close
            th = Utils.maxInArray(lasthighs);
            th = Math.max(th, lastclose);
            // calculate true low (n periods)
            // = minimum of the lowest Low in n-periods and the previous (n-1) close 
            tl = Utils.minInArray(lastlows);
            tl = Math.min(tl, lastclose);
            // calculate true range (n periods)
            trn = th - tl;
            // and add to series
            if (trn !== 0.0) {
                vr = tr / trn;
                this._series.append(i._d, vr);
            }
        }
        // maintain last values
        lastclose = closeVal;
        // maintain arrays
        if (n < this._period) {
            // we dont have full arrays yet
            lasthighs[n] = highVal;
            lastlows[n] = lowVal;
        } else {
            // we have full arrays, cycle out old values
            lasthighs[buf_ptr] = highVal;
            lastlows[buf_ptr] = lowVal;
        }
        // array pointer
        buf_ptr++;
        if (buf_ptr === this._period)
            buf_ptr = 0;
        n++;
    } while (i.move());
}
/** @override */
StudyVolatilityRatio.prototype.draw = function() {
    this.updateY();
    this._parent.drawLineNormal(this._series, this._colour);
    // Breakouts are signaled by a Volatility Ratio greater than 0.5
    this._parent._chartCanvas.setStrokeColor(Color.darkGray);
    this._parent._chartCanvas.drawLineWithAdjust(this._parent._chartCanvas._topLineStartX, parseInt(this._parent.getY(0.5), 10), this._parent._chartCanvas._topLineEndX, parseInt(this._parent.getY(0.5), 10));
}