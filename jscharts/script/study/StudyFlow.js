/**
 * @constructor
 * @extends {StudyWithPeriod}
 * @param {Overlay} o
 */
function StudyFlow(o) {
    StudyWithPeriod.call(this, o, 21);
}
/**
 * Inheriting
 */
StudyFlow.prototype = Object.create(StudyWithPeriod.prototype);
StudyFlow.prototype.constructor = StudyFlow;
/** @static */
StudyFlow.getItems = function() {
    return StudyWithPeriod.getItems();
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyFlow.newInstance = function(o) {
    return new StudyFlow(o);
}
/** @static */
StudyFlow.mnemonic = "Flow";
/** @static */
StudyFlow.helpID = 461;
/** @static */
StudyFlow.ownOverlay = true;
/** @override */
StudyFlow.prototype.setName = function() {
    this._name = Language.getString("study_moneyflow") +" (" + this._period + ")";
}
/** @override */
StudyFlow.prototype.update = function(start, end) {
    let totalc = 0.0, totalv = 0.0;
    let n = 0, pos = 0;
    let bufferc = new Array(this._period);
    bufferc.fill(0.0);
    let bufferv = new Array(this._period);
    bufferv.fill(0.0);
    this._series.clear();
    let i = TimeIterator.forwardRangeIterator(this._parent._chartCanvas._chart.getMasterTimeList(), start, end);
    let yestClose = 0.0;
    for (; n < this._period; i.move(), n++) {
        let curClose = this._close.get(i._d);
        let curHigh = this._high.get(i._d);
        let curLow = this._low.get(i._d);
        let curVol = this._vol.get(i._d);
        if (n !== 0){
            if (yestClose > curHigh){
                curHigh = yestClose;
            } else if (yestClose < curLow){
                curLow = yestClose;
            }
        }
        if (curHigh === curLow) {
            bufferc[n] = 0.0;
        } else {
            bufferc[n] = (curClose - curLow) - (curHigh - curClose);
            bufferc[n] /= (curHigh - curLow);
            bufferc[n] *= curVol;
        }
        totalc += bufferc[n];
        bufferv[n] = curVol;
        totalv += bufferv[n];
        yestClose = curClose;
        this._series.append(i._d, totalc / totalv);
    }
    do {
        let curClose = this._close.get(i._d);
        let curHigh = this._high.get(i._d);
        let curLow = this._low.get(i._d);
        let curVol = this._vol.get(i._d);
        if (yestClose > curHigh){
            curHigh = yestClose;
        } else if (yestClose < curLow){
            curLow = yestClose;
        }            
        totalc -= bufferc[pos];
        if (curHigh === curLow) {
            bufferc[pos] = 0.0;
        } else {
            bufferc[pos] = (curClose - curLow) - (curHigh - curClose);
            bufferc[pos] /= (curHigh - curLow);
            bufferc[pos] *= curVol;
        }
        totalc += bufferc[pos];
        totalv -= bufferv[pos];
        bufferv[pos] = curVol;
        totalv += bufferv[pos];
        if (++pos === this._period)
            pos = 0;
        this._series.append(i._d, totalc / totalv);
        yestClose = curClose;
    } while (i.move());
}