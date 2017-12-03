/* global Study, Series, StudyDialog_StudyEditParameter, Language, Utils, TimeIterator, Color */
/**
 * @constructor
 * @extends {Study}
 * @param {Overlay} o
 */
function StudyMACDHistogram(o) {
    this._period = [12, 26, 9];
    this._fixedMid = true;
    this._mid = 0.0;
    this._average = new Array(2);
    this._average[0] = new Series();
    this._average[1] = new Series();
    this._diff = new Series();
    this._series = this._diff;
    Study.call(this, o);
}
/**
 * Inheriting
 */
StudyMACDHistogram.prototype = Object.create(Study.prototype);
StudyMACDHistogram.prototype.constructor = StudyMACDHistogram;
/** @static */
StudyMACDHistogram.getItems = function() {
    return [new StudyDialog_StudyEditParameter("period1", Language.getString("toolbardialogs_period") + " 1"),
                new StudyDialog_StudyEditParameter("period2", Language.getString("toolbardialogs_period") + " 2"),
                new StudyDialog_StudyEditParameter("period3", Language.getString("toolbardialogs_period_sig"))];
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyMACDHistogram.newInstance = function(o) {
    return new StudyMACDHistogram(o);
}
/** @static */
StudyMACDHistogram.mnemonic = "MACDHistogram";
/** @static */
StudyMACDHistogram.helpID = 483;
/** @static */
StudyMACDHistogram.ownOverlay = true;
/** @override */
StudyMACDHistogram.prototype.setName = function() {
    this._name = Language.getString("study_macdhistogram") + " (" + this._period[0] + "," + this._period[1] + "," + this._period[2] + ")";
}
/** @override */
StudyMACDHistogram.prototype.getParams = function() {
    return "period1-" + this._period[0] + ":period2-" + this._period[1] + ":period3-" + this._period[2];
}
/** @override */
StudyMACDHistogram.prototype.setParams = function(params) {
    var items = Utils.convertStringParams(params, ":", "-"); 
    if (items.hasOwnProperty("period1") && typeof items["period1"] !== "undefined")
        this._period[0] = parseInt(items["period2"], 10);
    if (items.hasOwnProperty("period2") && typeof items["period1"] !== "undefined")
        this._period[1] = parseInt(items["period2"], 10);
    if (items.hasOwnProperty("period3") && typeof items["period3"] !== "undefined")
        this._period[2] = parseInt(items["period3"], 10);
    Study.prototype.setParams.call(this, params);
}
/** 
 * @param {number} which 
 * @param {Date=} start 
 * @param {Date=} end
 */
StudyMACDHistogram.prototype.updateEMA = function(which, start, end) {
    var current = 0.0, total = 0.0;
    var n = 0;
    this._average[which].clear();
    var i = TimeIterator.forwardRangeIterator(this._parent._chart.getMasterTimeList(), start, end);
    // Use simple average for initial period.
    for (; n < this._period[which]; i.move()) {
        total += this._close.get(i._d);
        current = total / (++n);
        this._average[which].append(i._d, current);
    }
    // Use exp. average for the rest.
    var smooth = 2.0 / (1 + this._period[which]);
    do {
        current = current + smooth * (this._close.get(i._d) - current);
        this._average[which].append(i._d, current);
    } while (i.move());
}
/** @override */
StudyMACDHistogram.prototype.update = function(start, end) {
    var current = 0.0, total = 0.0;
    var n = 0;
    this._diff.clear();
    // Update moving averages.
    this.updateEMA(0, start, end);
    this.updateEMA(1, start, end);
    var i = TimeIterator.forwardRangeIterator(this._parent._chart.getMasterTimeList(), start, end);
    var curMacd;
    // Use simple average for initial period.
    for (; n < this._period[2]; i.move()) {
        curMacd = this._average[0].get(i._d) - this._average[1].get(i._d);
        total += curMacd;
        current = total / (++n);
        this._diff.append(i._d, curMacd - current);
    }
    // Use exp. average for the rest.
    var smooth = 2.0 / (1 + this._period[2]);
    do {
        curMacd = this._average[0].get(i._d) - this._average[1].get(i._d);
        current = current + smooth * (curMacd - current);
        this._diff.append(i._d, curMacd - current);
    } while (i.move());
}
/** @override */
StudyMACDHistogram.prototype.getMaxMin = function(i) {
    this._range.reset();
    this._range.getMaxMin(this._diff, i);
}
/** @override */
StudyMACDHistogram.prototype.draw = function() {
    this.updateY();
    this._parent.drawLineHistMid(this._diff, Color.black, this._mid);
}
/** @override */
StudyMACDHistogram.prototype.getRange = function() {
    var maxPeriod = 0;
    for (var j = 0; j < 3; j++) {
        if (this._period[j] > maxPeriod)
            maxPeriod = this._period[j];
    }
    return maxPeriod;
}
/** @override */
StudyMACDHistogram.prototype.getColumnValues = function(d) {
    return [this.diff(this._diff.get(d))];
}