/**
 * ------------
 * CRetracement
 * ------------
 * @constructor
 * @extends {DrawingObject}
 * @param {Chart} p
 * @param {number} t - type
 */
function CRetracement(p, t) {
    DrawingObject.call(this, p, t);
    this._fractions = [];
    this._lineValues = [];
    this._points = new Array(2);
    this._points[0] = new ChartPoint();
    this._points[1] = new ChartPoint();
    this.setOrder(3);
}
/**
 * Inheriting
 */
CRetracement.prototype = Object.create(DrawingObject.prototype);
CRetracement.prototype.constructor = CRetracement;
/** @override */
CRetracement.prototype.copy = function() {
    let other = DrawingObject.prototype.copy.call(this, new CRetracement(this._parent, this._type));
    other.setOrder(this._order);
    return other;
}
/** @override */
CRetracement.prototype.onMouseDoubleClick = function(x, y) {
    let l = [Language.getString("drawingtools_order")];
    let v = [this._order.toString()];
    let d = new ParamDialog("modal", this._parent, l, v);
    let pAbs = this._parent.getAbsoluteLocation();
    let lx = pAbs._x + x;
    let ly =  pAbs._y + y - d._height - 10;
    if (lx + d._width > this._parent._drawX + this._parent._drawWidth)
        lx = this._parent._drawX + this._parent._drawWidth - d._width;
    if (ly + d._height > this._parent._drawY + this._parent._drawHeight)
        lx = this._parent._drawY + this._parent._drawHeight - d._height;
    d.setLocation(lx, ly);
    d.setModal(true);
    return true;
}
/**
 * @param {Array} o
 */
CRetracement.prototype.handleDialogResult = function(o) {
    try {
        this.setOrder(parseInt(o[0], 10));
        this._parent.repaint();
        this._parent.process();
    } catch (e) {
        
    }
}
/**
 * @param {Point} p
 */
CRetracement.prototype.hasSelected = function(p) {
    let lines = this.getLines();
    for (let i = 0; i < lines.length; i++) {
        if (this.onLine(p, lines[i][0], lines[i][1]))
            return true;
    }
    return false;
}
/**
 * @param {number} o
 */
CRetracement.prototype.setOrder = function(o) {
    this._order = Math.max(o, 2);
    this._fractions = [];
    this._fractions.push(new Fraction(0, 1));
    this._fractions.push(new Fraction(1, 1));
    for (let d = this._order; d >= 2; d--) {
        for (let n = 1; n < d; n++) {
            let f = new Fraction(n, d);
            if (f._denom === d)
                this._fractions.push(f);
        }
    }
    this.calcLineValues();
    this._parent.repaint();
}
CRetracement.prototype.getLines = function() {
    let lines = new Array(this._fractions.length);
    let o = this._points[0]._window;
    let xStart = this._points[0].getPoint()._x;
    let xEnd = this._points[1].getPoint()._x;
    for (let i = 0; i < this._fractions.length; i++) {
        let yVal = parseInt(o.getY(this._lineValues[i]), 10);
        lines[i] = new Array(2);
        lines[i][0] = (new Point(xStart, yVal));
        lines[i][1] = (new Point(xEnd, yVal));
    }
    return lines;
}
/** @override */
CRetracement.prototype.setPoint = function(p, w, index) {
    if (!index)
        index = this._curPoint;
    DrawingObject.prototype.setPoint.call(this, p, w, index);
    this.calcLineValues();
}
/** @override */
CRetracement.prototype.translate = function(dx, dy) {
    DrawingObject.prototype.translate.call(this, dx, dy);
    this.calcLineValues();
}
CRetracement.prototype.calcLineValues = function() {
    this._lineValues = new Array(this._fractions.length);
    let diff = this._points[1]._val - this._points[0]._val; 
    for (let i = 0; i < this._fractions.length; i++) {
        let f = this._fractions[i];
        this._lineValues[i] = this._points[0]._val + diff * f.getDecimal();
    }
}
/** @override */
CRetracement.prototype.getStringForm = function() {
    return DrawingObject.prototype.getStringForm.call(this) + ":" + this._order;
}
/** @override */
CRetracement.prototype.initOtherParams = function(p, w) {
    this.setOrder(parseInt(p[4], 10));
}
/** @override */
CRetracement.prototype.draw = function() {
    if (!this._parent._canvas)
        return;
    this._parent._canvas.setLineWidth(this._thickness);
    this._parent._canvas.setFillColor(this._colour);
    this._parent._canvas.setStrokeColor(this._colour);
    this._parent._canvas.setFont(new Font("Sans Serif", Style.FONT_STYLE_PLAIN, 9));
    let lines = this.getLines();
    let o = this._points[0]._window;
    for (let i = 0; i < lines.length; i++) {
        this._parent._canvas.drawLineWithAdjust(lines[i][0]._x, lines[i][0]._y, lines[i][1]._x, lines[i][1]._y);
        this._parent._canvas.fillText(o.getYLabel(this._lineValues[i]) + " - " + this._fractions[i], lines[i][0]._x, lines[i][0]._y - 2);
    }
    DrawingObject.prototype.draw.call(this);
}