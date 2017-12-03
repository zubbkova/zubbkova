/* global Study, Series, Language, Utils, StudyDialog_StudyRadioParameter, StudyVWAPFeed, Color */
/**
 * Plot the VWAP given to us by the LSE.  It comes straight from the streamer, so start a feed to obtain it.
 * As it comes from the Streamer we can only plot it realtime, and without any tailoring of eg period.
 * This obviously will only work on LSE stocks (check to see if indices work too)
 * 
 * @author davidw
 *
 * @constructor
 * @extends {Study}
 * @param {Overlay} o
 */
function StudyVWAP(o) {
    this._lineType = StudyVWAP.CANDLES;
    this._high = new Series();
    this._low = new Series();
    this._open = new Series();
    this._close = new Series();
    Study.call(this, o);
    this._initialiseFeed();
    this._name = Language.getString("study_VWAP");
}
/**
 * Inheriting
 */
StudyVWAP.prototype = Object.create(Study.prototype);
StudyVWAP.prototype.constructor = StudyVWAP;
/** @static */
StudyVWAP.getItems = function() {
    return [new StudyDialog_StudyRadioParameter("lineType", [Language.getString("toolbardialogs_line"), Language.getString("toolbardialogs_candle")])];
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyVWAP.newInstance = function(o) {
    return new StudyVWAP(o);
}
/** @static */
StudyVWAP.mnemonic = "VWAP";
/** @static */
StudyVWAP.helpID = 2098;
/** @static */
StudyVWAP.ownOverlay = false;
/** @static */
StudyVWAP.LINE = 0;
/** @static */
StudyVWAP.CANDLES = 1;
StudyVWAP.prototype._initialiseFeed = function() {
    this._feed = new StudyVWAPFeed(this);
}
/** @override */
StudyVWAP.prototype.drawPrice = function() {
    this._parent.drawPrice(this._close.get(this._parent._chart._currentSymbol._timeEnd), this._colour);
}
/** @override */
StudyVWAP.prototype.draw = function() {
    this.updateY();
    if (this._lineType === StudyVWAP.LINE) {
        this._parent.drawLineNormal(this._close, this._colour);
    } else {
        this._parent.drawCandle(this._open, this._high, this._low, this._close, this._colour, Color.white, this._colour);
    }
}
/** @override */
StudyVWAP.prototype.restartStudy = function() {
    this._high = new Series();
    this._low = new Series();
    this._open = new Series();
    this._close = new Series();
    // restart the feed
    if (this._feed) 
        this._feed.stop();
    this._initialiseFeed();
}
/** @override */
StudyVWAP.prototype.destroy = function() {
    Study.prototype.destroy.call(this);
    if (this._feed)
        this._feed.stop();
}
/** @override */
StudyVWAP.prototype.getParams = function() {
    return "lineType-" + this._lineType;
}
/** @override */
StudyVWAP.prototype.setParams = function(params) {
    var items = Utils.convertStringParams(params, ":", "-"); 
    if (items.hasOwnProperty("lineType") && typeof items["lineType"] !== "undefined")
        this._lineType = parseInt(items["lineType"], 10);
    Study.prototype.setParams.call(this, params);
}