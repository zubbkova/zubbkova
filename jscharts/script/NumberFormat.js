/**
 * ------------
 * NumberFormat
 * ------------
 * @constructor
 */
function NumberFormat() {};
/**
 * @param {number} number
 */
NumberFormat.prototype.format = function(number) {
    return Number(number).toFixed(this._minimumFractionDigits);
}
/**
 * @param {number} newValue
 */
NumberFormat.prototype.setMinimumFractionDigits = function(newValue) {
    this._minimumFractionDigits = newValue;
}
NumberFormat.getInstance = function() {
    if (NumberFormat.i === undefined) {
        NumberFormat.i = new NumberFormat();
    }
    return NumberFormat.i;
}