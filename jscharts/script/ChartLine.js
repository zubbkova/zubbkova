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
    if (!this._parent._canvas)
        return;
    let a = this._points[0].getPoint();
    let b = this._points[1].getPoint();
    this._parent._canvas.setStrokeColor(this._colour);
    this._parent._canvas.setLineWidth(this._thickness);
    this._parent._canvas.drawLineWithAdjust(a._x, a._y, b._x, b._y);
    DrawingObject.prototype.draw.call(this);
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