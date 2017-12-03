/**
 * ------
 * MaxMin
 * ------
 * @constructor
 * @param {Chart} p
 */
function MaxMin(p) {
    this._max = 0;
    this._min = 0;
    this._parent = p;
    this.reset();
}
MaxMin.prototype.reset = function() {
    this._min = 99999999999.0;
    this._max = -this._min;
}
/**
 * @param {MaxMin} other
 */
MaxMin.prototype.adjust = function(other) {
    this._min = Math.min(this._min, other._min);
    this._max = Math.max(this._max, other._max);
}
/**
 * @param {DataSeries} s
 * @param {TimeIterator} i
 */
MaxMin.prototype.getMaxMin = function(s, i) {
    if (!s || !i) return;
    i.reset();
    do {
        var curVal = s.get(i._d);
        // todo: fix for now
        if (curVal === 0)
            continue;
        //
        if (!isNaN(curVal)) {
            if (curVal > this._max) {
                this._max = curVal;
            }
            if (curVal < this._min) {
                this._min = curVal;
            }
        }
    } while(i.move());
}