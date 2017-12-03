/* global TimeList, PriceDataConstants, Calendar, Exchanges, Holidays */
/**
 * --------------
 * MasterTimeList
 * --------------
 * @constructor
 * @extends {TimeList}
 */
function MasterTimeList() {
    TimeList.call(this);
    this._frequency = -1;
    this._dayTemplate = [];
    this._marketOpen = 0;
    this._marketClose = 0;
    // contains minutes of day with true/false indicator of work time
    this._dayTemplate = new Array(24 * 60);
}
/**
 * Inheriting
 */
MasterTimeList.prototype = Object.create(TimeList.prototype);
MasterTimeList.prototype.constructor = MasterTimeList;
/** @static */
MasterTimeList.DATE_AVAILABLE = 0;
/** @static */
MasterTimeList.DATE_NOTAVAILABLE = 1;
/**
 * Set the market code, open and close. Done here so that functions that
 * rely on these values can work before the time list is initialised.
 * @param {string} m - Market code for time list.
 * @param {number} mo - Market open in minutes from midnight.
 * @param {number} mc - Market close in minutes from midnight.
 */
MasterTimeList.prototype.setMarketDetails = function(m, mo, mc) {
    this._market = m;
    this._marketOpen = mo;
    this._marketClose = mc;
    if (this._marketOpen < this._marketClose) {
        this._dayTemplate.fillArrayWithValue(false, 0, this._marketOpen);
        this._dayTemplate.fillArrayWithValue(true, this._marketOpen, this._marketClose);
        this._dayTemplate.fillArrayWithValue(false, this._marketClose);
    } else {
        this._dayTemplate.fillArrayWithValue(true, 0, this._marketClose);
        this._dayTemplate.fillArrayWithValue(false, this._marketClose, this._marketOpen);
        this._dayTemplate.fillArrayWithValue(true, this._marketOpen);
    }
}
/**
 * Initialises the time list from a given start time.
 * @param {number} f - Frequency of the internal time.
 * @param {number|Date} dd - Initial date point.
 * @param {number} bk - Number of steps to generate backwards.
 * @param {number} fwd - Number of steps to generate forwards.
 */
MasterTimeList.prototype.initialise = function(f, dd, bk, fwd) {
    var d = dd;
    if (typeof dd === "object") {
        d = dd.getTime();
    }
    this._frequency = f;
    this.clear();
    this._data = new Array(551);
    //Fix montly candle, if and only if the last month was in DST
    if (this._frequency === PriceDataConstants.FREQUENCY_M) {
        var marketCal = new Calendar(Exchanges.getTimeZone(this._market));
        marketCal.setTime(d);
        marketCal.set(Calendar.MONTH, marketCal.get(Calendar.MONTH) - 1);
        if (marketCal.inDaylightTime()) {
            marketCal.setTime(d);
            marketCal.set(Calendar.MONTH, marketCal.get(Calendar.MONTH) + 1);
            this._data[0] = marketCal.getTimeInMillis();
            this._size = 1;
        } else {
            this._data[0] = d;
        }
    } else {
        this._data[0] = d;
    }
    this._size = 1;
    if (bk > 0) {
        this.generateBack(bk);
    }
    if (fwd > 0) {
        this.generateForward(fwd);
    }
}
/**
 * Generate n new entries at the head of the list.
 * @param {number} n
 */
