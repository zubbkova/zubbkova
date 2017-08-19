/**
 * ----------------
 * SimpleDateFormat
 * ----------------
 * @constructor
 * @param {string=} p
 */
function SimpleDateFormat(p) {
    this._pattern = p;
}
/**
 * @param {Date} date
 */
SimpleDateFormat.prototype.format = function(date) {
    let result = date.toString();
    if (this._pattern === "dd/MM") {
        result = date.getDate() + "/" + date.getMonth();
    } else if (this._pattern === "MM/dd") {
        result = date.getMonth() + "/" + date.getDate();
    } else if (this._pattern === "HH:mm") {
        result = date.getHours() + ":" + date.getMinutes();
    }
    return result;
}