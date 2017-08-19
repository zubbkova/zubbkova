/**
 * -------------
 * DecimalFormat
 * -------------
 * @constructor
 */
function DecimalFormat() {}
/**
 * @param {boolean} newValue
 */
DecimalFormat.prototype.setGroupingUsed = function(newValue) {
    this._groupingUsed = newValue;
}
/**
 * @param {number} newValue
 */
DecimalFormat.prototype.setMinimumFractionDigits = function(newValue) {
    this._minimumFractionDigits = newValue;
}
/**
 * @param {number} newValue
 */
DecimalFormat.prototype.setMaximumFractionDigits = function(newValue) {
    this._maximumFractionDigits = newValue;
}
/**
 * @param {number} newValue
 */
DecimalFormat.prototype.setMinimumIntegerDigits = function(newValue) {
    this._minimumIntegerDigits = newValue;
}
/**
 * @param {number} number
 */
DecimalFormat.prototype.format = function(number) {
    return Number(number).toFixed(this._minimumFractionDigits);
}