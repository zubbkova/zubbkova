/**
 * ---------------
 * NumberFormatter
 * ---------------
 */
var NumberFormatter = {};
/**
 * @param {number} n
 */
NumberFormatter.formatHoursOrMinutes = function(n) {
    let v = Math.trunc(n).toString();
    if (v.length == 1)
        return "0" + v;
    return v;
}