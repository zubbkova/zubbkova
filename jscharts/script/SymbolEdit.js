/**
 * ----------
 * SymbolEdit
 * ----------
 * @constructor
 * @extends {Component}
 * @param {string} id
 * @param {Component=} delegate
 * @param {boolean=} isMain
 */
function SymbolEdit(id, delegate, isMain) {
    Component.call(this, id, delegate);
    this._isMain = isMain === undefined ? false : isMain;
    this._editBoxSize = 90;
    this._labelHeight = 20;
    this._defaultMessageAlign = false;
    this._symbols = [];
    this._activated = false;
    this._defaultMessage = Language.getString("symbol");
    this._singleLabel = new Label(this._id + "_label", this);
    this._singleLabel.setAlign(Label.ALIGN_RIGHT);
    this.add(this._singleLabel);
    this._editBox = new EditBox(this._id + "_edit", this);
//    this._editBox.setBorder(Component.BORDER_INSET);
    this.add(this._editBox);
    this._multiCombo = new ComboBox(this._id + "_combo", this);
    this.add(this._multiCombo);
    this.setSize(this._editBox.getX() + this._editBox.getWidth(), this._editBox.getHeight());
    this.clear();
}
/**
 * Inheriting
 */
SymbolEdit.prototype = Object.create(Component.prototype);
SymbolEdit.prototype.constructor = SymbolEdit;
SymbolEdit.prototype.clear = function() {
    this._singleLabel.setColor(Color.black);
    this._singleLabel.setText(this._defaultMessage);
    this._singleLabel.show();
    this._multiCombo.hide();
}
SymbolEdit.prototype.getSymbol = function() {
    return this._curSymbol;
}
/**
 * @param {ChartSymbol|String} s
 */
SymbolEdit.prototype.setSymbol = function(s) {
    if (s === undefined) {
        this._curSymbol = undefined;
        this._singleLabel.setColor(Color.black);
        this._singleLabel.setText(this._defaultMessage);
        this._singleLabel.setAlign(this._defaultMessageAlign ? Label.ALIGN_LEFT : Label.ALIGN_RIGHT);
        return;
    }
    if (s.constructor.name === "ChartSymbol") {
        if (this._curSymbol === undefined || s !== this._curSymbol) {
            this._curSymbol = s;
            this._singleLabel.setColor(Color.black);
            this._singleLabel.setText(this._curSymbol.getName());
            this._singleLabel.setTooltip(this._singleLabel._text);
            this._editBox.setText(this._curSymbol.getDisplaySymbol());
        }
        return;
    }
    if (s.length === 0) {
        this._curSymbol = undefined;
        this._singleLabel.setColor(Color.black);
        this._singleLabel.setText(this._defaultMessage);
        this._singleLabel.setAlign(this._defaultMessageAlign ? Label.ALIGN_LEFT : Label.ALIGN_RIGHT);
        return;
    }
    this._lastText = s;
    this._lastRequest = new SymbolRequest(this, s.toString());
    this._handleSymbolRequest(this._lastRequest);
}
SymbolEdit.prototype.getText = function() {
    return this._editBox.getText();
}
SymbolEdit.prototype.getLabel = function() {
    return this._singleLabel;
}
/** @override */
SymbolEdit.prototype.setBackground = function(c) {
    Component.prototype.setBackground.call(this, c);
    if (this._singleLabel) 
        this._singleLabel.setBackground(c);
}
/** @override */
SymbolEdit.prototype.setBounds = function(x, y, w, h) {
    Component.prototype.setBounds.call(this, x, y, w, h);
    this._editBox.setBounds(this.getWidth() - this._editBoxSize - 2, 2, this._editBoxSize, this._labelHeight);
    this._singleLabel.setBounds(2, 2, this.getWidth() - this._editBox.getWidth() - 2 - Component.COMPONENT_X_GAP, this._labelHeight);
    this._multiCombo.setBounds(2, 2, this._singleLabel.getWidth(), this._labelHeight);
}
/** @override */
SymbolEdit.prototype.onCustomEvent = function(e) {
    let processed = false;
//    if (e._event === ChartEvent.SYMBOL_REQUEST) {
//        this._handleSymbolRequest(e._data);
//        processed = true;
//    } else
        if (e._event === ChartEvent.EDIT_CHANGED) {
        processed = true;
        this.notify(e);
    } else if (e._event === ChartEvent.EDIT_ENTER) {
        this.updateSymbol(false, true);
        processed = true;
    } else if (e._event === ChartEvent.COMBO_SELECT) {
        let i = this._multiCombo.getIndex();
        if (i < this._symbols.length) {
            this._curSymbol = this._symbols[i];
            this._editBox.setText(this._symbols[i].getDisplaySymbol());
        }
        this.updateSymbol(false, true);
        processed = true;
    }
    return processed || Component.prototype.onCustomEvent.call(this, e);
}
SymbolEdit.prototype.activate = function() {
    if (this._parent) {
        this._editBox.focus();
        this._editBox.refresh();
        this._activated = true;
    }
}
/**
 * @param {boolean} on
 */
