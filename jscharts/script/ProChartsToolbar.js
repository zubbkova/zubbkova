/* global Component, ImageButton, Style, Language, ComboBox, Button, ChartEvent, RootComponent */
/**
 * ----------------
 * ProChartsToolbar
 * ----------------
 * @constructor
 * @extends {Component}
 * @param {string} id
 * @param {Component=} delegate
 */
function ProChartsToolbar(id, delegate) {
    Component.call(this, id, delegate);
    this._symbolSetCombo = new ComboBox(this._id + "_combo", this);
    this._symbolSetCombo.setBounds(0, 2, 300, 20);
    this._goToFirst = new ImageButton(Style.getImage(Style.IMAGE_SYMBOLS_FIRST), this._id + "_goToFirst", this,  Language.getString("procharts_firstchart"));
    this._goToFirst.rightOf(this._symbolSetCombo, Component.COMPONENT_X_GAP, 0, Component.TOOLBAR_BUTTON_SIZE, Component.TOOLBAR_BUTTON_SIZE);
    this.add(this._goToFirst);
    this._goPrevious = new ImageButton(Style.getImage(Style.IMAGE_SYMBOLS_PREVIOUS), this._id + "_goPrevious", this, Language.getString("misctoolbar_previousChart"));
    this._goPrevious.rightOf(this._goToFirst, 0, 0, Component.TOOLBAR_BUTTON_SIZE, Component.TOOLBAR_BUTTON_SIZE);
    this.add(this._goPrevious);
    this._goNext = new ImageButton(Style.getImage(Style.IMAGE_SYMBOLS_NEXT), this._id + "_goNext", this, Language.getString("misctoolbar_nextChart"));
    this._goNext.rightOf(this._goPrevious, Component.COMPONENT_X_GAP, 0, Component.TOOLBAR_BUTTON_SIZE, Component.TOOLBAR_BUTTON_SIZE);
    this.add(this._goNext);
    this._goToLast = new ImageButton(Style.getImage(Style.IMAGE_SYMBOLS_LAST), this._id + "_goToLast", this, Language.getString("procharts_lastchart"));
    this._goToLast.rightOf(this._goNext, 0, 0, Component.TOOLBAR_BUTTON_SIZE, Component.TOOLBAR_BUTTON_SIZE); 
    this.add(this._goToLast);
    this._sync = new Button(this._id + "_sync", this);
    this._sync.setText(Language.getString("selecttoolbar_syncAll"));
    this._sync.setToggle(true);
    this.add(this._sync);
    this._newChart = new Button(this._id + "_newChart", this);
    this._newChart.setText(Language.getString("procharts_newchart"));
    this.add(this._newChart);
    this._closeChart = new Button(this._id + "_closeChart", this);
    this._closeChart.setText(Language.getString("procharts_closechart"));
    this.add(this._closeChart);
    this.add(this._symbolSetCombo);
}
/**
 * Inheriting
 */
ProChartsToolbar.prototype = Object.create(Component.prototype);
ProChartsToolbar.prototype.constructor = ProChartsToolbar;
/** @override */
ProChartsToolbar.prototype.setBounds = function(x, y, w, h) {
    Component.prototype.setBounds.call(this, x, y, w, h);
    this._closeChart.setBounds(this.getWidth() - 80, 2, 80, 20);
    this._newChart.setBounds(this._closeChart.getX() - 75, 2, 75, 20);
    this._sync.setBounds(this._newChart.getX() - 60, 2, 60, 20);
}
/**
 * @param {string} text
 * @param {boolean} goTo
 */
ProChartsToolbar.prototype.addNewSymbolSet = function(text, goTo) {
    this._symbolSetCombo.addItem(text);
    if (goTo) {
        this._symbolSetCombo.setIndex(this._symbolSetCombo.size() - 1);
    }
}
/**
 * @param {string} text
 * @param {number} index
 */
ProChartsToolbar.prototype.updateText = function(text, index) {
    this._symbolSetCombo.updateText(index, text);
}
/**
 * @param {number} index
 */
ProChartsToolbar.prototype.removeSymbolSet = function(index) {
    this._symbolSetCombo.removeItem(index);
}
/**
 * @param {number} index
 */
ProChartsToolbar.prototype.setCurrentSymbolSet = function(index) {
    this._symbolSetCombo.setIndex(index);
    this._symbolSetCombo.refresh();
}
/** @override */
ProChartsToolbar.prototype.onCustomEvent = function(e) {
    var processed = false;
    switch (e._event) {
        case ChartEvent.COMBO_SELECT:
            this._parent.setCurrentSymbolSet(this._symbolSetCombo.getIndex());
            processed = true;
            break;
        case ChartEvent.BUTTON_CLICK:
            if (e._source === this._newChart) {
                RootComponent.releaseMouse(this._newChart);
                this._parent.addSymbolSet();
            } else if (e._source === this._closeChart) {
                RootComponent.releaseMouse(this._closeChart);
                this._parent.deleteSymbolSet();
            } else if (e._source === this._sync) {
                RootComponent.releaseMouse(this._sync);
                this._parent.setSyncedSymbolSets(this._sync._down);
            } else if (e._source === this._goToFirst) {
                if (this._symbolSetCombo.getIndex() > 0) {
                    this._parent.setCurrentSymbolSet(0);
                }
            } else if (e._source === this._goPrevious) {
                if (this._symbolSetCombo.getIndex() > 0) {
                    this._parent.setCurrentSymbolSet(this._parent.getCurrentSymbolsIndex() - 1);
                }
            } else if (e._source === this._goNext) {
                if (this._symbolSetCombo.getIndex() < this._symbolSetCombo.size() - 1) {
                    this._parent.setCurrentSymbolSet(this._parent.getCurrentSymbolsIndex() + 1);
                }
            } else if (e._source === this._goToLast) {
                if (this._symbolSetCombo.getIndex() < this._symbolSetCombo.size() - 1) {
                    this._parent.setCurrentSymbolSet(this._parent._symbolSets.length - 1);
                }
            }
            processed = true;
            break;
    }
    return processed;
}