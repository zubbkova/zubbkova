/**
 * @constructor
 * @extends {Study}
 * @param {Overlay} o
 */
function StudyBol(o) {
    this._average = new Series();
    this._stddeviation = new Series();
    this._series = this._average;
    Study.call(this, o);
    this._period = 20;
    this._dev = 2;
}
/**
 * Inheriting
 */
StudyBol.prototype = Object.create(Study.prototype);
StudyBol.prototype.constructor = StudyBol;
/** @static */
StudyBol.getItems = function() {
    return [new StudyDialog_StudyEditParameter("period", Language.getString("toolbardialogs_period")), new StudyDialog_StudyEditParameter("dev", Language.getString("toolbardialogs_dev"))];
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyBol.newInstance = function(o) {
    return new StudyBol(o);
}
/** @static */
StudyBol.mnemonic = "Bol";
/** @static */
StudyBol.helpID = 421;
/** @static */
StudyBol.ownOverlay = false;
/** @override */
StudyBol.prototype.setName = function() {
    this._name = Language.getString("study_bollingerbands") + " (" + this._period + "," + this._dev + ")";
}
/** @override */
StudyBol.prototype.getParams = function() {
    return "period-" + this._period + ":dev-" + this._dev;
}
/** @override */
StudyBol.prototype.setParams = function(params) {
    let items = Utils.convertStringParams(params, ":", "-");
    if (items.has("period"))
        this._period = parseInt(items.get("period"), 10);
    if (items.has("dev"))
        this._dev = parseFloat(items.get("dev"));
    Study.prototype.setParams.call(this,   params);
}
/** @override */
StudyBol.prototype.update = function(start, end) {
    let pos = 0, n = 0;
    let buffer = new Array(this._period);
    this._average.clear();
    this._stddeviation.clear();
    let i = TimeIterator.forwardRangeIterator(this._parent._chartCanvas._chart.getMasterTimeList(), start, end);
    let total = 0.0;
    for (; n < this._period; i.move(), n++) {
        buffer[n] = this._source.get(i._d);
        total += buffer[n];
    }
    let stddev = 0;
    let current;
    do {
        current = this._source.get(i._d);
        total -= buffer[pos];
        total += current;
        buffer[pos] = current;
        if (++pos === this._period)
            pos = 0;
        let av = total / this._period;
        // Calculate deviations.
        stddev = 0.0;
        for (let j = 0; j < this._period; j++) {
            let diff = buffer[j] - av;
            stddev += diff * diff;
        }
        stddev = Math.sqrt(stddev / this._period) * this._dev;
        this._average.append(i._d, av);
        this._stddeviation.append(i._d, stddev);
    } while (i.move());
}
/** @override */
StudyBol.prototype.getMaxMin = function(i) {
    this._range.reset();
    if (this._average.size() === 0) {
        return;
    }
    do {
        let curVal = this._average.get(i._d);
        let dev = this._stddeviation.get(i._d);
        if (curVal > 0.0) {
            if ((curVal + dev) > this._range._max) {
                this._range._max = curVal + dev;
            } else if ((curVal - dev) < this._range._min) {
                this._range._min = curVal - dev;
            }
        }
    } while (i.move());
}
/** @override */
StudyBol.prototype.draw = function() {
    let c = this._parent._chartCanvas._chart;
    if (this._average.size() === 0)
        return;
    this.updateY();
    let endYAv, endYUp, endYLo;
    let startx = c._drawX + c._drawWidth;
    let startYAv = parseInt(this._parent.getY(this._average.get(c._currentSymbol._timeEnd)), 10);
    let startYUp = parseInt(this._parent.getY(this._average.get(c._currentSymbol._timeEnd) + this._stddeviation.get(c._currentSymbol._timeEnd)), 10);
    let startYLo = parseInt(this._parent.getY(this._average.get(c._currentSymbol._timeEnd) - this._stddeviation.get(c._currentSymbol._timeEnd)), 10);
    let i = XTIterator.reverseScreenIterator(c);
    do {
        let curAv = this._average.get(i._d);
        let curDev = this._stddeviation.get(i._d);
        endYAv = parseInt(this._parent.getY(curAv), 10);
        endYUp = parseInt(this._parent.getY(curAv + curDev), 10);
        endYLo = parseInt(this._parent.getY(curAv - curDev), 10);
        if (startYAv != -1 && i.withinSeries(this._average)) {
            if (endYAv != -1) {
                this._parent._chartCanvas.setStrokeColor(this._colour);
                this._parent._chartCanvas.drawLineWithAdjust(startx, startYAv, i._x, endYAv);
                this._parent._chartCanvas.setStrokeColor(Color.red);
                this._parent._chartCanvas.drawLineWithAdjust(startx, startYUp, i._x, endYUp);
                this._parent._chartCanvas.drawLineWithAdjust(startx, startYLo, i._x, endYLo);
            } else {
                this._parent._chartCanvas.setStrokeColor(this._colour);
                this._parent._chartCanvas.drawLineWithAdjust(startx, startYAv, i._x, startYAv);
                this._parent._chartCanvas.setStrokeColor(Color.red);
                this._parent._chartCanvas.drawLineWithAdjust(startx, startYUp, i._x, startYUp);
                this._parent._chartCanvas.drawLineWithAdjust(startx, startYLo, i._x, startYLo);
            }
        }
        startx = i._x;
        startYAv = endYAv;
        startYUp = endYUp;
        startYLo = endYLo;
    } while (i.move() && startx > this._parent._chartCanvas._topLineStartX);
}
/** @override */
StudyBol.prototype.getRange = function() {
    return this._period;
}
/** @override */
StudyBol.prototype.getColumnNames = function() {
    return [this._name, "Top", "Bottom"];
}
/** @override */
StudyBol.prototype.getColumnValues = function(d) {
    let a = this._average.get(d);
    let dv = this._stddeviation.get(d);
    return [this._d(a), this._d(a + dv), this._d(a - dv)];
}