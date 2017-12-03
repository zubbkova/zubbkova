/* global Component, Color, Label, Button, Main, ChartEvent */
/**
 * -----------
 * AlertDialog
 * -----------
 * @constructor
 * @extends {Component}
 * @param {string} id
 * @param {Component=} delegate
 * @param {string=} message
 */
function AlertDialog(id, delegate, message) {
    Component.call(this, id, delegate);
    this.setBackground(Color.white);
    this.setBorder(Component.BORDER_FLOAT);
    this.setRoundedCorners(5);
    this._margin = 10;
    var label = new Label(this._id + "_label", this);
    label._fontSize = 12;
    label._align = Label.ALIGN_CENTER;
    label._background = this._background;
    label.setVerticalAlign(Label.VERTICAL_ALIGN_TOP);
    label.setLocation(this._margin, this._margin);
    var fullWidth = message.length * (label._fontSize * 0.6);
    if (fullWidth > 400) {
        this._lines = parseInt(fullWidth / 400, 10) + (fullWidth % 400 > 0 ? 1 : 0);
    } else {
        this._lines = 1;
    }
    this._buttonOk = new Button(this._id + "_buttonOk", this);
    this._buttonOk.setText("OK");
    this._buttonOk.setSize(100, 25);
    this._width = fullWidth / this._lines + this._margin * 2;
    this._height = this._margin * 3 + this._buttonOk._height + label._fontSize * 1.3 * this._lines;
    this._x = Main.getSession()._root._width/2 - this._width/2;
    this._y = Main.getSession()._root._height/2 - this._height/2;
    this._buttonOk.setLocation(this._width/2 - this._buttonOk._width/2, this._height - this._margin - this._buttonOk._height);
    this.add(this._buttonOk);
    label.setSize(this._width - label._x * 2, label._fontSize * 1.3 * this._lines);
    label.setText(message);
    this.add(label);
}
/**
 * Inheriting
 */
AlertDialog.prototype = new Object(Component.prototype);
AlertDialog.prototype.constructor = AlertDialog;
/** @static */
AlertDialog.CLOSED = 0;
/** @static */
AlertDialog.LEFT_BUTTON = 1;
/** @static */
AlertDialog.RIGHT_BUTTON = 2;
/**
 * @param {ChartEvent} e
 */
AlertDialog.prototype.onCustomEvent = function(e) {
    if (e._event === ChartEvent.BUTTON_CLICK) {
        Main.getSession().getRootComponent().removeWindow(this);
    }
}