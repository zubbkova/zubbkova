/* global DataCache, TimeListCache, WebLoader, Main, ErrorCodes, WebQuery_Table, Utils, ChartInfo, PriceDataUtils, PriceDataConstants, DataAggregator, MasterTimeList, Calendar, PriceDataEvent, Color, CacheIndexEntry */
/**
 * ---------------
 * PriceDataLoader
 * ---------------
 * @constructor
 * @param {ChartContainer=} delegate
 */
function PriceDataLoader(delegate) {
    this._listeners = new Array();
    if (delegate) {
        this._listeners.push(delegate);
    }
    this._state = PriceDataLoader.NOT_LOADING;
    this._data = new DataCache(this);
    this._timeLists = new TimeListCache();
    this._symbolSets = [];
    this._symbolInfo = new Object();
    this._localIndex = new Object();
    this._info = [];
}
/**
 * @param {ChartContainer} l
 */
PriceDataLoader.prototype.addListener = function(l) {
    if (l)
        this._listeners.push(l);
}
/**
 * @param {ChartContainer} delegate
 */
PriceDataLoader.prototype.removeListener = function(delegate) {
    this._listeners.splice(this._listeners.indexOf(delegate), 1);
}
/**
 * This method checks to see whether any clients have asked for new data to be loaded and if so calculates what is needed. For historical data it then checks to see whether it is in the local cache and if so fetches that. If more is needed or we want intraday data, then we start a WebLoader to get the data from ADVFN.
 */
