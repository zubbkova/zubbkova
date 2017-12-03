/* global DrawingObject, ChartPoint, Point, Main */
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
    var a = this._points[0].getPoint();
    var b = this._points[1].getPoint();
    var tr = new Point(b._x, a._y);
    var bl = new Point(a._x, b._y);
    return this.onLine(p, a, tr) || this.onLine(p, a, bl) || this.onLine(p, b, tr) || this.onLine(p, b, bl);
}
/** @override */
Box.prototype.draw = function() {
    if (!this.getParentCanvas())
        return;
    var box = this.getRect(this._points[0], this._points[1]);
    this.getParentCanvas().setLineWidth(this._thickness);
    this.getParentCanvas().setStrokeColor(this._colour);
    if ((this._curPoint == 1 && !Main.isTouchClient()) || this._curPoint > 1) {
        this.getParentCanvas().drawRectWithAdjust(box._x, box._y, box._width, box._height, this._topLineY, this._bottomLineY);
        DrawingObject.prototype.draw.call(this);
    }
    if (this._curPoint == 1 || this._waitDrag)
        this.drawSelectionBox(this._points[this._curPoint-1].getPoint(), this._waitDrag);
}