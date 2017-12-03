/* eslint no-unused-vars: "off" */
/* global Study, Series, StudyDialog_StudyEditParameter, Language, Color, Utils, MetaStudy */
/**
 * @constructor
 * @extends {Study}
 * @param {Overlay} o
 */
function StudyIchimoku(o) {
    this._period1 = 9;
    this._period2 = 26;
    this._tenkanSen = new Series();		// turning line, highest high + lowest low MAd for 9 periods
    this._kijunSen = new Series();		// standard line, highest high + lowest low MAd for 26 periods
    this._chikouSen = new Series();		// current price 26 periods ago
    this._senkuoSpan1 = new Series();		// upper and lower boundaries of Leading span
    this._senkuoSpan2 = new Series();
    Study.call(this, o);
}
/**
 * Inheriting
 */
StudyIchimoku.prototype = Object.create(Study.prototype);
StudyIchimoku.prototype.constructor = StudyIchimoku;
/** @static */
StudyIchimoku.getItems = function() {
    return [new StudyDialog_StudyEditParameter("period1", Language.getString("toolbardialogs_period") + " 1"),
                new StudyDialog_StudyEditParameter("period2", Language.getString("toolbardialogs_period") + " 2")];
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyIchimoku.newInstance = function(o) {
    return new StudyIchimoku(o);
}
/** @static */
StudyIchimoku.mnemonic = "Ichimoku";
/** @static */
StudyIchimoku.helpID = 554;
/** @static */
StudyIchimoku.ownOverlay = false;
/** @static */
StudyIchimoku.tenkanSenColour = new Color(255, 0, 0);
/** @static */
StudyIchimoku.kijunSenColour = new Color(128, 48, 48);
/** @static */
StudyIchimoku.chikouSenColour = new Color(255, 160, 160);
/** @static */
StudyIchimoku.senkuoSpan1Color = new Color(128, 255, 128);
/** @static */
StudyIchimoku.senkuoSpan2Color = new Color(128, 128, 255);
/** @override */
StudyIchimoku.prototype.setName = function() {
    this._name = Language.getString("study_ichimokukinkohyo") + " (" + this._period1 + "," + this._period2 + ")";
}
/** @override */
StudyIchimoku.prototype.getParams = function() {
    return "period1-" + this._period1 + ":period2-" + this._period2;
}
/** @override */
StudyIchimoku.prototype.setParams = function(params) {
    var items = Utils.convertStringParams(params, ":", "-");
    if (items.hasOwnProperty("period1") && typeof items["period1"] !== "undefined")
        this._period1 = parseInt(items["period1"], 10);
    if (items.hasOwnProperty("period2") && typeof items["period2"] !== "undefined")
        this._period2 = parseInt(items["period2"], 10);
    Study.prototype.setParams.call(this, params);
}
/** @override */
StudyIchimoku.prototype.update = function(start, end) {
    var c = this._parent._chart;
    this._tenkanSen.clear(); 
    this._kijunSen.clear(); 
    this._chikouSen.clear(); 
    this._senkuoSpan1.clear(); 
    this._senkuoSpan2.clear();
    this._tenkanSen = MetaStudy.averageSeriesTwo(c, MetaStudy.HighestHigh(c, this._high, this._period1), MetaStudy.LowestLow(c, this._low, this._period1));
    this._kijunSen  = MetaStudy.averageSeriesTwo(c, MetaStudy.HighestHigh(c, this._high, this._period2), MetaStudy.LowestLow(c, this._low, this._period2));
    this._chikouSen = MetaStudy.offsetSeries(c, this._close, this._period2);
    this._senkuoSpan1 = MetaStudy.offsetSeries(c, MetaStudy.averageSeriesTwo(c, this._tenkanSen, this._kijunSen), -this._period2);
    this._senkuoSpan2 = MetaStudy.offsetSeries(c, MetaStudy.averageSeriesTwo(c, MetaStudy.HighestHigh(c, this._high, this._period2 * 2), MetaStudy.LowestLow(c, this._low, this._period2 * 2)), -this._period2);
}
/** @override */
StudyIchimoku.prototype.draw = function() {
    this.updateY();
    this._parent.drawLineNormal(this._tenkanSen, StudyIchimoku.tenkanSenColour);
    this._parent.drawLineNormal(this._kijunSen, StudyIchimoku.kijunSenColour);
    this._parent.drawLineNormalNoIterator(this._chikouSen, StudyIchimoku.chikouSenColour);
    // special code to ensure it draws further than the chart range allows.
    var startx = this._parent.getXOffScale(this._senkuoSpan1.timeByIndex(0));
    var y1 = this._parent.getY(this._senkuoSpan1.getByIndex(0));
    var y2 = this._parent.getY(this._senkuoSpan2.getByIndex(0));
    for (var n = 0; n < this._senkuoSpan1.size(); n++) {
        startx = this._parent.getXOffScale(this._senkuoSpan1.timeByIndex(n));
        y1 = this._parent.getY(this._senkuoSpan1.getByIndex(n));
        y2 = this._parent.getY(this._senkuoSpan2.getByIndex(n));
        // check whether the line is actually onscreen
        if (startx > this._parent._chartCanvas._topLineStartX && startx < this._parent._chartCanvas._topLineEndX) {
            // change colour according to which is on top
            if (y1 < y2) {
                this._parent._chartCanvas.setStrokeColor(StudyIchimoku.senkuoSpan1Color);
            } else {
                this._parent._chartCanvas.setStrokeColor(StudyIchimoku.senkuoSpan2Color);
            }
            this._parent._chartCanvas.drawLineWithAdjust(startx, parseInt(y1, 10), startx, parseInt(y2, 10));
        }
    }
    // use a special version of drawLineNormalNoIterator here that follows normal drawing behaviour for flatlines etc
    // draw each line, on top
    this._drawSenkuoLine(this._senkuoSpan1, StudyIchimoku.senkuoSpan1Color);
    this._drawSenkuoLine(this._senkuoSpan2, StudyIchimoku.senkuoSpan2Color);
}
/** @override */
StudyIchimoku.prototype.getMaxMin = function(i) {
    this._range.reset();
    this._range.getMaxMin(this._tenkanSen, i);
    i.reset();
    this._range.getMaxMin(this._kijunSen, i);
    i.reset();
    this._range.getMaxMin(this._chikouSen, i);
    i.reset();
    this._range.getMaxMin(this._senkuoSpan1, i);
    i.reset();
    this._range.getMaxMin(this._senkuoSpan2, i);
}
/** @override */
StudyIchimoku.prototype.getRange = function() {
    return Math.max(this._period1, this._period2 * 2);
}
/** @override */
StudyIchimoku.prototype.getColumnNames = function() {
    return [this._name];
}
/** @override */
StudyIchimoku.prototype.getColumnValues = function(d) {
    return [this.d(this._tenkanSen.get(d))];
}
/**
 * A modified version of Overlay.drawLineNormal which allows lines to be drawn in the future of the chart.
 * Used for senkuo lines in Ichimoku Kinko Hyo.
 * @private
 * @param {DataSeries} s
 * @param {Color|string} col
 */
StudyIchimoku.prototype._drawSenkuoLine = function(s, col) {
    var endx, endy;
    this._parent._chartCanvas.setStrokeColor(col);
    var startx = this._parent.getXOffScale(s.timeByIndex(0));
    var starty = this._parent.getY(s.getByIndex(0));
    for (var n = 1; n < this._senkuoSpan1.size(); n++) {
        endx = this._parent.getXOffScale(s.timeByIndex(n));
        endy = this._parent.getY(s.getByIndex(n));
        if (!isNaN(starty) && startx > this._parent._chartCanvas._topLineStartX && startx < this._parent._chartCanvas._topLineEndX) {
            // if there is no destination point, draw a flat line
            if (!isNaN(endy))
                this._parent._chartCanvas.drawLineWithAdjust(startx, parseInt(starty, 10), endx, parseInt(endy, 10));
            else
                this._parent._chartCanvas.drawLineWithAdjust(startx, parseInt(starty, 10), endx, parseInt(starty, 10));
        }
        startx = endx;
        starty = endy;
    }
}