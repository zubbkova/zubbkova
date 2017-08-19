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
    let pp = this.getParallelLineEnds();
    return this.onLine(p, pp[0], pp[1]);
}
/** @override */
ParallelLines.prototype.draw = function() {
    if (!this._parent._canvas)
        return;
    let a = this._points[0].getPoint();
    let b = this._points[1].getPoint();
    this._parent._canvas.setLineWidth(this._thickness);
    this._parent._canvas.setStrokeColor(this._colour);
    this._parent._canvas.drawLineWithAdjust(a._x, a._y, b._x, b._y);
    if (this._curPoint >= 2) {
        let p = this.getParallelLineEnds();
        this._parent._canvas.drawLineWithAdjust(p[0]._x, p[0]._y, p[1]._x, p[1]._y);
    }
    DrawingObject.prototype.draw.call(this);
}
ParallelLines.prototype.getParallelLineEnds = function() {
    let a = this._points[0].getPoint();
    let b = this._points[1].getPoint();
    let c = this._points[2].getPoint();
    let offsets = this.offset(a, b);
    let p = new Array(2);
    p[0] = new Point(c._x - parseInt(offsets[0] / 2.0, 10), c._y - parseInt(offsets[1] / 2.0, 10));
    p[1] = new Point(c._x + parseInt(offsets[0] / 2.0, 10), c._y + parseInt(offsets[1] / 2.0, 10));
    return p;
}
/** @override */
ParallelLines.prototype.initOtherParams = function(p, w) {
    // NFI what curPoint is, but it only works if we do this!
    this._curPoint = 2;
}