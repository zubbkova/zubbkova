/**
 * @constructor
 * @extends {Study}
 * @param {Overlay} o
 */
function StudyDMI(o) {
    this._period = 14;
    this._showADX = true;
    this._showDMP = true;
    this._showDMN = true;
    this._adx = new Series();
    this._dmp = new Series();
    this._dmn = new Series();
    this._series = this._adx;
    this._lastADX = 0;
    this._status = 0;
    Study.call(this, o);
}
/**
 * Inheriting
 */
StudyDMI.prototype = Object.create(Study.prototype);
StudyDMI.prototype.constructor = StudyDMI;
/** @static */
StudyDMI.getItems = function() {
    return [new StudyDialog_StudyEditParameter("period", Language.getString("toolbardialogs_period")),
                new StudyDialog_StudyYesNoParameter("showADX", Language.getString("toolbardialogs_show_adx")),
                new StudyDialog_StudyYesNoParameter("showDMP", Language.getString("toolbardialogs_show_dm_plus")),
                new StudyDialog_StudyYesNoParameter("showDMN", Language.getString("toolbardialogs_show_dm_minus"))];
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyDMI.newInstance = function(o) {
    return new StudyDMI(o);
}
/** @static */
StudyDMI.mnemonic = "DMI";
/** @static */
StudyDMI.helpID = 433;
/** @static */
StudyDMI.ownOverlay = true;
/** @static */
StudyDMI.READY = 0;
/** @static */
StudyDMI.THINKSHORT = 1;
/** @static */
StudyDMI.THINKLONG = 2;
/** @static */
StudyDMI.SHORT = 3;
/** @static */
StudyDMI.LONG = 4;
/** @override */
StudyDMI.prototype.setName = function() {
    this._name = Language.getString("study_adxdmi") + " (" + this._period + "," + (this._showADX ? Language.getString("study_adx") : "") + "," + (this._showDMP ? Language.getString("study_dm_plus") : "") + "," + (this._showDMN ? Language.getString("study_dm_minus") : "") + ")";
}
/** @override */
StudyDMI.prototype.getParams = function() {
    return "period-" + this._period + ":showADX-" + this._showADX + ":showDMP-" + this._showDMP + ":showDMN-" + this._showDMN;
}
/** @override */
StudyDMI.prototype.setParams = function(params) {
    let items = Utils.convertStringParams(params, ":", "-");
    if (items.has("period"))
        this._period = parseInt(items.get("period"), 10);
    if (items.has("showADX"))
        this._showADX = items.get("showADX").toString() === "true";
    if (items.has("showDMP"))
        this._showDMP = items.get("showDMP").toString() === "true";
    if (items.has("showDMN"))
        this._showDMN = items.get("showDMN").toString() === "true";
    Study.prototype.setParams.call(this, params);
}
/** @override */
StudyDMI.prototype.update = function(start, end) {
    this._adx.clear();
    this._dmp.clear();
    this._dmn.clear(); // clear output
    let i = TimeIterator.forwardRangeIterator(this._parent._chartCanvas._chart.getMasterTimeList(), start, end);
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
    this._initSignal();
    do {
        let d = i._d;
        let closeVal = this._close.get(d);
        let highVal = this._high.get(d);
        let lowVal = this._low.get(d);
        let tl = lowVal;
        if (lastclose !== 0 && lastclose < lowVal) {
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
        this._dmp.append(d, dip * 100.0);
        this._dmn.append(d, din * 100.0);
        let diff = Math.abs(dip - din);
        let sum = dip + din;
        let dx = 0.0;
        if (sum > 0.00001) {
            dx = diff / sum;
        }
        emADX = emfrac * dx + omemfrac * emADX;
        this._adx.append(d, emADX * 100.0);
        n++;
        lastclose = closeVal;
        lasthigh = highVal;
        lastlow = lowVal;
        this._calcSignal(d, emADX, dip, din);
    } while (i.move());
}
/** @private */
StudyDMI.prototype._initSignal = function() {
    this._lastADX = 0.0;
    this._status = 0;
}
/** 
 * @private 
 * @param {Date} d
 * @param {number} adx
 * @param {number} dip
 * @param {number} din
 */
StudyDMI.prototype._calcSignal = function(d, adx, dip, din) {
    let changed = false;
    if (this._status < 3) {
        if (this._status !== StudyDMI.THINKSHORT && din > dip) {
            this._status = StudyDMI.THINKSHORT;
            changed = true;
        } else if (this._status !== StudyDMI.THINKLONG && dip > din) {
            this._status = StudyDMI.THINKLONG;
            changed = true;
        }
    }
    if (!changed) {
        switch (this._status) {
            case StudyDMI.THINKSHORT:
                if (adx > din && adx > this._lastADX) {
                    this._parent._chartCanvas._chart._signals.addSell(d);
                    this._status = StudyDMI.SHORT;
                }
                break;
            case StudyDMI.THINKLONG:
                if (adx > dip && adx > this._lastADX) {
                    this._parent._chartCanvas._chart._signals.addBuy(d);
                    this._status = StudyDMI.LONG;
                }
                break;
            case StudyDMI.LONG:
                if (adx < this._lastADX || dip <= din) {
                    this._parent._chartCanvas._chart._signals.addBuyExit(d);
                    this._status = StudyDMI.READY;
                }
                break;
            case StudyDMI.SHORT:
                if (adx < this._lastADX || din <= dip) {
                    this._parent._chartCanvas._chart._signals.addSellExit(d);
                    this._status = StudyDMI.READY;
                }
                break;
        }
    }
    this._lastADX = adx;
}
/** @override */
StudyDMI.prototype.getMaxMin = function(i) {
    this._range.reset();
    this._range._max = 100.0;
    this._range._min = 0.0;
}
/** @override */
StudyDMI.prototype.draw = function() {
    this.updateY();
     if (this._showADX)
        this._parent.drawLineNormal(this._adx, Color.black);
    if (this._showDMN)
        this._parent.drawLineNormal(this._dmn, Color.red);
    if (this._showDMP)
        this._parent.drawLineNormal(this._dmp, Color.brightGreen);
}
/** @override */
StudyDMI.prototype.getColumnNames = function() {
    return [this._name, "", ""];
}
/** @override */
StudyDMI.prototype.getColumnValues = function(d) {
    return [this.d(this._adx.get(d)), this.d(this._dmn.get(d)), this.d(this._dmp.get(d))];
}