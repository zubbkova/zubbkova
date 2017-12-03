/* global DrawingObject, ChartPoint, Main */
/**
 * ---------
 * ChartLine
 * ---------
 * Represents a user-drawn line on the chart.
 * @constructor
 * @extends {DrawingObject}
 * @param {Chart} p
 * @param {number} t - type
 */
function ChartLine(p, t) {
    DrawingObject.call(this, p, t);
    this._drawAcrossWindows = true;
    this._points = new Array(2);
    this._points[0] = new ChartPoint();
    this._points[1] = new ChartPoint();
}
/**
 * Inheriting
 */
ChartLine.prototype = Object.create(DrawingObject.prototype);
ChartLine.prototype.constructor = ChartLine;
/** @override */
ChartLine.prototype.draw = function() {
    if (typeof this.getParentCanvas() == 'undefined')
        return;
    var a = this._points[0].getPoint();
    var b = this._points[1].getPoint();
    this.getParentCanvas().setStrokeColor(this._colour);
    this.getParentCanvas().setLineWidth(this._thickness);
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
ChartLine.prototype.hasSelected = function(p) {
    return this.onLine(p, this._points[0], this._points[1]);
}
/** @override */
ChartLine.prototype.copy = function() {
    return DrawingObject.prototype.copy.call(this, new ChartLine(this._parent, this._type))
}