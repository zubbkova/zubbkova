/* global Study, Series, StudyDialog_StudyEditParameter, StudyDialog_StudyRadioParameter, Language, FakeSeries, Color, Utils, TimeIterator */
/**
 * @constructor
 * @extends {Study}
 * @param {Overlay} o
 */
function StudyBuySellVolumeMA(o) {
    this._period = 5;
    this._ratio = true;
    this._buyVol = new Series();
    this._sellVol = new Series();
    this._maRatio = new FakeSeries();
    this._buyColor = new Color(160, 160, 255);
    this._sellColor = new Color(255, 160, 160);
    this._maColor = new Color(0, 80, 0);
    Study.call(this, o);
}
/**
 * Inheriting
 */
StudyBuySellVolumeMA.prototype = Object.create(Study.prototype);
StudyBuySellVolumeMA.prototype.constructor = StudyBuySellVolumeMA;
/** @static */
StudyBuySellVolumeMA.getItems = function() {
    return [new StudyDialog_StudyEditParameter("period", Language.getString("toolbardialogs_period")),
                new StudyDialog_StudyRadioParameter("ratio", [Language.getString("toolbardialogs_ma"), Language.getString("toolbardialogs_ratio_ma")])];
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyBuySellVolumeMA.newInstance = function(o) {
    return new StudyBuySellVolumeMA(o);
}
/** @static */
StudyBuySellVolumeMA.mnemonic = "BuySellVolumeMA";
/** @static */
StudyBuySellVolumeMA.helpID = 550;
/** @static */
StudyBuySellVolumeMA.ownOverlay = true;
/** @override */
StudyBuySellVolumeMA.prototype.setName = function() {
    this._name = Language.getString("study_buysellvolumeratioma") + " (" + this._period + ")";
}
/** @override */
StudyBuySellVolumeMA.prototype.getParams = function() {
    return "period-" + this._period + ":ratio-" + (this._ratio ? "1" : "0");
}
/** @override */
StudyBuySellVolumeMA.prototype.setParams = function(params) {
    var items = Utils.convertStringParams(params, ":", "-");
    if (items.hasOwnProperty("period") && typeof items["period"] !== "undefined")
        this._period = parseInt(items["period"], 10);
    if (items.hasOwnProperty("ratio") && typeof items["ratio"] !== "undefined")
        this._ratio = "1" === items["ratio"].toString();
    Study.prototype.setParams.call(this, params);
}
/** @override */
StudyBuySellVolumeMA.prototype.update = function(start, end) {
    var pos = 0, n = 0;
    this._buyVol.clear();
    this._sellVol.clear();
    this._maRatio.clear();
    var i = TimeIterator.forwardRangeIterator(this._parent._chart.getMasterTimeList(), start, end);
    var buffer = new Array(this._period);
    buffer.fillArrayWithValue(0);
    var total = 0.0;
    var curBuy, curSell, curVal;
    for (; n < this._period; i.move()) {
        curBuy = this._buy.get(i._d);
        curSell = this._sell.get(i._d);
        if (curBuy + curSell > 0.0) {
            this._buyVol.append(i._d, curBuy);
            this._sellVol.append(i._d, -curSell);
            curVal = NaN;
            // calculate and add the ratio.
            if (this._ratio) {
                curVal = 100.0 * curBuy / (curBuy + curSell);
            } else {
                curVal = curBuy - curSell;
            }
            buffer[n] = curVal;
            total += curVal;
            this._maRatio.append(i._d, total / ++n);
        }
        else
            n++;
    }
    do {
        curBuy = this._buy.get(i._d);
        curSell = this._sell.get(i._d);
        // add the volumes in.
        this._buyVol.append(i._d, curBuy);
        this._sellVol.append(i._d, -curSell);
        // calculate and add the ratio.
        if (curBuy + curSell > 0.0) {
            curVal = NaN;
            if (this._ratio) {
                curVal = 100.0 * curBuy / (curBuy + curSell);
            } else {
                curVal = curBuy - curSell;
            }
            total -= buffer[pos];
            total += curVal;
            buffer[pos] = curVal;
            if (++pos === this._period)
                pos = 0;
            this._maRatio.append(i._d, total / this._period);
        }
    } while (i.move());
}
/** @override */
StudyBuySellVolumeMA.prototype.draw = function() {
    this.updateY();
    this._parent.drawLineHistMid(this._buyVol, this._buyColor, 0.0);
    this._parent.drawLineHistMid(this._sellVol, this._sellColor, 0.0);
    this._parent.drawLineNormal(this._maRatio, this._maColor);
}
/** @override */
StudyBuySellVolumeMA.prototype.getRange = function() {
    return this._period;
}
/** @override */
StudyBuySellVolumeMA.prototype.getMaxMin = function(i) {
    this._range.reset();
    this._range.getMaxMin(this._buyVol, i);
    this._range.getMaxMin(this._sellVol, i);
    if (Math.abs(this._range._max) > Math.abs(this._range._min)) {
        this._range._min = -(this._range._max);
    } else {
        this._range._max = -(this._range._min);
    }
    // work out the scalefactor and offset for the fake series to draw it in the right place
    if (this._ratio) {
        this._maRatio._scaleFactor = (this._range._max - this._range._min) / 100.0;
        this._maRatio._offset = -this._range._min;
    } else {
        this._maRatio._scaleFactor = 1.0;
        this._maRatio._offset = 0.0;
    }
}
/** @override */
StudyBuySellVolumeMA.prototype.getColumnValues = function(d) {
    return [this.d(this._maRatio.get(d))];
}