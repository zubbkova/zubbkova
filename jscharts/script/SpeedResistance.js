/* global DrawingObject, ChartPoint, Main, Color, Point */
/**
 * ---------------
 * SpeedResistance
 * ---------------
 * @constructor
 * @extends {DrawingObject}
 * @param {Chart} p
 * @param {number} t - type
 */
function SpeedResistance(p, t) {
    DrawingObject.call(this, p, t);
    this._points = new Array(2);
    this._points[0] = new ChartPoint();
    this._points[1] = new ChartPoint();
}
/**
 * Inheriting
 */
SpeedResistance.prototype = Object.create(DrawingObject.prototype);
SpeedResistance.prototype.constructor = SpeedResistance;
/** @override */
SpeedResistance.prototype.copy = function() {
    return DrawingObject.prototype.copy.call(this, new SpeedResistance(this._parent, this._type));
}
/**
 * @param {Point} p
 */
SpeedResistance.prototype.hasSelected = function(p) {
    return this.getRect(this._points[0], this._points[1]).contains(p);
}
/** @override */
SpeedResistance.prototype.draw = function() {
    if (!this.getParentCanvas())
        return;
    if (Main.isTouchClient() && this._curPoint == 1) {
        this.drawSelectionBox(this._points[0].getPoint(), this._waitDrag);
        return;
    }
    var box = this.getRect(this._points[0], this._points[1]);
    this.getParentCanvas().setLineWidth(this._thickness);
    // Draw box if selected.
    if ((!Main.isTouchClient() && (this._selected || this._curPoint === 1)) || this._waitDrag) {
        this.getParentCanvas().setStrokeColor(Color.lightGray);
        this.getParentCanvas().drawRectWithAdjust(box._x, box._y, box._width, box._height, this._topLineY, this._bottomLineY);
    }
    this.getParentCanvas().setStrokeColor(this._colour);
    var a = this._points[0].getPoint(), b = this._points[1].getPoint();
    var deltaX = b._x - a._x, deltaY = b._y - a._y;
    this.getParentCanvas().drawLineWithAdjust(a._x, a._y, a._x + 2 * deltaX / 3, b._y, this._topLineY, this._bottomLineY);
    this.getParentCanvas().drawLineWithAdjust(a._x, a._y, a._x + deltaX / 3, b._y, this._topLineY, this._bottomLineY);
    this.getParentCanvas().drawLineWithAdjust(a._x, a._y, b._x, b._y, this._topLineY, this._bottomLineY);
    this.getParentCanvas().drawLineWithAdjust(a._x, a._y, b._x, a._y + deltaY / 3, this._topLineY, this._bottomLineY);
    this.getParentCanvas().drawLineWithAdjust(a._x, a._y, b._x, a._y + 2 * deltaY / 3, this._topLineY, this._bottomLineY);
    DrawingObject.prototype.draw.call(this);
    if (this._waitDrag)
        this.drawSelectionBox(this._points[this._curPoint-1].getPoint(), this._waitDrag);
}
SpeedResistance.prototype.onMouseMove = function(x, y) {
    if (!this.getParentCanvas() || Main.isTouchClient())
        return false;
    this.setPoint(new Point(x, y), this.getParentCanvas()._overlays[this._parent._mouseArea]);
    return true;
}