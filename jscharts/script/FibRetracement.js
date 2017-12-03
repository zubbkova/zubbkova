/* global DrawingObject, ChartPoint, Main, Font, Style, Point */
/**
 * --------------
 * FibRetracement
 * --------------
 * Fibonacci Retracement drawing object.
 * @constructor
 * @extends {DrawingObject}
 * @param {Chart} p
 * @param {number} t - type
 */
function FibRetracement(p, t) {
    DrawingObject.call(this, p, t);
    this._midLineValues = new Array(8);
    this._midLineValues.fillArrayWithValue(0);
    this._points = new Array(2);
    this._points[0] = new ChartPoint();
    this._points[1] = new ChartPoint();
}
/**
 * Inheriting
 */
FibRetracement.prototype = Object.create(DrawingObject.prototype);
FibRetracement.prototype.constructor = FibRetracement;
/** @override */
FibRetracement.prototype.draw = function() {
    if (!this.getParentCanvas())
        return;
    if (Main.isTouchClient() && this._curPoint == 1) {
        this.drawSelectionBox(this._points[0].getPoint(), this._waitDrag);
        return;
    }
        
    var a = this._points[0].getPoint();
    var b = this._points[1].getPoint();
    var o = this._points[0]._window;

    this.getParentCanvas().setLineWidth(this._thickness);
    this.getParentCanvas().setFillColor(this._colour);
    this.getParentCanvas().setStrokeColor(this._colour);
    this.getParentCanvas().setFont(new Font("Sans Serif", Style.FONT_STYLE_PLAIN, 9));
    this.getParentCanvas().drawLineWithAdjust(a._x, a._y, b._x, a._y, this._topLineY, this._bottomLineY);
    this.getParentCanvas().fillText(this._points[0]._window.getYLabel(this._points[0]._val) + " - 0%", a._x, a._y - 2);

    var y = parseInt(o.getY(this._midLineValues[0]), 10);
    this.getParentCanvas().drawLineWithAdjust(a._x, y, b._x, y, this._topLineY, this._bottomLineY);
    this.getParentCanvas().fillText(this._points[0]._window.getYLabel(this._midLineValues[0]) + " - 23.6%", a._x, y - 2);

    y = parseInt(o.getY(this._midLineValues[1]), 10);
    this.getParentCanvas().drawLineWithAdjust(a._x, y, b._x, y, this._topLineY, this._bottomLineY);
    this.getParentCanvas().fillText(this._points[0]._window.getYLabel(this._midLineValues[1]) + " - 38.2%", a._x, y - 2);

    y = parseInt(o.getY(this._midLineValues[2]), 10);
    this.getParentCanvas().drawLineWithAdjust(a._x, y, b._x, y, this._topLineY, this._bottomLineY);
    this.getParentCanvas().fillText(this._points[0]._window.getYLabel(this._midLineValues[2]) + " - 50%", a._x, y - 2);

    y = parseInt(o.getY(this._midLineValues[3]), 10);
    this.getParentCanvas().drawLineWithAdjust(a._x, y, b._x, y, this._topLineY, this._bottomLineY);
    this.getParentCanvas().fillText(this._points[0]._window.getYLabel(this._midLineValues[3]) + " - 61.8%", a._x, y - 2);

    y = parseInt(o.getY(this._midLineValues[4]), 10);    
    this.getParentCanvas().drawLineWithAdjust(a._x, y, b._x, y, this._topLineY, this._bottomLineY);
    this.getParentCanvas().fillText(this._points[0]._window.getYLabel(this._midLineValues[4]) + " - 78.6%", a._x, y - 2);

    this.getParentCanvas().drawLineWithAdjust(a._x, b._y, b._x, b._y, this._topLineY, this._bottomLineY);
    this.getParentCanvas().fillText(this._points[1]._window.getYLabel(this._points[1]._val) + " - 100%", a._x, b._y - 2);

    if (Main.getView() === "tu") {
        y = parseInt(o.getY(this._midLineValues[5]), 10);
        this.getParentCanvas().drawLineWithAdjust(a._x, y, b._x, y, this._topLineY, this._bottomLineY);
        this.getParentCanvas().fillText(this._points[0]._window.getYLabel(this._midLineValues[5]) + " - 161.8%", a._x, y - 2);

        y = parseInt(o.getY(this._midLineValues[6]), 10);
        this.getParentCanvas().drawLineWithAdjust(a._x, y, b._x, y, this._topLineY, this._bottomLineY);
        this.getParentCanvas().fillText(this._points[0]._window.getYLabel(this._midLineValues[6]) + " - 261.8%", a._x, y - 2);

        y = parseInt(o.getY(this._midLineValues[7]), 10);
        this.getParentCanvas().drawLineWithAdjust(a._x, y, b._x, y, this._topLineY, this._bottomLineY);
        this.getParentCanvas().fillText(this._points[0]._window.getYLabel(this._midLineValues[7]) + " - 423.6%", a._x, y - 2);
    } 
    DrawingObject.prototype.draw.call(this);
    if (this._waitDrag)
        this.drawSelectionBox(this._points[this._curPoint-1].getPoint(), this._waitDrag);
}
/** @override */
FibRetracement.prototype.onMouseMove = function(x, y) {
    if (!this.getParentCanvas() || Main.isTouchClient())
        return false;
    this.setPoint(new Point(x, y), this.getParentCanvas()._overlays[this._parent._mouseArea]);
    return true;
}
/** @override */
FibRetracement.prototype.translateOnTouchDrag = function(dx, dy, x, y) {
    this.setPoint(new Point(x, y), this.getParentCanvas()._overlays[this._parent._mouseArea]);
    this._points[this._curPoint - 1].translate(dx, dy);
}
/**
 * @param {Point} p
 */
