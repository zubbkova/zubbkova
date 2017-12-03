/* eslint no-unused-vars: "off" */
/* global Study, Series, Language, MetaStudy, Chart, Color */
/**
 * @constructor
 * @extends {Study}
 * @param {Overlay} o
 */
function StudyHir(o) {
    this._hir = new Series();
    this._movingZero = new Series();
    Study.call(this, o);
}
/**
 * Inheriting
 */
StudyHir.prototype = Object.create(Study.prototype);
StudyHir.prototype.constructor = StudyHir;
/** @static */
StudyHir.getItems = function() {
    return [];
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyHir.newInstance = function(o) {
    return new StudyHir(o);
}
/** @static */
StudyHir.mnemonic = "Hir";
/** @static */
StudyHir.helpID = 2259;
/** @static */
StudyHir.ownOverlay = true;
/** @override */
StudyHir.prototype.setName = function() {
    this._name = Language.getString("study_hir");
}
/** @override */
StudyHir.prototype.update = function(start, end) {
    this._hir.clear();
    this._movingZero.clear();
    var c = this._parent._chart;
    this._hir = MetaStudy.SMA(c, MetaStudy.subtractSeries(c, c.getSeries(Chart.S_CUR_CLOSE), c.getSeries(Chart.S_CUR_OPEN)),  3);
    this._movingZero = MetaStudy.SMA(c, MetaStudy.subtractSeries(c, MetaStudy.offsetSeries(c,  c.getSeries(Chart.S_CUR_CLOSE), -1), c.getSeries(Chart.S_CUR_OPEN)), 3);
}
/** @override */
StudyHir.prototype.getMaxMin = function(i) {
    this._range.reset();
    this._range.getMaxMin(this._hir, i);
    this._range.getMaxMin(this._movingZero, i);
}
/** @override */
StudyHir.prototype.drawPrice = function() {
    this._parent.drawPrice(this._hir.get(this._parent._chart._currentSymbol._timeEnd), Color.green);
    this._parent.drawPrice(this._movingZero.get(this._parent._chart._currentSymbol._timeEnd), Color.red);
}
/** @override */
StudyHir.prototype.draw = function() {
    this.updateY();
    this._parent.drawLineNormal(this._hir, Color.green);
    this._parent.drawLineNormal(this._movingZero, Color.red);
}