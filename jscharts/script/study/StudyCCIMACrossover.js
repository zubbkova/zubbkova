/**
 * @constructor
 * @extends {Study}
 * @param {Overlay} o
 */
function StudyCCIMACrossover(o) {
    this._cciSeries = new Series();
    this._maSeries = new Series();
    Study.call(this, o);
    this._cciperiod = 20;
    this._maperiod = 15;
    this._modified = false;
    this._showSignals = true;
    this._delta = 0; // -1 = ma less than cci, +1 = ma more than cci
}
/**
 * Inheriting
 */
StudyCCIMACrossover.prototype = Object.create(Study.prototype);
StudyCCIMACrossover.prototype.constructor = StudyCCIMACrossover;
/** @static */
StudyCCIMACrossover.getItems = function() {
    return [new StudyDialog_StudyEditParameter("cciperiod", Language.getString("toolbardialogs_cci_period")),
                new StudyDialog_StudyEditParameter("maperiod", Language.getString("toolbardialogs_ma_period")),
                new StudyDialog_StudyYesNoParameter("modified", Language.getString("toolbardialogs_modified_cci")),
                new StudyDialog_StudyYesNoParameter("showsignals", Language.getString("toolbardialogs_signals"))];
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyCCIMACrossover.newInstance = function(o) {
    return new StudyCCIMACrossover(o);
}
/** @static */
StudyCCIMACrossover.mnemonic = "CCIMACrossover";
/** @static */
StudyCCIMACrossover.helpID = 493;
/** @static */
StudyCCIMACrossover.ownOverlay = true;
/** @override */
StudyCCIMACrossover.prototype.setName = function() {
    this._name = (this._modified ? Language.getString("study_modifiedccimacrossover") : Language.getString("study_ccimacrossover")) + " (" + this._cciperiod + "," + this._maperiod + ")";
}
/** @override */
StudyCCIMACrossover.prototype.getParams = function() {
    return "cciperiod-" + this._cciperiod + ":modified-" + this._modified + ":maperiod-" + this._maperiod +
			":showsignals-" + this._showSignals;
}
/** @override */
StudyCCIMACrossover.prototype.setParams = function(params) {
    let items = Utils.convertStringParams(params, ":", "-");
    if (items.has("cciperiod"))
        this._cciperiod = parseInt(items.get("cciperiod"), 10);
    if (items.has("maperiod"))
        this._maperiod = parseInt(items.get("maperiod"), 10);
    if (items.has("modified"))
        this._modified = items.get("modified").toString() === "true";
    if (items.has("showsignals"))
        this._showSignals = items.get("showsignals").toString() === "true";
    Study.prototype.setParams.call(this, params);
}
/** @override */
StudyCCIMACrossover.prototype.update = function(start, end) {
    this._cciSeries.clear(); // clear output
    this._maSeries.clear(); // clear output
    let i = TimeIterator.forwardRangeIterator(this._parent._chartCanvas._chart.getMasterTimeList(), start, end);
    let buf_size = i._count + 10;
    let buf_tp = new Array(buf_size);
    let buf_high = new Array(buf_size);
    let buf_low = new Array(buf_size);
    let n = 0;
    this._parent._chartCanvas._chart._signals.clear();
    // MA variables
    let current = 0.0, total = 0.0;
    let smooth = 2.0 / (1 + this._maperiod);
    do {
        let beg = n - this._cciperiod + 1;
        if (beg < 0) {
            beg = 0;
        }
        let len = n - beg + 1;
        let tp;
        if (this._modified) {
            buf_high[n] = this._high.get(i._d);
            buf_low[n] = this._low.get(i._d);
            // Modified CCI uses the Maximum high,min low in the period
            let highVal = -1000000.0;
            let lowVal = 1000000.0;
            for (let k = beg; k <= n; k++) {
                if (buf_high[k] > highVal) {
                    highVal = buf_high[k];
                }
                if (buf_low[k] < lowVal) {
                    lowVal = buf_low[k];
                }
            }
            tp = buf_tp[n] = (highVal + lowVal + this._source.get(i._d)) / 3.0;
        } else {
            tp = buf_tp[n] = (this._source.get(i._d) + this._high.get(i._d) + this._low.get(i._d)) / 3.0;
        }
        let matp = 0.0;
        for (let k = beg; k <= n; k++) {
            matp += buf_tp[k];
        }
        matp /= len;
        let mdtp = 0.0;
        for (let k = beg; k <= n; k++) {
            mdtp += Math.abs(buf_tp[k] - matp);
        }
        mdtp /= len;
        let cci = (tp - matp) / (mdtp * 0.015);
        this._cciSeries.append(i._d, cci);

        // EMA calculation
        // Use simple average for initial period.
        if(!isNaN(this._cciSeries.get(i._d))) {
            if (n < this._maperiod) {
                total += this._cciSeries.get(i._d);
                current = total / (n + 1);
                this._maSeries.append(i._d, current);
            } else {
                // Use exp. average for the rest.
                current = current + (smooth * (this._cciSeries.get(i._d) - current));
                this._maSeries.append(i._d, current);
            }
            // signals
            if (this._showSignals) 
                this._calcSignals(cci, current, i._d);
        }            
        // next iteration
        n++;
    } while (i.move());
}
/**
 * @param {number} cci
 * @param {number} ma
 * @param {Date} date
 */
StudyCCIMACrossover.prototype._calcSignals = function(cci, ma, date) {
    if (this._delta === 0){
        // initial case, delta = 0 means we're unset, lets set it up.
        if (ma < cci){
            this._delta = -1;
        } else {
            this._delta = 1;
        }
    }
    // compare MA to CCI, see if lines intersected
    // if so switch the delta and add a signal.
    if (this._delta === -1){
        if (ma < cci){
            // we've switched.  write a signal.
            this._parent._chartCanvas._chart._signals.addBuy(date);
            this._delta = 1;
        }
    } else {
        if (cci < ma){
            // we've switched.  write a signal.
            this._parent._chartCanvas._chart._signals.addSell(date);
            this._delta = -1;
        }
    }
}
/** @override */
StudyCCIMACrossover.prototype.getMaxMin = function(i) {
    this._range.reset();
    this._range.getMaxMin(this._cciSeries, i);
    this._range.getMaxMin(this._maSeries, i);
}
/** @override */
StudyCCIMACrossover.prototype.draw = function() {
    this.updateY();
    this._parent.drawLineNormal(this._cciSeries, this._colour);
    // draw the MA
    this._parent.drawLineNormal(this._maSeries, Color.red);
}
/** @override */
StudyCCIMACrossover.prototype.getColumnNames = function() {
    return [this._name, ""];
}
/** @override */
StudyCCIMACrossover.prototype.getColumnValues = function(d) {
    return [this.d(this._cciSeries.get(d)), this.d(this._maSeries.get(d))];
}