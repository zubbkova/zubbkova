/**
 * @constructor
 * @param {SkewNormal} sn
 * @param {number} mean
 * @param {number} std
 * @param {number} skew
 * @param {number} percentile
 * @param {number} scalemax
 */
function FunctionSN(sn, mean, std, skew, percentile, scalemax) {
    this._sn = sn;
    this._mean = mean;
    this._std = std;
    this._skew = skew;
    this._percentile = percentile;
    this._scalemax = scalemax;
}
/**
 * @param {number} mean
 * @param {number} std
 * @param {number} skew
 * @param {number} percentile
 * @param {number} scalemax
 */
FunctionSN.prototype.setParams = function(mean, std, skew, percentile, scalemax) {
    this._mean = mean;
    this._std = std;
    this._skew = skew;
    this._percentile = percentile;
    this._scalemax = scalemax;
}
/**
 * @param {number} x
 */
FunctionSN.prototype.eval = function(x) {
    return this._sn.sn(x, this._mean, this._std, this._skew) / this._scalemax - this._percentile;
}