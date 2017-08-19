/**
 * @constructor
 * @extends {Study}
 * @param {Overlay} o
 */
function StudyMx(o) {
    Study.call(this, o);
}
/**
 * Inheriting
 */
StudyMx.prototype = Object.create(Study.prototype);
StudyMx.prototype.constructor = StudyMx;
/** @static */
StudyMx.getItems = function() {
    return [];
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyMx.newInstance = function(o) {
    return new StudyMx(o);
}
/** @static */
StudyMx.mnemonic = "Mx";
/** @static */
StudyMx.helpID = 2259;
/** @static */
StudyMx.ownOverlay = false;
/** @override */
StudyMx.prototype.setName = function() {
    this._name = Language.getString("study_mx");
}
/** @override */
StudyMx.prototype.update = function(start, end) {
    this._series = MetaStudy.offsetSeries(this._parent._chartCanvas._chart, MetaStudy.SMA(this._parent._chartCanvas._chart, this._parent._chartCanvas._chart.getSeries(Chart.S_CUR_CLOSE), 3), -3);
}
/** @override */
StudyMx.prototype.draw = function() {
    this.updateY();
    this._parent.drawLineNormal(this._series, this._colour);
    this._parent.drawPrice(this._series.get(this._parent._chartCanvas._chart._currentSymbol._timeEnd), this._colour);
}