MasterTimeList.prototype.generateBack = function(n) {
    var d = this._data[0];
    if (this._size + n >= this._data.length) {
        // 1 2 3 4 5
        // size = 3
        // n = 2
        // - - 1 2 3 - -
        // todo: check
        if (this._size === this._data.length) {
            this._data = new Array(n).concat(this._data);
        } else {
            this._data = new Array(n).concat(this._data.slice(0, this._size), new Array(this._data.length - this._size));
        }
    } else {
        // 1 2 3 4 5
        // size = 1
        // n = 2
        // 1 2 1 4 5
        // todo: check
        this._data.copyWithin(n, 0, this._size);
    }
    var doneLoop = false;
    var tempDate = this._getDate();
    var ourCalendar = this._getMarketCalendar();
    tempDate.setTime(this._frequency >= PriceDataConstants.FREQUENCY_D ? (d / PriceDataConstants.ONE_DAY * PriceDataConstants.ONE_DAY) : d);
    ourCalendar.setTime(tempDate);
    var prevOffset = ourCalendar.get(Calendar.ZONE_OFFSET);
    var curOffset = 0;
    var diff = 0;
    for (var index = n - 1; index >= 0; index--) {
        d = this._dec(d);
        do {
            doneLoop = true;
            if (this.isWeekendOrHoliday(d)) {
                doneLoop = false;
                do {
                    d = this._dec(d);
                } while (this.isWeekendOrHoliday(d));
            }
            // For periods of less than a day we need to take into consideration
            // the gap between market close and market open.
            if (this._frequency <= PriceDataConstants.FREQUENCY_60) {
                // If we've gone past market open, move to market close of previous day.
                if (!this.insideMarketHours(d)) {
                    doneLoop = false;
                    do {
                        d = this._dec(d);
                    } while (!this.insideMarketHours(d));
                }
            }
        } while(!doneLoop);
        // Adjust for SummerTime if day of more.
        if (this._frequency >= PriceDataConstants.FREQUENCY_D) {
            tempDate.setTime(d);
            ourCalendar.setTime(tempDate);
            
            curOffset = ourCalendar.get(Calendar.ZONE_OFFSET);
            diff = prevOffset - curOffset;
            d += diff;
            prevOffset = curOffset;
            this._data[index] = d;
        } else {
            this._data[index] = d;
        }
    }
    this._size += n;
}
/**
 * Generate n new entries at the tail of the list.
 * @param {number} n
 */
MasterTimeList.prototype.generateForward = function(n) {
    var d = this._data[this._size - 1];
    if (this._size + n > this._data.length) {
        // 1 2 3 4 5
        // size = 3
        // n = 2
        // - - 1 2 3 - -
        // todo: check
        var newLength = this._data.length + parseInt(n, 10);
        var a2 = this._data.slice(0, this._size);
        var diff = newLength - a2.length;
        var a1 = new Array(diff);
        a1.fillArrayWithValue(0);
        this._data = a2.concat(a1);
    }
    var doneLoop = false;
    var index = this._size;
    var d1 = d;
    var tempDate = this._getDate();
    var ourCalendar = this._getMarketCalendar();
    for (var i = 0; i < n; i++) {
        d = this._inc(d);
        do {
            doneLoop = true;
            if (this.isWeekendOrHoliday(d)) {
                doneLoop = false;
                do {
                    d = this._inc(d);
                } while (this.isWeekendOrHoliday(d));
            }
            if (this._frequency <= PriceDataConstants.FREQUENCY_60) {
                if (!this.insideMarketHours(d)) {
                    doneLoop = false;
                    do {
                        d = this._inc(d);
                    } while (!this.insideMarketHours(d));
                }
            }
        } while (!doneLoop);
        if (this._frequency >= PriceDataConstants.FREQUENCY_D) {
            tempDate.setTime(d1);
            ourCalendar.setTime(tempDate);
            var prevDST = ourCalendar.inDaylightTime();
            tempDate.setTime(d);
            ourCalendar.setTime(tempDate);
            var curDST = ourCalendar.inDaylightTime();
            if (prevDST !== curDST) {
                d += curDST ? 60*60*1000 : -60*60*1000;
            }
        }
        this._data[index++] = d;
        d1 = d;
    }
    this._size += n;
}
/**
 * @param {Date} d
 */
MasterTimeList.prototype.generateBackTo = function(d) {
    var target = d.getTime();
    while (this._data[0] > target) {
        this.generateBack(20);
    }
}
/**
 * @param {Date} d
 */
MasterTimeList.prototype.generateForwardTo = function(d) {
    var target = d.getTime();
    while (this._data[this._size - 1] < target) {
        this.generateForward(20);
    }
}
/**
 * @param {number} fIn
 * @param {number} fOut
 */
