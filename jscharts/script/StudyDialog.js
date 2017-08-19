/**
 * -----------
 * StudyDialog
 * -----------
 * @constructor
 * @extends {Component}
 * @param {string} id
 * @param {Component=} delegate
 */
function StudyDialog(id, delegate) {
    Component.call(this, id, delegate);
    this.setBackground(Color.white);
    this.setBorder(Component.BORDER_FLOAT);
    this.setSize(150, 150);
    this._paramItems = new Map();
    this._currentY = 8;
}
/**
 * Inheriting
 */
StudyDialog.prototype = Object.create(Component.prototype);
StudyDialog.prototype.constructor = StudyDialog;
/** @static */
StudyDialog.LABEL_WIDTH = 70;
/** @static */
StudyDialog.EDIT_WIDTH = 50;
/**
 * Add a parameter we want to edit along with the code for
 * it's label's text.
 * @param {StudyDialog_StudyParameter} [p]
 */
StudyDialog.prototype.addParameter = function(p) {
    this._paramItems.set(p._name, p);
    p.create(this);
}
/**
 * Initialise from a Study object.
 * @param {Study} [s]
 */
StudyDialog.prototype.init2 = function(s) {
    this._target = s;
    let items = Utils.convertStringParams(s.getParams(), ":", "-");
    let self = this;
    items.forEach(function(value, key, map) {
        let p = self._paramItems.get(key);
        p.attach(s);
        p.set(value);
    });
    this.addOkCancelButtons(this._currentY, this._paramItems.size > 0, true);
}
/**
 * @param {number} yLoc
 * @param {boolean} showOK
 * @param {boolean} showCancel
 */
StudyDialog.prototype.addOkCancelButtons = function(yLoc, showOK, showCancel) {
    let okLoc = 0 , cancelLoc = 0;
    if (showOK && showCancel) {
        okLoc = (this._width - (30 + 60 + Component.COMPONENT_X_GAP)) / 2;
        cancelLoc = okLoc + 30 + Component.COMPONENT_X_GAP;
    } else if (showOK) {
        okLoc = (this._width - 30) / 2;
    } else if (showCancel) {
        cancelLoc = (this._width - 60) / 2;
    }
    if (showOK) {
        this._okButton = new Button(this._id + "_okButton", this);
        this._okButton.setText("OK");
        this._okButton.setBounds(okLoc, yLoc, 30, 20);
        this.add(this._okButton);
    }
    if (showCancel) {
        this._cancelButton = new Button(this._id + "_cancelButton", this);
        this._cancelButton.setText("Cancel");
        this._cancelButton.setBounds(cancelLoc, yLoc, 60, 20);
        this.add(this._cancelButton);
    }
    this.setBounds(this._x, this._y, this._width, yLoc + 20 + Component.COMPONENT_Y_GAP);
}
StudyDialog.prototype.getParams = function() {
    let bits = [];
    this._paramItems.forEach(function(value, key, map) {
        bits.push(key + "-" + value.get());
    });
    return bits.join(":");
}
/** @override */
StudyDialog.prototype.onKeyUp = function(keyCode) {
    if (keyCode === 27) {
        this._delegate.ToolbarDialogs_Cancel(this);
    }
}
/**
 * Get the current parameters from components and set the parameters
 * on the actual study.
 */
StudyDialog.prototype.writeParams = function() {
    this._target.setParams(this.getParams());
}
/** @override */
StudyDialog.prototype.onCustomEvent = function(e) {
    if (e._event === ChartEvent.BUTTON_CLICK) {
        if (e._source == this._okButton) {
            this._delegate.ToolbarDialogs_StudyDialogDelegate_OK();
        } else if (e._source === this._cancelButton) {
            this._delegate.ToolbarDialogs_Cancel(this);
        } else {
            this._target.processParameterButtonClick(this);
            this._delegate.ToolbarDialogs_Cancel(this);
        }
    }
}
/**
 * --------------------------
 * StudyDialog_StudyParameter
 * --------------------------
 * @constructor
 * @param {string} name
 * @param {string=} label
 */
function StudyDialog_StudyParameter(name, label) {
    this._name = name;
    this._label = label;
}
/**
 * @param {Component} s
 */
StudyDialog_StudyParameter.prototype.attach = function(s) {
    this._target = s;
}
/**
 * ------------------------------
 * StudyDialog_StudyEditParameter
 * ------------------------------
 * @constructor
 * @extends {StudyDialog_StudyParameter}
 * @param {string} name
 * @param {string} label
 */
function StudyDialog_StudyEditParameter(name, label) {
    StudyDialog_StudyParameter.call(this, name, label);
}
/**
 * Inheriting
 */
StudyDialog_StudyEditParameter.prototype = Object.create(StudyDialog_StudyParameter.prototype);
StudyDialog_StudyEditParameter.prototype.constructor = StudyDialog_StudyEditParameter;
StudyDialog_StudyEditParameter.prototype.get = function() {
    return this._editBox.getText();
}
/**
 * @param {string} s
 */
StudyDialog_StudyEditParameter.prototype.set = function(s) {
    this._editBox.setText(s);
}
/**
 * @param {StudyDialog} [d]
 */
