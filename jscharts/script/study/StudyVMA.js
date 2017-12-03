/* global Study, Series, Language, Utils, TimeIterator, StudyDialog_StudyEditParameter */
/**
 * @constructor
 * @extends {Study}
 * @param {Overlay} o
 */
function StudyVMA(o) {
    Study.call(this, o);
    this._period = 15;
    this._offset = 0;
    this._series = new Series();
}
/**
 * Inheriting
 */
StudyVMA.prototype = Object.create(Study.prototype);
StudyVMA.prototype.constructor = StudyVMA;
/** @static */
StudyVMA.getItems = function() {
    return [new StudyDialog_StudyEditParameter("period", Language.getString("toolbardialogs_period")), new StudyDialog_StudyEditParameter("offset", Language.getString("toolbardialogs_offset"))];
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyVMA.newInstance = function(o) {
    return new StudyVMA(o);
}
/** @static */
StudyVMA.mnemonic = "VMA";
/** @static */
StudyVMA.helpID = 474;
/** @static */
StudyVMA.ownOverlay = false;
/** @override */
StudyVMA.prototype.setName = function() {
    this._name = Language.getString("study_volumeweightedmovingaverage") + " (" + this._period + "," + this._offset + ")";
}
/** @override */
StudyVMA.prototype.getParams = function() {
    return "period-" + this._period + ":offset-" + this._offset;
}
/** @override */
StudyVMA.prototype.setParams = function(params) {
    var items = Utils.convertStringParams(params, ":", "-");
    if (items.hasOwnProperty("period") && typeof items["period"] !== "undefined")
        this._period = parseInt(items["period"], 10);
    if (items.hasOwnProperty("offset") && typeof items["offset"] !== "undefined")
        this._offset = parseInt(items["offset"], 10);
    Study.prototype.setParams.call(this, params);
}
/** @override */
StudyVMA.prototype.drawPrice = function() {
    this._parent.drawPrice(this._series.get(this._parent._chart._currentSymbol._timeEnd), this._colour);
}
/** @override */
StudyVMA.prototype.draw = function() {
    this.updateY();
    this._parent.drawLineNormal(this._series, this._colour);
}
/** @override */
StudyVMA.prototype.getRange = function() {
    return this._period;
}
/** @override */
StudyVMA.prototype.update = function(start, end) {
    var pos = 0, n = 0;
    var buffer = new Array(this._period);
    var bufvol = new Array(this._period);
    this._series.clear();
    var i = TimeIterator.forwardRangeIterator(this._parent._chart.getMasterTimeList(), start, end);
    var total = 0.0;
    var totalvol = 0.0;
    for (; n < this._period; i.move()) {
        buffer[n] = this._close.get(i._d);
        var v = bufvol[n] = this._vol.get(i._d);
        total += v * buffer[n];
        totalvol += v;
        if (totalvol === 0.0) {
            this._series.append(this._parent._chart.timeAdjust(i._d, -this._offset), NaN);
        } else {
            this._series.append(this._parent._chart.timeAdjust(i._d, -this._offset), total / totalvol);
        }
        n++;
    }
    do {
        var curval = this._close.get(i._d);
        var vol1 = this._vol.get(i._d);
        total -= bufvol[pos] * buffer[pos];
        total += vol1 * (buffer[pos] = curval);
        totalvol -= bufvol[pos];
        totalvol += bufvol[pos] = vol1;
        if (++pos === this._period)
            pos = 0;
        if (totalvol === 0.0) {
            this._series.append(this._parent._chart.timeAdjust(i._d, -this._offset), NaN);
        } else {
            this._series.append(this._parent._chart.timeAdjust(i._d, -this._offset), total / totalvol);
        }
    } while (i.move());
}