/* eslint no-unused-vars: "off" */
/* global StudyWithPeriod, Series, Language, MetaStudy, Color */
/**
 * @constructor
 * @extends {StudyWithPeriod}
 * @param {Overlay} o
 */
function StudyHighLowMA(o) {
    StudyWithPeriod.call(this, o, 15);
    this._series = new Series();
    this._highSeries = new Series();
    this._lowSeries = new Series();
}
/**
 * Inheriting
 */
StudyHighLowMA.prototype = Object.create(StudyWithPeriod.prototype);
StudyHighLowMA.prototype.constructor = StudyHighLowMA;
/** @static */
StudyHighLowMA.getItems = function() {
    return StudyWithPeriod.getItems();
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyHighLowMA.newInstance = function(o) {
    return new StudyHighLowMA(o);
}
/** @static */
StudyHighLowMA.mnemonic = "HighLowMA";
/** @static */
StudyHighLowMA.helpID = 549;
/** @static */
StudyHighLowMA.ownOverlay = false;
/** @override */
StudyHighLowMA.prototype.setName = function() {
    this._name = Language.getString("study_highlowmovingaverage") + " (" + this._period + ")";
}
/** @override */
StudyHighLowMA.prototype.update = function(start, end) {
    var c = this._parent._chart;
    this._series = MetaStudy.SMA(c, this._close, this._period, 0);
    this._highSeries = MetaStudy.SMA(c, this._high, this._period, 0);
    this._lowSeries = MetaStudy.SMA(c, this._low, this._period, 0);
}
/** @override */
StudyHighLowMA.prototype.drawPrice = function() {
    this._parent.drawPrice(this._series.get(this._parent._chart._currentSymbol._timeEnd), this._colour);
}
/** @override */
StudyHighLowMA.prototype.draw = function() {
    this.updateY();
    this._parent.drawLineNormal(this._series, this._colour);
    this._parent.drawLineNormal(this._highSeries, Color.red);
    this._parent.drawLineNormal(this._lowSeries, Color.red);
}
/** @override */
StudyHighLowMA.prototype.getColumnNames = function() {
    return [this._name, "High", "Low"];
}
/** @override */
StudyHighLowMA.prototype.getColumnValues = function(d) {
    return [this.d(this._series.get(d)), this.d(this._high.get(d)), this.d(this._low.get(d))];
}