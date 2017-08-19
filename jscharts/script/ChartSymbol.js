/** 
 * -----------
 * ChartSymbol
 * -----------
 * @constructor
 * @param {Object} sym
 */
function ChartSymbol(sym) {
    this._feedSymbol = sym['FEED_SYMBOL'];
    this._displaySymbol = sym['DISPLAY_SYMBOL'];
    this._market = sym['MARKET'];
    this._displayMarket = sym['DISPLAY_MARKET'];
    this._name = sym['NAME'];
    this._symbol = sym['SYMBOL'];
    this._type = sym['TYPE'];
    this._marketSegment = sym['MARKET_SEGMENT'];
    this._currency = sym['CURRENCY'];
    this._ISIN = sym['ISIN'];
    let _jb = sym['ORDER_BOOKS'];
    if (_jb) {
        this._orderBooks = new Array(_jb.length);
        for (let i = 0; i < _jb.length; i++) {
            var jo = _jb[i];
            this._orderBooks[i] = new Symbol_OrderBook(jo); 
        }
    }
    let _jl = sym['TRADE_LISTS'];
    if (_jl) {
        this._tradeLists = new Array(_jl.length);
        for (let i = 0; i < _jl.length; i++) {
            let jt = _jl[i];
            this._tradeLists[i] = new Symbol_TradeList(jt);
        }
    }
}
ChartSymbol.prototype.getOrderBooks = function() {
    return this._orderBooks;
}
/**
 * @param {ChartSymbol} s
 */
ChartSymbol.prototype.equals = function(s) {
    return this._displaySymbol === s._displaySymbol;
}
ChartSymbol.prototype.getFeedSymbol = function() {
    return this._feedSymbol;
}
ChartSymbol.prototype.getDisplaySymbol = function() {
    return this._displaySymbol;
}
ChartSymbol.prototype.getMarket = function() {
    return this._market;
}
ChartSymbol.prototype.getDisplayMarket = function() {
    return this._displayMarket;
}
ChartSymbol.prototype.getSymbol = function() {
    return this._symbol;
}
ChartSymbol.prototype.getName = function() {
    return this._name;
}
ChartSymbol.prototype.getType = function() {
    return this._type;
}
ChartSymbol.prototype.getCurrency = function() {
    return this._currency;
}
/**
 * @constructor
 * @param {Object} jo
 */
function Symbol_OrderBook(jo) {
    this._feedSymbol = jo['FEED_SYMBOL'];
    this._market = jo['MARKET'];
    this._displayMarket = jo['DISPLAY_MARKET'];
    this._displaySymbol = jo['DISPLAY_SYMBOL"'];
    this._symbol = jo['SYMBOL'];
    this._currency = jo['CURRENCY'];
    this._entitled = jo['ENTITLED'];
}
Symbol_OrderBook.prototype.getMarket = function() {
    return this._market;
}
Symbol_OrderBook.prototype.getDisplayMarket = function() {
    return this._displayMarket;
}
Symbol_OrderBook.prototype.getSymbol = function() {
    return this._symbol;
}
Symbol_OrderBook.prototype.getFeedSymbol = function() {
    return this._feedSymbol;
}
Symbol_OrderBook.prototype.getCurrency = function() {
    return this._currency;
}
Symbol_OrderBook.prototype.isEntitled = function() {
    return this._entitled;
}
/**
 * ----------------
 * Symbol_TradeList
 * ----------------
 * @constructor
 * @param {Object} jo
 */
function Symbol_TradeList(jo) {
    this._feedSymbol = jo['FEED_SYMBOL'];
    this._market = jo['MARKET'];
    this._displayMarket = jo['DISPLAY_MARKET'];
    this._displaySymbol = jo['DISPLAY_SYMBOL'];
    this._symbol = jo['SYMBOL'];
    this._currency = jo['CURRENCY'];
    this._entitled = jo['ENTITLED'];
}
Symbol_TradeList.prototype.getMarket = function() {
    return this._market;
}
Symbol_TradeList.prototype.getSymbol = function() {
    return this._symbol;
}
Symbol_TradeList.prototype.getCurrency = function() {
    return this._currency;
}