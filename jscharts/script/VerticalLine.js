/**
 * ------------
 * VerticalLine
 * ------------
 * @constructor
 * @extends {DrawingObject}
 * @param {Chart} p
 * @param {number} t - type
 */
function VerticalLine(p, t) {
    DrawingObject.call(this, p, t);
    this._points = new Array(2);
    this._points[0] = new ChartPoint();
    this._points[1] = new ChartPoint();
}
/**
 * Inheriting
 */
VerticalLine.prototype = Object.create(DrawingObject.prototype);
VerticalLine.prototype.constructor = VerticalLine;
/** @override */
VerticalLine.prototype.draw = function() {
    if (!this._parent._canvas)
        return;
    let a = this._points[0].getPoint();
    let b = this._points[1].getPoint();
    this._parent._canvas.setLineWidth(this._thickness);
    this._parent._canvas.setStrokeColor(this._colour);
    this._parent._canvas.drawLineWithAdjust(a._x, a._y, b._x, b._y);
    DrawingObject.prototype.draw.call(this);
}
/**
 * @param {Point} p
 */
VerticalLine.prototype.hasSelected = function(p) {
    return this.onLine(p, this._points[0], this._points[1]);
}
/** @override */
VerticalLine.prototype.copy = function() {
    return DrawingObject.prototype.copy.call(this, new VerticalLine(this._parent, this._type));
}
/** @override */
VerticalLine.prototype.addPoint = function(p, w) {
    this._points[this._curPoint++].setPoint(p, w);
    if (this._curPoint === 2) {
        this._points[1]._tp._d = new Date(this._points[0]._tp._d.getTime());
        this._points[1]._tp._frac = this._points[0]._tp._frac;
        this._points[1]._t = this._points[1]._tp._d;
    }
    return this._curPoint === 2; 
}
/** @override */
VerticalLine.prototype.setPoint = function(p, w, index) {
    if (!index)
        index = this._curPoint;
    this._points[index].setPoint(p, w);
    if (index === 0 && this._curPoint > 0) {
        this._points[1]._tp._d = new Date(this._points[0]._tp._d.getTime());
        this._points[1]._tp._frac = this._points[0]._tp._frac;
        this._points[1]._t = this._points[1]._tp._d;
    } else if (index === 1) {
        this._points[0]._tp._d = new Date(this._points[1]._tp._d.getTime());
        this._points[0]._tp._frac = this._points[1]._tp._frac;
        this._points[0]._t = this._points[0]._tp._d;
    }
}