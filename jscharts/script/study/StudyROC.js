/**
 * @constructor
 * @extends {StudyWithPeriod}
 * @param {Overlay} o
 */
function StudyROC(o) {
    StudyWithPeriod.call(this, o, 15);
    this._series = new Series();
}
/**
 * Inheriting
 */
StudyROC.prototype = Object.create(StudyWithPeriod.prototype);
StudyROC.prototype.constructor = StudyROC;
/** @static */
StudyROC.getItems = function() {
    return StudyWithPeriod.getItems();
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyROC.newInstance = function(o) {
    return new StudyROC(o);
}
/** @static */
StudyROC.mnemonic = "ROC";
/** @static */
StudyROC.helpID = 441;
/** @static */
StudyROC.ownOverlay = true;
/** @override */
StudyROC.prototype.setName = function() {
    this._name = Language.getString("study_rateofchange") + " (" + this._period + ")";
}
/** @override */
StudyROC.prototype.update = function(start, end) {
    this._series = MetaStudy.ROC(this._parent._chartCanvas._chart, this._source, this._period);
}