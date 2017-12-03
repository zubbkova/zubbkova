/* global DrawingObject, ChartPoint, Point, DrawingUtilities, Chart */
/**
 * ----------------
 * AndrewsPitchfork
 * ----------------
 * @constructor
 * @extends {DrawingObject}
 * @param {Chart} p
 * @param {number} t - type
 */
function AndrewsPitchfork(p, t) {
    DrawingObject.call(this, p, t);
    this._points = new Array(3);
    this._points[0] = new ChartPoint();
    this._points[1] = new ChartPoint();
    this._points[2] = new ChartPoint();
    this._length = 0;
}
/**
 * Inheriting
 */
AndrewsPitchfork.prototype = Object.create(DrawingObject.prototype);
AndrewsPitchfork.prototype.constructor = AndrewsPitchfork;
/** @static */
AndrewsPitchfork.TIP = 0;
/** @static */
AndrewsPitchfork.ABOVE = 1;
/** @static */
AndrewsPitchfork.BELOW = 2;
/** @static */
AndrewsPitchfork.LENGTH = 3;
/** @override */
AndrewsPitchfork.prototype.copy = function() {
    var other = DrawingObject.prototype.copy.call(this, new AndrewsPitchfork(this._parent, this._type));
    other._length = this._length;
    return other;
}
/**
 * @param {Point} p
 */
AndrewsPitchfork.prototype.hasSelected = function(p) {
    var ends = this.getLineEnds();
    return this.onLine(p, this._points[AndrewsPitchfork.TIP].getPoint(), ends[AndrewsPitchfork.TIP]) || this.onLine(p, this._points[AndrewsPitchfork.ABOVE].getPoint(), ends[AndrewsPitchfork.ABOVE]) || this.onLine(p, this._points[AndrewsPitchfork.BELOW].getPoint(), ends[AndrewsPitchfork.BELOW]);
}
/** @override */
AndrewsPitchfork.prototype.getSelectionPoints = function() {
    var selPoints = DrawingObject.prototype.getSelectionPoints.call(this);
    var ends = this.getLineEnds();
    selPoints.push(ends[AndrewsPitchfork.TIP]);
    return selPoints;
}
AndrewsPitchfork.prototype.getLineEnds = function() {
    if (this._length == 0)
        return;
    var tip = this._points[AndrewsPitchfork.TIP].getPoint();
    var above = this._points[AndrewsPitchfork.ABOVE].getPoint();
    var below = this._points[AndrewsPitchfork.BELOW].getPoint();
    var mid = this.getMidPoint(above, below);
    var hyp = this.magnitude(tip, mid);
    var angle = Math.acos(Math.abs(tip._y - mid._y) / hyp);
    var ends = new Array(3);
    var deltaX = (mid._x > tip._x ? 1 : -1) * parseInt(this._length * Math.sin(angle), 10);
    var deltaY = (mid._y > tip._y ? 1 : -1) * parseInt(this._length * Math.cos(angle), 10);

    ends[AndrewsPitchfork.TIP] = new Point(mid._x + deltaX, mid._y + deltaY);
    ends[AndrewsPitchfork.ABOVE] = new Point(above._x + deltaX, above._y + deltaY);
    ends[AndrewsPitchfork.BELOW] = new Point(below._x + deltaX, below._y + deltaY);

    return ends;
}
/**
 * @param {Point} p
 */
