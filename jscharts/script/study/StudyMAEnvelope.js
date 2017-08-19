/**
 * @constructor
 * @extends {Study}
 * @param {Overlay} o
 */
function StudyMAEnvelope(o) {
    this._series = new Series();
    this._seriesUp = new Series();		
    this._seriesDown = new Series();
    Study.call(this, o);
    this._period = 9;
    this._percentage = 2.0;
}
/**
 * Inheriting
 */
StudyMAEnvelope.prototype = Object.create(Study.prototype);
StudyMAEnvelope.prototype.constructor = StudyMAEnvelope;
/** @static */
StudyMAEnvelope.getItems = function() {
    return [new StudyDialog_StudyEditParameter("period", Language.getString("toolbardialogs_period")),
                new StudyDialog_StudyEditParameter("percentage", Language.getString("toolbardialogs_deviance"))];
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyMAEnvelope.newInstance = function(o) {
    return new StudyMAEnvelope(o);
}
/** @static */
StudyMAEnvelope.mnemonic = "MAEnvelope";
/** @static */
StudyMAEnvelope.helpID = 480;
/** @static */
StudyMAEnvelope.ownOverlay = false;
/** @override */
StudyMAEnvelope.prototype.setName = function() {
    this._name = Language.getString("study_maenvelopes") + " (" + this._period + "," + this._percentage + ")";
}
/** @override */
StudyMAEnvelope.prototype.getParams = function() {
    return "period-" + this._period + ":percentage-" + this._percentage;
}
/** @override */
StudyMAEnvelope.prototype.setParams = function(params) {
    let items = Utils.convertStringParams(params, ":", "-"); 
    if (items.has("period"))
        this._period = parseInt(items.get("period"), 10);
    if (items.has("percentage"))
        this._percentage = parseFloat(items.get("percentage"));
    Study.prototype.setParams.call(this, params);
}
/** @override */
StudyMAEnvelope.prototype.update = function(start, end) {
    let pos = 0, n = 0;
    let buffer = new Array(this._period);
    this._series.clear();
    this._seriesUp.clear();
    this._seriesDown.clear();
    let i = TimeIterator.forwardRangeIterator(this._parent._chartCanvas._chart.getMasterTimeList(), start, end);
    let total = 0.0;
    for (; n < this._period; i.move()) {
        buffer[n] = this._source.get(i._d);
        total += buffer[n];
        this._series.append(i._d, total / (++n));
    }
    do {
        let curval = this._source.get(i._d);
        total -= buffer[pos];
        total += curval;
        buffer[pos] = curval;
        if (++pos === this._period)
            pos = 0;
        this._series.append(i._d, total / this._period);
        // add the values for the upper and lower bands.
        this._seriesUp.append(i._d, ((total / this._period) * (1.00 + (this._percentage / 100))));
        this._seriesDown.append(i._d, ((total / this._period) * (1.00 - (this._percentage / 100))));
    } while (i.move());
}
/** @override */
StudyMAEnvelope.prototype.getMaxMin = function(i) {
    this._range.reset();
    this._range.getMaxMin(this._series, i);
    this._range.getMaxMin(this._seriesUp, i);
    this._range.getMaxMin(this._seriesDown, i);
}
/** @override */
StudyMAEnvelope.prototype.draw = function() {
    this.updateY();
    this._parent.drawLineNormal(this._series, this._colour);
    this._parent.drawLineNormal(this._seriesUp, Color.magenta);
    this._parent.drawLineNormal(this._seriesDown, Color.magenta);
    this._parent.drawPrice(this._series.get(this._parent._chartCanvas._chart._currentSymbol._timeEnd), this._colour);
}
/** @override */
StudyMAEnvelope.prototype.getRange = function() {
    return this._period;
}
/** @override */
StudyMAEnvelope.prototype.getColumnNames = function() {
    return [this._name, "Up", "Down"];
}
/** @override */
StudyMAEnvelope.prototype.getColumnValues = function(d) {
    return [this.d(this._series.get(d)), this.d(this._seriesUp.get(d)), this.d(this._seriesDown.get(d))];
}