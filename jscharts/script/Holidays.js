/**
 * --------
 * Holidays
 * --------
 */
var Holidays = {};
/** @static */
Holidays.holidayList = new Map();
/** @static */
Holidays.holidayListWeekend = new Map();
/** @static */
Holidays.advfnUrl = 'http://rpc.advfn.com/latest/holiday/history/getData.json?';
/**
 * @param {string} market
 * @param {Calendar} ourCalendar
 */
Holidays.isMarketWeekendOrHoliday = function(market, ourCalendar) {
    let day = ourCalendar.get(Calendar.DAY_OF_MONTH);
    let month = ourCalendar.get(Calendar.MONTH);
    let year = ourCalendar.get(Calendar.YEAR);
    let date = year * 10000 + (month + 1) * 100 + day;
    let dayOfWeek = ourCalendar.get(Calendar.DAY_OF_WEEK);
    if (Holidays.holidayList.size === 0 || Holidays.holidayList.get(market) === undefined) {
        Holidays.fillHolidays(market);
    }
    let data_for_market = Holidays.holidayList.get(market);
    let data_for_market_weekend = Holidays.holidayListWeekend.get(market);
    for (let item of data_for_market_weekend) {
        if (dayOfWeek === item) {
            return true;
        }
    }
    if (data_for_market.size === 1 && data_for_market.values().next().value === -1) {
        return false;
    }
    for (let item of data_for_market) {
        if (date > item) {
            return false;
        }
        if (date === item) {
            return true;
        }
    }
    return false;
}
/**
 * @param {string} market
 */
Holidays.onFillError = function(market) {
    console.log(market + " has no holiday data defaulting to Saturday and Sunday as weekend.");
    let data_for_market = [-1];
    let data_for_market_weekend = [7, 1];
    Holidays.holidayList.set(market, data_for_market);
    Holidays.holidayListWeekend.set(market, data_for_market_weekend);
}
/**
 * @param {string} responseData
 * @param {string} market
 */
Holidays.onFillCompleted = function(responseData, market) {
    try {
        let jsonArray = JSON.parse(responseData);
        let len = jsonArray.length;
        let data_for_market_weekend = [];
        let data_for_market = [];
        if (jsonArray) {
            let number_of_weekend_days = parseInt(jsonArray[0].toString(), 10);
            for (let i = 1; i < number_of_weekend_days + 1; i++){ 
                data_for_market_weekend.push(parseInt(jsonArray[i].toString(), 10));
            } 
            for (let i = number_of_weekend_days + 1; i < len; i++){ 
                data_for_market.push(parseInt(jsonArray[i].toString(), 10));
            }
        } 
        Holidays.holidayList.set(market, data_for_market);
        Holidays.holidayListWeekend.set(market, data_for_market_weekend);
        if (data_for_market.length === 0) {
            console.log(market, " has no holiday data");
        }
    } catch (e) {
        console.log("Holidays. ", e);
        Holidays.onFillError(market);
    }
}
/**
 * @param {string} market
 */
Holidays.fillHolidays = function(market) {
    let dataUrl = Holidays.advfnUrl + encodeURIComponent("market=" + market);
    let self = this;
    $.ajax({
        type: "GET",
        url: dataUrl,
        crossdomain: true,
        async: false,
        success: function(responseData, textStatus, jqXHR) {
            console.log("Holidays response:", responseData);
            self.onFillCompleted(responseData, market);
        },
        error: function(responseData, textStatus, errorThrown) {
            // todo: debug
//            responseData = "[2,7,1]";
//            self.onFillCompleted(responseData, market);
            //
            console.log("Holidays. Can't load from server: " + textStatus);
            self.onFillError(market);
        }
    });
}