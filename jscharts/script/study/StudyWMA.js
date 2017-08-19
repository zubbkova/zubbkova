/**
 * @constructor
 * @extends {Study}
 * @param {Overlay} o
 */
function StudyWMA(o) {
    Study.call(this, o);
    this._period = 15;
    this._offset = 0;
    this._series = new Series();
}
/**
 * Inheriting
 */
StudyWMA.prototype = Object.create(Study.prototype);
StudyWMA.prototype.constructor = StudyWMA;
/** @static */
StudyWMA.getItems = function() {
    return [new StudyDialog_StudyEditParameter("period", Language.getString("toolbardialogs_period")), new StudyDialog_StudyEditParameter("offset", Language.getString("toolbardialogs_offset"))];
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyWMA.newInstance = function(o) {
    return new StudyWMA(o);
}
/** @static */
StudyWMA.mnemonic = "WMA";
/** @static */
StudyWMA.helpID = 435;
/** @static */
StudyWMA.ownOverlay = false;
/** @override */
StudyWMA.prototype.setName = function() {
    this._name = Language.getString("study_weightedmovingaverage") + " (" + this._period + "," + this._offset + ")";
}
/** @override */
StudyWMA.prototype.getParams = function() {
    return "period-" + this._period + ":offset-" + this._offset;
}
/** @override */
StudyWMA.prototype.setParams = function(params) {
    let items = Utils.convertStringParams(params, ":", "-");
    if (items.has("period"))
        this._period = parseInt(items.get("period"), 10);
    if (items.has("offset"))
        this._offset = parseInt(items.get("offset"), 10);
    Study.prototype.setParams.call(this, params);
}
/** @override */
StudyWMA.prototype.draw = function() {
    this.updateY();
    this._parent.drawLineNormal(this._series, this._colour);
    this._parent.drawPrice(this._series.get(this._parent._chartCanvas._chart._currentSymbol._timeEnd), this._colour);
}
/** @override */
StudyWMA.prototype.getRange = function() {
    return this._period;
}
/** @override */
StudyWMA.prototype.update = function(start, end) {
    let pos = 0, n = 0;
    let buffer = new Array(this._period);
    this._series.clear();
    let i = TimeIterator.forwardRangeIterator(this._parent._chartCanvas._chart.getMasterTimeList(), start, end);
    let total = 0.0;
    for (; n < this._period; i.move()) {
        buffer[n] = this._source.get(i._d);
        total += buffer[n];
        this._series.append(this._parent._chartCanvas._chart.timeAdjust(i._d, -this._offset), total / (++n));
    }
    do {
        let curval = this._source.get(i._d);
        buffer[pos] = curval;
        let p = pos;
        total = 0;
        let weightTotal = 0;
        let weight = 1;
        for (let j = 0; j < this._period; j++)
        {
            total += buffer[p] * weight;
            weightTotal += weight++;
            if (++p === this._period)
                p = 0;
        }
        if (++pos === this._period)
            pos = 0;
        this._series.append(this._parent._chartCanvas._chart.timeAdjust(i._d, -this._offset), total / weightTotal);
    } while (i.move());
}