AndrewsPitchfork.prototype.calcLength = function(p) {
    var above = this._points[AndrewsPitchfork.ABOVE].getPoint();
    var below = this._points[AndrewsPitchfork.BELOW].getPoint();
    var mid = this.getMidPoint(above, below);
    this._length = parseInt(this.magnitude(mid, p), 10);
}
/** @override */
AndrewsPitchfork.prototype.addPoint = function(p, w) {
    if (this._curPoint === AndrewsPitchfork.LENGTH) {
        this.calcLength(p);
        return true;
    }
    DrawingObject.prototype.addPoint.call(this, p, w);
    return false;
}
/** @override */
AndrewsPitchfork.prototype.getStringForm = function() {
    return DrawingObject.prototype.getStringForm.call(this) + ":" + this._length;
}
/** @override */
AndrewsPitchfork.prototype.initOtherParams = function(p) {
    this._length = parseInt(p[5], 10);
    this._curPoint = AndrewsPitchfork.LENGTH;
}
/** @override */
AndrewsPitchfork.prototype.setPoint = function(p, w, index) {
    if (typeof index == 'undefined')
        index = this._curPoint;
    if (index === AndrewsPitchfork.LENGTH)
        this.calcLength(p);
    else
        this._points[index].setPoint(p, w);
}
/** @override */
AndrewsPitchfork.prototype.draw = function() {
    var tip = this._points[AndrewsPitchfork.TIP].getPoint();
    var above = this._points[AndrewsPitchfork.ABOVE].getPoint();
    if (!this.getParentCanvas())
        return;
    this.getParentCanvas().setStrokeColor(this._colour);
    if (this._curPoint < AndrewsPitchfork.LENGTH) {
        if (this._curPoint === AndrewsPitchfork.BELOW)
            this.drawSelectionBox(above, this._waitDrag);
        this.drawSelectionBox(tip, this._waitDrag && this._curPoint-1 == AndrewsPitchfork.TIP);
    } else {
        if (this._curPoint === AndrewsPitchfork.LENGTH && this._waitDrag)
            this.drawSelectionBox(this._points[AndrewsPitchfork.BELOW].getPoint(), this._waitDrag);
        
        var lw = this.getParentCanvas()._lineWidth;
        var below = this._points[AndrewsPitchfork.BELOW].getPoint();
        var ends = this.getLineEnds();
        if (typeof ends == 'undefined') {
            this.onMouseMove(below._x, below._y);
            return;
        }
        this.getParentCanvas().setLineWidth(2);
        this.getParentCanvas().drawLineWithAdjust(tip._x, tip._y, ends[AndrewsPitchfork.TIP]._x, ends[AndrewsPitchfork.TIP]._y, this._parent._drawY, this._parent._drawY + this._parent._drawHeight);
        this.getParentCanvas().drawLineWithAdjust(above._x, above._y, ends[AndrewsPitchfork.ABOVE]._x, ends[AndrewsPitchfork.ABOVE]._y, this._parent._drawY, this._parent._drawY + this._parent._drawHeight);
        this.getParentCanvas().drawLineWithAdjust(below._x, below._y, ends[AndrewsPitchfork.BELOW]._x, ends[AndrewsPitchfork.BELOW]._y, this._parent._drawY, this._parent._drawY + this._parent._drawHeight);
        this.getParentCanvas().drawLineWithAdjust(above._x, above._y, below._x, below._y, this._parent._drawY, this._parent._drawY + this._parent._drawHeight);
        
        this.getParentCanvas().setLineWidth(1);
        var extensions = this.extendLine(tip, ends[AndrewsPitchfork.TIP]);
        DrawingUtilities.drawDashedLine(this.getParentCanvas(), ends[AndrewsPitchfork.TIP]._x, ends[AndrewsPitchfork.TIP]._y, extensions[1]._x, extensions[1]._y, 4, 8, this._parent._drawY, this._parent._drawY + this._parent._drawHeight);
        extensions = this.extendLine(above, ends[AndrewsPitchfork.ABOVE]);
        DrawingUtilities.drawDashedLine(this.getParentCanvas(), ends[AndrewsPitchfork.ABOVE]._x, ends[AndrewsPitchfork.ABOVE]._y, extensions[1]._x, extensions[1]._y, 4, 8, this._parent._drawY, this._parent._drawY + this._parent._drawHeight);
        extensions = this.extendLine(below, ends[AndrewsPitchfork.BELOW]);
        DrawingUtilities.drawDashedLine(this.getParentCanvas(), ends[AndrewsPitchfork.BELOW]._x, ends[AndrewsPitchfork.BELOW]._y, extensions[1]._x, extensions[1]._y, 4, 8, this._parent._drawY, this._parent._drawY + this._parent._drawHeight);
        
        this.getParentCanvas().setLineWidth(lw);
    }
    DrawingObject.prototype.draw.call(this);
}
AndrewsPitchfork.prototype.getTooltip = function() {
    if (this._curPoint == AndrewsPitchfork.LENGTH && typeof this._waitDrag != 'undefined' && !this._waitDrag)
        return Chart.T_NONE;
    return DrawingObject.prototype.getTooltip.call(this);
}