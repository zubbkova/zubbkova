/* global Study, Series, StudyDialog_StudyEditParameter, StudyDialog_StudyYesNoParameter, Language, Utils, TimeIterator */
/**
 * @constructor
 * @extends {Study}
 * @param {Overlay} o
 */
function StudyCMoney(o) {
    this._period = 21;
    this._ema = true;
    this._series = new Series();
    Study.call(this, o);
}
/**
 * Inheriting
 */
StudyCMoney.prototype = Object.create(Study.prototype);
StudyCMoney.prototype.constructor = StudyCMoney;
/** @static */
StudyCMoney.getItems = function() {
    return [new StudyDialog_StudyEditParameter("period", Language.getString("toolbardialogs_period")),
                new StudyDialog_StudyYesNoParameter("ema", Language.getString("toolbardialogs_use_ema"))];
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyCMoney.newInstance = function(o) {
    return new StudyCMoney(o);
}
/** @static */
StudyCMoney.mnemonic = "CMoney";
/** @static */
StudyCMoney.helpID = 431;
/** @static */
StudyCMoney.ownOverlay = true;
/** @override */
StudyCMoney.prototype.setName = function() {
    this._name = Language.getString("study_chaikinmoneyflow") + " (" + this._period + ")";
}
/** @override */
StudyCMoney.prototype.getParams = function() {
    return "period-" + this._period + ":ema-" + this._ema;
}
/** @override */
StudyCMoney.prototype.setParams = function(params) {
    var items = Utils.convertStringParams(params, ":", "-");
    if (items.hasOwnProperty("period") && typeof items["period"] !== "undefined")
        this._period = parseInt(items["period"], 10);
    if (items.hasOwnProperty("ema") && typeof items["ema"] !== "undefined")
        this._ema = items["ema"].toString() === "true";
    Study.prototype.setParams.call(this, params);
}
/** @override */
StudyCMoney.prototype.update = function(start, end) {
    this._series.clear();
    var i = TimeIterator.forwardRangeIterator(this._parent._chart.getMasterTimeList(), start, end);
    var buf_ptr = 0;
    var n = 0;
    var buf = new Array(this._period);
    buf.fillArrayWithValue(0);
    var totalfast = 0.0;
    var fastper = 2.0 * (this._period + 1);
    var fastfrac = 1.0 / fastper;
    var omfastfrac = 1.0 - fastfrac;
    var fastema = 0.0;
    do {
        var d = i._d;
        var volVal = this._vol.get(d);
        var highVal = this._high.get(d);
        var lowVal = this._low.get(d);
        var openVal = this._open.get(d);
        var closeVal = this._close.get(d);
        var accdist = volVal * (closeVal - openVal) * (highVal - lowVal);
        if (this._ema && n > this._period) {
            fastema = fastema * omfastfrac + accdist * fastfrac;
            this._series.append(d, fastema);
        } else {
            totalfast += accdist;
            buf[buf_ptr++] = accdist;
            if (buf_ptr >= this._period)
                buf_ptr = 0;
            var lenf = this._period;
            if (n >= this._period) {
                totalfast -= buf[buf_ptr];
            } else {
                lenf = n + 1;
            }
            fastema = totalfast / lenf; // SMA of course
            this._series.append(d, fastema);
        }
        n++;
    } while (i.move());
}