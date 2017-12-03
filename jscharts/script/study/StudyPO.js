/* global Study, Series, Language, Utils, TimeIterator, StudyDialog_StudyEditParameter, StudyDialog_StudyYesNoParameter */
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
    var items = Utils.convertStringParams(params, ":", "-");
    if (items.hasOwnProperty("fast") && typeof items["fast"] !== "undefined")
        this._fastperiod = parseInt(items["fast"], 10);
    if (items.hasOwnProperty("slow") && typeof items["slow"] !== "undefined")
        this._slowperiod = parseInt(items["slow"], 10);
    if (items.hasOwnProperty("ema") && typeof items["ema"] !== "undefined")
        this._ema = items["ema"].toString() === "true";
    Study.prototype.setParams.call(this, params);
}
/** @override */
StudyPO.prototype.update = function(start, end) {
    this._series.clear();
    var i = TimeIterator.forwardRangeIterator(this._parent._chart.getMasterTimeList(), start, end);
    var buf_ptr = 0;
    var n = 0;
    var buf = new Array(this._slowperiod);
    buf.fillArrayWithValue(0.0);
    var totalfast = 0.0;
    var totalslow = 0.0;
    var fastfrac = 2.0 / (this._fastperiod + 1);
    var slowfrac = 2.0 / (this._slowperiod + 1);
    var omfastfrac = 1.0 - fastfrac;
    var omslowfrac = 1.0 - slowfrac;
    var fastema = 0.0;
    var slowema = 0.0;
    var osc;
    do {
        var d = i._d;
        var close = this._source.get(d);
        if (this._ema && n >= this._slowperiod) {
            fastema = fastema * omfastfrac + close * fastfrac;
            slowema = slowema * omslowfrac + close * slowfrac;
            osc = fastema - slowema;
            this._series.append(d, osc);
        } else {
            totalfast += close;
            totalslow += close;
            buf[buf_ptr++] = close;
            if (buf_ptr >= this._slowperiod)
                buf_ptr = 0;
            var lens = this._slowperiod;
            var lenf = this._fastperiod;
            if (n >= this._slowperiod) {
                totalslow -= buf[buf_ptr];
            } else {
                lens = n + 1;
            }
            if (n >= this._fastperiod) {
                var buf_temp = buf_ptr - this._fastperiod;
                if (buf_temp < 0) {
                    buf_temp += this._slowperiod;
                }
                totalfast -= buf[buf_temp];
            } else {
                lenf = n + 1;
            }
            fastema = totalfast / lenf;
            slowema = totalslow / lens;
            osc = fastema - slowema;
            this._series.append(d, osc);
        }
        n++;
    } while (i.move());
}