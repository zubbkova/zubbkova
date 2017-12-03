/* global Study, Series, StudyDialog_StudyEditParameter, Language, Utils, TimeIterator */
/**
 * @constructor
 * @extends {Study}
 * @param {Overlay} o
 */
function StudyFastSlowKurtosis(o) {
    Study.call(this, o);
    this._period = 20;
    this._fkperiod = 66;
    this._fskperiod = 3;
    this._series = new Series();
}
/**
 * Inheriting
 */
StudyFastSlowKurtosis.prototype = Object.create(Study.prototype);
StudyFastSlowKurtosis.prototype.constructor = StudyFastSlowKurtosis;
/** @static */
StudyFastSlowKurtosis.getItems = function() {
    return [new StudyDialog_StudyEditParameter("period", "K " + Language.getString("toolbardialogs_period")),
                new StudyDialog_StudyEditParameter("fkperiod", "FK " + Language.getString("toolbardialogs_period")),
                new StudyDialog_StudyEditParameter("fskperiod", "FSK " + Language.getString("toolbardialogs_period"))];
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyFastSlowKurtosis.newInstance = function(o) {
    return new StudyFastSlowKurtosis(o);
}
/** @static */
StudyFastSlowKurtosis.mnemonic = "FastSlowKurtosis";
/** @static */
StudyFastSlowKurtosis.helpID = 492;
/** @static */
StudyFastSlowKurtosis.ownOverlay = true;
/** @override */
StudyFastSlowKurtosis.prototype.setName = function() {
    this._name = Language.getString("study_fastslowkurtosis") + " (" + this._period + "," + this._fkperiod + "," + this._fskperiod + ")";
}
/** @override */
StudyFastSlowKurtosis.prototype.getParams = function() {
    return "period-" + this._period + ":fkperiod-" + this._fkperiod + ":fskperiod-" + this._fskperiod;
}
/** @override */
StudyFastSlowKurtosis.prototype.setParams = function(params) {
    var items = Utils.convertStringParams(params, ":", "-");
    if (items.hasOwnProperty("period") && typeof items["period"] !== "undefined")
        this._period = parseInt(items["period"], 10);
    if (items.hasOwnProperty("fkperiod") && typeof items["fkperiod"] !== "undefined")
        this._fkperiod = parseInt(items["fkperiod"], 10);
    if (items.hasOwnProperty("fskperiod") && typeof items["fskperiod"] !== "undefined")
        this._fskperiod = parseInt(items["fskperiod"], 10);
    Study.prototype.setParams.call(this, params);
}
/** @override */
StudyFastSlowKurtosis.prototype.update = function(start, end) {
    this._series.clear(); // clear output
    var i = TimeIterator.forwardRangeIterator(this._parent._chart.getMasterTimeList(), start, end);
    var buf_size = i._count;
    if (buf_size === 0) {
        return;
    }
    // add one so new XTIterator count doesnt break.
    var buf_closes = new Array(buf_size + 1);
    buf_closes.fillArrayWithValue(0.0);
    var buf_mean = new Array(buf_size + 1);
    buf_mean.fillArrayWithValue(0.0);
    var lastkurt = 0.0; // previous k
    var fktotal = 0.0; // values for calculating fk
    var fkcurrent = 0.0;
    var fkbuffer = new Array(this._fskperiod); // to hold fk values for fsk
    fkbuffer.fillArrayWithValue(0.0);
    var fkbuffer_ptr = 0; // loop pointer in buffer
    var smooth = 2.0 / (1 + this._period); // smooth for fk EMA
    var fsktotal = 0.0; // running total for fsk SMA
    var n = 0;
    do {
        var curDate = i._d;
        buf_closes[n] = this._source.get(curDate);
        var beg = n - this._period + 1;
        if (beg < 0) {
            beg = 0;
        }
        // add the current close to the total
        var len = n - beg + 1;
        // calculate mean and sum the deviations from running total
        var sumdev2 = 0.0;
        var sumdev4 = 0.0;
        for (var k = beg; k <= n; k++) {
            var dev = buf_mean[k] - buf_closes[n];
            var dev2 = dev * dev;
            sumdev2 += dev2;
            sumdev4 += dev2 * dev2;
        }
        // calculate basic kurtosis from deviations
        var var1 = sumdev2 / len;
        // original kurtosis
        var thiskurt = sumdev4 / (len * var1 * var1) - 3;
        // zero if we haven't hit the period yet
        if (len < this._period) {
            thiskurt = 0;
        }
        // fast/slow slow kurtosis calculations
        if ((n > 0) && (thiskurt != 0)) {
            // thisk is kurt - ref(kurt, -1)
            var thisk = thiskurt - lastkurt;
            // fk is EMA of k over period of fkperiod
            if (n < this._fkperiod) {
                // Use simple average for initial period.
                fktotal += thisk;
                fkcurrent = (fktotal / (n + 1));
            } else {
                // Use exp. average for the rest.
                fkcurrent = fkcurrent + smooth * (thisk - fkcurrent);
            }
            // fsk is SMA of fk over period of fskperiod
            if (n < this._fskperiod) {
                // keep track of the buffer
                fkbuffer[n] = fkcurrent;
                // keep track of total
                fsktotal = fktotal / (n + 1);
                // and write it out
                this._series.append(curDate, fsktotal);
            } else {
                // rotate the total value and buffer
                fsktotal -= fkbuffer[fkbuffer_ptr];
                fsktotal += fkcurrent;
                fkbuffer[fkbuffer_ptr] = fkcurrent;
                // reset or increment buffer pointer
                if (++fkbuffer_ptr === this._fskperiod)
                    fkbuffer_ptr = 0;
                // and output!
                this._series.append(curDate, fsktotal / this._fskperiod);
            }
        }
        // next iteration
        lastkurt = thiskurt;
        n++;
    } while (i.move());
}
/** @override */
StudyFastSlowKurtosis.prototype.getMaxMin = function(i) {
    this._range.reset();
    this._range.getMaxMin(this._series, i);
}
/** @override */
StudyFastSlowKurtosis.prototype.draw = function() {
    this.updateY();
    this._parent.drawLineNormal(this._series, this._colour);
}
/** @override */
StudyFastSlowKurtosis.prototype.getColumnValues = function(d) {
    return [this.d(this._series.get(d))];
}