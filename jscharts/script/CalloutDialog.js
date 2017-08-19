/**
 * -------------
 * CalloutDialog
 * -------------
 * @constructor
 * @extends {Modal}
 * @param {string} id
 * @param {Component=} delegate
 */
function CalloutDialog(id, delegate) {
    Modal.call(this, id, delegate);
    this.setSize(200, 190);
    
    this._text = new MultilineEditBox(this._id + "_edit", this);
    this._text.setBounds(3, 3, 194, 150);
    this.add(this._text);
    
    this._okButton = new Button(this._id + "_okButton", this);
    this._okButton.setText("OK");
    this._okButton.setBounds((this._width - (30 + 60 + Component.COMPONENT_X_GAP)) / 2, this._text._y + this._text._height + 10, 30, 20);
    this.add(this._okButton);
    
    this._cancelButton = new Button(this._id + "_cancelButton", this);
    this._cancelButton.setText("Cancel");
    this._cancelButton.setBounds(this._okButton._x + 30 + Component.COMPONENT_X_GAP, this._okButton._y, 60, 20);
    this.add(this._cancelButton);
}
/**
 * Inheriting
 */
CalloutDialog.prototype = Object.create(Modal.prototype);
CalloutDialog.prototype.constructor = CalloutDialog;
CalloutDialog.prototype.getText = function() {
    return this._text.getText();
}
/**
 * @param {string} s
 */
CalloutDialog.prototype.setText = function(s) {
    this._text.setText(s);
}