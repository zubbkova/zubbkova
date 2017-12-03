/* global Study, Series, StudyDialog_StudyRadioParameter, StudyDialog_StudyEditParameter, Language, Utils, TimeIterator, Savgol */
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
    var items = Utils.convertStringParams(params, ":", "-");
    if (items.hasOwnProperty("period") && typeof items["period"] !== "undefined")
        this._period = parseInt(items["period"], 10);
    if (items.hasOwnProperty("matype") && typeof items["matype"] !== "undefined")
        this._matype = parseInt(items["matype"], 10);
    Study.prototype.setParams.call(this, params);
}
/** @override */
StudyDisparity.prototype.update = function(start, end) {
    var i = TimeIterator.forwardRangeIterator(this._parent._chart.getMasterTimeList(), start, end);
    this._series.clear();
    var myDisp;
    // work out what sort of MA we need
    var pos = 0, n = 0;
    var total = 0.0;
    var buffer;
    var myMA, curval;
    switch (this._matype) {
        case StudyDisparity.SMA:
            // work out the moving average.
            buffer = new Array(this._period);
            buffer.fillArrayWithValue(0.0);
            total = 0.0;
            for (; n < this._period; i.move()) {
                buffer[n] = this._source.get(i._d);
                total += buffer[n];
                myMA = total / (++n);
                this._series.append(i._d, myMA);
            }
            do {
                curval = this._source.get(i._d);
                total -= buffer[pos];
                total += curval;
                buffer[pos] = curval;
                if (++pos === this._period)
                    pos = 0;
                myMA = total / (this._period);
                this._series.append(i._d, myMA);
            } while (i.move());
            break;
        case StudyDisparity.EMA:
            var smooth, current = 0.0;
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
            var weightdecline = 0.7071;
            var nl = this._period - 1;
            var nr = 0;
            var order = Math.min(6, this._period);
            // Sixth order coeff for first derivative.
            var sgderivs = Savgol.savgol(this._period, nl, nr, 1, order);
            pos = 0;
            n = 0;
            var bufderiv = new Array(this._period);
            bufderiv.fillArrayWithValue(0.0);
            buffer = new Array(this._period);
            buffer.fillArrayWithValue(0.0);
            total = 0.0;
            var j;
            do {
                curval = this._source.get(i._d);
                total -= buffer[pos];
                total += curval;
                buffer[pos] = curval;
                var opos = pos;
                if (++pos === this._period)
                    pos = 0;
                var deriv = 0.0;
                var sgpos = 0;
                var ppos = opos;
                for (j = 0; j < this._period; j++) {
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
                var weight = 1.0;
                var totalweight = 0.0;
                var lastderiv = 0.0;
                var mean = 0.0;
                for (j = 0; j < this._period; j++) {
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
                var ama = mean / totalweight;
                this._series.append(i._d, ama);
                n++;
            } while (i.move());
            break;
    }
    // calculate the Disparity Index from these results.
    i = TimeIterator.forwardRangeIterator(this._parent._chart.getMasterTimeList(), start, end);
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