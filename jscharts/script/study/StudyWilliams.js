/* global Study, Series, Language, Utils, TimeIterator, StudyDialog_StudyEditParameter, Color */
/**
 * @constructor
 * @extends {Study}
 * @param {Overlay} o
 */
function StudyWilliams(o) {
    Study.call(this, o);
    this._period = 10;
    this._offset = 0;
    this._series = new Series();
}
/**
 * Inheriting
 */
StudyWilliams.prototype = Object.create(Study.prototype);
StudyWilliams.prototype.constructor = StudyWilliams;
/** @static */
StudyWilliams.getItems = function() {
    return [new StudyDialog_StudyEditParameter("period", Language.getString("toolbardialogs_period")),
                new StudyDialog_StudyEditParameter("offset", Language.getString("toolbardialogs_offset"))];
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyWilliams.newInstance = function(o) {
    return new StudyWilliams(o);
}
/** @static */
StudyWilliams.mnemonic = "Williams";
/** @static */
StudyWilliams.helpID = 453;
/** @static */
StudyWilliams.ownOverlay = true;
/** @override */
StudyWilliams.prototype.setName = function() {
    this._name = Language.getString("study_williams_r") + " (" + this._period + "," + this._offset + ")";
}
/** @override */
StudyWilliams.prototype.getParams = function() {
    return "period-" + this._period + ":offset-" + this._offset;
}
/** @override */
StudyWilliams.prototype.setParams = function(params) {
    var items = Utils.convertStringParams(params, ":", "-");
    if (items.hasOwnProperty("period") && typeof items["period"] !== "undefined")
        this._period = parseInt(items["period"], 10);
    if (items.hasOwnProperty("offset") && typeof items["offset"] !== "undefined")
        this._offset = parseInt(items["offset"], 10);
    Study.prototype.setParams.call(this, params);
}
/** @override */
StudyWilliams.prototype.update = function(start, end) {
    this._series.clear(); // clear output
    var i = TimeIterator.forwardRangeIterator(this._parent._chart.getMasterTimeList(), start, end);
    var buf_size = i._count;
    if (buf_size === 0) {
        return;
    }
    var buf_closes = new Array(buf_size);
    buf_closes.fillArrayWithValue(0);
    var buf_lows = new Array(buf_size);
    buf_lows.fillArrayWithValue(0);
    var buf_highs = new Array(buf_size);
    buf_highs.fillArrayWithValue(0);
    var n = 0;
    while(i.move()) {
        var curDate = i._d;
        buf_closes[n] = this._close.get(curDate);
        buf_lows[n] = this._low.get(curDate);
        buf_highs[n] = this._high.get(curDate);
        var beg = n - this._period + 1;
        if (beg < 0) {
            beg = 0;
        }
        var highVal = -10000000000.0;
        var lowVal = 1000000000.0; //
        for (var k = beg; k <= n; k++) {
            if (buf_lows[k] < lowVal) {
                lowVal = buf_lows[k];
            }
            if (buf_closes[k] < lowVal) {
                lowVal = buf_closes[k];
            }
            if (buf_closes[k] > highVal) {
                highVal = buf_closes[k];
            }
            if (buf_highs[k] > highVal) {
                highVal = buf_highs[k];
            }
        }
        var out = -50.0;
        if (highVal > lowVal) {
            out = -100.0 * ((highVal - buf_closes[n]) / (highVal - lowVal));
            this._series.append(this._parent._chart.timeAdjust(curDate, -this._offset), out);
        }    
        n++;
    }
}
/** @override */
StudyWilliams.prototype.draw = function() {
    this.updateY();
    this._parent.drawLineNormal(this._series, this._colour);
    this._parent._chartCanvas.setStrokeColor(Color.darkGray);
    var y = parseInt(this._parent.getY(-90.0), 10);
    this._parent._chartCanvas.drawLineWithAdjust(this._parent._chartCanvas._topLineStartX, y, this._parent._chartCanvas._topLineEndX, y);
    y = parseInt(this._parent.getY(-10.0), 10);
    this._parent._chartCanvas.drawLineWithAdjust(this._parent._chartCanvas._topLineStartX, y, this._parent._chartCanvas._topLineEndX, y);
}