/**
 * @constructor
 * @extends {Study}
 * @param {Overlay} o
 */
function StudyAroon(o) {
    this._period = 14;
    this._showOSC = true;
    this._showUP = true;
    this._showDOWN = true;
    this._osc = new Series();
    this._up = new Series();
    this._down = new Series();
    this._series = this._osc;
    Study.call(this, o);
}
/**
 * Inheriting
 */
StudyAroon.prototype = Object.create(Study.prototype);
StudyAroon.prototype.constructor = StudyAroon;
/** @static */
StudyAroon.getItems = function() {
    return [new StudyDialog_StudyEditParameter("period", Language.getString("toolbardialogs_period")),
                new StudyDialog_StudyYesNoParameter("showOSC", Language.getString("toolbardialogs_show_osc")),
                new StudyDialog_StudyYesNoParameter("showUP", Language.getString("toolbardialogs_show_up")),
                new StudyDialog_StudyYesNoParameter("showDOWN", Language.getString("toolbardialogs_show_down"))];
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyAroon.newInstance = function(o) {
    return new StudyAroon(o);
}
/** @static */
StudyAroon.mnemonic = "Aroon";
/** @static */
StudyAroon.helpID = 457;
/** @static */
StudyAroon.ownOverlay = true;
/** @override */
StudyAroon.prototype.setName = function() {
    this._name = Language.getString("study_aroon") + " (" + this._period;
    if (this._showOSC)
        this._name += ",OSC";
    if (this._showUP)
        this._name += ",UP";
    if (this._showDOWN)
        this._name += ",DOWN";
    this._name += ")";
}
/** @override */
StudyAroon.prototype.getParams = function() {
    return "period-" + this._period + ":showOSC-" + this._showOSC + ":showUP-" + this._showUP + ":showDOWN-" + this._showDOWN;
}
/** @override */
StudyAroon.prototype.setParams = function(params) {
    let items = Utils.convertStringParams(params, ":", "-");
    if (items.has("period"))
        this._period = parseInt(items.get("period"), 10);
    if (items.has("showOSC"))
        this._showOSC = items.get("showOSC").toString() === "true";
    if (items.has("showUP"))
        this._showUP = items.get("showUP").toString() === "true";
    if (items.has("showDOWN"))
        this._showDOWN = items.get("showDOWN").toString() === "true";
    Study.prototype.setParams.call(this, params);
}
/** @override */
StudyAroon.prototype.update = function(start, end) {
    this._osc.clear();
    this._up.clear();
    this._down.clear(); // clear output
    let i = TimeIterator.forwardRangeIterator(this._parent._chartCanvas._chart.getMasterTimeList(), start, end);
    let buf_ptr = 0;
    let n = 0;
    let n_at_low = 0;
    let n_at_high = 0;
    let lowest = 10000000.0;
    let highest = 0.0;
    let buf_close = new Array(this._period);
    buf_close.fill(0);
    do {
        let d = i._d;
        let close = this._source.get(d);
        if (close > highest) {
            highest = close;
            n_at_high = n;
        }
        if (close < lowest) {
            lowest = close;
            n_at_low = n;
        }
        buf_close[buf_ptr] = close;
        if (n - n_at_high >= this._period || n - n_at_low >= this._period) {
            //    The stored high/low is outside of the period
            //        so recompute the extrema from the buffer
            lowest = 1000000.0;
            highest = 0.0;
            let ptr_bck = buf_ptr;
            for (let k = n; k > n - this._period; k--) {
                if (k < 0) {
                    break;
                }
                let close1 = buf_close[ptr_bck--];
                if (ptr_bck < 0) {
                    ptr_bck = this._period - 1;
                }
                if (close1 > highest) {
                    highest = close1;
                    n_at_high = k;
                }
                if (close1 < lowest) {
                    lowest = close1;
                    n_at_low = k;
                }
            }
        }
        let highback = n - n_at_high;
        let lowback = n - n_at_low;
        let a_up = (100.0 * (this._period - highback)) / this._period;
        let a_down = (100.0 * (this._period - lowback)) / this._period;
        this._up.append(d, a_up);
        this._down.append(d, a_down);
        this._osc.append(d, a_up - a_down);
        n++;
        buf_ptr++;
        if (buf_ptr >= this._period) {
            buf_ptr = 0;
        }
    } while (i.move());
}
/** @override */
StudyAroon.prototype.getMaxMin = function(i) {
    this._range.reset();
    this._range.getMaxMin(this._osc, i);
    this._range.getMaxMin(this._up, i);
    this._range.getMaxMin(this._down, i);
}
/** @override */
StudyAroon.prototype.draw = function() {
    this.updateY();
    let y = parseInt(this._parent.getY(70.0), 10);
    let xbeg = this._parent._chartCanvas._topLineStartX;
    let xend = this._parent._chartCanvas._topLineEndX;
    this._parent._chartCanvas.setStrokeColor(new Color(0, 153, 153));
    this._parent._chartCanvas.drawLineWithAdjust(xbeg, y, xend, y);
    y = parseInt(this._parent.getY(30.0), 10);
    this._parent._chartCanvas.drawLineWithAdjust(xbeg, y, xend, y);
    y = parseInt(this._parent.getY(50.0), 10);
    this._parent._chartCanvas.drawLineWithAdjust(xbeg, y, xend, y);
    if (this._showOSC)
        this._parent.drawLineNormal(this._osc, Color.black);
    if (this._showDOWN)
        this._parent.drawLineNormal(this._down, Color.red);
    if (this._showUP)
        this._parent.drawLineNormal(this._up, Color.brightGreen);
}
/** @override */
StudyAroon.prototype.getColumnNames = function() {
    return [this._name, "Down", "Up"];
}
/** @override */
StudyAroon.prototype.getColumnValues = function(d) {
    return [this.d(this._osc.get(d)), this.d(this._down.get(d)), this.d(this._up.get(d))];
}