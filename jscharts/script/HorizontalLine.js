/* eslint no-unused-vars: "off" */
/* global ChartLine, Main, Point, DrawingObject, Color */
/**
 * --------------
 * HorizontalLine
 * --------------
 * @constructor
 * @extends {ChartLine}
 * @param {Chart} p
 * @param {number} t - type
 */
function HorizontalLine(p, t) {
    ChartLine.call(this, p, t);
}
/**
 * Inheriting
 */
HorizontalLine.prototype = Object.create(ChartLine.prototype);
HorizontalLine.prototype.constructor = HorizontalLine;
/** @override */
HorizontalLine.prototype.onMouseMove = function(x, y) {
    if (!this.getParentCanvas() || Main.isTouchClient())
        return false;
    this.setPoint(new Point(x, y), this.getParentCanvas()._overlays[this._parent._mouseArea]);
    return true;
}
/** @override */
HorizontalLine.prototype.setPoint = function(p, w, index) {
    if (index === undefined)
        index = this._curPoint;
    this._points[index].setPoint(p, w);
    if (index === 0 && this._curPoint > 0) {
        this._points[1]._val = this._points[0]._val;
        this._points[1]._window = this._points[0]._window;
    } else if (index === 1) {
        this._points[0]._val = this._points[1]._val;
        this._points[0]._window = this._points[1]._window;
    }
}
/** @override */
HorizontalLine.prototype.translateOnTouchDrag = function(dx, dy, x, y) {
    if (this._curPoint == 1) {
        this._points[this._curPoint - 1].translate(dx, dy);
    } else {
        this.translate(dx, dy);
    }
}
/** @override */
HorizontalLine.prototype.addPoint = function(p, w) {
    this._points[this._curPoint++].setPoint(p, w);
    if (this._curPoint === 2)
        this._points[1]._val = this._points[0]._val;
    return this._curPoint === 2; 
}
/** @override */
HorizontalLine.prototype.copy = function() {
    return DrawingObject.prototype.copy.call(this, new HorizontalLine(this._parent, this._type));
}
/** @override */
HorizontalLine.prototype.draw = function() {
    ChartLine.prototype.draw.call(this);
    // draw on the price as well?
    if (this.getParentCanvas() && (this._selected || !this._finished))
        this.getParentCanvas()._overlays[0].drawPrice(this._points[0]._val, Color.green);
}