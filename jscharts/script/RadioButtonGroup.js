/**
 * ----------------
 * RadioButtonGroup
 * ----------------
 * @constructor
 * @extends {Component}
 */
function RadioButtonGroup(id, delegate) {
    Component.call(this, id, delegate);
    this._rows = [];
    this._numRows = 0;
    this._rowTotalHeight = 21;
    this._selected = -1;
}
/**
 * Inheriting
 */
RadioButtonGroup.prototype = Object.create(Component.prototype);
RadioButtonGroup.prototype.constructor = RadioButtonGroup;
/**
 * @param {string} l
 */
RadioButtonGroup.prototype.addRow = function(l) {
    this.insert(l, this._numRows);
}
/**
 * @param {string} l
 * @param {number} pos
 */
RadioButtonGroup.prototype.insert = function(l, pos) {
    this._selected = -1;
    let rb = new RadioButton(this._id + "_rb" + this._numRows, this, false, l);
    rb.setBounds(0, 0, this._width - 20, 14);
    this._rows.splice(pos, 0, rb);
    this._numRows++;
    this.add(rb);
    this.updateView();
    this.setSize(this._width, (this._numRows * this._rowTotalHeight));
}
/**
 * @param {number} pos
 */
RadioButtonGroup.prototype.delete = function(pos) {
    this._selected = -1;
    this.remove(this._rows[pos]);
    this._rows.splice(pos, 1);
    this._numRows--;
    this.updateView();
    this.setSize(this._width, (this._numRows * this._rowTotalHeight));
}
RadioButtonGroup.prototype.clear = function() {
    for (let i = 0; i < this._numRows; i++) {
        this.remove(this._rows[i]);
    }
    this._rows = [];
    this._numRows = 0;
    this.setSize(this._width, 0);
}
RadioButtonGroup.prototype.updateView = function() {
    for (let idx = 0; idx < this._rows.length; idx++) {
        let rb = this._rows[idx];
        rb.setLocation(rb._x, (idx * this._rowTotalHeight));
    }
}
RadioButtonGroup.prototype.getSelected = function() {
    return this._selected;
}
/**
 * @param {number} i
 */
RadioButtonGroup.prototype.setSelected = function(i) {
    let allowDeselection = true;
    let ca;
    if (this._selected !== i) {
        if (this._selected !== -1) {
            ca = this._rows[this._selected];
            ca.setSelected(false);
        }
        this._selected = i;
        if (this._selected !== -1) {
            ca = this._rows[this._selected];
            ca.setSelected(true);
        }
    } else if (!allowDeselection) {
        ca = this._rows[this._selected];
        ca.setSelected(true);
    }
}
RadioButtonGroup.prototype.destroy = function() {
    this._rows = [];
}
/** @override */
RadioButtonGroup.prototype.onCustomEvent = function(e) {
    if (e._event === ChartEvent.RADIO_CHANGED) {
        for (let i = 0; i < this._numRows; i++) {
            let cur = this._rows[i];
            if (cur === e._source) {
                this.setSelected(i);
                this.refresh();
                break;
            }
        }
        return true;
    }
    return false;
}
RadioButtonGroup.prototype.draw = function(force) {
    Component.prototype.draw.call(this, force);
}