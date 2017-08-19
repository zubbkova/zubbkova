/**
 * @constructor
 * @extends {Component}
 * @param {Map} p - parameters
 * @param {string} id
 * @param {Component=} delegate
 */
function DrawingToolbar(p, id, delegate) {
    Component.call(this, id, delegate);
    this._params = p;
    if ((this._params.get("view").toString().toUpperCase() === "YOU") || (this._params.get("view").toString().toUpperCase() === "BR")) {
        this._showFiboExt = true;
    } else {
        this._showFiboExt = false;
    }
    DrawingObject.loadDescriptions();
    this._snapButton = new ImageButton(Style.getImage(Style.IMAGE_SNAP), this._id + "_snapButton", this, Language.getString("tooltip_snapmode"));
    this._snapButton.setSize(Component.TOOLBAR_BUTTON_SIZE, Component.TOOLBAR_BUTTON_SIZE);
    this._snapButton.setToggle(true);
    this._snapButton._down = false;
    this.add(this._snapButton);
    
    this._toolButtons = new Array(DrawingObject.NUM_TOOLS + 1);
    this._toolButtonsBar = new ToggleBar(this._id + "_toolButtons", this);
    this._toolButtonsBar.setButtonWidth(Component.TOOLBAR_BUTTON_SIZE);
    this.add(this._toolButtonsBar);
    
    this._toolButtons[0] = this._toolButtonsBar.addImageButton(Style.getImage(Style.IMAGE_DRAW_NONE), Language.getString("tooltip_snapmode"), true);
    this._toolButtons[0].setIndex(-1);
    for (let i = 1; i < DrawingObject.NUM_TOOLS + 1; i++) {
        this._toolButtons[i] = this._toolButtonsBar.addImageButton(Style.getImage(DrawingObject.icons[i - 1]), DrawingObject.descriptions[i - 1], false);
        this._toolButtons[i].setIndex(i - 1);
    }
    this._legendButton = new ImageButton(Style.getImage(Style.IMAGE_DRAW_LEGEND), this._id + "_legendButton", this, Language.getString("tooltip_legend"));
    this._legendButton.setIndex(DrawingObject.NUM_TOOLS + 1);
    this._legendButton.setToggle(true);
    this._legendButton.setDown(true);
    this._legendButton.hide();
    this.add(this._legendButton);
    this._hotTickerButton = new ImageButton(Style.getImage(Style.IMAGE_DRAW_TICKSCOPE), this._id + "_hotTickerButton", this, Language.getString("tooltip_tickscope"));
    this._hotTickerButton.setIndex(DrawingObject.NUM_TOOLS + 2);
    this._hotTickerButton.setToggle(true);
    this._hotTickerButton.hide();
    this.add(this._hotTickerButton);
    this._l2scopeButton = new ImageButton(Style.getImage(Style.IMAGE_DRAW_LEVEL2SCOPE), this._id + "_l2scopeButton", this, Language.getString("misctoolbar_Level2Scope"));
    this._l2scopeButton.setIndex(DrawingObject.NUM_TOOLS + 3);
    this._l2scopeButton.setToggle(true);
    this._l2scopeButton.hide();
    this.add(this._l2scopeButton);
    
    this._loadButton = new ImageButton(Style.getImage(Style.IMAGE_DRAW_LOAD), this._id + "_loadButton", this, Language.getString("tooltip_loadDrawingObjects"));
    this._loadButton.setIndex(DrawingObject.NUM_TOOLS + 4);
    this.add(this._loadButton);
    this._saveButton = new ImageButton(Style.getImage(Style.IMAGE_DRAW_SAVE), this._id + "_saveButton", this, Language.getString("tooltip_saveDrawingObjects"));
    this._saveButton.setIndex(DrawingObject.NUM_TOOLS + 5);
    this.add(this._saveButton);
    this._clearButton = new ImageButton(Style.getImage(Style.IMAGE_DRAW_CLR), this._id + "_clearButton", this, Language.getString("tooltip_clearDrawingObjects"));
    this._clearButton.setIndex(DrawingObject.NUM_TOOLS + 6);
    this.add(this._clearButton);
    if (this._showFiboExt) {
        this._fiboExtButton = new ImageButton(Style.getImage(Style.IMAGE_DRAW_FIB_EXT), this._id + "_fiboExtButton", this, Language.getString("drawingtools_FibonacciExtended"));
        this._fiboExtButton.setIndex(DrawingObject.NUM_TOOLS + 7);
        this._fiboExtButton.setToggle(true);
        this.add(this._fiboExtButton);
    }
};
/*
 * Inheriting
 */
