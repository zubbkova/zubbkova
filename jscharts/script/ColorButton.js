/**
 * -----------
 * ColorButton
 * -----------
 * @constructor 
 * @extends {Component}
 * @param {string} id - ID of div
 * @param {Component=} delegate
 * @param {string=} tooltip
 */
function ColorButton(color, id, delegate, tooltip) {
    Component.call(this, id, delegate, tooltip);
    this._color = color;
    this.setRoundedCorners(2);
    this._selected = false;
    this.setSize(14, 14);
    this._cursor = Cursor.HAND_CURSOR;
    this._drawCursor = true;
    this.setBorder(Component.BORDER_SOLID);
    this.setBorderSize(1);
    let control = new Component(this._id + "_control", this, tooltip);
    control.setBounds(1, 1, this._width - 4, this._height - 4);
    control.setBackground(this._color.toString());
    this.add(control);
}
/**
 * Inheriting
 */ 
ColorButton.prototype = Object.create(Component.prototype);
ColorButton.prototype.constructor = ColorButton;
/**
 * @param {boolean} s
 */
ColorButton.prototype.setSelected = function(s) {
    this._selected = s;
}
ColorButton.prototype.getSelected = function() {
    return this._selected;
}
/** @override */
ColorButton.prototype.draw = function(force) {
    if (this._selected) {
        this.setBorderColor(Color.black);
    } else {
        this.setBorderColor(Color.white);
    }
    Component.prototype.draw.call(this, force);
}
/** @override */
ColorButton.prototype.onMouseDown = function(x, y) {
    this.setSelected(true);
    this.refresh();
    this.onClick(x, y);
    return true;
}
/** @override */
ColorButton.prototype.onMouseUp = function(x, y) {
    return true;
}
/** @override */
ColorButton.prototype.onMouseLeave = function() {
    return true;
}
/** @override */
ColorButton.prototype.onMouseEnter = function() {
    return true;
}
/** @override */
ColorButton.prototype.onMouseMove = function(x, y) {
    return true;
}
/**
 * @param {number=} x
 * @param {number=} y
 */
ColorButton.prototype.onClick = function(x, y) {
    let ne = new ChartEvent(ChartEvent.BUTTON_CLICK);
    ne._point = new Point(x, y);
    this.notify(ne);
}