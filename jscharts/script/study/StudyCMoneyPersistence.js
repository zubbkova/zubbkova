/* global Study, Series, StudyDialog_StudyEditParameter, StudyDialog_StudyYesNoParameter, Language, Utils, TimeIterator */
/**
 * @constructor
 * @extends {Study}
 * @param {Overlay} o
 */
function StudyCMoneyPersistence(o) {
    this._persistSeries = new Series();
    Study.call(this, o);
    this._period = 21;
    this._ema = true;
    this._persist = 21;
    this._series = new Series();
}
/**
 * Inheriting
 */
StudyCMoneyPersistence.prototype = Object.create(Study.prototype);
StudyCMoneyPersistence.prototype.constructor = StudyCMoneyPersistence;
/** @static */
StudyCMoneyPersistence.getItems = function() {
    return [new StudyDialog_StudyEditParameter("period", Language.getString("toolbardialogs_period")),
                new StudyDialog_StudyYesNoParameter("ema", Language.getString("toolbardialogs_use_ema")),
                new StudyDialog_StudyEditParameter("persist", Language.getString("toolbardialogs_persistance"))];
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyCMoneyPersistence.newInstance = function(o) {
    return new StudyCMoneyPersistence(o);
}
/** @static */
StudyCMoneyPersistence.mnemonic = "CMoneyPersistence";
/** @static */
StudyCMoneyPersistence.helpID = 486;
/** @static */
StudyCMoneyPersistence.ownOverlay = true;
/** @override */
StudyCMoneyPersistence.prototype.setName = function() {
    this._name = Language.getString("study_chaikinmoneyflowpersistance") + " (" + this._period + ", " + this._persist + ")";
}
/** @override */
StudyCMoneyPersistence.prototype.getParams = function() {
    return "period-" + this._period + ":ema-" + this._ema + ":persist-" + this._persist;
}
/** @override */
StudyCMoneyPersistence.prototype.setParams = function(params) {
    var items = Utils.convertStringParams(params, ":", "-");
    if (items.hasOwnProperty("period") && typeof items["period"] !== "undefined")
        this._period = parseInt(items["period"], 10);
    if (items.hasOwnProperty("persist") && typeof items["persist"] !== "undefined")
        this._persist = parseInt(items["persist"], 10);
    if (items.hasOwnProperty("ema") && typeof items["ema"] !== "undefined")
        this._ema = items["ema"].toString() === "true";
    if (this._parent._legend)
        this._parent._legend.renameItem(this._legendIndex, this._name);
    Study.prototype.setParams.call(this, params);
}
/** @override */
StudyCMoneyPersistence.prototype.update = function(start, end) {
    this._series.clear();
    this._persistSeries.clear();
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
        // Calculate Chaikin's Money Flow for each iteration
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
        // evaluate the previous entries in this series for the persistence
        var total = 0, totalpositive = 0;
        for(var nn = n-1; (nn > 0) && (total < this._persist); nn--) {
            // loop until beginning of series or maximum number for period is reached
            // we can do them backwards as it's simply quantitative
            if (this._series.getByIndex(nn) > 0)
                totalpositive++;
            total++;
        }
        // add the percentage of ones which are positive to that series
        this._persistSeries.append(d, totalpositive / total * 100);
    } while (i.move());
}
/** @override */
StudyCMoneyPersistence.prototype.getMaxMin = function(i) {
    this._range.reset();
    this._range.getMaxMin(this._persistSeries, i);
}
/** @override */
StudyCMoneyPersistence.prototype.draw = function() {
    this.updateY();
    this._parent.drawLineNormal(this._persistSeries, this._colour);
}
/** @override */
StudyCMoneyPersistence.prototype.getColumnValues = function(d) {
    return [this.d(this._persistSeries.get(d))];
}