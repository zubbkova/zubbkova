/* eslint no-unused-vars: "off" */
/* global Study, Series, Language, Utils, StudyDialog_StudyEditParameter, MetaStudy, Color */
/**
 * True Strength Indicator
 * 
 * The True Strength Index (TSI) is a momentum-based indicator, developed by William Blau, 
 * designed to determine both the trend and overbought-oversold conditions.
 * 
 * TSI(close,r,s) = 100*EMA(EMA(mtm,r),s)/EMA(EMA(abs(mtm),r),s)
 * where mtm = close(today) - close (yesterday)
 *
 * it is plotted against an EMA of itself, of a third period.
 * 
 * @author davidw
 * @constructor
 * @extends {Study}
 * @param {Overlay} o
 */
function StudyTrueStrengthIndicator(o) {
    Study.call(this, o);
    this._period1 = 25;
    this._period2 = 13;
    this._period3 = 7;
    this._series = new Series();
    this._ema = new Series();
}
/**
 * Inheriting
 */
StudyTrueStrengthIndicator.prototype = Object.create(Study.prototype);
StudyTrueStrengthIndicator.prototype.constructor = StudyTrueStrengthIndicator;
/** @static */
StudyTrueStrengthIndicator.getItems = function() {
    return [new StudyDialog_StudyEditParameter("period1", Language.getString("toolbardialogs_period") + " 1"), new StudyDialog_StudyEditParameter("period2", Language.getString("toolbardialogs_period") + " 2"), new StudyDialog_StudyEditParameter("period3", Language.getString("toolbardialogs_period") + " 3")];
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyTrueStrengthIndicator.newInstance = function(o) {
    return new StudyTrueStrengthIndicator(o);
}
/** @static */
StudyTrueStrengthIndicator.mnemonic = "TrueStrengthIndicator";
/** @static */
StudyTrueStrengthIndicator.helpID = 555;
/** @static */
StudyTrueStrengthIndicator.ownOverlay = true;
/** @override */
StudyTrueStrengthIndicator.prototype.setName = function() {
    this._name = Language.getString("study_truestrengthindicator") + " (" + this._period1 + "," + this._period2 + "," + this._period3 + ")";
}
/** @override */
StudyTrueStrengthIndicator.prototype.getParams = function() {
    return "period1-" + this._period1+ ":period2-" + this._period2 + ":period3-" + this._period3;
}
/** @override */
StudyTrueStrengthIndicator.prototype.setParams = function(params) {
    var items = Utils.convertStringParams(params, ":", "-");
    if (items.hasOwnProperty("period1") && typeof items["period1"] !== "undefined")
        this._period1 = parseInt(items["period1"], 10);
    if (items.hasOwnProperty("period2") && typeof items["period2"] !== "undefined")
        this._period2 = parseInt(items["period2"], 10);
    if (items.hasOwnProperty("period3") && typeof items["period3"] !== "undefined")
        this._period3 = parseInt(items["period3"], 10);
    Study.prototype.setParams.call(this, params);
}
/** @override */
StudyTrueStrengthIndicator.prototype.update = function(start, end) {
    var c = this._parent._chart;
    // work out the mtm deltas
    this._series = MetaStudy.percentageRatioSeries(c, 
        MetaStudy.EMA(c, MetaStudy.EMA(c, MetaStudy.deltaSeries(c, this._source), this._period1), this._period2), MetaStudy.EMA(c, MetaStudy.EMA(c, MetaStudy.absoluteValueSeries(c, MetaStudy.deltaSeries(c, this._source)), this._period1), this._period2));
    this._ema = MetaStudy.EMA(c, this._series, this._period3);
}
/** @override */
StudyTrueStrengthIndicator.prototype.drawPrice = function() {
    this._parent.drawPrice(this._ema.get(this._parent._chart._currentSymbol._timeEnd), Color.red);
    this._parent.drawPrice(this._series.get(this._parent._chart._currentSymbol._timeEnd), Color.blue);
}
/** @override */
StudyTrueStrengthIndicator.prototype.draw = function() {
    this.updateY();
    this._parent.drawLineNormal(this._ema, Color.red);
    this._parent.drawLineNormal(this._series, Color.blue);
}
/** @override */
StudyTrueStrengthIndicator.prototype.getRange = function() {
    return this._period1;
}
/** @override */
StudyTrueStrengthIndicator.prototype.getColumnNames = function() {
    return [this._name, ""];
}
/** @override */
StudyTrueStrengthIndicator.prototype.getColumnValues = function(d) {
    return [this.d(this._series.get(d)), this.d(this._ema.get(d))]
}