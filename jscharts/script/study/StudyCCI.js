/* global Study, Series, StudyDialog_StudyEditParameter, StudyDialog_StudyYesNoParameter, Language, Utils, TimeIterator, Color */
/**
 * @constructor
 * @extends {Study}
 * @param {Overlay} o
 */
function StudyCCI(o) {
    Study.call(this, o);
    this._period = 20;
    this._modified = false;
    this._showSignals = true;
    this._series = new Series();
    this._lastcci = 0;
    this._status = 0;
}
/**
 * Inheriting
 */
StudyCCI.prototype = Object.create(Study.prototype);
StudyCCI.prototype.constructor = StudyCCI;
/** @static */
StudyCCI.getItems = function() {
    return [new StudyDialog_StudyEditParameter("period", Language.getString("toolbardialogs_period")),
                new StudyDialog_StudyYesNoParameter("modified", Language.getString("toolbardialogs_modified_cci")),
                new StudyDialog_StudyYesNoParameter("showsignals", Language.getString("toolbardialogs_signals"))];
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyCCI.newInstance = function(o) {
    return new StudyCCI(o);
}
/** @static */
StudyCCI.mnemonic = "CCI";
/** @static */
StudyCCI.helpID = 429;
/** @static */
StudyCCI.ownOverlay = true;
/** @static */
StudyCCI.READY = 0;
/** @static */
StudyCCI.LONG = 1;
/** @static */
StudyCCI.SHORT = 2;
/** @override */
StudyCCI.prototype.setName = function() {
    this._name = (this._modified ? Language.getString("study_modifiedcci") : Language.getString("study_cci")) + " (" + this._period + ")";
}
/** @override */
StudyCCI.prototype.getParams = function() {
    return "period-" + this._period + ":modified-" + this._modified + ":showsignals-" + this._showSignals;
}
/** @override */
StudyCCI.prototype.setParams = function(params) {
    var items = Utils.convertStringParams(params, ":", "-");
    if (items.hasOwnProperty("period") && typeof items["period"] !== "undefined")
        this._period = parseInt(items["period"], 10);
    if (items.hasOwnProperty("modified") && typeof items["modified"] !== "undefined")
        this._modified = items["modified"].toString() === "true";
    if (items.hasOwnProperty("showsignals") && typeof items["showsignals"] !== "undefined")
        this._showSignals = items["showsignals"].toString() === "true";
    Study.prototype.setParams.call(this, params);
}
/** @override */
StudyCCI.prototype.update = function(start, end) {
    this._series.clear(); // clear output
    var i = TimeIterator.forwardRangeIterator(this._parent._chart.getMasterTimeList(), start, end);
    var buf_size = i._count + 2;
    var buf_tp = new Array(buf_size);
    var buf_high = new Array(buf_size);
    var buf_low = new Array(buf_size);
    var n = 0;
    this._clearSignals();
    do {
        var d = new Date(i._d.getTime());
        var beg = n - this._period + 1;
        if (beg < 0) {
            beg = 0;
        }
        var len = n - beg + 1;
        var tp, k;
        if (this._modified) {
            buf_high[n] = this._high.get(d);
            buf_low[n] = this._low.get(d);
            // Modified CCI uses the Maximum high,min low in the period
            var highVal = -1000000.0;
            var lowVal = 1000000.0;
            for (k = beg; k <= n; k++) {
                if (buf_high[k] > highVal) {
                    highVal = buf_high[k];
                }
                if (buf_low[k] < lowVal) {
                    lowVal = buf_low[k];
                }
            }
            tp = buf_tp[n] = (highVal + lowVal + this._source.get(d)) / 3.0;
        } else {
            tp = buf_tp[n] = (this._source.get(d) + this._high.get(d) + this._low.get(d)) / 3.0;
        }
        var matp = 0.0;
        for (k = beg; k <= n; k++) {
            matp += buf_tp[k];
        }
        matp /= len;
        var mdtp = 0.0;
        for (k = beg; k <= n; k++) {
            mdtp += Math.abs(buf_tp[k] - matp);
        }
        mdtp /= len;
        var cci = (tp - matp) / (mdtp * .015);
        this._series.append(d, cci);
        if (this._showSignals)
            this._calcSignals(cci, d);
        n++;
    } while (i.move());
}
/** @private */
StudyCCI.prototype._clearSignals = function() {
    this._lastcci = 0;
    this._status = 0;
    this._parent._chart._signals.clear();
}
/** 
 * @private
 * @param {number} cci
 * @param {Date} date
 */
StudyCCI.prototype._calcSignals = function(cci, date) {
    switch (this._status) {
        case StudyCCI.READY :
            if (this._lastcci < 100 && cci > 100) {
                this._status = StudyCCI.LONG;
                this._parent._chart._signals.addBuy(date);
            }
            if (this._lastcci > -100 && cci < -100) {
                this._status = StudyCCI.SHORT;
                this._parent._chart._signals.addSell(date);
            }
            break;
        case StudyCCI.LONG :
            if (cci < 100) {
                this._status = StudyCCI.READY;
                this._parent._chart._signals.addBuyExit(date);
            }
            break;
        case StudyCCI.SHORT :
            if (cci > -100) {
                this._status = StudyCCI.READY;
                this._parent._chart._signals.addSellExit(date);
            }
            break;
    }
}
/** @override */
StudyCCI.prototype.draw = function() {
    this.updateY();
    this._parent.drawLineNormal(this._series, this._colour);
    this._parent._chartCanvas.setColor(Color.darkGray);
    var y = parseInt(this._parent.getY(100.0), 10);
    this._parent._chartCanvas.drawLineWithAdjust(this._parent._chartCanvas._topLineStartX, y, this._parent._chartCanvas._topLineEndX, y);
    y = parseInt(this._parent.getY(-100.0), 10);
    this._parent._chartCanvas.drawLineWithAdjust(this._parent._chartCanvas._topLineStartX, y, this._parent._chartCanvas._topLineEndX, y);
}