/**
 * @constructor
 * @extends {StudyWithPeriod}
 * @param {Overlay} o
 */
function StudyStdDeviation(o) {
    this._series = new Series();
    StudyWithPeriod.call(this, o, 15);
}
/**
 * Inheriting
 */
StudyStdDeviation.prototype = Object.create(StudyWithPeriod.prototype);
StudyStdDeviation.prototype.constructor = StudyStdDeviation;
/** @static */
StudyStdDeviation.getItems = function() {
    return StudyWithPeriod.getItems();
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyStdDeviation.newInstance = function(o) {
    return new StudyStdDeviation(o);
}
/** @static */
StudyStdDeviation.mnemonic = "StdDeviation";
/** @static */
StudyStdDeviation.helpID = 1539;
/** @static */
StudyStdDeviation.ownOverlay = true;
/** @override */
StudyStdDeviation.prototype.setName = function() {
    this._name = Language.getString("study_stddeviation") + " (" + this._period + ")";
}
/** @override */
StudyStdDeviation.prototype.update = function(start, end) {
    this._series = MetaStudy.stdDeviationSeries(this._parent._chartCanvas._chart, this._source, MetaStudy.SMA(this._parent._chartCanvas._chart, this._source, this._period), this._period);
}
/** @override */
StudyStdDeviation.prototype.draw = function() {
    this.updateY();
    this._parent.drawLineNormal(this._series, this._colour);
    this._parent.drawPrice(this._series.get(this._parent._chartCanvas._chart._currentSymbol._timeEnd), this._colour);
}