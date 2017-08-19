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
    this._keyToEntry = new Map();
    this._lowTarget = new Date(8640000000000000);
    this._highTarget = new Date(0);
    if (arguments.length === 3) {
        this.changeSymbols(s);
        return;
    }
    if (f.constructor.name === "Array") {
        this.changeSymbols(s, f);
        return;
    }
    let fs = [];
    for (let i = 0; i < s.length; i++) {
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
        let tmp = SymbolSet.parseSymbolSetString(s.toString());
        this.changeSymbols(tmp[0], tmp[1]);
        return;
    }
    if (typeof f === "number") {
        let fs = [];
        for (let i = 0; i < s.length; i++) {
            fs.push(f);
        }
        this.changeSymbols(s, fs);
        return;
    }
    this._parent.getChartInfo(s);
    let oldSyms = this.allEntryKeys();
    let newSyms = new Set();
    for (let i = 0; i < s.length; i++) {
        if (!s[i]) 
            continue;
        if (this._parent._symbolInfo.get(s[i])) {
            newSyms.add(s[i] + "," + f[i]);
        }
    }
    let addedKeys = newSyms.difference(oldSyms);
    let newEntries = new Array(newSyms.size);
    let newKeys = new Map();
    let i = 0;
    for (let curKey of newSyms) {
        if (oldSyms.has(curKey)) {
            newEntries[i] = this._keyToEntry.get(curKey);
        } else {
            newEntries[i] = new SymbolSet_SymbolSetEntry(curKey.substring(0, curKey.indexOf(",")), parseInt(curKey.substring(curKey.indexOf(",") + 1), 10));
        }
        newKeys.set(curKey, newEntries[i]);
        i++;
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
        this.initialise(new Map());
        return;
    }
    this._keyToEntry = new Map();
    for (let i = 0; i < this._entries.length; i++) {
        this._parent._data.remove(this._entries[i]._symbol, this._entries[i]._frequency);
        this._entries[i]._data = undefined;
        this._entries[i]._frequency = f[i];
        this._keyToEntry.set(this._entries[i]._symbol + f[i].toString(), this._entries[i]);
    }
    this.initialise(new Map());
}
/**
 * @param {Map} newSyms
 */
SymbolSet.prototype.initialise = function(newSyms) {
    for (let i = 0; i < this._entries.length; i++) {
        if (this._entries[i])
            this._entries[i]._data = this._parent.getData(this._client, this._entries[i]._symbol, this._entries[i]._frequency);
    }
    this._isValid = this._entries[0] && this._entries[0]._data;
    this._lowTarget = new Date(8640000000000000);
    this._highTarget = new Date(0);
}
SymbolSet.prototype.allEntryKeys = function() {
    let keys = new Set();
    if (this._entries) {
        for (let item of this._entries) {
            keys.add(item.key());
        }
    }
    return keys;
}
SymbolSet.prototype.size = function() {
    return this._entries ? this._entries.length : 0;
}
SymbolSet.prototype.symbols = function() {
    let s = new Array();
    for (let item of this._entries) {
        s.push(item._symbol);
    }
    return s;
}
SymbolSet.prototype.setAllNew = function() {
    for (let i = 0; i < this._entries.length; i++) {
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
    return this._isValid ? this._keyToEntry.get(symbol + frequency)._data : undefined;
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
    return this._parent._symbolInfo.get(this._entries[index]._symbol);
}
SymbolSet.prototype.destroy = function() {
    if (this._entries === undefined)
        return;
    for (let i = 0; i < this._entries.length; i++) {
        this._parent._data.remove(this._entries[i]._symbol, this._entries[i]._frequency);
        this._entries[i] = undefined;
    }
    this._entries = undefined;
}
SymbolSet.prototype.hasData = function() {
    if (!this._isValid) 
        return false;
    for (let item of this._entries) {
        if (item._data && item._data.size() > 0) 
            return true;
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
    let symStr = "";
    let freqStr = "";
    for (let item of this._entries) {
        symStr += item._symbol + ", ";
        freqStr += item._frequency + ", ";
    }
    return "Symbols ({0}), Frequencies ({1})".format(symStr, freqStr);
}
SymbolSet.prototype.getParamString = function() {
    let buf = [];
    for (let item of this._entries) {
        buf.push(item.ssKey());
    }
    return buf.join(',');
}
/**
 * @param {number} i
 */
SymbolSet.prototype.getDisplaySymbol = function(i) {
    if (i >= this._entries.length)
        return undefined;
    if (this._parent._symbolInfo.has(this._entries[i]._symbol)) {
        let inf = this._parent._symbolInfo.get(this._entries[i]._symbol);
        return inf._displaySymbol;
    }
    return undefined;
}
/**
 * @param {number} s
 */
SymbolSet.prototype.showData = function(s) {
    let buf = '';
    for (let item of this._entries) {
        buf += item._symbol + ' - ' + item._frequency + ' - ' + item._data.size() + ' items \n';
        buf += 'Proxy start = ' + item._data._proxies[s].timeStart() + ' end = ' + item._data._proxies[s].timeEnd() + '\n';
        for (let j = 0; j < item._data.size(); j++) {
            buf += item._data.timeByIndex(j) + ' - ' + Math.trunc(item._data.timeByIndex(j).getTime() / 1000) + ' - ' + item._data.getByIndex(s, j) + '\n';
        }
        buf += '\n';
    }
    return buf;
}
SymbolSet.prototype.load = function() {
    let gets = [];
    if (!this._isValid) return gets;
    let rootFreq = PriceDataUtils.rootFreq(this.mainFrequency());
    let intLT = Math.max(Math.trunc(this._lowTarget.getTime() / 1000), 0);
    let intHT = Math.max(Math.trunc(this._highTarget.getTime() / 1000), 0);
    for (let i = 0; i < this._entries.length; i++) {
        let rootData = this._parent.getData(this._client, this._entries[i]._symbol, rootFreq); // DataAggregator
        let curData = this._entries[i]._data;
        if (curData._maxDataRange.getTime() === 0) {
//        if (curData._maxDataRange.getTime() === 0 || curData._data[0].length === 0) {
            gets.push(new WebLoader_GetInfo(this._entries[i]._symbol, rootFreq, intLT, intHT, false));
            curData._minDataRange = new Date(this._lowTarget.getTime());
            curData._maxDataRange = new Date(this._highTarget.getTime());
            rootData._minDataRange = new Date(intLT * 1000);
            rootData._maxDataRange = new Date(intHT * 1000);
        } else {
            let intMiR = Math.trunc(curData._minDataRange.getTime() / 1000);
            let intMaR = Math.trunc(curData._maxDataRange.getTime() / 1000);
            if (intMiR === 0) {
                curData._minDataRange = new Date(this._lowTarget.getTime());
                intMiR = Math.trunc(curData._minDataRange.getTime() / 1000);
            }
            let periodInSeconds = rootFreq === 0 ? 60 : 86400;
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
    let tokens = ss.split(',');
    let numItems = Math.trunc(tokens.length / 2);
    let s = new Array(numItems);
    let f = new Array(numItems);
    let j = 0;
    for (let i = 0; i < numItems; i++) {
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