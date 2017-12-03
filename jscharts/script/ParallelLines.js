/* global DrawingObject, ChartPoint, Main, Point */
/**
 * -------------
 * ParallelLines
 * -------------
 * @constructor
 * @extends {DrawingObject}
 * @param {Chart} p
 * @param {number} t - type
 */
function ParallelLines(p, t) {
    DrawingObject.call(this, p, t);
    this._points = new Array(3);
    this._points[0] = new ChartPoint();
    this._points[1] = new ChartPoint();
    this._points[2] = new ChartPoint();
}
/**
 * Inheriting
 */
ParallelLines.prototype = Object.create(DrawingObject.prototype);
ParallelLines.prototype.constructor = ParallelLines;
/** @override */
ParallelLines.prototype.copy = function() {
    return DrawingObject.prototype.copy.call(this, new ParallelLines(this._parent, this._type));
}
/**
 * @param {Point} p
 */
ParallelLines.prototype.hasSelected = function(p) {
    if (this.onLine(p, this._points[0], this._points[1]))
        return true;
    var pp = this.getParallelLineEnds();
    return this.onLine(p, pp[0], pp[1]);
}
/** @override */
ParallelLines.prototype.draw = function() {
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
        if (this._waitDrag && this._curPoint == 2)
            this.drawSelectionBox(b, this._waitDrag);
    }
    if ((this._curPoint >= 2 && !Main.isTouchClient()) || (Main.isTouchClient() && this._curPoint > 2)) {
        var p = this.getParallelLineEnds();
        this.getParentCanvas().drawLineWithAdjust(p[0]._x, p[0]._y, p[1]._x, p[1]._y, this._topLineY, this._bottomLineY);
    }
    if (this._waitDrag && this._curPoint > 2) {
        this.drawSelectionBox(this._points[2].getPoint(), this._waitDrag);
    }
    DrawingObject.prototype.draw.call(this);
}
ParallelLines.prototype.getParallelLineEnds = function() {
    var a = this._points[0].getPoint();
    var b = this._points[1].getPoint();
    var c = this._points[2].getPoint();
    var offsets = this.offset(a, b);
    var p = new Array(2);
    p[0] = new Point(c._x - parseInt(offsets[0] / 2.0, 10), c._y - parseInt(offsets[1] / 2.0, 10));
    p[1] = new Point(c._x + parseInt(offsets[0] / 2.0, 10), c._y + parseInt(offsets[1] / 2.0, 10));
    return p;
}
/** @override */
ParallelLines.prototype.initOtherParams = function() {
    // NFI what curPoint is, but it only works if we do this!
    this._curPoint = 2;
}
/** @override */
ParallelLines.prototype.onMouseMove = function(x, y) {
    if (!this.getParentCanvas() || Main.isTouchClient())
        return false;
    this.setPoint(new Point(x, y), this.getParentCanvas()._overlays[this._parent._mouseArea]);
    return true;
}