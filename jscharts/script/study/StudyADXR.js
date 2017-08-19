/**
 * @constructor
 * @extends {Study}
 * @param {Overlay} o
 */
function StudyADXR(o) {
    this._period = 14;
    this._adxrPeriod = 9;
    this._adx = new Series();
    this._adxr = new Series();
    this._lastAdxs = [];
    Study.call(this, o);
}
/**
 * Inheriting
 */
StudyADXR.prototype = Object.create(Study.prototype);
StudyADXR.prototype.constructor = StudyADXR;
/** @static */
StudyADXR.getItems = function() {
    return [new StudyDialog_StudyEditParameter("period", Language.getString("toolbardialogs_period")),
                new StudyDialog_StudyEditParameter("adxrPeriod", Language.getString("toolbardialogs_adxr_period"))];
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyADXR.newInstance = function(o) {
    return new StudyADXR(o);
}
/** @static */
StudyADXR.mnemonic = "ADXR";
/** @static */
StudyADXR.helpID = 494;
/** @static */
StudyADXR.ownOverlay = true;
/** @override */
StudyADXR.prototype.setName = function() {
    this._name = Language.getString("study_adxr") + " (" + this._period + "," + this._adxrPeriod + ")";
}
/** @override */
StudyADXR.prototype.getParams = function() {
    return "period-" + this._period + ":adxrPeriod-" + this._adxrPeriod;
}
/** @override */
StudyADXR.prototype.setParams = function(params) {
    let items = Utils.convertStringParams(params, ":", "-");
    if (items.has("period"))
        this._period = parseInt(items.get("period"), 10);
    if (items.has("adxrPeriod"))
        this._adxrPeriod = parseInt(items.get("adxrPeriod"), 10);
    Study.prototype.setParams.call(this, params);
}
/** @override */
StudyADXR.prototype.update = function(start, end) {
    let i = TimeIterator.forwardRangeIterator(this._parent._chartCanvas._chart.getMasterTimeList(), start, end);
    this._adxr.clear();
    this._lastAdxs = new Array(i._count + 2);
    this._lastAdxs.fill(0);
    let n = 0;
    let lasthigh = 0.0;
    let lastlow = 0.0;
    let lastclose = 0.0; // Mark last close as not useable
    let emADX = 0.0;
    let emDMP = 0.0;
    let emDMN = 0.0;
    let emTR = 0.0;
    let emfrac = 1.0 / this._period; // According to incredible charts.com 
    // Wilder uses this as the EMA% instead of the usual 2.0/(1+period)
    let omemfrac = 1.0 - emfrac;
    do {
        let close = this._source.get(i._d);
        let highVal = this._high.get(i._d);
        let lowVal = this._low.get(i._d);
        let tl = lowVal;
        if (lastclose != 0 && lastclose < lowVal) {
            tl = lastclose;
        }
        let tr = highVal - tl;
        if (lastclose - lowVal > tr) {
            tr = lastclose - lowVal;
        }
        let dmplus = 0.0, dmminus = 0.0;
        if (n !== 0) {
            dmplus = highVal - lasthigh;
            dmminus = lastlow - lowVal;
            if (dmplus < 0.0) {
                dmplus = 0.0;
            }
            if (dmminus < 0.0) {
                dmminus = 0.0;
            }
            if (dmplus > 0.0 & dmminus > 0.0) {
                if (dmplus > dmminus) {
                    dmminus = 0.0;
                } else {
                    dmplus = 0.0;
                }
            }
        }
        emDMP = emfrac * dmplus + omemfrac * emDMP;
        emDMN = emfrac * dmminus + omemfrac * emDMN;
        emTR = emfrac * tr + omemfrac * emTR;
        let dip = emDMP / emTR;
        let din = emDMN / emTR;
        let diff = Math.abs(dip - din);
        let sum = dip + din;
        let dx = 0.0;
        if (sum > 0.00001) {
            dx = diff / sum;
        }
        emADX = emfrac * dx + omemfrac * emADX;
        this._adx.append(i._d, emADX * 100.0);
        // calculate the adx we want to compare it with
        let offset = n + 1 - this._adxrPeriod;
        if (offset >= 0){
            let lastAdx = this._lastAdxs[offset];
            this._adxr.append(i._d, ((emADX* 100.0) + lastAdx)/2);
        }
        // iterate
        n++;
        lastclose = close;
        lasthigh = highVal;
        lastlow = lowVal;
        this._lastAdxs[n] = (emADX * 100.0);
    } while (i.move());
}
/** @override */
StudyADXR.prototype.getMaxMin = function(i) {
    this._range.reset();
    this._range.getMaxMin(this._adx, i);
    this._range.getMaxMin(this._adxr, i);
}
/** @override */
StudyADXR.prototype.draw = function() {
    this.updateY();
    this._parent.drawLineNormal(this._adx, Color.gray);
    this._parent.drawLineNormal(this._adxr, Color.blue);
}
/** @override */
StudyADXR.prototype.getColumnNames = function() {
    return [this._name, ""];
}
/** @override */
StudyADXR.prototype.getColumnValues = function(d) {
    return [this.d(this._adx.get(d)), this.d(this._adxr.get(d))];
}