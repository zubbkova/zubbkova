/* global Study, Series, StudyDialog_StudyEditParameter, Language, Utils, MetaStudy, TimeIterator */
/**
 * Delta Weighted Moving Average
 * 
 * A moving average weighted by the delta in pricechange at each step.
 * ie if the delta is low, the MA is lazy.  when it gets high, the MA speeds up.
 * weights the delta exponentially as well to reinforce the movement even further as well
 *
 * could it also provide an EMA to smooth this with?
 * 
 * params:
 * period - period of the MA
 * exponent - exponential weight of the delta
 * @author davidw
 * @constructor
 * @extends {Study}
 * @param {Overlay} o
 */
function StudyDeltaWeightedMovingAverage(o) {
    Study.call(this, o);
    this._period = 12;
    this._exponent = 2;
    this._series = new Series();
    this._deltaSeries = new Series();
}
/**
 * Inheriting
 */
StudyDeltaWeightedMovingAverage.prototype = Object.create(Study.prototype);
StudyDeltaWeightedMovingAverage.prototype.constructor = StudyDeltaWeightedMovingAverage;
/** 
 * @static
 * @param {Overlay} o
 */
StudyDeltaWeightedMovingAverage.newInstance = function(o) {
    return new StudyDeltaWeightedMovingAverage(o);
}
/** @static */
StudyDeltaWeightedMovingAverage.mnemonic = "DeltaWeightedMovingAverage";
/** @static */
StudyDeltaWeightedMovingAverage.helpID = 557;
/** @static */
StudyDeltaWeightedMovingAverage.ownOverlay = false;
/** @static */
StudyDeltaWeightedMovingAverage.getItems = function() {
    return [new StudyDialog_StudyEditParameter("period", Language.getString("toolbardialogs_period")), new StudyDialog_StudyEditParameter("exponent", Language.getString("toolbardialogs_exponent"))];
}
/** @override */
StudyDeltaWeightedMovingAverage.prototype.setName = function() {
    this._name = Language.getString("study_deltaweightedmovingaverage") + " (" + this._period + ")";
}
/** @override */
StudyDeltaWeightedMovingAverage.prototype.getParams = function() {
    return "period-" + this._period + ":exponent-" + this._exponent;
}
/** @override */
StudyDeltaWeightedMovingAverage.prototype.setParams = function(params) {
    var items = Utils.convertStringParams(params, ":", "-");
    if (items.hasOwnProperty("period") && typeof items["period"] !== "undefined")
        this._period = parseInt(items["period"], 10);
    if (items.hasOwnProperty("exponent") && typeof items["exponent"] !== "undefined")
        this._exponent = parseFloat(items["exponent"]);
}
/** @override */
StudyDeltaWeightedMovingAverage.prototype.update = function(start, end) {
    // get the series of deltas for the weights.  need absolute values here as we're concerned with the size of the delta.
    this._deltaSeries = MetaStudy.absoluteValueSeries(this._parent._chart, MetaStudy.deltaSeries(this._parent._chart, this._source));
    // adjust the series to stretch out the weights.
    // (apply EMA to the deltas?)
    // calculate the sum of the deltas to work out the weighting.
    // work out the proportions of the delta within the period
    var buffer = new Array(this._period);
    var bufferdeltas = new Array(this._period);
    var total = 0.0;
    var totaldeltas = 0.0;
    var pos = 0, n = 0;
    this._series.clear();
    var i = TimeIterator.forwardRangeIterator(this._parent._chart.getMasterTimeList(), start, end);
    var del;
    for (; n < this._period; i.move()) {
        del = this._deltaSeries.get(i._d);
        // "enhance" the delta data by increasing the spread thereof.
        del = Math.pow(del, this._exponent);
        buffer[n] = this._source.get(i._d) * del;
        bufferdeltas[n] = del;
        total += buffer[n];
        totaldeltas += bufferdeltas[n];
        if (totaldeltas === 0.0) {
            this._series.append(i._d, NaN);
        } else {
            this._series.append(i._d, total / totaldeltas);
        }
        n++;
    }
    do {
        var curval = this._source.get(i._d);
        del = this._deltaSeries.get(i._d);
        // "enhance" the delta data by increasing the spread thereof.
        del = Math.pow(del, this._exponent);
        // remove the old value and add in the new
        buffer[pos] = curval * del;
        bufferdeltas[pos] = del;
        total = Utils.sumArray(buffer);
        totaldeltas = Utils.sumArray(bufferdeltas);
        if (++pos === this._period)
            pos = 0;
        if (totaldeltas === 0.0) {
            this._series.append(i._d, NaN);
        } else {
            this._series.append(i._d, total / totaldeltas);
        }
    }
    while (i.move());
}
/** @override */
StudyDeltaWeightedMovingAverage.prototype.drawPrice = function() {
    this._parent.drawPrice(this._series.get(this._parent._chart._currentSymbol._timeEnd), this._colour);
}
/** @override */
StudyDeltaWeightedMovingAverage.prototype.draw = function() {
    this.updateY();
    this._parent.drawLineNormal(this._series, this._colour);
}
/** @override */
StudyDeltaWeightedMovingAverage.prototype.getRange = function() {
    return this._period;
}