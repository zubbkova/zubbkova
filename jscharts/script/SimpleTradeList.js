/**
 * ---------------
 * SimpleTradeList
 * ---------------
 * @constructor
 * @extends {TradeList}
 * @param {number} id
 * @param {Map} params
 * @param {string} feedSymbol
 */
function SimpleTradeList(id, params, feedSymbol) {
    TradeList.call(this);
    this._nextID = 0;
    this.setID(id);
    this._line = new Array(17); // FeedContent
    this._trades = [];
    if (feedSymbol.includes('^d')) {
       feedSymbol= feedSymbol.substring(0, feedSymbol.length - 2); 
    }
    let fr = new FeedRequest("tradelist");
    fr.cmdSymbol(feedSymbol);
    fr.cmdParamArray([FeedRequest.P_TRADES_TIME, FeedRequest.P_TRADES_PRICE, FeedRequest.P_TRADES_SIZE, FeedRequest.P_TRADES_TYPE, FeedRequest.P_TRADES_FLAGS, FeedRequest.P_TRADES_EXCHANGE, FeedRequest.P_TRADES_BID, FeedRequest.P_TRADES_OFFER, FeedRequest.P_TRADES_BUY_SIZE, FeedRequest.P_TRADES_SELL_SIZE, FeedRequest.P_TRADES_UNKNOWN_SIZE, FeedRequest.P_TRADES_BUY_VOLUME, FeedRequest.P_TRADES_SELL_VOLUME, FeedRequest.P_TRADES_UNKNOWN_VOLUME, FeedRequest.P_TRADES_NUMBER, FeedRequest.P_V1_TRADES_CODE, FeedRequest.P_TRADES_LIST_COMMAND]);
    
    this._feed = new Feed('Trades (' + feedSymbol + ')', fr.toString(), fr.size(), this);
    this._feed.start();
}
/**
 * Inheriting
 */
SimpleTradeList.prototype = Object.create(TradeList.prototype);
SimpleTradeList.prototype.constructor = SimpleTradeList;
/**
 * @param {FeedContent} fc
 */
SimpleTradeList.prototype.feedDelegate_feed = function(fc) {
    if (this._state === SimpleTradeList.DISCONNECTED) {
        this.feedDelegate_connected();
    }
    if (fc._id === this._line.length - 1) {
        let num = parseInt(fc._contents.substring(1), 10);
        switch (fc._contents[0]) {
            case 'A':
                this._tradeAdd(num);
                break;
            case 'D':
                this._tradeDelete(num);
                break;
            case 'U':
                this._tradeUpdate(num);
                break;
        }
        for (let i = 0; i < this._line.length; i++) {
            this._line[i] = undefined;
        }
    } else {
        this._line[fc._id] = fc;
    }
}
SimpleTradeList.prototype.feedDelegate_connected = function() {
    this._trades = [];
    this._state = SimpleTradeList.CONNECTED;
    this.sendTradeConnect();
}
SimpleTradeList.prototype.feedDelegate_disconnected = function() {
    if (this._state === SimpleTradeList.DISCONNECTED) {
        return;
    }
    this._state = SimpleTradeList.DISCONNECTED;
    this.sendTradeDisconnect();
}
SimpleTradeList.prototype.feedDelegate_loadingComplete = function() {
    if (this._state === SimpleTradeList.LOADED) 
        return;
    this._state = SimpleTradeList.LOADED;
    this.sendTradeLoad();
}
/** @override */
SimpleTradeList.prototype.process = function(t) {
    return this._feed && this._feed.process(t);
}
SimpleTradeList.prototype.stop = function() {
    if (this._feed) {
        this._feed.stop();
        this._feed = undefined;
    }
}
/**
 * @private
 * @param {number} pos
 */
SimpleTradeList.prototype._tradeAdd = function(pos) {
    let tid = (this._nextID++).toString();
    let t = new SimpleTradeList_Trade();
    t.load(this._line);
    t._id = tid;
    this._trades.splice(pos, 0, t);
    this.sendTradeAdd(t._id, t._time, t._price, t._size, t._type, t._flags, t._exchange, t._bid, t._offer, t._buySize, t._sellSize, t._unknownSize, t._buyVolume, t._sellVolume, t._unknownVolume, t._number, t._code, t._deleted, t._lastChange);
}
/**
 * @private
 * @param {number} pos
 */
