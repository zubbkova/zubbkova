/* global Calendar */
/**
 * --------------
 * ForexBehaviour
 * --------------
 * @constructor
 */
function ForexBehaviour() {}
/** @static */
ForexBehaviour.MARKET_SUNDAY_OPEN_TIME = 18;
/** @static */
ForexBehaviour.MARKET_FRIDAY_CLOSE_TIME = 22;
/**
 * @param {number} timeInMills
 */
ForexBehaviour.prototype.isMarketClosed = function(timeInMills) {
    var localDateTime = Calendar.convertDateToUTC(new Date(timeInMills));
    var dow = localDateTime.getDay() + 1;
    var h = localDateTime.getHours();
    if (dow === Calendar.SUNDAY) {
        var m = localDateTime.getMinutes();
        if (h === 0 && m < 1) {
            return false;
        }
        return h <= ForexBehaviour.MARKET_SUNDAY_OPEN_TIME;
    } else if (dow === Calendar.FRIDAY) {
        return h >= ForexBehaviour.MARKET_FRIDAY_CLOSE_TIME;
    }
    return dow === Calendar.SATURDAY;
}