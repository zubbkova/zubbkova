/* eslint no-unused-vars: "off" */
/* global DrawingObject, ChartPoint, Main, Point, Polygon */
/**
 * -----
 * Arrow
 * -----
 * @constructor
 * @extends {DrawingObject}
 * @param {Chart} p
 * @param {number} t - type
 */
function Arrow(p, t) {
    DrawingObject.call(this, p, t);
    this._horiz = false;
    this._points = new Array(2);
    this._points[0] = new ChartPoint();
    this._points[1] = new ChartPoint();
}
/**
 * Inheriting
 */
Arrow.prototype = Object.create(DrawingObject.prototype);
Arrow.prototype.constructor = Arrow;
/** @static */
Arrow.ARROW_WIDTH = 12;
/** @static */
Arrow.ARROW_LENGTH = 16;
/** @override */
Arrow.prototype.copy = function() {
    var other =  DrawingObject.prototype.copy.call(this, new Arrow(this._parent, this._type));
    other._horiz = this._horiz;
    return other;
}
/** @override */
Arrow.prototype.onMouseMove = function(x, y) {
    if (!this.getParentCanvas() || Main.isTouchClient())
        return false;
    this.setPoint(new Point(x, y), this.getParentCanvas()._overlays[this._parent._mouseArea], 1);
}
/** @override */
Arrow.prototype.onMouseDrag = function(x, y) {
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
 * Given a point calculate what orientation the arrow should be pointing in. 
 * @param {Point} p
 */
Arrow.prototype.getEndPoint = function(p) {
    var aa = this._points[0].getPoint();
    var cc = new Point();
    var angle = this.angle(aa, p);
    if (aa._x === p._x) {
        this._horiz = false;
        cc._x = aa._x;
        cc._y = aa._y + (p._y > aa._y ? 1 : -1) * (Arrow.ARROW_WIDTH + Arrow.ARROW_LENGTH);
    } else {
        if (angle > (Math.PI / 4)) {
            this._horiz = false;
            cc._x = aa._x;
            cc._y = aa._y + (p._y > aa._y ? 1 : -1) * (Arrow.ARROW_WIDTH + Arrow.ARROW_LENGTH); 
        } else {
            this._horiz = true;
            cc._x = aa._x + (p._x > aa._x ? 1 : -1) * (Arrow.ARROW_WIDTH + Arrow.ARROW_LENGTH); 
            cc._y = aa._y;
        }
    }
    return cc;
}
/**
 * @param {Point} p
 */
Arrow.prototype.hasSelected = function(p) {
    return this.getArrowShape().contains(p);
}
Arrow.prototype.getArrowShape = function() {
    var aa = this._points[0].getPoint();
    var bb = this._points[1].getPoint();
    var shape = new Polygon();
    if (this._horiz) {
        if (aa._x < bb._x) {
            shape.addPoint(aa._x, aa._y);
            shape.addPoint(aa._x + Arrow.ARROW_WIDTH, aa._y - Arrow.ARROW_WIDTH);
            shape.addPoint(aa._x + Arrow.ARROW_WIDTH, aa._y - Arrow.ARROW_WIDTH / 2);
            shape.addPoint(bb._x, aa._y - Arrow.ARROW_WIDTH / 2);
            shape.addPoint(bb._x, aa._y + Arrow.ARROW_WIDTH / 2);
            shape.addPoint(aa._x + Arrow.ARROW_WIDTH, aa._y + Arrow.ARROW_WIDTH / 2);
            shape.addPoint(aa._x + Arrow.ARROW_WIDTH, aa._y + Arrow.ARROW_WIDTH);
        }
        else
        {
            shape.addPoint(aa._x, aa._y);
            shape.addPoint(aa._x - Arrow.ARROW_WIDTH, aa._y - Arrow.ARROW_WIDTH);
            shape.addPoint(aa._x - Arrow.ARROW_WIDTH, aa._y - Arrow.ARROW_WIDTH / 2);
            shape.addPoint(bb._x, aa._y - Arrow.ARROW_WIDTH / 2);
            shape.addPoint(bb._x, aa._y + Arrow.ARROW_WIDTH / 2);
            shape.addPoint(aa._x - Arrow.ARROW_WIDTH, aa._y + Arrow.ARROW_WIDTH / 2);
            shape.addPoint(aa._x - Arrow.ARROW_WIDTH, aa._y + Arrow.ARROW_WIDTH);
        }
    }
    else
    {
        if (aa._y < bb._y)
        {
            shape.addPoint(aa._x, aa._y);
            shape.addPoint(aa._x + Arrow.ARROW_WIDTH, aa._y + Arrow.ARROW_WIDTH);
            shape.addPoint(aa._x + Arrow.ARROW_WIDTH / 2, aa._y + Arrow.ARROW_WIDTH);
            shape.addPoint(aa._x + Arrow.ARROW_WIDTH / 2, bb._y);
            shape.addPoint(aa._x - Arrow.ARROW_WIDTH / 2, bb._y);
            shape.addPoint(aa._x - Arrow.ARROW_WIDTH / 2, aa._y + Arrow.ARROW_WIDTH);
            shape.addPoint(aa._x - Arrow.ARROW_WIDTH, aa._y + Arrow.ARROW_WIDTH);
        }
        else
        {
            shape.addPoint(aa._x, aa._y);
            shape.addPoint(aa._x + Arrow.ARROW_WIDTH, aa._y - Arrow.ARROW_WIDTH);
            shape.addPoint(aa._x + Arrow.ARROW_WIDTH / 2, aa._y - Arrow.ARROW_WIDTH);
            shape.addPoint(aa._x + Arrow.ARROW_WIDTH / 2, bb._y);
            shape.addPoint(aa._x - Arrow.ARROW_WIDTH / 2, bb._y);
            shape.addPoint(aa._x - Arrow.ARROW_WIDTH / 2, aa._y - Arrow.ARROW_WIDTH);
            shape.addPoint(aa._x - Arrow.ARROW_WIDTH, aa._y - Arrow.ARROW_WIDTH);
        }
    }
    return shape;
}
/** @override */
Arrow.prototype.draw = function() {
    if (!this.getParentCanvas())
        return;
    if (this._curPoint == 1 && Main.isTouchClient()) {
        this.drawSelectionBox(this._points[0].getPoint(), this._waitDrag);
        return;
    }
    this.setPoint(this.getEndPoint(this._points[1].getPoint()), this._points[1]._window, 1);
    this.getParentCanvas().setLineWidth(this._thickness);
    this.getParentCanvas().setFillColor(this._colour);
    var shape = this.getArrowShape();
    this.getParentCanvas().fillPolygon(shape, this._topLineY, this._bottomLineY);
    DrawingObject.prototype.draw.call(this);
}
/** @override */
Arrow.prototype.translateOnTouchDrag = function(dx, dy, x, y) {
    if (this._curPoint == 1) {
        this._points[this._curPoint - 1].translate(dx, dy);
    } else {
        this.translate(dx, dy);
    }
}
/** @override */
Arrow.prototype.getStringForm = function() {
    return DrawingObject.prototype.getStringForm.call(this) + ":" + (this._horiz ? "1" : "0");
}
/** @override */
Arrow.prototype.initOtherParams = function(p) {
    this._horiz = p[4] === "1";
}