/* eslint no-unused-vars: "off" */
/* global Component, KeyEvent, ChartEvent */
/**
 * ----------------
 * MultilineEditBox
 * ----------------
 * @constructor
 * @extends {Component}
 * @param {string} id - ID of div
 * @param {Component=} delegate
 */
function MultilineEditBox(id, delegate) {
    Component.call(this, id, delegate);
}
/**
 * Inheriting
 */
MultilineEditBox.prototype = Object.create(Component.prototype);
MultilineEditBox.prototype.constructor = MultilineEditBox;
/** @override */
MultilineEditBox.prototype.create = function() {
    Component.prototype.create.call(this);
    var editID = this._id + "_edit";
    this._div.append("<textarea id=\"" + editID + "\"></textarea>");    
    this._edit = $("#" + editID);
    this._edit.css("position", "absolute");
    this._edit.css('user-select', 'text'); 
    this._edit.css("top", "0px");
    this._edit.css("left", "0px");
    this._edit.css("resize", "none");
    this._edit.css('box-sizing', "border-box");
    this._edit.css('padding-left', "4px");
    this._edit.css('padding-right', "4px");
    this._edit.css('padding-right', "4px");
    var self = this;
    this._edit.attr("readonly", "readonly");
    this._edit.keyup(function(e) { self.onKeyUpEvent(e); });
    this._edit.keydown(function(e) { self.onKeyDownEvent(e); });
    this._drawEdit = true;
}
/** @override */
MultilineEditBox.prototype.draw = function(force) {
    Component.prototype.draw.call(this, force);
    if (this._drawEdit || force) {
        if (this._password)
            this._edit.attr("type","password");
        else
            this._edit.attr("type", "text");
        if (!this._maxChars)
            this._edit.removeAttr("maxlength");
        else
            this._edit.attr("maxlength", this._maxChars);
        this._edit.css("font-size", this._fontSize);
        this._edit.css("width", this._width + "px");
        this._edit.css("height", this._height + "px");
        if (this._enabled) {
            if (this._focus) {
                this._edit.removeAttr("readonly");
                this._edit.focus();
                this._edit.css("box-shadow", "0 0 5px rgba(107, 177, 238, 1)");
                this._edit.css("border", "1px solid rgba(107, 177, 238, 1)");
            } else if (this._errorState) {
                this._edit.css("border", "2px solid red");
                this._edit.removeAttr("box-shadow");
            } else {
                this._edit.blur();
                this._edit.css("border-top","1.5px solid #888");
                this._edit.css("border-left","1.5px solid #888");
                this._edit.css("border-bottom","1px solid #ccc");
                this._edit.css("border-right","1px solid #ccc");
                this._edit.css('box-shadow', "0px -1px 2px #888");
            }
            this._edit.removeAttr("disabled");
            this._edit.val(this._text);
        } else {
            this._edit.css("background", "#ededed");
            this._edit.css("color", "#888");
            this._edit.attr("disabled", "disabled");
        }
        this._drawEdit = false;
    }
}
/** @override */
MultilineEditBox.prototype.setEnabled = function(e) {
	Component.prototype.setEnabled.call(this, e);
    this._drawEdit = true;
}
MultilineEditBox.prototype.isEnabled = function() {
	return this._enabled;
}
/** @override */
MultilineEditBox.prototype.setBounds = function(x, y, width, height) {
    Component.prototype.setBounds.call(this, x, y, width, height);
    this._drawEdit = true;
}
/** 
 * @param {number} maxChars
 */
MultilineEditBox.prototype.setMaxChars = function(maxChars) {
    if (this._maxChars !== maxChars) {
        this._maxChars = maxChars;
        this._drawEdit = true;
    }
}
/** 
 * @param {string} text
 */
MultilineEditBox.prototype.setText = function(text) {
    if (this._text !== text) {
        this._text = text;
        this._drawEdit = true;
    }
}
MultilineEditBox.prototype.getText = function() {
    if (this._text === undefined) return "";
    return this._text;
}
MultilineEditBox.prototype.blur = function() {
    if (Component.prototype.blur.call(this))
        this._drawEdit = true;
}
MultilineEditBox.prototype.focus = function() {
    if (Component.prototype.focus.call(this))
        this._drawEdit = true;
}
/** @override */
MultilineEditBox.prototype.onMouseDown = function(x, y) {
    return true;
}
/** @override */
MultilineEditBox.prototype.onMouseUp = function(x, y) {
    return true;
}
/**
 * @private
 * @param {jQuery.event=} e
 */
MultilineEditBox.prototype.onKeyDownEvent = function(e) {
    var keyCode = e.keyCode || e.which; 
    if (keyCode === KeyEvent.TAB) {
        e.preventDefault();
        if (this._nextControl) {
            this._nextControl.focus();
            this._nextControl.refresh();
            this.blur();
            this.refresh();
        }
    }
}
/**
 * @private
 * @param {jQuery.event=} e
 */
MultilineEditBox.prototype.onKeyUpEvent = function(e) {
    var code = e.which;
    if (code === KeyEvent.ENTER) {
        e.preventDefault();
        this.notify(new ChartEvent(ChartEvent.EDIT_ENTER));
        return;
    }
    this._text = this._edit.val();
    this.notify(new ChartEvent(ChartEvent.EDIT_CHANGED));
}