/* eslint no-unused-vars: "off" */
/* global Study, Series, StudyDialog_StudyEditParameter, Language, Utils, MetaStudy, Chart */
/**
 * StudyKeltner
 * @constructor
 * @extends {Study}
 * @param {Overlay} o
 */
function StudyKeltner(o) {
    Study.call(this, o);
    this._period = 10;
    this._series = new Series();
    this._ap = new Series();
    this._middleMA = new Series();
    this._bandMA = new Series();
    this._upperBand = new Series();
    this._lowerBand = new Series();
}
/**
 * Inheriting
 */
StudyKeltner.prototype = Object.create(Study.prototype);
StudyKeltner.prototype.constructor = StudyKeltner;
/** 
 * @static
 * @param {Overlay} o
 */
StudyKeltner.newInstance = function(o) {
    return new StudyKeltner(o);
}
/** @static */
StudyKeltner.mnemonic = "Keltner";
/** @static */
StudyKeltner.helpID = 1803;
/** @static */
StudyKeltner.ownOverlay = false;
/** @static */
StudyKeltner.getItems = function() {
    return [new StudyDialog_StudyEditParameter("period", Language.getString("toolbardialogs_period"))];
}
/** @override */
StudyKeltner.prototype.setName = function() {
    this._name = Language.getString("study_keltner") + " (" + this._period + ")";
}
/** @override */
StudyKeltner.prototype.getParams = function() {
    return "period-" + this._period;
}
/** @override */
StudyKeltner.prototype.setParams = function(p) {
    var items = Utils.convertStringParams(p, ":", "-");
    if (items.hasOwnProperty("period") && typeof items["period"] !== "undefined") {
        this._period = parseInt(items["period"], 10);
    }
    Study.prototype.setParams.call(this, p);
}
/** @override */
StudyKeltner.prototype.update = function(start, end) {
    var c = this._parent._chart;
    this._ap = MetaStudy.averageSeries(c, c.getSeries(Chart.S_CUR_CLOSE), c.getSeries(Chart.S_CUR_HIGH), c.getSeries(Chart.S_CUR_LOW));
    this._middleMA = MetaStudy.SMA(c, this._ap, this._period);
    this._bandMA = MetaStudy.SMA(c, MetaStudy.subtractSeries(c, c.getSeries(Chart.S_CUR_HIGH), c.getSeries(Chart.S_CUR_LOW)), this._period);
    this._upperBand = MetaStudy.sumSeries(c, this._middleMA, this._bandMA);
    this._lowerBand = MetaStudy.subtractSeries(c, this._middleMA, this._bandMA);
}
/** @override */
StudyKeltner.prototype.draw = function() {
    this.updateY();
    this._parent.drawLineNormal(this._middleMA, this._colour);
    this._parent.drawShadedChannel(this._upperBand, this._lowerBand, this._colour, this._colour);
}
/** @override */
StudyKeltner.prototype.getMaxMin = function(i) {
    this._range.reset();
    this._range.getMaxMin(this._upperBand, i);
    i.reset();
    this._range.getMaxMin(this._lowerBand, i);
    i.reset();
    this._range.getMaxMin(this._middleMA, i);
}
/** @override */
StudyKeltner.prototype.getRange = function() {
    return this._period;
}