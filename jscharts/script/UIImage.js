/**
 * -------
 * UIImage
 * -------
 * @constructor
 * @extends {Component}
 * @param {string} url - URL of the image
 * @param {string} id - id of component
 * @param {Component=} delegate
 * @param {string=} tooltip
 */
function UIImage(url, id, delegate, tooltip) {
    Component.call(this, id, delegate, tooltip);
    var self = this;
    this._image = new Image();
    this._image.setAttribute("src", url);
    this._image.onload = function() { self._handleLoad(); }
    this._image.ondragstart = function() { return false; }
    this._drawImage = true;

}
/**
 * Inheriting
 */
UIImage.prototype = Object.create(Component.prototype);
UIImage.prototype.constructor = UIImage;
/**
 * @param {string} url
 */
UIImage.prototype.setImageURL = function(url) {
    this._image.setAttribute("src", url);
    this._drawImage = true;
}
/** @override */
UIImage.prototype.create = function() {
    Component.prototype.create.call(this);
    this._drawImage = true;
}
/** @override */
UIImage.prototype.draw = function(force) {
    Component.prototype.draw.call(this, force);
    if (this._drawImage) {
        this._drawImage = false;
        this._div.html(this._image);
    }
}
/** @override */
UIImage.prototype.setBounds = function(x, y, width, height) {
    if (Component.prototype.setBounds.call(this, x, y, width, height)) {
        this._image.width = this._width;
        this._image.height = this._height;
    }
}
/** @private */
UIImage.prototype._handleLoad = function() {
    if (this._width === 0) {
        this._width = this._image.width;
        if (this._div)
            this._div.css("width", this._width);
    } else {
        this._image.width = this._width;
    }
    if (this._height === 0) {
        this._height = this._image.height;
        if (this._div)
          this._div.css("height", this._height);
    } else {
        this._image.height = this._height;
    }
}