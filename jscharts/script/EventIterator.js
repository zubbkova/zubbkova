/**
 * -------------
 * EventIterator
 * -------------
 * @constructor
 * @extends {TimeIterator}
 * @param {Chart} p
 * @param {MasterTimeList} t
 * @param {Date} start
 * @param {number} steps
 */
function EventIterator(p, t, start, steps) {
    TimeIterator.call(this, t, start, steps);
    this._parent = p;
    this._realx = this._x = p._mainOverlay.getX(start);
}
/**
 * Inheriting
 */
EventIterator.prototype = Object.create(TimeIterator.prototype);
EventIterator.prototype.constructor = EventIterator;
/** @override */
EventIterator.prototype.move = function() {
    let res = TimeIterator.prototype.move.call(this);
    this._realx = this._parent._mainOverlay.getX(this._d);
    this._x = parseInt(this._realx, 10);
    return res;
}
/** 
 * @static
 * @param {Chart} p
 */
EventIterator.getEventIterator = function(p) {
    if (!p._currentSymbol)
        return;
    if (p._currentSymbol.mainFrequency() > PriceDataConstants.FREQUENCY_D) 
        return;
    let mtl = p._currentSymbol.getDailyMasterTimeList();
    let dend = mtl.get(p._currentSymbol._timeEnd);
    let dstart = mtl.get(p._currentSymbol._timeStart) + 1;
    return new EventIterator(p, mtl, new Date(mtl.getByIndex(dend)), dend - dstart);
}