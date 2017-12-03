/* global Component, Label, EditBox, Color, Button, ChartEvent, Main, Utils */
/**
 * -----------
 * ParamDialog
 * -----------
 * @constructor
 * @extends {Component}
 * @param {string} id
 * @param {Component} delegate
 * @param {Array} l
 * @param {Array} v
 */
function ParamDialog(id, delegate, l, v) {
    Component.call(this, id, delegate);
    this._shown = false;
    this._numParams = l.length;
    this._edits = new Array(this._numParams);
    
    this.setBackground(Color.white);
    this.setBorder(Component.BORDER_FLOAT);
    this.setSize(180, 60);
    var curY = 10;
    for (var i = 0; i < this._numParams; i++) {
        var l1 = new Label(this._id + "_l" + i, this);
        l1.setBackground(this._background);
        l1.setBounds(10, curY, 50, 20);
        l1.setAlign(Label.ALIGN_RIGHT);
        l1.setText(l[i]);
        this.add(l1);

        this._edits[i] = new EditBox(this._id + "_edit" + i, this);
        this._edits[i].setBounds(64, curY, 100, 20);
        this._edits[i].setBorder(Component.BORDER_INSET);
        if (v && i < v.length)
            this._edits[i].setText(v[i]);
        this.add(this._edits[i]);

        curY = l1._y + l1._height + Component.COMPONENT_Y_GAP;
    }
    this._okButton = new Button(this._id + "_okButton", this);
    this._okButton.setText("OK");
    this._okButton.setBounds((this._width - (30 + 60 + Component.COMPONENT_X_GAP)) / 2, curY, 30, 20);
    this.add(this._okButton);
    
    this._cancelButton = new Button(this._id + "_cancelButton", this);
    this._cancelButton.setText("Cancel");
    this._cancelButton.setBounds(this._okButton._x + 30 + Component.COMPONENT_X_GAP, this._okButton._y, 60, 20);
    this.add(this._cancelButton);
}
/**
 * Inheriting
 */
ParamDialog.prototype = Object.create(Component.prototype);
ParamDialog.prototype.constructor = ParamDialog;
ParamDialog.prototype.getParams = function() {
    var p = new Array(this._numParams);
    for (var i = 0; i < this._numParams; i++)
        p[i] = this._edits[i].getText();
    return p;
}
/** @override */
ParamDialog.prototype.onCustomEvent = function(e) {
    if (e._event === ChartEvent.BUTTON_CLICK) {
        if (e._source === this._okButton) {
            this.notify(new ChartEvent(ChartEvent.MODAL_OK));
            this.setModal(false);
        } else if (e._source === this._cancelButton) {
            this.setModal(false);
        }
    }
}
/**
 * @param {boolean} open
 */
ParamDialog.prototype.setModal = function(open) {
    if (Main.getSession().getRootComponent()._modal && Utils.getConstructorName(Main.getSession().getRootComponent()._modal) === "ParamDialog" && open)
        return;
    if (open !== this._shown) {
        this.setVisible(open);
        if (this._shown) {
            Main.getSession().getRootComponent().showModal(this);
        } else {
            Main.getSession().getRootComponent().removeWindow(this);
        }
    }
}