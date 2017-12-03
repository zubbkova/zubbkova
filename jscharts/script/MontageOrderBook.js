/* global OrderBook, SymbolRequest, Main, SimpleOrderBook */
/**
 * ----------------
 * MontageOrderBook
 * ----------------
 * @constructor
 * @extends {OrderBook}
 * @param {Object} params
 * @param {string} sym
 */
function MontageOrderBook(params, sym) {
    OrderBook.call(this);
    this._orderBooks = [];
    this._bookIDs = [];
    this._bookCodes = [];
    this._numOrderBooks = 0;
    this._params = params;
    var request = new SymbolRequest(this, sym);
    var symbol = request.getSymbol();
    var sob = symbol.getOrderBooks();
    this._orderBooks = new Array(sob.length); // SimpleOrderBook[]
    this._bookIDs = new Array(sob.length);
    this._bookCodes = new Array(sob.length);
    
    var tmpArr2 = new Array(2);
    tmpArr2.fillArrayWithValue(new Array(6));
    var tmpArr1 = new Array(6);
    tmpArr1.fillArrayWithValue(tmpArr2);
    this._flow = new Array(sob.length);
    this._flow.fillArrayWithValue(tmpArr1);
    
    for (var i = 0; i < sob.length; i++) {
        var item = sob[i];
        if (item.getCurrency() !== symbol.getCurrency()) 
            continue;
        // todo: for debug always entitled
        if (!item.isEntitled() && !Main.isDebug)
            continue;
        //
        var dm = item.getDisplayMarket();
        this._orderBooks[this._numOrderBooks] = new SimpleOrderBook(this._numOrderBooks, this._params, item.getFeedSymbol());
        this._orderBooks[this._numOrderBooks].addListener(this);
        this._bookCodes[this._numOrderBooks] = dm.substring(0, (dm.length > 4) ? 4 : dm.length);
        this._bookIDs[this._numOrderBooks] = item.getFeedSymbol();
        this._numOrderBooks++;
    }
}
/**
 * Inheriting
 */
MontageOrderBook.prototype = Object.create(OrderBook.prototype);
MontageOrderBook.prototype.constructor = MontageOrderBook;
/** @override */
MontageOrderBook.prototype.process = function(t) {
    var res = false;
    for (var i = 0; i < this._numOrderBooks; i++) {
        if (this._orderBooks[i].process(t)) {
            res = true;
        }
    }
    return res;
}
/**
 * @param {number} bookID
 * @param {number} side
 * @param {number} id
 * @param {number} price
 * @param {number} size
 * @param {string} code
 * @param {number} time
 * @param {number} ch
 */
MontageOrderBook.prototype.orderBookAdd = function(bookID, side, id, price, size, code, time, ch) {
    this.sendOrderAdd(side, this._bookIDs[bookID] + id, price, size, this.getCode(bookID, code), time, ch);
}
MontageOrderBook.prototype.orderBookConnect = function() {
    if (this._state === OrderBook.CONNECTED) {
        return;
    }
    this._state = OrderBook.CONNECTED;
    this.sendOrderConnect();	
}
/**
 * @param {number} bookID
 * @param {number} side
 * @param {number} id
 * @param {number} price
 * @param {number} size
 * @param {string} code
 * @param {number} time
 * @param {number} ch
 */
MontageOrderBook.prototype.orderBookDelete = function(bookID, side, id, price, size, code, time, ch) {
    this.sendOrderDelete(side, this._bookIDs[bookID] + id, price, size, this.getCode(bookID, code), time, ch);
}
MontageOrderBook.prototype.orderBookLoad = function() {
    if (this._state === OrderBook.LOADED)
        return;
    var loaded = true;
    for (var i = 0; i < this._numOrderBooks; i++) {
        if (!this._orderBooks[i].isLoaded()) {
            loaded = false;
        }
    }
    if (loaded) {
        this._state = OrderBook.LOADED;
        this.sendOrderLoad();
    }
}
/**
 * @param {number} bookID
 * @param {number} side
 * @param {number} id
 * @param {number} price
 * @param {number} size
 * @param {string} code
 * @param {number} time
 * @param {number} ch
 */
MontageOrderBook.prototype.orderBookUpdate = function(bookID, side, id, price, size, code, time, ch) {
    this.sendOrderUpdate(side, this._bookIDs[bookID] + id, price, size, this.getCode(bookID, code), time, ch);
}
/**
 * @param {number} bookID
 * @param {number} side
 * @param {number} action
 * @param {number} period
 * @param {number} value
 */
MontageOrderBook.prototype.orderFlow = function(bookID, side, action, period, value) {
    this._flow[bookID][period][side][action] = value;
    var total = 0;
    for (var i = 0; i < this._numOrderBooks; i++) {
        total += this._flow[i][period][side][action];
    }
    this.sendOrderFlow(side, action, period, total);
}
MontageOrderBook.prototype.destroy = function() {
    this.stop();
}
MontageOrderBook.prototype.stop = function() {
    for (var i = 0; i < this._numOrderBooks; i++) {
        this._orderBooks[i].stop();
    }
    this._orderBooks = undefined;
    this._numOrderBooks = 0;
}
MontageOrderBook.prototype.getID = function() {
    return this._id;
}
MontageOrderBook.prototype.getParent = function() {
    return;
}
MontageOrderBook.prototype.getX = function() {
    return 0;
}
MontageOrderBook.prototype.getY = function() {
    return 0;
}
/**
 * @param {number} bookID
 * @param {string} code
 */
MontageOrderBook.prototype.getCode = function(bookID, code) {
    if (code === undefined || code.length === 0  || code === " ") {
        return this._bookCodes[bookID];
    }
    return code;
}