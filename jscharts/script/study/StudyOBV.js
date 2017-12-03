/* global Study, Series, Language, TimeIterator */
/**
 * @constructor
 * @extends {Study}
 * @param {Overlay} o
 */
function StudyOBV(o) {
    Study.call(this, o);
    this._series = new Series();
    this._name = Language.getString("study_onbalancevolume");
}
/**
 * Inheriting
 */
StudyOBV.prototype = Object.create(Study.prototype);
StudyOBV.prototype.constructor = StudyOBV;
/** @static */
StudyOBV.getItems = function() {
    return [];
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyOBV.newInstance = function(o) {
    return new StudyOBV(o);
}
/** @static */
StudyOBV.mnemonic = "OBV";
/** @static */
StudyOBV.helpID = 476;
/** @static */
StudyOBV.ownOverlay = true;
/** @override */
StudyOBV.prototype.update = function(start, end) {
    this._series.clear();
    var i = TimeIterator.forwardRangeIterator(this._parent._chart.getMasterTimeList(), start, end);
    var obv = 0.0;
    var lastclose = -1.0;
    do {
        var closeVal = this._close.get(i._d);
        var volVal = this._vol.get(i._d);
        if (lastclose > 0 && lastclose !== closeVal) {
            obv += volVal * ((closeVal > lastclose) ? 1 : -1);
        }
        lastclose = closeVal;
        this._series.append(i._d, obv);
    } while (i.move());
}