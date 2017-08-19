/**
 * --------------
 * ForexBehaviour
 * --------------
 * @constructor
 */
function ForexBehaviour() {};
/** @static */
ForexBehaviour.MARKET_SUNDAY_OPEN_TIME = 18;
/** @static */
ForexBehaviour.MARKET_FRIDAY_CLOSE_TIME = 22;
/**
 * @param {number} timeInMills
 * @param {boolean} inHoliday
 * @param {number} marketCloseTime
 */
ForexBehaviour.prototype.isMarketClosed = function(timeInMills, inHoliday, marketCloseTime) {
    let localDateTime = Calendar.convertDateToUTC(new Date(timeInMills));
    let dow = localDateTime.getDay() + 1;
    let h = localDateTime.getHours();
    if (dow === Calendar.SUNDAY) {
        let m = localDateTime.getMinutes();
        if (h === 0 && m < 1) {
            return false;
        }
        return h <= ForexBehaviour.MARKET_SUNDAY_OPEN_TIME;
    } else if (dow === Calendar.FRIDAY) {
        return h >= ForexBehaviour.MARKET_FRIDAY_CLOSE_TIME;
    }
    return dow === Calendar.SATURDAY;
}