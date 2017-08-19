/**
 * @constructor
 * @extends {Study}
 * @param {Overlay} o
 */
function StudySkew(o) {
    Study.call(this, o);
    this._period = 20;
    this._forwardSkew = false;
    this._series = new Series();
}
/**
 * Inheriting
 */
StudySkew.prototype = Object.create(Study.prototype);
StudySkew.prototype.constructor = StudySkew;
/** @static */
StudySkew.getItems = function() {
    return [new StudyDialog_StudyEditParameter("period", Language.getString("toolbardialogs_period")),
                new StudyDialog_StudyYesNoParameter("forward", Language.getString("toolbardialogs_forward"))];
}
/** 
 * @static
 * @param {Overlay} o
 */
StudySkew.newInstance = function(o) {
    return new StudySkew(o);
}
/** @static */
StudySkew.mnemonic = "Skew";
/** @static */
StudySkew.helpID = 425;
/** @static */
StudySkew.ownOverlay = true;
/** @override */
StudySkew.prototype.setName = function() {
    this._name = (this._forwardSkew ? Language.getString("study_forwardskew") : Language.getString("study_skew")) + " (" + this._period + ")";
}
/** @override */
StudySkew.prototype.getParams = function() {
    return "period-" + this._period + ":forward-" + this._forwardSkew;
}
/** @override */
StudySkew.prototype.setParams = function(params) {
    let items = Utils.convertStringParams(params, ":", "-");
    if (items.has("period")) 
        this._period = parseInt(items.get("period"), 10);
    if (items.has("forward")) 
        this._forwardSkew = items.get("forward").toString() === "true";
    Study.prototype.setParams.call(this, params);
}
/** @override */
StudySkew.prototype.update = function(start, end) {
    this._series.clear(); // clear output
    let i = TimeIterator.forwardRangeIterator(this._parent._chartCanvas._chart.getMasterTimeList(), start, end);
    let buf_size = i._count + 1;
    let buf_closes = new Array(buf_size);
    buf_closes.fill(0.0);
    let buf_mean = new Array(buf_size);
    buf_mean.fill(0.0);
    let running_total = 0.0;
    let n = 0;
    if (this._forwardSkew) {
        do {
            let curDate = i._d;
            buf_closes[n] = this._source.get(curDate);
            let beg = n - this._period + 1;
            if (beg < 0) {
                beg = 0;
            }
            running_total += buf_closes[n];
            if (beg > 0) {
                running_total -= buf_closes[beg - 1];
            }
            n++;
        } while (i.move());
        i = TimeIterator.forwardRangeIterator(this._parent._chartCanvas._chart.getMasterTimeList(), start, end);
        n = 0;
        running_total = 0.0;
    }
    do {
        let curDate = i._d;
        buf_closes[n] = this._source.get(curDate);
        let beg = n - this._period + 1;
        if (beg < 0) {
            beg = 0;
        }
        let len = n - beg + 1;
        running_total += buf_closes[n];
        if (beg > 0) {
            running_total -= buf_closes[beg - 1];
        }
        let mean = buf_mean[n] = running_total / len;
        if (this._forwardSkew) {
            if (n >= buf_size + this._period / 2) {
                this._series.append(this._parent._chartCanvas._chart.timeAdjust(curDate, 0), 0.0);
                n++;
                continue;
            }
            mean = buf_mean[n + this._period / 2];
        }
        let sumdev2 = 0.0;
        let sumdev3 = 0.0;
        for (let k = beg; k <= n; k++) {
            let dev = buf_closes[k] - mean;
            sumdev2 += dev * dev;
            sumdev3 += dev * dev * dev;
        }
        let var1 = sumdev2 / len;
        let std = Math.sqrt(var1);
        let skew = (sumdev3 / len) / (std * var1); // I.E. divide by STD^3
        if (this._forwardSkew) {
            skew = -skew;
        }
        if (len < this._period) {
            skew = 0.0;
        }
        this._series.append(this._parent._chartCanvas._chart.timeAdjust(curDate, 0), skew);
        n++;
    } while (i.move());
}