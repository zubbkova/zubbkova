/**
 * --------
 * Checkbox
 * --------
 * @constructor
 * @extends {Component}
 * @param {string} id - ID of div
 * @param {Component=} delegate
 * @param {boolean=} checked
 * @param {string=} text
 */
function Checkbox(id, delegate, checked, text) {
    Component.call(this, id, delegate);
    this._height = 16;
    this._tickFrame = new Component(this._id + "_tickFrame", this);
    this.add(this._tickFrame);
    this._tick = new ImageButton(Style.getImage(Style.IMAGE_TICK), this._id + "_button", this);
    this._tick.setCheckbox(true);
    this._tickFrame.add(this._tick);
    this._label = new Button(this._id + "_label", this);
    this._label._focusable = false;
    this._tick._focusable = false;
    this._tickFrame._focusable = false;
    this._label.setNoBorder(true);
    this._label.setToggle(true);
    this._label.setColors("none", "none", "none", "none", Color.black, "none");
    this._label.setAlign(Label.ALIGN_LEFT);
    if (text) {
        this._label.setText(text);
    }
    this.add(this._label);
    this.setChecked(checked === undefined ? false : checked);
    this._cursor = Cursor.HAND_CURSOR;
    this._drawCursor = true;
 }
/**
 * Inheriting
 */
Checkbox.prototype = Object.create(Component.prototype);
Checkbox.prototype.constructor = Checkbox;
/** @override */
Checkbox.prototype.focus = function() {
    if (Component.prototype.focus.call(this)) {
        Main.getSession().getRootComponent().setKeyFocus(this);
        this._drawFocus = true;
    }
}
/** @override */
Checkbox.prototype.blur = function() {
    if (Component.prototype.blur.call(this))
        this._drawFocus = true;
}
/** @override */
Checkbox.prototype.draw = function(force) {
    Component.prototype.draw.call(this, force);
    if (this._drawFocus) {
        if (this._focus) {
            this._tickFrame._div.css("box-shadow", "0 0 5px rgba(107, 177, 238, 1)");
            this._tickFrame._div.css("background", "rgba(107, 177, 238, 1)");
        } else {
            this._tickFrame._div.css("box-shadow","none");
            this._tickFrame._div.css("background","none");
        }
    }
}
/** @override */
Checkbox.prototype.setBounds = function(x, y, w, h) {
    if (this._rightAlign === undefined || !this._rightAlign) {
        this._tickFrame.setBounds(0, 0, 16, 16);
        this._tick.setBounds(1, 1, 14, 14);
        this._label.setBounds(this._tickFrame.getWidth() + Component.COMPONENT_X_GAP, 0, w - this._tickFrame._width - Component.COMPONENT_X_GAP - 5, 16);
    } else {
        this._tickFrame.setBounds(w - Component.COMPONENT_X_GAP - 16, 0, 16, 16);
        this._tick.setBounds(1, 1, 14, 14);
        this._label.setBounds(0, 0, this._tickFrame.getX() - Component.COMPONENT_X_GAP, 16);
    }
    Component.prototype.setBounds.call(this, x, y, w, h);
}
/**
 * @param {boolean} r
 */
Checkbox.prototype.setRightAlign = function(r) {
    this._rightAlign = r;
    this._label.setAlign(Label.ALIGN_RIGHT);
}
Checkbox.prototype.getChecked = function() {
     return this._tick._down;
}
/**
 * @param {boolean} newValue
 */
Checkbox.prototype.setChecked = function(newValue) {
    if (this._tick.getDown() === newValue) 
        return;
    this._tick.setDown(newValue);
    this._label.setDown(newValue);
}
/** @override */
Checkbox.prototype.onKeyUp = function(keyCode) {
    if (keyCode === KeyEvent.SPACE) {
        this._tick.setDown(!this._tick._down);
        this._tick.refresh();
        this._label.setDown(this._tick._down);
        this._label.refresh();
        this.notify(new ChartEvent(ChartEvent.CHECKBOX_CHANGED));
    }
}
/**
 * @param {ChartEvent} e
 */
Checkbox.prototype.onClick = function(e) {
    if (e._source === this._tick) {
        // update label
        this._label.setDown(this._tick._down);
        this._label.refresh();
    } else if (e._source === this._label) {
        // update tick
        this._tick.setDown(this._label._down);
        this._tick.refresh();
    }
    this.notify(new ChartEvent(ChartEvent.CHECKBOX_CHANGED));
}
/** @override */
Checkbox.prototype.onCustomEvent = function(e) {
    if (e._event === ChartEvent.BUTTON_CLICK)
        this.onClick(e);
}