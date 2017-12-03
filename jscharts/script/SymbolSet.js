/* eslint no-unused-vars: "off" */
/* global WebLoader_GetInfo, PriceDataUtils, DataAggregator, Utils */
/**
 * ---------
 * SymbolSet
 * ---------
 * This class represents a group of symbols which are being viewed together. The first symbol is considered to be the
 * primary symbol and the rest secondary e.g. in charts the first symbol is the main one and the rest are overlays
 * linked to it. Each symbol can have its own frequency which allows viewing the same symbol over different frequencies
 * simultaneously.
 * @constructor
 * @param {PriceDataLoader} priceDataLoader
 * @param {ChartContainer|ChartSymbolSet} loaderClient
 * @param {Array|string} s - symbols
 * @param {Array|number=} f - frequency
 */
function SymbolSet(priceDataLoader, loaderClient, s, f) {
    this._parent = priceDataLoader;
    this._client = loaderClient;
    this._keyToEntry = new Object();
    this._lowTarget = new Date(8640000000000000);
    this._highTarget = new Date(0);
    if (arguments.length === 3) {
        this.changeSymbols(s);
        return;
    }
    if (Utils.getConstructorName(f) === "Array") {
        this.changeSymbols(s, f);
        return;
    }
    var fs = [];
    for (var i = 0; i < s.length; i++) {
        fs.push(f);
    }
    this.changeSymbols(s, fs);
}
/**
 * @param {string|Array} s
 * @param {Array|number=} f
 */
SymbolSet.prototype.changeSymbols = function(s, f) {
    if (arguments.length === 1) {
        var tmp = SymbolSet.parseSymbolSetString(s.toString());
        this.changeSymbols(tmp[0], tmp[1]);
        return;
    }
    var i;
    if (typeof f === "number") {
        var fs = [];
        for (i = 0; i < s.length; i++) {
            fs.push(f);
        }
        this.changeSymbols(s, fs);
        return;
    }
    this._parent.getChartInfo(s);
    var oldSyms = this.allEntryKeys(); // Array
    var newSyms = [];
    for (i = 0; i < s.length; i++) {
        if (!s[i]) 
            continue;
        if (this._parent._symbolInfo[s[i]]) {
            if (newSyms.indexOf(s[i] + "," + f[i]) === -1) {
                newSyms.push(s[i] + "," + f[i]);
            }
        }
    }
    var addedKeys = newSyms.difference(oldSyms);
    var newEntries = new Array(newSyms.length);
    var newKeys = new Object();
    
    for (i = 0; i < newSyms.length; i++) {
        var curKey = newSyms[i];
        if (oldSyms.indexOf(curKey) !== -1) {
            newEntries[i] = this._keyToEntry[curKey];
        } else {
            newEntries[i] = new SymbolSet_SymbolSetEntry(curKey.substring(0, curKey.indexOf(",")), parseInt(curKey.substring(curKey.indexOf(",") + 1), 10));
        }
        newKeys[curKey] = newEntries[i];
    }
    this._entries = newEntries;
    this._keyToEntry = newKeys;
    this.initialise(addedKeys);
    this._parent.load();
}
/**
 * @param {Array} f
 */
SymbolSet.prototype.changeOnlyFrequency = function(f) {
    if (this._entries === undefined) {
        this.initialise([]);
        return;
    }
    this._keyToEntry = new Object();
    for (var i = 0; i < this._entries.length; i++) {
        this._parent._data.remove(this._entries[i]._symbol, this._entries[i]._frequency);
        this._entries[i]._data = undefined;
        this._entries[i]._frequency = f[i];
        this._keyToEntry[this._entries[i]._symbol + f[i].toString()] = this._entries[i];
    }
    this.initialise([]);
}
/**
 * @param {Array} newSyms
 */