PriceDataLoader.prototype.load = function() {
    var gets = [];
    var i;
    if (this._symbolSets) {
        for (i = 0; i < this._symbolSets.length; i++) {
            var ss = this._symbolSets[i];
            if (ss._isValid) {
                var ssGets = ss.load();
                for (var j = 0; j < ssGets.length; j++) {
                    gets.push(ssGets[j]);
                }
            }
        }
    }
    // WEB LOADER
    if (gets.length > 0) {
        for (i = 0; i < gets.length; i++) {
            var g = [];
            g.push(gets[i]);
            var webLoader = new WebLoader(this, g);
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
    var update = false;
    var tmp = "";
    for (var i = 0; i < s.length; i++) {
        if (s[i] === undefined || s[i].length === 0) {
            continue;
        }
        if (!this._symbolInfo.hasOwnProperty(s[i]) || this._symbolInfo[s[i]] === undefined) {
            update = true;
            tmp += (tmp.length === 0 ? "" : ",")
            if (Utils.getConstructorName(s[i]) === "Array") {
                tmp += s[i].join("");
            } else {
                 tmp += s[i];
            }
        }
    }
    if (!update) {
        return true;
    }
    var params = encodeURIComponent("symbol=" + tmp);
    var self = this;
    self.parseChartInfoResponse();
//    $.ajax({
//        type: "POST",
//        url: Main.getAdvfnURL() + "p.php?java=chartinfo",
//        crossdomain: true,
//        data: "param=" + params,
//        dataType: "text",
//        async: false,
//        success: function(responseData) {
//            self.parseChartInfoResponse(responseData);
//        },
//        error: function(responseData, textStatus) {
//            Main.getSession()._root.showAlert("PriceDataLoader. Can't load chartinfo: " + textStatus);
//            console.log("PriceDataLoader. Can't load chartinfo: " + textStatus);
//            self.parseChartInfoResponse(responseData);
//        }
//    });
}
/**
 * @param {Array} response
 */
PriceDataLoader.prototype.parseChartInfoResponse = function(response) {
    response = '0\n1\n38\nFULL_SYMBOL\nDISPLAY\nNAME_WITH_CURRENCY\nCUR_PRICE\nTIME\nYESTERDAYS_CLOSE\nOPEN_PRICE\nHIGH_PRICE\nLOW_PRICE\nDELAY\nDAY_OPEN\nDAY_CLOSE\nDAY_OPEN\nTYPE\nMARKET_SEGMENT\nDATACACHE_ERASE_INTRA\nDATACACHE_ERASE_DAILY\nCURRENCY\nISIN\nOFEXSYMBOL\nALT0_FULL_SYMBOL\nALT0_DISPLAY\nALT0_NAME\nALT1_FULL_SYMBOL\nALT1_DISPLAY\nALT1_NAME\nALT2_FULL_SYMBOL\nALT2_DISPLAY\nALT2_NAME\nALT3_FULL_SYMBOL\nALT3_DISPLAY\nALT3_NAME\nALT4_FULL_SYMBOL\nALT4_DISPLAY\nALT4_NAME\nALT5_FULL_SYMBOL\nALT5_DISPLAY\nALT5_NAME\nL^VOD\nLSE:VOD\nVodafone Group (GBX)\n216.85\n1508687654\n217.05\n217.5\n218.45\n215.95\n0\n28800\n59400\n28800\nDE\nSET0\n0\n0\nGBX\nGB00BH4HKS39\nNULL\nL^VOD\nLSE:VOD\nVodafone Group\nN^VOD\nNASDAQ:VOD\nVodafone Grp. Plc ADS Each Representing Ten Ordinary Shares (MM)\n\n\n\n\n\n\n\n\n\n\n\n\n';
    if (response.length === 0) {
        Main.getSession()._root.showAlert("PriceDataLoader. Empty reponse");
        console.log("PriceDataLoader. Empty reponse");
        return false;
    }
    response = response.toString().split("\n");
    var error = parseInt(response[0], 10);
    if (error !== 0) {
        Main.getSession()._root.showAlert("PriceDataLoader. Can't load chartinfo: " + ErrorCodes.strings[error]);
        console.log("PriceDataLoader. Can't load chartinfo: " + ErrorCodes.strings[error]);
        return false;
    }
    var numRows = parseInt(response[1], 10);
    var numColumns = parseInt(response[2], 10);
    var table = new WebQuery_Table(numColumns, numRows);
    var lineNum = 3;
    var i;
    for (i = 0; i < numColumns; i++) {
        table._columnName[i] = response[lineNum];
        lineNum++;
    }
    for (i = 0; i < numRows; i++) {
        for (var j = 0; j < numColumns; j++) {
            table._contents[i][j] = Utils.replace(response[lineNum], "\u001b", "\n");
            lineNum++;
        }
    }
    var ts = 0;
    for (var num = 0; num < table._numRows; num++) {
        var info = new ChartInfo();
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
        info._delay = parseInt(parseInt(table._contents[num][table._columnName.indexOf("DELAY")], 10), 10);
        info._marketOpen = parseInt(parseInt(table._contents[num][table._columnName.indexOf("DAY_OPEN")], 10) / 60, 10);
        info._marketClose = parseInt(parseInt(table._contents[num][table._columnName.indexOf("DAY_CLOSE")], 10) / 60, 10);
        info._type = table._contents[num][table._columnName.indexOf("TYPE")];
        info._marketSegment = table._contents[num][table._columnName.indexOf("MARKET_SEGMENT")];
        info._datacache_intra = parseInt(Utils.parseLong(table._contents[num][table._columnName.indexOf("DATACACHE_ERASE_INTRA")]), 10);
        info._datacache_daily = parseInt(Utils.parseLong(table._contents[num][table._columnName.indexOf("DATACACHE_ERASE_DAILY")]), 10);
        info.setCurrency(table._contents[num][table._columnName.indexOf("CURRENCY")]);
        info._ISIN = table._contents[num][table._columnName.indexOf("ISIN")];
        var alts = [];
        var cn = table._columnName.indexOf("ALT0_FULL_SYMBOL");
        for (var altNum = 0; altNum < 6; altNum++) {
            if (!table._contents[num][cn] || table._contents[num][cn].length === 0) {
                break;
            }
            var a = new Array(3);
            a[0] = table._contents[num][cn++];
            a[1] = table._contents[num][cn++];
            a[2] = table._contents[num][cn++];
            alts.splice(altNum, 0, a);
        }
        this._symbolInfo[info._symbol] = info;
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
    var rootFreq = PriceDataUtils.rootFreq(f);
    var actual;
    var tl = this.getMasterTimeList(s, rootFreq);
    if (!tl)
        return;
    var root = new DataAggregator(s, tl, this.getMasterTimeList(s, PriceDataConstants.FREQUENCY_1), this.getMasterTimeList(s, PriceDataConstants.FREQUENCY_D));
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
    var tl = this._timeLists.contains(s, f.toString()) ? this._timeLists.get(s, f.toString()) : new MasterTimeList();
    if (tl._frequency === -1) {
        var si = this._symbolInfo[s];
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
    var limit = source._frequency < PriceDataConstants.FREQUENCY_D ? PriceDataConstants.FREQUENCY_60 : PriceDataConstants.FREQUENCY_Y;
    for (var i = source._frequency + 1; i <= limit; i++) {
        if (this._data.contains(source._symbol, i)) {
            var target = this._data.get(source._symbol, i);
            target.aggregateFromBelow(source, d);
        }
    }
}
PriceDataLoader.prototype.destroy = function() {
    for (var i = 0; i < this._symbolSets.length; i++) {
        var ss = this._symbolSets[i];
        ss.destroy();
    }
    this._symbolSets = undefined;
    this._data.destroy();
    this._data = undefined;
    this._timeLists.destroy();
    this._timeLists = undefined;
    this._localIndex = undefined;
    PriceDataLoader.theLoader = undefined;
}
PriceDataLoader.prototype.toString = function() {
    var buf = "Index:\n";
    var prop;
    for (prop in this._localIndex) {
        buf += prop + ": " + this._localIndex[prop]._startDate + " - " + this._localIndex[prop]._endDate + " - " + this._localIndex[prop]._crc + "\n";
    }
    buf += "\nSymbol info:\n";
    for (prop in this._symbolInfo) {
        buf += prop + ": " + this._symbolInfo[prop]._curPrice + " - " + this._symbolInfo[prop]._marketOpen + " - " + this._symbolInfo[prop]._marketClose + "\n";
    }
    return buf;
}
/**
 * @param {number} state
 */
PriceDataLoader.prototype.WebLoader_GetInfoDelegate_loadStateChanged = function(state) {
    var self = this;
    setTimeout(function(){
      for (var i = 0; i < self._listeners.length; i++) {
        if (self._listeners[i].WebLoader_GetInfoDelegate_loadStateChanged)
            self._listeners[i].WebLoader_GetInfoDelegate_loadStateChanged(state);
        }  
    }, 50);
}
/**
 * @param {string} symbol
 * @param {number} frequency
 */
PriceDataLoader.prototype.WebLoaderDelegate_onSetMinDataRange = function(symbol, frequency) {
    for (var i = 0; i < this._listeners.length; i++) {
        if (Utils.getConstructorName(this._listeners[i]) === "ChartContainer") {
            var d1 = this.getData(this._listeners[i], symbol, frequency);
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
    var i;
    if (state) {
        for (i = 0; i < this._listeners.length; i++) {
            if (this._listeners[i].WebLoader_GetInfoDelegate_loadStateChanged)
                this._listeners[i].WebLoader_GetInfoDelegate_loadStateChanged(state);
        }
    }
    for (i = 0; i < this._listeners.length; i++) {
        var rowD = new Date(rowDate);
        var tl = this.getMasterTimeList(symbol, frequency);
        var d = this.getData(this._listeners[i], symbol, frequency);
        if (tl._frequency === PriceDataConstants.FREQUENCY_D) {
            rowD = tl.setToMarketOpen(rowD);
        }
        var valid = !tl.isWeekendOrHoliday(rowD.getTime()) && tl.insideMarketHours(rowD.getTime());
        if (valid) {
            if (d._minDataRange && rowD < d._minDataRange) {
                d._minDataRange = new Date(rowD.getTime());
            }
            d.setProxiesBulk(rowD, [cell0, cell1, cell2, cell3, cell4, cell5, cell6, cell7, cell8, cell9]);
            this.aggregateSetUpwards(d, rowD);
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
PriceDataLoader.prototype.WebLoaderDelegate_onDataRow = function(symbol, frequency, rowDate, cell0, cell1, cell2, cell3, cell4, cell5, cell6, cell7, cell8, cell9, state) {
    PriceDataLoader.loading = true;
    var self = this;
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
    for (var i = 0; i < this._listeners.length; i++) {
        var cal = Calendar.getInstance();
        cal.set(Calendar.YEAR, data.year);
        cal.set(Calendar.MONTH, data.month);
        cal.set(Calendar.DAY_OF_MONTH, data.day);
        cal.set(Calendar.HOUR_OF_DAY, 23);
        cal.set(Calendar.MINUTE, 59);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        var eventTime;
        if (undefined !== this.getMasterTimeList(data.symbol, 0)) {
            eventTime = this.getMasterTimeList(data.symbol, 0).setToMarketOpen(cal.getTime());
        } else {
            eventTime = new Date();
        }
        if (data.type === PriceDataEvent.EVENT_STOCKSPLIT) {
            var tl = this.getMasterTimeList(data.symbol, data.frequency);
            eventTime = tl.setToMarketOpen(tl.moveBackIntoMarketHours(eventTime));
            var d = this.getData(this._listeners[i], data.symbol, data.frequency);
            d.addEvent(new PriceDataEvent(PriceDataEvent.EVENT_STOCKSPLIT, eventTime, "Split: " + data.num + "/" + data.denom, data.num > data.denom ? Color.blue : Color.red));
        }
    }
}
/**
 * @param {Array} counts
 * @param {Array} gets
 */
PriceDataLoader.prototype.WebLoaderDelegate_doneWebLoad = function(counts, gets) {
    var i;
    for (i = 0; i < gets.length; i++) {
        var cur = gets[i]; // WebLoader_GetInfo
        if (counts[i] > 0) {
            var cacheKey = cur._frequency === PriceDataConstants.FREQUENCY_D ? cur._symbol : (cur._symbol + "0");
            var curEntry = this._localIndex[cacheKey]; // CacheIndexEntry
            if (curEntry === undefined) {
                var myInfo = this._symbolInfo[cur._symbol];
                var myInfoCache = 0;
                if (myInfo) {
                    if (cur._frequency === PriceDataConstants.FREQUENCY_D) {
                        myInfoCache = myInfo._datacache_daily;
                    } else {
                        myInfoCache = myInfo._datacache_intra;
                    }
                }
                curEntry = new CacheIndexEntry(cur._from, cur._to, myInfoCache);
                this._localIndex[cacheKey] = curEntry;
            } else {
                curEntry._startDate = Math.min(cur._from, curEntry._startDate);
                curEntry._endDate = Math.max(cur._to, curEntry._endDate);
            }
        }
    }
    PriceDataLoader.loading = false;
    for (i = 0; i < this._listeners.length; i++) {
        this._listeners[i].WebLoader_GetInfoDelegate_loadCompleted(gets, counts);
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