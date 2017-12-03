/* global PriceDataLoader, Calendar, PriceDataConstants, Exchanges, TimeList, ProxySeries, Utils */
/**
 * --------------
 * DataAggregator
 * --------------
 * @constructor
 * @param {DataAggregator|string} s
 * @param {MasterTimeList} tl
 * @param {MasterTimeList} itl
 * @param {MasterTimeList} dtl
 */
function DataAggregator(s, tl, itl, dtl) {
    this._time = undefined; // TimeList
    this._data = [[]];
    this._eventList = new Object();
    this._proxies = []; // ProxySeries
    this._outsideData = false;
    this._priceDataLoader = PriceDataLoader.createLoader();
    this._myCal = Calendar.getInstance();
    this._marketOpen = 0;
    this._marketClose = 0;
    this._marketTZ = undefined; // String
    if (Utils.getConstructorName(s) === "DataAggregator") {
        this._symbol = s._symbol;
    } else {
        this._symbol = s;
    }
    this._frequency = tl._frequency;
    this._timeList = tl;
    this._intraTimeList = itl;
    this._dailyTimeList = dtl;
    this._initialise();
    if (typeof s === "string") {
        this._minDataRange = new Date(8640000000000000);
        this._maxDataRange = new Date(0);
    } else {
        this.aggregateAllFrom(s);
    }
}
/**
 * @param {Date} d
 * @param {Array} values
 */
DataAggregator.prototype.setProxiesBulk = function(d, values) {
    for (var i = 0; i < this._proxies.length; i++) {
        this._proxies[i].set(d, values[i]);
    }
}
DataAggregator.prototype.clear = function() {
    if (this._time)
        this._time.clear();
    this._eventList = new Object();
    for (var i = 0; i < DataAggregator.NUM_SERIES; i++) {
        this._data[i] = [];
        this._proxies[i].initTimes();
    }
    this._minDataRange = new Date(8640000000000000);
    this._maxDataRange = new Date(0);
}
DataAggregator.prototype.destroy = function() {
    if (this._time)
        this._time.clear();
    this._time = undefined;
    this._eventList = undefined;
    for (var i = 0; i < DataAggregator.NUM_SERIES; i++) {
        this._data[i] = undefined;
        this._proxies[i] = undefined;
    }
    this._timeList = undefined;
    this._intraTimeList = undefined;
    this._dailyTimeList = undefined;
    this._minDataRange = undefined;
    this._maxDataRange = undefined;
}
DataAggregator.prototype.size = function() {
    if (!this._time) 
        return 0;
    return this._time.size();
}
/**
 * @param {Date} d
 */
DataAggregator.prototype.getIndexByDate = function(d) {
    if (this._time)
        return this._time.get(d);
}
/**
 * @param {number} index
 */
DataAggregator.prototype.timeByIndex = function(index) {
    if (this._time)
        return new Date(this._time.getByIndex(index));
}
/**
 * @param {number} series
 * @param {number} index
 */
