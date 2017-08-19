/**
 * @constructor
 * @extends {Study}
 * @param {Overlay} o
 */
function StudyVOsc(o) {
    Study.call(this, o);
    this._fastperiod = 5;
    this._slowperiod = 10;
    this._ema = true;
    this._series = new Series();
}
/**
 * Inheriting
 */
StudyVOsc.prototype = Object.create(Study.prototype);
StudyVOsc.prototype.constructor = StudyVOsc;
/** @static */
StudyVOsc.getItems = function() {
    return [new StudyDialog_StudyEditParameter("fast", Language.getString("toolbardialogs_fast_period")),
                new StudyDialog_StudyEditParameter("slow", Language.getString("toolbardialogs_slow_period")),
                new StudyDialog_StudyYesNoParameter("ema", Language.getString("toolbardialogs_use_ema"))];
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyVOsc.newInstance = function(o) {
    return new StudyVOsc(o);
}
/** @static */
StudyVOsc.mnemonic = "VOsc";
/** @static */
StudyVOsc.helpID = 470;
/** @static */
StudyVOsc.ownOverlay = true;
/** @override */
StudyVOsc.prototype.setName = function() {
    this._name = Language.getString("study_volumeoscillator") + " " + (this._ema ? Language.getString("study_ema") + " " : "") + "(" + this._fastperiod + "," + this._slowperiod + ")";
}
/** @override */
StudyVOsc.prototype.getParams = function() {
    return "fast-" + this._fastperiod + ":slow-" + this._slowperiod + ":ema-" + this._ema;
}
/** @override */
StudyVOsc.prototype.setParams = function(params) {
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
StudyVOsc.prototype.update = function(start, end) {
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
        let vol = this._source.get(d);
        if (this._ema && n >= this._slowperiod) {
            fastema = fastema*omfastfrac + vol*fastfrac;          	
            slowema = slowema*omslowfrac + vol*slowfrac;
            let osc = 100.0*(fastema - slowema)/fastema;
            this._series.append(d, osc);
        } else {
            totalfast += vol;
            totalslow += vol;
            buf[buf_ptr++] = vol;
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
            fastema = totalfast/lenf;
            slowema = totalslow /lens;
            let osc = 100.0 * (fastema-slowema) / fastema;
            this._series.append(d, osc);
        }
        n++;
    } while (i.move());
}