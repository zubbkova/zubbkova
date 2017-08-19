/**
 * @constructor
 * @extends {Study}
 * @param {Overlay} o
 */
function StudyTripleMA(o) {
    Study.call(this, o);
    this._period1 = 15;
    this._offset1 = 0;
    this._period2 = 45;
    this._offset2 = 0;
    this._period3 = 100;
    this._offset3 = 0;
    this._whichMA1 = 0;
    this._whichMA2 = 0;
    this._whichMA3 = 0;
    this._series1 = new Series();
    this._series2 = new Series();
    this._series3 = new Series();
    this._triple = true;
}
/**
 * Inheriting
 */
StudyTripleMA.prototype = Object.create(Study.prototype);
StudyTripleMA.prototype.constructor = StudyTripleMA;
/** @static */
StudyTripleMA.getItems = function() {
    return [new StudyDialog_StudyEditParameter("period1", Language.getString("toolbardialogs_period") + " 1"), 
            new StudyDialog_StudyEditParameter("offset1", Language.getString("toolbardialogs_offset") + " 1"), 
            new StudyDialog_StudyRadioParameter("whichMA1", [Language.getString("toolbardialogs_sma"), Language.getString("toolbardialogs_ema")]), 
            new StudyDialog_StudyEditParameter("period2", Language.getString("toolbardialogs_period") + " 2"), 
            new StudyDialog_StudyEditParameter("offset2", Language.getString("toolbardialogs_offset") + " 2"), 
            new StudyDialog_StudyRadioParameter("whichMA2", [Language.getString("toolbardialogs_sma"), Language.getString("toolbardialogs_ema")]), 
            new StudyDialog_StudyEditParameter("period3", Language.getString("toolbardialogs_period") + " 3"), 
            new StudyDialog_StudyEditParameter("offset3", Language.getString("toolbardialogs_offset") + " 3"), 
            new StudyDialog_StudyRadioParameter("whichMA3", [Language.getString("toolbardialogs_sma"), Language.getString("toolbardialogs_ema")])];
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyTripleMA.newInstance = function(o) {
    return new StudyTripleMA(o);
}
/** @static */
StudyTripleMA.mnemonic = "TripleMA";
/** @static */
StudyTripleMA.helpID = 548;
/** @static */
StudyTripleMA.ownOverlay = false;
/** @override */
StudyTripleMA.prototype.setName = function() {
    this._name = Language.getString("study_triplemovingaverage") + " (" + this._period1 + "," + this._offset1 + "," + ( this._whichMA1 === 0 ? "SMA" : "EMA") + "),(" + this._period2 + "," + this._offset2 + "," + (this._whichMA2 === 0 ? "SMA" : "EMA") + "),(" + this._period3 + "," + this._offset3 + "," + (this._whichMA3 == 0 ? "SMA" : "EMA") + ")";
    this._triple = true;
}
/** @override */
StudyTripleMA.prototype.getParams = function() {
    return "period1-" + this._period1+ ":offset1-" + this._offset1 + 
			":period2-" + this._period2+ ":offset2-" + this._offset2 + 
			":period3-" + this._period3+ ":offset3-" + this._offset1 +
			":whichMA1-" + this._whichMA1 + ":whichMA2-" + this._whichMA2 + ":whichMA3-" + this._whichMA3;
}
/** @override */
StudyTripleMA.prototype.setParams = function(params) {
    let items = Utils.convertStringParams(params, ":", "-");
    if (items.has("period1"))
        this._period1 = parseInt(items.get("period1"), 10);
    if (items.has("offset1"))
        this._offset1 = parseInt(items.get("offset1"), 10);
    if (items.has("period2"))
        this._period2 = parseInt(items.get("period2"), 10);
    if (items.has("offset2"))
        this._offset2 = parseInt(items.get("offset2"), 10);
    if (items.has("period3"))
        this._period3 = parseInt(items.get("period3"), 10);
    if (items.has("offset3"))
        this._offset3 = parseInt(items.get("offset3"), 10);
    if (items.has("whichMA1"))
        this._whichMA1 = parseInt(items.get("whichMA1"), 10);
    if (items.has("whichMA2"))
        this._whichMA2 = parseInt(items.get("whichMA2"), 10);
    if (items.has("whichMA3"))
        this._whichMA3 = parseInt(items.get("whichMA3"), 10);
    Study.prototype.setParams.call(this, params);
}
/** @override */
StudyTripleMA.prototype.update = function(start, end) {
    let c = this._parent._chartCanvas._chart;
    this._series1 = (this._whichMA1 === 0 ? MetaStudy.SMA(c, this._source, this._period1, this._offset1) : MetaStudy.EMA(c, this._source, this._period1, this._offset1));
    this._series2 = (this._whichMA2 === 0 ? MetaStudy.SMA(c, this._source, this._period2, this._offset2) : MetaStudy.EMA(c, this._source, this._period2, this._offset2));
    this._series3 = (this._whichMA3 === 0 ? MetaStudy.SMA(c, this._source, this._period3, this._offset3) : MetaStudy.EMA(c, this._source, this._period3, this._offset3));
}
/** @override */
StudyTripleMA.prototype.draw = function() {
    this.updateY();
    this._parent.drawLineNormal(this._series1, this._colour1);
    this._parent.drawPrice(this._series1.get(this._parent._chartCanvas._chart._currentSymbol._timeEnd), this._colour1);
    this._parent.drawLineNormal(this._series2, this._colour2);
    this._parent.drawPrice(this._series2.get(this._parent._chartCanvas._chart._currentSymbol._timeEnd), this._colour2);
    this._parent.drawLineNormal(this._series3, this._colour3);
    this._parent.drawPrice(this._series3.get(this._parent._chartCanvas._chart._currentSymbol._timeEnd), this._colour3);
}
/** @override */
StudyTripleMA.prototype.getRange = function() {
    return Math.max(this._period1, Math.max(this._period2, this._period3));
}
/** @override */
StudyTripleMA.prototype.getMaxMin = function(i) {
    this._range.reset();
    this._range.getMaxMin(this._series1, i);
    this._range.getMaxMin(this._series2, i);
    this._range.getMaxMin(this._series3, i);
}
/** @override */
StudyTripleMA.prototype.getColumnNames = function() {
    return [this._name, "", ""];
}
/** @override */
StudyTripleMA.prototype.getColumnValues = function(d) {
    return [this.d(this._series1.get(d)), this.d(this._series2.get(d)), this.d(this._series3.get(d))];
}