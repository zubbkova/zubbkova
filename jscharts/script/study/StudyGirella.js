/* global Study, Series, Language, MetaStudy, Chart, TimeIterator, Color, StudySymbol */
/**
 * @constructor
 * @extends {Study}
 * @param {Overlay} o
 */
function StudyGirella(o) {
    this._mad = new Series();
    this._movingMad = new Series();
    this._line = new Series();
    this._trend = new Series();
    this._girellaRed = new Series();
    this._girellaGreen = new Series();
    Study.call(this, o);
}
/**
 * Inheriting
 */
StudyGirella.prototype = Object.create(Study.prototype);
StudyGirella.prototype.constructor = StudyGirella;
/** @static */
StudyGirella.getItems = function() {
    return [];
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyGirella.newInstance = function(o) {
    return new StudyGirella(o);
}
/** @static */
StudyGirella.mnemonic = "Girella";
/** @static */
StudyGirella.helpID = 2259;
/** @static */
StudyGirella.ownOverlay = false;
/** @override */
StudyGirella.prototype.setName = function() {
    this._name = Language.getString("study_girella");
}
/** @override */
StudyGirella.prototype.update = function(start, end) {
    var c = this._parent._chart;
    this._mad.clear();
    this._movingMad.clear();
    this._line.clear();
    this._trend.clear();
    this._girellaRed.clear();
    this._girellaGreen.clear();
    this._mad = MetaStudy.sumSeries(c, 
                                    MetaStudy.divideSeries(c, MetaStudy.sumSeries(c, MetaStudy.offsetSeries(c, c.getSeries(Chart.S_CUR_OPEN), -3), c.getSeries(Chart.S_CUR_OPEN)), MetaStudy.sumSeries(c, MetaStudy.offsetSeries(c, c.getSeries(Chart.S_CUR_HIGH), -3), c.getSeries(Chart.S_CUR_HIGH))), 
                                    MetaStudy.divideSeries(c, MetaStudy.sumSeries(c, MetaStudy.offsetSeries(c, c.getSeries(Chart.S_CUR_CLOSE), -3), c.getSeries(Chart.S_CUR_CLOSE)), MetaStudy.sumSeries(c, MetaStudy.offsetSeries(c,c.getSeries(Chart.S_CUR_LOW), -3), c.getSeries(Chart.S_CUR_LOW)))
                                   );
    this._movingMad = MetaStudy.SMA(c, this._mad, 5);
    this._line = MetaStudy.averageSeriesTwo(c, c.getSeries(Chart.S_CUR_HIGH), c.getSeries(Chart.S_CUR_LOW));
    this._trend = MetaStudy.SMA(c, this._line, 10);
    // some custom code to determine the Girella positions.
    var i = TimeIterator.forwardRangeIterator(c.getMasterTimeList(), start, end);
    do {
        if (this._line.get(i._d) < this._trend.get(i._d) && this._mad.get(i._d) > this._movingMad.get(i._d) &&
            c.getSeries(Chart.S_CUR_CLOSE).get(i._d) > c.getSeries(Chart.S_CUR_OPEN).get(i._d)) {
            this._girellaGreen.append(i._d, c.getSeries(Chart.S_CUR_LOW).get(i._d));
        }
        if (this._line.get(i._d) > this._trend.get(i._d) &&
            this._mad.get(i._d) < this._movingMad.get(i._d) && c.getSeries(Chart.S_CUR_CLOSE).get(i._d) < c.getSeries(Chart.S_CUR_OPEN).get(i._d)) {
            this._girellaRed.append(i._d, c.getSeries(Chart.S_CUR_HIGH).get(i._d));
        }
    } while(i.move());
}
/** @override */
StudyGirella.prototype.getMaxMin = function(i) {
    this._range.reset();
    this._range.getMaxMin(this._girellaGreen, i);
    this._range.getMaxMin(this._girellaRed, i);
}
/** @override */
StudyGirella.prototype.draw = function() {
    this.updateY();
    this._parent.drawSymbols(this._girellaRed, Color.red, StudySymbol.GIRELLA_ABOVE);
    this._parent.drawSymbols(this._girellaGreen, Color.brightGreen, StudySymbol.GIRELLA_BELOW);
}