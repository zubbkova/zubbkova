/* global DrawingObject, ChartPoint, Main, Font, Style, Point */
/**
 * ------------------
 * TimeFibRetracement
 * ------------------
 * @constructor
 * @extends {DrawingObject}
 * @param {Chart} p
 * @param {number} t - type
 */
function TimeFibRetracement(p, t) {
    DrawingObject.call(this, p, t);
    this._points = new Array(2);
    this._points[0] = new ChartPoint();
    this._points[1] = new ChartPoint();
}
/**
 * Inheriting
 */
TimeFibRetracement.prototype = Object.create(DrawingObject.prototype);
TimeFibRetracement.prototype.constructor = TimeFibRetracement;
/** @override */
TimeFibRetracement.prototype.copy = function() {
    return DrawingObject.prototype.copy.call(this, new TimeFibRetracement(this._parent, this._type));
}
/**
 * @param {Point} p
 */
TimeFibRetracement.prototype.hasSelected = function(p) {
    return this.getRect(this._points[0], this._points[1]).contains(p);
}
/** @override */
TimeFibRetracement.prototype.draw = function() {
    if (!this.getParentCanvas())
        return;
    if (Main.isTouchClient() && this._curPoint == 1) {
        this.drawSelectionBox(this._points[0].getPoint(), this._waitDrag);
        return;
    }
    var a = this._points[0].getPoint();
    var b = this._points[1].getPoint();
    var diff = b._x - a._x;
    var bottom = Math.max(a._y, b._y) + 10;

    this.getParentCanvas().setLineWidth(this._thickness);
    this.getParentCanvas().setFillColor(this._colour);
    this.getParentCanvas().setStrokeColor(this._colour);
    this.getParentCanvas().setFont(new Font("Sans Serif", Style.FONT_STYLE_PLAIN, 9));
    
    this.getParentCanvas().drawLineWithAdjust(a._x, a._y, a._x, b._y, this._topLineY, this._bottomLineY);
    this.getParentCanvas().fillText("0%", a._x - 4, bottom);
    
    var x = a._x + parseInt(diff * 0.382, 10);
    this.getParentCanvas().drawLineWithAdjust(x, a._y, x, b._y, this._topLineY, this._bottomLineY);
    this.getParentCanvas().fillText("38.2%", x - 10, bottom);
    
    x = a._x + parseInt(diff * 0.5, 10);
    this.getParentCanvas().drawLineWithAdjust(x, a._y, x, b._y, this._topLineY, this._bottomLineY);
    this.getParentCanvas().fillText("50%", x - 8, bottom);
    
    x = a._x + parseInt(diff * 0.618, 10);
    this.getParentCanvas().drawLineWithAdjust(x, a._y, x, b._y, this._topLineY, this._bottomLineY);
    this.getParentCanvas().fillText("61,8%", x - 9, bottom);
    
    this.getParentCanvas().drawLineWithAdjust(b._x, a._y, b._x, b._y, this._topLineY, this._bottomLineY);
    this.getParentCanvas().fillText("100%", b._x - 9, bottom);
    
    DrawingObject.prototype.draw.call(this);
    if (this._waitDrag)
        this.drawSelectionBox(this._points[this._curPoint-1].getPoint(), this._waitDrag);
}
/** @override */
TimeFibRetracement.prototype.translateOnTouchDrag = function(dx, dy, x, y) {
    this.setPoint(new Point(x, y), this.getParentCanvas()._overlays[this._parent._mouseArea]);
    this._points[this._curPoint - 1].translate(dx, dy);
}
/** @override */
TimeFibRetracement.prototype.onMouseMove = function(x, y) {
    if (!this.getParentCanvas() || Main.isTouchClient())
        return false;
    this.setPoint(new Point(x, y), this.getParentCanvas()._overlays[this._parent._mouseArea]);
    return true;
}