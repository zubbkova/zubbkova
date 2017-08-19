/**
 * --------------
 * ToolbarDialogs
 * --------------
 */
let ToolbarDialogs = {};
/**
 * @param {string} id
 * @param {Component} delegate
 * @param {Study} study
 */
ToolbarDialogs.getStudyDialog = function(id, delegate, study) {
    let c = StudyFactory.studies.get(study.getMnemonic());
    let items = c.getItems(); // StudyDialog_StudyParameter
    if (items.length === 0) {
        return new ToolbarDialogs_StudyNoParametersDialog(id, delegate);
    }
    let d = new StudyDialog(id, delegate);
    for (let item of items) {
        d.addParameter(item);
    }
    d.init2(study);
    return d;
}
/**
 * --------------------------------------
 * ToolbarDialogs_StudyNoParametersDialog
 * --------------------------------------
 * @constructor
 * @extends {Component}
 * @param {string} id
 * @param {Component=} delegate
 */
function ToolbarDialogs_StudyNoParametersDialog(id, delegate) {
    Component.call(this, id, delegate);
    this.setBackground(Color.white);
    this.setBorder(Component.BORDER_FLOAT);
    this.setSize(150, 60);
    this._paramItems = new Map();
    this._currentY = 8;
    
    let l1 = new Label(this._id + "_l1", this);
    l1.setBounds(10, 10, this._width - 20, 20);
    l1.setText(Language.getString("toolbardialogs_no_parameters"));
    l1.setBackground(this._background);
    l1.setAlign(Label.ALIGN_CENTER);
    this.add(l1);
    this._currentY = l1.getY() + l1.getHeight() + Component.COMPONENT_X_GAP;
    
    let cancelButton = new Button(this._id + "_cancelButton", this);
    cancelButton.setText("Cancel");
    cancelButton.setBounds((this._width - 60) / 2, this._currentY, 60, 20);
    this.add(cancelButton);
    this.setSize(150, cancelButton._y + cancelButton._height + 8);
}
/**
 * Inheriting
 */
ToolbarDialogs_StudyNoParametersDialog.prototype = Object.create(Component.prototype);
ToolbarDialogs_StudyNoParametersDialog.prototype.constructor = ToolbarDialogs_StudyNoParametersDialog;
/**
 * --------------------------
 * ToolbarDialogs_PrefsDialog
 * --------------------------
 * @constructor
 * @extends {Component}
 * @param {string} id
 * @param {Component=} delegate
 */
function ToolbarDialogs_PrefsDialog(id, delegate) {
    Component.call(this, id, delegate);
    this.setBackground(Color.white);
    this.setBorder(Component.BORDER_FLOAT);
    this.setSize(250, 60);
    
    let l1 = new Label(this._id + "_l1", this);
    l1.setBackground(this._background);
    l1.setBounds(10, 10, 50, 20);
    l1.setAlign(Label.ALIGN_RIGHT);
    l1.setText(Language.getString("toolbardialogs_name"));
    this.add(l1);
    
    this._nameEdit = new EditBox(this._id + "_edit", this);
    this._nameEdit.setBounds(64, 10, 150, 20);
    this._nameEdit.setBorder(Component.BORDER_INSET);
    this._nameEdit.focus();
    this.add(this._nameEdit);
    
    this._okButton = new Button(this._id + "_okButton", this);
    this._okButton.setText("OK");
    this._okButton.setBounds((this._width - (30 + 60 + Component.COMPONENT_X_GAP)) / 2, 35, 30, 20);
    this.add(this._okButton);
    
    this._cancelButton = new Button(this._id + "_cancelButton", this);
    this._cancelButton.setText("Cancel");
    this._cancelButton.setBounds(this._okButton._x + 30 + Component.COMPONENT_X_GAP, this._okButton._y, 60, 20);
    this.add(this._cancelButton);
}
/**
 * Inheriting
 */
ToolbarDialogs_PrefsDialog.prototype = Object.create(Component.prototype);
ToolbarDialogs_PrefsDialog.prototype.constructor = ToolbarDialogs_PrefsDialog;
/** @override */
ToolbarDialogs_PrefsDialog.prototype.onKeyUp = function(keyCode) {
    if (keyCode === 27) {
        this._delegate.ToolbarDialogs_Cancel(this);
    }
}
/** @override */
ToolbarDialogs_PrefsDialog.prototype.onCustomEvent = function(e) {
    if (e._event === ChartEvent.BUTTON_CLICK) {
        if (e._source === this._okButton) {
            if (this._nameEdit.getText() === "Default") {
                this._nameEdit.selectAllText();
            } else {
                if (this._nameEdit._text.length === 0) {
                    this._okButton.setEnabled(false);
                    this._okButton.refresh();
                    return;
                }
                this._delegate.ToolbarDialogs_PrefsDialogDelegate_OK();
            }
        } else if (e._source === this._cancelButton) {
            this._delegate.ToolbarDialogs_Cancel(this);
        }
    } else if (e._event === ChartEvent.EDIT_CHANGED) {
        this._okButton.setEnabled(this._nameEdit._text.length > 0);
        this._okButton.refresh();
    }
}