/**
 * -------
 * EditBox
 * -------
 * @constructor
 * @extends {Component}
 * @param {string} id - ID of div
 * @param {Component=} delegate
 */
function EditBox(id, delegate) {
    Component.call(this, id, delegate);
}
/**
 * Inheriting
 */
EditBox.prototype = Object.create(Component.prototype);
EditBox.prototype.constructor = EditBox;
/** @override */
EditBox.prototype.create = function() {
    Component.prototype.create.call(this);
    var editID = this._id + "_edit";
    this._div.append("<input type=\"text\" id=\"" + editID + "\"></input>");    
    this._edit = $("#" + editID);
    this._edit.css("position", "absolute");
    this._edit.css('user-select', 'text'); 
    this._edit.css("top", "0px");
    this._edit.css("left", "0px");
    this._edit.css('box-sizing', "border-box");
    this._edit.css('padding-left', "4px");
    this._edit.css('padding-right', "4px");
    this._edit.css('padding-right', "4px");
    this._edit.attr("readonly", "readonly");
    this._edit.onselectstart = function() { return true; }
    this._edit.unselectable = "off";
    var self = this;
    this._edit.keyup(function(e) { self.onKeyUpEvent(e); });
    this._edit.keydown(function(e) { self.onKeyDownEvent(e); });
    this._drawEdit = true;
}
EditBox.prototype.selectAllText = function() {
    this._edit[0].setSelectionRange(0, this._text.length);
}
/** @override */
EditBox.prototype.draw = function(force) {
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
            if (this._errorState) {
                this._edit.removeAttr("readonly");
                this._edit.focus();
                this._edit[0].setSelectionRange(0, this._text.length);
                this._edit.css("border", "2px solid red");
                this._edit.removeAttr("box-shadow");
            } else if (this._focus) {
                this._edit.removeAttr("readonly");
                this._edit.focus();
                this._edit.css("box-shadow", "0 0 5px rgba(107, 177, 238, 1)");
                this._edit.css("border", "1px solid rgba(107, 177, 238, 1)");
            } else {
                this._edit.blur();
                this._edit.css("border-top","1.5px solid #888");
                this._edit.css("border-left","1.5px solid #888");
                this._edit.css("border-bottom","1px solid #ccc");
                this._edit.css("border-right","1px solid #ccc");
                this._edit.css('box-shadow', "0px -1px 2px #888");
            }
            this._edit.css("background", "white");
            this._edit.css("color", "black");
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
EditBox.prototype.setBounds = function(x, y, width, height) {
    Component.prototype.setBounds.call(this, x, y, width, height);
    this._drawEdit = true;
}
/**
 * @param {boolean} password
 */
EditBox.prototype.setPassword = function(password) {
    this._password = password;
    this._drawEdit = true;
}
/** 
 * @param {number} maxChars
 */
EditBox.prototype.setMaxChars = function(maxChars) {
    if (this._maxChars !== maxChars) {
        this._maxChars = maxChars;
        this._drawEdit = true;
    }
}
/** 
 * @param {string} text
 */
EditBox.prototype.setText = function(text) {
    if (this._text !== text) {
        this._text = text;
        this._drawEdit = true;
    }
}
EditBox.prototype.getText = function() {
    if (!this._text)
        return "";
    return this._text;
}
/** @override */
EditBox.prototype.setEnabled = function(e) {
    Component.prototype.setEnabled.call(this, e);
    this._drawEdit = true;
}
EditBox.prototype.isEnabled = function() {
	return this._enabled;
}
EditBox.prototype.blur = function() {
    if (Component.prototype.blur.call(this))
        this._drawEdit = true;
}
EditBox.prototype.focus = function() {
    if (Component.prototype.focus.call(this))
        this._drawEdit = true;
}
/** @override */
EditBox.prototype.setErrorState = function(on) {
    if (Component.prototype.setErrorState.call(this, on)) {
        this._drawEdit = true;
    }
}
/** @override */
EditBox.prototype.onMouseUp = function(x, y) {
    this._edit.focus().select();
    return true;
}
/** @override */
EditBox.prototype.onMouseDown = function(x, y) {
    return true;
}
/**
 * @private
 * @param {jQuery.event=} e
 */
EditBox.prototype.onKeyDownEvent = function(e) {
    var keyCode = e.keyCode || e.which; 
    if (keyCode === KeyEvent.TAB) {
      e.preventDefault();
      if (this._nextControl) {
          RootComponent.captureMouse(this._nextControl);
      }
    }
}
/**
 * @private
 * @param {jQuery.event=} e
 */
EditBox.prototype.onKeyUpEvent = function(e) {
    var code = e.which;
    if (code === KeyEvent.ENTER) {
        e.preventDefault();
        this.blur();
        this.refresh();
        this.notify(new ChartEvent(ChartEvent.EDIT_ENTER));
        return;
    }
    if (code === KeyEvent.ESCAPE) {
        this.blur();
        this.refresh();
        return;
    }
    this._text = this._edit.val();
    if (this._errorState && this._text.length > 0) {
        this.setErrorState(false);
    }
    this.notify(new ChartEvent(ChartEvent.EDIT_CHANGED));
}