MasterTimeList.prototype.convertTimestamp = function(fIn, fOut) {
    var mins = fIn / 60;
    if (fOut <= PriceDataConstants.FREQUENCY_60) {
        mins = (mins / PriceDataConstants.minutes[fOut]) * PriceDataConstants.minutes[fOut];
        if (fOut === PriceDataConstants.FREQUENCY_60) {
            if ((this._marketOpen / 60) * 60 !== this._marketOpen) {
                mins += 30;
            }
        }
        return new Date(mins * 60000);
    }
    return this._toHistoricalTime(fOut);
}
/**
 * @param {number} d - milliseconds
 */
MasterTimeList.prototype.isWeekendOrHoliday = function(d) {
    if (!this._market)
        return false;
    if (this._frequency >= PriceDataConstants.FREQUENCY_W) 
        return false;
    var tempDate = this._getDate();
    tempDate.setTime(d);
    var ourCalendar = this._getMarketCalendar();
    ourCalendar.setTime(tempDate);
    var b = Holidays.isMarketWeekendOrHoliday(this._market, ourCalendar);
    if (TimeList.MARKET_SPECIAL_BEHAVIOUR[this._market]) {
        var marketClose = this._frequency < PriceDataConstants.FREQUENCY_D ? this._adjustedMarketClose(d) / 60  : 24;
        b = TimeList.MARKET_SPECIAL_BEHAVIOUR[this._market].isMarketClosed(d, b, marketClose);
    }
    return b;
}
/**
 * @param {number} d - milliseconds
 */
MasterTimeList.prototype.insideMarketHours = function(d) {
    if (this._frequency >= PriceDataConstants.FREQUENCY_D) 
        return true;
    return this._dayTemplate[this._getDayMinutes(d)];
}
/**
 * @param {Date} d
 */
MasterTimeList.prototype.moveBackIntoMarketHours = function(d) {
    var t = d.getTime();
    var tempDate = new Date(t);
    var myCal = this._getUtcCalendar();
    myCal.setTime(d);
    var atEndOfDay = false;
    if (!this.insideMarketHours(t)) {
        var dS = this._adjustedMarketOpen(t);
        var dE = this._adjustedMarketClose(t);
        if (dS < 0) {
            dS = 24 * 60 - dS;
        }
        var within = this._minutesWithinDay(d);
        if (dS < dE) {
            if (within < dS) {
                myCal.add(Calendar.DATE, -1);
                myCal.set(Calendar.HOUR_OF_DAY, dE / 60);
                myCal.set(Calendar.MINUTE, dE % 60);
            } else if (within >= dE) {
                myCal.set(Calendar.HOUR_OF_DAY, dE / 60);
                myCal.set(Calendar.MINUTE, dE % 60);
            }
        } else if (within >= dE && within < dS) {
            myCal.set(Calendar.HOUR_OF_DAY, dE / 60);
            myCal.set(Calendar.MINUTE, dE % 60);
        }
        if (this._frequency === PriceDataConstants.FREQUENCY_60) {
            var mwd = myCal.get(Calendar.HOUR_OF_DAY) * 60 + myCal.get(Calendar.MINUTE) - this._marketOpen;
            if (mwd / 60 * 60 !== mwd) {
                myCal.add(Calendar.MINUTE, -myCal.get(Calendar.MINUTE));
            }
            tempDate = new Date(myCal.getTime().getTime());
        } else {
            myCal.set(Calendar.HOUR_OF_DAY, dE / 60);
            myCal.set(Calendar.MINUTE, dE % 60);
            var endLong = this._dec(myCal.getTime().getTime());
            myCal.set(Calendar.HOUR_OF_DAY, dS / 60);
            myCal.set(Calendar.MINUTE, dS % 60);
            var tempLong = myCal.getTime().getTime();
            var check = 0;
            while (tempLong <= endLong && check++ < 1440) {
                tempLong = this._inc(tempLong);
            }
            if (check >= 1440) 
                return undefined;
            tempDate = new Date(this._dec(tempLong));
        }
        atEndOfDay = true;
    }
    if (this.isWeekendOrHoliday(tempDate.getTime())) {
        if (!atEndOfDay) {
            if (this._frequency >= PriceDataConstants.FREQUENCY_D) {
                myCal.setTime(this.setToMarketOpen(tempDate));
            } else {
                myCal.setTime(this.setToMarketClose(tempDate));
            }
        } else {
            myCal.setTime(tempDate);
        }
        var ourCalendar = this._getMarketCalendar();
        ourCalendar.setTime(tempDate);
        var prevDST = ourCalendar.inDaylightTime();
        var curDST;
        do {
            myCal.add(Calendar.DATE, -1);
            tempDate = myCal.getTime();
            ourCalendar.setTime(tempDate);
            curDST = ourCalendar.inDaylightTime();
            if (prevDST !== curDST) {
                tempDate.setTime(tempDate.getTime() + (curDST ? 60*60*1000 : -60*60*1000));
                myCal.setTime(tempDate);
                prevDST = curDST;
            }
        } while (this.isWeekendOrHoliday(tempDate.getTime()));
    }
    return new Date(tempDate.getTime());
}
/**
 * @param {Date} d
 */