SymbolSet.prototype.initialise = function(newSyms) {
    for (var i = 0; i < this._entries.length; i++) {
        if (this._entries[i])
            this._entries[i]._data = this._parent.getData(this._client, this._entries[i]._symbol, this._entries[i]._frequency);
    }
    this._isValid = this._entries[0] && this._entries[0]._data;
    this._lowTarget = new Date(8640000000000000);
    this._highTarget = new Date(0);
}
SymbolSet.prototype.allEntryKeys = function() {
    var keys = [];
    // Array of SymbolSetEntry
    if (this._entries) {
        for (var i = 0; i < this._entries.length; i++) {
            keys.push(this._entries[i].key());
        }
    }
    return keys;
}
SymbolSet.prototype.size = function() {
    return this._entries ? this._entries.length : 0;
}
SymbolSet.prototype.symbols = function() {
    var s = new Array();
    if (this._entries) {
        for (var i = 0; i < this._entries.length; i++) {
            s.push(this._entries[i]._symbol);
        }
    }
    return s;
}
SymbolSet.prototype.setAllNew = function() {
    for (var i = 0; i < this._entries.length; i++) {
        this._entries[i]._newSymbol = true;
    }
}
SymbolSet.prototype.mainSymbol = function() {
    return this._isValid ? this._entries[0]._symbol : undefined;
}
SymbolSet.prototype.mainFrequency = function() {
    return this._isValid ? this._entries[0]._frequency : -1;
}
/**
 * @param {number} index
 */
SymbolSet.prototype.getData = function(index) {
    return this._isValid ? this._entries[index]._data : undefined;
}
/**
 * @param {string} symbol
 * @param {number} frequency
 */
SymbolSet.prototype.getDataBySymbol = function(symbol, frequency) {
    return this._isValid ? this._keyToEntry[symbol + frequency]._data : undefined;
}
/**
 * @param {number} si
 * @param {number} series
 */
SymbolSet.prototype.getSeries = function(si, series) {
    return this._isValid ? this._entries[si]._data._proxies[series] : undefined;
}
SymbolSet.prototype.getMasterTimeList = function() {
    return this._isValid ? this._entries[0]._data._timeList : undefined;
}
SymbolSet.prototype.getIntraMasterTimeList = function() {
    return this._isValid ? this._entries[0]._data._intraTimeList : undefined;
}
SymbolSet.prototype.getDailyMasterTimeList = function() {
    return this._isValid ? this._entries[0]._data._dailyTimeList : undefined;
}
/**
 * @param {number} index
 */
SymbolSet.prototype.getSymbolInfo = function(index) {
    if (index >= this._entries.length)
        return undefined;
    return this._parent._symbolInfo[this._entries[index]._symbol];
}
SymbolSet.prototype.destroy = function() {
    if (this._entries === undefined)
        return;
    for (var i = 0; i < this._entries.length; i++) {
        this._parent._data.remove(this._entries[i]._symbol, this._entries[i]._frequency);
        this._entries[i] = undefined;
    }
    this._entries = undefined;
}
SymbolSet.prototype.hasData = function() {
    if (!this._isValid) 
        return false;
    if (this._entries) {
        for (var i = 0; i < this._entries.length; i++) {
            if (this._entries[i]._data && this._entries[i]._data.size() > 0) 
                return true;
        }
    }
    return false;
}
/**
 * @param {Date} start
 */
SymbolSet.prototype.setStart = function(start) {
    if (start < this._lowTarget) {
        this._lowTarget = new Date(start.getTime());
    }
}
/**
 * @param {Date} end
 */
SymbolSet.prototype.setEnd = function(end) {
    if (end > this._highTarget) {
        this._highTarget = new Date(end.getTime());
    }
}
SymbolSet.prototype.getStart = function() {
    return this._lowTarget;
}
SymbolSet.prototype.getEnd = function() {
    return this._highTarget;
}
SymbolSet.prototype.toString = function() {
    var symStr = "";
    var freqStr = "";
    if (this._entries) {
        for (var i = 0; i < this._entries.length; i++) {
            symStr += this._entries[i]._symbol + ", ";
            freqStr += this._entries[i]._frequency + ", ";
        }
    }
    return "Symbols ({0}), Frequencies ({1})".format(symStr, freqStr);
}
SymbolSet.prototype.getParamString = function() {
    var buf = [];
    if (this._entries) {
        for (var i = 0; i < this._entries.length; i++) {
            buf.push(this._entries[i].ssKey());
        }
    }
    return buf.join(',');
}
/**
 * @param {number} i
 */
SymbolSet.prototype.getDisplaySymbol = function(i) {
    if (i >= this._entries.length)
        return undefined;
    if (this._parent._symbolInfo.hasOwnProperty(this._entries[i]._symbol)) {
        var inf = this._parent._symbolInfo[this._entries[i]._symbol];
        return inf._displaySymbol;
    }
    return undefined;
}
/**
 * @param {number} s
 */
