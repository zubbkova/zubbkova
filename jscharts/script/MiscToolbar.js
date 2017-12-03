/* global Component, Language, ColorButton, ThicknessButton, ToggleBar, Style, Utils, ImageButton, ChartEvent, Color */
/**
 * -----------
 * MiscToolbar
 * -----------
 * @constructor
 * @extends {Component}
 * @param {Object} p - parameters
 * @param {string} id
 * @param {Component=} delegate
 */
function MiscToolbar(p, id, delegate) {
    Component.call(this, id, delegate);
    this._params = p;
    var i;
    for (i = 0; i < MiscToolbar.colourNames.length; i++) {
        MiscToolbar.colourNames[i] = Language.getString("misctoolbar_colour" + i);
    }
    for (i = 0; i < MiscToolbar.styleNames.length; i++) {
        MiscToolbar.styleNames[i] = Language.getString("misctoolbar_style" + i);
    }
    for (i = 0; i < MiscToolbar.thicknessNames.length; i++) {
        MiscToolbar.thicknessNames[i] = Language.getString("misctoolbar_thickness" + i);
    }
    this._colourButtons = new Array(MiscToolbar.colourList.length);
    for (i = 0; i < MiscToolbar.colourList.length; i++) {
        this._colourButtons[i] = new ColorButton(MiscToolbar.colourList[i], this._id + "_colorButton" + i, this, MiscToolbar.colourNames[i]);
        this._colourButtons[i].setIndex(i);
        this.add(this._colourButtons[i]);
    }
    var numThickness = 4;
    this._thicknessButtons = new Array(numThickness);
    for (i = 0; i < numThickness; i++) {
        this._thicknessButtons[i] = new ThicknessButton(i + 1, this._id + "_thicknessButton" + i, this, MiscToolbar.thicknessNames[i]);
        this._thicknessButtons[i].setIndex(MiscToolbar.colourList.length + i);
        this.add(this._thicknessButtons[i]);
    }
    this._styleButtonContainer = new ToggleBar(this._id + "_styleButtonContainer", this);
    this.add(this._styleButtonContainer);
    this._styleButtonContainer.setButtonWidth(Component.TOOLBAR_BUTTON_SIZE);
    this._styleButtons = new Array(MiscToolbar.styleNames.length);
    for (i = 0; i < MiscToolbar.styleNames.length; i++) {
        this._styleButtons[i] = this._styleButtonContainer.addImageButton(Style.getImage(Style.IMAGE_STYLE_LINE + i), MiscToolbar.styleNames[i], i === 0);
        this._styleButtons[i].setIndex(100 + i);
    }
    if (Utils.hasFeature(this._params, "EQUI_D")) {
        this._showChange = new ImageButton(Style.getImage(Style.IMAGE_SHOW_CHANGES), this._id + "_showCgangeButton", this, "Show Percentage Changes");
        this._showChange.setToggle(true);
        this.add(this._showChange);
    }
    this._yestClose = new ImageButton(Style.getImage(Style.IMAGE_SHOW_YC), this._id + "_yestCloseButton", this, Language.getString("misctoolbar_showYC"));
    this._yestClose.setToggle(true);
    this.add(this._yestClose);
    this._zoomReset = new ImageButton(Style.getImage(Style.IMAGE_ZOOM_RESET), this._id + "_zoomResetButton", this, Language.getString("misctoolbar_resetZoom"));
    this.add(this._zoomReset);
    this._zoomIn = new ImageButton(Style.getImage(Style.IMAGE_ZOOM_IN), this._id + "_zoomInButton", this, Language.getString("misctoolbar_zoomIn"));
    this.add(this._zoomIn);
    this._zoomOut = new ImageButton(Style.getImage(Style.IMAGE_ZOOM_OUT), this._id + "_zoomOutButton", this, Language.getString("misctoolbar_zoomOut"));
    this.add(this._zoomOut);
    this._printChart = new ImageButton(Style.getImage(Style.IMAGE_PRINT), this._id + "_printChart", this, Language.getString("misctoolbar_printChart"));
    this.add(this._printChart);
    this._screenshot = new ImageButton(Style.getImage(Style.IMAGE_SCREENSHOT), this._id + "_screenshotButton", this, Language.getString("misctoolbar_screenshot"));
    this.add(this._screenshot);
}
/*
 * Inheriting
 */
MiscToolbar.prototype = Object.create(Component.prototype);
MiscToolbar.prototype.constructor = MiscToolbar;
/** @override */
MiscToolbar.prototype.setParent = function(parent) {
    Component.prototype.setParent.call(this, parent);
    this.setChart(this._parent._chart);
}
/**
 * @param {Chart} c
 */
