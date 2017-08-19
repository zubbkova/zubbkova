/**
 * --------
 * ComboBox
 * --------
 * @constructor 
 * @extends {Button}
 * @param {string} id - ID of div
 * @param {Component=} delegate
 */
function ComboBox(id, delegate) {
    Button.call(this, id, delegate);
    this.setAlign(Label.ALIGN_LEFT);
    this.setLeftMargin(Style.DEFAULT_FONT.getSize() / 2);
    this.setColors(new Color("#ffffff"), new Color("#ededed"), new Color("#f5f5f5"), new Color("#cccccc"), Color.black, Color.white);    
    
    var self = this;
    
    this._listFrame = new Component(this._id + "_combo_frame", this);
    this._listFrame._overflowAuto = true;
    this._listFrame.setRoundedCorners(2);
    this._listFrame.setBorder(Component.BORDER_FLOAT);
    this._listFrame.setZ(1000);
    this._listFrame.hide();
    this.add(this._listFrame);
    
    this._list = new List(this._id + "_combo_list", this);
    this._list.setMargin(4, 4, 4, 4);
    this._list.setBackground("white");
    this._list.setRoundedCorners(2);
    this._list.setBounds(0, 0, 8, 8);
    this._list.onClick = function(row) { return self._listClick(row); }
    this._list.onLostFocus = function() { self._cbLostFocus(); }
    
    this._image = new UIImage(Main.getImagesURL() + "elevator.png", this._id + "_listImage");
    this.add(this._image);

    this._value = [];
    this._curIndex = 0;
    
    this._listFrame.add(this._list);
}
/**
 * Inheriting
 */
ComboBox.prototype = Object.create(Button.prototype);
ComboBox.prototype.constructor = ComboBox;
ComboBox.prototype.clear = function() {
    this._curIndex = 0;
    this.setText("");
    this._value = [];
    this._list.clear();
    this.refresh();
}
/**
 * @param {string} item
 * @param {string=} value
 */
ComboBox.prototype.addItem = function(item, value) {
	var l = this._list.getNumRows();
	if (l === 0) {
		this._curIndex = 0;
		this.setText(item);
	}
    if (value === undefined) {
        this._value[l] = item;    
    } else {
        this._value[l] = value;
    }
    this._list.addRow([item]);
}
/**
 * @param {number} id
 */
ComboBox.prototype.removeItem = function(id) {
    this._list.removeRow(id);
    this._value.splice(id, 1);
}
/**
 * @param {number} index
 */
ComboBox.prototype.setIndex = function(index) {
	this._curIndex = index;
    this.setText(this._list.getRow(index)[0]);
}
ComboBox.prototype.getIndex = function() {
	return this._curIndex;
}
ComboBox.prototype.getValue = function() {
	return this._value[this._curIndex];
}
/** @override */
ComboBox.prototype.setBounds = function(x, y, width, height) {
    if (Button.prototype.setBounds.call(this, x, y, width, height)) {
    	var h = this._height / 2.5;
    	var s = h / 72;
    	var ws = 48 * s;
        this._image.setBounds(this._width-(ws*2),Math.floor(this._height-h)/2.1,ws,h);
    	this._resizeList();
    }
}
/** @override */
ComboBox.prototype.setParent = function(parent) {
    Button.prototype.setParent.call(this, parent);
}
ComboBox.prototype.size = function() {
    return this._list.getNumRows();
}
/**
 * @param {number} id
 */
ComboBox.prototype.getListRow = function(id) {
    return this._list.getRow(id);
}
/**
 * @param {number} id
 * @param {string} text
 */
ComboBox.prototype.updateText = function(id, text) {
    this._list.updateRow(id, 0, text);
}
/** @override */
ComboBox.prototype.onKeyDown = function(keyCode) {
    if (!this._focus)
        return
    if (keyCode === KeyEvent.ENTER || keyCode === KeyEvent.SPACE) {
        this.onMouseDown();
    }
}
/** @override */
ComboBox.prototype.onKeyUp = function(keyCode) {
    if (!this._focus)
        return
    if (keyCode === KeyEvent.ENTER || keyCode === KeyEvent.SPACE) {
        if (this._listFrame._shown) {
            this._listClick(this._hoverIndex);
        } else
            return this.onMouseUp();
    }
    if (keyCode === KeyEvent.ESCAPE) {
        this._listFrame.hide();
        this._listFrame.refresh();
        RootComponent.cancelPopup();
        this._enableAnotherCombo();
    }
    if (this._listFrame._shown) {
        if (keyCode === KeyEvent.UP) {
            this._hoverIndex--;
            if (this._hoverIndex < 0) 
                this._hoverIndex = this._list.getNumRows() - 1;
        } else if (keyCode === KeyEvent.DOWN) {
            this._hoverIndex++;
            if (this._hoverIndex >= this._list.getNumRows()) 
                this._hoverIndex = 0;
        }
        this._list.setIndex(this._hoverIndex);
        this._list.refresh();
    }
    if (keyCode === KeyEvent.DOWN)
        return this.onMouseUp();
}
/** @private */
ComboBox.prototype._enableAnotherCombo = function() {
    let self = this;
    setTimeout(function(){
        for (let i = 0; i < self._parent._child.length; i++) {
            if (self._parent._child[i].constructor.name === "ComboBox") {
                self._parent._child[i].setEnabled(true);
            }
        }
        self._parent.refresh();
    }, 50);
}
/**
 * @param {number} index
 * @param {string} value
 */
ComboBox.prototype.onSelect = function(index, value) {
    this._enableAnotherCombo();
    this.notify(new ChartEvent(ChartEvent.COMBO_SELECT));
}
/** @override */
ComboBox.prototype.onClick = function() {
	this._resizeList();
    this._list.setIndex(this._curIndex);
    this._hoverIndex = this._curIndex;
    this._listFrame.show();
    for (let i = 0; i < this._parent._child.length; i++) {
        if (this._parent._child[i].constructor.name === "ComboBox") {
            this._parent._child[i].setEnabled(false);
        }
    }
    this._parent.refresh();
    RootComponent.enablePopup(this._list);
}
/** @private */
ComboBox.prototype._resizeList = function() {
	let fs = Style.DEFAULT_FONT.getSize();
	let l = this._list.getNumRows();
    let maxWidth = this._width + 4;
    for (let i = 0; i < l; i++) {
        let textW = this._list.getRow(i)[0].length * fs * 0.5;
        if (textW > maxWidth)
            maxWidth = textW;
    }
    this._listFrame.setBounds(-2, -2, maxWidth, Math.min(10, l) * fs * 2);
	this._list.setBounds(0, 0, this._listFrame._width, l * fs * 2);
}
/** @private */
ComboBox.prototype._cbLostFocus = function() {
    if (this._list) {
        this._listFrame.hide();
        let self = this;
        setTimeout(function(){
            for (let i = 0; i < self._parent._child.length; i++) {
                if (self._parent._child[i].constructor.name === "ComboBox") {
                    self._parent._child[i].setEnabled(true);
                }
            }
            self._parent.refresh();
        }, 15);
    }
}
/** 
 * @private
 * @param {number} row
 */
ComboBox.prototype._listClick = function(row) {
    if (this._list._rows[row]._enabled !== undefined && !this._list._rows[row]._enabled)
        return;
	this._curIndex = parseInt(row, 10);	
    this._listFrame.hide();
    RootComponent.cancelPopup();
    this.setText(this._list.getRow(this._curIndex)[0]);
    this.refresh();
    this.onSelect(this._curIndex, this._value[row]);
    return true;
}