/**
 * Fraction
 * @constructor
 * @param {number} n
 * @param {number} d
 */
function Fraction(n, d) {
    this.set(n, d);
}
Fraction.prototype.toString = function() {
    return this._denom === 1 ? this._num.toString() : (this._num + "/" + this._denom);
}
/**
 * @param {number} n
 * @param {number} d
 */
Fraction.prototype.set = function(n, d) {
    this._num = n;
    this._denom = d;
    this.reduce();
}
Fraction.prototype.getDecimal = function() {
    return this._num / this._denom;
}
Fraction.prototype.reduce = function() {
    if (this._num === 0) {
        this._denom = 1;
        return;
    }
    let a = Math.max(this._num, this._denom);
    let b = Math.min(this._num, this._denom);
    while (b !== 0) {
        let r = a % b;
        a = b;
        b = r;
    }
    this._num /= a;
    this._denom /= a;
}
/**
 * @param {Fraction} other
 */
Fraction.prototype.equals = function(other) {
    return this._num === other._num && this._denom === other._denom;
}