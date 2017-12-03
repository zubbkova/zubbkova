/* global Overlay_TimePos, Point */
/**
 * ----------
 * ChartPoint
 * ----------
 * Inner class to represent a single point of a drawing object; stored
 * as a time and value pair and which overlay it is in.
 * @constructor
 * @param {Date|string=} ar1
 * @param {number|Overlay=} ar2
 * @param {number|Overlay=} ar3
 */
function ChartPoint(ar1, ar2, ar3) {
    this._val = 0;
    if (arguments.length === 0)
        return;
    if (ar1 && (typeof ar1 !== "string") && ar2 && ar3) {
        this._tp = new Overlay_TimePos(ar1, 0.0);
        this._t = this._tp._d;
        this._val = ar2;
        this._window = ar3;
    } else {
        var items = ar1.split("@");
        this._tp = new Overlay_TimePos(new Date(parseInt(items[0], 10) * 60000), parseFloat(items[1]));
        this._t = this._tp._d;
        this._val = parseFloat(items[2]);
        this._window = ar2;
    }
}
/**
 * Create a copy of this point.
 */
ChartPoint.prototype.copy = function() {
    var other = new ChartPoint(this._t, this._val, this._window);
    other._tp._frac = this._tp._frac;
    return other;
}
/**
 * Translate by a displacement in pixels.
 * @param {number} dx
 * @param {number} dy
 */
ChartPoint.prototype.translate = function(dx, dy) {
    if (dx !== 0) {
        this._tp = this._window.descaleXFrac(dx + this._window.getXFrac(this._tp));
        this._t = this._tp._d;
    }
    if (dy !== 0) {
        this._val -= dy * (this._window._ySpread / this._window._height);
    }
}
/**
 * Set the value from a screen coordinate.
 * @param {Point} p
 * @param {Overlay} w
 */
ChartPoint.prototype.setPoint = function(p, w) {
    this._tp = w.descaleXFrac(p._x);
    this._t = this._tp._d;
    this._val = w._parent._chart._snapOn ? w.snapDescaleY(this._t, p._y) : w.descaleY(p._y);
    this._window = w;
}
/**
 * Convert to a screen coordinate.
 */
ChartPoint.prototype.getPoint = function() {
    if (this._window === undefined)
        return;
    return new Point(this._window.getXFrac(this._tp), parseInt(this._window.getY(this._val), 10));
}
ChartPoint.prototype.stringRep = function() {
    return (this._tp._d.getTime() / 60000) + "@" + this._tp._frac + "@" + this._val;
}
ChartPoint.prototype.toString = function() {
    return "t = " + this._tp._d + "-" + this._tp._frac + " v = " + this._val;
}