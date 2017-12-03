/* global Study, Language, XTIterator, Style, Chart */
/**
 * @constructor
 * @extends {Study}
 * @param {Overlay} o
 */
function StudyVol(o) {
    Study.call(this, o);
    this._name = Language.getString("study_volume");
}
/**
 * Inheriting
 */
StudyVol.prototype = Object.create(Study.prototype);
StudyVol.prototype.constructor = StudyVol;
/** @static */
StudyVol.getItems = function() {
    return [];
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyVol.newInstance = function(o) {
    return new StudyVol(o);
}
/** @static */
StudyVol.mnemonic = "Vol";
/** @static */
StudyVol.helpID = 436;
/** @static */
StudyVol.ownOverlay = true;
/** @override */
StudyVol.prototype.getMaxMin = function(i) {
    this.updateDefaultDataSource();
    this._range.reset();
    this._range.getMaxMin(this._vol, i);
    // hardcode to force away problems with low number of data points
    this._range._min = 0;
}
/** @override */
StudyVol.prototype.draw = function() {
    this.updateY();
    var c = this._parent._chart;
    if (typeof this._vol === "undefined")
        this.updateDefaultDataSource();
    var cx = parseInt(c._currentSymbol._unitWidth / 2, 10);
    var y0 = parseInt(this._parent.getY(0), 10);
    var i = XTIterator.reverseScreenIterator(c);
    do {
        if (this._vol.get(i._d) === 0.0)
            continue;
        // Sell volume.
        this._parent._chartCanvas.setFillColor(Style.getForeground(Style.PERIOD_DOWN));
        var start_y = y0;
        var end_y = this._parent.getY(this._sell.get(i._d));
        var cur_y;
        if (!isNaN(end_y) && !(i._d > c._currentSymbol._time)) {
            var width = Math.max(parseInt(c._currentSymbol._unitWidth - 2, 10), 1);
            this._parent._chartCanvas.fillRectWithAdjust(i._x - cx + 1, parseInt(end_y, 10), width, parseInt(start_y - end_y + 1, 10));
            start_y = end_y;
            // Unknown volume.
            if (this._unknown.get(i._d) > 0.0) {
                this._parent._chartCanvas.setFillColor(Style.getForeground(Style.PERIOD_NO_CHANGE));
                cur_y = this._parent.getY(this._unknown.get(i._d));
                end_y = start_y + cur_y - this._parent.getY(0);
                this._parent._chartCanvas.fillRectWithAdjust(i._x - cx + 1, parseInt(end_y, 10), width, parseInt(start_y - end_y + 1, 10));
                start_y = end_y;
            }   
            // Buy volume.
            if (this._buy.get(i._d) > 0.0) {
                this._parent._chartCanvas.setFillColor(Style.getForeground(Style.PERIOD_UP));
                cur_y = this._parent.getY(this._buy.get(i._d));
                end_y = start_y + cur_y - this._parent.getY(0);
                this._parent._chartCanvas.fillRectWithAdjust(i._x - cx + 1, parseInt(end_y, 10), width, parseInt(start_y - end_y + 1, 10));
            }
        }
    } while (i.move() && i._x >= this._parent._chartCanvas._topLineStartX);
}
/** @override */
StudyVol.prototype.getColumnValues = function(d) {
    return [this.i(this._parent._chart.getSeries(Chart.S_TOTAL_VOLUME).get(d))];
}