MasterTimeList.prototype.moveBackToStartOfDay = function(d) {
    var tempDate = this._getDate();
    tempDate.setTime(d.getTime());
    var dS = this._adjustedMarketOpen(d.getTime());
    var dE = this._adjustedMarketClose(d.getTime());
    var myCal = this._getUtcCalendar();
    if (dS < 0) {
        dS = 24 * 60 + dS;
    }
    if (dS > dE) {
        if (this._minutesWithinDay(d) > dS) {
            tempDate.setTime(tempDate.getTime() + PriceDataConstants.ONE_DAY);
        } else {
            // todo: fix for ignoring draw x axis vertical lines
            tempDate.setTime(tempDate.getTime() - PriceDataConstants.ONE_DAY);
        }
    } else {
        if (this._minutesWithinDay(d) < dS) {
            tempDate.setTime(tempDate.getTime() - PriceDataConstants.ONE_DAY);
        }
    }
    myCal.setTime(tempDate);
    myCal.set(Calendar.HOUR_OF_DAY, dS / 60);
    myCal.set(Calendar.MINUTE, dS % 60);
    myCal.set(Calendar.SECOND, 0);
    myCal.set(Calendar.MILLISECOND, 0);
    return myCal.getTime();
}
/**
 * @param {Date} d
 */
MasterTimeList.prototype.moveForwardToEndOfDay = function(d) {
    var tempDate = this._getDate();
    tempDate.setTime(d.getTime());
    var dE = this._adjustedMarketClose(d.getTime());
    if (this._minutesWithinDay(d) >= dE) {
        tempDate.setTime(tempDate.getTime() + PriceDataConstants.ONE_DAY);
    }
    var myCal = this._getUtcCalendar();
    myCal.setTime(tempDate);
    myCal.set(Calendar.HOUR_OF_DAY, dE / 60);
    myCal.set(Calendar.MINUTE, dE % 60);
    if (this._frequency === PriceDataConstants.FREQUENCY_60) {
        if (myCal.get(Calendar.MINUTE) === 30) {
            myCal.add(Calendar.MINUTE, 30);
        }
    }
    return new Date(this._dec(myCal.getTime().getTime()));
}
/**
 * @param {Date} d
 */
MasterTimeList.prototype.moveToMarketOpenOfNextDay = function(d) {
    var myDate = new Date();
    myDate.setTime(d.getTime() + PriceDataConstants.ONE_DAY);
    while (this.isWeekendOrHoliday(myDate.getTime())) {
        myDate.setTime(myDate.getTime() + PriceDataConstants.ONE_DAY);
    }
    return this.setToMarketOpen(myDate);
}
/**
 * @param {Date} d
 */
