/* global Study, Series, Language, Utils, TimeIterator, StudyDialog_StudyEditParameter, StudyDialog_StudyYesNoParameter, MaxMin, XTIterator, SkewNormal, FunctionSN, FunctionSNmax, SZBrent, Brent, Color */
/**
 * @constructor
 * @extends {Study}
 * @param {Overlay} o
 */
function StudySkewBands(o) {
    this._central = true;
    this._period = 20;
    this._percentiles = 6;
    var n = (this._percentiles - 1) * 2;
    this._outseries = Array(n);
    for (var i = 0; i < n; i++) {
        this._outseries[i] = new Series();
    }
    Study.call(this, o);
}
/**
 * Inheriting
 */
StudySkewBands.prototype = Object.create(Study.prototype);
StudySkewBands.prototype.constructor = StudySkewBands;
/** @static */
StudySkewBands.getItems = function() {
    return [new StudyDialog_StudyEditParameter("period", Language.getString("toolbardialogs_period")),
                new StudyDialog_StudyEditParameter("percentiles", Language.getString("toolbardialogs_percentile")),
                new StudyDialog_StudyYesNoParameter("central", Language.getString("toolbardialogs_central_mom"))];
}
/** 
 * @static
 * @param {Overlay} o
 */
StudySkewBands.newInstance = function(o) {
    return new StudySkewBands(o);
}
/** @static */
StudySkewBands.mnemonic = "SkewBands";
/** @static */
StudySkewBands.helpID = 477;
/** @static */
StudySkewBands.ownOverlay = false;
/** @override */
StudySkewBands.prototype.setName = function() {
    this._name = Language.getString("study_skewbands") + " (" + this._period + "," + this._percentiles + "," + this._central + ")";
}
/** @override */
StudySkewBands.prototype.getParams = function() {
    return "period-" + this._period + ":percentiles-" + this._percentiles + ":central-" + (this._central ? "true" : "false");
}
/** @override */
StudySkewBands.prototype.setParams = function(params) {
    var items = Utils.convertStringParams(params, ":", "-");
    try {
        if (items.hasOwnProperty("period") && typeof items["period"] !== "undefined")
            this._period = parseInt(items["period"], 10);
        if (items.hasOwnProperty("percentiles") && typeof items["percentiles"] !== "undefined")
            this._percentiles = parseInt(items["percentiles"], 10);
        var n = (this._percentiles - 1) * 2;
        this._outseries = new Array(n);
        for (var i = 0; i < n; i++) {
            this._outseries[i] = new Series();
        }
        if (items.hasOwnProperty("central") && typeof items["central"] !== "undefined")
            this._central = items["central"].toString() === "true";
        Study.prototype.setParams.call(this, params);
    }
    catch (e) {
        console.error(e + " geting skewbands params");
    }
}
/** @override */
StudySkewBands.prototype.update = function(start, end) {
    var i = TimeIterator.forwardRangeIterator(this._parent._chart.getMasterTimeList(), start, end);
    var buf_size = i._count + 1;
    var buf_closes = new Array(buf_size);
    buf_closes.fillArrayWithValue(0.0);
    var buf_mean = new Array(buf_size);
    buf_mean.fillArrayWithValue(0.0);
    var n = 0;
    var tol = 0.001;
    var range = new MaxMin(this._parent._chart);
    range.getMaxMin(this._source, XTIterator.reverseScreenIterator(this._parent._chart));
    var np = 2 * (this._percentiles - 1);
    var j;
    for (j = 0; j < np; j++) {
        this._outseries[j].clear();
    }
    var sn = new SkewNormal();
    var func = new FunctionSN(sn, 0, 0, 0, 0, 0);
    var funcmax = new FunctionSNmax(sn, 0, 0, 0);
    var zb = new SZBrent(func);
    var brent = new Brent(funcmax);
    var curDate, beg;
    do {
        curDate = new Date(i._d.getTime());
        buf_closes[n] = this._source.get(curDate);
        beg = n - this._period + 1;
        if (beg < 0) {
            beg = 0;
        }
        n++;
    } while (i.move());
    i = TimeIterator.forwardRangeIterator(this._parent._chart.getMasterTimeList(), start, end);
    n = 0;
    var off = this._period / 2;
    if (!this._central) {
        off = 0;
    }
    do {
        curDate = new Date(i._d.getTime());
        beg = n - this._period + 1;
        if (beg < 0) {
            beg = 0;
        }
        var len = n - beg + 1;
        var meanpoint = n + off;
        if (meanpoint >= buf_size) {
            meanpoint = buf_size - 1;
        }
        var mean = buf_mean[meanpoint];
        var sumdev2 = 0.0;
        var sumdev3 = 0.0;
        for (var k = beg; k <= n; k++) {
            var dev1 = mean - buf_closes[k];
            sumdev2 += dev1 * dev1;
            sumdev3 += dev1 * dev1 * dev1;
        }
        var var1 = sumdev2 / len;
        var std = Math.sqrt(var1);
        var skew = (sumdev3 / len) / (std * var1); // I.E. divide by STD^3
        if (len < this._period || std < 0.00001) {
            for (j = 0; j < 2 * (this._percentiles - 1); j++) {
                this._outseries[j].append(curDate, NaN);
            }
            n++;
            continue;
        }
        var umax = 2 * this._range._max;
        var lmin = 0.5 * this._range._min;
        var umin = mean;
        var lmax = mean;
        var funcscale = 1.0;
        funcmax.setParams(mean, std, skew);
        try {
            funcscale = -brent.minimise(mean - 10.0 * std, mean, mean + 10.0 * std, tol);
            umin = lmax = brent._xmin;
        } catch (e) {
            console.error("maxima not found");
        }
        for (j = 1; j < this._percentiles; j++) {
            var percentile = (j) / (this._percentiles);
            func.setParams(mean, std, skew, percentile, funcscale);
            
            var y = zb.solve(lmin, lmax, tol);
            if (isNaN(y)) {
                this._outseries[np - j].append(curDate, NaN);
            } else {
                lmin = y;
                this._outseries[np - j].append(curDate, y);
            }
            
            y = zb.solve(umin, umax, tol);
            if (isNaN(y)) {
                this._outseries[j - 1].append(curDate, NaN);
            } else {
                umax = y;
                this._outseries[j - 1].append(curDate, y);
            }
            
            if (lmax > umin) {
                umin = lmax;
            } else {
                lmax = umin;
            }
        }
        n++;
    } while (i.move());
}
/** @override */
StudySkewBands.prototype.getMaxMin = function(i) {
    this._range.reset();
    for (var j = 0; j < 2 * (this._percentiles - 1); j++) {
        var r = new MaxMin(this._parent._chart);
        r.getMaxMin(this._outseries[j], i);
        this._range.adjust(r);
        i.reset();
    }
}
/** @override */
StudySkewBands.prototype.draw = function() {
    this.updateY();
    var np = 2 * (this._percentiles - 1);
    for (var i = 1; i < this._percentiles; i++) {
        var f = i / this._percentiles;
        var c = Color.HSVtoRGB(f, 0.8, 0.6);
        this._parent.drawLineNormal(this._outseries[i - 1], c);
        this._parent.drawLineNormal(this._outseries[np - i], c);
    }
}