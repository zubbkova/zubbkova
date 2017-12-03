/* global Calendar */
/**
 * --------------------
 * CommoditiesBehaviour
 * --------------------
 * @constructor
 */
function CommoditiesBehaviour() {}
/**
 * @param {number} timeInMills
 * @param {boolean} inHoliday
 * @param {number} marketHourClose
 */
CommoditiesBehaviour.prototype.isMarketClosed = function(timeInMills, inHoliday, marketHourClose) {
    var localDateTime = Calendar.convertDateToUTC(new Date(timeInMills));
    var dow = localDateTime.getDay() + 1;
    if (dow === Calendar.SATURDAY || dow === Calendar.SUNDAY) {
        return true;
    }
    if (dow === Calendar.FRIDAY) {
        return localDateTime.getHours() > marketHourClose;
    }
    return inHoliday;
}