/**
 * @constructor
 * @extends {Study}
 * @param {Overlay} o
 */
function StudyChaikin(o) {
    Study.call(this, o);
    this._slowperiod = 10;
    this._ema = true;
    this._series = new Series();
    this._fastperiod = 3;
}
/**
 * Inheriting
 */
StudyChaikin.prototype = Object.create(Study.prototype);
StudyChaikin.prototype.constructor = StudyChaikin;
/** @static */
StudyChaikin.getItems = function() {
    return [new StudyDialog_StudyEditParameter("fast", Language.getString("toolbardialogs_fast_period")),
                new StudyDialog_StudyEditParameter("slow", Language.getString("toolbardialogs_slow_period")),
                new StudyDialog_StudyYesNoParameter("ema", Language.getString("toolbardialogs_use_ema"))];
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyChaikin.newInstance = function(o) {
    return new StudyChaikin(o);
}
/** @static */
StudyChaikin.mnemonic = "Chaikin";
/** @static */
StudyChaikin.helpID = 430;
/** @static */
StudyChaikin.ownOverlay = true;
/** @override */
StudyChaikin.prototype.setName = function() {
    this._name = Language.getString("study_chaikinoscillator") + " (" + this._fastperiod + "," + this._slowperiod + ")";
}
/** @override */
StudyChaikin.prototype.getParams = function() {
    return "fast-" + this._fastperiod + ":slow-" + this._slowperiod + ":ema-" + this._ema;
}
/** @override */
StudyChaikin.prototype.setParams = function(params) {
    let items = Utils.convertStringParams(params, ":", "-");
    if (items.has("fast"))
        this._fastperiod = parseInt(items.get("fast"), 10);
    if (items.has("slow"))
        this._slowperiod = parseInt(items.get("slow"), 10);
    if (items.has("ema"))
        this._ema = items.get("ema").toString() === "true";
    Study.prototype.setParams.call(this, params);
}
/** @override */
StudyChaikin.prototype.update = function(start, end) {
    this._series.clear();
    let i = TimeIterator.forwardRangeIterator(this._parent._chartCanvas._chart.getMasterTimeList(), start, end);
    let buf_ptr = 0;
    let n = 0;
    let buf = new Array(this._slowperiod);
    buf.fill(0.0);
    let totalfast = 0.0;
    let totalslow = 0.0;
    let fastper = 2.0 * (this._fastperiod + 1);
    let slowper = 2.0 * (this._slowperiod + 1);
    let fastfrac = 1.0 / fastper;
    let slowfrac = 1.0 / slowper;
    let omfastfrac = 1.0 - fastfrac;
    let omslowfrac = 1.0 - slowfrac;
    let fastema = 0.0;
    let slowema = 0.0;
    do {
        let d = i._d;
        let volVal = this._vol.get(d);
        let highVal = this._high.get(d);
        let lowVal = this._low.get(d);
        let openVal = this._open.get(d);
        let closeVal = this._close.get(d);
        let accdist = volVal * (closeVal - openVal) * (highVal - lowVal);
        if (this._ema && n > this._slowperiod) {
            fastema = fastema * omfastfrac + accdist * fastfrac;
            slowema = slowema * omslowfrac + accdist * slowfrac;
            let osc = fastema - slowema;
            this._series.append(d, osc);
        } else {
            totalfast += accdist;
            totalslow += accdist;
            buf[buf_ptr++] = accdist;
            if (buf_ptr >= this._slowperiod)
                buf_ptr = 0;
            let lens = this._slowperiod;
            let lenf = this._fastperiod;
            if (n >= this._slowperiod) {
                totalslow -= buf[buf_ptr];
            } else {
                lens = n + 1;
            }
            if (n >= this._fastperiod) {
                let buf_temp = buf_ptr - this._fastperiod;
                if (buf_temp < 0) {
                    buf_temp += this._slowperiod;
                }
                totalfast -= buf[buf_temp];
            } else {
                lenf = n + 1;
            }
            fastema = totalfast / lenf;
            slowema = totalslow / lens;
            let osc = fastema - slowema;
            this._series.append(d, osc);
        }
        n++;
    } while (i.move());
}