/**
 * @constructor
 * @extends {Study}
 * @param {Overlay} o
 */
function StudySkewBands(o) {
    this._central = true;
    this._period = 20;
    this._percentiles = 6;
    let n = (this._percentiles - 1) * 2;
    this._outseries = Array(n);
    for (let i = 0; i < n; i++) {
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
    let items = Utils.convertStringParams(params, ":", "-");
    try {
        if (items.has("period"))
            this._period = parseInt(items.get("period"), 10);
        if (items.has("percentiles"))
            this._percentiles = parseInt(items.get("percentiles"), 10);
        let n = (this._percentiles - 1) * 2;
        this._outseries = new Array(n);
        for (let i = 0; i < n; i++) {
            this._outseries[i] = new Series();
        }
        if (items.has("central"))
            this._central = items.get("central").toString() === "true";
        Study.prototype.setParams.call(this, params);
    }
    catch (e) {
        console.error(e + " geting skewbands params");
    }
}
/** @override */
StudySkewBands.prototype.update = function(start, end) {
    let i = TimeIterator.forwardRangeIterator(this._parent._chartCanvas._chart.getMasterTimeList(), start, end);
    let buf_size = i._count + 1;
    let buf_closes = new Array(buf_size);
    buf_closes.fill(0.0);
    let buf_mean = new Array(buf_size);
    buf_mean.fill(0.0);
    let n = 0;
    let tol = 0.001;
    let range = new MaxMin(this._parent._chartCanvas._chart);
    range.getMaxMin(this._source, XTIterator.reverseScreenIterator(this._parent._chartCanvas._chart));
    let np = 2 * (this._percentiles - 1);
    for (let j = 0; j < np; j++) {
        this._outseries[j].clear();
    }
    let sn = new SkewNormal();
    let func = new FunctionSN(sn, 0, 0, 0, 0, 0);
    let funcmax = new FunctionSNmax(sn, 0, 0, 0);
    let zb = new SZBrent(func);
    let brent = new Brent(funcmax);
    do {
        let curDate = new Date(i._d.getTime());
        buf_closes[n] = this._source.get(curDate);
        let beg = n - this._period + 1;
        if (beg < 0) {
            beg = 0;
        }
        n++;
    } while (i.move());
    i = TimeIterator.forwardRangeIterator(this._parent._chartCanvas._chart.getMasterTimeList(), start, end);
    n = 0;
    let off = this._period / 2;
    if (!this._central) {
        off = 0;
    }
    do {
        let curDate = new Date(i._d.getTime());
        let beg = n - this._period + 1;
        if (beg < 0) {
            beg = 0;
        }
        let len = n - beg + 1;
        let meanpoint = n + off;
        if (meanpoint >= buf_size) {
            meanpoint = buf_size - 1;
        }
        let mean = buf_mean[meanpoint];
        let sumdev2 = 0.0;
        let sumdev3 = 0.0;
        for (let k = beg; k <= n; k++) {
            let dev1 = mean - buf_closes[k];
            sumdev2 += dev1 * dev1;
            sumdev3 += dev1 * dev1 * dev1;
        }
        let var1 = sumdev2 / len;
        let std = Math.sqrt(var1);
        let skew = (sumdev3 / len) / (std * var1); // I.E. divide by STD^3
        if (len < this._period || std < 0.00001) {
            for (let j = 0; j < 2 * (this._percentiles - 1); j++) {
                this._outseries[j].append(curDate, NaN);
            }
            n++;
            continue;
        }
        let umax = 2 * this._range._max;
        let lmin = 0.5 * this._range._min;
        let umin = mean;
        let lmax = mean;
        let funcscale = 1.0;
        funcmax.setParams(mean, std, skew);
        try {
            funcscale = -brent.minimise(mean - 10.0 * std, mean, mean + 10.0 * std, tol);
            umin = lmax = brent._xmin;
        } catch (e) {
            console.error("maxima not found");
        }
        let debug = Math.abs(skew) > 0.1;
        for (let j = 1; j < this._percentiles; j++) {
            let percentile = (j) / (this._percentiles);
            func.setParams(mean, std, skew, percentile, funcscale);
            
            let y = zb.solve(lmin, lmax, tol);
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
    for (let j = 0; j < 2 * (this._percentiles - 1); j++) {
        let r = new MaxMin(this._parent._chartCanvas._chart);
        r.getMaxMin(this._outseries[j], i);
        this._range.adjust(r);
        i.reset();
    }
}
/** @override */
StudySkewBands.prototype.draw = function() {
    this.updateY();
    let np = 2 * (this._percentiles - 1);
    for (let i = 1; i < this._percentiles; i++) {
        let f = i / this._percentiles;
        let c = Color.HSVtoRGB(f, 0.8, 0.6);
        this._parent.drawLineNormal(this._outseries[i - 1], c);
        this._parent.drawLineNormal(this._outseries[np - i], c);
    }
}