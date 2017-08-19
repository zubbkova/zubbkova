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
    this._coeffs.fill(0);
}
/**
 * Inheriting
 */
RaffRegression.prototype = Object.create(DrawingObject.prototype);
RaffRegression.prototype.constructor = RaffRegression;
/** @override */
RaffRegression.prototype.copy = function() {
    let other = DrawingObject.prototype.copy.call(this, new RaffRegression(this._parent, this._type));
    other._coeffs[0] = this._coeffs[0];
    other._coeffs[1] = this._coeffs[1];
    other._offset = this._offset;
    return other;
}
/**
 * @param {Point} p
 */
RaffRegression.prototype.hasSelected = function(p) {
    let start = this._points[0].getPoint();
    let end = this._points[1].getPoint();
    let pp = this.getChannelLines();
    return this.onLine(p, start, end) || this.onLine(p, pp[0], pp[1]) || this.onLine(p, pp[2], pp[3]);
}
RaffRegression.prototype.getChannelLines = function() {
    let p = new Array(4);
    let start = this._points[0].getPoint();
    let end = this._points[1].getPoint();
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
    let i = TimeIterator.forwardRangeIterator(this._parent.getMasterTimeList(), this._points[0]._t, this._points[1]._t);
    this._offset = 0;
    let ts = this._points[0]._t.getTime();
    do {
        let curHi = this._parent.getSeries(Chart.S_CUR_HIGH).get(i._d);
        let curLo = this._parent.getSeries(Chart.S_CUR_LOW).get(i._d);
        let curLinReg = this._coeffs[0] + this._coeffs[1] * (i._d.getTime() - ts);
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
    if (!index)
        index = this._curPoint;
    DrawingObject.prototype.setPoint.call(this, p, w, index);
    if (this._curPoint > 0)
        this.setEndValues();
}
/** @override */
RaffRegression.prototype.draw = function() {
    if (!this._parent._canvas)
        return;
    let start = this._points[0].getPoint();
    let end = this._points[1].getPoint();
    let channels = this.getChannelLines();
    this._parent._canvas.setStrokeColor(this._colour);
    
    let lw = this._parent._canvas._lineWidth;
    this._parent._canvas.setLineWidth(2);
    this._parent._canvas.drawLineWithAdjust(start._x, start._y, end._x, end._y);
    this._parent._canvas.drawLineWithAdjust(channels[0]._x, channels[0]._y, channels[1]._x, channels[1]._y);
    this._parent._canvas.drawLineWithAdjust(channels[2]._x, channels[2]._y, channels[3]._x, channels[3]._y);

    // Draw extended lines out from calculation area in a lighter colour.
    this._parent._canvas.setLineWidth(this._thickness);
    let ends = this.extendLine(start, end);
    DrawingUtilities.drawDashedLine(this._parent._canvas, ends[0]._x, ends[0]._y, start._x, start._y);
    DrawingUtilities.drawDashedLine(this._parent._canvas, end._x, end._y, ends[1]._x, ends[1]._y);
    ends = this.extendLine(channels[0], channels[1]);
    DrawingUtilities.drawDashedLine(this._parent._canvas, ends[0]._x, ends[0]._y, channels[0]._x, channels[0]._y);
    DrawingUtilities.drawDashedLine(this._parent._canvas, channels[1]._x, channels[1]._y, ends[1]._x, ends[1]._y);
    ends = this.extendLine(channels[2], channels[3]);
    DrawingUtilities.drawDashedLine(this._parent._canvas, ends[0]._x, ends[0]._y, channels[2]._x, channels[2]._y);
    DrawingUtilities.drawDashedLine(this._parent._canvas, channels[3]._x, channels[3]._y, ends[1]._x, ends[1]._y);

    DrawingObject.prototype.draw.call(this);
    this._parent._canvas.setLineWidth(lw);
}