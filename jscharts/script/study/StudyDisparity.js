/**
 * @constructor
 * @extends {Study}
 * @param {Overlay} o
 */
function StudyDisparity(o) {
    this._period = 13;
    this._matype = StudyDisparity.SMA;
    this._series = new Series();
    this._dispseries = new Series();
    Study.call(this, o);
}
/**
 * Inheriting
 */
StudyDisparity.prototype = Object.create(Study.prototype);
StudyDisparity.prototype.constructor = StudyDisparity;
/** @static */
StudyDisparity.getItems = function() {
    return [new StudyDialog_StudyRadioParameter("matype", [Language.getString("toolbardialogs_sma"), Language.getString("toolbardialogs_ema"), Language.getString("toolbardialogs_ama")]), new StudyDialog_StudyEditParameter("period", Language.getString("toolbardialogs_period"))];
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyDisparity.newInstance = function(o) {
    return new StudyDisparity(o);
}
/** @static */
StudyDisparity.mnemonic = "Disparity";
/** @static */
StudyDisparity.helpID = 498;
/** @static */
StudyDisparity.ownOverlay = true;
/** @static */
StudyDisparity.SMA = 0;
/** @static */
StudyDisparity.EMA = 1;
/** @static */
StudyDisparity.AMA = 2;
/** @static */
StudyDisparity.malabels = [Language.getString("study_sma"), Language.getString("study_ema"), Language.getString("study_ama")];
/** @override */
StudyDisparity.prototype.setName = function() {
    this._name = Language.getString("study_disparityindex") + " (" + this._period + ", " + StudyDisparity.malabels[this._matype] + ")";
}
/** @override */
StudyDisparity.prototype.getParams = function() {
    return "period-" + this._period + ":matype-" + this._matype;
}
/** @override */
StudyDisparity.prototype.setParams = function(params) {
    let items = Utils.convertStringParams(params, ":", "-");
    if (items.has("period"))
        this._period = parseInt(items.get("period"), 10);
    if (items.has("matype"))
        this._matype = parseInt(items.get("matype"), 10);
    Study.prototype.setParams.call(this, params);
}
/** @override */
StudyDisparity.prototype.update = function(start, end) {
    let i = TimeIterator.forwardRangeIterator(this._parent._chartCanvas._chart.getMasterTimeList(), start, end);
    this._series.clear();
    let myDisp;
    // work out what sort of MA we need
    let pos = 0, n = 0;
    let total = 0.0;
    let buffer;
    switch (this._matype) {
        case StudyDisparity.SMA:
            // work out the moving average.
            buffer = new Array(this._period);
            buffer.fill(0.0);
            total = 0.0;
            for (; n < this._period; i.move()) {
                buffer[n] = this._source.get(i._d);
                total += buffer[n];
                let myMA = total / (++n);
                this._series.append(i._d, myMA);
            }
            do {
                let curval = this._source.get(i._d);
                total -= buffer[pos];
                total += curval;
                buffer[pos] = curval;
                if (++pos === this._period)
                    pos = 0;
                let myMA = total / (this._period);
                this._series.append(i._d, myMA);
            } while (i.move());
            break;
        case StudyDisparity.EMA:
            let smooth, current = 0.0;
            n = 0;
            total = 0.0;
            // Use simple average for initial period.
            for (; n < this._period; i.move()) {
                total += this._source.get(i._d);
                current = total / (++n);
                this._series.append(i._d, current);
            }
            // Use exp. average for the rest.
            smooth = 2.0 / (1 + this._period);
            do {
                current = current + smooth * (this._source.get(i._d) - current);
                this._series.append(i._d, current);
            } while (i.move());
            break;
        case StudyDisparity.AMA:
            let weightdecline = 0.7071;
            let nl = this._period - 1;
            let nr = 0;
            let order = Math.min(6, this._period);
            // Sixth order coeff for first derivative.
            let sgderivs = Savgol.savgol(this._period, nl, nr, 1, order);
            pos = 0;
            n = 0;
            let bufderiv = new Array(this._period);
            bufderiv.fill(0.0);
            buffer = new Array(this._period);
            buffer.fill(0.0);
            total = 0.0;
            do {
                let curval = this._source.get(i._d);
                total -= buffer[pos];
                total += curval;
                buffer[pos] = curval;
                let opos = pos;
                if (++pos === this._period)
                    pos = 0;
                let deriv = 0.0;
                let sgpos = 0;
                let ppos = opos;
                for (let j = 0; j < this._period; j++) {
                    deriv += buffer[ppos--] * sgderivs[sgpos++];
                    if (ppos < 0) {
                        ppos += this._period;
                    }
                    if (sgpos >= nl) {
                        sgpos = this._period - 1;
                    }
                }
                bufderiv[opos] = deriv;
                ppos = opos;
                let weight = 1.0;
                let totalweight = 0.0;
                let lastderiv = 0.0;
                let mean = 0.0;
                for (let j = 0; j < this._period; j++) {
                    deriv = bufderiv[ppos];
                    if (lastderiv * deriv > 0) {
                        weight *= weightdecline;
                    }
                    if (buffer[ppos] != 0)
                        totalweight += weight;
                    mean += weight * buffer[ppos];
                    if (--ppos < 0) {
                        ppos = this._period - 1;
                    }
                    lastderiv = deriv;
                }
                let ama = mean / totalweight;
                this._series.append(i._d, ama);
                n++;
            } while (i.move());
            break;
    }
    // calculate the Disparity Index from these results.
    i = TimeIterator.forwardRangeIterator(this._parent._chartCanvas._chart.getMasterTimeList(), start, end);
    this._dispseries.clear();
    do {
        myDisp = ((this._source.get(i._d) - this._series.get(i._d)) / this._series.get(i._d)) * 100;
        this._dispseries.append(i._d, myDisp);
    } while (i.move());
}
/** @override */
StudyDisparity.prototype.getMaxMin = function(i) {
    this._range.reset();
    this._range.getMaxMin(this._dispseries, i);
}
/** @override */
StudyDisparity.prototype.draw = function() {
    this.updateY();
    this._parent.drawLineNormal(this._dispseries, this._colour);
}
/** @override */
StudyDisparity.prototype.getRange = function() {
    return this._period;
}
/** @override */
StudyDisparity.prototype.getColumnValues = function(d) {
    return [this.d(this._dispseries.get(d))];
}