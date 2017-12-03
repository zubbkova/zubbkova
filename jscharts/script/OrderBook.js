/* eslint no-unused-vars: "off" */
/**
 * ---------
 * OrderBook
 * ---------
 * @constructor
 */
function OrderBook() {
    this._listeners = [];
    this._id = 0;
    this._state = OrderBook.DISCONNECTED;
}
OrderBook.prototype.getId = function() {
    return this._id;
}
/**
 * @param {Level2Book|MontageOrderBook} listener
 * @param {number=} side
 */
OrderBook.prototype.addListener = function(listener, side) {
    var l = new OrderBook_Listener(listener);
    if (arguments.length === 2) {
        l._side[side] = true;
    } else {
        l._side[OrderBook.BUY] = true;
        l._side[OrderBook.SELL] = true;
    }
    this._listeners.push(l);
}
/**
 * @param {number} side
 * @param {string} iden
 * @param {number} price
 * @param {number} size
 * @param {string} code
 * @param {number} time
 * @param {number} lastChange
 */
OrderBook.prototype.sendOrderAdd = function(side, iden, price, size, code, time, lastChange) {
    for (var i = 0; i < this._listeners.length; i++) {
        var item = this._listeners[i];
        if (item._side[side]) {
            item._listener.orderBookAdd(this._id, side, iden, price, size, code, time, lastChange);
        }
    }
}
/**
 * @param {number} side
 * @param {string} iden
 * @param {number} price
 * @param {number} size
 * @param {string} code
 * @param {number} time
 * @param {number} lastChange
 */
OrderBook.prototype.sendOrderDelete = function(side, iden, price, size, code, time, lastChange) {
    for (var i = 0; i < this._listeners.length; i++) {
        var item = this._listeners[i];
        if (item[side]) {
            item._listener.orderBookDelete(iden);
        }
    }
}
/**
 * @param {number} side
 * @param {string} iden
 * @param {number} price
 * @param {number} size
 * @param {string} code
 * @param {number} time
 * @param {number} lastChange
 */
OrderBook.prototype.sendOrderUpdate = function(side, iden, price, size, code, time, lastChange) {
    for (var i = 0; i < this._listeners.length; i++) {
        var item = this._listeners[i];
        if (item[side]) {
            item._listener.orderBookUpdate(this._id, side, iden, price, size, code, time, lastChange);
        }
    }
}
OrderBook.prototype.sendOrderConnect = function() {
    for (var i = 0; i < this._listeners.length; i++) {
        var item = this._listeners[i];
        item._listener.orderBookConnect();
    }
}
/**
 * @param {number} side
 * @param {number} action
 * @param {number} period
 * @param {number} value
 */
OrderBook.prototype.sendOrderFlow = function(side, action, period, value) {
    for (var i = 0; i < this._listeners.length; i++) {
        var item = this._listeners[i];
        if (item._side[side]) {
            if (typeof item._listener.orderFlow !== "undefined") {
                item._listener.orderFlow(this._id, side, action, period, value);
            }
        }
    }
}
OrderBook.prototype.sendOrderDisconnect = function() {
    for (var i = 0; i < this._listeners.length; i++) {
        var item = this._listeners[i];
        item._listener.orderBookDisconnect(this._id);
    }
}
OrderBook.prototype.sendOrderLoad = function() {
    for (var i = 0; i < this._listeners.length; i++) {
        var item = this._listeners[i];
        item._listener.orderBookLoad();
    }
}
OrderBook.prototype.isLoaded = function() {
    return this._state === OrderBook.LOADED;
}
/**
 * @param {number} t
 */
OrderBook.prototype.process = function(t) {
    return false;
}
/** @static */
OrderBook.PRICE_UP = 1;
/** @static */
OrderBook.PRICE_DOWN = 2;
/** @static */
OrderBook.PRICE = OrderBook.PRICE_UP | OrderBook.PRICE_DOWN;
/** @static */
OrderBook.SIZE_UP = 4;
/** @static */
OrderBook.SIZE_DOWN = 8;
/** @static */
OrderBook.SIZE = OrderBook.SIZE_UP | OrderBook.SIZE_DOWN;
/** @static */
OrderBook.CODE = 16;
/** @static */
OrderBook.TIME = 32;
/** @static */
OrderBook.BUY = 0;
/** @static */
OrderBook.SELL = 1;
/** @static */
OrderBook.UP = 0;
/** @static */
OrderBook.DOWN = 1;
/** @static */
OrderBook.NO_CHANGE = 2;
/** @static */
OrderBook.CONNECTED = 0;
/** @static */
OrderBook.LOADED = 1;
/** @static */
OrderBook.DISCONNECTED = 2;
/**
 * ------------------
 * OrderBook_Listener
 * ------------------
 * @constructor
 * @param {Level2Book|MontageOrderBook} l
 */
function OrderBook_Listener(l) {
    this._listener = l;
    this._side = new Array(2);
}
/**
 * @param {number} id
 */
OrderBook_Listener.prototype.orderBookDisconnect = function(id) {}