MiscToolbar.prototype.setChart = function(c) {
    this._chart = c;
    this._chart._miscbar = this;
}
/** @override */
MiscToolbar.prototype.setBounds = function(x, y, w, h) {
    Component.prototype.setBounds.call(this, x, y, w, h);
    var i;
    var leftX = this.getWidth() / 2 - Component.COMPONENT_X_GAP * 4;
    for (i = this._thicknessButtons.length - 1; i >= 0 ; i--) {
        this._thicknessButtons[i].setLocation(leftX - this._thicknessButtons[i].getWidth(), (this.getHeight() - this._thicknessButtons[i].getHeight()) / 2);
        leftX = this._thicknessButtons[i].getX();
    }
    leftX -= Component.COMPONENT_X_GAP * 2;
    for (i = MiscToolbar.colourList.length - 1; i >= 0 ; i--) {
        this._colourButtons[i].setLocation(leftX - this._colourButtons[i].getWidth(), (this.getHeight() - this._colourButtons[i].getHeight()) / 2);
        leftX = this._colourButtons[i].getX();
    }
    
    this._styleButtonContainer.setBounds(this.getWidth() / 2 + Component.COMPONENT_X_GAP * 1, (this.getHeight() - Component.TOOLBAR_BUTTON_SIZE) / 2, Component.TOOLBAR_BUTTON_SIZE * MiscToolbar.styleNames.length, Component.TOOLBAR_BUTTON_SIZE);
    
    if (Utils.hasFeature(this._params, "EQUI_D")) {
        this._showChange.rightOf(this._styleButtonContainer, Component.COMPONENT_X_GAP, 1, Component.TOOLBAR_BUTTON_SIZE, Component.TOOLBAR_BUTTON_SIZE);
        this._yestClose.rightOf(this._showChange, 0, 0, Component.TOOLBAR_BUTTON_SIZE, Component.TOOLBAR_BUTTON_SIZE);
    } else {
        this._yestClose.rightOf(this._styleButtonContainer, Component.COMPONENT_X_GAP, 1, Component.TOOLBAR_BUTTON_SIZE, Component.TOOLBAR_BUTTON_SIZE);
    }
    
    this._zoomReset.rightOf(this._yestClose, 0, 0, Component.TOOLBAR_BUTTON_SIZE, Component.TOOLBAR_BUTTON_SIZE);
    this._zoomIn.rightOf(this._zoomReset, 0, 0, Component.TOOLBAR_BUTTON_SIZE, Component.TOOLBAR_BUTTON_SIZE);
    this._zoomOut.rightOf(this._zoomIn, 0, 0, Component.TOOLBAR_BUTTON_SIZE, Component.TOOLBAR_BUTTON_SIZE);
    this._printChart.rightOf(this._zoomOut, 0, 0, Component.TOOLBAR_BUTTON_SIZE, Component.TOOLBAR_BUTTON_SIZE);
    this._screenshot.rightOf(this._printChart, 0, 0, Component.TOOLBAR_BUTTON_SIZE, Component.TOOLBAR_BUTTON_SIZE);
}
/**
 * @param {number} style
 */
MiscToolbar.prototype.setChartLineStyle = function(style) {
    for (var i = 0; i < this._styleButtons.length; i++) {
        this._styleButtons[i].setDown(i === style);
        this._styleButtons[i].refresh();
    }
    if (this._chart) {
        this._chart.setStockStyle(style);
    }
    this._parent.process();
}
MiscToolbar.prototype.getStyle = function() {
    for (var i = 0; i < this._styleButtons.length; i++) {
        if (this._styleButtons[i].getDown()) 
            return i;
    }
    return 0;
}
/**
 * @param {boolean} active
 */
MiscToolbar.prototype.setActive = function(active) {
    var i;
    for (i = 0; i < MiscToolbar.colourList.length; i++) {
        this._colourButtons[i].setVisible(active);
    }
    this._styleButtonContainer.setVisible(active);
    for (i = 0; i < this._thicknessButtons.length; i++) {
        this._thicknessButtons[i].setVisible(active);
    }
    if (this._showChange) {
        this._showChange.setVisible(active);
    }
    this._yestClose.setVisible(active);
    this._zoomReset.setVisible(active);
    this._zoomIn.setVisible(active);
    this._zoomOut.setVisible(active);
    this._screenshot.setVisible(active);
    this._printChart.setVisible(active);
}
/** 
 * @param {Object} p
 * @param {boolean} transparent
 */
