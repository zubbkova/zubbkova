/**
 * ---------------
 * SimpleOrderBook
 * ---------------
 * @constructor
 * @extends {OrderBook}
 * @param {number} id
 * @param {Map} params
 * @param {string} feedSymbol
 */
function SimpleOrderBook(id, params, feedSymbol) {
    OrderBook.call(this);
    this._id = id;
    this._line = [];
    this._orders = [];
    let fr = new FeedRequest("orderbook");
    fr.cmdSymbol(feedSymbol);
    fr.cmdParamArray([FeedRequest.P_ORDERS_BID_TIME, FeedRequest.P_ORDERS_BID_CODE, FeedRequest.P_ORDERS_BID_SIZE, FeedRequest.P_ORDERS_BID_PRICE, FeedRequest.P_ORDERS_BID_LIST_COMMAND, FeedRequest.P_ORDERS_OFFER_TIME, FeedRequest.P_ORDERS_OFFER_CODE, FeedRequest.P_ORDERS_OFFER_SIZE, FeedRequest.P_ORDERS_OFFER_PRICE, FeedRequest.P_ORDERS_OFFER_LIST_COMMAND]);
    fr.cmdParamArray([FeedRequest.P_FLOW_I_P1_BID, FeedRequest.P_FLOW_I_P1_OFFER, FeedRequest.P_FLOW_I_P5_BID,  FeedRequest.P_FLOW_I_P5_OFFER, FeedRequest.P_FLOW_I_P10_BID, FeedRequest.P_FLOW_I_P10_OFFER,  FeedRequest.P_FLOW_I_P15_BID, FeedRequest.P_FLOW_I_P15_OFFER, FeedRequest.P_FLOW_I_P30_BID,  FeedRequest.P_FLOW_I_P30_OFFER, FeedRequest.P_FLOW_I_P60_BID, FeedRequest.P_FLOW_I_P60_OFFER,  FeedRequest.P_FLOW_D_P1_BID, FeedRequest.P_FLOW_D_P1_OFFER, FeedRequest.P_FLOW_D_P5_BID,  FeedRequest.P_FLOW_D_P5_OFFER, FeedRequest.P_FLOW_D_P10_BID, FeedRequest.P_FLOW_D_P10_OFFER,  FeedRequest.P_FLOW_D_P15_BID, FeedRequest.P_FLOW_D_P15_OFFER, FeedRequest.P_FLOW_D_P30_BID,  FeedRequest.P_FLOW_D_P30_OFFER, FeedRequest.P_FLOW_D_P60_BID, FeedRequest.P_FLOW_D_P60_OFFER,  FeedRequest.P_FLOW_PU_P1_BID, FeedRequest.P_FLOW_PU_P1_OFFER, FeedRequest.P_FLOW_PU_P5_BID,  FeedRequest.P_FLOW_PU_P5_OFFER, FeedRequest.P_FLOW_PU_P10_BID, FeedRequest.P_FLOW_PU_P10_OFFER,  FeedRequest.P_FLOW_PU_P15_BID, FeedRequest.P_FLOW_PU_P15_OFFER, FeedRequest.P_FLOW_PU_P30_BID,  FeedRequest.P_FLOW_PU_P30_OFFER, FeedRequest.P_FLOW_PU_P60_BID, FeedRequest.P_FLOW_PU_P60_OFFER,  FeedRequest.P_FLOW_PD_P1_BID, FeedRequest.P_FLOW_PD_P1_OFFER, FeedRequest.P_FLOW_PD_P5_BID,  FeedRequest.P_FLOW_PD_P5_OFFER, FeedRequest.P_FLOW_PD_P10_BID, FeedRequest.P_FLOW_PD_P10_OFFER,  FeedRequest.P_FLOW_PD_P15_BID, FeedRequest.P_FLOW_PD_P15_OFFER, FeedRequest.P_FLOW_PD_P30_BID,  FeedRequest.P_FLOW_PD_P30_OFFER, FeedRequest.P_FLOW_PD_P60_BID, FeedRequest.P_FLOW_PD_P60_OFFER,  FeedRequest.P_FLOW_SU_P1_BID, FeedRequest.P_FLOW_SU_P1_OFFER, FeedRequest.P_FLOW_SU_P5_BID,  FeedRequest.P_FLOW_SU_P5_OFFER, FeedRequest.P_FLOW_SU_P10_BID, FeedRequest.P_FLOW_SU_P10_OFFER,  FeedRequest.P_FLOW_SU_P15_BID, FeedRequest.P_FLOW_SU_P15_OFFER, FeedRequest.P_FLOW_SU_P30_BID,  FeedRequest.P_FLOW_SU_P30_OFFER, FeedRequest.P_FLOW_SU_P60_BID, FeedRequest.P_FLOW_SU_P60_OFFER,  FeedRequest.P_FLOW_SD_P1_BID, FeedRequest.P_FLOW_SD_P1_OFFER, FeedRequest.P_FLOW_SD_P5_BID,  FeedRequest.P_FLOW_SD_P5_OFFER, FeedRequest.P_FLOW_SD_P10_BID, FeedRequest.P_FLOW_SD_P10_OFFER,  FeedRequest.P_FLOW_SD_P15_BID, FeedRequest.P_FLOW_SD_P15_OFFER, FeedRequest.P_FLOW_SD_P30_BID,  FeedRequest.P_FLOW_SD_P30_OFFER, FeedRequest.P_FLOW_SD_P60_BID, FeedRequest.P_FLOW_SD_P60_OFFER]);
    
    this._feed = new Feed('Level2 (' + feedSymbol + ')', fr.toString(), fr.size(), this);
    this._feed.start();
}
/**
 * Inheriting
 */
