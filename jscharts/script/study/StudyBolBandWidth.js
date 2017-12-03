/* eslint no-unused-vars: "off" */
/* global Study, Series, StudyDialog_StudyEditParameter, Language, Utils, MetaStudy, XTIterator, Color */
/**
 * @constructor
 * @extends {Study}
 * @param {Overlay} o
 */
function StudyBolBandWidth(o) {
    this._period = 20;
    this._dev = 2;
    this._stddeviation = new Series();
    Study.call(this, o);
}
/**
 * Inheriting
 */
StudyBolBandWidth.prototype = Object.create(Study.prototype);
StudyBolBandWidth.prototype.constructor = StudyBolBandWidth;
/** @static */
StudyBolBandWidth.getItems = function() {
    return [new StudyDialog_StudyEditParameter("period", Language.getString("toolbardialogs_period")),
                new StudyDialog_StudyEditParameter("dev", Language.getString("toolbardialogs_dev"))];
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyBolBandWidth.newInstance = function(o) {
    return new StudyBolBandWidth(o);
}
/** @static */
StudyBolBandWidth.mnemonic = "BolBandWidth";
/** @static */
StudyBolBandWidth.helpID = 488;
/** @static */
StudyBolBandWidth.ownOverlay = true;
/** @override */
StudyBolBandWidth.prototype.setName = function() {
    this._name = Language.getString("study_bollingerbandwidth") + " (" + this._period + "," + this._dev + ")";
}
/** @override */
StudyBolBandWidth.prototype.getParams = function() {
    return "period-" + this._period + ":dev-" + this._dev;
}
/** @override */
StudyBolBandWidth.prototype.setParams = function(params) {
    var items = Utils.convertStringParams(params, ":", "-");
    if (items.hasOwnProperty("period") && typeof items["period"] !== "undefined")
        this._period = parseInt(items["period"], 10);
    if (items.hasOwnProperty("dev") && typeof items["dev"] !== "undefined")
        this._dev =  parseInt(items["dev"], 10);
    Study.prototype.setParams.call(this, params);
}
/** @override */
StudyBolBandWidth.prototype.update = function(start, end) {
    this._stddeviation = MetaStudy.bollingerBandWidth(this._parent._chart, this._source, this._period, this._dev);
}
/** @override */
StudyBolBandWidth.prototype.getMaxMin = function(i) {
    this._range.reset();
    this._range.getMaxMin(this._stddeviation, i);
}
/** @override */
StudyBolBandWidth.prototype.draw = function() {
    this.updateY();
    if (this._stddeviation.size() === 0)
        return;
    var c = this._parent._chart;
    var startx = c._drawX + c._drawWidth;
    var startYDev = this._parent.getY(this._stddeviation.get(c._currentSymbol._timeEnd));
    var endYDev;
    var i = XTIterator.reverseScreenIterator(c);
    do {
        var curDev = this._stddeviation.get(i._d);
        endYDev = this._parent.getY(curDev);
        if (!isNaN(startYDev) && !isNaN(endYDev) && i.withinSeries(this._stddeviation)) {
            this._parent._chartCanvas.setStrokeColor(Color.blue);
            this._parent._chartCanvas.drawLineWithAdjust(startx, parseInt(startYDev, 10), i._x, parseInt(endYDev, 10));
        }
        startx = i._x;
        startYDev = endYDev;
    } while (i.move());
}
/** @override */
StudyBolBandWidth.prototype.getRange = function() {
    return this._period;
}
/** @override */
StudyBolBandWidth.prototype.getColumnValues = function(d) {
    return [this.d(this._stddeviation.get(d))];
}