/* eslint no-unused-vars: "off" */
/* global Study, Series, Language, Utils, TimeIterator, StudyDialog_StudyEditParameter, Color */
/**
 * @constructor
 * @extends {Study}
 * @param {Overlay} o
 */
function StudyMass(o) {
    Study.call(this, o);
    this._fastperiod = 9;
    this._slowperiod = 25;
    this._series = new Series();
}
/**
 * Inheriting
 */
StudyMass.prototype = Object.create(Study.prototype);
StudyMass.prototype.constructor = StudyMass;
/** @static */
StudyMass.getItems = function() {
    return [new StudyDialog_StudyEditParameter("slow", Language.getString("toolbardialogs_slow_period")),
                new StudyDialog_StudyEditParameter("fast", Language.getString("toolbardialogs_fast_period"))];
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyMass.newInstance = function(o) {
    return new StudyMass(o);
}
/** @static */
StudyMass.mnemonic = "Mass";
/** @static */
StudyMass.helpID = 458;
/** @static */
StudyMass.ownOverlay = true;
/** @override */
StudyMass.prototype.setName = function() {
    this._name = Language.getString("study_massindex") + " (" + this._fastperiod + "," + this._slowperiod + ")";
}
/** @override */
StudyMass.prototype.getParams = function() {
    return "fast-" + this._fastperiod + ":slow-" + this._slowperiod;
}
/** @override */
StudyMass.prototype.setParams = function(params) {
    var items = Utils.convertStringParams(params, ":", "-");
    if (items.hasOwnProperty("fast") && typeof items["fast"] !== "undefined")
        this._fastperiod = parseInt(items["fast"], 10);
    if (items.hasOwnProperty("slow") && typeof items["slow"] !== "undefined")
        this._slowperiod = parseInt(items["slow"], 10);
    Study.prototype.setParams.call(this, params);
}
/** @override */
StudyMass.prototype.update = function(start, end) {
    this._series.clear();
    var i = TimeIterator.forwardRangeIterator(this._parent._chart.getMasterTimeList(), start, end);
    var buf_ptr = 0;
    var n = 0;
    var buf = new Array(this._slowperiod);
    buf.fillArrayWithValue(0);
    var fastper = 2.0 * (this._fastperiod + 1);
    var fastfrac = 1.0 / fastper;
    var omfastfrac = 1.0 - fastfrac;
    var fastmatotal = 0.0;
    var fastmamatotal = 0.0;
    var fastema = 0.0;
    var emafastema = 0.0;
    var masstotal = 0.0;
    do {
        var d = new Date(i._d.getTime());
        var closeVal = this._source.get(d);
        if (n < this._fastperiod) {
            // Use MA until we have fastperiod data points
            fastmatotal += closeVal;
            fastema = fastmatotal / (n + 1);
            fastmamatotal += fastema;
            emafastema = fastmamatotal / (n + 1);
        } else {
            fastema = fastema * omfastfrac + closeVal * fastfrac;
            emafastema = emafastema * omfastfrac + fastema * fastfrac;
        }
        masstotal += (buf[buf_ptr] = fastema / emafastema);
        buf_ptr++;
        if (buf_ptr >= this._slowperiod) {
            buf_ptr = 0;
        }
        if (n >= this._slowperiod) {
            masstotal -= buf[buf_ptr];
        }
        if (n >= this._slowperiod) {
            this._series.append(d, masstotal);
        }
        n++;
    } while (i.move());
}
/** @override */
StudyMass.prototype.getMaxMin = function(i) {
    this._range.reset();
    this._range._max = 30.0;
    this._range._min = 15.0;
}
/** @override */
StudyMass.prototype.draw = function() {
    this.updateY();
    this._parent.drawLineNormal(this._series, this._colour);
    var y = parseInt(this._parent.getY(27), 10);
    this._parent._chartCanvas.setStrokeColor(Color.brightGreen);
    this._parent._chartCanvas.drawLineWithAdjust(this._parent._chartCanvas._topLineStartX, y, this._parent._chartCanvas._topLineEndX, y);
    y = parseInt(this._parent.getY(26.5), 10);
    this._parent._chartCanvas.setStrokeColor(Color.red);
    this._parent._chartCanvas.drawLineWithAdjust(this._parent._chartCanvas._topLineStartX, y, this._parent._chartCanvas._topLineEndX, y);
}