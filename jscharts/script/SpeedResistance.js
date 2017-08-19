/**
 * ---------------
 * SpeedResistance
 * ---------------
 * @constructor
 * @extends {DrawingObject}
 * @param {Chart} p
 * @param {number} t - type
 */
function SpeedResistance(p, t) {
    DrawingObject.call(this, p, t);
    this._points = new Array(2);
    this._points[0] = new ChartPoint();
    this._points[1] = new ChartPoint();
}
/**
 * Inheriting
 */
SpeedResistance.prototype = Object.create(DrawingObject.prototype);
SpeedResistance.prototype.constructor = SpeedResistance;
/** @override */
SpeedResistance.prototype.copy = function() {
    return DrawingObject.prototype.copy.call(this, new SpeedResistance(this._parent, this._type));
}
/**
 * @param {Point} p
 */
SpeedResistance.prototype.hasSelected = function(p) {
    return this.getRect(this._points[0], this._points[1]).contains(p);
}
/** @override */
SpeedResistance.prototype.draw = function() {
    if (!this._parent._canvas)
        return;
    let box = this.getRect(this._points[0], this._points[1]);
    this._parent._canvas.setLineWidth(this._thickness);
    // Draw box if selected.
    if (this._selected || this._curPoint === 1) {
        this._parent._canvas.setStrokeColor(Color.lightGray);
        this._parent._canvas.drawRectWithAdjust(box._x, box._y, box._width, box._height);
    }
    this._parent._canvas.setStrokeColor(this._colour);
    let a = this._points[0].getPoint(), b = this._points[1].getPoint();
    let deltaX = b._x - a._x, deltaY = b._y - a._y;
    this._parent._canvas.drawLineWithAdjust(a._x, a._y, a._x + 2 * deltaX / 3, b._y);
    this._parent._canvas.drawLineWithAdjust(a._x, a._y, a._x + deltaX / 3, b._y);
    this._parent._canvas.drawLineWithAdjust(a._x, a._y, b._x, b._y);
    this._parent._canvas.drawLineWithAdjust(a._x, a._y, b._x, a._y + deltaY / 3);
    this._parent._canvas.drawLineWithAdjust(a._x, a._y, b._x, a._y + 2 * deltaY / 3);
    DrawingObject.prototype.draw.call(this);
}