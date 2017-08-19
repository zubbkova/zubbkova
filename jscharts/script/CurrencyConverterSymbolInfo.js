/**
 * ---------------------------
 * CurrencyConverterSymbolInfo
 * ---------------------------
 * @constructor
 * @extends {RelativeSymbolInfo}
 * @param {ChartInfo} base
 * @param {number} er - exchange rate
 */
function CurrencyConverterSymbolInfo(base, er) {
    RelativeSymbolInfo.call(this, base);
    this._exchangeRate = er;
    if (base.getCurrency() === 'GBX') 
        this._exchangeRate /= 100.0;
}
/**
 * Inheriting
 */
CurrencyConverterSymbolInfo.prototype = Object.create(RelativeSymbolInfo.prototype);
CurrencyConverterSymbolInfo.prototype.constructor = CurrencyConverterSymbolInfo;
/** @override */
CurrencyConverterSymbolInfo.prototype.modify = function(v) {
    return v * this._exchangeRate;
}