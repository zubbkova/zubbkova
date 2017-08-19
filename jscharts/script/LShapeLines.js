/**
 * -----------
 * LShapeLines
 * -----------
 * @constructor
 * @extends {DrawingObject}
 * @param {Chart} p
 * @param {number} t - type
 */
function LShapeLines(p, t) {
    DrawingObject.call(this, p, t);
    this._drawAcrossWindows = true;
    this._points = new Array(2);
    this._points[0] = new ChartPoint();
    this._points[1] = new ChartPoint();
}
/**
 * Inheriting
 */
LShapeLines.prototype = Object.create(DrawingObject.prototype);
LShapeLines.prototype.constructor = LShapeLines;
/** @override */
LShapeLines.prototype.copy = function() {
    return DrawingObject.prototype.copy.call(this, new LShapeLines(this._parent, this._type));
}
/**
 * @param {Point} p
 */
LShapeLines.prototype.hasSelected = function(p) {
    let a = this._points[0].getPoint(), b = this._points[1].getPoint();
    let b1 = new Point(a._x, b._y);
    return this.onLine(p, a, b1)|| this.onLine(p, b1, b);
}
/**
 * @param {Point} a
 * @param {Point} b
 */
LShapeLines.prototype.drawVerticalLine = function(a, b) {
    if (this._parent._canvas)
        this._parent._canvas.drawLineWithAdjust(a._x, a._y, a._x, b._y);
}
/**
 * @param {Point} a
 * @param {Point} b
 */
LShapeLines.prototype.drawHorizontalLine = function(a, b) {
    if (this._parent._canvas)
        this._parent._canvas.drawLineWithAdjust(a._x, b._y, b._x, b._y);
}
/** @override */
LShapeLines.prototype.draw = function() {
    if (!this._parent._canvas)
        return;
    this._parent._canvas.setStrokeColor(this._colour);
    this._parent._canvas.setLineWidth(this._thickness);
    let a = this._points[0].getPoint(), b = this._points[1].getPoint();
    this.drawVerticalLine(a, b);
    this.drawHorizontalLine(a, b);
    DrawingObject.prototype.draw.call(this);
}