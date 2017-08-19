/**
 * @constructor
 * @extends {Study}
 * @param {Overlay} o
 */
function StudyAMA(o) {
    this._weightdecline = 0.7071;
    this._period = 15;
    this._offset = 0;
    this._series = new Series();
    Study.call(this, o);
}
/**
 * Inheriting
 */
StudyAMA.prototype = Object.create(Study.prototype);
StudyAMA.prototype.constructor = StudyAMA;
/** @static */
StudyAMA.getItems = function() {
    return [new StudyDialog_StudyEditParameter("period", Language.getString("toolbardialogs_period")), new StudyDialog_StudyEditParameter("offset", Language.getString("toolbardialogs_offset")), new StudyDialog_StudyEditParameter("wd", Language.getString("toolbardialogs_weight"))];
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyAMA.newInstance = function(o) {
    return new StudyAMA(o);
}
/** @static */
StudyAMA.mnemonic = "AMA";
/** @static */
StudyAMA.helpID = 475;
/** @static */
StudyAMA.ownOverlay = false;
/** @override */
StudyAMA.prototype.setName = function() {
    this._name = Language.getString("study_adaptivemovingaverage") + " (" + this._period + "," + this._offset + "," + this._weightdecline + ")";
}
/** @override */
StudyAMA.prototype.getParams = function() {
    return "period-" + this._period + ":offset-" + this._offset + ":wd-" + this._weightdecline;
}
/** @override */
StudyAMA.prototype.setParams = function(params) {
    let items = Utils.convertStringParams(params, ":", "-");
    if (items.has("period"))
        this._period = parseInt(items.get("period"), 10);
    if (items.has("offset"))
        this._offset = parseInt(items.get("offset"), 10);
    if (items.has("wd"))
        this._weightdecline = parseFloat(items.get("wd"));
    Study.prototype.setParams.call(this, params);
}
/** @override */
StudyAMA.prototype.update = function(start, end) {
    let nl = this._period - 1;
    let nr = 0;
    let order = Math.min(6, this._period);
    let sgderivs = Savgol.savgol(this._period, nl, nr, 1, order); // Sixth order coeff for first derivative.
    let pos = 0;
    if (!this.checkRange(this._source))
        return;

    let buffer = new Array(this._period);
    let bufderiv = new Array(this._period);
    this._series.clear();
    let i = TimeIterator.forwardRangeIterator(this._parent._chartCanvas._chart.getMasterTimeList(), start, end);
    do {
        let curval = this._source.get(i._d);
        buffer[pos] = curval;
        let opos = pos;
        if (++pos === this._period)
            pos = 0;
        let deriv = 0.0;
        let sgpos = 0;
        let ppos = opos;
        for (let j = 0; j < this._period; j++) {
            deriv += buffer[ppos--] * sgderivs[sgpos++];
            if (ppos < 0) {
                ppos += this._period;
            }
            if (sgpos >= nl) {
                sgpos = this._period - 1;
            }
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
        this._series.append(this._parent._chartCanvas._chart.timeAdjust(i._d, -this._offset), ama);
    } while (i.move());
}
/** @override */
StudyAMA.prototype.draw = function() {
    this.updateY();
    this._parent.drawLineNormal(this._series, this._colour);
    this._parent.drawPrice(this._series.get(this._parent._chartCanvas._chart._currentSymbol._timeEnd), this._colour);
}