DrawingToolbar.prototype = Object.create(Component.prototype);
DrawingToolbar.prototype.constructor = DrawingToolbar;
/** @override */
DrawingToolbar.prototype.onCustomEvent = function(e) {
    if (e._event !== ChartEvent.BUTTON_CLICK) 
        return Component.prototype.onCustomEvent.call(this, e);
    
    if (e._source === this._snapButton) {
        this._chart._snapOn = this._snapButton.getDown();
    } else if (e._source === this._toolButtons[0]) {
        this._chart.setDrawMode(Chart.MODE_NORMAL);
    } else if (e._source === this._legendButton) {
        for (let i = 0; i <= Chart.MAX_OVERLAYS; i++) {
            if (this._chart._canvas._overlays[i] && this._chart._canvas._overlays[i]._legend) {
                this._chart._canvas._overlays[i]._showLegend = this._legendButton.getDown();
            }
        }
    } else if (e._source === this._hotTickerButton) {
        this._chart.flipOpenTickScope();
    } else if(e._source === this._l2scopeButton) {
        this._chart.setLevel2Scope(this._l2scopeButton.getDown());
    } else if(e._source === this._loadButton) {
        this._parent.webLoadDrawingObjects();
    } else if (e._source === this._saveButton) {
        this._parent.webSaveDrawingObjects();
    } else if (e._source === this._clearButton) {
        this._chart._currentSymbol._drawObjects = [];
        this._chart.repaint();
        this._chart.process();
    } else if (e._source === this._fiboExtButton) {
        this._chart.setDrawMode(e._source.getIndex());
    } else {
        if (this._toolButtons[e._source.getIndex()].getDown()) {
            this._chart.setDrawMode(e._source.getIndex() - 1); // 0 - is snap mode
        } else {
            this._chart.setDrawMode(Chart.MODE_NORMAL);
        }
    }
    return true;
}
/** @override */
DrawingToolbar.prototype.setParent = function(parent) {
    Component.prototype.setParent.call(this, parent);
    this.setChart(this._parent._chart);
}
/**
 * @param {Chart} c
 */
DrawingToolbar.prototype.setChart = function(c) {
    this._chart = c;
    this._chart._drawbar = this;
}
/**
 * @param {boolean} vertical
 */
