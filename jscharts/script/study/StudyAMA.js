/* global Study, Series, StudyDialog_StudyEditParameter, Language, Utils, Savgol, TimeIterator */
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
    var items = Utils.convertStringParams(params, ":", "-");
    if (items.hasOwnProperty("period") && typeof items["period"] !== "undefined")
        this._period = parseInt(items["period"], 10);
    if (items.hasOwnProperty("offset") && typeof items["offset"] !== "undefined")
        this._offset = parseInt(items["offset"], 10);
    if (items.hasOwnProperty("wd") && typeof items["wd"] !== "undefined")
        this._weightdecline = parseFloat(items["wd"]);
    Study.prototype.setParams.call(this, params);
}
/** @override */
StudyAMA.prototype.update = function(start, end) {
    var nl = this._period - 1;
    var nr = 0;
    var order = Math.min(6, this._period);
    var sgderivs = Savgol.savgol(this._period, nl, nr, 1, order); // Sixth order coeff for first derivative.
    var pos = 0;
    if (!this.checkRange(this._source))
        return;

    var buffer = new Array(this._period);
    var bufderiv = new Array(this._period);
    this._series.clear();
    var i = TimeIterator.forwardRangeIterator(this._parent._chart.getMasterTimeList(), start, end);
    do {
        var curval = this._source.get(i._d);
        buffer[pos] = curval;
        var opos = pos;
        if (++pos === this._period)
            pos = 0;
        var deriv = 0.0;
        var sgpos = 0;
        var ppos = opos;
        var j;
        for (j = 0; j < this._period; j++) {
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
        var weight = 1.0;
        var totalweight = 0.0;
        var lastderiv = 0.0;
        var mean = 0.0;
        for (j = 0; j < this._period; j++) {
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
        var ama = mean / totalweight;
        this._series.append(this._parent._chart.timeAdjust(i._d, -this._offset), ama);
    } while (i.move());
}
/** @override */
StudyAMA.prototype.drawPrice = function() {
    this._parent.drawPrice(this._series.get(this._parent._chart._currentSymbol._timeEnd), this._colour);
}
/** @override */
StudyAMA.prototype.draw = function() {
    this.updateY();
    this._parent.drawLineNormal(this._series, this._colour);
}