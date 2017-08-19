/**
 * ---------------
 * PriceDataLoader
 * ---------------
 * @constructor
 * @param {ChartContainer=} delegate
 */
function PriceDataLoader(delegate) {
    this._listeners = new Set();
    if (delegate) {
        this._listeners.add(delegate);
    }
    this._state = PriceDataLoader.NOT_LOADING;
    this._data = new DataCache(this);
    this._timeLists = new TimeListCache();
    this._symbolSets = [];
    this._symbolInfo = new Map();
    this._localIndex = new Map();
    this._info = [];
}
/**
 * @param {ChartContainer} l
 */
PriceDataLoader.prototype.addListener = function(l) {
    if (l)
        this._listeners.add(l);
}
/**
 * @param {ChartContainer} delegate
 */
PriceDataLoader.prototype.removeListener = function(delegate) {
    this._listeners.delete(delegate);
}
/**
 * This method checks to see whether any clients have asked for new data to be loaded and if so calculates what is needed. For historical data it then checks to see whether it is in the local cache and if so fetches that. If more is needed or we want intraday data, then we start a WebLoader to get the data from ADVFN.
 */
PriceDataLoader.prototype.load = function() {
    let gets = [];
    if (this._symbolSets) {
        for (let i = 0; i < this._symbolSets.length; i++) {
            let ss = this._symbolSets[i];
            if (ss._isValid) {
                let ssGets = ss.load();
                for (let j = 0; j < ssGets.length; j++) {
                    gets.push(ssGets[j]);
                }
            }
        }
    }
    // WEB LOADER
    if (gets.length > 0) {
        for (let i = 0; i < gets.length; i++) {
            let g = [];
            g.push(gets[i]);
            let webLoader = new WebLoader(this, g);
            webLoader.start();
        }
        PriceDataLoader.loading = true;
        return true;
    }
    return false;
}
/**
 * @param {Array|string} s
 */
PriceDataLoader.prototype.getChartInfo = function(s) {
    if (typeof s === "string")
        s = [s];
    if (s.length === 0) {
        return true;
    }
    let update = false;
    let tmp = "";
    for (let i = 0; i < s.length; i++) {
        if (s[i] === undefined || s[i].length === 0) {
            continue;
        }
        if (!this._symbolInfo.has(s[i]) || this._symbolInfo.get(s[i]) === undefined) {
            update = true;
            tmp += (tmp.length === 0 ? "" : ",")
            if (s[i].constructor.name === "Array") {
                tmp += s[i].join("");
            } else {
                 tmp += s[i];
            }
        }
    }
    if (!update) {
        return true;
    }
    let params = encodeURIComponent("symbol=" + tmp);
    let self = this;
    $.ajax({
        type: "POST",
        url: Main.getAdvfnURL() + "p.php?java=chartinfo",
        crossdomain: true,
        data: "param=" + params,
        dataType: "text",
        async: false,
        success: function(responseData, textStatus, jqXHR) {
            self.parseChartInfoResponse(responseData);
        },
        error: function(responseData, textStatus, errorThrown) {
            Main.getSession()._root.showAlert("PriceDataLoader. Can't load chartinfo: " + textStatus);
            console.log("PriceDataLoader. Can't load chartinfo: " + textStatus);
        }
    });
}
/**
 * @param {Array} response
 */
