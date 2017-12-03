/**
 * ---------
 * Dimension
 * ---------
 * @constructor
 * @param {number} w
 * @param {number} h
 */
function Dimension(w, h) {
    this._width = w;
    this._height = h;
}
Dimension.prototype.getWidth = function() {
    return this._width;
}
Dimension.prototype.getHeight = function() {
    return this._height;
}