/**
 * ----------------------
 * FibRetracementExtended
 * ----------------------
 * Fibonacci Retracement drawing object.
 * @constructor
 * @extends {DrawingObject}
 * @param {Chart} p
 * @param {number} t - type
 */
function FibRetracementExtended(p, t) {
    DrawingObject.call(this, p, t);
    this._midLineValues = new Array(8);
    this._midLineValues.fill(0);
    this._points = new Array(2);
    this._points[0] = new ChartPoint();
    this._points[1] = new ChartPoint();
}
/**
 * Inheriting
 */
FibRetracementExtended.prototype = Object.create(DrawingObject.prototype);
FibRetracementExtended.prototype.constructor = FibRetracementExtended;
/** @override */
FibRetracementExtended.prototype.draw = function() {
    if (!this._parent._canvas)
        return;
    let val;
    let a = this._points[0].getPoint();
    let b = this._points[1].getPoint();
    let o = this._points[0]._window;

    this._parent._canvas.setLineWidth(this._thickness);
    this._parent._canvas.setFillColor(this._colour);
    this._parent._canvas.setStrokeColor(this._colour);
    this._parent._canvas.setFont(new Font("Sans Serif", Style.FONT_STYLE_PLAIN, 9));
    
    val = this._points[0]._val * 100;
    val = Math.round(val);
    val = val/100;
    this._parent._canvas.drawLineWithAdjust(a._x, a._y, b._x, a._y);
    this._parent._canvas.fillText(this._points[0]._window.getYLabel(val), a._x, a._y - 2);
    
    val = this._midLineValues[0] * 100;
    val = Math.round(val);
    val = val/100;
    this._parent._canvas.setFillColor(Color.red);
    this._parent._canvas.setStrokeColor(Color.red);
    let y = parseInt(o.getY(this._midLineValues[0]), 10);
    this._parent._canvas.drawLineWithAdjust(a._x, y, b._x, y);
    this._parent._canvas.fillText(this._points[0]._window.getYLabel(val), a._x, y - 2);
    
    val = this._midLineValues[1] * 100;
    val = Math.round(val);
    val = val/100;
    this._parent._canvas.setFillColor(this._colour);
    this._parent._canvas.setStrokeColor(this._colour);
    y = parseInt(o.getY(this._midLineValues[1]), 10);
    this._parent._canvas.drawLineWithAdjust(a._x, y, b._x, y);
    this._parent._canvas.fillText(this._points[0]._window.getYLabel(val), a._x, y - 2);

    val = this._midLineValues[2] * 100;
    val = Math.round(val);
    val = val/100;
    y = parseInt(o.getY(this._midLineValues[2]), 10);
    this._parent._canvas.drawLineWithAdjust(a._x, y, b._x, y);
    this._parent._canvas.fillText(this._points[0]._window.getYLabel(val), a._x, y - 2);
    
    val = this._midLineValues[3] * 100;
    val = Math.round(val);
    val = val/100;
    y = parseInt(o.getY(this._midLineValues[3]), 10);
    this._parent._canvas.drawLineWithAdjust(a._x, y, b._x, y);
    this._parent._canvas.fillText(this._points[0]._window.getYLabel(val), a._x, y - 2);
    
    val = this._midLineValues[1] * 100;
    val = Math.round(val);
    val = val/100;
    this._parent._canvas.drawLineWithAdjust(a._x, y, b._x, y);
    this._parent._canvas.fillText(this._points[1]._window.getYLabel(val), a._x, y - 2);
    
    val = this._midLineValues[4] * 100;
    val = Math.round(val);
    val = val/100;
    this._parent._canvas.setFillColor(new Color(0, 125, 0));
    this._parent._canvas.setStrokeColor(new Color(0, 125, 0));
    y = parseInt(o.getY(this._midLineValues[4]), 10);
    this._parent._canvas.drawLineWithAdjust(a._x, y, b._x, y);
    this._parent._canvas.fillText(this._points[0]._window.getYLabel(val), a._x, y - 2);
    
    DrawingObject.prototype.draw.call(this);
}
/**
 * @param {Point} p
 */
FibRetracementExtended.prototype.hasSelected = function(p) {
    let a = this._points[0].getPoint();
    let b = this._points[1].getPoint();
    let o = this._points[0]._window;
    if (this.onLine(p, new Point(a._x, a._y), new Point(b._x, a._y)))
        return true;
    let y = parseInt(o.getY(this._midLineValues[0]), 10);
    if (this.onLine(p, new Point(a._x, y), new Point(b._x, y)))
        return true;
    y = parseInt(o.getY(this._midLineValues[1]), 10);
    if (this.onLine(p, new Point(a._x, y), new Point(b._x, y)))
        return true;
    y = parseInt(o.getY(this._midLineValues[2]), 10);
    if (this.onLine(p, new Point(a._x, y), new Point(b._x, y)))
        return true;
    y = parseInt(o.getY(this._midLineValues[3]), 10);
    if (this.onLine(p, new Point(a._x, y), new Point(b._x, y)))
        return true;
    y = parseInt(o.getY(this._midLineValues[4]), 10);
    if (this.onLine(p, new Point(a._x, y), new Point(b._x, y)))
        return true;
    return this.onLine(p, new Point(a._x, b._y), new Point(b._x, b._y));
}
/** @override */
FibRetracementExtended.prototype.setPoint = function(p, w, index) {
    if (!index)
        index = this._curPoint;
    DrawingObject.prototype.setPoint.call(this, p, w, index);
    this.calcMidValues();
}
/** @override */
FibRetracementExtended.prototype.translate = function(dx, dy) {
    DrawingObject.prototype.translate.call(this, dx, dy);
    this.calcMidValues();
}
FibRetracementExtended.prototype.calcMidValues = function() {
    let diff = this._points[1]._val - this._points[0]._val;
    this._midLineValues[0] = this._points[0]._val + diff * 0.1348;        
    this._midLineValues[1] = this._points[0]._val + diff * 0.382;
    this._midLineValues[2] = this._points[0]._val + diff * 0.5;
    this._midLineValues[3] = this._points[0]._val + diff * 0.618;
    this._midLineValues[4] = this._points[0]._val + diff * 1.618;
}
/** @override */
FibRetracementExtended.prototype.initOtherParams = function() {
    this.calcMidValues();
}
/** @override */
FibRetracementExtended.prototype.copy = function() {
    let other =  DrawingObject.prototype.copy.call(this, new FibRetracementExtended(this._parent, this._type));
    other._midLineValues[0] = this._midLineValues[0];
    other._midLineValues[1] = this._midLineValues[1];
    other._midLineValues[2] = this._midLineValues[2];
    other._midLineValues[3] = this._midLineValues[3];
    other._midLineValues[4] = this._midLineValues[4];
    return other;
}