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
    let origin = 0; // (period) points behind
    let current; // current value
    let lastPoint = 0; // previous value
    let absoluteDistance; // direct length from origin to current position
    let pathLength; // length of entire path
    let pathBuffer; // the last n path lengths
    let values; // the last n values
    pathBuffer = new Array(this._period);
    pathBuffer.fill(0.0);
    values = new Array(this._period);
    values.fill(0.0);
    this._series.clear();
    let i = TimeIterator.forwardRangeIterator(this._parent._chartCanvas._chart.getMasterTimeList(), start, end);
    for (let n = 0; n < this._period; i.move(), n++) {
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
        for (let m = 0; m <= n; m++) {
            pathLength += pathBuffer[m];
        }
        // write into series
        let result = Math.log(pathLength) / Math.log(absoluteDistance);
        if (result === 0 || isNaN(result))
            result = 1;
        this._series.append(i._d, result);
        lastPoint = current;
        values[n] = current;
    }
    let pos = 0;
    do {
        current = this._source.get(i._d);
        // calculate origin. the earliest period is the one after this one in the array.
        let originpos = pos + 1;
        if (originpos === this._period)
            originpos = 0;
        origin = values[originpos];
        // calculate absolute distance
        absoluteDistance = Math.sqrt(Math.pow(this._period, 2) + Math.pow((Math.abs((current - origin) * 1000 / lastPoint)), 2));
        // calculate current distance along the path
        pathBuffer[pos] = Math.sqrt(Math.pow(1, 2) + Math.pow((Math.abs((current - lastPoint) * 1000 / lastPoint)), 2));
        // calculate entire path length
        pathLength = Utils.sumArray(pathBuffer);
        let result = Math.log(pathLength) / Math.log(absoluteDistance);
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
StudyFractalDimension.prototype.draw = function() {
    this.updateY();
    this._parent.drawLineNormal(this._series, this._colour);
    this._parent.drawPrice(this._series.get(this._parent._chartCanvas._chart._currentSymbol._timeEnd), this._colour);
}