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
    var result = parseFloat(Number(number).toFixed(this._minimumFractionDigits));
    var temp = result.toString();
    if (temp == '0') {
        // more digits
        result = parseFloat(Number(number).toFixed(6)).toString();
        return result;
    }
    if (Number(result).toFixed() != 0 && result % 1000000000000 === 0) {
        return (result/1000000000000).toFixed() + 'T';
    }
    if (Number(result).toFixed() != 0 && result % 1000000000 === 0) {
        return (result/1000000000).toFixed() + 'B';
    }
    if (Number(result).toFixed() != 0 && result % 1000000 === 0) {
        return (result/1000000).toFixed() + 'M';
    }
    if (Number(result).toFixed() != 0 && result % 1000 === 0) {
        return (result/1000).toFixed() + 'K';
    }
    return result.toString();
}