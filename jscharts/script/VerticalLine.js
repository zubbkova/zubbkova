/* global DrawingObject, ChartPoint, Main, Point */
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
    if (!this.getParentCanvas())
        return;
    var a = this._points[0].getPoint();
    var b = this._points[1].getPoint();
    this.getParentCanvas().setLineWidth(this._thickness);
    this.getParentCanvas().setStrokeColor(this._colour);
    if (this._curPoint == 1) {
        if (!Main.isTouchClient()) {
            this.getParentCanvas().drawLineWithAdjust(a._x, a._y, b._x, b._y, this._topLineY, this._bottomLineY);
            DrawingObject.prototype.draw.call(this);
        }
        this.drawSelectionBox(a, this._waitDrag);
    } else {
        this.getParentCanvas().drawLineWithAdjust(a._x, a._y, b._x, b._y, this._topLineY, this._bottomLineY);
        DrawingObject.prototype.draw.call(this);
        if (this._waitDrag)
            this.drawSelectionBox(b, this._waitDrag);
    }
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
VerticalLine.prototype.translateOnTouchDrag = function(dx, dy) {
    if (this._curPoint == 1) {
        this._points[this._curPoint - 1].translate(dx, dy);
    } else {
        this.translate(dx, dy);
    }
}
/** @override */
VerticalLine.prototype.setPoint = function(p, w, index) {
    if (index === undefined)
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
/** @override */
VerticalLine.prototype.onMouseMove = function(x, y) {
    if (!this.getParentCanvas() || Main.isTouchClient())
        return false;
    this.setPoint(new Point(x, y), this.getParentCanvas()._overlays[this._parent._mouseArea]);
    return true;
}