/**
 * @constructor
 * @extends {Study}
 * @param {Overlay} o
 */
function StudyMpointer(o) {
    Study.call(this, o);
    this._w = 10;
    this._x = 10;
    this._y = 10;
    this._z = 10;
    this._tickMove = 0.1;
}
/**
 * Inheriting
 */
StudyMpointer.prototype = Object.create(Study.prototype);
StudyMpointer.prototype.constructor = StudyMpointer;
/** @static */
StudyMpointer.getItems = function() {
    return [new StudyDialog_StudyEditParameter("w", "W"),
                new StudyDialog_StudyEditParameter("x", "X"),
                new StudyDialog_StudyEditParameter("y", "Y"),
                new StudyDialog_StudyEditParameter("z", "Z"),
                new StudyDialog_StudyEditParameter("tickMove", Language.getString("tick_move")),];
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyMpointer.newInstance = function(o) {
    return new StudyMpointer(o);
}
/** @static */
StudyMpointer.mnemonic = "Mpointer";
/** @static */
StudyMpointer.helpID = 2259;
/** @static */
StudyMpointer.ownOverlay = true;
/** @override */
StudyMpointer.prototype.setName = function() {
    this._name = Language.getString("study_mpointer") + " (W: " + this._x + " X: " + this._x + " Y: " + this._y + " Z: " + this._z + ")";
}
/** @override */
StudyMpointer.prototype.getParams = function() {
    return "w-" + this._w + ":x-" + this._x + ":y-" + this._y + ":z-" + this._z + ":tickMove-" + this._tickMove;
}
/** @override */
StudyMpointer.prototype.setParams = function(params) {
    let items = Utils.convertStringParams(params, ":", "-");

    if (items.has("w"))
        this._w = parseInt(items.get("w"), 10);
    if (items.has("x"))
        this._x = parseInt(items.get("x"), 10);
    if (items.has("y"))
        this._y = parseInt(items.get("y"), 10);
    if (items.has("z"))
        this._z = parseInt(items.get("z"), 10);
    if (items.has("tickMove"))
        this._tickMove = parseFloat(items.get("tickMove"));
    Study.prototype.setParams.call(this, params);
}
/** @override */
StudyMpointer.prototype.update = function(start, end) {
    let c = this._parent._chartCanvas._chart;
    if (this._tickMove === 0.0)
        return;
    // set up the reusable bollinger bandwidths
    this._bollingerWidthClose3 = MetaStudy.bollingerBandWidth(c, this._close, 3, 2);
    this._bollingerWidthClose22 = MetaStudy.bollingerBandWidth(c, this._close, 22, 2);
    this._shortRangeTm = MetaStudy.divideSeriesByValue(c, MetaStudy.subtractSeries(c, this._low, this._open), this._tickMove);
    this._longRangeTm = MetaStudy.divideSeriesByValue(c, MetaStudy.subtractSeries(c, this._high, this._open), this._tickMove);
    this._orlTest = MetaStudy.divideSeries(c, MetaStudy.multipleSeriesByValue(c, MetaStudy.SMA(c, this._shortRangeTm, 3), -1), MetaStudy.SMA(c, this._bollingerWidthClose3, 3));
    this._orsTest = MetaStudy.divideSeries(c, MetaStudy.SMA(c, this._longRangeTm, 3), MetaStudy.SMA(c, this._bollingerWidthClose3, 3));
    this._body = MetaStudy.absoluteValueSeries(c, MetaStudy.subtractSeries(c, this._close, this._open));
    this._myRange = MetaStudy.subtractSeries(c, this._high, this._low);
    this._trueRange = MetaStudy.subtractSeries(c, MetaStudy.maximum(c, this._high, MetaStudy.offsetSeries(c, this._close, 1)), MetaStudy.minimum(c, this._low, MetaStudy.offsetSeries(c, this._close, 1)));
    this._blast = MetaStudy.multipleSeriesByValue(c, MetaStudy.divideSeries(c, MetaStudy.SMA(c, MetaStudy.absoluteValueSeries(c, MetaStudy.subtractSeries(c, this._open, this._close)), 3), MetaStudy.SMA(c, this._myRange, 3)), 100);
    this._invBlast = MetaStudy.multipleSeriesByValue(c, MetaStudy.divideSeries(c, MetaStudy.SMA(c, MetaStudy.absoluteValueSeries(c, MetaStudy.subtractSeries(c, this._body, this._myRange)), 3), MetaStudy.SMA(c, this._trueRange, 3)), 100);
    this._misuratorTest = MetaStudy.integerPart(c,MetaStudy.divideSeries(c, MetaStudy.multiplySeries(c, MetaStudy.divideSeriesByValue(c, MetaStudy.SMA(c, this._myRange, 3), this._tickMove), MetaStudy.divideSeriesByValue(c, this._blast, 100)), MetaStudy.SMA(c, this._bollingerWidthClose3, 3)));
    this._orsTargetInv = MetaStudy.divideSeries(c, MetaStudy.divideSeries(c, MetaStudy.SMA(c, this._orsTest, 3), MetaStudy.SMA(c, MetaStudy.divideSeriesByValue(c, this._invBlast, 100), 3)), this._bollingerWidthClose22);
    this._orlTargetInv = MetaStudy.divideSeries(c, MetaStudy.divideSeries(c, MetaStudy.SMA(c, this._orlTest, 3), MetaStudy.SMA(c, MetaStudy.divideSeriesByValue(c, this._invBlast, 100), 3)), this._bollingerWidthClose22);
    // and calculate the final plotted values
    this._greenHisto = MetaStudy.multipleSeriesByValue(c, MetaStudy.absoluteValueSeries(c, MetaStudy.offsetSeries(c, this._orlTargetInv, 1)), this._x / 10);
    this._greenHistoLine = MetaStudy.multipleSeriesByValue(c, this._misuratorTest, this._y / 10);
    this._redHisto = MetaStudy.multipleSeriesByValue(c, MetaStudy.offsetSeries(c, this._orsTargetInv, 1), this._z / -10);
    this._redHistoLine = MetaStudy.multipleSeriesByValue(c, this._misuratorTest, this._w / -10);
}
/** @override */
StudyMpointer.prototype.draw = function() {
    this.updateY();
    if (this._greenHisto)
        this._parent.drawLineHistMid(this._greenHisto, Color.green, 0);
    if(this._greenHistoLine)
        this._parent.drawCandle(this._greenHistoLine, this._greenHistoLine, this._greenHistoLine, this._greenHistoLine, Color.black, Color.black, Color.black);
    if(this._redHisto)
        this._parent.drawLineHistMid(this._redHisto, Color.darkRed, 0);
    if(this._redHistoLine)
        this._parent.drawCandle(this._redHistoLine, this._redHistoLine, this._redHistoLine, this._redHistoLine, Color.black, Color.black, Color.black);
}
/** @override */
StudyMpointer.prototype.getMaxMin = function(i) {
    this._range.reset();
    this._range.getMaxMin(this._greenHisto, i);
    this._range.getMaxMin(this._greenHistoLine, i);
    this._range.getMaxMin(this._redHisto, i);
    this._range.getMaxMin(this._redHistoLine, i);
}
/** @override */
StudyMpointer.prototype.getRange = function() {
    return 22;
}