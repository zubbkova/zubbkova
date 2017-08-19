/**
 * ----------
 * StudyStock
 * ----------
 * @constructor
 * @extends {Study}
 * @param {Overlay} overlay
 * @param {number} si - symbol index
 */
function StudyStock(overlay, si) {
    Study.call(this, overlay);
    this._symbolIndex = si;
    this._isOverlay = this._symbolIndex > 0;
    this._style = StudyStock.ST_NORMAL;
    this.updateDefaultDataSource();
    let info = overlay._chartCanvas._chart._currentSymbol.getSymbolInfo(si);
    if (info)
        this._currency = info.getCurrency();
}
/**
 * Inheriting
 */
StudyStock.prototype = Object.create(Study.prototype);
StudyStock.prototype.constructor = StudyStock;
/** @override */
StudyStock.prototype.updateDefaultDataSource = function() {
    if (this._symbolIndex < this._parent._chartCanvas._chart._currentSymbol.size()) {
        this._open = this._parent._chartCanvas._chart._currentSymbol.getSeries(this._symbolIndex, Chart.S_CUR_OPEN);
        this._high = this._parent._chartCanvas._chart._currentSymbol.getSeries(this._symbolIndex, Chart.S_CUR_HIGH);
        this._low = this._parent._chartCanvas._chart._currentSymbol.getSeries(this._symbolIndex, Chart.S_CUR_LOW);
        this._close = this._source = this._parent._chartCanvas._chart._currentSymbol.getSeries(this._symbolIndex, Chart.S_CUR_CLOSE);
    }
}
/** @override */
StudyStock.prototype.getMaxMin = function(i) {
    this._range.reset();
    if (this._style === StudyStock.ST_CANDLE || this._style === StudyStock.ST_BAR || this._style === StudyStock.ST_GREEN_RED_BAR || this._style === StudyStock.ST_GREEN_RED_BAR4 || this._style === StudyStock.ST_CBANDS || this._style === StudyStock.ST_HEIKENASHI) {
        this._range.getMaxMin(this._high, i);
        i.reset();
        this._range.getMaxMin(this._low, i);
    } else {
        this._range.getMaxMin(this._close, i);
    }
}
/** @override */
StudyStock.prototype.draw = function() {
    let chart = this._parent._chartCanvas._chart;
    if (chart._objectColour && !this._isOverlay) {
        this._colour = chart._objectColour;
    }
    switch (this._style) {
        case StudyStock.ST_NORMAL:
            this._parent.drawLineNormal(this._close, this._colour);
            break;
        case StudyStock.ST_SQUARE:
            this._parent.drawLineSquare(this._close, this._colour);
            break;
        case StudyStock.ST_CANDLE:
            this._parent.drawCandle(this._open, this._high, this._low, this._close, this._colour, Color.white, this._colour);
            break;
        case StudyStock.ST_BAR:
            this._parent.drawBar(this._open, this._high, this._low, this._close, this._colour);
            break;
        case StudyStock.ST_CBANDS:
            this._parent.drawCBands(this._high, this._low, this._close, this._colour);
            break;
        case StudyStock.ST_HEIKENASHI:
            this._parent.drawHeikenAshi(this._open, this._high, this._low, this._close, StudyStock.HA_tails, StudyStock.HA_tails, Color.green, Color.red);
            break;
        case StudyStock.ST_SHADED:
            this._parent.drawShadedArea(this._close, this._colour);
            break;
        case StudyStock.ST_GREEN_RED_BAR:
            this._parent.drawBarGreenRed(this._open, this._high, this._low, this._close);
            break;
        case StudyStock.ST_GREEN_RED_BAR4:
            this._parent.draw4HourBarGreenRed(this._open, this._high, this._low, this._close);
            break;
    }
    // draw prices
    if (!this._isOverlay) {
        if (chart._currentSymbol._timeEnd < chart._currentSymbol._time) {
            this._parent.drawPrice(this._close.get(chart._currentSymbol._timeEnd), Color.gray);
        }
        this._parent.drawPrice(this._close.get(chart._currentSymbol._time), Color.black);
    }
}
/** @static */
StudyStock.ST_NORMAL = 0;
/** @static */
StudyStock.ST_SQUARE = 1;
/** @static */
StudyStock.ST_CANDLE = 2;
/** @static */
StudyStock.ST_BAR = 3;
/** @static */
StudyStock.ST_CBANDS = 4;
/** @static */
StudyStock.ST_HEIKENASHI = 5;
/** @static */
StudyStock.ST_SHADED = 6;
/** @static */
StudyStock.ST_GREEN_RED_BAR = 7;
/** @static */
StudyStock.ST_NONE = 8;
/** @static */
StudyStock.ST_GREEN_RED_BAR4 = 9;
/** @static */
StudyStock.HA_tails = new Color(112, 112, 112);
/** 
 * @static
 * @param {Overlay} overlay
 */
StudyStock.createMainStock = function(overlay) {
    let ss = new StudyStock(overlay, 0);
    ss._colour = (overlay._chartCanvas._chart._features & Chart.F_LINE_BLUE) == Chart.F_LINE_BLUE ? Color.blue : Color.black;
    return ss;
}
/** 
 * @static
 * @param {Overlay} overlay
 * @param {number} o
 */
StudyStock.createOverlayStock = function(overlay, o) {
    let ss = new StudyStock(overlay, o + 1);
    ss._name = overlay._chartCanvas._chart._currentSymbol.getDisplaySymbol(o + 1);
    ss._initLegend();
    return ss;
}