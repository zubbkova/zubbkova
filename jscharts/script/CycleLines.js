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
    if (!this._parent._canvas)
        return;
    if (this._selectedPoint === 1) {
        this.setPoint(new Point(x, y), this._parent._canvas._overlays[this._parent._mouseArea], 1);
    } else {
        this.translate(x - this._parent._mouseOldX, y - this._parent._mouseOldY);
    }
    return true;
}
/**
 * @param {Point} p
 */
CycleLines.prototype.hasSelected = function(p) {
    let xVals = this.getXValues();
    if (xVals) {
        for (let i = 0; i < xVals.length; i++) {
            if (Math.abs(xVals[i] - p._x) <= DrawingObject.MAX_SELECTION_DISTANCE)
                return true;
        }
    }
    return false;
}
/** @override */
CycleLines.prototype.draw = function() {
    if (!this._parent._canvas)
        return;
    // Set y-values of points so they're midway along y-axis.
    let yVal = this._points[0]._window._yMid;
    this._points[0]._val = yVal;
    this._points[1]._val = yVal; 
    // Draw lines.
    let xVals = this.getXValues();
    if (xVals) {
        this._parent._canvas.setStrokeColor(this._colour);
        this._parent._canvas.setLineWidth(this._thickness);
        for (let i = 0; i < xVals.length; i++) {
            this._parent._canvas.drawLineWithAdjust(xVals[i], this._parent._drawY + 1, xVals[i], this._parent._drawY + this._parent._drawHeight - 2);
        }
    }
    DrawingObject.prototype.draw.call(this);
}
CycleLines.prototype.getXValues = function() {
    let aa = this._points[0].getPoint();
    let bb = this._points[1].getPoint();
    let numLines;
    let delta = bb._x - aa._x;
    if (delta === 0)
        return;
    if (aa._x > bb._x) {
        numLines = parseInt((aa._x - this._parent._drawX) / Math.abs(delta), 10);
    } else {
        numLines = parseInt((this._parent._drawX + this._parent._drawWidth - aa._x) / Math.abs(delta), 10);
    }
    if (++numLines < 1)
        return;
    let xVals = new Array(numLines);
    let curX = aa._x;
    for (let i = 0; i < numLines; i++) {
        xVals[i] = curX;
        curX += delta;
    }
    return xVals;
}