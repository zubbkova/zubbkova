/* global Main, ErrorCodes, ChartSymbol */
/**
 * -------------
 * SymbolRequest
 * -------------
 * @constructor
 * @param {Component|MontageOrderBook} delegate
 * @param {string} s
 */
function SymbolRequest(delegate, s) {
    this._result_pos = 0;
    this._doRequest(delegate, [s]); 
}
/**
 * @param {Component|MontageOrderBook} delegate
 * @param {Array} s
 */
SymbolRequest.prototype._doRequest = function(delegate, s) {
    if (!s || s.length === 0) {
//        this._sendEvent();
        return;
    }
    this._delegate = delegate;
    this._requestStrings = [];
    this._results = [];
    for (var i = 0; i < s.length; i++) {
        if (s[i] === undefined || s[i].length === 0) 
            continue;
        var symbols = SymbolRequest.cacheGet(s[i]);
        if (symbols === undefined) {
            this._requestStrings.push(s[i]);
        } else {
            var r = new SymbolRequest_Result();
            r._requestSymbol = s[i];
            for (var j = 0; j < symbols.length; j++) {
                r._symbols.push(symbols[j]);
            }
            this._results.push(r);
        }
    }
    if (this._requestStrings.length === 0) {
//        this._sendEvent();
    } else {
        this.run();
    }
}
//SymbolRequest.prototype._sendEvent = function() {
//    var e = new ChartEvent(ChartEvent.SYMBOL_REQUEST);
//    e._data = this;
//    Main.getSession().getRootComponent().notify(e, this._delegate);
//}
SymbolRequest.prototype.getResult = function() {
    if (this._result_pos === this._results.length)
        return undefined;
    return this._results[this._result_pos++];
}
SymbolRequest.prototype.getSymbol = function() {
    if (this._results === undefined || this._results.length === 0) {
        return undefined;
    }
    var r = this._results[0];
    if (r === undefined)
        return;
    return r._symbols[0];
}
SymbolRequest.prototype.run = function() {
    var tmp = "";
    for (var i = 0; i < this._requestStrings.length; i++) {
        tmp += (i === 0 ? "" : ",") + this._requestStrings[i];
    }
    var params = encodeURIComponent("symbol=" + tmp.toLocaleUpperCase());
    var self = this;
    console.log("SymbolRequest.", params);
    self.parseResponse("{\"error\":0,\"result\":{\"symbols\":[{\"REQUEST_SYMBOL\":\"L^VOD\",\"FEED_SYMBOL\":\"L^VOD\",\"DISPLAY_SYMBOL\":\"LSE:VOD\",\"MARKET\":\"L\",\"DISPLAY_MARKET\":\"LSE\",\"SYMBOL\":\"VOD\",\"NAME\":\"Vodafone Group\",\"TYPE\":\"DE\",\"MARKET_SEGMENT\":\"SET0\",\"MARKET_SECTOR\":\"FE00\",\"CURRENCY\":\"GBX\",\"ISIN\":\"GB00BH4HKS39\",\"ORDER_BOOKS\":[{\"MARKET\":\"L\",\"DISPLAY_SYMBOL\":\"LSE:VOD\",\"DISPLAY_MARKET\":\"LSE\",\"SYMBOL\":\"VOD\",\"FEED_SYMBOL\":\"L^VOD\",\"CURRENCY\":\"GBX\",\"ENTITLED\":false},{\"MARKET\":\"CHIX\",\"DISPLAY_SYMBOL\":\"CHIX:VODL\",\"DISPLAY_MARKET\":\"CHIX\",\"SYMBOL\":\"VODL\",\"FEED_SYMBOL\":\"CHIX^VODL\",\"CURRENCY\":\"GBX\",\"ENTITLED\":false},{\"MARKET\":\"XE\",\"DISPLAY_SYMBOL\":\"XE:A1XA83\",\"DISPLAY_MARKET\":\"XE\",\"SYMBOL\":\"A1XA83\",\"FEED_SYMBOL\":\"XE^VODI\",\"CURRENCY\":\"EUR\",\"ENTITLED\":false},{\"MARKET\":\"A\",\"DISPLAY_SYMBOL\":\"AMEX:E\\\\VODL\",\"DISPLAY_MARKET\":\"AMEX\",\"SYMBOL\":\"E\\\\VODL\",\"FEED_SYMBOL\":\"A^E\\\\VODL\",\"CURRENCY\":\"USD\",\"ENTITLED\":false}],\"TRADE_LISTS\":[{\"MARKET\":\"L\",\"DISPLAY_SYMBOL\":\"LSE:VOD\",\"DISPLAY_MARKET\":\"LSE\",\"SYMBOL\":\"VOD\",\"FEED_SYMBOL\":\"L^VOD\",\"CURRENCY\":\"GBX\",\"ENTITLED\":true},{\"MARKET\":\"XE\",\"DISPLAY_SYMBOL\":\"XE:A1XA83\",\"DISPLAY_MARKET\":\"XE\",\"SYMBOL\":\"A1XA83\",\"FEED_SYMBOL\":\"XE^VODI\",\"CURRENCY\":\"EUR\",\"ENTITLED\":true},{\"MARKET\":\"FWB\",\"DISPLAY_SYMBOL\":\"FWB:A1XA83\",\"DISPLAY_MARKET\":\"FWB\",\"SYMBOL\":\"A1XA83\",\"FEED_SYMBOL\":\"FWB^VODI\",\"CURRENCY\":\"EUR\",\"ENTITLED\":true},{\"MARKET\":\"A\",\"DISPLAY_SYMBOL\":\"AMEX:E\\\\VODL\",\"DISPLAY_MARKET\":\"AMEX\",\"SYMBOL\":\"E\\\\VODL\",\"FEED_SYMBOL\":\"A^E\\\\VODL\",\"CURRENCY\":\"USD\",\"ENTITLED\":true}],\"DAY_START_SECONDS\":28800,\"DAY_STOP_SECONDS\":59400,\"TIMEZONE\":\"Europe\\/London\",\"DELAY\":900,\"URL\":\"\\/stock-market\\/london\\/VOD\\/level2\",\"TITLE\":\"Vodafone Group Market Depth - VOD | TopStocks\",\"WEEKENDS\":[6,0],\"EXACT_MATCH\":1},{\"REQUEST_SYMBOL\":\"L^VOD\",\"FEED_SYMBOL\":\"N^E\\\\VODL\",\"DISPLAY_SYMBOL\":\"NASDAQ:E\\\\VODL\",\"MARKET\":\"N\",\"DISPLAY_MARKET\":\"NASDAQ\",\"SYMBOL\":\"E\\\\VODL\",\"NAME\":\"Vodafone Grp. (MM)\",\"TYPE\":\"DE\",\"MARKET_SEGMENT\":\"\",\"MARKET_SECTOR\":\"\",\"CURRENCY\":\"USD\",\"ISIN\":\"GB00BH4HKS39\",\"ORDER_BOOKS\":[],\"TRADE_LISTS\":[],\"DAY_START_SECONDS\":34200,\"DAY_STOP_SECONDS\":57600,\"TIMEZONE\":\"US\\/Eastern\",\"DELAY\":900,\"URL\":\"\\/stock-market\\/NASDAQ\\/E%5CVODL\\/level2\",\"TITLE\":\"Vodafone Grp. (MM) Market Depth - E%5CVODL | TopStocks\",\"WEEKENDS\":[6,0],\"EXACT_MATCH\":0},{\"REQUEST_SYMBOL\":\"L^VOD\",\"FEED_SYMBOL\":\"A^E\\\\VODL\",\"DISPLAY_SYMBOL\":\"AMEX:E\\\\VODL\",\"MARKET\":\"A\",\"DISPLAY_MARKET\":\"AMEX\",\"SYMBOL\":\"E\\\\VODL\",\"NAME\":\"Vodafone Grp.\",\"TYPE\":\"DE\",\"MARKET_SEGMENT\":null,\"MARKET_SECTOR\":null,\"CURRENCY\":\"USD\",\"ISIN\":\"GB00BH4HKS39\",\"ORDER_BOOKS\":[{\"MARKET\":\"L\",\"DISPLAY_SYMBOL\":\"LSE:VOD\",\"DISPLAY_MARKET\":\"LSE\",\"SYMBOL\":\"VOD\",\"FEED_SYMBOL\":\"L^VOD\",\"CURRENCY\":\"GBX\",\"ENTITLED\":false},{\"MARKET\":\"CHIX\",\"DISPLAY_SYMBOL\":\"CHIX:VODL\",\"DISPLAY_MARKET\":\"CHIX\",\"SYMBOL\":\"VODL\",\"FEED_SYMBOL\":\"CHIX^VODL\",\"CURRENCY\":\"GBX\",\"ENTITLED\":false},{\"MARKET\":\"XE\",\"DISPLAY_SYMBOL\":\"XE:A1XA83\",\"DISPLAY_MARKET\":\"XE\",\"SYMBOL\":\"A1XA83\",\"FEED_SYMBOL\":\"XE^VODI\",\"CURRENCY\":\"EUR\",\"ENTITLED\":false},{\"MARKET\":\"A\",\"DISPLAY_SYMBOL\":\"AMEX:E\\\\VODL\",\"DISPLAY_MARKET\":\"AMEX\",\"SYMBOL\":\"E\\\\VODL\",\"FEED_SYMBOL\":\"A^E\\\\VODL\",\"CURRENCY\":\"USD\",\"ENTITLED\":false}],\"TRADE_LISTS\":[{\"MARKET\":\"L\",\"DISPLAY_SYMBOL\":\"LSE:VOD\",\"DISPLAY_MARKET\":\"LSE\",\"SYMBOL\":\"VOD\",\"FEED_SYMBOL\":\"L^VOD\",\"CURRENCY\":\"GBX\",\"ENTITLED\":true},{\"MARKET\":\"XE\",\"DISPLAY_SYMBOL\":\"XE:A1XA83\",\"DISPLAY_MARKET\":\"XE\",\"SYMBOL\":\"A1XA83\",\"FEED_SYMBOL\":\"XE^VODI\",\"CURRENCY\":\"EUR\",\"ENTITLED\":true},{\"MARKET\":\"FWB\",\"DISPLAY_SYMBOL\":\"FWB:A1XA83\",\"DISPLAY_MARKET\":\"FWB\",\"SYMBOL\":\"A1XA83\",\"FEED_SYMBOL\":\"FWB^VODI\",\"CURRENCY\":\"EUR\",\"ENTITLED\":true},{\"MARKET\":\"A\",\"DISPLAY_SYMBOL\":\"AMEX:E\\\\VODL\",\"DISPLAY_MARKET\":\"AMEX\",\"SYMBOL\":\"E\\\\VODL\",\"FEED_SYMBOL\":\"A^E\\\\VODL\",\"CURRENCY\":\"USD\",\"ENTITLED\":true}],\"DAY_START_SECONDS\":34200,\"DAY_STOP_SECONDS\":57600,\"TIMEZONE\":\"US\\/Eastern\",\"DELAY\":900,\"URL\":\"\\/stock-market\\/AMEX\\/E%5CVODL\\/level2\",\"TITLE\":\"Vodafone Grp. Market Depth - E%5CVODL | TopStocks\",\"WEEKENDS\":[6,0],\"EXACT_MATCH\":0},{\"REQUEST_SYMBOL\":\"L^VOD\",\"FEED_SYMBOL\":\"FWB^VODI\",\"DISPLAY_SYMBOL\":\"FWB:A1XA83\",\"MARKET\":\"FWB\",\"DISPLAY_MARKET\":\"FWB\",\"SYMBOL\":\"A1XA83\",\"NAME\":\"Vodafone Group\",\"TYPE\":\"DE\",\"MARKET_SEGMENT\":null,\"MARKET_SECTOR\":null,\"CURRENCY\":\"EUR\",\"ISIN\":\"GB00BH4HKS39\",\"ORDER_BOOKS\":[{\"MARKET\":\"L\",\"DISPLAY_SYMBOL\":\"LSE:VOD\",\"DISPLAY_MARKET\":\"LSE\",\"SYMBOL\":\"VOD\",\"FEED_SYMBOL\":\"L^VOD\",\"CURRENCY\":\"GBX\",\"ENTITLED\":false},{\"MARKET\":\"CHIX\",\"DISPLAY_SYMBOL\":\"CHIX:VODL\",\"DISPLAY_MARKET\":\"CHIX\",\"SYMBOL\":\"VODL\",\"FEED_SYMBOL\":\"CHIX^VODL\",\"CURRENCY\":\"GBX\",\"ENTITLED\":false},{\"MARKET\":\"XE\",\"DISPLAY_SYMBOL\":\"XE:A1XA83\",\"DISPLAY_MARKET\":\"XE\",\"SYMBOL\":\"A1XA83\",\"FEED_SYMBOL\":\"XE^VODI\",\"CURRENCY\":\"EUR\",\"ENTITLED\":false},{\"MARKET\":\"A\",\"DISPLAY_SYMBOL\":\"AMEX:E\\\\VODL\",\"DISPLAY_MARKET\":\"AMEX\",\"SYMBOL\":\"E\\\\VODL\",\"FEED_SYMBOL\":\"A^E\\\\VODL\",\"CURRENCY\":\"USD\",\"ENTITLED\":false}],\"TRADE_LISTS\":[{\"MARKET\":\"L\",\"DISPLAY_SYMBOL\":\"LSE:VOD\",\"DISPLAY_MARKET\":\"LSE\",\"SYMBOL\":\"VOD\",\"FEED_SYMBOL\":\"L^VOD\",\"CURRENCY\":\"GBX\",\"ENTITLED\":true},{\"MARKET\":\"XE\",\"DISPLAY_SYMBOL\":\"XE:A1XA83\",\"DISPLAY_MARKET\":\"XE\",\"SYMBOL\":\"A1XA83\",\"FEED_SYMBOL\":\"XE^VODI\",\"CURRENCY\":\"EUR\",\"ENTITLED\":true},{\"MARKET\":\"FWB\",\"DISPLAY_SYMBOL\":\"FWB:A1XA83\",\"DISPLAY_MARKET\":\"FWB\",\"SYMBOL\":\"A1XA83\",\"FEED_SYMBOL\":\"FWB^VODI\",\"CURRENCY\":\"EUR\",\"ENTITLED\":true},{\"MARKET\":\"A\",\"DISPLAY_SYMBOL\":\"AMEX:E\\\\VODL\",\"DISPLAY_MARKET\":\"AMEX\",\"SYMBOL\":\"E\\\\VODL\",\"FEED_SYMBOL\":\"A^E\\\\VODL\",\"CURRENCY\":\"USD\",\"ENTITLED\":true}],\"DAY_START_SECONDS\":32400,\"DAY_STOP_SECONDS\":63000,\"TIMEZONE\":\"Europe\\/Berlin\",\"DELAY\":900,\"URL\":\"\\/stock-market\\/FWB\\/A1XA83\\/level2\",\"TITLE\":\"Vodafone Group Market Depth - A1XA83 | TopStocks\",\"WEEKENDS\":[6,0],\"EXACT_MATCH\":0},{\"REQUEST_SYMBOL\":\"L^VOD\",\"FEED_SYMBOL\":\"XE^VODI\",\"DISPLAY_SYMBOL\":\"XE:A1XA83\",\"MARKET\":\"XE\",\"DISPLAY_MARKET\":\"XE\",\"SYMBOL\":\"A1XA83\",\"NAME\":\"Vodafone Group\",\"TYPE\":\"DE\",\"MARKET_SEGMENT\":null,\"MARKET_SECTOR\":null,\"CURRENCY\":\"EUR\",\"ISIN\":\"GB00BH4HKS39\",\"ORDER_BOOKS\":[{\"MARKET\":\"L\",\"DISPLAY_SYMBOL\":\"LSE:VOD\",\"DISPLAY_MARKET\":\"LSE\",\"SYMBOL\":\"VOD\",\"FEED_SYMBOL\":\"L^VOD\",\"CURRENCY\":\"GBX\",\"ENTITLED\":false},{\"MARKET\":\"CHIX\",\"DISPLAY_SYMBOL\":\"CHIX:VODL\",\"DISPLAY_MARKET\":\"CHIX\",\"SYMBOL\":\"VODL\",\"FEED_SYMBOL\":\"CHIX^VODL\",\"CURRENCY\":\"GBX\",\"ENTITLED\":false},{\"MARKET\":\"XE\",\"DISPLAY_SYMBOL\":\"XE:A1XA83\",\"DISPLAY_MARKET\":\"XE\",\"SYMBOL\":\"A1XA83\",\"FEED_SYMBOL\":\"XE^VODI\",\"CURRENCY\":\"EUR\",\"ENTITLED\":false},{\"MARKET\":\"A\",\"DISPLAY_SYMBOL\":\"AMEX:E\\\\VODL\",\"DISPLAY_MARKET\":\"AMEX\",\"SYMBOL\":\"E\\\\VODL\",\"FEED_SYMBOL\":\"A^E\\\\VODL\",\"CURRENCY\":\"USD\",\"ENTITLED\":false}],\"TRADE_LISTS\":[{\"MARKET\":\"L\",\"DISPLAY_SYMBOL\":\"LSE:VOD\",\"DISPLAY_MARKET\":\"LSE\",\"SYMBOL\":\"VOD\",\"FEED_SYMBOL\":\"L^VOD\",\"CURRENCY\":\"GBX\",\"ENTITLED\":true},{\"MARKET\":\"XE\",\"DISPLAY_SYMBOL\":\"XE:A1XA83\",\"DISPLAY_MARKET\":\"XE\",\"SYMBOL\":\"A1XA83\",\"FEED_SYMBOL\":\"XE^VODI\",\"CURRENCY\":\"EUR\",\"ENTITLED\":true},{\"MARKET\":\"FWB\",\"DISPLAY_SYMBOL\":\"FWB:A1XA83\",\"DISPLAY_MARKET\":\"FWB\",\"SYMBOL\":\"A1XA83\",\"FEED_SYMBOL\":\"FWB^VODI\",\"CURRENCY\":\"EUR\",\"ENTITLED\":true},{\"MARKET\":\"A\",\"DISPLAY_SYMBOL\":\"AMEX:E\\\\VODL\",\"DISPLAY_MARKET\":\"AMEX\",\"SYMBOL\":\"E\\\\VODL\",\"FEED_SYMBOL\":\"A^E\\\\VODL\",\"CURRENCY\":\"USD\",\"ENTITLED\":true}],\"DAY_START_SECONDS\":32400,\"DAY_STOP_SECONDS\":63000,\"TIMEZONE\":\"Europe\\/Berlin\",\"DELAY\":900,\"URL\":\"\\/stock-market\\/XE\\/A1XA83\\/level2\",\"TITLE\":\"Vodafone Group Market Depth - A1XA83 | TopStocks\",\"WEEKENDS\":[6,0],\"EXACT_MATCH\":0}]}}")
//    $.ajax({
//        type: "POST",
//        url: Main.getAdvfnURL() + "p.php?java=symbol",
//        crossdomain: true,
//        data: "param=" + params,
//        async: false,
//        dataType: "text",
//        success: function(responseData) {
////            console.log("SymbolRequest response:", responseData);
//            self.parseResponse(responseData);
//        },
//        error: function(responseData, textStatus) {
////            Main.getSession()._root.showAlert("SymbolRequest. Can't load symbol: " + textStatus);
//            console.log("SymbolRequest. Can't load symbol: " + textStatus);
////            self._sendEvent();
//        }
//    });
//    console.log("SymbolRequest start: symbol, param=" + params);
}
/**
 * @param {string} response
 */
