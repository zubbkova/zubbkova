/* global StudyWithPeriod, Series, Language, TimeIterator, Utils */
/**
 * @constructor
 * @extends {StudyWithPeriod}
 * @param {Overlay} o
 */
function StudyChandeMomentum(o) {
    StudyWithPeriod.call(this, o, 14);
    this._series = new Series();
}
/**
 * Inheriting
 */
StudyChandeMomentum.prototype = Object.create(StudyWithPeriod.prototype);
StudyChandeMomentum.prototype.constructor = StudyChandeMomentum;
/** @static */
StudyChandeMomentum.getItems = function() {
    return StudyWithPeriod.getItems();
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyChandeMomentum.newInstance = function(o) {
    return new StudyChandeMomentum(o);
}
/** @static */
StudyChandeMomentum.mnemonic = "ChandeMomentum";
/** @static */
StudyChandeMomentum.helpID = 495;
/** @static */
StudyChandeMomentum.ownOverlay = true;
/** @override */
StudyChandeMomentum.prototype.setName = function() {
    this._name = Language.getString("study_chandesmomentumoscillator") + " (" + this._period + ")";
}
/** @override */
StudyChandeMomentum.prototype.update = function(start, end) {
    var pos = 0, n = 0;
    // setup
    var cmo1 = new Array(this._period);
    cmo1.fillArrayWithValue(0.0);
    var cmo2 = new Array(this._period);
    cmo2.fillArrayWithValue(0.0);
    this._series.clear();
    var totalcmo1 = 0.0;
    var totalcmo2 = 0.0;
    var lastClose = -1.0;
    var cmofinal = 0.0;
    var i = TimeIterator.forwardRangeIterator(this._parent._chart.getMasterTimeList(), start, end);
    // first part of loop - we dont have a full buffer
    for (; n < this._period; i.move()) {
        var closeVal = this._source.get(i._d);
        // calculate current cmo1 value
        if (closeVal > lastClose) {
            cmo1[n] = closeVal - lastClose;
        } else {
            cmo1[n] = 0.0;
        }
        // get sum for cmo1
        totalcmo1 = Utils.sumArray(cmo1) / n;
        // caulculate current cmo2 value
        if (closeVal < lastClose) {
            cmo2[n] = lastClose - closeVal;
        } else {
            cmo2[n] = 0.0;
        }
        // get sum for cmo2
        totalcmo2 = Utils.sumArray(cmo2) / n;
        // and calculate cmofinal
        cmofinal = ((totalcmo1 - totalcmo2) / (totalcmo1 + totalcmo2)) * 100;
        this._series.append(i._d, cmofinal);
        // iterate
        lastClose = closeVal;
        n++;
        pos++;
    }
    // remaining periods
    do {
        var close = this._source.get(i._d);
        // cycle buffer
        if (pos === this._period)
            pos = 0;
        // calculate current cmo1 value
        if (close > lastClose) {
            cmo1[pos] = close - lastClose;
        } else {
            cmo1[pos] = 0.0;
        }
        // get sum for cmo1
        totalcmo1 = Utils.sumArray(cmo1) / this._period;
        // caulculate current cmo2 value
        if (close < lastClose) {
            cmo2[pos] = lastClose - close;
        } else {
            cmo2[pos] = 0.0;
        }
        // get sum for cmo2
        totalcmo2 = Utils.sumArray(cmo2) / this._period;
        // and calculate cmofinal
        cmofinal = ((totalcmo1 - totalcmo2) / (totalcmo1 + totalcmo2)) * 100;
        this._series.append(i._d, cmofinal);
        // iterate
        lastClose = close;
        n++;
        pos++;
    } while (i.move());
}