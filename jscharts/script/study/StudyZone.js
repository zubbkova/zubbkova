/**
 * @constructor
 * @extends {Study}
 * @param {Overlay} o
 */
function StudyZone(o) {
    this._greenTest = new Series();
    this._redTest = new Series();
    Study.call(this, o);
}
/**
 * Inheriting
 */
StudyZone.prototype = Object.create(Study.prototype);
StudyZone.prototype.constructor = StudyZone;
/** @static */
StudyZone.getItems = function() {
    return [];
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyZone.newInstance = function(o) {
    return new StudyZone(o);
}
/** @static */
StudyZone.mnemonic = "Zone";
/** @static */
StudyZone.helpID = 2259;
/** @static */
StudyZone.ownOverlay = false;
/** @override */
StudyZone.prototype.setName = function() {
    this._name = Language.getString("study_zone");
}
/** @override */
StudyZone.prototype.update = function(start, end) {
    this._greenTest.clear();
    this._redTest.clear();
    // calculate the values to compare against (in paint) to see whether to paint green or red.
    let c = this._parent._chartCanvas._chart;
    this._averageTrueRange = MetaStudy.SMA(c, MetaStudy.subtractSeries(c, MetaStudy.maximum(c, this._high, MetaStudy.offsetSeries(c, this._close, 1)), MetaStudy.minimum(c, this._low, MetaStudy.offsetSeries(c, this._close, 1))), 10);
    this._greenTest = MetaStudy.sumSeries(c, MetaStudy.LowestLow(c, this._low, 20), MetaStudy.multipleSeriesByValue(c, this._averageTrueRange, 2));
    this._redTest = MetaStudy.subtractSeries(c, MetaStudy.HighestHigh(c, this._high, 20), MetaStudy.multipleSeriesByValue(c, this._averageTrueRange, 2));
}
/** @override */
StudyZone.prototype.draw = function() {
    this.updateY();
    if (this._greenTest === undefined || this._redTest === undefined)
        return;
    let c = this._parent._chartCanvas._chart;
    let i = XTIterator.reverseScreenIterator(c);
    let green, red;
    do {
        red = false;
        green = false;
        if (this._close.get(i._d) > this._greenTest.get(i._d))
            green = true;
        if (this._close.get(i._d) < this._redTest.get(i._d))
            red = true;
        if (green && red) {
            // omg wtf, this shouldnt happen
            this._parent._chartCanvas.setFillColor(Color.black);
        } else if(green) {
            this._parent._chartCanvas.setFillColor(Color.green);
        } else if(red) {
            this._parent._chartCanvas.setFillColor(Color.red);
        } else {
            this._parent._chartCanvas.setFillColor(Color.blue);
        }
        // code nicked from Overlay.drawCandle()
        let hy = this._parent.getY(this._high.get(i._d));
        let ly = this._parent.getY(this._low.get(i._d));
        let cx = parseInt(c._currentSymbol._unitWidth, 10) / 2;
        if (!isNaN(hy) && !isNaN(ly)) {
            this._parent._chartCanvas.fillRectWithAdjust(i._x - cx + 2, parseInt(hy, 10) + 1, parseInt(c._currentSymbol._unitWidth, 10) - 3, parseInt(ly, 10) - parseInt(hy, 10) - 1);
        }
    } while (i.move() && i._x > this._parent._chartCanvas._topLineStartX);
}