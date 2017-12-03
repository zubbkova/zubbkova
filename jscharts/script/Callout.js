/* global DrawText, ChartPoint, Color, DrawingObject, Main, Overlay_TimePos */
/**
 * -------
 * Callout
 * -------
 * Freeform text object.
 * @constructor
 * @extends {DrawText}
 * @param {Chart} p
 * @param {number} t - type
 */
function Callout(p, t) {
    DrawText.call(this, p, t);
    this._points = new Array(3);
    this._points[0] = new ChartPoint();
    this._points[1] = new ChartPoint();
    this._points[2] = new ChartPoint();
    this._centre = new ChartPoint();
}
/**
 * Inheriting
 */
Callout.prototype = Object.create(DrawText.prototype);
Callout.prototype.constructor = Callout;
/** @static */
Callout.defaultCol = new Color(255, 254, 220);
/** @override */
Callout.prototype.copy = function() {
    var other = DrawingObject.prototype.copy.call(this, new Callout(this._parent, this._type));
    other._string = this._string;
    other._centre = this._centre;
    return other;
}
/**
 * @param {Point} p
 */
Callout.prototype.hasSelected = function(p) {
    if (DrawText.prototype.hasSelected.call(this, p))
        return true;
    return this.onLine(p, this._points[2], this._centre);
}
/** @override */
Callout.prototype.draw = function() {
    var box = this.getRect(this._points[0], this._points[1]);
    if (!this.getParentCanvas())
        return;
    this.getParentCanvas().setLineWidth(this._thickness);
    this.getParentCanvas().setStrokeColor(Color.black);
    
    if ((this._curPoint == 1 && !Main.isTouchClient()) || this._curPoint > 1) {
        this.getParentCanvas().drawRectWithAdjust(box._x, box._y, box._width, box._height, this._topLineY, this._bottomLineY);
    }
    if ((this._curPoint > 1 && !Main.isTouchClient()) || (this._curPoint > 2 && Main.isTouchClient())) {
        var c = this._points[2].getPoint();
        var d = this._centre.getPoint();
        if (c && d)
            this.getParentCanvas().drawLineWithAdjust(c._x, c._y, d._x, d._y, this._topLineY, this._bottomLineY);
    }
    if ((this._curPoint == 1 && !Main.isTouchClient()) || this._curPoint > 1) {
        this.getParentCanvas().setFillColor(Callout.defaultCol);
        this.getParentCanvas().fillRectWithAdjust(box._x + 1, box._y + 1, box._width - 2, box._height - 2, this._topLineY, this._bottomLineY);
    }
    DrawText.prototype.draw.call(this);
}
/** @override */
Callout.prototype.translate = function(dx, dy) {
    this._points[0].translate(dx, dy);
    this._points[1].translate(dx, dy);
    this._centre.translate(dx, dy);
}
/** @override */
Callout.prototype.getStringForm = function() {
    return DrawText.prototype.getStringForm.call(this) + ":" + this._centre.stringRep();
}
/** @override */
Callout.prototype.initOtherParams = function(p, w) {
    this._string = p[5].replace("\\n", "\n");
    this._centre = new ChartPoint(p[6], w);
    this._curPoint = 2;
    this.recalcLines();
}
/** @override */
Callout.prototype.setPoint = function(p, w, index) {
    if (index === undefined)
        index = this._curPoint;
    DrawText.prototype.setPoint.call(this, p, w, index);
    if (this._curPoint > 0) {
        if (index === 0 || index === 1) {
            this._centre._tp = new Overlay_TimePos(new Date(Math.min(this._points[0]._t.getTime(), this._points[1]._t.getTime()) +
                Math.abs(this._points[0]._t.getTime() - this._points[1]._t.getTime()) / 2), 0.0);
            this._centre._t = this._centre._tp._d;
            this._centre._val = Math.min(this._points[0]._val, this._points[1]._val) + 0.5 * Math.abs(this._points[0]._val - this._points[1]._val);
            this._centre._window = this._points[0]._window;
        }
    }
}