PriceDataLoader.prototype.parseChartInfoResponse = function(response) {
    if (response.length === 0) {
        Main.getSession()._root.showAlert("PriceDataLoader. Empty reponse");
        console.log("PriceDataLoader. Empty reponse");
        return false;
    }
    response = response.toString().split("\n");
    let error = parseInt(response[0], 10);
    if (error !== 0) {
        Main.getSession()._root.showAlert("PriceDataLoader. Can't load chartinfo: " + ErrorCodes.strings[error]);
        console.log("PriceDataLoader. Can't load chartinfo: " + ErrorCodes.strings[error]);
        return false;
    }
    let numRows = parseInt(response[1], 10);
    let numColumns = parseInt(response[2], 10);
    let table = new WebQuery_Table(numColumns, numRows);
    let lineNum = 3;
    for (let i = 0; i < numColumns; i++) {
        table._columnName[i] = response[lineNum];
        lineNum++;
    }
    for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numColumns; j++) {
            table._contents[i][j] = Utils.replace(response[lineNum], "\u001b", "\n");
            lineNum++;
        }
    }
    let ts = 0;
    for (let num = 0; num < table._numRows; num++) {
        let info = new ChartInfo();
        info.setSymbol(table._contents[num][table._columnName.indexOf("FULL_SYMBOL")]);
        info._displaySymbol = table._contents[num][table._columnName.indexOf("DISPLAY")];
        info._displayName = table._contents[num][table._columnName.indexOf("NAME_WITH_CURRENCY")];
        info._curPrice = Utils.parseDouble(table._contents[num][table._columnName.indexOf("CUR_PRICE")]);
        ts = Utils.parseLong(table._contents[num][table._columnName.indexOf("TIME")]) * 1000;
        info._time = new Date(ts - info._delay * 60000);
        
        info._yesterdaysClose = Utils.parseDouble(table._contents[num][table._columnName.indexOf("YESTERDAYS_CLOSE")]);
        info._openPrice = Utils.parseDouble(table._contents[num][table._columnName.indexOf("OPEN_PRICE")]);
        info._highPrice = Utils.parseDouble(table._contents[num][table._columnName.indexOf("HIGH_PRICE")]);
        info._lowPrice = Utils.parseDouble(table._contents[num][table._columnName.indexOf("LOW_PRICE")]);
        info._delay = Math.trunc(parseInt(table._contents[num][table._columnName.indexOf("DELAY")], 10));
        info._marketOpen = Math.trunc(parseInt(table._contents[num][table._columnName.indexOf("DAY_OPEN")], 10) / 60);
        info._marketClose = Math.trunc(parseInt(table._contents[num][table._columnName.indexOf("DAY_CLOSE")], 10) / 60);
        info._type = table._contents[num][table._columnName.indexOf("TYPE")];
        info._marketSegment = table._contents[num][table._columnName.indexOf("MARKET_SEGMENT")];
        info._datacache_intra = Math.trunc(Utils.parseLong(table._contents[num][table._columnName.indexOf("DATACACHE_ERASE_INTRA")]));
        info._datacache_daily = Math.trunc(Utils.parseLong(table._contents[num][table._columnName.indexOf("DATACACHE_ERASE_DAILY")]));
        info.setCurrency(table._contents[num][table._columnName.indexOf("CURRENCY")]);
        info._ISIN = table._contents[num][table._columnName.indexOf("ISIN")];
        let alts = [];
        let cn = table._columnName.indexOf("ALT0_FULL_SYMBOL");
        for (let altNum = 0; altNum < 6; altNum++) {
            if (!table._contents[num][cn] || table._contents[num][cn].length === 0) {
                break;
            }
            let a = new Array(3);
            a[0] = table._contents[num][cn++];
            a[1] = table._contents[num][cn++];
            a[2] = table._contents[num][cn++];
            alts.splice(altNum, 0, a);
        }
        this._symbolInfo.set(info._symbol, info);
    }
    this._timestamp = new Date(ts);
    return true;
}
/**
 * @param {SymbolSet} ss
 */
PriceDataLoader.prototype.addSymbolSet = function(ss) {
    this._symbolSets.push(ss);
}
/**
 * @param {SymbolSet} ss
 */
PriceDataLoader.prototype.deleteSymbolSet = function(ss) {
    if (ss) {
        this._symbolSets.splice(this._symbolSets.indexOf(ss), 1);
        ss.destroy();
    }
}
/**
 * @param {ChartContainer|ChartSymbolSet} c
 * @param {string} s
 * @param {number} f
 */
PriceDataLoader.prototype.getData = function(c, s, f) {
    if (!this._data)
        return;
    if (this._data.canContain(s, f))
        return this._data.get(s, f);
    let rootFreq = PriceDataUtils.rootFreq(f);
    let cacheKey = (rootFreq === PriceDataConstants.FREQUENCY_D ? s : (s + "0"));
    let actual;
    let tl = this.getMasterTimeList(s, rootFreq);
    if (!tl)
        return;
    let root = new DataAggregator(s, tl, this.getMasterTimeList(s, PriceDataConstants.FREQUENCY_1), this.getMasterTimeList(s, PriceDataConstants.FREQUENCY_D));
    this._data.put(root);
    if (f !== rootFreq) {
        actual = new DataAggregator(s, this.getMasterTimeList(s, f), this.getMasterTimeList(s, PriceDataConstants.FREQUENCY_1), this.getMasterTimeList(s, PriceDataConstants.FREQUENCY_D));
        this._data.put(actual);
    }
    return actual ? actual : root;
}
/**
 * @param {string} s
 * @param {number} f
 */
