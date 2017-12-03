/* eslint no-unused-vars: "off" */
/* global Study, Series, Language, MetaStudy, Color */
/**
 * @constructor
 * @extends {Study}
 * @param {Overlay} o
 */
function StudyLinearRegressionDetrended(o) {
    this._series = new Series();
    this._regression = new Series();
    this._startValue = 0.0;
    Study.call(this, o);
}
/**
 * Inheriting
 */
StudyLinearRegressionDetrended.prototype = Object.create(Study.prototype);
StudyLinearRegressionDetrended.prototype.constructor = StudyLinearRegressionDetrended;
/**
 * Static
 */
StudyLinearRegressionDetrended.getItems = function() {
    return [];
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyLinearRegressionDetrended.newInstance = function(o) {
    return new StudyLinearRegressionDetrended(o);
}
/** @static */
StudyLinearRegressionDetrended.mnemonic = "LinearRegressionDetrended";
/** @static */
StudyLinearRegressionDetrended.helpID = 1543;
/** @static */
StudyLinearRegressionDetrended.ownOverlay = false;
/** @override */
StudyLinearRegressionDetrended.prototype.setName = function() {
    this._name = Language.getString("study_linearregressiondetrended");
}
/** @override */
StudyLinearRegressionDetrended.prototype.getParams = function() {
    return "";
}
/** @override */
StudyLinearRegressionDetrended.prototype.setParams = function(params) {}
/** @override */
StudyLinearRegressionDetrended.prototype.update = function(start, end) {
    var c = this._parent._chart;
    this._regression = MetaStudy.linearRegression(c, this._close);
    var startValue = this._source.get(c._parent._currentSymbol._timeStart);
    this._series = MetaStudy.addValueToSeries(c, MetaStudy.subtractSeries(c, this._close, this._regression), startValue);
}
/** @override */
StudyLinearRegressionDetrended.prototype.draw = function() {
    this.updateY();
    this._parent.drawLineNormalNoIterator(this._regression, Color.red);
    this._parent.drawLineNormalNoIterator(this._series, Color.blue);
}
/** @override */
StudyLinearRegressionDetrended.prototype.getColumnNames = function() {
    return [this._name, ""];
}
/** @override */
StudyLinearRegressionDetrended.prototype.getColumnValues = function(d) {
    return [this.d(this._regression.get(d)), this.d(this._series.get(d))];
}