MasterTimeList.prototype.setToMarketOpen = function(d) {
    if (!d) return;
    var dS = this._adjustedMarketOpen(d.getTime());
    var myCal = this._getUtcCalendar();
    myCal.setTime(d);
    if (dS < 0) {
        dS = 24 * 60 + dS;
        // roll one day back
        myCal.add(Calendar.DAY_OF_MONTH, -1);
    }
    myCal.set(Calendar.HOUR_OF_DAY, dS / 60);
    myCal.set(Calendar.MINUTE, dS % 60);
    myCal.set(Calendar.SECOND, 0);
    myCal.set(Calendar.MILLISECOND, 0);
    return myCal.getTime();
}
/**
 * @param {Date} d
 */
MasterTimeList.prototype.setToMarketClose = function(d) {
    var dE = this._adjustedMarketClose(d.getTime());
    var myCal = this._getUtcCalendar();
    myCal.setTime(d);
    myCal.set(Calendar.HOUR_OF_DAY, dE / 60);
    myCal.set(Calendar.MINUTE, dE % 60);
    myCal.set(Calendar.SECOND, 0);
    myCal.set(Calendar.MILLISECOND, 0);
    if (this._frequency === PriceDataConstants.FREQUENCY_60) {
        if (myCal.get(Calendar.MINUTE) === 30) {
            myCal.add(Calendar.MINUTE, 30);
        }
    }
    return new Date(this._dec(myCal.getTime().getTime()));
}
/**
 * @param {Date} d
 */
MasterTimeList.prototype.getFirstDayOfYear = function(d) {
    var myCal = this._getUtcCalendar();
    myCal.setTime(d);
    myCal.set(Calendar.MONTH, Calendar.JANUARY);
    myCal.set(Calendar.DAY_OF_MONTH, 1);
    myCal.set(Calendar.HOUR_OF_DAY, 23);
    myCal.set(Calendar.MINUTE, 59);
    myCal.set(Calendar.SECOND, 0);
    myCal.set(Calendar.MILLISECOND, 0);
    while (this.isWeekendOrHoliday(myCal.getTime().getTime())) {
        myCal.add(Calendar.DAY_OF_MONTH, 1);
    }
    return myCal.getTime();
}
/**
 * Converts a valid into its equivalent in a given frequency. Doesn't
 * require initialisation but does require market hours set.
 * @param {Date} d
 * @param {number} targetFreq
 */
MasterTimeList.prototype.convertTime = function(d, targetFreq) {
    var myCal = this._getUtcCalendar();
    myCal.setTime(d);
    myCal.set(Calendar.SECOND, 0);
    myCal.set(Calendar.MILLISECOND, 0);
    if (targetFreq <= PriceDataConstants.FREQUENCY_60) {
        var adjustedMins = (myCal.get(Calendar.MINUTE) / PriceDataConstants.minutes[targetFreq]) * PriceDataConstants.minutes[targetFreq];
        myCal.set(Calendar.MINUTE, adjustedMins);
        if (this.isWeekendOrHoliday(myCal.getTime().getTime())) {
            while (this.isWeekendOrHoliday(myCal.getTime().getTime())) {
                myCal.add(Calendar.DAY_OF_MONTH, -1);
            }
            return this.moveForwardToEndOfDay(myCal.getTime());
        }
        return myCal.getTime();
    } else if (targetFreq === PriceDataConstants.FREQUENCY_D) {
        return this.moveBackToStartOfDay(d);
    }
    myCal.set(Calendar.HOUR_OF_DAY, 23);
    myCal.set(Calendar.MINUTE, 59);
    if (targetFreq === PriceDataConstants.FREQUENCY_W) {
        while (myCal.get(Calendar.DAY_OF_WEEK) !== Calendar.MONDAY) {
            // roll 1 day back
            myCal.add(Calendar.MILLISECOND, - PriceDataConstants.ONE_DAY);
        }
    } else if (targetFreq === PriceDataConstants.FREQUENCY_M) {
        myCal.set(Calendar.DAY_OF_MONTH, 1);
    } else if (targetFreq === PriceDataConstants.FREQUENCY_Q) {
        var month = (myCal.get(Calendar.MONTH) / 3) * 3;
        myCal.set(Calendar.MONTH, month);
        myCal.set(Calendar.DAY_OF_MONTH, 1);
    } else {
        myCal.set(Calendar.MONTH, Calendar.JANUARY);
        myCal.set(Calendar.DAY_OF_MONTH, 1);
    }
    return this.setToMarketOpen(myCal.getTime());
}
/**
 * @param {number|Date} dd
 * @param {number} delta
 */
