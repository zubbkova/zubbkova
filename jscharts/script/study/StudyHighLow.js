/* global Study, Series, Color, StudyDialog_StudyYesNoParameter, Language, Utils, TimeIterator */
/**
 * @constructor
 * @extends {Study}
 * @param {Overlay} o
 */
function StudyHighLow(o) {
    this._max = 0;
    this._min = 10000000;
    this._maxHigh = 0;
    this._minLow = 10000000;
    Study.call(this, o);
    this._use_closed_price = false;
    this._seriesA = new Series();
    this._seriesB = new Series();
    this.setName();
    this._legIndex = this.initLegend(Color.red);
    this._couple = true;
}
/**
 * Inheriting
 */
StudyHighLow.prototype = Object.create(Study.prototype);
StudyHighLow.prototype.constructor = StudyHighLow;
/** @static */
StudyHighLow.getItems = function() {
    return [new StudyDialog_StudyYesNoParameter("use_closed_price", Language.getString("Chart_toolbardialogs_use_closed_price"), false, 100)];
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyHighLow.newInstance = function(o) {
    return new StudyHighLow(o);
}
/** @static */
StudyHighLow.mnemonic = "HighLow";
/** @static */
StudyHighLow.helpID = 559;
/** @static */
StudyHighLow.ownOverlay = false;
/** @override */
StudyHighLow.prototype.setName = function() {
    this._name = Language.getString("study_highandlow")+" (" + Math.round(this._max * 1000.0) / 1000.0 + " " + Math.round(this._min * 1000.0) / 1000.0 + ")";
    this._couple = true;
}
/** @override */
StudyHighLow.prototype.setParams = function(params) {
    this._couple = true;
    var items = Utils.convertStringParams(params, ":", "-");
    if (items.hasOwnProperty("use_closed_price") && typeof items["use_closed_price"] !== "undefined")
        this._use_closed_price = items["use_closed_price"].toString() === "true";
    Study.prototype.setParams.call(this, params);
}
/** @override */
StudyHighLow.prototype.getParams = function() {
    return "use_closed_price-" + this._use_closed_price;
}
/** @override */
StudyHighLow.prototype.drawPrice = function() {
    this._parent.drawPrice(this._max, this._colour1);
    this._parent.drawPrice(this._min, this._colour2);
}/** @override */
StudyHighLow.prototype.draw = function() {
    this.updateY();
    var c = this._parent._chart;
    // start is first *visible* data point, not first in memory.
    // end is last *visible* data point, not first in memory.
    var end = c._parent._currentSymbol._timeEnd > this._source.timeEnd() ? this._source.timeEnd() : c._parent._currentSymbol._timeEnd;
    var start = c._parent._currentSymbol._timeStart < this._source.timeStart() ? this._source.timeStart() : c._parent._currentSymbol._timeStart;
    var curVal = 0;
    var minCurVal = 0;
    var maxCurVal = 0;
    var curDate; // the most extreme point while tracking (date)
    var i = TimeIterator.forwardRangeIterator(c.getMasterTimeList(), start, end);
    this._seriesA.clear();
    this._seriesB.clear();
    this._max = 0;
    this._min = 10000000;
    this._maxHigh = 0;
    this._minLow = 10000000;
    //get max and min
    do {
        curVal = this._close.get(i._d);
        if (this._min > curVal)
            this._min = curVal;
        if (this._max < curVal)
            this._max = curVal;
        minCurVal = this._low.get(i._d);
        if (this._minLow > minCurVal)
            this._minLow = minCurVal;
        maxCurVal = this._high.get(i._d);
        if (this._maxHigh < maxCurVal)
            this._maxHigh = maxCurVal;
    } while (i.move()); 
    if (!this._use_closed_price) {
        this._max = this._maxHigh;
        this._min = this._minLow;
    }
    //create lines
    i = TimeIterator.forwardRangeIterator(c.getMasterTimeList(), start, end);
    do {
        curDate = new Date(i._d.getTime());
        this._seriesA.append(curDate, this._max);
        this._seriesB.append(curDate, this._min);
    } while (i.move());
    if (this._parent._legend.getItem(this._legIndex)) {
        this._colour1 = this._parent._legend.getItem(this._legIndex)._colour1;
        this._colour2 = this._parent._legend.getItem(this._legIndex)._colour2;
    }
    this._parent.drawLineNormal(this._seriesA, this._colour1);
    this._parent.drawLineNormal(this._seriesB, this._colour2); 
    // refresh legend
    this.setName();
    if (this._parent._legend)
        this._parent._legend.renameItem(this._legIndex, this._name);
}