SymbolRequest.prototype.parseResponse = function(response) {
    var json = JSON.parse(response);
    var error = parseInt(json["error"], 10);
    if (error !== 0) {
//        Main.getSession()._root.showAlert("SymbolRequest. Can't load symbol: " + ErrorCodes.strings[error]);
        console.log("SymbolRequest. Can't load symbol: " + ErrorCodes.strings[error]);
//        self._sendEvent();
        return;
    }
    this._result_pos = 0;
    var r, sym;
    var ja = json.result.symbols;
    if (ja === undefined || ja.length === 0) {
//        Main.getSession()._root.showAlert("SymbolRequest. Returned symbols is empty.");
        console.log("SymbolRequest. Returned symbols is empty.");
//        this._sendEvent();
        return;
    }
    for (var i = 0; i < ja.length; i++) {
        sym = ja[i];
        var rs = sym['REQUEST_SYMBOL'];
        if (r === undefined || r._requestSymbol !== rs) {
            if (r) {
                SymbolRequest.cachePut(r._requestSymbol, r.getSymbols());
            }
            r = new SymbolRequest_Result();
            r._requestSymbol = rs;
            r._symbols = [];
            this._results.push(r);
        }
        var fs = sym['FEED_SYMBOL'];
        if (fs === undefined || fs.length === 0) {
            r._symbols.push(undefined);
        } else {
            var cache_symbols = SymbolRequest.cacheGet(fs);
            var add_symbol = undefined;
            if (cache_symbols === undefined || cache_symbols.length === 0) {
                add_symbol = new ChartSymbol(sym);
                SymbolRequest.cachePut(fs, [add_symbol]);						
            } else {
                add_symbol = cache_symbols[0];
            }
            r._symbols.push(add_symbol);
        }
    }
    if (r) {
        SymbolRequest.cachePut(r._requestSymbol, r.getSymbols());
    }
}
/**
 * @static
 * @param {string} s
 */
SymbolRequest.cacheGet = function(s) {
    s = s.toUpperCase();
    if (!SymbolRequest.cache) {
        return;
    }
    return SymbolRequest.cache[s];
}
/**
 * @static
 * @param {string} s
 * @param {Array} symbols
 */
SymbolRequest.cachePut = function(s, symbols) {
    s = s.toUpperCase();
    if (!SymbolRequest.cache) {
        SymbolRequest.cache = new Object();
    }
    SymbolRequest.cache[s] = symbols;
}
/**
 * --------------------
 * SymbolRequest_Result
 * --------------------
 * @constructor
 */
function SymbolRequest_Result() {
    this._requestSymbol = undefined;
    this._symbols = [];
}
SymbolRequest_Result.prototype.getSymbols = function() {
    return this._symbols.slice();
}