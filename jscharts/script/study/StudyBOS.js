/* eslint no-unused-vars: "off" */
/* global Study, Series, StudyDialog_StudyRadioParameter, StudyDialog_StudyYesNoParameter, Language, Chart, Utils, MetaStudy, Color */
/**
 * @constructor
 * @extends {Study}
 * @param {Overlay} o
 */
function StudyBOS(o) {
    Study.call(this, o);
    this._format = StudyBOS.SHADING;
    this._mid = new Series();
    this._series = this._mid;
    this._isIndex = false;
    this._doNotDisplay = false;
}
/**
 * Inheriting
 */
StudyBOS.prototype = Object.create(Study.prototype);
StudyBOS.prototype.constructor = StudyBOS;
/** @static */
StudyBOS.getItems = function() {
    return [new StudyDialog_StudyRadioParameter("format", [Language.getString("toolbardialogs_none"), Language.getString("toolbardialogs_lines"), Language.getString("toolbardialogs_shading")]), new StudyDialog_StudyYesNoParameter("checked", Language.getString("toolbardialogs_midline"))];
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyBOS.newInstance = function(o) {
    return new StudyBOS(o);
}
/** @static */
StudyBOS.mnemonic = "BOS";
/** @static */
StudyBOS.helpID = 424;
/** @static */
StudyBOS.ownOverlay = false;
/** @static */
StudyBOS.NO_BO = 0;
/** @static */
StudyBOS.LINES_BO = 1;
/** @static */
StudyBOS.SHADING = 2;
/** @override */
StudyBOS.prototype.updateDefaultDataSource = function() {
    Study.prototype.updateDefaultDataSource.call(this);
    this._bid = this._parent._chart.getSeries(Chart.S_BID_CLOSE);
    this._offer = this._parent._chart.getSeries(Chart.S_OFFER_CLOSE);
}
/** @override */
StudyBOS.prototype.setName = function() {
    if (this._format === StudyBOS.LINES_BO || this._format == StudyBOS.SHADING)
        this._name = Language.getString("study_bidofferspread");
    else if (this._format === 3)
        this._name = Language.getString("study_bidoffermidpoint");
    else
        this._name = Language.getString("study_bidofferspread");
}
/** @override */
StudyBOS.prototype.getParams = function() {
    return "format-" + this._format;
}
/** @override */
StudyBOS.prototype.setParams = function(params) {
    var items = Utils.convertStringParams(params, ":", "-"); 
    if (items.hasOwnProperty("format") && typeof items["format"] !== "undefined")
        this._format = parseInt(items["format"], 10);
    Study.prototype.setParams.call(this, params);
}
/** @override */
StudyBOS.prototype.update = function(start, end) {
    var c = this._parent._chart;
    this._doNotDisplay = false;
    // do not display Bid/Offer spread on TSE or NYSE if the user does not have realtime data enabled.
    if ("NY" === c._currentSymbol.getSymbolInfo(0)._market || "JSX" === c._currentSymbol.getSymbolInfo(0)._market) {
        if ((c._parent._loader._symbolInfo.get(c._currentSymbol.mainSymbol()))._delay > 0) {
            this._doNotDisplay = true;
        }
    }
    // added a handler to exclude forex markets too
    this._isIndex = c._currentSymbol.getSymbolInfo(0)._type === "IX" || "FX2" === c._currentSymbol.getSymbolInfo(0)._market;
    if (!this._isIndex && this._format > 2) {
        this._mid = MetaStudy.averageSeriesTwo(c, this._bid, this._offer);
    }
}
/** @override */
StudyBOS.prototype.getMaxMin = function(i) {
    if (!this._isIndex) {
        this.updateDefaultDataSource();
        this._range.reset();
        // test the series are not empty
        if ((this._format % 3 > 0) && this._bid && this._bid.size() > 0 && this._offer && this._offer.size() > 0) {
            this._range.getMaxMin(this._bid, i);
            i.reset();
            this._range.getMaxMin(this._offer, i);
        } else {
            this._range.getMaxMin(this._mid, i);
        }
    }
}
/** @override */
StudyBOS.prototype.drawPrice = function() {
    if (!this._isIndex && !this._doNotDisplay) {
        if (this._format % 3 === StudyBOS.LINES_BO) {
            if (this._format > 2) {
                this._parent.drawPrice(this._mid.get(this._parent._chart._currentSymbol._timeEnd), this._colour);
            }
            this._parent.drawPrice(this._bid.get(this._parent._chart._currentSymbol._timeEnd), Color.blue);
            this._parent.drawPrice(this._offer.get(this._parent._chart._currentSymbol._timeEnd), Color.red);
        }
    }
}
/** @override */
StudyBOS.prototype.draw = function() {
    this.updateY();
    if (!this._isIndex && !this._doNotDisplay) {
        this.updateDefaultDataSource();
        if (this._format % 3 === StudyBOS.SHADING) {
            this._parent.drawShading(this._bid, this._offer, new Color(0.8, 0.8, 0.8));
            if (this._format > 2)
                this._parent.drawLineNormal(this._mid, Color.white);
        } else if (this._format % 3 === StudyBOS.LINES_BO) {
            if (this._format > 2) {
                this._parent.drawLineNormal(this._mid, this._colour);
            }
            this._parent.drawLineNormal(this._bid, Color.blue);
            this._parent.drawLineNormal(this._offer, Color.red);
        } else if (this._format % 3 === StudyBOS.NO_BO) {
            this._parent.drawLineNormal(this._mid, Color.yellow);            	
        }
    }
}
/** @override */
StudyBOS.prototype.getColumnNames = function() {
    var s = this._parent._chart._currentSymbol.mainSymbol();
    return [s + " Bid", s + "Offer"];
}
/** @override */
StudyBOS.prototype.getColumnValues = function(d) {
    return [this.d(this._bid.get(d)), this.d(this._offer.get(d))]
}