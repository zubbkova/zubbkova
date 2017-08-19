/**
 * @constructor
 * @extends {StudyWithPeriod}
 * @param {Overlay} o
 */
function StudyStochRSI(o) {
    StudyWithPeriod.call(this, o, 14);
    this._series = new Series();
}
/**
 * Inheriting
 */
StudyStochRSI.prototype = Object.create(StudyWithPeriod.prototype);
StudyStochRSI.prototype.constructor = StudyStochRSI;
/** @static */
StudyStochRSI.getItems = function() {
    return StudyWithPeriod.getItems();
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyStochRSI.newInstance = function(o) {
    return new StudyStochRSI(o);
}
/** @static */
StudyStochRSI.mnemonic = "StochRSI";
/** @static */
StudyStochRSI.helpID = 484;
/** @static */
StudyStochRSI.ownOverlay = true;
/** @override */
StudyStochRSI.prototype.setName = function() {
    this._name = Language.getString("study_stochasticrsi") + " (" + this._period + ")";
}
/** @override */
StudyStochRSI.prototype.update = function(start, end) {
    let n = 0;
    // stuff for highs and lows to apply stochastic formula
    let high = 0.0, low = 999999.99;
    let RSI = 0.0, StochRSI = 0.0;
    this._series.clear();
    let i = TimeIterator.forwardRangeIterator(this._parent._chartCanvas._chart.getMasterTimeList(), start, end);
    // Calculate initial RS.
    let avgain = 0.0;
    let avloss = 0.0;
    let last = 0.0;
    for (; n < this._period; i.move(), n++) {
        let now = this._source.get(i._d);
        if (isNaN(now))
            continue;
        // maintain last result
        if (last === 0.0) {
            this._series.append(i._d, 0.5);
        } else {
            let diff = now - last;
            if (diff > 0.0) {
                avgain += diff / this._period;
            } else {
                avloss -= diff / this._period;
            }
            // calculate current RSI for this period
            RSI = 100 - (100 / (1 + (avgain / avloss)));
            // Calculate Highs and lows
            if (RSI > high)
                high = RSI;
            if (RSI < low)
                low = RSI;
            // apply stochastic formula
            StochRSI = (RSI - low) / (high - low);
            this._series.append(i._d, StochRSI);
        }
        last = now;
    }
    // Use smoothed RS afterwards.
    do {
        let diff = this._source.get(i._d) - this._source.get(this._parent._chartCanvas._chart.timeAdjust(i._d, -1));
        if (diff > 0.0) {
            avgain = (avgain * (this._period - 1) + diff) / this._period;
            avloss = (avloss * (this._period - 1)) / this._period;
        } else {
            avgain = (avgain * (this._period - 1)) / this._period;
            avloss = (avloss * (this._period - 1) - diff) / this._period;
        }
        // calculate current RSI for this period
        RSI = 100 - (100 / (1 + (avgain / avloss)));
        // Calculate Highs and lows
        if (RSI > high)
            high = RSI;
        if (RSI < low)
            low = RSI;
        // apply stochastic formula
        StochRSI = (RSI - low) / (high - low);
        this._series.append(i._d, StochRSI);
    } while (i.move());
}
/** @override */
StudyStochRSI.prototype.getMaxMin = function(i) {
    this._range.reset();
    this._range._max = 1.0;
    this._range._min = 0.0;
}
/** @override */
StudyStochRSI.prototype.draw = function() {
    this.updateY();
    this._parent.drawLineNormal(this._series, this._colour);
    // Draw 0.2/0.8 lines.
    this._parent._chartCanvas.setStrokeColor(Color.darkGray);
    let y = parseInt(this._parent.getY(0.3), 10);
    this._parent._chartCanvas.drawLineWithAdjust(this._parent._chartCanvas._topLineStartX, y, this._parent._chartCanvas._topLineEndX, y);
    y = parseInt(this._parent.getY(0.7), 10);
    this._parent._chartCanvas.drawLineWithAdjust(this._parent._chartCanvas._topLineStartX, y, this._parent._chartCanvas._topLineEndX, y);
}