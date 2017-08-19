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
    this._delegate = delegate;
    if (s.length === 0) {
//        this._sendEvent();
        return;
    }
    this._requestStrings = [];
    this._results = [];
    for (let item of s) {
        if (item === undefined || item.length === 0) 
            continue;
        let symbols = SymbolRequest.cacheGet(item);
        if (symbols === undefined) {
            this._requestStrings.push(item);
        } else {
            let r = new SymbolRequest_Result();
            r._requestSymbol = item;
            for (let j = 0; j < symbols.length; j++) {
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
//    let e = new ChartEvent(ChartEvent.SYMBOL_REQUEST);
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
    let tmp = "";
    for (let i = 0; i < this._requestStrings.length; i++) {
        tmp += (i === 0 ? "" : ",") + this._requestStrings[i];
    }
    let params = encodeURIComponent("symbol=" + tmp.toLocaleUpperCase());
    let self = this;
    console.log("SymbolRequest.", params);
    $.ajax({
        type: "POST",
        url: Main.getAdvfnURL() + "p.php?java=symbol",
        crossdomain: true,
        data: "param=" + params,
        async: false,
        dataType: "text",
        success: function(responseData, textStatus, jqXHR) {
//            console.log("SymbolRequest response:", responseData);
            self.parseResponse(responseData);
        },
        error: function(responseData, textStatus, errorThrown) {
//            Main.getSession()._root.showAlert("SymbolRequest. Can't load symbol: " + textStatus);
            console.log("SymbolRequest. Can't load symbol: " + textStatus);
//            self._sendEvent();
        }
    });
//    console.log("SymbolRequest start: symbol, param=" + params);
}
/**
 * @param {string} response
 */
SymbolRequest.prototype.parseResponse = function(response) {
    let json = JSON.parse(response);
    let error = parseInt(json["error"], 10);
    if (error !== 0) {
//        Main.getSession()._root.showAlert("SymbolRequest. Can't load symbol: " + ErrorCodes.strings[error]);
        console.log("SymbolRequest. Can't load symbol: " + ErrorCodes.strings[error]);
//        self._sendEvent();
        return;
    }
    this._result_pos = 0;
    let r, sym;
    let ja = json.result.symbols;
    if (ja === undefined || ja.length === 0) {
//        Main.getSession()._root.showAlert("SymbolRequest. Returned symbols is empty.");
        console.log("SymbolRequest. Returned symbols is empty.");
//        this._sendEvent();
        return;
    }
    for (let i = 0; i < ja.length; i++) {
        sym = ja[i];
        let rs = sym['REQUEST_SYMBOL'];
        if (r === undefined || r._requestSymbol !== rs) {
            if (r) {
                SymbolRequest.cachePut(r._requestSymbol, r.getSymbols());
            }
            r = new SymbolRequest_Result();
            r._requestSymbol = rs;
            r._symbols = [];
            this._results.push(r);
        }
        let fs = sym['FEED_SYMBOL'];
        if (fs === undefined || fs.length === 0) {
            r._symbols.push(undefined);
        } else {
            let cache_symbols = SymbolRequest.cacheGet(fs);
            let add_symbol = undefined;
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
    return SymbolRequest.cache.get(s);
}
/**
 * @static
 * @param {string} s
 * @param {Array} symbols
 */
SymbolRequest.cachePut = function(s, symbols) {
    s = s.toUpperCase();
    if (!SymbolRequest.cache) {
        SymbolRequest.cache = new Map();
    }
    SymbolRequest.cache.set(s, symbols);
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