SimpleOrderBook.prototype = Object.create(OrderBook.prototype);
SimpleOrderBook.prototype.constructor = SimpleOrderBook;
/**
 * @param {FeedContent} fc
 */
SimpleOrderBook.prototype.feedDelegate_feed = function(fc) {
    if (this._state === OrderBook.DISCONNECTED) {
        this._orders[OrderBook.BUY] = new Map();
        this._orders[OrderBook.SELL] = new Map();
        this._state = OrderBook.CONNECTED;
        this.sendOrderConnect();
    }
    if (fc._id >= 10) {
        this._doFlow(fc);
    } else if (fc._id === 4 || fc._id === 9) {
        let side = (fc._id === 4) ? OrderBook.BUY : OrderBook.SELL;
        let num = parseInt(fc._contents.substring(1), 10);
        switch (fc._contents[0]) {
            case 'A':
                this._orderAdd(side, num, this._line[fc._id - 4], this._line[fc._id - 3], this._line[fc._id - 2], this._line[fc._id - 1]);
                break;
            case 'D':
                this._orderDelete(side, num, this._line[fc._id - 4], this._line[fc._id - 3], this._line[fc._id - 2], this._line[fc._id - 1]);
                break;
            case 'U':
                this._orderUpdate(side, num, this._line[fc._id - 4], this._line[fc._id - 3], this._line[fc._id - 2], this._line[fc._id - 1]);
                break;
        }
        for (let i = 0; i < 10; i++) {
            this._line[i] = undefined;
        }
    } else {
        this._line[fc._id] = fc;
    }
}
SimpleOrderBook.prototype.feedDelegate_disconnected = function() {
    if (this._state !== OrderBook.DISCONNECTED) {
        this._state = OrderBook.DISCONNECTED;
        this.sendOrderDisconnect();
    }
}
SimpleOrderBook.prototype.feedDelegate_loadingComplete = function() {
    if (this._state !== OrderBook.LOADED) {
        this._state = OrderBook.LOADED;
        this.sendOrderLoad();
    }
}
/** @override */
SimpleOrderBook.prototype.process = function(t) {
    return this._feed && this._feed.process(t);
}
SimpleOrderBook.prototype.stop = function() {
    if (this._feed) {
        this._feed.stop();
        this._feed = undefined;
    }
}
/**
 * @private
 * @param {FeedContent} fc
 */
