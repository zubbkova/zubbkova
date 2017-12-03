/**
 * --------------
 * PriceDataEvent
 * --------------
 * @constructor
 * @param {number} y
 * @param {Date} d
 * @param {string} l
 * @param {Color} c
 */
function PriceDataEvent(y, d, l, c) {
    this._type = y;
    this._time = d;
    this._label = l;
    this._colour = c;
}
/** @static */
PriceDataEvent.EVENT_STOCKSPLIT = 0;