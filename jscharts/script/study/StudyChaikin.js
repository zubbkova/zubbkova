/* global Study, Series, StudyDialog_StudyEditParameter, StudyDialog_StudyYesNoParameter, Language, Utils, TimeIterator */
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
StudyChaikin.prototype.update = function(start, end) {
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
        var volVal = this._vol.get(d);
        var highVal = this._high.get(d);
        var lowVal = this._low.get(d);
        var openVal = this._open.get(d);
        var closeVal = this._close.get(d);
        var accdist = volVal * (closeVal - openVal) * (highVal - lowVal);
        if (this._ema && n > this._slowperiod) {
            fastema = fastema * omfastfrac + accdist * fastfrac;
            slowema = slowema * omslowfrac + accdist * slowfrac;
            osc = fastema - slowema;
            this._series.append(d, osc);
        } else {
            totalfast += accdist;
            totalslow += accdist;
            buf[buf_ptr++] = accdist;
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