StudyDialog_StudyEditParameter.prototype.create = function(d) {
    let paramLabel = new Label(d._id + "_label" + this._name, d);
    paramLabel.setBackground(this._background);
    paramLabel.setBounds(10, d._currentY, StudyDialog.LABEL_WIDTH, 20);
    paramLabel.setAlign(Label.ALIGN_RIGHT);
    paramLabel.setText(this._label);
    d.add(paramLabel);
    this._editBox = new EditBox(d._id + "_edit" + this._name, d);
    this._editBox.setBounds(paramLabel._x + paramLabel._width + Component.COMPONENT_X_GAP, d._currentY, StudyDialog.EDIT_WIDTH, 20);
    this._editBox.setBorder(Component.BORDER_INSET);
    this._editBox.focus();
    d.add(this._editBox);
    d._currentY = this._editBox._y + this._editBox._height + Component.COMPONENT_Y_GAP;
}
/**
 * -------------------------------
 * StudyDialog_StudyRadioParameter
 * -------------------------------
 * @constructor
 * @extends {StudyDialog_StudyParameter}
 * @param {string} name
 * @param {Array} options
 */
function StudyDialog_StudyRadioParameter(name, options) {
    StudyDialog_StudyParameter.call(this, name);
    this._options = options;
}
/**
 * Inheriting
 */
StudyDialog_StudyRadioParameter.prototype = Object.create(StudyDialog_StudyParameter.prototype);
StudyDialog_StudyRadioParameter.prototype.constructor = StudyDialog_StudyRadioParameter;
StudyDialog_StudyRadioParameter.prototype.get = function() {
    return this._radioGroup.getSelected().toString();
}
/**
 * @param {string} s
 */
StudyDialog_StudyRadioParameter.prototype.set = function(s) {
    this._radioGroup.setSelected(parseInt(s, 10));
}
/**
 * @param {StudyDialog} [d]
 */
StudyDialog_StudyRadioParameter.prototype.create = function(d) {
    this._radioGroup = new RadioButtonGroup(d._id + "_radioGroup" + this._name, d);
    this._radioGroup.setBounds(10, d._currentY, 100, 50);
    for (let i = 0; i < this._options.length; i++)
        this._radioGroup.addRow(this._options[i]);
    d.add(this._radioGroup);
    d._currentY = this._radioGroup._y + this._radioGroup._height + Component.COMPONENT_Y_GAP;
}
/**
 * -------------------------------
 * StudyDialog_StudyYesNoParameter
 * -------------------------------
 * @constructor
 * @extends {StudyDialog_StudyParameter}
 * @param {string} name
 * @param {string} label
 * @param {boolean=} n
 * @param {number=} lw
 */
function StudyDialog_StudyYesNoParameter(name, label, n, lw) {
    this._label_width = StudyDialog.LABEL_WIDTH;
    StudyDialog_StudyParameter.call(this, name, label);
    this._numbers = false; 
    if (n)
        this._numbers = n;
    if (lw)
        this._label_width = lw;
}
/**
 * Inheriting
 */
StudyDialog_StudyYesNoParameter.prototype = Object.create(StudyDialog_StudyParameter.prototype);
StudyDialog_StudyYesNoParameter.prototype.constructor = StudyDialog_StudyYesNoParameter;
StudyDialog_StudyYesNoParameter.prototype.get = function() {
    if (this._numbers)
        return this._checkbox.getChecked() ? "1" : "0";
    return this._checkbox.getChecked() ? "true" : "false";
}
/**
 * @param {string} s
 */
StudyDialog_StudyYesNoParameter.prototype.set = function(s) {
    this._checkbox.setChecked("true" === s || "1" === s);
}
/**
 * @param {StudyDialog} d
 */
StudyDialog_StudyYesNoParameter.prototype.create = function(d) {
    this._checkbox = new Checkbox(d._id + "_checkbox" + this._name, d, false, this._label);
    this._checkbox.setBounds(10, d._currentY, d._width - 20, 14);
    d.add(this._checkbox);
    d._currentY = this._checkbox._y + this._checkbox._height + Component.COMPONENT_Y_GAP;
}
/**
 * -----------------------
 * StudyDialog_StudyButton
 * -----------------------
 * @constructor
 * @extends {StudyDialog_StudyParameter}
 * @param {string} name
 * @param {string} label
 */
function StudyDialog_StudyButton(name, label) {
    StudyDialog_StudyParameter.call(this, name, label);
}
/**
 * Inheriting
 */
StudyDialog_StudyButton.prototype = Object.create(StudyDialog_StudyParameter.prototype);
StudyDialog_StudyButton.prototype.constructor = StudyDialog_StudyButton;
StudyDialog_StudyButton.prototype.get = function() {
    return "";
}
/**
 * @param {string} s
 */
StudyDialog_StudyButton.prototype.set = function(s) {}
/**
 * @param {StudyDialog} d
 */
StudyDialog_StudyButton.prototype.create = function(d) {
    let width = this._label.length * 8;
    this._button = new Button(d._id + "_button" + this._name, d);
    this._button.setText(this._label);
    this._button.setBounds((d._width - width) / 2, d._currentY, width, 20);
    d.add(this._button);
    d._currentY = this._button._y + this._button._height + Component.COMPONENT_Y_GAP;
}