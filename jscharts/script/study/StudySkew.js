/* global Study, Series, Language, Utils, TimeIterator, StudyDialog_StudyEditParameter, StudyDialog_StudyYesNoParameter */
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
    var items = Utils.convertStringParams(params, ":", "-");
    if (items.hasOwnProperty("period") && typeof items["period"] !== "undefined") 
        this._period = parseInt(items["period"], 10);
    if (items.hasOwnProperty("forward") && typeof items["forward"] !== "undefined") 
        this._forwardSkew = items["forward"].toString() === "true";
    Study.prototype.setParams.call(this, params);
}
/** @override */
StudySkew.prototype.update = function(start, end) {
    this._series.clear(); // clear output
    var i = TimeIterator.forwardRangeIterator(this._parent._chart.getMasterTimeList(), start, end);
    var buf_size = i._count + 1;
    var buf_closes = new Array(buf_size);
    buf_closes.fillArrayWithValue(0.0);
    var buf_mean = new Array(buf_size);
    buf_mean.fillArrayWithValue(0.0);
    var running_total = 0.0;
    var n = 0;
    var curDate, beg;
    if (this._forwardSkew) {
        do {
            curDate = i._d;
            buf_closes[n] = this._source.get(curDate);
            beg = n - this._period + 1;
            if (beg < 0) {
                beg = 0;
            }
            running_total += buf_closes[n];
            if (beg > 0) {
                running_total -= buf_closes[beg - 1];
            }
            n++;
        } while (i.move());
        i = TimeIterator.forwardRangeIterator(this._parent._chart.getMasterTimeList(), start, end);
        n = 0;
        running_total = 0.0;
    }
    do {
        curDate = i._d;
        buf_closes[n] = this._source.get(curDate);
        beg = n - this._period + 1;
        if (beg < 0) {
            beg = 0;
        }
        var len = n - beg + 1;
        running_total += buf_closes[n];
        if (beg > 0) {
            running_total -= buf_closes[beg - 1];
        }
        var mean = buf_mean[n] = running_total / len;
        if (this._forwardSkew) {
            if (n >= buf_size + this._period / 2) {
                this._series.append(this._parent._chart.timeAdjust(curDate, 0), 0.0);
                n++;
                continue;
            }
            mean = buf_mean[n + this._period / 2];
        }
        var sumdev2 = 0.0;
        var sumdev3 = 0.0;
        for (var k = beg; k <= n; k++) {
            var dev = buf_closes[k] - mean;
            sumdev2 += dev * dev;
            sumdev3 += dev * dev * dev;
        }
        var var1 = sumdev2 / len;
        var std = Math.sqrt(var1);
        var skew = (sumdev3 / len) / (std * var1); // I.E. divide by STD^3
        if (this._forwardSkew) {
            skew = -skew;
        }
        if (len < this._period) {
            skew = 0.0;
        }
        this._series.append(this._parent._chart.timeAdjust(curDate, 0), skew);
        n++;
    } while (i.move());
}