SymbolEdit.prototype.setComponentHighlight = function(on) {
    this._editBox.setErrorState(on);
    this._editBox.refresh();
}
SymbolEdit.prototype.isValidSymbol = function() {
    return this._curSymbol;
}
/** @override */
SymbolEdit.prototype.process = function(t) {
    if (!this._activated) {
        this.activate();
    }
    return false;
}
/**
 * @param {boolean} f
 * @param {boolean=} w
 */
SymbolEdit.prototype.updateSymbol = function(f, w) {
    let force = f === undefined ? false : f;
    let withEvent = w === undefined ? false : w;
    let text = this._editBox.getText();
    if (text.length === 0) {
        // overlays - just clean
        if (!this._isMain) {
            this._curSymbol = undefined;
            this._singleLabel.show();
            this._multiCombo.hide();
            this._singleLabel.setColor(Color.black);
            this._singleLabel.setText(this._defaultMessage);
            this._singleLabel.setAlign(this._defaultMessageAlign ? Label.ALIGN_LEFT : Label.ALIGN_RIGHT);
            if (withEvent) {
                this.notify(new ChartEvent(ChartEvent.SYMBOL_SELECT));
            }
        } else {
            // main symbol - error state
            this.setComponentHighlight(true);
        }
        return;
    }
    if (force || this._lastText === undefined || (text.toUpperCase() !== this._lastText.toUpperCase())) {
        this._lastText = text;
        this._lastRequest = new SymbolRequest(this, text);
        this._handleSymbolRequest(this._lastRequest);
    }
}
SymbolEdit.prototype._invalidSymbol = function() {
    this._singleLabel.setColor(new Color(220, 77, 77));
    this._singleLabel.setText(Language.getString("invalid_symbol"));
    this._singleLabel.show();
    this._multiCombo.hide();
    this._editBox.setText("");
    this._editBox.setErrorState(true);
    this._curSymbol = undefined;
    this.refresh();
}
/**
 * @param {SymbolRequest} request
 */
SymbolEdit.prototype._handleSymbolRequest = function(request) {
    let result = request.getResult();
    if (result === undefined) {
        this._invalidSymbol();
        return; 
    }
    this._symbols = result.getSymbols();
    if (this._symbols === undefined || this._symbols.length === 0) {
        this._invalidSymbol();
        return;
    }
    if (this._symbols.length === 1) {
        this._singleLabel.setColor(Color.black);
        this._singleLabel.setText(this._symbols[0].getName());
        this._singleLabel.setTooltip(this._singleLabel._text);
        this._singleLabel.show();
        this._multiCombo.hide();
    } else {
        this._multiCombo.clear();
        for (let item of this._symbols) {
            this._multiCombo.addItem(item.getName() + ' (' + item.getDisplayMarket() + ')');
        }
        this._multiCombo.setIndex(0);
        this._singleLabel.hide();
        this._multiCombo.show();
    }
    this._curSymbol = this._symbols[0];
    this._editBox.setText(this._symbols[0].getDisplaySymbol());
    this.refresh();
    this.notify(new ChartEvent(ChartEvent.SYMBOL_SELECT));
}