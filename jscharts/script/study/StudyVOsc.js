/* global Study, Series, Language, Utils, TimeIterator, StudyDialog_StudyEditParameter, StudyDialog_StudyYesNoParameter */
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
StudyVOsc.prototype.update = function(start, end) {
    this._series.clear();
    var i = TimeIterator.forwardRangeIterator(this._parent._chart.getMasterTimeList(), start, end);
    var buf_ptr = 0;
    var n = 0;
    var buf = new Array(this._slowperiod);
    buf.fillArrayWithValue(0.0);
    var totalfast = 0.0;
    var totalslow = 0.0;
    var fastper = 2.0 * (this._fastperiod + 1);
    var slowper = 2.0 * (this._slowperiod + 1);
    var fastfrac = 1.0 / fastper;
    var slowfrac = 1.0 / slowper;
    var omfastfrac = 1.0 - fastfrac;
    var omslowfrac = 1.0 - slowfrac;
    var fastema = 0.0;
    var slowema = 0.0;
    var osc;
    do {
        var d = i._d;
        var vol = this._source.get(d);
        if (this._ema && n >= this._slowperiod) {
            fastema = fastema*omfastfrac + vol*fastfrac;          	
            slowema = slowema*omslowfrac + vol*slowfrac;
            osc = 100.0*(fastema - slowema)/fastema;
            this._series.append(d, osc);
        } else {
            totalfast += vol;
            totalslow += vol;
            buf[buf_ptr++] = vol;
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
            fastema = totalfast/lenf;
            slowema = totalslow /lens;
            osc = 100.0 * (fastema-slowema) / fastema;
            this._series.append(d, osc);
        }
        n++;
    } while (i.move());
}