SimpleOrderBook.prototype._doFlow = function(fc) {
    fc._id -= 10;
    let side = fc._id % 2;
    let change = OrderBook.NO_CHANGE;
    let action = parseInt(fc._id / 12, 10);
    let period = parseInt((fc._id % 12) / 2, 10);
    if ((fc._flags & FeedContent.FLAG_UPDATE_UP) !== 0) {
        change = OrderBook.UP;
    }
    if ((fc._flags & FeedContent.FLAG_UPDATE_DOWN) !== 0) {
        change = OrderBook.DOWN;
    }
    let value = FeedContent.getInteger(fc._contents);
    this.sendOrderFlow(side, action, period, value, change);
}
/**
 * @private
 * @param {number} side
 * @param {string} id
 */
SimpleOrderBook.prototype._findOrder = function(side, id) {
    return this._orders[side].get(id);
}
/**
 * @private
 * @param {number} side
 * @param {number} id
 * @param {FeedContent} time
 * @param {FeedContent} code
 * @param {FeedContent} size
 * @param {FeedContent} price
 */
SimpleOrderBook.prototype._orderAdd = function(side, id, time, code, size, price) {
    let o = new SimpleOrderBook_Order();
    o._id = id.toString();
    o._time = parseFloat(time._contents) * 1000;
    o._code = code._contents;
    o._size = FeedContent.getInteger(size._contents);
    if (price._contents === undefined) {
        o._price = 0.0;
    } else {
        o._price = parseFloat(price._contents);
    }
    o._lastChange = 0;
    if ((price._flags & FeedContent.FLAG_UPDATE_UP) !== 0) {
        o._lastChange |= OrderBook.PRICE_UP;
    } else if ((price._flags & FeedContent.FLAG_UPDATE_DOWN) !== 0) {
        o._lastChange |= OrderBook.PRICE_DOWN;
    }
    this._orders[side].set(o._id, o);
    this.sendOrderAdd(side, o._id, o._price, o._size, o._code, o._time, o._lastChange);
}
/**
 * @private
 * @param {number} side
 * @param {number} id
 * @param {FeedContent} time
 * @param {FeedContent} code
 * @param {FeedContent} size
 * @param {FeedContent} price
 */
SimpleOrderBook.prototype._orderDelete = function(side, id, time, code, size, price) {
    let oid = id.toString();
    let o = this._findOrder(side, oid);
    if (o) {
        this._orders[side].delete(o._id);
        this.sendOrderDelete(side, o._id, o._price, o._size, o._code, o._time, o._lastChange);
    }
}
/**
 * @private
 * @param {number} side
 * @param {number} id
 * @param {FeedContent} time
 * @param {FeedContent} code
 * @param {FeedContent} size
 * @param {FeedContent} price
 */
SimpleOrderBook.prototype._orderUpdate = function(side, id, time, code, size, price) {
    let oid = id.toString();
    let o = this._findOrder(side, oid);
    if (o === undefined)
        return;
    o._lastChange = 0;
    if (time && time._contents) {
        o._lastChange |= OrderBook.TIME;
        o._time = parseFloat(time._contents) * 1000;
    }
    if (code && code._contents) {
        o._lastChange |= OrderBook.CODE;
        o._code = code._contents;
    }
    if (size && size._contents) {
        let nsize = FeedContent.getInteger(size._contents);
        if (nsize < o._size) {
            o._lastChange |= OrderBook.SIZE_DOWN;
            o._size = nsize;
        } else if (nsize > o._size) {
            o._lastChange |= OrderBook.SIZE_UP;
            o._size = nsize;
        }
    }
    if (price && price._contents) {
        let nprice = parseFloat(price._contents);
        if (nprice < o._price) {
            o._lastChange |= OrderBook.PRICE_DOWN;
            o._price = nprice;
        } else if (nprice > o._price) {
            o._lastChange |= OrderBook.PRICE_UP;
            o._price = nprice;
        }
    }
    if (o._lastChange > 0) {
        this.sendOrderUpdate(side, o._id, o._price, o._size, o._code, o._time, o._lastChange);
    }
}
/**
 * ---------------------
 * SimpleOrderBook_Order
 * ---------------------
 * @constructor
 */
function SimpleOrderBook_Order() {
    this._id = 0;
    this._price = 0.0;
    this._size = 0;
    this._time = 0;
    this._lastChange = 0;
}