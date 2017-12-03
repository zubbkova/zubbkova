/* eslint no-unused-vars: "off" */
/* global Study, Series, Language, TimeIterator, Chart */
/**
 * @constructor
 * @extends {Study}
 * @param {Overlay} o
 */
function StudyReturns(o) {
    Study.call(this, o);
    this._series = new Series();
}
/**
 * Inheriting
 */
StudyReturns.prototype = Object.create(Study.prototype);
StudyReturns.prototype.constructor = StudyReturns;
/** @static */
StudyReturns.getItems = function() {
    return [];
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyReturns.newInstance = function(o) {
    return new StudyReturns(o);
}
/** @static */
StudyReturns.mnemonic = "Returns";
/** @static */
StudyReturns.helpID = 466;
/** @static */
StudyReturns.ownOverlay = true;
/** @override */
StudyReturns.prototype.updateDefaultDataSource = function() {
    Study.prototype.updateDefaultDataSource.call(this);
    this._bclose = this._parent._chart._currentSymbol.size() > 1 ? this._parent._chart.getSeries(Chart.S_OVERLAY) : undefined;
}
/** @override */
StudyReturns.prototype.setName = function() {
    this._name = Language.getString("study_logreturns");
    if (this._parent._chart._currentSymbol.size() > 1) {
        this._name += " " + Language.getString("study_relativeto") + " " + this._parent._chart._currentSymbol.getDisplaySymbol(1);
    }
}
/** @override */
StudyReturns.prototype.setParams = function(params) {}
/** @override */
StudyReturns.prototype.update = function(start, end) {
    this._series.clear();
    var i = TimeIterator.forwardRangeIterator(this._parent._chart.getMasterTimeList(), start, end);
    var lasta = this._close.get(i._d);
    var lastb = this._bclose ? this._bclose.get(i._d) : 1.0;
    this._series.append(i._d, 0.0);
    i.move();
    do {
        var a = this._close.get(i._d);
        var b = this._bclose ? this._bclose.get(i._d) : 1.0;
        var out = 0.0;
        if (a !== 0) {
            if (b !== 0) {
                out = Math.log(a / lasta) - Math.log(b / lastb);
            } else {
                out = Math.log(a / lasta);
            }
        }
        this._series.append(i._d, out);
        lasta = a;
        lastb = b;
    } while (i.move());
}