MiscToolbar.prototype.initialiseState = function(p, transparent) {
    this._params = p;
    this._colourButtons[0].setSelected(true);
    this._thicknessButtons[0].setSelected(true);
    
    if (this._params.hasOwnProperty("style") && this._params["style"] !== undefined) {
        this.setChartLineStyle(parseInt(this._params["style"], 10));
    } else if (!transparent) {
        this.setChartLineStyle(0);
    }
    if (this._params.hasOwnProperty("yc") && this._params["yc"] !== undefined) {
        this._yestClose.setDown(this._params["yc"].toString() === "1");
        this._chart.setShowYestClose(this._yestClose.getDown());
    } else if (!transparent) {
        this._yestClose.setDown(false);
        this._chart.setShowYestClose(this._yestClose.getDown());
    }
    if (this._params.hasOwnProperty("drawingThickness") || this._params["drawingThickness"] !== undefined) {
        var t = parseInt(this._params["drawingThickness"], 10);
        this.resetThickness(t - 1);
    }
    if (this._params.hasOwnProperty("objectColour") && this._params["objectColour"] !== undefined) {
        var colourParam = this._params["objectColour"];
        for (var i = 0; i < MiscToolbar.colourList.length; i ++) {
            if (MiscToolbar.colourList[i].getHex() === colourParam) {
                this.resetColours(i);
            }
        }
    }
    this.refresh();
}
/** @override */
MiscToolbar.prototype.onCustomEvent = function(event) {
    var processed = false;
    var id = this.getIndex();
    if (event._event === ChartEvent.BUTTON_CLICK) {
        id = event._source.getIndex();
        if (event._source === this._yestClose) {
            this._chart.setShowYestClose(this._yestClose.getDown());
        } else if (event._source === this._zoomReset) {
            this._chart._currentSymbol.setNumTimeUnits(this._chart._currentSymbol._initialNumTimeUnits);
            this._parent.doSync();
            this._chart.repaint();
            this._parent.process();
        } else if (event._source === this._zoomIn) {
            this._chart._currentSymbol.setNumTimeUnits(parseInt(this._chart._currentSymbol._numTimeUnits / 2, 10));
            if (this._chart._currentSymbol._timeEnd > this._chart._currentSymbol._time) {
                this._chart._currentSymbol.setTimeEnd(this._chart._currentSymbol._time);
            }
            this._parent.doSync();
            this._chart.repaint();
            this._parent.process();
        } else if (event._source === this._zoomOut) {
            this._chart._currentSymbol.setNumTimeUnits(parseInt(this._chart._currentSymbol._numTimeUnits * 2, 10));
            this._parent.doSync();
            this._chart.repaint();
            this._parent.process();
        } else if (event._source === this._printChart) {
            var w = window.open('', '_blank', 'width=700,height=400');
            w.document.write('<html><body onload="window.print()"><img src="' + this._chart._canvas._canvas[0].toDataURL("image/png") + '"/></body></html>');
            w.document.close();
        } else if (event._source === this._showChange) {
            this._parent._currentSymbol.setShowChange(this._showChange.getDown(), false);
        } else if (event._source === this._styleButtonContainer) {
            this.setChartLineStyle(id);
        } else if (event._source === this._screenshot) {
            this._parent.saveScreenshot();
        } else if (id < this._colourButtons.length) {
            this.resetColours(id);
            if (typeof this._chart._objectSelected !== 'undefined' && this._chart._objectSelected !== -1) {
                this._chart._currentSymbol._drawObjects[this._chart._objectSelected]._colour = MiscToolbar.colourList[id];
            } else {
                this._chart._objectColour = MiscToolbar.colourList[id];
            }
            this._chart._selectedColour = MiscToolbar.colourList[id];
            this._chart.repaint();
            this._parent.process();
        } else {
            var which = id - this._colourButtons.length;
            this.resetThickness(which);
            if (typeof this._chart._objectSelected !== 'undefined' && this._chart._objectSelected !== -1) {
                this._chart._currentSymbol._drawObjects[this._chart._objectSelected]._thickness = which + 1;
            } else {
                this._chart._drawingThickness = which + 1;
            }
            this._chart.repaint();
            this._parent.process();
        }
        processed = true;
    }
    return processed;
}
/**
 * @param {number} skip
 */
MiscToolbar.prototype.resetColours = function(skip) {
    for (var i = 0; i < 13; i++) {
        this._colourButtons[i].setSelected(i === skip);
        this._colourButtons[i].refresh();
    }
}
/**
 * @param {number} skip
 */
MiscToolbar.prototype.resetThickness = function(skip) {
    for (var i = 0; i < 4; i++) {
        this._thicknessButtons[i].setSelected(i === skip);
        this._thicknessButtons[i].refresh();
    }
}
/** @static */
MiscToolbar.colourList = [Color.black, Color.white, Color.yellow, Color.blue, Color.cyan, Color.darkGray, Color.gray, Color.brightGreen, Color.lightGray, Color.magenta, Color.orange, Color.pink, Color.red];
/** @static */
MiscToolbar.colourNames = new Array(13);
/** @static */
MiscToolbar.styleNames = new Array(9);
/** @static */
MiscToolbar.thicknessNames = new Array(4);