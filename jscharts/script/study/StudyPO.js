/**
 * @constructor
 * @extends {Study}
 * @param {Overlay} o
 */
function StudyPO(o) {
    this._ema = true;
    this._series = new Series();
    this._fastperiod = 10;
    this._slowperiod = 30;
    Study.call(this, o);
}
/**
 * Inheriting
 */
StudyPO.prototype = Object.create(Study.prototype);
StudyPO.prototype.constructor = StudyPO;
/** @static */
StudyPO.getItems = function() {
    return [new StudyDialog_StudyEditParameter("fast", Language.getString("toolbardialogs_fast_period")),
                new StudyDialog_StudyEditParameter("slow", Language.getString("toolbardialogs_slow_period")),
                new StudyDialog_StudyYesNoParameter("ema", Language.getString("toolbardialogs_use_ema"))];
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyPO.newInstance = function(o) {
    return new StudyPO(o);
}
/** @static */
StudyPO.mnemonic = "PO";
/** @static */
StudyPO.helpID = 469;
/** @static */
StudyPO.ownOverlay = true;
/** @override */
StudyPO.prototype.setName = function() {
    this._name = Language.getString("study_priceoscillator") + " " + (this._ema ? Language.getString("study_ema") + " " : "") + "(" + this._fastperiod + "," + this._slowperiod + ")";
}
/** @override */
StudyPO.prototype.getParams = function() {
    return "fast-" + this._fastperiod + ":slow-" + this._slowperiod + ":ema-" + this._ema;
}
/** @override */
StudyPO.prototype.setParams = function(params) {
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
StudyPO.prototype.update = function(start, end) {
    this._series.clear();
    let i = TimeIterator.forwardRangeIterator(this._parent._chartCanvas._chart.getMasterTimeList(), start, end);
    let buf_ptr = 0;
    let n = 0;
    let buf = new Array(this._slowperiod);
    buf.fill(0.0);
    let totalfast = 0.0;
    let totalslow = 0.0;
    let fastfrac = 2.0 / (this._fastperiod + 1);
    let slowfrac = 2.0 / (this._slowperiod + 1);
    let omfastfrac = 1.0 - fastfrac;
    let omslowfrac = 1.0 - slowfrac;
    let fastema = 0.0;
    let slowema = 0.0;
    do {
        let d = i._d;
        let close = this._source.get(d);
        if (this._ema && n >= this._slowperiod) {
            fastema = fastema * omfastfrac + close * fastfrac;
            slowema = slowema * omslowfrac + close * slowfrac;
            let osc = fastema - slowema;
            this._series.append(d, osc);
        } else {
            totalfast += close;
            totalslow += close;
            buf[buf_ptr++] = close;
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