FibRetracement.prototype.hasSelected = function(p) {
    var a = this._points[0].getPoint();
    var b = this._points[1].getPoint();
    var o = this._points[0]._window;
    if (this.onLine(p, new Point(a._x, a._y), new Point(b._x, a._y)))
        return true;
    var y = parseInt(o.getY(this._midLineValues[0]), 10);
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
    if (Main.getView() === "tu") {
        y = parseInt(o.getY(this._midLineValues[5]), 10);
        if (this.onLine(p, new Point(a._x, y), new Point(b._x, y)))
            return true;
        y = parseInt(o.getY(this._midLineValues[6]), 10);
        if (this.onLine(p, new Point(a._x, y), new Point(b._x, y)))
            return true;
        y = parseInt(o.getY(this._midLineValues[7]), 10);
        if (this.onLine(p, new Point(a._x, y), new Point(b._x, y)))
            return true;
    }
    return this.onLine(p, new Point(a._x, b._y), new Point(b._x, b._y));
}
/** @override */
FibRetracement.prototype.setPoint = function(p, w, index) {
    if (index === undefined)
        index = this._curPoint;
    DrawingObject.prototype.setPoint.call(this, p, w, index);
    this.calcMidValues();
}
/** @override */
FibRetracement.prototype.translate = function(dx, dy) {
    DrawingObject.prototype.translate.call(this, dx, dy);
    this.calcMidValues();
}
FibRetracement.prototype.calcMidValues = function() {
    var diff = this._points[1]._val - this._points[0]._val;
    this._midLineValues[0] = this._points[0]._val + diff * 0.236;        
    this._midLineValues[1] = this._points[0]._val + diff * 0.382;
    this._midLineValues[2] = this._points[0]._val + diff * 0.5;
    this._midLineValues[3] = this._points[0]._val + diff * 0.618;
    this._midLineValues[4] = this._points[0]._val + diff * 0.786;
    if (Main.getView() === "tu") {
        this._midLineValues[5] = this._points[0]._val + diff * 1.618;
        this._midLineValues[6] = this._points[0]._val + diff * 2.618;
        this._midLineValues[7] = this._points[0]._val + diff * 4.236;
    }
}
/** @override */
FibRetracement.prototype.initOtherParams = function() {
    this.calcMidValues();
}
/** @override */
FibRetracement.prototype.copy = function() {
    var other =  DrawingObject.prototype.copy.call(this, new FibRetracement(this._parent, this._type));
    other._midLineValues[0] = this._midLineValues[0];
    other._midLineValues[1] = this._midLineValues[1];
    other._midLineValues[2] = this._midLineValues[2];
    other._midLineValues[3] = this._midLineValues[3];
    other._midLineValues[4] = this._midLineValues[4];
    if (Main.getView() === "tu") {
        other._midLineValues[5] = this._midLineValues[5];
        other._midLineValues[6] = this._midLineValues[6];
        other._midLineValues[7] = this._midLineValues[7];
    }
    return other;
}