PriceDataLoader.prototype.getMasterTimeList = function(s, f) {
    let tl = this._timeLists.contains(s, f.toString()) ? this._timeLists.get(s, f.toString()) : new MasterTimeList();
    if (tl._frequency === -1) {
        let si = this._symbolInfo.get(s);
        if (si && si._marketOpen !== si._marketClose) {
            tl.setMarketDetails(si._market, si._marketOpen, si._marketClose);
            tl._frequency = f;
            tl.initialise(f, tl.moveBackIntoMarketHours(tl.convertTime(new Date(), f)), 500, 50);
            this._timeLists.put(tl, s);
        } else {
            return;
        }
    }
    return tl;
}
/**
 * @param {DataAggregator} source
 * @param {Date} d
 */
PriceDataLoader.prototype.aggregateSetUpwards = function(source, d) {
    let limit = source._frequency < PriceDataConstants.FREQUENCY_D ? PriceDataConstants.FREQUENCY_60 : PriceDataConstants.FREQUENCY_Y;
    for (let i = source._frequency + 1; i <= limit; i++) {
        if (this._data.contains(source._symbol, i)) {
            let target = this._data.get(source._symbol, i);
            target.aggregateFromBelow(source, d);
        }
    }
}
PriceDataLoader.prototype.destroy = function() {
    for (let i = 0; i < this._symbolSets.length; i++) {
        let ss = this._symbolSets[i];
        ss.destroy();
    }
    this._symbolSets = undefined;
    this._data.destroy();
    this._data = undefined;
    this._timeLists.destroy();
    this._timeLists = undefined;
    this._localIndex.clear();
    this._localIndex = undefined;
    PriceDataLoader.theLoader = undefined;
}
PriceDataLoader.prototype.toString = function() {
    let buf = "Index:\n";
    this._localIndex.forEach(function(value, key, map){
        buf += key + ": " + value._startDate + " - " + value._endDate + " - " + value._crc + "\n";
    });
    buf += "\nSymbol info:\n";
    this._symbolInfo.forEach(function(value, key, map){
        buf += key + ": " + value._curPrice + " - " + value._marketOpen + " - " + value._marketClose + "\n";
    });
    return buf;
}
/**
 * @param {number} state
 */
PriceDataLoader.prototype.WebLoader_GetInfoDelegate_loadStateChanged = function(state) {
    let self = this;
    setTimeout(function(){
      for (let delegate of self._listeners) {
        if (delegate.WebLoader_GetInfoDelegate_loadStateChanged)
            delegate.WebLoader_GetInfoDelegate_loadStateChanged(state);
        }  
    }, 50);
}
/**
 * @param {string} symbol
 * @param {number} frequency
 */
PriceDataLoader.prototype.WebLoaderDelegate_onSetMinDataRange = function(symbol, frequency) {
    for (let delegate of this._listeners) {
        if (delegate.constructor.name === "ChartContainer") {
            let d1 = this.getData(delegate, symbol, frequency);
            d1._minDataRange = new Date(0);
        }
    }
}
/**
 * @param {string} symbol
 * @param {number} frequency
 * @param {number} rowDate
 * @param {number} cell0
 * @param {number} cell1
 * @param {number} cell2
 * @param {number} cell3
 * @param {number} cell4
 * @param {number} cell5
 * @param {number} cell6
 * @param {number} cell7
 * @param {number} cell8
 * @param {number} cell9
 * @param {number} state
 */
PriceDataLoader.prototype.onDataRow = function(symbol, frequency, rowDate, cell0, cell1, cell2, cell3, cell4, cell5, cell6, cell7, cell8, cell9, state) {
    if (state) {
        for (let delegate of this._listeners) {
            if (delegate.WebLoader_GetInfoDelegate_loadStateChanged)
                delegate.WebLoader_GetInfoDelegate_loadStateChanged(state);
        }
    }
    for (let delegate of this._listeners) {
        let rowD = new Date(rowDate);
        let tl = this.getMasterTimeList(symbol, frequency);
        let d = this.getData(delegate, symbol, frequency);
        if (tl._frequency === PriceDataConstants.FREQUENCY_D) {
            rowD = tl.setToMarketOpen(rowD);
        }
        let valid = !tl.isWeekendOrHoliday(rowD.getTime()) && tl.insideMarketHours(rowD.getTime());
//        if (valid) {
            if (d._minDataRange && rowD < d._minDataRange) {
                d._minDataRange = new Date(rowD.getTime());
            }
            d.setProxiesBulk(rowD, [cell0, cell1, cell2, cell3, cell4, cell5, cell6, cell7, cell8, cell9]);
            this.aggregateSetUpwards(d, rowD);
//        }
    }
}
/**
 * @param {string} symbol
 * @param {number} frequency
 * @param {number} rowDate
 * @param {number} cell0
 * @param {number} cell1
 * @param {number} cell2
 * @param {number} cell3
 * @param {number} cell4
 * @param {number} cell5
 * @param {number} cell6
 * @param {number} cell7
 * @param {number} cell8
 * @param {number} cell9
 * @param {number} state
 */
