/**
 * ------
 * Circle
 * ------
 * @constructor
 * @extends {DrawingObject}
 * @param {Chart} p
 * @param {number} t - type
 */
function Circle(p, t) {
    DrawingObject.call(this, p, t);
    this._drawAcrossWindows = true;
    this._points = new Array(2);
    this._points[0] = new ChartPoint();
    this._points[1] = new ChartPoint();
    this._centre = new ChartPoint();
}
/**
 * Inheriting
 */
Circle.prototype = Object.create(DrawingObject.prototype);
Circle.prototype.constructor = Circle;
/** @override */
Circle.prototype.copy = function() {
    let other =  DrawingObject.prototype.copy.call(this, new Circle(this._parent, this._type));
    other._centre = this._centre.copy();
    return other;
}
/**
 * @param {Point} p
 */
Circle.prototype.hasSelected = function(p) {
    let box = this.getRect(this._points[0], this._points[1]);
    return box.contains(p);
}
/** @override */
Circle.prototype.draw = function() {
    if (!this._parent._canvas)
        return;
    let a = this._points[0].getPoint();
    let b = this._points[1].getPoint();
    let tl = new Point(Math.min(a._x, b._x), Math.min(a._y, b._y));
    this._parent._canvas.setLineWidth(this._thickness);
    this._parent._canvas.setStrokeColor(this._colour);
    this._parent._canvas.drawOval(tl._x, tl._y, Math.abs(b._x - a._x), Math.abs(b._y - a._y));
    DrawingObject.prototype.draw.call(this);
}
Circle.prototype.calcCentre = function() {
    this._centre._tp = new Overlay_TimePos(new Date(Math.min(this._points[0]._t.getTime(), this._points[1]._t.getTime()) +
        Math.abs(this._points[0]._t.getTime() - this._points[1]._t.getTime()) / 2), 0.0);
    this._centre._t = this._centre._tp._d;
    this._centre._val = Math.min(this._points[0]._val, this._points[1]._val) + 0.5 * Math.abs(this._points[0]._val - this._points[1]._val);
    this._centre._window = this._points[0]._window;
    this._radius = this.magnitude(this._centre.getPoint(), this._points[0].getPoint());
}
/** @override */
Circle.prototype.setPoint = function(p, w, index) {
    if (!index)
        index = this._curPoint;
    DrawingObject.prototype.setPoint.call(this, p, w, index);
    if (this._curPoint > 0) {
        this.calcCentre();
    }
}
/** @override */
Circle.prototype.initOtherParams = function(p, w) {
    // don't need to do anything else with params, but calculate the center first.
    this.calcCentre();
}