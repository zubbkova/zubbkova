/* global Calendar */
/**
 * --------
 * Holidays
 * --------
 */
var Holidays = new Object();
/** @static */
Holidays.holidayList = new Object();
/** @static */
Holidays.holidayListWeekend = new Object();
/** @static */
Holidays.advfnUrl = 'https://rpc.advfn.com/latest/holiday/history/getData.json?';
/**
 * @param {string} market
 * @param {Calendar} ourCalendar
 */
Holidays.isMarketWeekendOrHoliday = function(market, ourCalendar) {
    var day = ourCalendar.get(Calendar.DAY_OF_MONTH);
    var month = ourCalendar.get(Calendar.MONTH);
    var year = ourCalendar.get(Calendar.YEAR);
    var date = year * 10000 + (month + 1) * 100 + day;
    var dayOfWeek = ourCalendar.get(Calendar.DAY_OF_WEEK);
    var size = Object.keys(Holidays.holidayList).length;
    if (size == 0 || !Holidays.holidayList[market]) {
        Holidays.fillHolidays(market);
    }
    var data_for_market = Holidays.holidayList[market];
    var data_for_market_weekend = Holidays.holidayListWeekend[market];
    var i;
    if (data_for_market_weekend) {
        for (i = 0; i < data_for_market_weekend.length; i++) {
            if (dayOfWeek === data_for_market_weekend[i]) {
                return true;
            }
        }
    }
    if (data_for_market && data_for_market.length === 1 && data_for_market[0] === -1) {
        return false;
    }
    if (data_for_market) {
        for (i = 0; i < data_for_market.length; i++) {
            if (date > data_for_market[i]) {
                return false;
            }
            if (date === data_for_market[i]) {
                return true;
            }
        }
    }
    return false;
}
/**
 * @param {string} market
 */
Holidays.onFillError = function(market) {
    console.log(market + " has no holiday data defaulting to Saturday and Sunday as weekend.");
    var data_for_market = [-1];
    var data_for_market_weekend = [7, 1];
    Holidays.holidayList[market] = data_for_market;
    Holidays.holidayListWeekend[market] = data_for_market_weekend;
}
/**
 * @param {string} responseData
 * @param {string} market
 */
Holidays.onFillCompleted = function(responseData, market) {
    try {
        var jsonArray = responseData;
        if (typeof responseData == 'string')
            jsonArray = JSON.parse(responseData);
        var len = jsonArray.length;
        var data_for_market_weekend = [];
        var data_for_market = [];
        if (jsonArray) {
            var number_of_weekend_days = parseInt(jsonArray[0].toString(), 10);
            var i;
            for (i = 1; i < number_of_weekend_days + 1; i++){ 
                data_for_market_weekend.push(parseInt(jsonArray[i].toString(), 10));
            } 
            for (i = number_of_weekend_days + 1; i < len; i++){ 
                data_for_market.push(parseInt(jsonArray[i].toString(), 10));
            }
        } 
        Holidays.holidayList[market] = data_for_market;
        Holidays.holidayListWeekend[market] = data_for_market_weekend;
        if (data_for_market.length === 0) {
            console.log(market, " has no holiday data");
        }
    } catch (e) {
        console.log("Holidays.", e);
        Holidays.onFillError(market);
    }
}
/**
 * @param {string} market
 */
Holidays.fillHolidays = function(market) {
    var dataUrl = Holidays.advfnUrl + encodeURIComponent("market=" + market);
    var self = this;
    $.ajax({
        type: "GET",
        url: dataUrl,
        crossdomain: true,
        async: false,
        success: function(responseData) {
            console.log("Holidays response:", responseData);
            self.onFillCompleted(responseData, market);
        },
        error: function(responseData, textStatus) {
            console.log("Holidays. Can't load from server: " + textStatus);
            self.onFillError(market);
        }
    });
}