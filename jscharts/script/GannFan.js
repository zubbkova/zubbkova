/* global DrawingObject, ChartPoint, Point, Main, Color */
/**
 * -------
 * GannFan
 * -------
 * @constructor
 * @extends {DrawingObject}
 * @param {Chart} p
 * @param {number} t - type
 */
function GannFan(p, t) {
    DrawingObject.call(this, p, t);
    this._points = new Array(2);
    this._points[0] = new ChartPoint();
    this._points[1] = new ChartPoint();
    this._signX = 0;
    this.signY = 0;
}
/**
 * Inheriting
 */
GannFan.prototype = Object.create(DrawingObject.prototype);
GannFan.prototype.constructor = GannFan;
/** @static */
GannFan.angles = [7, 15, 18.75, 26.25, 45, 63.75, 71.25, 75, 82.5];
/** @static */
GannFan.ROOT_2 = Math.sqrt(2);
/** @override */
GannFan.prototype.copy = function() {
    return DrawingObject.prototype.copy.call(this, new GannFan(this._parent, this._type));
}
/** @override */
GannFan.prototype.onMouseDownPre = function(x, y) {
    if (!this.getParentCanvas())
        return false;
    return this.addPoint(this._curPoint === 0 ? new Point(x, y) : this.getEndPoint(new Point(x, y)), this.getParentCanvas()._overlays[this._parent._mouseArea]);
}
/** @override */
GannFan.prototype.onMouseMove = function(x, y) {
    if (!this.getParentCanvas())
        return false;
    this.setPoint(this.getEndPoint(new Point(x, y)), this.getParentCanvas()._overlays[this._parent._mouseArea], 1);
    return true;
}
/** @override */
GannFan.prototype.onMouseDrag = function(x, y) {
    if (!this.getParentCanvas())
        return false;
    if (this._selectedPoint === 1) {
        this.setPoint(this.getEndPoint(new Point(x, y)), this.getParentCanvas()._overlays[this._parent._mouseArea], 1);
    } else {
        this.translate(x - this._parent._mouseOldX, y - this._parent._mouseOldY);
    }
    return true;
}
/**
 * @param {Point} p
 */
GannFan.prototype.hasSelected = function(p) {
    return this.getRect(this._points[0], this._points[1]).contains(p);
}
/**
 * @param {Point} p
 */
GannFan.prototype.getEndPoint = function(p) {
    var aa = this._points[0].getPoint();
    var cc = new Point();
    var length = parseInt(this.magnitude(aa, p) / GannFan.ROOT_2, 10);
    this.setSigns(aa, p);
    // We need to correct for the fact that the sizes of one time unit
    // and one unit of value are different.
    var aspectRatio = this._parent._currentSymbol._numTimeUnits / this._points[0]._window._ySpread;
    cc._x = aa._x + this._signX * parseInt(length / aspectRatio, 10);
    cc._y = aa._y + this._signY * length;
    return cc;
}
/**
 * @param {Point} a
 * @param {Point} b
 */
GannFan.prototype.setSigns = function(a, b) {
    var deltaX = b._x - a._x, deltaY = b._y - a._y;
    this._signX = deltaX >= 0 ? 1 : -1;
    this._signY = deltaY >= 0 ? 1 : -1;
}
/** @override */
GannFan.prototype.draw = function() {
    if (!this.getParentCanvas())
        return;
    if (Main.isTouchClient() && this._curPoint == 1) {
        this.drawSelectionBox(this._points[0].getPoint(), this._waitDrag);
        return;
    }
    // Draw box if selected.
    this.getParentCanvas().setLineWidth(this._thickness);
    if ((!Main.isTouchClient() && (this._selected || this._curPoint === 1)) || this._waitDrag) {
        var box = this.getRect(this._points[0], this._points[1]);
        this.getParentCanvas().setStrokeColor(Color.lightGray);
        this.getParentCanvas().drawRectWithAdjust(box._x, box._y, box._width, box._height, this._topLineY, this._bottomLineY);
    }
    this.getParentCanvas().setStrokeColor(this._colour);
    var a = this._points[0].getPoint();
    var b = this._points[1].getPoint();
    var length = parseInt(GannFan.ROOT_2 * Math.abs(a._y - b._y), 10);
    this.setSigns(a, b);

    // We need to correct for the fact that the sizes of one time unit
    // and one unit of value are different.
    var aspectRatio = this._parent._currentSymbol._numTimeUnits / this._points[0]._window._ySpread;
    for (var i = 0; i < GannFan.angles.length; i++) {
        var angle = (Math.PI / 2.0) * (GannFan.angles[i] / 90.0);
        var x = this._signX * parseInt(length * Math.cos(angle) / aspectRatio, 10);
        var y = this._signY * parseInt(length * Math.sin(angle), 10);
        this.getParentCanvas().drawLineWithAdjust(a._x, a._y, a._x + x, a._y + y, this._topLineY, this._bottomLineY);
    }
    DrawingObject.prototype.draw.call(this);
    if (this._waitDrag)
        this.drawSelectionBox(this._points[this._curPoint-1].getPoint(), this._waitDrag);
}
GannFan.prototype.onMouseMove = function(x, y) {
    if (!this.getParentCanvas() || Main.isTouchClient())
        return false;
    this.setPoint(new Point(x, y), this.getParentCanvas()._overlays[this._parent._mouseArea]);
    return true;
}