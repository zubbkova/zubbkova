/* global DrawingObject, ChartPoint, Point, Main */
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
    var a = this._points[0].getPoint(), b = this._points[1].getPoint();
    var b1 = new Point(a._x, b._y);
    return this.onLine(p, a, b1)|| this.onLine(p, b1, b);
}
/**
 * @param {Point} a
 * @param {Point} b
 */
LShapeLines.prototype.drawVerticalLine = function(a, b) {
    if (this.getParentCanvas())
        this.getParentCanvas().drawLineWithAdjust(a._x, a._y, a._x, b._y, this._topLineY, this._bottomLineY);
}
/**
 * @param {Point} a
 * @param {Point} b
 */
LShapeLines.prototype.drawHorizontalLine = function(a, b) {
    if (this.getParentCanvas())
        this.getParentCanvas().drawLineWithAdjust(a._x, b._y, b._x, b._y, this._topLineY, this._bottomLineY);
}
/** @override */
LShapeLines.prototype.draw = function() {
    if (!this.getParentCanvas())
        return;
    this.getParentCanvas().setStrokeColor(this._colour);
    this.getParentCanvas().setLineWidth(this._thickness);
    var a = this._points[0].getPoint(), b = this._points[1].getPoint();
    if ((this._curPoint == 1 && !Main.isTouchClient()) || this._curPoint > 1) {
        this.drawVerticalLine(a, b);
        this.drawHorizontalLine(a, b);
        DrawingObject.prototype.draw.call(this);
    }
    if (this._curPoint == 1 || this._waitDrag)
        this.drawSelectionBox(this._points[this._curPoint-1].getPoint(), this._waitDrag);
}