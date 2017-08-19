/**
 * @constructor
 * @extends {StudyWithPeriod}
 * @param {Overlay} o
 */
function StudyChoppiness(o) {
    StudyWithPeriod.call(this, o, 14);
    this._series = new Series();
}
/**
 * Inheriting
 */
StudyChoppiness.prototype = Object.create(StudyWithPeriod.prototype);
StudyChoppiness.prototype.constructor = StudyChoppiness;
/** @static */
StudyChoppiness.getItems = function() {
    return StudyWithPeriod.getItems();
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyChoppiness.newInstance = function(o) {
    return new StudyChoppiness(o);
}
/** @static */
StudyChoppiness.mnemonic = "Choppiness";
/** @static */
StudyChoppiness.helpID = 487;
/** @static */
StudyChoppiness.ownOverlay = true;
/** @override */
StudyChoppiness.prototype.setName = function() {
    this._name = Language.getString("study_choppiness") + " (" + this._period + ")";
}
/** @override */
StudyChoppiness.prototype.update = function(start, end) {
    let closeVal = 0.0;
    let highVal = 0.0;
    let lowVal = 0.0;
    let lastclose = 0.0;
    let maxhigh = 0.0;
    let maxlow = 0.0;
    let tr = 0.0;
    let atr = 0.0;
    // wipe out series from last time
    this._series.clear();
    // arrays for previous results
    let lastcloses = new Array(this._period);
    lastcloses.fill(0);
    let lasthighs = new Array(this._period);
    lasthighs.fill(0);
    let lastlows = new Array(this._period);
    lastlows.fill(0);
    let buf_tr = new Array(this._period);
    buf_tr.fill(0);
    let atrs = new Array(this._period);
    atrs.fill(0);
    // for output to the series
    let result = 0.0;
    // for handling loops
    let n = 0;
    let buf_ptr = 0;
    let i = TimeIterator.forwardRangeIterator(this._parent._chartCanvas._chart.getMasterTimeList(), start, end);
    do {
        // work out ATR(1) over last N periods
        highVal = this._high.get(i._d);
        lowVal = this._low.get(i._d);
        closeVal = this._close.get(i._d);
        // set up tr
        tr = highVal - lowVal;
        if (n != 0) {
            // check against the lastclose - high, lastclose - low if we have lastclose
            tr = Math.max(Math.abs(lastclose - highVal), tr);
            tr = Math.max(Math.abs(lastclose - lowVal), tr);
        }
        // store the tr 
        buf_tr[buf_ptr] = tr;
        // atr is calculated here with a period of 1, by definition ie tr / 1
        atr = tr;
        // and store it in the array.  same as final iteration but we need it now!
        if(n < this._period) {
            atrs[n] = atr;
        } else {
            atrs[buf_ptr] = atr;
        }
        // work out sum of ATRs and put in result
        result = 0.0;
        for(let j = 0; j < atrs.length; j++){
            result += atrs[j];
        }
        // compare highest high of (H or last close) over N periods.
        // quick extra check against the current high.
        maxhigh = Math.max(Math.max(Utils.maxInArray(lasthighs), highVal), Utils.maxInArray(lastcloses));
        // compare lowest low of (H or last close) over N periods
        // quick extra check against the current low.
        maxlow = Math.min(Math.min(Utils.minInArray(lastlows), lowVal), Utils.minInArray(lastcloses));
        result = result / (maxhigh - maxlow);
        // and now a bunch of logs
        // result = (Math.log(result) / Math.log(10)) / (Math.log(period) - Math.log(10)) * 100;
        result = (Math.log(result) / Math.log(this._period)) * 100;
        // first set of results are unreliable, up to period?
        if (n >= this._period) 
            this._series.append(i._d, result);
        // values and arrays for next iteration
        lasthighs[buf_ptr] = highVal;
        lastlows[buf_ptr] = lowVal;
        lastcloses[buf_ptr] = closeVal;
        lastclose = closeVal;
        n++;
        // array pointer
        buf_ptr++;
        if (buf_ptr === this._period) 
            buf_ptr = 0;
    } while (i.move());
}
/** @override */
StudyChoppiness.prototype.draw = function() {
    this.updateY();
    this._parent.drawLineNormal(this._series, Color.blue);
}