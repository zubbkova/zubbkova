/**
 * @constructor
 * @extends {Study}
 * @param {Overlay} o
 */
function StudyVolPlus(o) {
    Study.call(this, o);
    this._name = Language.getString("study_volume_plus");
}
/**
 * Inheriting
 */
StudyVolPlus.prototype = Object.create(Study.prototype);
StudyVolPlus.prototype.constructor = StudyVolPlus;
/** @static */
StudyVolPlus.getItems = function() {
    return [];
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyVolPlus.newInstance = function(o) {
    return new StudyVolPlus(o);
}
/** @static */
StudyVolPlus.mnemonic = "VolPlus";
/** @static */
StudyVolPlus.helpID = 482;
/** @static */
StudyVolPlus.ownOverlay = true;
/** @override */
StudyVolPlus.prototype.getMaxMin = function(i) {
    this.updateDefaultDataSource();
    this._range.reset();
    this._range.getMaxMin(this._vol, i);
    // hardcode to force away problems with low number of data points
    this._range._min = 0;
}
/** @override */
StudyVolPlus.prototype.draw = function() {
    this.updateY();
    let c = this._parent._chartCanvas._chart;
    if (this._vol === undefined)
        this.updateDefaultDataSource();
    let lastPrice = 0, currentPrice = 0; // for calculating prices
    let cx = parseInt(c._currentSymbol._unitWidth / 2, 10);
    let i = XTIterator.forwardScreenIterator(c);
    let start_y = parseInt(this._parent.getY(0), 10);
    do {
        if (this._vol.get(i._d) === 0.0)
            continue;
        let end_y = this._parent.getY(this._vol.get(i._d));
        if (!isNaN(end_y) && !(i._d > c._currentSymbol._time)) {
            let width = Math.max(parseInt(c._currentSymbol._unitWidth - 2, 10), 1);
            // decide what colour to paint it according to change in price.
            currentPrice = this._close.get(i._d);
            // why is this working *exactly* backwards colourwise??
            if (currentPrice > lastPrice) {
                this._parent._chartCanvas.setFillColor(Color.blue);
            } else {
                this._parent._chartCanvas.setFillColor(Color.red);
            }
            this._parent._chartCanvas.fillRectWithAdjust(i._x - cx + 1, parseInt(end_y, 10), width, parseInt(start_y - end_y + 1, 10));
            // and change to the current price for next iteration
            lastPrice = currentPrice;
        }
    } while (i.move());
}
/** @override */
StudyVolPlus.prototype.getColumnValues = function(d) {
    return [this.i(this._parent._chartCanvas._chart.getSeries(Chart.S_TOTAL_VOLUME).get(d))];
}