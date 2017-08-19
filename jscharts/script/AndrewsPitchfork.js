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
    let other = DrawingObject.prototype.copy.call(this, new AndrewsPitchfork(this._parent, this._type));
    other._length = this._length;
    return other;
}
/**
 * @param {Point} p
 */
AndrewsPitchfork.prototype.hasSelected = function(p) {
    let ends = this.getLineEnds();
    return this.onLine(p, this._points[AndrewsPitchfork.TIP].getPoint(), ends[AndrewsPitchfork.TIP]) || this.onLine(p, this._points[AndrewsPitchfork.ABOVE].getPoint(), ends[AndrewsPitchfork.ABOVE]) || this.onLine(p, this._points[AndrewsPitchfork.BELOW].getPoint(), ends[AndrewsPitchfork.BELOW]);
}
/** @override */
AndrewsPitchfork.prototype.getSelectionPoints = function() {
    let selPoints = DrawingObject.prototype.getSelectionPoints.call(this);
    let ends = this.getLineEnds();
    selPoints.push(ends[AndrewsPitchfork.TIP]);
    return selPoints;
}
AndrewsPitchfork.prototype.getLineEnds = function() {
    let tip = this._points[AndrewsPitchfork.TIP].getPoint();
    let above = this._points[AndrewsPitchfork.ABOVE].getPoint();
    let below = this._points[AndrewsPitchfork.BELOW].getPoint();
    let mid = this.getMidPoint(above, below);
    let hyp = this.magnitude(tip, mid);
    let angle = Math.acos(Math.abs(tip._y - mid._y) / hyp);
    let ends = new Array(3);
    let deltaX = (mid._x > tip._x ? 1 : -1) * parseInt(this._length * Math.sin(angle), 10);
    let deltaY = (mid._y > tip._y ? 1 : -1) * parseInt(this._length * Math.cos(angle), 10);

    ends[AndrewsPitchfork.TIP] = new Point(mid._x + deltaX, mid._y + deltaY);
    ends[AndrewsPitchfork.ABOVE] = new Point(above._x + deltaX, above._y + deltaY);
    ends[AndrewsPitchfork.BELOW] = new Point(below._x + deltaX, below._y + deltaY);

    return ends;
}
/**
 * @param {Point} p
 */
AndrewsPitchfork.prototype.calcLength = function(p) {
    let above = this._points[AndrewsPitchfork.ABOVE].getPoint();
    let below = this._points[AndrewsPitchfork.BELOW].getPoint();
    let mid = this.getMidPoint(above, below);
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
AndrewsPitchfork.prototype.initOtherParams = function(p, w) {
    this._length = parseInt(p[5], 10);
    this._curPoint = AndrewsPitchfork.LENGTH;
}
/** @override */
AndrewsPitchfork.prototype.setPoint = function(p, w, index) {
    if (!index)
        index = this._curPoint;
    if (index === AndrewsPitchfork.LENGTH)
        this.calcLength(p);
    else
        this._points[index].setPoint(p, w);
}
/** @override */
AndrewsPitchfork.prototype.draw = function() {
    let tip = this._points[AndrewsPitchfork.TIP].getPoint();
    let above = this._points[AndrewsPitchfork.ABOVE].getPoint();
    if (!this._parent._canvas)
        return;
    this._parent._canvas.setStrokeColor(this._colour);
    if (this._curPoint < 3) {
        if (this._curPoint === 2)
            this.drawSelectionBox(above);
        this.drawSelectionBox(tip);
    } else {
        let lw = this._parent._canvas._lineWidth;
        this._parent._canvas.setLineWidth(2);
        let below = this._points[AndrewsPitchfork.BELOW].getPoint();
        let ends = this.getLineEnds();
        this._parent._canvas.drawLineWithAdjust(tip._x, tip._y, ends[AndrewsPitchfork.TIP]._x, ends[AndrewsPitchfork.TIP]._y);
        this._parent._canvas.drawLineWithAdjust(above._x, above._y, ends[AndrewsPitchfork.ABOVE]._x, ends[AndrewsPitchfork.ABOVE]._y);
        this._parent._canvas.drawLineWithAdjust(below._x, below._y, ends[AndrewsPitchfork.BELOW]._x, ends[AndrewsPitchfork.BELOW]._y);
        this._parent._canvas.drawLineWithAdjust(above._x, above._y, below._x, below._y);
        
        let extensions = this.extendLine(tip, ends[AndrewsPitchfork.TIP]);
        DrawingUtilities.drawDashedLine(this._parent._canvas, ends[AndrewsPitchfork.TIP]._x, ends[AndrewsPitchfork.TIP]._y, extensions[1]._x, extensions[1]._y);
        extensions = this.extendLine(above, ends[AndrewsPitchfork.ABOVE]);
        DrawingUtilities.drawDashedLine(this._parent._canvas, ends[AndrewsPitchfork.ABOVE]._x, ends[AndrewsPitchfork.ABOVE]._y, extensions[1]._x, extensions[1]._y);
        extensions = this.extendLine(below, ends[AndrewsPitchfork.BELOW]);
        DrawingUtilities.drawDashedLine(this._parent._canvas, ends[AndrewsPitchfork.BELOW]._x, ends[AndrewsPitchfork.BELOW]._y, extensions[1]._x, extensions[1]._y);
        
        this._parent._canvas.setLineWidth(lw);
    }
    DrawingObject.prototype.draw.call(this);
}