MasterTimeList.prototype.add = function(dd, delta) {
    var d = dd;
    if (typeof dd === "object") {
        d = dd.getTime();
    }
    var newIndex = this.get(d) + delta;
    if (newIndex < 0) {
        this.generateBack(-newIndex);
        return this._data[0];
    }
    if (newIndex >= this._size) {
        this.generateForward(newIndex - this._size + 1);
        return this._data[this._size - 1];
    }
    return this.getByIndex(newIndex);
}
/** @private */
MasterTimeList.prototype._getUtcCalendar = function() {
    return Calendar.getInstance("UTC");
}
/** @private */
MasterTimeList.prototype._getMarketCalendar = function() {
    return Calendar.getInstance(Exchanges.getTimeZone(this._market));
}
/**
 * @private
 * @returns {Date}
 */
MasterTimeList.prototype._getDate = function() {
    return new Date(MasterTimeList.DATE_NOTAVAILABLE);
}
/**
 * @private
 * @param {number} d - milliseconds
 */
MasterTimeList.prototype._dec = function(d) {
    if (this._frequency <= PriceDataConstants.FREQUENCY_60) {
        var n = d - PriceDataConstants.millis[this._frequency];
        return n;
    }
    var tempDate = this._getDate();
    tempDate.setTime(d);
    var myCal = this._getUtcCalendar();
    myCal.setTime(tempDate);
    switch (this._frequency) {
        case PriceDataConstants.FREQUENCY_D:
            myCal.add(Calendar.DAY_OF_MONTH, -1);
        break;
        case PriceDataConstants.FREQUENCY_W:
            myCal.add(Calendar.DAY_OF_MONTH, -7);
        break;
        case PriceDataConstants.FREQUENCY_M:
            myCal.add(Calendar.MONTH, -1);
        break;
        case PriceDataConstants.FREQUENCY_Q:
            myCal.add(Calendar.MONTH, -3);
        break;
        case PriceDataConstants.FREQUENCY_Y:
            myCal.add(Calendar.YEAR, -1);
        break;
    }
    var q = myCal.getTime().getTime();
    return q;
}
/**
 * @private
 * @param {number} d - milliseconds
 */
MasterTimeList.prototype._inc = function(d) {
    if (this._frequency <= PriceDataConstants.FREQUENCY_60) {
        return d + PriceDataConstants.millis[this._frequency];
    }
    var tempDate = this._getDate();
    tempDate.setTime(d);
    var myCal = this._getUtcCalendar();
    myCal.setTime(tempDate);
    switch (this._frequency) {
        case PriceDataConstants.FREQUENCY_D:
            myCal.add(Calendar.DAY_OF_MONTH, 1);
        break;
        case PriceDataConstants.FREQUENCY_W:
            myCal.add(Calendar.DAY_OF_MONTH, 7);
        break;
        case PriceDataConstants.FREQUENCY_M:
            myCal.add(Calendar.MONTH, 1);
        break;
        case PriceDataConstants.FREQUENCY_Q:
            myCal.add(Calendar.MONTH, 3);
        break;
        case PriceDataConstants.FREQUENCY_Y:
            myCal.add(Calendar.YEAR, 1);
        break;
    }
    var q = myCal.getTime().getTime();
    return q;
}
/**
 * @private
 * @param {number} d - milliseconds
 */