SymbolSet.prototype.showData = function(s) {
    var buf = '';
    if (this._entries) {
        for (var i = 0; i < this._entries.length; i++) {
            buf += this._entries[i]._symbol + ' - ' + this._entries[i]._frequency + ' - ' + this._entries[i]._data.size() + ' items \n';
            buf += 'Proxy start = ' + this._entries[i]._data._proxies[s].timeStart() + ' end = ' + this._entries[i]._data._proxies[s].timeEnd() + '\n';
            for (var j = 0; j < this._entries[i]._data.size(); j++) {
                buf += this._entries[i]._data.timeByIndex(j) + ' - ' + parseInt(this._entries[i]._data.timeByIndex(j).getTime() / 1000, 10) + ' - ' + this._entries[i]._data.getByIndex(s, j) + '\n';
            }
            buf += '\n';
        }
    }
    return buf;
}
SymbolSet.prototype.load = function() {
    var gets = [];
    if (!this._isValid) return gets;
    var rootFreq = PriceDataUtils.rootFreq(this.mainFrequency());
    var intLT = Math.max(parseInt(this._lowTarget.getTime() / 1000, 10), 0);
    var intHT = Math.max(parseInt(this._highTarget.getTime() / 1000, 10), 0);
    for (var i = 0; i < this._entries.length; i++) {
        var rootData = this._parent.getData(this._client, this._entries[i]._symbol, rootFreq); // DataAggregator
        var curData = this._entries[i]._data;
        if (curData._maxDataRange.getTime() === 0) {
//        if (curData._maxDataRange.getTime() === 0 || curData._data[0].length === 0) {
            gets.push(new WebLoader_GetInfo(this._entries[i]._symbol, rootFreq, intLT, intHT, false));
            curData._minDataRange = new Date(this._lowTarget.getTime());
            curData._maxDataRange = new Date(this._highTarget.getTime());
            rootData._minDataRange = new Date(intLT * 1000);
            rootData._maxDataRange = new Date(intHT * 1000);
        } else {
            var intMiR = parseInt(curData._minDataRange.getTime() / 1000, 10);
            var intMaR = parseInt(curData._maxDataRange.getTime() / 1000, 10);
            if (intMiR === 0) {
                curData._minDataRange = new Date(this._lowTarget.getTime());
                intMiR = parseInt(curData._minDataRange.getTime() / 1000, 10);
            }
            var periodInSeconds = rootFreq === 0 ? 60 : 86400;
            if (intLT === 0 || intHT === 0) {
                this._entries[i]._newSymbol = false;
                continue;
            }
            if (intLT < intMiR) {
                // todo: fix for now (empty data in periods)
                if (curData._proxies[0])
                    intMiR = curData._proxies[i]._realTimeStart.getTime() / 1000;
                //
                gets.push(new WebLoader_GetInfo(this._entries[i]._symbol, rootFreq, intLT, intMiR - periodInSeconds, false));
                curData._minDataRange = new Date(this._lowTarget.getTime());
                rootData._minDataRange = new Date(intLT * 1000);
            }
            if (this._entries[i]._newSymbol && intHT > intMaR) {
                gets.push(new WebLoader_GetInfo(this._entries[i]._symbol, rootFreq, intMaR + periodInSeconds, intHT, true));
                curData._maxDataRange = new Date(this._highTarget.getTime());
                rootData._maxDataRange = new Date(intHT * 1000);
                this._entries[i]._newSymbol = false;
            }
        }
    }
    return gets;
}
/**
 * @static
 * @param {string} ss
 */
SymbolSet.parseSymbolSetString = function(ss) {
    var tokens = ss.split(',');
    var numItems = parseInt(tokens.length / 2, 10);
    var s = new Array(numItems);
    var f = new Array(numItems);
    var j = 0;
    for (var i = 0; i < numItems; i++) {
        s[i] = (tokens[j++]);
        f[i] = (tokens[j++]);
    }
    return [s, f];
}
/**
 * @constructor
 * @param {string} symbol
 * @param {number} frequency
 */
function SymbolSet_SymbolSetEntry(symbol, frequency) {
    this._symbol = symbol;
    this._frequency = frequency;
    this._series = new Array(DataAggregator.NUM_SERIES);
    this._newSymbol = true;
}
SymbolSet_SymbolSetEntry.prototype.key = function() {
    return this._symbol + this._frequency;
}
SymbolSet_SymbolSetEntry.prototype.ssKey = function() {
    return this._symbol + "," + this._frequency;
}