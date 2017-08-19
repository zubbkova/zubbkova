/**
 * @constructor
 * @extends {Study}
 * @param {Overlay} o
 */
function StudyAccDst(o) {
    Study.call(this, o);
    this._series = new Series();
    this._name = Language.getString("study_accumulationdistribution");
}
/**
 * Inheriting
 */
StudyAccDst.prototype = Object.create(Study.prototype);
StudyAccDst.prototype.constructor = StudyAccDst;
/** @static */
StudyAccDst.getItems = function() {
    return [];
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyAccDst.newInstance = function(o) {
    return new StudyAccDst(o);
}
/** @static */
StudyAccDst.mnemonic = "AccDst";
/** @static */
StudyAccDst.helpID = 432;
/** @static */
StudyAccDst.ownOverlay = true;
/** @override */
StudyAccDst.prototype.update = function(start, end) {
    this._series.clear();
    let i = TimeIterator.forwardRangeIterator(this._parent._chartCanvas._chart.getMasterTimeList(), start, end);
    do {
        let curClose = this._close.get(i._d);
        if (curClose === 0.0)
            continue;
        let curHigh = this._high.get(i._d);
        let curLow = this._low.get(i._d);
        let curVol = this._vol.get(i._d);
        if (curHigh === curLow) {
            this._series.append(i._d, 0.0);
        } else {
            let v = (curClose - curLow) - (curHigh - curClose);
            v /= (curHigh - curLow);
            v *= curVol;
            this._series.append(i._d, v);
        }
    } while (i.move());
}