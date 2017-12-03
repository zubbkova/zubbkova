/* global RelativeSeries */
/**
 * -----------------------
 * CurrencyConverterSeries
 * -----------------------
 * @constructor
 * @extends {RelativeSeries}
 * @param {DataSeries} b
 * @param {ChartSymbolSet} css
 * @param {DataSeries} forexSeries
 * @param {string} f - original currency
 */
function CurrencyConverterSeries(b, css, forexSeries, f) {
    RelativeSeries.call(this, b, css, forexSeries);
    this._originalCurrency = f;
}
/**
 * Inheriting
 */
CurrencyConverterSeries.prototype = Object.create(RelativeSeries.prototype);
CurrencyConverterSeries.prototype.constructor = CurrencyConverterSeries;
/** @override */
CurrencyConverterSeries.prototype.modify = function(d, v) {
    var currencyValue = this._relativeSeries.getUnscaled(d);
    if (this._originalCurrency === 'GBX') 
        currencyValue /= 100.0;
    return v * currencyValue;
}
/** @override */
CurrencyConverterSeries.prototype.toString = function() {
    var r = this.getRootSeries();
    return "CurrencyConverterSeries - {0} ({1}) field = {2} - using {3}".format(r._parent.getSymbol(), r._parent.getFrequency(), r._proxyField, this._relativeSeries._parent.getSymbol());
}