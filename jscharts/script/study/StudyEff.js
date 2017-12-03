/* eslint no-unused-vars: "off" */
/* global Study, Language, XTIterator, Color */
/**
 * @constructor
 * @extends {Study}
 * @param {Overlay} o
 */
function StudyEff(o) {
    Study.call(this, o);
    this._count = new Array(StudyEff.COLUMNS);
    this._count.fillArrayWithValue(0);
    this._volumes = new Array(StudyEff.COLUMNS);
    this._volumes.fillArrayWithValue(0);
    this._eff = new Array(StudyEff.COLUMNS);
    this._eff.fillArrayWithValue(0);
    this._name = Language.getString("study_volumeefficiency");
}
/**
 * Inheriting
 */
StudyEff.prototype = Object.create(Study.prototype);
StudyEff.prototype.constructor = StudyEff;
/** @static */
StudyEff.getItems = function() {
    return [];
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyEff.newInstance = function(o) {
    return new StudyEff(o);
}
/** @static */
StudyEff.mnemonic = "Eff";
/** @static */
StudyEff.helpID = 478;
/** @static */
StudyEff.ownOverlay = false;
/** @static */
StudyEff.COLUMNS = 50;
/** @override */
StudyEff.prototype.draw = function() {
    this.updateY();
    var yStart = this._parent._yMid - this._parent._ySpread / 2;
    var yInterval = this._parent._ySpread / StudyEff.COLUMNS;
    var totalVol = 0;
    var i;
    // Have to calculate here because mid/spread values aren't set when update() is called.
    for (i = 0; i < StudyEff.COLUMNS; i++) {
        this._count[i] = 0;
        this._volumes[i] = 0;
        this._eff[i] = 0.0;
    }
    // Initial pass to calc total volume.
    i = XTIterator.reverseScreenIterator(this._parent._chart);
    var p = 0;
    do {
        totalVol += this._vol.get(i._d);
        p++;
    } while (i.move());
    if (p === 0 || totalVol === 0.0) {
        return;
    }
    i = XTIterator.reverseScreenIterator(this._parent._chart);
    var maxEff = 0.0;
    var aveVol = totalVol / p;
    do {
        if (i._d > this._source.timeByIndex(-1))
            continue;
        var closeVal = this._source.get(i._d);
        var highVal = this._high.get(i._d);
        var lowVal = this._low.get(i._d);
        var move = Math.abs(highVal - lowVal) / ((highVal + lowVal) / 2.0); // percentage move
        var pvol = this._vol.get(i._d);
        var hidx = parseInt((highVal - yStart) * 50.0 / this._parent._ySpread, 10);
        var lidx = parseInt((lowVal - yStart) * 50.0 / this._parent._ySpread, 10);
        if (hidx >= StudyEff.COLUMNS) {
            hidx = StudyEff.COLUMNS - 1;
        }
        if (lidx < 0) {
            lidx = 0;
        }
        if (move === 0.0) {
            continue;
        }
        if (closeVal !== -1.0) {
            for (var idx = lidx; idx <= hidx; idx++) {
                if (this._count[idx] === 0) {
                    this._eff[idx] = (pvol / aveVol) / move;
                } else {
                    this._eff[idx] *= (pvol / aveVol) / move;
                }
                this._count[idx]++;
                this._volumes[idx] += pvol;
            }
        }
    } while (i.move());
    var t;
    for (t = 0; t < StudyEff.COLUMNS; t++) {
        if (this._count[t] === 0) {
            continue;
        }
        this._eff[t] = Math.exp(Math.log(this._eff[t]) / this._count[t]);
        if (this._eff[t] > maxEff) {
            maxEff = this._eff[t];
        }
    }
    // Painting code.
    this._parent._chartCanvas.setFillColor(Color.cyan);
    if (this._parent._legend && this._parent._legend.getItem(this._legendIndex)) {
        this._parent._legend.getItem(this._legendIndex)._colour = Color.cyan;
    }
    for (t = 0; t < StudyEff.COLUMNS; t++) {
        var labely = yStart + t * yInterval;
        var curyb = parseInt(this._parent.getY(labely), 10);
        var curye = parseInt(this._parent.getY(labely + yInterval), 10);
        var width = parseInt(75 * this._eff[t] / maxEff, 10);
        this._parent._chartCanvas.fillRectWithAdjust(this._parent._chart._drawX + 1, curyb + 1, width, (curyb - curye) - 1);
    }
}
/** @override */
StudyEff.prototype.getMaxMin = function(i) {
    this._range.reset();
    this._range._min = this._close.get(this._parent._chart._currentSymbol._timeEnd);
    this._range._max = this._range._min;
}