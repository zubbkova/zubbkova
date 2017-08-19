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
    if (!this._parent._canvas)
        return;
    let a = this._points[0].getPoint();
    let b = this._points[1].getPoint();
    let diff = b._x - a._x;
    let bottom = Math.max(a._y, b._y) + 10;

    this._parent._canvas.setLineWidth(this._thickness);
    this._parent._canvas.setFillColor(this._colour);
    this._parent._canvas.setStrokeColor(this._colour);
    this._parent._canvas.setFont(new Font("Sans Serif", Style.FONT_STYLE_PLAIN, 9));
    
    this._parent._canvas.drawLineWithAdjust(a._x, a._y, a._x, b._y);
    this._parent._canvas.fillText("0%", a._x - 4, bottom);
    
    let x = a._x + parseInt(diff * 0.382, 10);
    this._parent._canvas.drawLineWithAdjust(x, a._y, x, b._y);
    this._parent._canvas.fillText("38.2%", x - 10, bottom);
    
    x = a._x + parseInt(diff * 0.5, 10);
    this._parent._canvas.drawLineWithAdjust(x, a._y, x, b._y);
    this._parent._canvas.fillText("50%", x - 8, bottom);
    
    x = a._x + parseInt(diff * 0.618, 10);
    this._parent._canvas.drawLineWithAdjust(x, a._y, x, b._y);
    this._parent._canvas.fillText("61,8%", x - 9, bottom);
    
    this._parent._canvas.drawLineWithAdjust(b._x, a._y, b._x, b._y);
    this._parent._canvas.fillText("100%", b._x - 9, bottom);
    
    DrawingObject.prototype.draw.call(this);
}