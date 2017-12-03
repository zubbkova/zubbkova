/**
 * ---------------
 * NumberFormatter
 * ---------------
 */
var NumberFormatter = new Object();
/**
 * @param {number} n
 */
NumberFormatter.formatHoursOrMinutes = function(n) {
    var v = parseInt(n, 10).toString();
    if (v.length == 1)
        return "0" + v;
    return v;
}