PriceDataLoader.prototype.WebLoaderDelegate_onDataRow = function(symbol, frequency, rowDate, cell0, cell1, cell2, cell3, cell4, cell5, cell6, cell7, cell8, cell9, state) {
    PriceDataLoader.loading = true;
    let self = this;
    setTimeout(function() {
        self.onDataRow(symbol, frequency, rowDate, cell0, cell1, cell2, cell3, cell4, cell5, cell6, cell7, cell8, cell9, state);
    }, 50);
}
/**
 * @param {Object} data
 */
PriceDataLoader.prototype.WebLoaderDelegate_onEventRow = function(data) {
    if (!data) {
        console.warn("PriceDataLoader. onEventRow data is empty");
        return;
    }
    for (let delegate of this._listeners) {
        let cal = Calendar.getInstance();
        cal.set(Calendar.YEAR, data.year);
        cal.set(Calendar.MONTH, data.month);
        cal.set(Calendar.DAY_OF_MONTH, data.day);
        cal.set(Calendar.HOUR_OF_DAY, 23);
        cal.set(Calendar.MINUTE, 59);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        let eventTime;
        if (undefined !== this.getMasterTimeList(data.symbol, 0)) {
            eventTime = this.getMasterTimeList(data.symbol, 0).setToMarketOpen(cal.getTime());
        } else {
            eventTime = new Date();
        }
        if (data.type === PriceDataEvent.EVENT_STOCKSPLIT) {
            let tl = this.getMasterTimeList(data.symbol, data.frequency);
            eventTime = tl.setToMarketOpen(tl.moveBackIntoMarketHours(eventTime));
            let d = this.getData(delegate, data.symbol, data.frequency);
            d.addEvent(new PriceDataEvent(PriceDataEvent.EVENT_STOCKSPLIT, eventTime, "Split: " + data.num + "/" + data.denom, data.num > data.denom ? Color.blue : Color.red));
        }
    }
}
/**
 * @param {Array} counts
 * @param {Array} gets
 */
PriceDataLoader.prototype.WebLoaderDelegate_doneWebLoad = function(counts, gets) {
    for (let i = 0; i < gets.length; i++) {
        let cur = gets[i]; // WebLoader_GetInfo
        if (counts[i] > 0) {
            let cacheKey = cur._frequency === PriceDataConstants.FREQUENCY_D ? cur._symbol : (cur._symbol + "0");
            let curEntry = this._localIndex.get(cacheKey); // CacheIndexEntry
            if (curEntry === undefined) {
                let myInfo = this._symbolInfo.get(cur._symbol);
                let myInfoCache = 0;
                if (myInfo) {
                    if (cur._frequency === PriceDataConstants.FREQUENCY_D) {
                        myInfoCache = myInfo._datacache_daily;
                    } else {
                        myInfoCache = myInfo._datacache_intra;
                    }
                }
                curEntry = new CacheIndexEntry(cur._from, cur._to, myInfoCache);
                this._localIndex.set(cacheKey, curEntry);
            } else {
                curEntry._startDate = Math.min(cur._from, curEntry._startDate);
                curEntry._endDate = Math.max(cur._to, curEntry._endDate);
            }
        }
    }
    PriceDataLoader.loading = false;
    for (let delegate of this._listeners) {
        delegate.WebLoader_GetInfoDelegate_loadCompleted(gets, counts);
    } 
}
/**
 * @param {number|string} error
 */
PriceDataLoader.prototype.WebLoaderDelegate_onError = function(error) {
    if (typeof error === "number") {
        Main.getSession()._root.showAlert("PriceDataLoader. Can't load pricehistory: " + ErrorCodes.strings[error]);
        console.log("PriceDataLoader. Can't load pricehistory: " + ErrorCodes.strings[error]);
    } else {
        Main.getSession()._root.showAlert("PriceDataLoader. Can't load pricehistory: " + error);
        console.log("PriceDataLoader. Can't load pricehistory: " + error);
    }
    Main.getSession()._root.showAlert("Error occured. Please, reload the page.");
    console.log("PriceDataLoader.webLoaderWorker.onError");
    PriceDataLoader.loading = false;
}
/** @static */
PriceDataLoader.NOT_LOADING = -2;
/** @static */
PriceDataLoader.CONNECTING = -1;
/**
 * @param {ChartContainer=} delegate
 */
PriceDataLoader.createLoader = function(delegate) {
    if (!PriceDataLoader.theLoader) {
        PriceDataLoader.theLoader = new PriceDataLoader(delegate);
    }
    return PriceDataLoader.theLoader;
}