/* eslint no-unused-vars: "off" */
/* global Component, ImageButton, Cursor, Label, ChartEvent */
/**
 * ---------
 * ToggleBar
 * ---------
 * @constructor 
 * @extends {Label}
 * @param {string} id - ID of div
 * @param {Component=} delegate
 */
function ToggleBar(id, delegate) {
    Component.call(this, id, delegate);
    this._buttons = [];
    this._mode = ToggleBar.MODE_MUTEX;
}
/**
 * Inheriting
 */ 
ToggleBar.prototype = Object.create(Component.prototype);
ToggleBar.prototype.constructor = ToggleBar;
/** @static */
ToggleBar.MODE_TOGGLE = 0;
/** @static */
ToggleBar.MODE_MUTEX  = 1;
/**
 * @param {number} width
 */
ToggleBar.prototype.setButtonWidth = function(width) {
    this._buttonWidth = Math.floor(width);
}
/** @override */
ToggleBar.prototype.setBounds = function(x, y, width, height) {
    if (Component.prototype.setBounds.call(this, x, y, width, height)) {
        var horizontal = width > height;
        for (var i = 0; i < this._buttons.length; i++) {
            var b = this._buttons[i];
            if (horizontal) {
                b.component.setBounds(this._buttonWidth * i, 1, this._buttonWidth, this._buttonWidth);
            } else {
                b.component.setBounds(0, this._buttonWidth * i, this._buttonWidth, this._buttonWidth);
            }
        }
    }    
}
/**
 * @param {number} mode
 */
ToggleBar.prototype.setMode = function(mode) {
    this._mode = mode;
}
/** @override */
ToggleBar.prototype.create = function() {
    Component.prototype.create.call(this);
}
/** @override */
ToggleBar.prototype.draw = function(force) {
    Component.prototype.draw.call(this, force);
}/**
 * @param {number} i
 */
ToggleBar.prototype.getButton = function(i) {
    return this._buttons[i].component;
}
/**
 * @param {string} imageURL
 * @param {string} tooltip
 * @param {boolean} initialState
 */
ToggleBar.prototype.addImageButton = function(imageURL, tooltip, initialState) {
    var i = new ImageButton(imageURL, this._id + "_b" + this._buttons.length, this, tooltip);
    i.setCursor(Cursor.HAND_CURSOR);
    i.setDown(initialState);
    this.add(i);
    this._buttons.push({ component: i, state: initialState });
    this._drawButtons = true;
    this._drawTable = true;
    this.setWidth(this._buttons.length * this._buttons.length);
    if (initialState) {
        this._selected = this._buttons.length - 1;
    }
    return i;   
}
ToggleBar.prototype.getIndex = function() {
    return this._selected;
}
/**
 * @param {string} text
 * @param {number} fontSize
 * @param {boolean} bold
 * @param {boolean} initialState
 */
ToggleBar.prototype.addTextButton = function(text, fontSize, bold, initialState ) {
    var l = new Label(this._id + "_textButton", this);
    l.setText(text);
    l.setFontSize(fontSize);
    l.setAlign(Label.ALIGN_CENTER);
    l.setBold(bold);
    l.setCursor(Cursor.HAND_CURSOR);
    this.add(l);
    this._buttons.push({ component: l, state: initialState });
    this._drawButtons=true;
    this._drawTable=true;
    this.setWidth(2+(this._buttons.length-1)+(this._buttons.length*(this._buttonWidth-4)));
}
/**
 * @param {Component=} button
 */
ToggleBar.prototype.onClick = function(button) {
    for (var i = 0; i < this._buttons.length; i++) {
        if (this._buttons[i].component === button) {
            if (this._mode === ToggleBar.MODE_TOGGLE) {
                this._buttons[i].state = !this._buttons[i].state;
                this._buttons[i].component.setDown(this._buttons[i].state);
                this._buttons[i].component.refresh();
            } else {
                // deselect all
                for (var j = 0; j < this._buttons.length; j++) {
                    var b = this._buttons[j];
                    b.state = (j === i);
                    b.component.setDown(b.state);
                    b.component.refresh();
                }
            }
            this._selected = i;
            this.notify(new ChartEvent(ChartEvent.BUTTON_CLICK));
            break;
        }
    }
}
/** @override */
ToggleBar.prototype.onMouseMove = function(x, y) {
    this.setCursor(Cursor.HAND_CURSOR);
    return true;
}
/** @override */
ToggleBar.prototype.onCustomEvent = function(e) {
    if (e._event === ChartEvent.BUTTON_CLICK) {
        this.onClick(e._source);
    }
}