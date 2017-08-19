/**
 * ---------------
 * ChartLineMirror
 * ---------------
 * This is an extenstion of ChartLine that simply mirrors the line to the right.  ie creating a V or A shape.
 * @constructor
 * @extends {DrawingObject}
 * @param {Chart} p
 * @param {number} t - type
 */
function ChartLineMirror(p, t) {
    DrawingObject.call(this, p, t);
    this._drawAcrossWindows = true;
    this._points = new Array(2);
    this._points[0] = new ChartPoint();
    this._points[1] = new ChartPoint();
}
/**
 * Inheriting
 */
ChartLineMirror.prototype = Object.create(DrawingObject.prototype);
ChartLineMirror.prototype.constructor = ChartLineMirror;
/** @override */
ChartLineMirror.prototype.draw = function() {
    if (!this._parent._canvas)
        return;
    let a = this._points[0].getPoint();
    let b = this._points[1].getPoint();
    this._parent._canvas.setLineWidth(this._thickness);
    this._parent._canvas.setStrokeColor(this._colour);
    this._parent._canvas.drawLineWithAdjust(a._x, a._y, b._x, b._y);
    // choose the right-most point, and mirror it.
    this._next = new Point();
    if (a._x > b._x) {
        this._next._y = b._y;
        this._next._x = b._x + ((a._x - b._x) * 2);
        this._parent._canvas.drawLineWithAdjust(a._x, a._y, this._next._x, this._next._y);
    } else {
        this._next._y = a._y;
        this._next._x = a._x + ((b._x - a._x) * 2);
        this._parent._canvas.drawLineWithAdjust(b._x, b._y, this._next._x, this._next._y);
    }
    DrawingObject.prototype.draw.call(this);
}
/**
 * @param {Point} p
 */
ChartLineMirror.prototype.hasSelected = function(p) {
    return this.onLine(p, this._points[0], this._points[1]) || this.onLine(p, this._points[0].getPoint(), this._next) || this.onLine(p, this._points[1].getPoint(), this._next);
}
/** @override */
ChartLineMirror.prototype.copy = function() {
    return DrawingObject.prototype.copy.call(this, new ChartLineMirror(this._parent, this._type));
}