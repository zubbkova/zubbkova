/**
 * ---------------
 * ThicknessButton
 * ---------------
 * @constructor 
 * @extends {Component}
 * @param {string} id - ID of div
 * @param {Component=} delegate
 * @param {string=} tooltip
 */
function ThicknessButton(t, id, delegate, tooltip) {
    Component.call(this, id, delegate);
    this._thickness = t;
    this.setRoundedCorners(2);
    this._selected = false;
    this.setSize(14, 14);
    this._cursor = Cursor.HAND_CURSOR;
    this._drawCursor = true;
    this.setBorder(Component.BORDER_SOLID);
    this.setBorderSize(1);
    let control = new Component(this._id + "_control", this, tooltip);
    control.setBounds(1, 8 - this._thickness, this._width - 4, this._thickness);
    control.setBackground(Color.black.toString());
    this.add(control);
}
/**
 * Inheriting
 */ 
ThicknessButton.prototype = Object.create(Component.prototype);
ThicknessButton.prototype.constructor = ThicknessButton;
/**
 * @param {boolean} s
 */
ThicknessButton.prototype.setSelected = function(s) {
    this._selected = s;
}
ThicknessButton.prototype.getSelected = function() {
    return this._selected;
}
/** @override */
ThicknessButton.prototype.draw = function(force) {
    if (this._selected) {
        this.setBorderColor(Color.black);
    } else {
        this.setBorderColor(Color.white);
    }
    Component.prototype.draw.call(this, force);
}
/** @override */
ThicknessButton.prototype.onMouseDown = function(x, y) {
    this.setSelected(true);
    this.refresh();
    this.onClick(x, y);
    return true;
}
/** @override */
ThicknessButton.prototype.onMouseUp = function(x, y) {
    return true;
}
/** @override */
ThicknessButton.prototype.onMouseLeave = function() {
    return true;
}
/** @override */
ThicknessButton.prototype.onMouseEnter = function() {
    return true;
}
/** @override */
ThicknessButton.prototype.onMouseMove = function(x, y) {
    return true;
}
/**
 * @param {number=} x
 * @param {number=} y
 */
ThicknessButton.prototype.onClick = function(x, y) {
    let ne = new ChartEvent(ChartEvent.BUTTON_CLICK);
    ne._point = new Point(x, y);
    this.notify(ne);
}