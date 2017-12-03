/* eslint no-unused-vars: "off" */
/* global Component, Canvas, Cursor */
/**
 * ---------
 * HotTickerFrame
 * ---------
 * @constructor
 * @extends {Component}
 * @param {string} id
 * @param {Component=} delegate
 */
function HotTickerFrame(id, delegate) {
    Component.call(this, id, delegate);
    this._canvas = new Canvas(this._id + "_canvas", this);
    this._canvas.setTransparency(0.1);
    this.add(this._canvas);
}
/**
 * Inheriting
 */
HotTickerFrame.prototype = Object.create(Component.prototype);
HotTickerFrame.prototype.constructor = HotTickerFrame;
/** @override */
HotTickerFrame.prototype.process = function(t) {
    if (this._hotTicker)
        return this._hotTicker.process(t);
    return false;
}
/**
 * @param {HotTicker} hotTicker
 * @param {Object} parentBounds
 */
HotTickerFrame.prototype.initHotTicker = function(hotTicker, parentBounds) {
    this._parentBounds = parentBounds;
    if (hotTicker) {
        this._hotTicker = hotTicker;
        this._hotTicker._chartCanvas = this._canvas;
    } else {
        console.error("HotTicker is not initialised");
        return;
    }
    this._canvas.setBackground(this._hotTicker._backgroundColor);
    this.setOriginalBounds();
}
HotTickerFrame.prototype.setOriginalBounds = function() {
    var x = this._parentBounds._x + (this._hotTicker._posX > 0 ? this._hotTicker._posX : (this._parentBounds._width + this._hotTicker._posX));
    var y = this._parentBounds._y + (this._hotTicker._posY > 0 ? this._hotTicker._posY : (this._parentBounds._height + this._hotTicker._posY));
    this.setBounds(x, y, this._hotTicker._width, this._hotTicker._height);
    this._hotTicker.setBounds(0, 0, this._hotTicker._width, this._hotTicker._height);
    this._canvas.setBounds(0, 0, this._hotTicker._width, this._hotTicker._height);
}
/** @override */
HotTickerFrame.prototype.onMouseDown = function(x, y) {
    this._drag = true;
    this._dragX = x;
    this._dragY = y;
    return true;
}
/** @override */
HotTickerFrame.prototype.onMouseUp = function(x, y) {
    this._drag = false;
    return true;
}
/** @override */
HotTickerFrame.prototype.onMouseMove = function(x, y) {
    this.setCursor(Cursor.HAND_CURSOR);
    if (this._drag)
        return this.onMouseDrag(x, y);
    return true;
}
/** 
 * @param {number=} x
 * @param {number=} y
 */
HotTickerFrame.prototype.onMouseDrag = function(x, y) {
    var deltaX = x - this._dragX;
    var deltaY = y - this._dragY;
    var newX = this._x + deltaX;
    var newY = this._y + deltaY;
    // adjust
    if (newY < this._parent._y) {
        newY = this._parent._y - 1;
    } else if (newY > this._parent._y + this._parent._height - this._height) {
        newY = this._parent._y + this._parent._height - this._height + 1;
    }
    if (newX < this._parent._x) {
        newX = this._parent._x - 1;
    } else if (newX > this._parent._x + this._parent._width - this._width) {
        newX = this._parent._x + this._parent._width - this._width + 1;
    }
    this.setLocation(newX, newY);
    this.refresh();
    return true;
}
/** @override */
HotTickerFrame.prototype.onMouseLeave = function() {
    this._hotTicker._drawPrices = false;
}
/** @override */
HotTickerFrame.prototype.onMouseEnter = function() {
    this._hotTicker._drawPrices = true;
}