DataAggregator.prototype.getByIndex = function(series, index) {
    if (!this._time) {
        console.error("DataAggregator.prototype.getByIndex. time is undefined");
        return NaN;
    }
    if (!this._outsideData || this._frequency >= PriceDataConstants.FREQUENCY_D) {
        try {
            return this._data[series][index >= 0 ? index : this._time.size() + index];    
        } catch (e) {
            this._clearAndReinitialiseData();
            return NaN;
        }
    } else {
        if (this._marketOpen === 0 || this._marketClose === 0 || this._marketTZ === undefined) {
            this._marketOpen = this._priceDataLoader._symbolInfo[this._symbol]._marketOpen;
            this._marketClose = this._priceDataLoader._symbolInfo[this._symbol]._marketClose;
            this._marketTZ = this._priceDataLoader._symbolInfo[this._symbol]._market;
        }
        var myTime = this._time.getByIndex(index >= 0 ? index : this._time.size() + index);
        this._myCal.setTime(new Date(myTime));
        var tz = Exchanges.getTimeZone(this._marketTZ);
        if (tz === undefined) {
            console.warn("===WARNING=== Market " + this._marketTZ + " has no defined Timezone in Exchanges.getTimeZone()!")
        }
        this._myCal = Calendar.getInstance(tz);
        this._myCal.set(Calendar.HOUR_OF_DAY, 0);
        this._myCal.set(Calendar.MINUTE, 0);
        this._myCal.set(Calendar.SECOND, 0);
        this._myCal.set(Calendar.MILLISECOND, 0);
        var midnight = this._myCal.getTime().getTime();
        var nextMidnight = midnight + (1000 * 60 * 60 * 24);
        var timestampMO = (this._myCal.getTime().getTime()) + (this._marketOpen * 60000);
        var timestampMC = (this._myCal.getTime().getTime()) + ((this._marketClose - 1) * 60000);
        var out = NaN;
        if (myTime >= timestampMC) {
            while (myTime < nextMidnight) {
                try {
                    switch (series) {
                        case DataAggregator.S_BID_CLOSE:
                        case DataAggregator.S_OFFER_CLOSE:
                        case DataAggregator.S_CUR_CLOSE:
                            out = this._data[series][index >= 0 ? index : this._time.size() + index];
                            break;
                        case DataAggregator.S_CUR_OPEN:
                            if (isNaN(out)) {
                                out = this._data[series][index >= 0 ? index : this._time.size() + index];
                            }
                            break;
                        case DataAggregator.S_CUR_HIGH:
                            if (isNaN(out)) {
                                out = this._data[series][index >= 0 ? index : this._time.size() + index];
                            } else {
                                out = Math.max(out, this._data[series][index >= 0 ? index : this._time.size() + index]);
                            }
                            break;
                        case DataAggregator.S_CUR_LOW:
                            if (isNaN(out)) {
                                out = this._data[series][index >= 0 ? index : this._time.size() + index];
                            } else {
                                out = Math.min(out, this._data[series][index >= 0 ? index : this._time.size() + index]);
                            }
                            break;
                        case DataAggregator.S_SELL_VOLUME:
                        case DataAggregator.S_UNKNOWN_VOLUME:
                        case DataAggregator.S_TOTAL_VOLUME:
                            if (isNaN(out)) {
                                out = this._data[series][index >= 0 ? index : this._time.size() + index];
                            } else {
                                out += this._data[series][index >= 0 ? index : this._time.size() + index];
                            }
                            break;
                    }
                } catch (e) {
                    this._clearAndReinitialiseData();
                    return NaN;
                }

                index++;
                myTime = this._time.getByIndex(index >= 0 ? index : this._time.size() + index);
                if (myTime === 0) break;
            }
            return out;
        } else if (myTime <= timestampMO) {
            while (myTime <= timestampMO) {
                try {
                    switch (series) {
                        case DataAggregator.S_BID_CLOSE:
                        case DataAggregator.S_OFFER_CLOSE:
                        case DataAggregator.S_CUR_CLOSE:
                            out = this._data[series][index >= 0 ? index : this._time.size() + index];
                            break;
                        case DataAggregator.S_CUR_OPEN:
                            if (isNaN(out)) {
                                out = this._data[series][index >= 0 ? index : this._time.size() + index];
                            }
                            break;
                        case DataAggregator.S_CUR_HIGH:
                            if (isNaN(out)) {
                                out = this._data[series][index >= 0 ? index : this._time.size() + index];
                            } else {
                                out = Math.max(out, this._data[series][index >= 0 ? index : this._time.size() + index]);
                            }
                            break;
                        case DataAggregator.S_CUR_LOW:
                            if (isNaN(out)) {
                                out = this._data[series][index >= 0 ? index : this._time.size() + index];
                            } else {
                                out = Math.min(out, this._data[series][index >= 0 ? index : this._time.size() + index]);
                            }
                            break;
                        case DataAggregator.S_SELL_VOLUME:
                        case DataAggregator.S_UNKNOWN_VOLUME:
                        case DataAggregator.S_TOTAL_VOLUME:
                            if (isNaN(out)) {
                                out = this._data[series][index >= 0 ? index : this._time.size() + index];
                            } else {
                                out += this._data[series][index >= 0 ? index : this._time.size() + index];
                            }
                            break;
                    }
                } catch (e) {
                    this._clearAndReinitialiseData();
                    return NaN;
                }

                index++;
                myTime = this._time.getByIndex(index >= 0 ? index : this._time.size() + index);
                if (myTime === 0) break;
            }
            return out;
        } else {
            try {
                return this._data[series][index >= 0 ? index : this._time.size() + index];    
            } catch (e) {
                this._clearAndReinitialiseData();
                return NaN;
            }

        }
    }
}
/**
 * @param {Date} d
 * @param {number} series
 * @param {number} value
 */
DataAggregator.prototype.set = function(d, series, value) {
    if (!this._time) {
        console.error("DataAggregator.prototype.getByIndex. time is undefined");
        return NaN;
    }
    var index = this._time.set(d);
    try {
        if (!this._time._has) {
            this._insertRow(index);
        }
        this._data[series][index] = value;

    } catch (e) {
        this._clearAndReinitialiseData();
        return this.set(d, series, value);
    }
    return index;
}
/**
 * @param {Date} d
 * @param {number} series
 */
