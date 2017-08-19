/**
 * @constructor
 * @extends {StudyWithPeriod}
 * @param {Overlay} o
 */
function StudyVolumeAMA(o) {
    this._weightdecline = 0.7071;
    StudyWithPeriod.call(this, o, 15);
    this._series = new Series();
    this._period = 15;
}
/**
 * Inheriting
 */
StudyVolumeAMA.prototype = Object.create(StudyWithPeriod.prototype);
StudyVolumeAMA.prototype.constructor = StudyVolumeAMA;
/** @static */
StudyVolumeAMA.getItems = function() {
    return [new StudyDialog_StudyEditParameter("period", Language.getString("toolbardialogs_period")),
                new StudyDialog_StudyEditParameter("wd", Language.getString("toolbardialogs_weight"))];
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyVolumeAMA.newInstance = function(o) {
    return new StudyVolumeAMA(o);
}
/** @static */
StudyVolumeAMA.mnemonic = "VolumeAMA";
/** @static */
StudyVolumeAMA.helpID = 501;
/** @static */
StudyVolumeAMA.ownOverlay = true;
/** @override */
StudyVolumeAMA.prototype.setName = function() {
    this._name = Language.getString("study_volumeama") + " (" + this._period + "," + this._weightdecline + ")";
}
/** @override */
StudyVolumeAMA.prototype.getParams = function() {
    return "period-" + this._period + ":wd-" + this._weightdecline;
}
/** @override */
StudyVolumeAMA.prototype.setParams = function(params) {
    let items = Utils.convertStringParams(params, ":", "-");
    if (items.has("period"))
        this._period = parseInt(items.get("period"), 10);
    if (items.has("wd"))
        this._weightdecline = parseFloat(items.get("wd"));
    StudyVolumeMA.prototype.setParams.call(this, params);
}
/** @override */
StudyVolumeAMA.prototype.getMaxMin = function(i) {
    this._range.reset();
    this._range.getMaxMin(this._vol, i);
    // hardcode to force away problems with low number of data points
    this._range._min = 0;
}
/** @override */
StudyVolumeAMA.prototype.draw = function() {
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
        let end_y = parseInt(this._parent.getY(curVol), 10);
        // plot the volume chart
        if (!isNaN(end_y) && !(i._d > (c._currentSymbol._time))) {
            let width = Math.max(parseInt(c._currentSymbol._unitWidth - 2, 10), 1);
            // draw volume stuff
            this._parent._chartCanvas.setFillColor(Color.lightGray);
            this._parent._chartCanvas.fillRectWithAdjust(i._x - cx + 1, parseInt(end_y, 10), width, parseInt(start_y - end_y + 1, 10));
        }
    } while (i.move());
    // now plot the AMA over the top
    if (!this._period)
        return;
    let source = this._vol;
    let start = source.timeStart();
    let end = c._parent._currentSymbol._time;
    let nl = this._period - 1;
    let nr = 0;
    let order = Math.min(6, this._period);
    let sgderivs = Savgol.savgol(this._period, nl, nr, 1, order); // Sixth order coeff for first derivative.
    let pos = 0;
    let buffer = new Array(this._period);
    buffer.fill(0.0);
    let bufderiv = new Array(this._period);
    bufderiv.fill(0.0);
    this._series.clear();
    let i2 = TimeIterator.forwardRangeIterator(c.getMasterTimeList(), start, end);
    do {
        let curval = source.get(i2._d);
        buffer[pos] = curval;
        let opos = pos;
        if (++pos === this._period)
            pos = 0;
        let deriv = 0.0;
        let sgpos = 0;
        let ppos = opos;
        try {
            for (let j = 0; j < this._period; j++) {
                deriv += buffer[ppos--] * sgderivs[sgpos++];
                if (ppos < 0) {
                    ppos += this._period;
                }
                if (sgpos >= nl) {
                    sgpos = this._period - 1;
                }
            }
        } catch (e) {
            console.error("AMA exception " + ppos + " " + sgpos + " " + e);
        }
        bufderiv[opos] = deriv;
        ppos = opos;
        let weight = 1.0;
        let totalweight = 0.0;
        let lastderiv = 0.0;
        let mean = 0.0;
        for (let j = 0; j < this._period; j++) {
            deriv = bufderiv[ppos];
            if (lastderiv * deriv > 0) {
                weight *= this._weightdecline;
            }
            if (buffer[ppos] != 0)
                totalweight += weight;
            mean += weight * buffer[ppos];
            if (--ppos < 0) {
                ppos = this._period - 1;
            }
            lastderiv = deriv;
        }
        let ama = mean / totalweight;
        this._series.append(i2._d, ama);
    } while (i2.move());
    // and draw!
    this._parent.drawLineNormal(this._series, this._colour);
}