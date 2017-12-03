/* eslint no-unused-vars: "off" */
/* global Study, Series, Language, MetaStudy */
/**
 * @constructor
 * @extends {Study}
 * @param {Overlay} o
 */
function StudyLinearRegression(o) {
    this._series = new Series();
    Study.call(this, o);
}
/**
 * Inheriting
 */
StudyLinearRegression.prototype = Object.create(Study.prototype);
StudyLinearRegression.prototype.constructor = StudyLinearRegression;
/** @static */
StudyLinearRegression.getItems = function() {
    return [];
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyLinearRegression.newInstance = function(o) {
    return new StudyLinearRegression(o);
}
/** @static */
StudyLinearRegression.mnemonic = "LinearRegression";
/** @static */
StudyLinearRegression.helpID = 1542;
/** @static */
StudyLinearRegression.ownOverlay = false;
/** @override */
StudyLinearRegression.prototype.setName = function() {
    this._name = Language.getString("study_linearregression");
}
/** @override */
StudyLinearRegression.prototype.update = function(start, end) {
    this._series = MetaStudy.linearRegression(this._parent._chart, this._close);
}
/** @override */
StudyLinearRegression.prototype.draw = function() {
    this.updateY();
    this._parent.drawLineNormalNoIterator(this._series, this._colour);
}