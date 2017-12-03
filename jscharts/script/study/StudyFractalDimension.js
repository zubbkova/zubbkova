/* global StudyWithPeriod, Series, Language, TimeIterator, Utils */
/**
 * @constructor
 * @extends {StudyWithPeriod}
 * @param {Overlay} o
 */
function StudyFractalDimension(o) {
    StudyWithPeriod.call(this, o, 15);
    this._series = new Series();
}
/**
 * Inheriting
 */
StudyFractalDimension.prototype = Object.create(StudyWithPeriod.prototype);
StudyFractalDimension.prototype.constructor = StudyFractalDimension;
/** @static */
StudyFractalDimension.getItems = function() {
    return StudyWithPeriod.getItems();
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyFractalDimension.newInstance = function(o) {
    return new StudyFractalDimension(o);
}
/** @static */
StudyFractalDimension.mnemonic = "FractalDimension";
/** @static */
StudyFractalDimension.helpID = 556;
/** @static */
StudyFractalDimension.ownOverlay = true;
/** @override */
StudyFractalDimension.prototype.setName = function() {
    this._name = Language.getString("study_fractaldimension") + " (" + this._period + ")";
}
/** @override */
StudyFractalDimension.prototype.update = function(start, end) {
    var origin = 0; // (period) points behind
    var current; // current value
    var lastPoint = 0; // previous value
    var absoluteDistance; // direct length from origin to current position
    var pathLength; // length of entire path
    var pathBuffer; // the last n path lengths
    var values; // the last n values
    pathBuffer = new Array(this._period);
    pathBuffer.fillArrayWithValue(0.0);
    values = new Array(this._period);
    values.fillArrayWithValue(0.0);
    this._series.clear();
    var i = TimeIterator.forwardRangeIterator(this._parent._chart.getMasterTimeList(), start, end);
    var result;
    for (var n = 0; n < this._period; i.move(), n++) {
        current = this._source.get(i._d);
        if (origin === 0)
            origin = current;
        if (lastPoint === 0)
            lastPoint = current;
        // calculate absolute distance, using percentage deltas now, increased * 10 to get decent values
        absoluteDistance = Math.sqrt(Math.pow(n + 1, 2) + Math.pow((Math.abs((current - origin) * 1000 / lastPoint)), 2));
        if (absoluteDistance === 0.0)
            absoluteDistance = 1.0;
        // calculate current distance along the path
        pathBuffer[n] = Math.sqrt(Math.pow(1, 2) + Math.pow((Math.abs((current - lastPoint) * 1000 / lastPoint)), 2));
        // calculate entire path length
        pathLength = 0;
        for (var m = 0; m <= n; m++) {
            pathLength += pathBuffer[m];
        }
        // write into series
        result = Math.log(pathLength) / Math.log(absoluteDistance);
        if (result === 0 || isNaN(result))
            result = 1;
        this._series.append(i._d, result);
        lastPoint = current;
        values[n] = current;
    }
    var pos = 0;
    do {
        current = this._source.get(i._d);
        // calculate origin. the earliest period is the one after this one in the array.
        var originpos = pos + 1;
        if (originpos === this._period)
            originpos = 0;
        origin = values[originpos];
        // calculate absolute distance
        absoluteDistance = Math.sqrt(Math.pow(this._period, 2) + Math.pow((Math.abs((current - origin) * 1000 / lastPoint)), 2));
        // calculate current distance along the path
        pathBuffer[pos] = Math.sqrt(Math.pow(1, 2) + Math.pow((Math.abs((current - lastPoint) * 1000 / lastPoint)), 2));
        // calculate entire path length
        pathLength = Utils.sumArray(pathBuffer);
        result = Math.log(pathLength) / Math.log(absoluteDistance);
        if (result === 0)
            result = 1;
        this._series.append(i._d, result);
        lastPoint = current;
        values[pos] = current;
        if (++pos === this._period)
            pos = 0;
    } while (i.move());
}
/** @override */
StudyFractalDimension.prototype.drawPrice = function() {
    this._parent.drawPrice(this._series.get(this._parent._chart._currentSymbol._timeEnd), this._colour);
}
/** @override */
StudyFractalDimension.prototype.draw = function() {
    this.updateY();
    this._parent.drawLineNormal(this._series, this._colour);
}