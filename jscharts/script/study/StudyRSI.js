/* eslint no-unused-vars: "off" */
/* global StudyWithPeriod, Series, Language, MetaStudy, Color */
/**
 * @constructor
 * @extends {StudyWithPeriod}
 * @param {Overlay} o
 */
function StudyRSI(o) {
    this._series = new Series();
    StudyWithPeriod.call(this, o, 14);
}
/**
 * Inheriting
 */
StudyRSI.prototype = Object.create(StudyWithPeriod.prototype);
StudyRSI.prototype.constructor = StudyRSI;
/** @static */
StudyRSI.getItems = function() {
    return StudyWithPeriod.getItems();
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyRSI.newInstance = function(o) {
    return new StudyRSI(o);
}
/** @static */
StudyRSI.mnemonic = "RSI";
/** @static */
StudyRSI.helpID = 446;
/** @static */
StudyRSI.ownOverlay = true;
/** @override */
StudyRSI.prototype.setName = function() {
    this._name = Language.getString("study_relativestrengthindex") + " (" + this._period + ")";
}
/** @override */
StudyRSI.prototype.update = function(start, end) {
    this._series = MetaStudy.RSI(this._parent._chart, this._source, this._period);
}
/** @override */
StudyRSI.prototype.draw = function() {
    this.updateY();
    this._parent.drawLineNormal(this._series, this._colour);
    // Draw 70/50/30 lines.
    this._parent._chartCanvas.setStrokeColor(Color.darkGray);
    var y = parseInt(this._parent.getY(70.0), 10);
    this._parent._chartCanvas.drawLineWithAdjust(this._parent._chartCanvas._topLineStartX, y, this._parent._chartCanvas._topLineEndX, y);
    y = parseInt(this._parent.getY(50.0), 10);
    this._parent._chartCanvas.drawLineWithAdjust(this._parent._chartCanvas._topLineStartX, y, this._parent._chartCanvas._topLineEndX, y);

    y = parseInt(this._parent.getY(30.0), 10);
    this._parent._chartCanvas.drawLineWithAdjust(this._parent._chartCanvas._topLineStartX, y, this._parent._chartCanvas._topLineEndX, y);
}
/** @override */
StudyRSI.prototype.getMaxMin = function(i) {
    this._range.reset();
    this._range._min = 0;
    this._range._max = 100;
}