DataAggregator.prototype.get = function(d, series) {
    if (!this._time) {
        console.error("DataAggregator.prototype.getByIndex. time is undefined");
        return NaN;
    }
    var index = this._time.get(d);
    if (index === -1) 
        return NaN;
    if (series >= DataAggregator.S_BUY_VOLUME && series <= DataAggregator.S_TOTAL_VOLUME) {
        return this._time._has ? this.getByIndex(series, index) : 0.0;
    }
    while (this.size() > 0 && isNaN(this.getByIndex(series, index)) && index > 0) {
        index--;
    }
    
    // If we're not on a tick then reset high/low/open values.
    // Diana: need to verify, discarding data
//    if (!this._time._has) {
//        if (series === DataAggregator.S_CUR_OPEN || series === DataAggregator.S_CUR_HIGH || series === DataAggregator.S_CUR_LOW) {
//            return this.getByIndex(DataAggregator.S_CUR_CLOSE, index);
//        }
//    }
    return this.getByIndex(series, index);
}
/**
 * @param {PriceDataEvent} priceDataEvent
 */
DataAggregator.prototype.addEvent = function(priceDataEvent) {
    var key = priceDataEvent._time.getTime();
    var v = [];
    this._eventList[key] = v;
    v.push(priceDataEvent);
}
/**
 * @param {Date} d
 */
DataAggregator.prototype.getEvents = function(d) {
    var key = d.getTime();
    if (this._eventList.hasOwnProperty(key)) {
        return this._eventList[key];
    }
    return;
}
/**
 * @param {boolean} state
 */
DataAggregator.prototype.setOutsideData = function(state) {
    this._outsideData = state;
}
/**
 * @param {DataAggregator} source
 */
DataAggregator.prototype.aggregateAllFrom = function(source) {
    var prevDate = 0;
    var d = new Date();
    for (var i = 0; i < source.size(); i++) {
        var indices = source._getIndices(source.timeByIndex(i), this);
        if (indices[0] !== prevDate) {
            d.setTime(indices[0]);
            prevDate = indices[0];
            this._aggregateSingleFrom(source, indices);
        }
    }
    this._minDataRange = this.timeByIndex(0);
    this._maxDataRange = this.timeByIndex(-1);
}
/**
 * @param {DataAggregator} source
 * @param {Date} d
 */
DataAggregator.prototype.aggregateFromBelow = function(source, d) {
    var indices = source._getIndices(d, this);
    this._aggregateSingleFrom(source, indices);
}
DataAggregator.prototype.getFrequency = function() {
    return this._frequency;
}
DataAggregator.prototype.getSymbol = function() {
    return this._symbol;
}
/**
 * @private
 * @param {Date} d
 * @param {DataAggregator} target
 */
DataAggregator.prototype._getIndices = function(d, target) {
    var initialD = this._timeList.convertTime(d, target._frequency);
    var targetIdx = Math.min(target._timeList.get(initialD), target._timeList._size - 2);
    var startIdx = this.getIndexByDate(initialD);
    if (!this._time) {
        console.error("DataAggregator.prototype.getByIndex. time is undefined");
        return;
    }
    if (!this._time._has) {
        startIdx++;
    }
    var endIdx = this.getIndexByDate(new Date(target._timeList.getByIndex(targetIdx + 1)));
    if (this._time._has) {
        endIdx--;
    }
    if (endIdx >= this.size()) {
        endIdx = this.size() - 1;
    }
    while (!this._timeList.insideMarketHours(this.timeByIndex(endIdx).getTime())) {
        endIdx--;
    }
    var res = [initialD.getTime(), startIdx, endIdx];
    return res;
}
/**
 * @private
 * @param {DataAggregator} source
 * @param {Array} indices
 */
