/* global Study, Series, StudyDialog_StudyEditParameter, Language, Utils, TimeIterator, Color */
/**
 * @constructor
 * @extends {Study}
 * @param {Overlay} o
 */
function StudyChaikinVol(o) {
    this._period = 10;
    this._period2 = 10;
    this._series = new Series();
    this._series2 = new Series();
    Study.call(this, o);
}
/**
 * Inheriting
 */
StudyChaikinVol.prototype = Object.create(Study.prototype);
StudyChaikinVol.prototype.constructor = StudyChaikinVol;
/** @static */
StudyChaikinVol.getItems = function() {
    return [new StudyDialog_StudyEditParameter("period", Language.getString("toolbardialogs_period")),
                new StudyDialog_StudyEditParameter("period2", Language.getString("toolbardialogs_roc_period"))];
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyChaikinVol.newInstance = function(o) {
    return new StudyChaikinVol(o);
}
/** @static */
StudyChaikinVol.mnemonic = "ChaikinVol";
/** @static */
StudyChaikinVol.helpID = 490;
/** @static */
StudyChaikinVol.ownOverlay = true;
/** @override */
StudyChaikinVol.prototype.setName = function() {
    this._name = Language.getString("study_chaikinvolatility") + " (" + this._period + "," + this._period2 + ")";
}
/** @override */
StudyChaikinVol.prototype.getParams = function() {
    return "period-" + this._period + ":period2-" + this._period2;
}
/** @override */
StudyChaikinVol.prototype.setParams = function(params) {
    var items = Utils.convertStringParams(params, ":", "-");
    if (items.hasOwnProperty("period") && typeof items["period"] !== "undefined")
        this._period = parseInt(items["period"], 10);
    if (items.hasOwnProperty("period2") && typeof items["period2"] !== "undefined")
        this._period2 = parseInt(items["period2"], 10);
    Study.prototype.setParams.call(this, params);
}
/** @override */
StudyChaikinVol.prototype.update = function(start, end) {
    var total = 0.0, current = 0.0;
    var n = 0;
    this._series.clear();
    this._series2.clear();
    var i = TimeIterator.forwardRangeIterator(this._parent._chart.getMasterTimeList(), start, end);
    var myVal;
    // Use simple average for initial period.
    for (; n < this._period; i.move()) {
        // get difference between high and low value
        myVal = this._high.get(i._d) - this._low.get(i._d);
        total += myVal;
        current = total / (++n);
        this._series.append(i._d, current);
    }
    // Use exp. average for the rest.
    var smooth = 2.0 / (1 + this._period);
    do {
        myVal = this._high.get(i._d) - this._low.get(i._d);
        current = current + smooth * (myVal - current);
        this._series.append(i._d, current);
    } while (i.move());
    // work out the ROC compared to period2 ago
    for (var j = this._period2; j < this._series.size(); j++) {
        var val1 = this._series.getByIndex(j);
        var val2 = this._series.getByIndex(j - this._period2);
        var cv = (val1 - val2) / val2 * 100;
        this._series2.append(this._series.timeByIndex(j), cv);
    }
}
/** @override */
StudyChaikinVol.prototype.getMaxMin = function(i) {
    this._range.reset();
    this._range.getMaxMin(this._series2, i);
}
/** @override */
StudyChaikinVol.prototype.drawPrice = function() {
    this._parent.drawPrice(this._series2.get(this._parent._chart._currentSymbol._timeEnd), this._colour);
}
/** @override */
StudyChaikinVol.prototype.draw = function() {
    this.updateY();
    this._parent.drawLineNormal(this._series2, this._colour);
    // draw a line at 0%
    this._parent._chartCanvas.setStrokeColor(Color.darkGray);
    var y = parseInt(this._parent.getY(0.0), 10);
    this._parent._chartCanvas.drawLineWithAdjust(this._parent._chartCanvas._topLineStartX, y, this._parent._chartCanvas._topLineEndX, y);
}
/** @override */
StudyChaikinVol.prototype.getRange = function() {
    return this._period;
}