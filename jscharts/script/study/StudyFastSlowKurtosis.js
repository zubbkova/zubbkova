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
    let items = Utils.convertStringParams(params, ":", "-");
    if (items.has("period"))
        this._period = parseInt(items.get("period"), 10);
    if (items.has("fkperiod"))
        this._fkperiod = parseInt(items.get("fkperiod"), 10);
    if (items.has("fskperiod"))
        this._fskperiod = parseInt(items.get("fskperiod"), 10);
    Study.prototype.setParams.call(this, params);
}
/** @override */
StudyFastSlowKurtosis.prototype.update = function(start, end) {
    this._series.clear(); // clear output
    let i = TimeIterator.forwardRangeIterator(this._parent._chartCanvas._chart.getMasterTimeList(), start, end);
    let buf_size = i._count;
    if (buf_size === 0) {
        return;
    }
    // add one so new XTIterator count doesnt break.
    let buf_closes = new Array(buf_size + 1);
    buf_closes.fill(0.0);
    let buf_mean = new Array(buf_size + 1);
    buf_mean.fill(0.0);
    let lastkurt = 0.0; // previous k
    let fktotal = 0.0; // values for calculating fk
    let fkcurrent = 0.0;
    let fkbuffer = new Array(this._fskperiod); // to hold fk values for fsk
    fkbuffer.fill(0.0);
    let fkbuffer_ptr = 0; // loop pointer in buffer
    let smooth = 2.0 / (1 + this._period); // smooth for fk EMA
    let fsktotal = 0.0; // running total for fsk SMA
    let n = 0;
    do {
        let curDate = i._d;
        buf_closes[n] = this._source.get(curDate);
        let beg = n - this._period + 1;
        if (beg < 0) {
            beg = 0;
        }
        // add the current close to the total
        let len = n - beg + 1;
        // calculate mean and sum the deviations from running total
        let sumdev2 = 0.0;
        let sumdev4 = 0.0;
        for (let k = beg; k <= n; k++) {
            let dev = buf_mean[k] - buf_closes[n];
            let dev2 = dev * dev;
            sumdev2 += dev2;
            sumdev4 += dev2 * dev2;
        }
        // calculate basic kurtosis from deviations
        let var1 = sumdev2 / len;
        // original kurtosis
        let thiskurt = sumdev4 / (len * var1 * var1) - 3;
        // zero if we haven't hit the period yet
        if (len < this._period) {
            thiskurt = 0;
        }
        // fast/slow slow kurtosis calculations
        if ((n > 0) && (thiskurt != 0)) {
            // thisk is kurt - ref(kurt, -1)
            let thisk = thiskurt - lastkurt;
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