/**
 * -----
 * Inset
 * -----
 * @constructor
 */
function Inset() {
    this._left = 0;
    this._top = 0;
    this._right = 0;
    this._bottom = 0;
}
/**
 * @param {number} l
 * @param {number} t
 * @param {number} r
 * @param {number} b
 */
Inset.prototype.set = function(l, t, r, b) {
    this._left = l;
    this._top = t;
    this._right = r;
    this._bottom = b;
}