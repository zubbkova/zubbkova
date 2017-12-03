/* global Study, Series, StudyDialog_StudyEditParameter, Language, Utils, TimeIterator */
/**
 * @constructor
 * @extends {Study}
 * @param {Overlay} o
 */
function StudyCoppock(o) {
    this._maperiod = 22;
    this._rocperiod = 250;
    this._emaperiod = 150;
    this._maseries = new Series();
    this._rocseries = new Series();
    this._emaseries = new Series();
    this._series = new Series();
    Study.call(this, o);
}
/**
 * Inheriting
 */
StudyCoppock.prototype = Object.create(Study.prototype);
StudyCoppock.prototype.constructor = StudyCoppock;
/** @static */
StudyCoppock.getItems = function() {
    return [new StudyDialog_StudyEditParameter("maperiod", Language.getString("toolbardialogs_sma")),
                new StudyDialog_StudyEditParameter("rocperiod", Language.getString("toolbardialogs_roc")),
                new StudyDialog_StudyEditParameter("emaperiod", Language.getString("toolbardialogs_ema"))];
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyCoppock.newInstance = function(o) {
    return new StudyCoppock(o);
}
/** @static */
StudyCoppock.mnemonic = "Coppock";
/** @static */
StudyCoppock.helpID = 496;
/** @static */
StudyCoppock.ownOverlay = true;
/** @override */
StudyCoppock.prototype.setName = function() {
    this._name = Language.getString("study_coppockcurve") + " (" + this._maperiod + "," + this._rocperiod + "," + this._emaperiod + ")";
}
/** @override */
StudyCoppock.prototype.getParams = function() {
    return "maperiod-" + this._maperiod + ":rocperiod-" + this._rocperiod + ":emaperiod-" + this._emaperiod;
}
/** @override */
StudyCoppock.prototype.setParams = function(params) {
    var items = Utils.convertStringParams(params, ":", "-"); 
    if (items.hasOwnProperty("maperiod") && typeof items["maperiod"] !== "undefined")
        this._maperiod = parseInt(items["maperiod"], 10);
    if (items.hasOwnProperty("rocperiod") && typeof items["rocperiod"] !== "undefined")
        this._rocperiod = parseInt(items["rocperiod"], 10);
    if (items.hasOwnProperty("emaperiod") && typeof items["emaperiod"] !== "undefined")
        this._emaperiod = parseInt(items["emaperiod"], 10);
    Study.prototype.setParams.call(this, params);
}
/** @override */
StudyCoppock.prototype.update = function(start, end) {
    // todo: fix for now    
    if (parseInt(this._parent._chart._currentSymbol._lowTarget.getFullYear(), 10) > 2001) {
        this._parent._chart._currentSymbol._lowTarget.setFullYear(2001);
    }
    //
    var pos = 0, n = 0;
    var i = TimeIterator.forwardRangeIterator(this._parent._chart.getMasterTimeList(), start, end);
    this._maseries.clear();
    this._rocseries.clear();
    this._emaseries.clear();
    this._series.clear();
    // process all the ma stuff into its series
    var matotal = 0.0;
    var mabuffer = new Array(this._maperiod);
    mabuffer.fillArrayWithValue(0.0);
    for (; n < this._maperiod; i.move()) {
        mabuffer[n] = this._source.get(i._d);
        matotal += mabuffer[n];
        this._maseries.append(i._d, matotal / (++n));
    }
    do {
        var curval = this._source.get(i._d);
        matotal -= mabuffer[pos];
        matotal += curval;
        mabuffer[pos] = curval;
        if (++pos === this._maperiod)
            pos = 0;
        this._maseries.append(i._d, matotal / this._maperiod);
    } while (i.move());

    // process roc of the ma values
    n = 0;
    i = TimeIterator.forwardRangeIterator(this._parent._chart.getMasterTimeList(), start, end);
    for (; n < this._rocperiod; i.move(), n++) {
        this._rocseries.append(i._d, 0.0);
    }
    do {
        if (this._maseries.get(this._parent._chart.timeAdjust(i._d, -this._rocperiod)) !== 0.0) {
            var previousroc = this._maseries.get(this._parent._chart.timeAdjust(i._d, -this._rocperiod));
            // new roc is the percentage of change.
            this._rocseries.append(i._d, 100.0*(this._maseries.get(i._d)-previousroc) / previousroc);
        } else {
            this._rocseries.append(i._d, 0.0);
        }
    } while (i.move());
    // process ema of roc values
    n = 0;
    var ematotal = 0.0;
    var current = 0.0;
    i = TimeIterator.forwardRangeIterator(this._parent._chart.getMasterTimeList(), start, end);
    // Use simple average for initial period.
    for (; n < this._emaperiod; i.move()) {
        ematotal += this._rocseries.get(i._d);
        current = ematotal / (++n);
        this._emaseries.append(i._d, current);
    }
    // Use exp. average for the rest.
    var smooth = 2.0 / (1 + this._emaperiod);
    do {
        current = current + smooth * (this._rocseries.get(i._d) - current);
        this._emaseries.append(i._d, current);
    } while (i.move());
    // put into series
    i = TimeIterator.forwardRangeIterator(this._parent._chart.getMasterTimeList(), start, end);
    do {
        // removed the /100, is it necessary?
        this._series.append(i._d, (this._emaseries.get(i._d)));
    } while(i.move());
}
/** @override */
StudyCoppock.prototype.getRange = function() {
    return Math.max(this._maperiod, Math.max(this._rocperiod, this._emaperiod));
}