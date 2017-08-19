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
    let items = Utils.convertStringParams(params, ":", "-");
    if (items.has("period"))
        this._period = parseInt(items.get("period"), 10);
    if (items.has("persist"))
        this._persist = parseInt(items.get("persist"), 10);
    if (items.has("ema"))
        this._ema = items.get("ema").toString() === "true";
    if (this._parent._legend)
        this._parent._legend.renameItem(this._legendIndex, this._name);
    Study.prototype.setParams.call(this, params);
}
/** @override */
StudyCMoneyPersistence.prototype.update = function(start, end) {
    this._series.clear();
    this._persistSeries.clear();
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
        // Calculate Chaikin's Money Flow for each iteration
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
        // evaluate the previous entries in this series for the persistence
        let total = 0, totalpositive = 0;
        for(let nn = n-1; (nn > 0) && (total < this._persist); nn--) {
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