MasterTimeList.prototype._beforeMarketHours = function(d) {
    var within = this._getDayMinutes(d);
    if (this._marketOpen < this._marketClose) 
        return within < this._marketOpen;
    return within >= this._marketClose && within < this._marketOpen;
}
/**
 * @private
 * @param {number} d - milliseconds
 */
MasterTimeList.prototype._getDayMinutes = function(d) {
    var tempDate = this._getDate();
    tempDate.setTime(d);
    var ourCalendar = this._getMarketCalendar();
    ourCalendar.setTime(tempDate);
    var within = ourCalendar.get(Calendar.HOUR_OF_DAY) * 60 + ourCalendar.get(Calendar.MINUTE);
    return within;
}
/**
 * @private
 * @param {Date} d
 */
MasterTimeList.prototype._minutesWithinDay = function(d) {
    var myCal = this._getUtcCalendar();
    myCal.setTime(d);
    var i = myCal.get(Calendar.HOUR_OF_DAY) * 60 + myCal.get(Calendar.MINUTE);
    return i;
}
/**
 * @private
 * @param {number} d - milliseconds
 */
MasterTimeList.prototype._adjustedMarketClose = function(d) {
    var tempDate = this._getDate();
    tempDate.setTime(d);
    var ourCalendar = this._getMarketCalendar();
    ourCalendar.setTime(tempDate);
    // Calculate offset from UTC time in minutes.
    var offset = -ourCalendar.get(Calendar.ZONE_OFFSET);
    return this._marketClose + offset;
}
/**
 * Calculates market open in minutes from midnight taking into account local
 * daylight savings.
 * @private
 * @param {number} d - milliseconds
 */
MasterTimeList.prototype._adjustedMarketOpen = function(d) {
    var tempDate = this._getDate();
    tempDate.setTime(d);
    var ourCalendar = this._getMarketCalendar();
    ourCalendar.setTime(tempDate);
    // Calculate offset from UTC time in minutes.
    var offset = -ourCalendar.get(Calendar.ZONE_OFFSET);
    return this._marketOpen + offset;
}
/**
 * @private
 * @param {number} fOut
 */
MasterTimeList.prototype._toHistoricalTime = function(fOut) {
    var myCal = this._getUtcCalendar();
    myCal.setTime(new Date());
    if (this._beforeMarketHours(myCal.getTime().getTime())) {
        myCal.add(Calendar.DATE, -1);
    }
    if (fOut === PriceDataConstants.FREQUENCY_W) {
        while (myCal.get(Calendar.DAY_OF_WEEK) !== Calendar.MONDAY) {
            myCal.add(Calendar.DATE, -1);
        }
    } else if (fOut === PriceDataConstants.FREQUENCY_M) {
        myCal.set(Calendar.DAY_OF_MONTH, 1);
    } else if (fOut === PriceDataConstants.FREQUENCY_Q) {
        var month = myCal.get(Calendar.MONTH);
        myCal.set(Calendar.MONTH, 3 * (month / 3));
        myCal.set(Calendar.DAY_OF_MONTH, 1);
    } else if (fOut === PriceDataConstants.FREQUENCY_Y) {
        myCal.add(Calendar.YEAR, 1);
        myCal.set(Calendar.MONTH, Calendar.JANUARY);
        myCal.set(Calendar.DAY_OF_MONTH, 1);
    }
    var dS = this._adjustedMarketOpen(myCal.getTime().getTime());
    var tempDate = this._getDate();
    tempDate.setTime(myCal.getTime().getTime());
    var ourCalendar = this._getMarketCalendar();
    ourCalendar.setTime(tempDate);
//    myCal.add(Calendar.MILLISECOND, ourCalendar.get(Calendar.DST_OFFSET));
    myCal.set(Calendar.HOUR_OF_DAY, dS / 60);
    myCal.set(Calendar.MINUTE, dS % 60);
    myCal.set(Calendar.SECOND, 0);
    myCal.set(Calendar.MILLISECOND, 0);
    return myCal.getTime();
}