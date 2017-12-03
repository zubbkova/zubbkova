/* global StudyWithPeriod, Series, Language, TimeIterator */
/**
 * @constructor
 * @extends {StudyWithPeriod}
 * @param {Overlay} o
 */
function StudyMom(o) {
    StudyWithPeriod.call(this, o, 15);
    this._series = new Series();
}
/**
 * Inheriting
 */
StudyMom.prototype = Object.create(StudyWithPeriod.prototype);
StudyMom.prototype.constructor = StudyMom;
/** @static */
StudyMom.getItems = function() {
    return StudyWithPeriod.getItems();
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyMom.newInstance = function(o) {
    return new StudyMom(o);
}
/** @static */
StudyMom.mnemonic = "Mom";
/** @static */
StudyMom.helpID = 437;
/** @static */
StudyMom.ownOverlay = true;
/** @override */
StudyMom.prototype.setName = function() {
    this._name = Language.getString("study_momentum") + " (" + this._period + ")";
}
/** @override */
StudyMom.prototype.update = function(start, end) {
    var n = 0;
    this._series.clear();
    var i = TimeIterator.forwardRangeIterator(this._parent._chart.getMasterTimeList(), start, end);
    for (; n < this._period; i.move(), n++)
        this._series.append(i._d, 0.0);
    do {
        if (this._source.get(this._parent._chart.timeAdjust(i._d, -this._period)) !== 0.0)
            this._series.append(i._d, this._source.get(i._d) - this._source.get(this._parent._chart.timeAdjust(i._d, -this._period)));
    } while (i.move());
}