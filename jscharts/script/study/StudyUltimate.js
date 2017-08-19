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
    let items = Utils.convertStringParams(params, ":", "-");
    if (items.has("fast"))
        this._fast = parseInt(items.get("fast"), 10);
    if (items.has("medium"))
        this._medium = parseInt(items.get("medium"), 10);
    if (items.has("slow"))
        this._slow = parseInt(items.get("slow"), 10);
    Study.prototype.setParams.call(this, params);
}
/** @override */
StudyUltimate.prototype.update = function(start, end) {
    this._series.clear(); // clear output
    let i = TimeIterator.forwardRangeIterator(this._parent._chartCanvas._chart.getMasterTimeList(), start, end);
    let buf_bp = new Array(this._slow);
    buf_bp.fill(0.0);
    let buf_tr = new Array(this._slow);
    buf_tr.fill(0.0);
    let buf_ptr = 0;
    let n = 0;
    let lastclose = 0.0; // Mark last close as not useable
    do {
        let d = i._d;
        let closeVal = this._close.get(d);
        let highVal = this._high.get(d);
        let lowVal = this._low.get(d);
        let tl = lowVal;
        if (lastclose != 0 && lastclose < lowVal) {
            tl = lastclose;
        }
        let bp = closeVal - tl;
        let tr = highVal - tl;
        if (lastclose - lowVal > tr) {
            tr = lastclose - lowVal;
        }
        buf_bp[buf_ptr] = bp;
        buf_tr[buf_ptr] = tr;
        let bpsum1 = 0.0, bpsum2 = 0.0, bpsum3 = 0.0, trsum1 = 0.0, trsum2 = 0.0, trsum3 = 0.0;
        let ptr = buf_ptr;
        let len = this._slow;
        if (len > n) {
            len = n;
        }
        let k = 0;
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
        let ult = 100 * (4.0 * (bpsum1 / trsum1) + 2 * (bpsum2 / trsum2) + (bpsum3 / trsum3)) / 7.0;
        this._series.append(this._parent._chartCanvas._chart.timeAdjust(d, 0), ult);
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
    let y = parseInt(this._parent.getY(70.0), 10);
    let xbeg = this._parent._chartCanvas._topLineStartX;
    let xend = this._parent._chartCanvas._topLineEndX
    this._parent._chartCanvas.drawLineWithAdjust(xbeg, y, xend, y);
    y = parseInt(this._parent.getY(30.0), 10);
    this._parent._chartCanvas.drawLineWithAdjust(xbeg, y, xend, y);
    this._parent._chartCanvas.setStrokeColor(Color.lightGray);
    y = parseInt(this._parent.getY(50.0), 10);
    this._parent._chartCanvas.drawLineWithAdjust(xbeg, y, xend, y);
}