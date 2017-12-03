/* global Component, ImageButton, Style, Button, Color, ChartEvent, Label, Cursor */
/**
 * -----------
 * RadioButton
 * -----------
 * @constructor
 * @extends {Component}
 */
function RadioButton(id, delegate, selected, text) {
    Component.call(this, id, delegate);
    
    this._rb = new ImageButton(Style.getImage(Style.IMAGE_CHECKBOX_OFF), this._id + "_button", this);
    this._rb.setToggle(true);
    this._rb._drawBorders = false;
    this.add(this._rb);
    this._label = new Button(this._id + "_label", this);
    this._label.setNoBorder(true);
    this._label.setToggle(true);
    this._label.setColors("none", "none", "none", "none", Color.black, "none");
    this._label.setAlign(Label.ALIGN_LEFT);
    if (text) {
        this._label.setText(text);
    }
    this.add(this._label);
    this.setSelected(selected === undefined ? false : selected);
    this._cursor = Cursor.HAND_CURSOR;
    this._drawCursor = true;
}
/**
 * Inheriting
 */
RadioButton.prototype = Object.create(Component.prototype);
RadioButton.prototype.constructor = RadioButton;
/** @override */
RadioButton.prototype.draw = function(force) {
    if (this._rb._down) {
        this._rb.setImage(Style.getImage(Style.IMAGE_CHECKBOX_ON));
    } else {
        this._rb.setImage(Style.getImage(Style.IMAGE_CHECKBOX_OFF));
    }
    Component.prototype.draw.call(this, force);
}
/** @override */
RadioButton.prototype.setBounds = function(x, y, w, h) {
    this._rb.setBounds(0, 0, 14, 14);
    this._label.setBounds(this._rb.getWidth() + Component.COMPONENT_X_GAP, 0, w - this._rb.getWidth() - Component.COMPONENT_X_GAP, 14);
    Component.prototype.setBounds.call(this, x, y, w, h);
}
/**
 * @param {boolean} newValue
 */
RadioButton.prototype.setSelected = function(newValue) {
    if (this._rb._down === newValue) 
        return;
    this._rb.setDown(newValue);
    this._label.setDown(newValue);
}
RadioButton.prototype.getSelected = function() {
     return this._rb._down;
 }
/**
 * @param {ChartEvent} e
 */
RadioButton.prototype.onClick = function(e) {
    if (e._source === this._rb) {
        // update label
        this._label.setDown(this._rb._down);
        this._label.refresh();
    } else if (e._source === this._label) {
        // update rb
        this._rb.setDown(this._label._down);
        this._rb.refresh();
    }
    this.focus();
    this.notify(new ChartEvent(ChartEvent.RADIO_CHANGED));
}
/** @override */
RadioButton.prototype.onCustomEvent = function(e) {
    if (e._event === ChartEvent.BUTTON_CLICK) {
        this.onClick(e);
    }
}