/**
 * ---------
 * ChartInfo
 * ---------
 * @constructor
 * @param {string=} s - symbols
 */
function ChartInfo(s) {
    this._delay = 0;
    if (s) this.setSymbol(s);
}
/**
 * @param {string} s
 */
ChartInfo.prototype.setSymbol = function(s) {
    this._symbol = s;
    this._market = s.substring(0, s.indexOf("^"));
}
/**
 * @param {string} curr
 */
ChartInfo.prototype.isCurrency = function(curr) {
    if (curr === "GBX" && "GBP" === this._currency) return true;
    if (curr === "GBP" && "GBX" === this._currency) return true;
    return this.getCurrency() === curr;
}
ChartInfo.prototype.toString = function() {
    return this._symbol + ":" + this._displayName;
}
ChartInfo.prototype.getBidPrice = function() {
    return this._bidPrice;
}
ChartInfo.prototype.getCurPrice = function() {
    return this._curPrice;
}
ChartInfo.prototype.getHighPrice = function() {
    return this._highPrice;
}
ChartInfo.prototype.getLowPrice = function() {
    return this._lowPrice;
}
ChartInfo.prototype.getOfferPrice = function() {
    return this._offerPrice;
}
ChartInfo.prototype.getOpenPrice = function() {
    return this._openPrice;
}
ChartInfo.prototype.getYesterdaysClose = function() {
    return this._yesterdaysClose;
}
/**
 * @param {string} c
 */
ChartInfo.prototype.setCurrency = function(c) {
    this._currency = c;
}
ChartInfo.prototype.getCurrency = function() {
    return this._currency;
}
ChartInfo.prototype.getForexCurrency = function() {
    if (this._currency === "GBX") return "GBP";
    return this._currency;
}