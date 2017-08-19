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
    let items = Utils.convertStringParams(params, ":", "-");
    if (items.has("period"))
        this._period = parseInt(items.get("period"), 10);
    if (items.has("ema"))
        this._ema = items.get("ema").toString() === "true";
    Study.prototype.setParams.call(this, params);
}
/** @override */
StudyCMoney.prototype.update = function(start, end) {
    this._series.clear();
    let i = TimeIterator.forwardRangeIterator(this._parent._chartCanvas._chart.getMasterTimeList(), start, end);
    let buf_ptr = 0;
    let n = 0;
    let buf = new Array(this._period);
    buf.fill(0);
    let totalfast = 0.0;
    let fastper = 2.0 * (this._period + 1);
    let fastfrac = 1.0 / fastper;
    let omfastfrac = 1.0 - fastfrac;
    let fastema = 0.0;
    do {
        let d = i._d;
        let volVal = this._vol.get(d);
        let highVal = this._high.get(d);
        let lowVal = this._low.get(d);
        let openVal = this._open.get(d);
        let closeVal = this._close.get(d);
        let accdist = volVal * (closeVal - openVal) * (highVal - lowVal);
        if (this._ema && n > this._period) {
            fastema = fastema * omfastfrac + accdist * fastfrac;
            this._series.append(d, fastema);
        } else {
            totalfast += accdist;
            buf[buf_ptr++] = accdist;
            if (buf_ptr >= this._period)
                buf_ptr = 0;
            let lenf = this._period;
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