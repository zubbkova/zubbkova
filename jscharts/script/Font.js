/* global Style */
/**
 * ----
 * Font
 * ----
 * @constructor
 * @param {string} ff - font family
 * @param {number} st - style
 * @param {number} sz - size
 */
function Font(ff, st, sz) {
    this._fontFamily = ff;
    this._style = st;
    this._size = sz;
}
Font.prototype.getFontFamily = function() {
    return this._fontFamily;
}
Font.prototype.getStyle = function() {
    return Style._fontStyleNames[this._style];
}
Font.prototype.getSize = function() {
    return this._size;
}