SimpleTradeList.prototype._tradeDelete = function(pos) {
    if (pos > this._trades.length) 
        return;
    let t = this._trades[pos];
    this._trades.splice(pos, 1);
    this.sendTradeDelete(t._id, t._time, t._price, t._size, t._type, t._flags, t._exchange, t._bid, t._offer, t._buySize, t._sellSize, t._unknownSize, t._buyVolume, t._sellVolume, t._unknownVolume, t._number, t._code, t._deleted, t._lastChange);
}
/**
 * @private
 * @param {number} pos
 */
SimpleTradeList.prototype._tradeUpdate = function(pos) {
    if (pos > this._trades.length) 
        return;
    let t = this._trades[pos];
    t.load(this._line);
    if (t._lastChange > 0) {
       this.sendTradeUpdate(t._id, t._time, t._price, t._size, t._type, t._flags, t._exchange, t._bid, t._offer, t._buySize, t._sellSize, t._unknownSize, t._buyVolume, t._sellVolume, t._unknownVolume, t._number, t._code, t._deleted, t._lastChange);
    }
}
/**
 * ---------------------
 * SimpleTradeList_Trade
 * ---------------------
 * @constructor
 */
function SimpleTradeList_Trade() {
    this._id = 0;
    this._time = 0;
    this._price = 0.0;
    this._size = 0;
    this._type = undefined; // String
    this._flags = undefined; // String
    this._exchange = undefined; // String
    this._bid = 0.0;
    this._offer = 0.0;
    this._buySize = 0;
    this._sellSize = 0;
    this._unknownSize = 0;
    this._buyVolume = 0;
    this._sellVolume = 0;
    this._unknownVolume = 0;
    this._number = 0;
    this._code = undefined; // String
    this._lastChange = 0;
    this._deleted = false;
}
/**
 * @param {Array} line
 */
SimpleTradeList_Trade.prototype.load = function(line) {
    this._lastChange = 0;
    for (let i = 0; i < 16; i++) {
        if (line[i] === undefined || line[i]._contents === undefined || line[i]._contents.length === 0) 
            continue;
        this._lastChange |= (1 << i);
    }
    if ((this._lastChange & TradeList.TIME) !== 0) {
        this._time = Utils.parseLong(line[0]._contents) * 1000;
    }
    if ((this._lastChange & TradeList.PRICE) !== 0) {
        this._price = Utils.parseDouble(line[1]._contents);
        this._deleted = ((line[14]._flags & FeedContent.FLAG_DELETED) !== 0);
    }
    if ((this._lastChange & TradeList.SIZE) !=0 ) {
        this._size = parseInt(line[2]._contents, 10);
    }
    if ((this._lastChange & TradeList.TYPE) !== 0) {
        this._type = line[3]._contents;
    }
    if ((this._lastChange & TradeList.FLAGS) !== 0) {
        this._flags = line[4]._contents;
    }
    if ((this._lastChange & TradeList.EXCHANGE) !== 0) {
        this._exchange = line[5]._contents;
    }
    if ((this._lastChange & TradeList.BID) !== 0) {
        this._bid = Utils.parseDouble(line[6]._contents);
    }
    if ((this._lastChange & TradeList.OFFER) !== 0) {
        this._offer = Utils.parseDouble(line[7]._contents);
    }
    if ((this._lastChange & TradeList.BUY_SIZE) !== 0) {
        this._buySize = parseInt(line[8]._contents, 10);
    }
    if ((this._lastChange & TradeList.SELL_SIZE) !== 0) {
        this._sellSize = parseInt(line[9]._contents, 10);
    }
    if ((this._lastChange & TradeList.UNKNOWN_SIZE) !== 0) {
        this._unknownSize = parseInt(line[10]._contents, 10);
    }
    if ((this._lastChange & TradeList.BUY_VOLUME) !== 0) {
        this._buyVolume = parseInt(line[11]._contents, 10);
    }
    if ((this._lastChange & TradeList.SELL_VOLUME) !== 0) {
        this._sellVolume = parseInt(line[12]._contents, 10);
    }
    if ((this._lastChange & TradeList.UNKNOWN_VOLUME) !== 0) {
        this._unknownVolume = parseInt(line[13]._contents, 10);
    }
    if ((this._lastChange & TradeList.NUMBER) !== 0) {
        this._number = parseInt(line[14]._contents, 10);
    }
    if ((this._lastChange & TradeList.CODE) !== 0) {
        this._code = line[15]._contents;
    }
}