DataAggregator.prototype._aggregateSingleFrom = function(source, indices) {
    if (!this._time) {
        console.error("DataAggregator.prototype.getByIndex. time is undefined");
        return;
    }
    var start = parseInt(indices[1], 10);
    var end = parseInt(indices[2], 10);
    // todo: fix for incorrect positions
    if (start > end) {
        start = end;
        end = parseInt(indices[1], 10);
    }
    //
    if (!this._timeList.insideMarketHours(source.timeByIndex(start).getTime())) 
        return;
    var idx = this._time.get(indices[0]);
    var newRow = !this._time._has;
    if (newRow) {
        idx = this._time.set(indices[0]);
        this._insertRow(idx);
    } else {
        this._initRow(idx);
    }
    if (start >= source.size()) {
        start = source.size() - 1;
    }
    this._data[DataAggregator.S_CUR_OPEN][idx] = source.getByIndex(DataAggregator.S_CUR_OPEN, start);
    this._data[DataAggregator.S_BID_CLOSE][idx] = source.getByIndex(DataAggregator.S_BID_CLOSE, start);
    this._data[DataAggregator.S_OFFER_CLOSE][idx] = source.getByIndex(DataAggregator.S_OFFER_CLOSE, start);
    this._data[DataAggregator.S_CUR_CLOSE][idx] = source.getByIndex(DataAggregator.S_CUR_CLOSE, start);
    var curHigh = -1.0e15;
    var curLow = -curHigh;
    var curVols = new Array(4);
    curVols.fillArrayWithValue(0);
    var i, j;
    for (i = start; i <= end; i++) {
        curHigh = Math.max(curHigh, source.getByIndex(DataAggregator.S_CUR_HIGH, i));
        curLow = Math.min(curLow, source.getByIndex(DataAggregator.S_CUR_LOW, i));
        for (j = DataAggregator.S_BUY_VOLUME; j <= DataAggregator.S_TOTAL_VOLUME; j++) {
            curVols[j - DataAggregator.S_BUY_VOLUME] += source.getByIndex(j, i);
        }
    }
    // todo: fix for incorrect values
    if (curHigh == -1.0e15 || curLow == 1.0e15)
        return;
    //
    this._data[DataAggregator.S_CUR_HIGH][idx] = curHigh;
    this._data[DataAggregator.S_CUR_LOW][idx] = curLow;
    for (j = DataAggregator.S_BUY_VOLUME; j <= DataAggregator.S_TOTAL_VOLUME; j++) {
        this._data[j][idx] = curVols[j - DataAggregator.S_BUY_VOLUME];
    }
    if (idx === 0 || idx === this.size() - 1) {
        for (i = DataAggregator.S_BID_CLOSE; i <= DataAggregator.S_TOTAL_VOLUME; i++) {
            if (idx === 0) {
                this._proxies[i].setTimeStart(new Date(indices[0]));
            }
            if (idx === this.size() - 1) {
                this._proxies[i].setTimeEnd(new Date(indices[0]));
            }
        }
    }
}
/**
 * @private
 * @param {number} index
 */
DataAggregator.prototype._initRow = function(index) {
    var i;
    if (index === 0) {
        for (i = 0; i < DataAggregator.NUM_SERIES; i++) {
            this._data[i][index] = NaN;
        }
    } else {
        for (i = DataAggregator.S_BUY_VOLUME; i <= DataAggregator.S_TOTAL_VOLUME; i++) {
            this._data[i][index] = 0.0;
        }
        var bidOpen = this.getByIndex(DataAggregator.S_BID_CLOSE, index - 1);
        this._data[DataAggregator.S_BID_CLOSE][index] = bidOpen;
        var offerOpen = this.getByIndex(DataAggregator.S_OFFER_CLOSE, index - 1);
        this._data[DataAggregator.S_OFFER_CLOSE][index] = offerOpen;
        var curOpen = this.getByIndex(DataAggregator.S_CUR_CLOSE, index - 1);
        this._data[DataAggregator.S_CUR_OPEN][index] = curOpen;
        this._data[DataAggregator.S_CUR_HIGH][index] = curOpen;
        this._data[DataAggregator.S_CUR_LOW][index] = curOpen;
        this._data[DataAggregator.S_CUR_CLOSE][index] = curOpen;
    }
}
/**
 * @private
 * @param {number} index
 */
DataAggregator.prototype._insertRow = function(index) {
    for (var i = 0; i < DataAggregator.NUM_SERIES; i++) {
        this._data[i].splice(index, 0, NaN);
    }
    this._initRow(index);
}
DataAggregator.prototype._clearAndReinitialiseData = function() {
    this.clear();
}
DataAggregator.prototype._initialise = function() {
    this._time = new TimeList();
    this._eventList = new Object();
    this._data = new Array(DataAggregator.NUM_SERIES);
    this._proxies = new Array(DataAggregator.NUM_SERIES);
    for (var i = 0; i < DataAggregator.NUM_SERIES; i++) {
        this._data[i] = new Array();
        this._proxies[i] = new ProxySeries(this, i);
    }
}
/** @static */
DataAggregator.S_BID_CLOSE = 0;
/** @static */
DataAggregator.S_OFFER_CLOSE = 1;
/** @static */
DataAggregator.S_CUR_OPEN = 2;
/** @static */
DataAggregator.S_CUR_HIGH = 3;
/** @static */
DataAggregator.S_CUR_LOW = 4;
/** @static */
DataAggregator.S_CUR_CLOSE = 5;
/** @static */
DataAggregator.S_BUY_VOLUME = 6;
/** @static */
DataAggregator.S_SELL_VOLUME = 7;
/** @static */
DataAggregator.S_UNKNOWN_VOLUME = 8;
/** @static */
DataAggregator.S_TOTAL_VOLUME = 9;
/** @static */
DataAggregator.NUM_SERIES = 10;