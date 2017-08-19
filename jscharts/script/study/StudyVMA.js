/**
 * @constructor
 * @extends {Study}
 * @param {Overlay} o
 */
function StudyVMA(o) {
    Study.call(this, o);
    this._period = 15;
    this._offset = 0;
    this._series = new Series();
}
/**
 * Inheriting
 */
StudyVMA.prototype = Object.create(Study.prototype);
StudyVMA.prototype.constructor = StudyVMA;
/** @static */
StudyVMA.getItems = function() {
    return [new StudyDialog_StudyEditParameter("period", Language.getString("toolbardialogs_period")), new StudyDialog_StudyEditParameter("offset", Language.getString("toolbardialogs_offset"))];
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyVMA.newInstance = function(o) {
    return new StudyVMA(o);
}
/** @static */
StudyVMA.mnemonic = "VMA";
/** @static */
StudyVMA.helpID = 474;
/** @static */
StudyVMA.ownOverlay = false;
/** @override */
StudyVMA.prototype.setName = function() {
    this._name = Language.getString("study_volumeweightedmovingaverage") + " (" + this._period + "," + this._offset + ")";
}
/** @override */
StudyVMA.prototype.getParams = function() {
    return "period-" + this._period + ":offset-" + this._offset;
}
/** @override */
StudyVMA.prototype.setParams = function(params) {
    let items = Utils.convertStringParams(params, ":", "-");
    if (items.has("period"))
        this._period = parseInt(items.get("period"), 10);
    if (items.has("offset"))
        this._offset = parseInt(items.get("offset"), 10);
    Study.prototype.setParams.call(this, params);
}
/** @override */
StudyVMA.prototype.draw = function() {
    this.updateY();
    this._parent.drawLineNormal(this._series, this._colour);
    this._parent.drawPrice(this._series.get(this._parent._chartCanvas._chart._currentSymbol._timeEnd), this._colour);
}
/** @override */
StudyVMA.prototype.getRange = function() {
    return this._period;
}
/** @override */
StudyVMA.prototype.update = function(start, end) {
    let pos = 0, n = 0;
    let buffer = new Array(this._period);
    let bufvol = new Array(this._period);
    this._series.clear();
    let i = TimeIterator.forwardRangeIterator(this._parent._chartCanvas._chart.getMasterTimeList(), start, end);
    let total = 0.0;
    let totalvol = 0.0;
    for (; n < this._period; i.move()) {
        buffer[n] = this._close.get(i._d);
        let v = bufvol[n] = this._vol.get(i._d);
        total += v * buffer[n];
        totalvol += v;
        if (totalvol === 0.0) {
            this._series.append(this._parent._chartCanvas._chart.timeAdjust(i._d, -this._offset), NaN);
        } else {
            this._series.append(this._parent._chartCanvas._chart.timeAdjust(i._d, -this._offset), total / totalvol);
        }
        n++;
    }
    do {
        let curval = this._close.get(i._d);
        let vol1 = this._vol.get(i._d);
        total -= bufvol[pos] * buffer[pos];
        total += vol1 * (buffer[pos] = curval);
        totalvol -= bufvol[pos];
        totalvol += bufvol[pos] = vol1;
        if (++pos === this._period)
            pos = 0;
        if (totalvol === 0.0) {
            this._series.append(this._parent._chartCanvas._chart.timeAdjust(i._d, -this._offset), NaN);
        } else {
            this._series.append(this._parent._chartCanvas._chart.timeAdjust(i._d, -this._offset), total / totalvol);
        }
    } while (i.move());
}