/* global TimeIterator */
/**
 * ----------
 * XTIterator
 * ----------
 * @constructor
 * @extends {TimeIterator}
 * @param {Chart} p
 * @param {ChartSymbolSet} ss
 * @param {Date} start
 * @param {number} steps
 */
function XTIterator(p, ss, start, steps) {
    TimeIterator.call(this, ss.getMasterTimeList(), start, steps);
    this._parent = p;
    this._symbolSet = ss;
    this._realx = p._drawX + p._drawWidth - p.getDrawGraphDifference();
    this._x = parseInt(this._realx, 10);
    this._count = steps;
}
/**
 * Inheriting
 */
XTIterator.prototype = Object.create(TimeIterator.prototype);
XTIterator.prototype.constructor = XTIterator;
XTIterator.prototype.move = function() {
    this._realx += this._symbolSet._unitWidth * this._delta;
    this._x = parseInt(this._realx, 10);
    return TimeIterator.prototype.move.call(this);
}
/**
 * @param {Series} s
 */
XTIterator.prototype.withinSeries = function(s) {
    if (this._d > this._symbolSet._time) 
        return false;
    return s.size() > 0 && !(this._d < s.timeStart());
}
XTIterator.prototype.toString = function() {
    return this._d + " - " + this._x;
}
/**
 * @static
 * @param {Chart} p
 * @param {ChartSymbolSet=} ss
 */
XTIterator.reverseScreenIterator = function(p, ss) {
    var css = ss; // ChartSymbolSet
    if (arguments.length === 1) {
        css = p._currentSymbol;
    }
    return new XTIterator(p, css, css._timeEnd, parseInt(css._numTimeUnits + 1, 10));
}
/**
 * @static
 * @param {Chart} p
 * @param {ChartSymbolSet=} ss
 */
XTIterator.forwardScreenIterator = function(p, ss) {
    var css = ss; // ChartSymbolSet
    if (arguments.length === 1) {
        css = p._currentSymbol;
    }
    var i = new XTIterator(p, css, css._timeStart, parseInt(css._numTimeUnits + 1, 10));
    i._delta = TimeIterator.FORWARD;
    i._realx -= i._count * css._unitWidth;
    i._x = parseInt(i._realx, 10);
    i._idx--;
    i._d = new Date(css.getMasterTimeList().getByIndex(i._idx));
    return i;
}