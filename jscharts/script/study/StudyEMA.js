/**
 * @constructor
 * @extends {Study}
 * @param {Overlay} o
 */
function StudyEMA(o) {
    Study.call(this, o);
    this._period = 15;
    this._offset = 0;
    this._series = new Series();
}
/**
 * Inheriting
 */
StudyEMA.prototype = Object.create(Study.prototype);
StudyEMA.prototype.constructor = StudyEMA;
/** @static */
StudyEMA.getItems = function() {
    return [new StudyDialog_StudyEditParameter("period", Language.getString("toolbardialogs_period")), new StudyDialog_StudyEditParameter("offset", Language.getString("toolbardialogs_offset"))];
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyEMA.newInstance = function(o) {
    return new StudyEMA(o);
}
/** @static */
StudyEMA.mnemonic = "EMA";
/** @static */
StudyEMA.helpID = 419;
/** @static */
StudyEMA.ownOverlay = false;
/** @override */
StudyEMA.prototype.setName = function() {
    this._name = Language.getString("study_exponentialmovingaverage") + " (" + this._period + "," + this._offset + ")";
}
/** @override */
StudyEMA.prototype.update = function(start, end) {
    this._series = MetaStudy.EMA(this._parent._chartCanvas._chart, this._close, this._period, this._offset);
}
/** @override */
StudyEMA.prototype.getParams = function() {
    return "period-" + this._period + ":offset-" + this._offset;
}
/** @override */
StudyEMA.prototype.setParams = function(params) {
    let items = Utils.convertStringParams(params, ":", "-");
    if (items.has("period"))
        this._period = parseInt(items.get("period"), 10);
    if (items.has("offset"))
        this._offset = parseInt(items.get("offset"), 10);
    Study.prototype.setParams.call(this, params);
}
/** @override */
StudyEMA.prototype.draw = function() {
    this.updateY();
    this._parent.drawLineNormal(this._series, this._colour);
    this._parent.drawPrice(this._series.get(this._parent._chartCanvas._chart._currentSymbol._timeEnd), this._colour);
}
/** @override */
StudyEMA.prototype.getRange = function() {
    return this._period;
}