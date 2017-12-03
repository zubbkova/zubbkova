/* global Label, NumberFormat, FeedContent */
/**
 * ------------
 * IntegerLabel
 * ------------
 * @constructor
 * @extends {Label}
 * @param {string} id - ID of div
 * @param {Component=} delegate
 */
function IntegerLabel(id, delegate) {
    Label.call(this, id, delegate);
    this._newInteger = 0;
}
/**
 * Inheriting
 */
IntegerLabel.prototype = Object.create(Label.prototype);
IntegerLabel.prototype.constructor = IntegerLabel;
IntegerLabel.prototype.unset = function() {
    this.setText("");
}
/**
 * @param {number} i
 */
IntegerLabel.prototype.setInteger = function(i) {
    this.setText(NumberFormat.getInstance().format(i));
    this._newInteger = i;
}
/** @override */
IntegerLabel.prototype.feedDelegate_feed = function(fc) {
    if (fc === undefined) 
        return;
    if (fc._contents !== " ") {
        this._newInteger = FeedContent.getInteger(fc._contents);
        this.doUpdate(fc._flags);
    } else {
        this.unset();
    }
}
/** @override */
IntegerLabel.prototype.loadContents = function() {
    this.setText(NumberFormat.getInstance().format(this._newInteger));
}
IntegerLabel.prototype.getInteger = function() {
    return this._newInteger;
}