DrawingToolbar.prototype.setOrientation = function(vertical) {
    if (vertical) {
        let contentHeight = Component.TOOLBAR_BUTTON_SIZE + Component.COMPONENT_X_GAP + Component.TOOLBAR_BUTTON_SIZE * (DrawingObject.NUM_TOOLS + 1);
        this._snapButton.setLocation(0, Math.max((this.getHeight() - contentHeight) / 2, 0));
    } else {
        let contentWidth = Component.TOOLBAR_BUTTON_SIZE + Component.COMPONENT_X_GAP + Component.TOOLBAR_BUTTON_SIZE * (DrawingObject.NUM_TOOLS + 1);
        if (!this._parent.getNoFeed()) {
            contentWidth += Component.COMPONENT_X_GAP + Component.TOOLBAR_BUTTON_SIZE * 3;
        }
        contentWidth += Component.TOOLBAR_BUTTON_SIZE * 3;
        this._snapButton.setLocation(Math.max((this.getWidth() - contentWidth) / 2, 0), 0);
    }
    let xBase = vertical ? 0 : this._snapButton.getX() + this._snapButton.getWidth() + Component.COMPONENT_X_GAP;
    let yBase = vertical ? this._snapButton.getY() + this._snapButton.getHeight() + Component.COMPONENT_Y_GAP : 0;
    this._toolButtonsBar.setBounds(xBase, yBase, vertical ? Component.TOOLBAR_BUTTON_SIZE : ((DrawingObject.NUM_TOOLS + 1) * Component.TOOLBAR_BUTTON_SIZE), vertical ? ((DrawingObject.NUM_TOOLS + 1) * Component.TOOLBAR_BUTTON_SIZE) : Component.TOOLBAR_BUTTON_SIZE);
    
    if (!this._parent.getNoFeed()) {
        this._legendButton.show();
        this._hotTickerButton.show();
        this._l2scopeButton.show();
        if (vertical) {
            this._legendButton.rightOf(this._toolButtonsBar, 0, 0, Component.TOOLBAR_BUTTON_SIZE, Component.TOOLBAR_BUTTON_SIZE);
            this._hotTickerButton.bottomOf(this._legendButton, 0, 0, Component.TOOLBAR_BUTTON_SIZE, Component.TOOLBAR_BUTTON_SIZE);
            this._l2scopeButton.bottomOf(this._hotTickerButton, 0, 0, Component.TOOLBAR_BUTTON_SIZE, Component.TOOLBAR_BUTTON_SIZE);
        } else {
            this._legendButton.rightOf(this._toolButtonsBar, Component.COMPONENT_X_GAP, 0, Component.TOOLBAR_BUTTON_SIZE, Component.TOOLBAR_BUTTON_SIZE);
            this._hotTickerButton.rightOf(this._legendButton, 0, 0, Component.TOOLBAR_BUTTON_SIZE, Component.TOOLBAR_BUTTON_SIZE);
            this._l2scopeButton.rightOf(this._hotTickerButton, 0, 0, Component.TOOLBAR_BUTTON_SIZE, Component.TOOLBAR_BUTTON_SIZE);
        }
    }
    if (vertical) {
        if (this._showFiboExt) {
            this._fiboExtButton.rightOf(this._toolButtonsBar, 0, (Component.TOOLBAR_BUTTON_SIZE  * 11), Component.TOOLBAR_BUTTON_SIZE, Component.TOOLBAR_BUTTON_SIZE);
        }
        this._loadButton.rightOf(this._toolButtonsBar, 0, (Component.TOOLBAR_BUTTON_SIZE  * 16), Component.TOOLBAR_BUTTON_SIZE, Component.TOOLBAR_BUTTON_SIZE);
        this._saveButton.bottomOf(this._loadButton, 0, 0, Component.TOOLBAR_BUTTON_SIZE, Component.TOOLBAR_BUTTON_SIZE);
        this._clearButton.bottomOf(this._saveButton, 0, 0, Component.TOOLBAR_BUTTON_SIZE, Component.TOOLBAR_BUTTON_SIZE);
    } else {
        if (this._showFiboExt) {
            this._fiboExtButton.bottomOf(this._toolButtonsBar, (Component.TOOLBAR_BUTTON_SIZE  * 11), 0, Component.TOOLBAR_BUTTON_SIZE, Component.TOOLBAR_BUTTON_SIZE);
        }
        if (this._parent.getNoFeed()) {
            this._loadButton.rightOf(this._toolButtonsBar, Component.COMPONENT_X_GAP, 0, Component.TOOLBAR_BUTTON_SIZE, Component.TOOLBAR_BUTTON_SIZE);
            
        } else {
            this._loadButton.rightOf(this._l2scopeButton, 0, 0, Component.TOOLBAR_BUTTON_SIZE, Component.TOOLBAR_BUTTON_SIZE);
        }
        this._saveButton.rightOf(this._loadButton, 0, 0, Component.TOOLBAR_BUTTON_SIZE, Component.TOOLBAR_BUTTON_SIZE);
        this._clearButton.rightOf(this._saveButton, 0, 0, Component.TOOLBAR_BUTTON_SIZE, Component.TOOLBAR_BUTTON_SIZE);
    }
//    if (!this._chart.isValid()) {
//        this.hide();
//    }
}
/**
 * @param {number} mode
 */
DrawingToolbar.prototype.setDrawMode = function(mode) {
    mode++;
    for (let i = 0; i < DrawingObject.NUM_TOOLS + 1; i++) {
        this._toolButtons[i].setDown(mode === i);
        this._toolButtons[i].refresh();
    }
    if (this._showFiboExt) {
        this._fiboExtButton.setDown(mode === 27);
        this._fiboExtButton.refresh();
    }
}