/* exported Point */
/**
 * -----
 * Point
 * -----
 * @constructor
 * @param {number|Point=} x
 * @param {number=} y
 */
function Point(x, y) {
    if (arguments.length === 1) {
        this._x = isNaN(x._x) ? 0 : x._x;
        this._y = isNaN(x._y) ? 0 : x._y;
    } else {
        this._x = isNaN(x) ? 0 : x;
        this._y = isNaN(y) ? 0 : y;    
    }
}