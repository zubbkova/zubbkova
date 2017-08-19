/**
 * ------------------
 * RelativeSymbolInfo
 * ------------------
 * @constructor
 * @extends {ChartInfo}
 * @param {ChartInfo} base
 * @param {ChartSymbolSet=} css
 * @param {DataSeries=} o
 */
function RelativeSymbolInfo(base, css, o) {
    ChartInfo.call(this, base._symbol);
    this._symbolSet = css;
    this._relativeSeries = o;
    this._displaySymbol = base._displaySymbol;
    this._displayName = base._displayName;
    this._type = base._type;
    this.setCurrency(base.getCurrency());
    this._yesterdaysClose = base._yesterdaysClose;
    this._openPrice = base._openPrice;
    this._highPrice = base._highPrice;
    this._lowPrice = base._lowPrice;
    this._curPrice = base._curPrice;
    this._bidPrice = base._bidPrice;
    this._offerPrice = base._offerPrice;
    this._buyVolume = base._buyVolume;
    this._sellVolume = base._sellVolume;
    this._totalVolume = base._totalVolume;
    this._delay = base._delay;
    this._marketOpen = base._marketOpen;
    this._marketClose = base._marketClose;
    this._time = base._time;
    this._datacache_intra = base._datacache_intra;
    this._datacache_daily = base._datacache_daily;
}
/**
 * Inheriting
 */
RelativeSymbolInfo.prototype = Object.create(ChartInfo.prototype);
RelativeSymbolInfo.prototype.constructor = RelativeSymbolInfo;
RelativeSymbolInfo.prototype.getBidPrice = function() {
    return this.modify(ChartInfo.prototype.getBidPrice.call(this));
}
RelativeSymbolInfo.prototype.getCurPrice = function() {
    return this.modify(ChartInfo.prototype.getCurPrice.call(this));
}
RelativeSymbolInfo.prototype.getHighPrice = function() {
    return this.modify(ChartInfo.prototype.getHighPrice.call(this));
}
RelativeSymbolInfo.prototype.getLowPrice = function() {
    return this.modify(ChartInfo.prototype.getLowPrice.call(this));
}
RelativeSymbolInfo.prototype.getOfferPrice = function() {
    return this.modify(ChartInfo.prototype.getOfferPrice.call(this));
}
RelativeSymbolInfo.prototype.getOpenPrice = function() {
    return this.modify(ChartInfo.prototype.getOpenPrice.call(this));
}
RelativeSymbolInfo.prototype.getYesterdaysClose = function() {
    return this.modify(ChartInfo.prototype.getYesterdaysClose.call(this));
}
/**
 * @param {number} v
 * @returns {number}
 */
RelativeSymbolInfo.prototype.modify = function(v) {}