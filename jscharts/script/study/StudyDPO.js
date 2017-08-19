/**
 * @constructor
 * @extends {StudyWithPeriod}
 * @param {Overlay} o
 */
function StudyDPO(o) {
    this._series = new Series();
    this._dposeries = new Series();
    StudyWithPeriod.call(this, o, 20);
}
/**
 * Inheriting
 */
StudyDPO.prototype = Object.create(StudyWithPeriod.prototype);
StudyDPO.prototype.constructor = StudyDPO;
/** @static */
StudyDPO.getItems = function() {
    return StudyWithPeriod.getItems();
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyDPO.newInstance = function(o) {
    return new StudyDPO(o);
}
/** @static */
StudyDPO.mnemonic = "DPO";
/** @static */
StudyDPO.helpID = 497;
/** @static */
StudyDPO.ownOverlay = true;
/** @override */
StudyDPO.prototype.setName = function() {
    this._name = Language.getString("study_detrendedpriceoscillator") + " (" + this._period + ")";
}
/** @override */
StudyDPO.prototype.update = function(start, end) {
    let pos = 0, n = 0;
    let  buffer = new Array(this._period);
    buffer.fill(0.0);
    this._series.clear();
    this._dposeries.clear();
    let i = TimeIterator.forwardRangeIterator(this._parent._chartCanvas._chart.getMasterTimeList(), start, end);
    let total = 0.0;
    // work out the moving average.
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
    } while (i.move());
    // and now the DPO calculations on the MA.
    // vaguely inefficient but far more maintainable way to do it, and anyway it's
    // a very simple calculation!
    i = TimeIterator.forwardRangeIterator(this._parent._chartCanvas._chart.getMasterTimeList(), start, end);
    // t is used for calculating the reference
    let t = (this._period / 2) + 1;
    let myDPO;
    // start at value t 
    for (n = 0; n < t; n++) {
        i.move();
    }
    n = t;
    do {
        // subtract the earlier SMA from the Close, for the DPO
        myDPO = this._source.get(i._d) - this._series.getByIndex(n - t);
        this._dposeries.append(i._d, myDPO);
        n++;
    } while (i.move());
}
/** @override */
StudyDPO.prototype.getMaxMin = function(i) {
    this._range.reset();
    this._range.getMaxMin(this._dposeries, i);
}
/** @override */
StudyDPO.prototype.draw = function() {
    this.updateY();
    this._parent.drawLineNormal(this._dposeries, this._colour);
    // draw a line at zero
    this._parent._chartCanvas.setStrokeColor(Color.darkGray);
    let y = parseInt(this._parent.getY(0.2), 10);
    this._parent._chartCanvas.drawLineWithAdjust(this._parent._chartCanvas._topLineStartX, y, this._parent._chartCanvas._topLineEndX, y);
}
/** @override */
StudyDPO.prototype.getColumnValues = function(d) {
    return [this.d(this._dposeries.get(d))];
}