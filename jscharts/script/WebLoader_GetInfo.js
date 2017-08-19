/**
 * -----------------
 * WebLoader_GetInfo
 * -----------------
 * @constructor
 * @param {string} s - symbol
 * @param {number} fr - frequency
 * @param {number} f - from
 * @param {number} t - to
 * @param {boolean} d - direction
 */
function WebLoader_GetInfo(s, fr, f, t, d) {
    this._symbol = s;
    this._frequency = fr;
    this._from = f;
    if (this._from.toString().length === 13)
        this._from = Math.trunc(this._from / 1000);
    this._to = t;
    if (this._to.toString().length === 13)
        this._to = Math.trunc(this._to / 1000);
    this._direction = d;
}