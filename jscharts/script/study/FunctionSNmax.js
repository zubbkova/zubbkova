/**
 * @constructor
 * @param {SkewNormal} sn
 * @param {number} mean
 * @param {number} std
 * @param {number} skew
 */
function FunctionSNmax(sn, mean, std, skew) {
    this._sn = sn;
    this._mean = mean;
    this._std = std;
    this._skew = skew;
}
/**
 * @param {number} mean
 * @param {number} std
 * @param {number} skew
 */
FunctionSNmax.prototype.setParams = function(mean, std, skew) {
    this._mean = mean;
    this._std = std;
    this._skew = skew;
}
/**
 * @param {number} x
 */
FunctionSNmax.prototype.eval = function(x) {
    return -this._sn.sn(x + 0.01, this._mean, this._std, this._skew);
}