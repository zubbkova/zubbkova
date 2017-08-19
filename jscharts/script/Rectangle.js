/**
 * ---------
 * Rectangle
 * ---------
 * @constructor
 * @param {number=} x
 * @param {number=} y
 * @param {number=} w
 * @param {number=} h
 */
function Rectangle(x, y, w, h) {
    this._x = x;
    this._y = y;
    this._width = w;
    this._height = h;
}
Rectangle.prototype.getBounds = function() {
    return new Rectangle(this._x, this._y, this._width, this._height);
}
/**
 * @param {Point} p
 */
Rectangle.prototype.contains = function(p) {
    return this.inside(p._x, p._y);
}
/**
 * @param {number} x
 * @param {number} y
 */
Rectangle.prototype.inside = function(x, y) {
    let w = this._width;
    let h = this._height;
    if ((w | h) < 0) {
        // At least one of the dimensions is negative...
        return false;
    }
    // Note: if either dimension is zero, tests below must return false...
    if (x < this._x || y < this._y) {
        return false;
    }
    w += this._x;
    h += this._y;
    //    overflow || intersect
    return ((w < this._x || w > x) &&
            (h < this._y || h > y));
}