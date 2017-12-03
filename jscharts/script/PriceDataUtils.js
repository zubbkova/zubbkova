/* global PriceDataConstants */
/**
 * --------------
 * PriceDataUtils
 * --------------
 */
var PriceDataUtils = new Object();
/**
 * @param {number} f
 */
PriceDataUtils.rootFreq = function(f) {
    return f <= PriceDataConstants.FREQUENCY_60 ? PriceDataConstants.FREQUENCY_1 : PriceDataConstants.FREQUENCY_D;
}
/**
 * @param {number} f
 */
PriceDataUtils.isRootFreq = function(f) {
    return (f === PriceDataConstants.FREQUENCY_1 || f === PriceDataConstants.FREQUENCY_D)
}