/* global Study, Series,, Language, Utils, TimeIterator, StudyDialog_StudyEditParameter, Color */
/**
 * @constructor
 * @extends {Study}
 * @param {Overlay} o
 */
function StudyUltimate(o) {
    Study.call(this, o);
    this._fast = 7;
    this._medium = 14;
    this._slow = 28;
    this._series = new Series();
}
/**
 * Inheriting
 */
StudyUltimate.prototype = Object.create(Study.prototype);
StudyUltimate.prototype.constructor = StudyUltimate;
/** @static */
StudyUltimate.getItems = function() {
    return [new StudyDialog_StudyEditParameter("slow", Language.getString("toolbardialogs_slow_period")),
                new StudyDialog_StudyEditParameter("medium", Language.getString("toolbardialogs_medium_period")),
                new StudyDialog_StudyEditParameter("fast", Language.getString("toolbardialogs_fast_period"))];
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyUltimate.newInstance = function(o) {
    return new StudyUltimate(o);
}
/** @static */
StudyUltimate.mnemonic = "Ultimate";
/** @static */
StudyUltimate.helpID = 455;
/** @static */
StudyUltimate.ownOverlay = true;
/** @override */
StudyUltimate.prototype.setName = function() {
    this._name = Language.getString("study_ultimateoscillator") + " (" + this._fast + "," + this._medium + "," + this._slow + ")";
}
/** @override */
StudyUltimate.prototype.getParams = function() {
    return "fast-" + this._fast + ":medium-" + this._medium + ":slow-" + this._slow;
}
/** @override */
StudyUltimate.prototype.setParams = function(params) {
    var items = Utils.convertStringParams(params, ":", "-");
    if (items.hasOwnProperty("fast") && typeof items["fast"] !== "undefined")
        this._fast = parseInt(items["fast"], 10);
    if (items.hasOwnProperty("medium") && typeof items["medium"] !== "undefined")
        this._medium = parseInt(items["medium"], 10);
    if (items.hasOwnProperty("slow") && typeof items["slow"] !== "undefined")
        this._slow = parseInt(items["slow"], 10);
    Study.prototype.setParams.call(this, params);
}
/** @override */
StudyUltimate.prototype.update = function(start, end) {
    this._series.clear(); // clear output
    var i = TimeIterator.forwardRangeIterator(this._parent._chart.getMasterTimeList(), start, end);
    var buf_bp = new Array(this._slow);
    buf_bp.fillArrayWithValue(0.0);
    var buf_tr = new Array(this._slow);
    buf_tr.fillArrayWithValue(0.0);
    var buf_ptr = 0;
    var n = 0;
    var lastclose = 0.0; // Mark last close as not useable
    do {
        var d = i._d;
        var closeVal = this._close.get(d);
        var highVal = this._high.get(d);
        var lowVal = this._low.get(d);
        var tl = lowVal;
        if (lastclose != 0 && lastclose < lowVal) {
            tl = lastclose;
        }
        var bp = closeVal - tl;
        var tr = highVal - tl;
        if (lastclose - lowVal > tr) {
            tr = lastclose - lowVal;
        }
        buf_bp[buf_ptr] = bp;
        buf_tr[buf_ptr] = tr;
        var bpsum1 = 0.0, bpsum2 = 0.0, bpsum3 = 0.0, trsum1 = 0.0, trsum2 = 0.0, trsum3 = 0.0;
        var ptr = buf_ptr;
        var len = this._slow;
        if (len > n) {
            len = n;
        }
        var k = 0;
        for (k = 0; k <= len; k++) {
            bpsum3 += buf_bp[ptr];
            trsum3 += buf_tr[ptr];
            if (k < this._medium) {
                bpsum2 += buf_bp[ptr];
                trsum2 += buf_tr[ptr];
                if (k < this._fast) {
                    bpsum1 += buf_bp[ptr];
                    trsum1 += buf_tr[ptr];
                }
            }
            ptr--;
            if (ptr < 0) {
                ptr = this._slow - 1;
            }
        }
        var ult = 100 * (4.0 * (bpsum1 / trsum1) + 2 * (bpsum2 / trsum2) + (bpsum3 / trsum3)) / 7.0;
        this._series.append(this._parent._chart.timeAdjust(d, 0), ult);
        n++;
        buf_ptr++;
        if (buf_ptr >= this._slow) {
            buf_ptr = 0;
        }
        lastclose = closeVal;
    } while (i.move());
}
/** @override */
StudyUltimate.prototype.draw = function() {
    this.updateY();
    this._parent.drawLineNormal(this._series, this._colour);
    this._parent._chartCanvas.setStrokeColor(Color.gray);
    var y = parseInt(this._parent.getY(70.0), 10);
    var xbeg = this._parent._chartCanvas._topLineStartX;
    var xend = this._parent._chartCanvas._topLineEndX
    this._parent._chartCanvas.drawLineWithAdjust(xbeg, y, xend, y);
    y = parseInt(this._parent.getY(30.0), 10);
    this._parent._chartCanvas.drawLineWithAdjust(xbeg, y, xend, y);
    this._parent._chartCanvas.setStrokeColor(Color.lightGray);
    y = parseInt(this._parent.getY(50.0), 10);
    this._parent._chartCanvas.drawLineWithAdjust(xbeg, y, xend, y);
}