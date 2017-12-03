/* global DrawingObject, ChartPoint, Point, Chart, TimeIterator, Main, DrawingUtilities */
/**
 * --------------
 * RaffRegression
 * --------------
 * @constructor
 * @extends {DrawingObject}
 * @param {Chart} p
 * @param {number} t - type
 */
function RaffRegression(p, t) {
    DrawingObject.call(this, p, t);
    this._points = new Array(2);
    this._points[0] = new ChartPoint();
    this._points[1] = new ChartPoint();
    this._offset = 0;
    this._coeffs = new Array(2);
    this._coeffs.fillArrayWithValue(0);
}
/**
 * Inheriting
 */
RaffRegression.prototype = Object.create(DrawingObject.prototype);
RaffRegression.prototype.constructor = RaffRegression;
/** @override */
RaffRegression.prototype.copy = function() {
    var other = DrawingObject.prototype.copy.call(this, new RaffRegression(this._parent, this._type));
    other._coeffs[0] = this._coeffs[0];
    other._coeffs[1] = this._coeffs[1];
    other._offset = this._offset;
    return other;
}
/**
 * @param {Point} p
 */
RaffRegression.prototype.hasSelected = function(p) {
    var start = this._points[0].getPoint();
    var end = this._points[1].getPoint();
    var pp = this.getChannelLines();
    return this.onLine(p, start, end) || this.onLine(p, pp[0], pp[1]) || this.onLine(p, pp[2], pp[3]);
}
RaffRegression.prototype.getChannelLines = function() {
    var p = new Array(4);
    var start = this._points[0].getPoint();
    var end = this._points[1].getPoint();
    p[0] = new Point(start._x, parseInt(this._points[0]._window.getY(this._points[0]._val + this._offset), 10));
    p[1] = new Point(end._x, parseInt(this._points[1]._window.getY(this._points[1]._val + this._offset), 10));
    p[2] = new Point(start._x, parseInt(this._points[0]._window.getY(this._points[0]._val - this._offset), 10));
    p[3] = new Point(end._x, parseInt(this._points[1]._window.getY(this._points[1]._val - this._offset), 10));
    return p;
}
RaffRegression.prototype.setEndValues = function() {
    this._coeffs = this._parent.getSeries(Chart.S_CUR_CLOSE).fitLeastSquares(this._parent.getMasterTimeList(), this._points[0]._t, this._points[1]._t);
    this.calcChannelOffsets();
    this._points[0]._val = this._coeffs[0];
    this._points[1]._val = this._coeffs[0] + this._coeffs[1] * (this._points[1]._t.getTime() - this._points[0]._t.getTime());
}
RaffRegression.prototype.calcChannelOffsets = function() {
    var i = TimeIterator.forwardRangeIterator(this._parent.getMasterTimeList(), this._points[0]._t, this._points[1]._t);
    this._offset = 0;
    var ts = this._points[0]._t.getTime();
    do {
        var curHi = this._parent.getSeries(Chart.S_CUR_HIGH).get(i._d);
        var curLo = this._parent.getSeries(Chart.S_CUR_LOW).get(i._d);
        var curLinReg = this._coeffs[0] + this._coeffs[1] * (i._d.getTime() - ts);
        this._offset = Math.max(Math.abs(curHi - curLinReg), this._offset);
        this._offset = Math.max(Math.abs(curLinReg - curLo), this._offset);
    } while (i.move());
}
/** @override */
RaffRegression.prototype.initOtherParams = function() {
    this.setEndValues();
}
/** @override */
RaffRegression.prototype.translate = function(dx, dy) {
    DrawingObject.prototype.translate.call(this, dx, dy);
    this.setEndValues();
}
/** @override */
RaffRegression.prototype.setPoint = function(p, w, index) {
    if (index === undefined)
        index = this._curPoint;
    DrawingObject.prototype.setPoint.call(this, p, w, index);
    if (this._curPoint > 0)
        this.setEndValues();
}
/** @override */
RaffRegression.prototype.draw = function() {
    if (!this.getParentCanvas())
        return;
    var start = this._points[0].getPoint();
    var end = this._points[1].getPoint();
    var channels = this.getChannelLines();
    this.getParentCanvas().setStrokeColor(this._colour);
    
    if (Main.isTouchClient() && this._curPoint == 1) {
        this.drawSelectionBox(this._points[0].getPoint(), this._waitDrag);
        return;
    }
    
    var lw = this.getParentCanvas()._lineWidth;
    this.getParentCanvas().setLineWidth(2);
    this.getParentCanvas().drawLineWithAdjust(start._x, start._y, end._x, end._y, this._parent._drawY, this._parent._drawY + this._parent._drawHeight);
    this.getParentCanvas().drawLineWithAdjust(channels[0]._x, channels[0]._y, channels[1]._x, channels[1]._y, this._parent._drawY, this._parent._drawY + this._parent._drawHeight);
    this.getParentCanvas().drawLineWithAdjust(channels[2]._x, channels[2]._y, channels[3]._x, channels[3]._y, this._parent._drawY, this._parent._drawY + this._parent._drawHeight);

    // Draw extended lines out from calculation area in a lighter colour.
    this.getParentCanvas().setLineWidth(this._thickness);
    var ends = this.extendLine(start, end);
    DrawingUtilities.drawDashedLine(this.getParentCanvas(), ends[0]._x, ends[0]._y, start._x, start._y, 4, 8, this._parent._drawY, this._parent._drawY + this._parent._drawHeight);
    DrawingUtilities.drawDashedLine(this.getParentCanvas(), end._x, end._y, ends[1]._x, ends[1]._y, 4, 8, this._parent._drawY, this._parent._drawY + this._parent._drawHeight);
    ends = this.extendLine(channels[0], channels[1]);
    DrawingUtilities.drawDashedLine(this.getParentCanvas(), ends[0]._x, ends[0]._y, channels[0]._x, channels[0]._y, 4, 8, this._parent._drawY, this._parent._drawY + this._parent._drawHeight);
    DrawingUtilities.drawDashedLine(this.getParentCanvas(), channels[1]._x, channels[1]._y, ends[1]._x, ends[1]._y, 4, 8, this._parent._drawY, this._parent._drawY + this._parent._drawHeight);
    ends = this.extendLine(channels[2], channels[3]);
    DrawingUtilities.drawDashedLine(this.getParentCanvas(), ends[0]._x, ends[0]._y, channels[2]._x, channels[2]._y, 4, 8, this._parent._drawY, this._parent._drawY + this._parent._drawHeight);
    DrawingUtilities.drawDashedLine(this.getParentCanvas(), channels[3]._x, channels[3]._y, ends[1]._x, ends[1]._y, 4, 8, this._parent._drawY, this._parent._drawY + this._parent._drawHeight);

    DrawingObject.prototype.draw.call(this);
    this.getParentCanvas().setLineWidth(lw);
    if (this._waitDrag)
        this.drawSelectionBox(this._points[this._curPoint-1].getPoint(), this._waitDrag);
}
/** @override */
RaffRegression.prototype.translateOnTouchDrag = function(dx, dy, x, y) {
    this.setPoint(new Point(x, y), this.getParentCanvas()._overlays[this._parent._mouseArea]);
    this._points[this._curPoint - 1].translate(dx, dy);
}
/** @override */
RaffRegression.prototype.onMouseMove = function(x, y) {
    if (!this.getParentCanvas() || Main.isTouchClient())
        return false;
    this.setPoint(new Point(x, y), this.getParentCanvas()._overlays[this._parent._mouseArea]);
    return true;
}