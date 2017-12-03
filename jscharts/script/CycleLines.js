/* global DrawingObject, ChartPoint, Point, Main */
/**
 * ----------
 * CycleLines
 * ----------
 * @constructor
 * @extends {DrawingObject}
 * @param {Chart} p
 * @param {number} t - type
 */
function CycleLines(p, t) {
    DrawingObject.call(this, p, t);
    this._points = new Array(2);
    this._points[0] = new ChartPoint();
    this._points[1] = new ChartPoint();
}
/**
 * Inheriting
 */
CycleLines.prototype = Object.create(DrawingObject.prototype);
CycleLines.prototype.constructor = CycleLines;
/** @override */
CycleLines.prototype.copy = function() {
    return DrawingObject.prototype.copy.call(this, new CycleLines(this._parent, this._type));
}
/** @override */
CycleLines.prototype.onMouseDrag = function(x, y) {
    if (!this.getParentCanvas())
        return false;
    if (this._selectedPoint === 1) {
        this.setPoint(new Point(x, y), this.getParentCanvas()._overlays[this._parent._mouseArea], 1);
    } else {
        this.translate(x - this._parent._mouseOldX, y - this._parent._mouseOldY);
    }
    return true;
}
/**
 * @param {Point} p
 */
CycleLines.prototype.hasSelected = function(p) {
    var xVals = this.getXValues();
    if (xVals) {
        for (var i = 0; i < xVals.length; i++) {
            if (Math.abs(xVals[i] - p._x) <= DrawingObject.MAX_SELECTION_DISTANCE)
                return true;
        }
    }
    return false;
}
/** @override */
CycleLines.prototype.draw = function() {
    if (!this.getParentCanvas())
        return;
    if (Main.isTouchClient() && this._curPoint == 1) {
        this.drawSelectionBox(this._points[0].getPoint(), this._waitDrag);
        return;
    }
    // Set y-values of points so they're midway along y-axis.
    var yVal = this._points[0]._window._yMid;
    this._points[0]._val = yVal;
    this._points[1]._val = yVal; 
    // Draw lines.
    var xVals = this.getXValues();
    if (xVals) {
        this.getParentCanvas().setStrokeColor(this._colour);
        this.getParentCanvas().setLineWidth(this._thickness);
        for (var i = 0; i < xVals.length; i++) {
            this.getParentCanvas().drawLineWithAdjust(xVals[i], this._parent._drawY + 1, xVals[i], this._parent._drawY + this._parent._drawHeight - 2, this._topLineY, this._bottomLineY);
        }
    }
    DrawingObject.prototype.draw.call(this);
    if (this._waitDrag)
        this.drawSelectionBox(this._points[this._curPoint-1].getPoint(), this._waitDrag);
}
CycleLines.prototype.onMouseMove = function(x, y) {
    if (!this.getParentCanvas() || Main.isTouchClient())
        return false;
    this.setPoint(new Point(x, y), this.getParentCanvas()._overlays[this._parent._mouseArea]);
    return true;
}
CycleLines.prototype.getXValues = function() {
    var aa = this._points[0].getPoint();
    var bb = this._points[1].getPoint();
    var numLines;
    var delta = bb._x - aa._x;
    if (delta === 0)
        return;
    if (aa._x > bb._x) {
        numLines = parseInt((aa._x - this._parent._drawX) / Math.abs(delta), 10);
    } else {
        numLines = parseInt((this._parent._drawX + this._parent._drawWidth - aa._x) / Math.abs(delta), 10);
    }
    if (++numLines < 1)
        return;
    var xVals = new Array(numLines);
    var curX = aa._x;
    for (var i = 0; i < numLines; i++) {
        xVals[i] = curX;
        curX += delta;
    }
    return xVals;
}