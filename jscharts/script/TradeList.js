/**
 * ---------
 * TradeList
 * ---------
 * @constructor
 */
function TradeList() {
    this._listeners = [];
    this._id = 0;
    this._state = TradeList.DISCONNECTED;
}
TradeList.prototype.getID = function() {
    return this._id;
}
/**
 * @param {number} id
 */
TradeList.prototype.setID = function(id) {
    this._id = id;
}
TradeList.prototype.sendTradeAdd = function(id, time, price, size, type, flags, exchange, bid, offer, buySize, sellSize, unknownSize, buyVolume, sellVolume, unknownVolume, number, code, deleted, changes) {
    // unused for a while
//    for (let l of this._listeners) {
//        l._listener.tradeListAdd(this._id, id, time, price, size, type, flags, exchange, bid, offer, buySize, sellSize, unknownSize, buyVolume, sellVolume, unknownVolume, number, code, deleted, changes );
//    }
}
TradeList.prototype.sendTradeUpdate = function(id, time, price, size, type, flags, exchange, bid, offer, buySize, sellSize, unknownSize, buyVolume, sellVolume, unknownVolume, number, code, deleted, changes) {
    // unused for a while
//    for (let l of this._listeners) {
//        l._listener.tradeListUpdate(this._id, id, time, price, size, type, flags, exchange, bid, offer, buySize, sellSize, unknownSize, buyVolume, sellVolume, unknownVolume, number, code, deleted, changes );
//    }
}
TradeList.prototype.sendTradeDelete = function(id, time, price, size, type, flags, exchange, bid, offer, buySize, sellSize, unknownSize, buyVolume, sellVolume, unknownVolume, number, code, deleted, changes) {
    // unused for a while
//    for (let l of this._listeners) {
//        l._listener.tradeListDelete(this._id, id, time, price, size, type, flags, exchange, bid, offer, buySize, sellSize, unknownSize, buyVolume, sellVolume, unknownVolume, number, code, deleted, changes );
//    }
}
TradeList.prototype.sendTradeDisconnect = function() {
    // unused for a while
//    for (let l of this._listeners) {
//        l._listener.tradeListDisconnect(this._id);
//    }
}
TradeList.prototype.sendTradeConnect = function() {
    // unused for a while
//    for (let l of this._listeners) {
//        l._listener.tradeListConnect(this._id);
//    }
}
TradeList.prototype.sendTradeLoad = function() {
    // unused for a while
//    for (let l of this._listeners) {
//        l._listener.tradeListLoad(this._id);
//    }
}
/**
 * @param {number=} t
 */
TradeList.prototype.process = function(t) {
    return false;
}
TradeList.prototype.isLoaded = function() {
    return this._state === SimpleTradeList.LOADED;
}
/** @static */
TradeList.TIME = (1);
/** @static */
TradeList.PRICE = (1<<1);
/** @static */
TradeList.SIZE = (1<<2);
/** @static */
TradeList.TYPE = (1<<3);
/** @static */
TradeList.FLAGS = (1<<4);
/** @static */
TradeList.EXCHANGE = (1<<5);
/** @static */
TradeList.BID = (1<<6);
/** @static */
TradeList.OFFER = (1<<7);
/** @static */
TradeList.BUY_SIZE = (1<<8);
/** @static */
TradeList.SELL_SIZE = (1<<9);
/** @static */
TradeList.UNKNOWN_SIZE = (1<<10);
/** @static */
TradeList.BUY_VOLUME = (1<<11);
/** @static */
TradeList.SELL_VOLUME = (1<<12);
/** @static */
TradeList.UNKNOWN_VOLUME = (1<<13);
/** @static */
TradeList.NUMBER = (1<<14);
/** @static */
TradeList.CODE = (1<<15);
/** @static */
TradeList.CONNECTED = 0;
/** @static */
TradeList.LOADED = 1;
/** @static */
TradeList.DISCONNECTED = 2;
/**
 * @constructor
 * @param {Object} l
 */
function TradeList_Listener(l) {
    this._listener = l;
}