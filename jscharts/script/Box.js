/**
 * ---
 * Box
 * ---
 * @constructor
 * @extends {DrawingObject}
 * @param {Chart} p
 * @param {number} t - type
 */
function Box(p, t) {
    DrawingObject.call(this, p, t);
    this._points = new Array(2);
    this._points[0] = new ChartPoint();
    this._points[1] = new ChartPoint();
}
/**
 * Inheriting
 */
Box.prototype = Object.create(DrawingObject.prototype);
Box.prototype.constructor = Box;
/** @override */
Box.prototype.copy = function() {
    return DrawingObject.prototype.copy.call(this, new Box(this._parent, this._type));
}
/**
 * @param {Point} p
 */
Box.prototype.hasSelected = function(p) {
    let a = this._points[0].getPoint();
    let b = this._points[1].getPoint();
    let tr = new Point(b._x, a._y);
    let bl = new Point(a._x, b._y);
    return this.onLine(p, a, tr) || this.onLine(p, a, bl) || this.onLine(p, b, tr) || this.onLine(p, b, bl);
}
/** @override */
Box.prototype.draw = function() {
    if (!this._parent._canvas)
        return;
    let box = this.getRect(this._points[0], this._points[1]);
    this._parent._canvas.setLineWidth(this._thickness);
    this._parent._canvas.setStrokeColor(this._colour);
    this._parent._canvas.drawRectWithAdjust(box._x, box._y, box._width, box._height);
    DrawingObject.prototype.draw.call(this);
}