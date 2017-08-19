/**
 * @constructor
 * @extends {Study}
 * @param {Overlay} o
 */
function StudySto(o) {
    this._k = new Series();
    this._kslow = new Series();
    this._d = new Series();
    this._series = this._d;
    Study.call(this, o);
    this._kperiod = 14;
    this._dperiod = 3;
    this._isfast = true;
    // new variable to alter the MA applied to %K to allow full stochastics instead of just slow
    this._kmaperiod = 3;
}
/**
 * Inheriting
 */
StudySto.prototype = Object.create(Study.prototype);
StudySto.prototype.constructor = StudySto;
/** @static */
StudySto.getItems = function() {
    return [new StudyDialog_StudyEditParameter("kperiod", Language.getString("toolbardialogs_k_period")),
                new StudyDialog_StudyEditParameter("dperiod", Language.getString("toolbardialogs_d_period")),
                new StudyDialog_StudyYesNoParameter("isfast", Language.getString("toolbardialogs_fast"), true),
                new StudyDialog_StudyEditParameter("kmaperiod", Language.getString("toolbardialogs_k_ma_period"))];
}
/** 
 * @static
 * @param {Overlay} o
 */
StudySto.newInstance = function(o) {
    return new StudySto(o);
}
/** @static */
StudySto.mnemonic = "Sto";
/** @static */
StudySto.helpID = 451;
/** @static */
StudySto.ownOverlay = true;
/** @override */
StudySto.prototype.setName = function() {
    if (this._isfast)
        this._name = Language.getString("study_faststochastic");
    else
        this._name = Language.getString("study_slowstochastic");
    this._name += " (" + this._kperiod + "," + this._dperiod + "," + this._kmaperiod + ")";
}
/** @override */
StudySto.prototype.getParams = function() {
    return "kperiod-" + this._kperiod + ":dperiod-" + this._dperiod + ":isfast-" + (this._isfast ? "1" : "0") + ":kmaperiod-" + this._kmaperiod;
}
/** @override */
StudySto.prototype.setParams = function(params) {
    let items = Utils.convertStringParams(params, ":", "-");
    if (items.has("kperiod"))
        this._kperiod = parseInt(items.get("kperiod"), 10);
    if (items.has("dperiod"))
        this._dperiod = parseInt(items.get("dperiod"), 10);
    if (items.has("isfast"))
        this._isfast = items.get("isfast").toString() === "1";
    if (items.has("kmaperiod"))
        this._kmaperiod = parseInt(items.get("kmaperiod"), 10);
    Study.prototype.setParams.call(this, params);
}
/** @override */
StudySto.prototype.update = function(start, end) {
    let highVal = 0.0, lowVal = 999999.99, total = 0.0, kstotal = 0.0, ck = 0.0;
    let n = 0, kpos = 0, dpos = 0, kspos = 0;
    let kbuffer = new Array(this._kperiod);
    kbuffer.fill(0.0);
    let dbuffer = new Array(this._dperiod);
    dbuffer.fill(0.0);
    let ksbuffer = new Array(this._kmaperiod);
    ksbuffer.fill(0.0);
    this._k.clear();
    this._kslow.clear();
    this._d.clear();
    let i = TimeIterator.forwardRangeIterator(this._parent._chartCanvas._chart.getMasterTimeList(), start, end);
    for (; n < this._kperiod; i.move()) {
        let current = this._source.get(i._d);
        // Calculate Highs and lows
        kbuffer[n++] = current;
        if (current > highVal)
            highVal = current;
        if (current < lowVal)
            lowVal = current;
    }
    do {
        let current = this._source.get(i._d);
        kbuffer[kpos++] = current;
        // Calculate new highs and lows.
        if (current > highVal)
            highVal = current;
        else if (current < lowVal)
            lowVal = current;
        else {
            highVal = 0.0;
            lowVal = 99999.99;
            for (n = 0; n < this._kperiod; n++) {
                if (kbuffer[n] > highVal)
                    highVal = kbuffer[n];
                if (kbuffer[n] < lowVal)
                    lowVal = kbuffer[n];
            }
        }
        if (kpos === this._kperiod)
            kpos = 0;
        if (highVal !== lowVal)
            ck = 100.0 * (current - lowVal) / (highVal - lowVal);
        else
            ck = 0.0;
        this._k.append(i._d, ck);
        // slow/full stochastics take a moving average of K(fast)
        if (!this._isfast) {
            kstotal -= ksbuffer[kspos];
            kstotal += ck;
            ksbuffer[kspos++] = ck;
            ck = kstotal / this._kmaperiod;
            this._kslow.append(i._d, ck);
            if (kspos === this._kmaperiod)
                kspos = 0;
        }
        total -= dbuffer[dpos];
        total += ck;
        dbuffer[dpos++] = ck;
        this._d.append(i._d, total / this._dperiod);
        if (dpos === this._dperiod)
            dpos = 0;
    } while (i.move());
}
/** @override */
StudySto.prototype.getMaxMin = function(i) {
    this._range.reset();
    this._range.getMaxMin(this._d, i);
    if (this._isfast) {
        this._range.getMaxMin(this._k, i);
    } else {
        this._range.getMaxMin(this._kslow, i);
    }
}
/** @override */
StudySto.prototype.draw = function() {
    this.updateY();
    this._parent.drawLineNormal(this._isfast ? this._k : this._kslow, Color.blue);
    this._parent.drawLineNormal(this._d, Color.red);
}
/** @override */
StudySto.prototype.getRange = function() {
    return Math.max(this._kperiod, this._dperiod);
}
/** @override */
StudySto.prototype.getColumnValues = function(d) {
    let s = this._isfast ? this._k : this._kslow;
    return [this.d(s.get(d))];
}