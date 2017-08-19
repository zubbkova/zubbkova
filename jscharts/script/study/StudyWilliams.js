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
    let items = Utils.convertStringParams(params, ":", "-");
    if (items.has("period"))
        this._period = parseInt(items.get("period"), 10);
    if (items.has("offset"))
        this._offset = parseInt(items.get("offset"), 10);
    Study.prototype.setParams.call(this, params);
}
/** @override */
StudyWilliams.prototype.update = function(start, end) {
    this._series.clear(); // clear output
    let i = TimeIterator.forwardRangeIterator(this._parent._chartCanvas._chart.getMasterTimeList(), start, end);
    let buf_size = i._count;
    if (buf_size === 0) {
        return;
    }
    let buf_closes = new Array(buf_size);
    buf_closes.fill(0);
    let buf_lows = new Array(buf_size);
    buf_lows.fill(0);
    let buf_highs = new Array(buf_size);
    buf_highs.fill(0);
    let n = 0;
    while(i.move()) {
        let curDate = i._d;
        buf_closes[n] = this._close.get(curDate);
        buf_lows[n] = this._low.get(curDate);
        buf_highs[n] = this._high.get(curDate);
        let beg = n - this._period + 1;
        if (beg < 0) {
            beg = 0;
        }
        let highVal = -10000000000.0;
        let lowVal = 1000000000.0; //
        for (let k = beg; k <= n; k++) {
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
        let out = -50.0;
        if (highVal > lowVal) {
            out = -100.0 * ((highVal - buf_closes[n]) / (highVal - lowVal));
            this._series.append(this._parent._chartCanvas._chart.timeAdjust(curDate, -this._offset), out);
        }    
        n++;
    }
}
/** @override */
StudyWilliams.prototype.draw = function() {
    this.updateY();
    this._parent.drawLineNormal(this._series, this._colour);
    this._parent._chartCanvas.setStrokeColor(Color.darkGray);
    let y = parseInt(this._parent.getY(-90.0), 10);
    this._parent._chartCanvas.drawLineWithAdjust(this._parent._chartCanvas._topLineStartX, y, this._parent._chartCanvas._topLineEndX, y);
    y = parseInt(this._parent.getY(-10.0), 10);
    this._parent._chartCanvas.drawLineWithAdjust(this._parent._chartCanvas._topLineStartX, y, this._parent._chartCanvas._topLineEndX, y);
}