/**
 * -------
 * StudyYC
 * -------
 * @constructor
 * @extends {Study}
 * @param {Overlay} o
 */
function StudyYC(o) {
    Study.call(this, o);
    this._name = Language.getString("study_yesterdaysclose");
}
/**
 * Inheriting
 */
StudyYC.prototype = Object.create(Study.prototype);
StudyYC.prototype.constructor = StudyYC;
/**
 * Methods
 */
StudyYC.prototype.getMaxMin = function(i) {
    this._range.reset();
    this._price = this._parent._chartCanvas._chart._currentSymbol.getSymbolInfo(0).getYesterdaysClose();
    if (this._parent._chartCanvas._chart._showYestClose && this._price > 0) {
        this._range._min = this._price;
        this._range._max = this._price;
    }
}
StudyYC.prototype.refresh = function() {
    this.draw();
}
StudyYC.prototype.draw = function() {
    if (!this._parent._chartCanvas._chart._showYestClose || this._price <= 0.0)
        return;
    let y = this._parent.getY(this._price);
    this.updateY();
    if (y <= this._parent._chartCanvas._topLineY || y >= this._parent._chartCanvas._bottomLineY)
        return;
    this._parent._chartCanvas.setStrokeColor(Color.red);
    this._parent._chartCanvas.drawLineWithAdjust(this._parent._chartCanvas._chart._drawX, y, this._parent._chartCanvas._chart._drawX + this._parent._chartCanvas._chart._drawWidth, y);
    this._parent.drawPrice(this._price, Color.red);
}