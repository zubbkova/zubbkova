/* global Component, Style, RootComponent, Color, TradeSignals, DecimalFormat, Cursor, StudyFactory, Legend, Overlay, StudyLevel2Histogram, Language, Calendar, Main, MiscToolbar, ChartCanvas, Label, HotTickerFrame, XTIterator, LabelIterator, NumberFormatter, Point, Utils, DrawingObject, KeyEvent, ChartEvent */
/**
 * -----
 * Chart
 * -----
 * @constructor
 * @extends {Component}
 * @param {string} id - ID of div
 * @param {Component=} delegate
 */
function Chart(id, delegate) {
    Component.call(this, id, delegate);
    this._lineSize = Math.floor(Style.DEFAULT_FONT.getSize() * 2);
    this._currentTime = RootComponent.getTimestamp();
    
    this._showScales = true;
    this._showPriceLabel = true;
    this._showTitle = false;
    
    this._drawingThickness = 1;
    this._objectColour = Color.black;
    this._mode = Chart.MODE_NORMAL;
    this._studylist = new Array(Chart.MAX_STUDIES);
    for (var i = 0; i < Chart.MAX_STUDIES; i++) {
        this._studylist[i] = new Chart_Dropdown();
    }
    this._recalcStudies = false;
    this._showYestClose = true;
    
    this._drawX = 0;
    this._drawY = 0;
    this._drawWidth = 0;
    this._drawHeight = 0;
    
    this._curTooltip = Chart.T_NONE;
    this._tickScopeOpen = false;
    this._snapOn = false;
    this._mouseArea = 0;
    
    this._mouseDownArea = 0;
    this._mouseAreaType = 0;
    this._lineStartArea = -1;
    this._drawingNow = false;
    this._xSFWidth = 0;
    this._timeOfLastClick = 0;
    
    this._signals = new TradeSignals(this);
    
    this._priceDf = new DecimalFormat();
    this._priceDf.setMinimumIntegerDigits(2);
    this._priceDf.setMinimumFractionDigits(2);
    this._priceDf.setMaximumFractionDigits(5);
    this._priceDf.setGroupingUsed(false);
    this._percentDf = new DecimalFormat();
    this._percentDf.setMinimumIntegerDigits(2);
    this._percentDf.setMinimumFractionDigits(2);
    this._percentDf.setMaximumFractionDigits(2);
    this._percentDf.setGroupingUsed(false);
}
/*
 * Inheriting
 */
Chart.prototype = Object.create(Component.prototype);
Chart.prototype.constructor = Chart;
/** @override */
Chart.prototype.setParent = function(parent) {
    Component.prototype.setParent.call(this, parent);
    this._toolbar = this._parent._toolbar;
}
Chart.prototype.setRecalcStudies = function() {
    this._recalcStudies = true;
}
/**
 * @param {boolean} on
 */
Chart.prototype.setAutoScale = function(on) {
    if (!this._canvas)
        return;
    if (arguments.length === 0) {
        for (var i = 1; i <= Chart.MAX_STUDIES; i++) {
            if (this._canvas._overlays[i]) {
                this._canvas._overlays[i]._autoScale = true;
            }
        }
        return;
    }
    if (this._currentSymbol) {
        this._currentSymbol._autoScale = on;
    }
    if (this._mainOverlay) {
        this._mainOverlay._autoScale = on;
    }
    if (this._toolbar) {
        this._toolbar._autoScaleCheckbox.setChecked(on);
        this._toolbar._autoScaleCheckbox.refresh();
    }
    this.repaint();
    this.process();
}
/**
 * @param {number} m
 */
Chart.prototype.setDrawMode = function(m) {
    if (this._mode === m) 
        return;
    this._mode = m;
    this.setCursor(this._mode === Chart.MODE_NORMAL ? Cursor.DEFAULT_CURSOR : Cursor.CROSSHAIR_CURSOR);
    this._parent._drawBar.setDrawMode(this._mode);
    this._clearDrawObject();
    if (this._mode !== Chart.MODE_NORMAL) {
        this.changeTooltip(Chart.T_DRAWING);
    } else {
        this.changeTooltip(Chart.T_NONE);
    }
    if (this._mode !== Chart.MODE_NORMAL && this._objectSelected !== -1 && this._objectSelected < this._currentSymbol._drawObjects.length) {
        this._currentSymbol._drawObjects[this._objectSelected]._selected = false;
        this._objectSelected = -1;
        this.repaint();
    }
}
/**
 * @param {boolean} show
 */
Chart.prototype.setShowYestClose = function(show) {
    this._showYestClose = show;
    if (this._mainOverlay && this._mainOverlay._legend && this._yestCloseLegendId !== -1) {
        this._mainOverlay._legend.showItem(this._yestCloseLegendId, show);
    }
    this.repaint();
    this.process();
}
/**
 * @param {number} slot
 * @param {string} mnemonic
 */
Chart.prototype.setStudy = function(slot, mnemonic) {
    if (!this._canvas)
        return;
    this._signals.clear();
    if (this._studylist[slot]._ov === 0) {
        if (this._mainOverlay._study[this._studylist[slot]._st]) {
            this._mainOverlay._study[this._studylist[slot]._st].destroy();
            this._mainOverlay._study[this._studylist[slot]._st] = undefined;
        }
    } else if (this._canvas._overlays[slot + 1]) {
        if (mnemonic === "" || !StudyFactory.studyHasOverlay(mnemonic)) {
            this._removeOverlay(slot + 1);
        } else {
            this._setOverlayStudy(this._canvas._overlays[slot + 1], mnemonic);
            this.repaint();
            this.process();
            this.setRecalcStudies();
            return;
        }
    }
    if (mnemonic === "") {
        this.repaint();
        this.process();
        return;
    }
        
    if (StudyFactory.studyHasOverlay(mnemonic)) {
        this._createOverlay(slot + 1, mnemonic);
        this._studylist[slot]._ov = slot + 1;
        this._studylist[slot]._st = 0;
        for (var i = 0; i < this._canvas._overlays.length; i++) {
            var s = this._canvas._overlays[i];
            if (s && s._legend)
                s._legend.resetLocation(true);
        }
    } else {
        this._mainOverlay.setStudy(slot, mnemonic);
        if (this._mainOverlay._legend && this._mainOverlay._legend.getItem(this._mainOverlay._study[slot]._legendIndex)) {
            this._mainOverlay._legend.getItem(this._mainOverlay._study[slot]._legendIndex)._colour = this._mainOverlay._study[slot]._colour = Legend.getNextColour();
        }
        this._studylist[slot]._ov = 0;
        this._studylist[slot]._st = slot;
    }
    this.repaint();
    this.process();
    this.setRecalcStudies();
}
/**
 * @param {number} slot
 * @param {string} p
 */
Chart.prototype.setStudyParams = function(slot, p) {
    if (!this._canvas)
        return;
    if (p.length === 0) 
        return;
    var d = this._studylist[slot];
    if (d._ov !== -1) {
         this._canvas._overlays[d._ov]._study[d._st].setParams(p);
    }
    this.repaint();
    this.setRecalcStudies();
}
/**
 * @param {number} s
 */
Chart.prototype.setStockStyle = function(s) {
    if (this._mainOverlay && this._mainOverlay._study[Overlay.MAIN_STUDY_ID]) {
        this._mainOverlay._study[Overlay.MAIN_STUDY_ID]._style = s;
    }
    this.repaint();
}
/**
 * @param {boolean} logScale
 */
Chart.prototype.setLogScale = function(logScale) {
    if (!this._currentSymbol)
        return;
    this._currentSymbol._autoScale = true;
    this._currentSymbol._logScale = logScale;
    if (this._mainOverlay) {
        this._mainOverlay._logScale = logScale;
    }
    this.repaint();
    this.recalc();
    this.process();
}
/**
 * @param {number} slot
 */
Chart.prototype.getStudy = function(slot) {
    if (!this._canvas)
        return;
    var d = this._studylist[slot];
    if (d._ov !== -1 && this._canvas._overlays[d._ov]) {
        return this._canvas._overlays[d._ov]._study[d._st];
    }
    return;
}
Chart.prototype.getDrawGraphWidth = function() {
    if ((this._features & Chart.F_PUSH_DATA_LEFT) !== 0) {
        return this._drawWidth - Chart.F_PUSH_DATA_LEFT_ON;
    }
    return this._drawWidth - Chart.F_PUSH_DATA_LEFT_OFF;
}
Chart.prototype.getDrawGraphDifference = function() {
    if ((this._features & Chart.F_PUSH_DATA_LEFT) !== 0) {
        return Chart.F_PUSH_DATA_LEFT_ON;
    }
    return Chart.F_PUSH_DATA_LEFT_OFF;
}
/**
 * @param {number} state
 */
Chart.prototype.setOutsideData = function(state) {
    if (this.getData()) {
        this.getData().setOutsideData(state);
    }
    this.repaint();
}
/** @override */
Chart.prototype.setBounds = function(x, y, width, height) {
    Component.prototype.setBounds.call(this, x, y, width, height);
    
    this._setDrawAreaSize();
    
    var deltaH = height - this._height;
    if (this._currentSymbol) {
        this._currentSymbol.setNumTimeUnits(this._currentSymbol._numTimeUnits);
    }
    if (this._mainOverlay) {
        if (!this._canvas)
            return;
        var mainHeight = this._drawHeight;
        for (var i = 1; i <= Chart.MAX_OVERLAYS; i++) {
            if (this._canvas._overlays[i]) {
                mainHeight -= this._canvas._overlays[i]._height;
                this._canvas._overlays[i]._y += deltaH;
            }
        }
        this._mainOverlay._height = mainHeight;
        this._mainOverlay.calcAutoScale();
        this.resizeOverlays();
    }
}
/**
 * @param {boolean} on
 */
Chart.prototype.setLevel2Scope = function(on) {
    if (this._mainOverlay === undefined) 
        return;
    if (on) {
        this._mainOverlay._study[Overlay.LEVEL2SCOPE_STUDY_ID] = new StudyLevel2Histogram(this._mainOverlay);
    } else {
        if (this._mainOverlay._study[Overlay.LEVEL2SCOPE_STUDY_ID]) {
            this._mainOverlay._study[Overlay.LEVEL2SCOPE_STUDY_ID].destroy();
        }
        this._mainOverlay._study[Overlay.LEVEL2SCOPE_STUDY_ID] = undefined;
    }
    this.repaint();
    this.process();
}
Chart.prototype.getMasterTimeList = function() {
    return this._currentSymbol ? this._currentSymbol.getMasterTimeList() : undefined;
}
Chart.prototype.getData = function() {
    if (!this.isValid())
        return;
    return this._currentSymbol.getData(0);
}
/**
 * @param {number} index
 */
Chart.prototype.getSeries = function(index) {
    if (!this.isValid())
        return;
    if (index < Chart.S_OVERLAY) {
        return this._currentSymbol.getSeries(0, index);
    }
    var si = index - Chart.S_OVERLAY + 1;
    return this._currentSymbol.getSeries(si, Chart.S_CUR_CLOSE);
}
Chart.prototype.repaint = function() {
    if (!this._canvas)
        return;
    this._canvas.repaint();
}
Chart.prototype.initialiseParams = function() {
    this._signals.clear();
    this._months = new Array(12);
    var i;
    for (i = 0; i < 12; i++) {
        this._months[i] = Language.getString("month" + i);
    }
    this._days = new Array(8);
    for (i = 0; i < 8; i++) {
        this._days[i] = Language.getString("day" + i);
    }
    this._tooltips = [];
    this._tooltips.push(Language.getString("tooltip_default"));
    this._tooltips.push(Language.getString("tooltip_mouseover"));
    this._tooltips.push(Language.getString("tooltip_press_delete"));
    
    // userTimeZone
    this._localCalendar = Calendar.getInstance(Main.getParams()["tz"]);
    
    if (Main.getParams().hasOwnProperty("drawingThickness") && Main.getParams()["drawingThickness"] !== undefined) {
        var t = parseInt(Main.getParams()['drawingThickness'].toString(), 10);
        this._drawingThickness = t;
        if (this._parent._miscBar) {
            this._parent._miscBar.resetThickness(t - 1);
        }
    }
    if (Main.getParams().hasOwnProperty("objectColour") && Main.getParams()["objectColour"] !== undefined) {
        var colourParam = Main.getParams()["objectColour"];
        this._objectColour = colourParam;
        if (this._parent._miscBar) {
            if (colourParam) {
                for (i = 0; i < MiscToolbar.colourList.length; i ++) {
                    if (MiscToolbar.colourList[i] === colourParam) {
                        this._parent._miscBar.resetColours(i);
                        break;
                    }
                }
            }
        }
    }
}
Chart.prototype.initialiseDrawArea = function() {
    this.removeAll();
    this._canvas = new ChartCanvas(this, this._id + "_canvas", this);
    this._canvas.setColor(Chart.COLOR_PLOT);
    this._canvas._g_background = Chart.COLOR_BACKGROUND;
    this._canvas.setBorderColor(new Color(240, 240, 240));
    this._canvas.setTransparency(0.1);
    this.add(this._canvas);
    this._canvas.start();
    
    this._titleSymbolLabel = new Label(this._id + "_symbollabel", this);
    this._titleSymbolLabel.setText("hello");
    this._titleSymbolLabel.setBackground(Chart.COLOR_BACKGROUND);
    this._titleSymbolLabel.setAlign(Label.ALIGN_CENTER);
    this.add(this._titleSymbolLabel);
    
    this._titlePriceLabel = new Label(this._id + "_pricelabel", this);
    this._titlePriceLabel.setText("goodbye");
    this._titlePriceLabel.setBackground(Chart.COLOR_BACKGROUND);
    this._titlePriceLabel.setAlign(Label.ALIGN_CENTER);
    this.add(this._titlePriceLabel);
    
    this._clearDrawObject();
    this._objectSelected = -1;
    if (Main.getParams().hasOwnProperty("f") && Main.getParams()["f"] !== undefined) {
        this._features = parseInt(Main.getParams()["f"].toString(), 10);
    } else {
        this._features = 0;
    }
    if (Main.getParams().hasOwnProperty("nofeed") && Main.getParams()["nofeed"] !== undefined) {
        this._features |= Chart.F_NO_LEGEND;
        this._features |= Chart.F_SIMPLE_INFO_LINE;
        this._features |= Chart.F_NO_PRICE;
    }
    if ((this._features & Chart.F_COLOUR_WHITE) !== Chart.F_COLOUR_WHITE) {
        this._canvas._g_background = new Color(255, 254, 220);
    }
    if ((this._features & Chart.F_BORDER_WHITE) === Chart.F_BORDER_WHITE) {
        this._canvas._g_background = new Color(255, 254, 220);
    }
    if ((this._features & Chart.F_BORDER_WHITE) === Chart.F_BORDER_WHITE) {
        this._canvas._g_background = Color.white;
    }
    this._legendMask = (this._features & Chart.F_MASK_LEGEND);
    this._yestCloseLegendId = -1;
    this.setAutoScale(true);
    this.setDrawMode(Chart.MODE_NORMAL);
    for (var i = 0; i <= Chart.MAX_STUDIES; i++) {
        this._canvas._overlays[i] = undefined;
    }
    
    this._mainOverlay = new Overlay(this._canvas, this._drawY, this._drawHeight);
    this._mainOverlay.setMain();
    this._canvas._overlays[0] = this._mainOverlay;
    if (Main.getParams().hasOwnProperty("yc") && Main.getParams()["yc"] !== undefined) {
        this.setShowYestClose(Main.getParams()["yc"].toString() === "1");
    } else {
        this.setShowYestClose((this._features & Chart.F_NO_YEST_CLOSE_LINE) !== Chart.F_NO_YEST_CLOSE_LINE);
    }
    if (!this._parent.getNoHotticker()) {
        Main.setParamsKeyValue("setOriginalBounds", "1");
    }
}
Chart.prototype.initialiseStudies = function() {
    for (var i = 0; i < Chart.MAX_STUDIES; i++) {
        this._studylist[i]._ov = -1;
        if (Main.getParams().hasOwnProperty("s" + i) && Main.getParams()["s" + i] !== undefined) {
            this.setStudy(i, Main.getParams()["s" + i]);
            if (Main.getParams().hasOwnProperty("sp" + i) && Main.getParams()["sp" + i] !== undefined) {
                this.setStudyParams(i, Main.getParams()["sp" + i]);
            }
        }
    }
    this._recalcStudies = false;
}
Chart.prototype.showTickScope = function() {
//    if (!this._tickScopeOpen) {
        this._tickScopeOpen = true;
        // remove old if shows
        if (this._hotTickerFrame)
            Main.getSession().getRootComponent().removeWindow(this._hotTickerFrame);
        //
        this._hotTickerFrame = new HotTickerFrame(this._id + "_tickerFrame", this);
        this._hotTickerFrame.initHotTicker(this._hotTicker, this.getAbsoluteBounds());
        Main.getSession().getRootComponent().addWindow(this._hotTickerFrame);
        Main.getSession().getRootComponent().refresh();
//    }
}
Chart.prototype.hideTickScope = function() {
//    if (this._tickScopeOpen) {
        this._tickScopeOpen = false;
        Main.getSession().getRootComponent().removeWindow(this._hotTickerFrame);
        Main.getSession().getRootComponent().refresh();
//    }
}
Chart.prototype.flipOpenTickScope = function() {
    if (!this._tickScopeOpen) {
        this.showTickScope();
    } else {
        this.hideTickScope();
    }
}
Chart.prototype.isValid = function() {
    return this._currentSymbol && this._currentSymbol._isValid;
}
Chart.prototype.allStudies = function() {
    var tmp = [];
    for (var i = 0; i <= Chart.MAX_STUDIES; i++) {
        if (this._canvas._overlays[i]) {
            for (var j = 0; j < Chart.MAX_STUDIES; j++) {
                if (this._canvas._overlays[i]._study[j]) {
                    tmp.push(this._canvas._overlays[i]._study[j]);
                }
            }
        }
    }
    return tmp;
}
Chart.prototype.calcMaxStudyRange = function() {
    var maxRange = 0;
    for (var i = 0; i < this._studylist.length; i++) {
        var s = this.getStudy(i);
        if (s) {
            maxRange = Math.max(maxRange, s.getRange());
        }
    }
    return maxRange;
}
/**
 * @param {Date} d
 * @param {number} delta
 */
Chart.prototype.timeAdjust = function(d, delta) {
    if (delta === 0) 
        return d;
    return new Date(this.getMasterTimeList().add(d, delta));
}
Chart.prototype.resizeOverlays = function() {
    var newOverlayH = 0;
    var oCount = 0;
    var i;
    for (i = 1; i <= Chart.MAX_STUDIES; i++) {
        if (this._canvas._overlays[i]) {
            oCount++;
        }
    }
    switch(oCount) {
        case 1:
            newOverlayH = (this._drawHeight * 0.25);
            break;
        case 2:
            newOverlayH = (this._drawHeight * 0.175);
            break;
        case 3:
            newOverlayH = (this._drawHeight * 0.15);
            break;
        case 4:
            newOverlayH = (this._drawHeight * 0.1375);
            break;
        case 5:
            newOverlayH = (this._drawHeight * 0.13);
            break;
        default:
            newOverlayH = Chart.INITIAL_OVERLAY_H;
            break;
    }
    newOverlayH = parseInt(newOverlayH, 10);
    var curY = this._drawY + this._drawHeight - oCount * newOverlayH;
    
    this._mainOverlay._height = curY - this._drawY;
    this._mainOverlay._y = this._drawY;
    
    for (i = 1; i <= Chart.MAX_STUDIES; i++) {
        if (this._canvas._overlays[i] === undefined) 
            continue;
        this._canvas._overlays[i]._y = curY;
        this._canvas._overlays[i]._height = newOverlayH;
        if (this._canvas._overlays[i]._legend) {
            this._canvas._overlays[i]._legend.resetLocation(true);
        }
        curY += newOverlayH;
    }
}
Chart.prototype.recalc = function() {
    if (!this.isValid() || this.getSeries(Chart.S_CUR_CLOSE).size() === 0)
        return true;
    this._signals.clear();
    for (var i = 0; i <= Chart.MAX_STUDIES; i++) {
        if (this._canvas._overlays[i]) {
            this._canvas._overlays[i].refresh();
        }
    }
    return true;
}
Chart.prototype.symbolsChanged = function() {
    for (var i = 0; i <= Chart.MAX_STUDIES; i++) {
        if (this._canvas._overlays[i]) {
            this._canvas._overlays[i].symbolsChanged();
        }
    }
}
/**
 * @param {number} newTooltip
 */
Chart.prototype.changeTooltip = function(newTooltip) {
    if ((this._features & Chart.F_NO_TOOLTIPS) !== Chart.F_NO_TOOLTIPS) {
        if (newTooltip !== this._curTooltip) {
            this._curTooltip = newTooltip;
            this.repaint();
            this.process();
        }
    }
}
Chart.prototype.refresh = function() {
    Component.prototype.refresh.call(this);
}
/**
 * @param {number=} t - milliseconds
 * @param {boolean=} res - previous result
 * @returns {boolean}
 */
Chart.prototype.process = function(t, res) {
    if (!t) 
        t = new Date().getTime();
    if (!res)
        res = false;
    if (this._recalcStudies) {
        this._recalcStudies = !this.recalc();
        res = true;
    }
    if (!this.isValid())
        return res;
    if (this._canvas._dirty) {
        for (var i = 0; i <= Chart.MAX_STUDIES; i++) {
            if (this._canvas._overlays[i] && this._canvas._overlays[i]._autoScale) {
                this._canvas._overlays[i].calcAutoScale();
            } else {
                if (this._canvas._overlays[i] && this._canvas._overlays[i]._study) {
                    for (var j = 0; j < this._canvas._overlays[i]._study.length; j++) {
                        if (this._canvas._overlays[i]._study[j]) {
                            var it = XTIterator.reverseScreenIterator(this);
                            this._canvas._overlays[i]._study[j].updateDefaultDataSource();
                            this._canvas._overlays[i]._study[j].getMaxMin(it);
                        }
                    }
                }
            }
        }
        this.refresh();
        this._canvas._dirty = false;
    }
    if (this._tickScopeOpen && this._hotTickerFrame) {
        res = this._hotTickerFrame.process(t, res);
    }
    if (this._mainOverlay._study[Overlay.LEVEL2SCOPE_STUDY_ID]) {
        res = this._mainOverlay._study[Overlay.LEVEL2SCOPE_STUDY_ID].process(t, res);
    }
    return res;
}
/** @private */
Chart.prototype._clearDrawObject = function() {
    this._currentDrawObject = undefined;
    this._drawingNow = false;
    this.repaint();
}
/** @private */
Chart.prototype._setDrawAreaSize = function() {
    this._canvas._fullInfo = false;
    if ((this._features & (Chart.F_NO_LEFT_BORDER | Chart.F_NO_INFO_LINE | Chart.F_SIMPLE_INFO_LINE | Chart.F_SIMPLE_X_LABELS | Chart.F_NO_X_LABELS)) !== 0) {
        this._canvas.setFontSize(9);
    } else {
        this._canvas.setFontSize(10);
    }
    if ((this._features & Chart.F_NO_LEFT_BORDER) === Chart.F_NO_LEFT_BORDER) {
        this._drawX = 6;
        if ((this._features & Chart.F_NO_Y_AXIS) === Chart.F_NO_Y_AXIS) {
            this._drawWidth = this._width - 12;
        } else {
            this._drawWidth = this._width - 50;
        }
    } else {
        this._drawX = 50;
        if ((this._features & Chart.F_NO_Y_AXIS) === Chart.F_NO_Y_AXIS) {
            this._drawWidth = this._width - 56;
        } else {
            this._drawWidth = this._width - 100;
        }
    }
    var copyrightHeight = ((this._features & Chart.F_NO_COPYRIGHT) === Chart.F_NO_COPYRIGHT) ? 0 : this._fontSize + 3;
    var infoLineHeight = 0;
    var xAxisHeight = 0;
    switch (this._features & Chart.F_MASK_INFO_LINE) {
        case Chart.F_NO_INFO_LINE:
            infoLineHeight = 0;
            break;
        case Chart.F_SIMPLE_INFO_LINE:
            infoLineHeight = this._fontSize + 4;
            break;
        case Chart.F_FULL_INFO_LINE:
            infoLineHeight = this._fontSize * 2 + 8;
            this._canvas._fullInfo = true;
            break;
    }
    switch (this._features & Chart.F_MASK_X_LABELS) {
        case Chart.F_NO_X_LABELS:
            xAxisHeight = 2;
            break;
        case Chart.F_SIMPLE_X_LABELS:
            xAxisHeight = this._fontSize + 2;
            break;
        case Chart.F_FULL_X_LABELS:
            xAxisHeight = this._fontSize * 2 + 2;
            break;
    }
    this._drawY = infoLineHeight + 1;
    this._drawHeight = this._height - this._drawY - Math.max(copyrightHeight + xAxisHeight, 1);
    this._xSFWidth = parseInt((this._drawWidth / 4.0), 10);
    this._canvas.setBounds(0, 0, this._width, this._height);
    
    this._canvas._topLineStartX = this._drawX + 1;
    this._canvas._topLineEndX = this._drawX + this._drawWidth - 1;
    this._canvas._topLineY = this._drawY + 1;
    this._canvas._bottomLineStartX = this._drawX + 1;
    this._canvas._bottomLineEndX = this._drawX + this._drawWidth - 1;
    this._canvas._bottomLineY = this._drawY + this._drawHeight - 1;
}
/** 
 * @private 
 * @param {number} slot
 */
Chart.prototype._removeOverlay = function(slot) {
    this._canvas.removeOverlayAt(slot);
    this.resizeOverlays();
}
/** 
 * @private 
 * @param {Overlay} o
 * @param {string} mnemonic
 */
Chart.prototype._setOverlayStudy = function(o, mnemonic) {
    o._study[0] = (mnemonic.length === 0) ? undefined : StudyFactory.getStudy(o, mnemonic);
    if (o._legend) {
        o._legend.clear();
        o._study[0]._legendIndex = o._legend.addItem(o._study[0]._name);
        o._study[0]._colour = o._legend.getItem(o._study[0]._legendIndex)._colour;
        o._legend.setOpen(this._canvas._overlays[0]._legend._open);
    }
    o.refresh();
}
/** 
 * @private
 * @param {number} slot
 * @param {string} mnemonic
 */
Chart.prototype._createOverlay = function(slot, mnemonic) {
    if (!this._canvas)
        return;
    var o = new Overlay(this._canvas, 0, 0);
    this._canvas.setOverlay(o, slot);
    this.resizeOverlays();
    this._setOverlayStudy(o, mnemonic);
}
/**
 * @param {Date} d
 */
Chart.prototype.getLabel = function(d) {
    this._localCalendar.setTime(d);
    var df = new DecimalFormat();
    df.setMinimumIntegerDigits(2);
    df.setMaximumFractionDigits(2);
    df.setGroupingUsed(false);
    if (this._currentSymbol._currentLabelScale >= LabelIterator.L_4HOURS) {
        return NumberFormatter.formatHoursOrMinutes(this._localCalendar.get(Calendar.HOUR_OF_DAY)) + NumberFormatter.formatHoursOrMinutes(this._localCalendar.get(Calendar.MINUTE));
    }
    if (this._currentSymbol._currentLabelScale >= LabelIterator.L_2WEEKS) {
        return this._months[this._localCalendar.get(Calendar.MONTH)] + " " + this._localCalendar.get(Calendar.DAY_OF_MONTH);
    }
    if (this._currentSymbol._currentLabelScale >= LabelIterator.L_6MONTHS) {
        if ("jp" === Language.getLanguageID()) {
            return df.format(this._localCalendar.get(Calendar.YEAR) % 100) + " / " + (this._localCalendar.get(Calendar.MONTH) + 1);
        }
        return this._months[this._localCalendar.get(Calendar.MONTH)] + " " + df.format(this._localCalendar.get(Calendar.YEAR) % 100);
    }
    return this._localCalendar.get(Calendar.YEAR).toString();
}
/**
 * @private
 * @param {Date} d
 */
Chart.prototype._getFullLabel = function(d) {
    return this.getLabel(d) + " " + this.getMajorLabel(d);
}
/**
 * @param {Date} d
 */
Chart.prototype.getMajorLabel = function(d) {
    this._localCalendar.setTime(d);
    if (this._currentSymbol._currentLabelScale >= LabelIterator.L_4HOURS) {
        return this._days[this._localCalendar.get(Calendar.DAY_OF_WEEK)] + " " + this._months[this._localCalendar.get(Calendar.MONTH)] + " " + this._localCalendar.get(Calendar.DAY_OF_MONTH);
    }
    if (this._currentSymbol._currentLabelScale >= LabelIterator.L_2WEEKS) {
        return this._months[this._localCalendar.get(Calendar.MONTH)] + " " + this._localCalendar.get(Calendar.DAY_OF_MONTH);
    }
    if (this._currentSymbol._currentLabelScale >= LabelIterator.L_6MONTHS) {
        var df = new DecimalFormat();
        df.setMinimumIntegerDigits(2);
        df.setMaximumFractionDigits(2);
        df.setGroupingUsed(false);
        if ("jp" === Language.getLanguageID()) {
            return df.format(this._localCalendar.get(Calendar.YEAR) % 100) + " / " + (this._localCalendar.get(Calendar.MONTH) + 1);
        }
        return this._months[this._localCalendar.get(Calendar.MONTH)] + " " + df.format(this._localCalendar.get(Calendar.YEAR) % 100);
    }
    return "";
}
/**
 * @private
 * @param {number=} x
 * @param {number=} y
 */
Chart.prototype._checkObjectSelection = function(x, y) {
    if (this._currentSymbol === undefined) 
        return -1;
    for (var i = 0; i < this._currentSymbol._drawObjects.length; i++) {
        var cur = this._currentSymbol._drawObjects[i];
        var selPoint = cur.hasGotSelectionPoint(new Point(x, y));
        if (selPoint !== -1) {
            cur._selectedPoint = selPoint;
            return i;
        }
        cur._selectedPoint = -1;
        if (cur.hasSelected(new Point(x, y))) {
            return i;
        }
    }
    return -1;
}
/** @private */
Chart.prototype._deleteDrawingObject = function() {
    this._currentSymbol._drawObjects.splice(this._objectSelected, 1);
    this._objectSelected = -1;
    this.changeTooltip(Chart.T_NONE);
    this.repaint();
}
/** @private */
Chart.prototype._addDrawingObject = function() {
    if (this._currentSymbol._drawObjects.length === Chart.MAX_DRAW_OBJECTS) 
        return;
    var newObj = this._currentDrawObject.copy();
    this._currentSymbol._drawObjects.push(newObj);
    newObj.postCreate(this._currentSymbol._drawObjects.length - 1);
    this.setDrawMode(Chart.MODE_NORMAL);
    this.repaint();
    this.process();
}
/**
 * @private
 * @param {number} slot
 * @param {number} offset
 */
Chart.prototype._adjustOverlays = function(slot, offset) {
    var i = slot + 1;
    // adjust slot, if before have empty
    for (; i < this._canvas._overlays.length; i++) {
        if (this._canvas._overlays[i] === undefined) 
            continue;
        else
            break;
    }
    //
    if (this._canvas._overlays[i] === undefined) 
        return;
    var newH1 = this._currentSymbol._savedWindowSizes[0][1] - offset;
    var newH2 = this._currentSymbol._savedWindowSizes[1][1] + offset;
    if (newH1 >= Chart.MIN_OVERLAY_H && newH2 >= Chart.MIN_OVERLAY_H) {
        this._canvas._overlays[slot]._height = newH1;
        if (this._canvas._overlays[slot]._legend) {
            this._canvas._overlays[slot]._legend.resetLocation(true);
        }
        this._canvas._overlays[i]._y = this._currentSymbol._savedWindowSizes[1][0] - offset;
        this._canvas._overlays[i]._height = newH2;
        if (this._canvas._overlays[i]._legend) {
            this._canvas._overlays[i]._legend.resetLocation(true);
        }
        this.repaint();
    }
}
/**
 * @private
 * @param {Date} d
 */
Chart.prototype._timeShow = function(d) {
    return d + " (" + this._getFullLabel(d) + ")";
}
/**
 * @private
 * @param {string} s1
 * @param {string} s2
 */
Chart.prototype._buildParams = function(s1, s2) {
    var sep1 = '&';
    var sep2 = '=';
    if (arguments.length > 1) {
        sep1 = s1;
        sep2 = s2;
    }
    var h = this._parent.buildParams(true);
    delete h["period"];
    h["from"] = (this._currentSymbol._timeStart.getTime() / 60000).toString();
    h["to"] = (this._currentSymbol._timeEnd.getTime() / 60000).toString();
    h["ls"] = this._currentSymbol._currentLabelScale.toString();
    var h2 = this._currentSymbol.getDrawingObjects();
    Utils.mergeObjectsProperties(h, h2, true);
    return Utils.convertHashParamsWithoutDefaults(h, sep1, sep2);
}
/** @override */
Chart.prototype.handleMouseDown = function(x, y, b) {
    RootComponent.captureMouse(this);
    x -= this._x;
    y -= this._y;
	return this.onMouseDown(x, y, b);
}
/** @override */
Chart.prototype.onMouseDown = function(x, y, b) {
    if (this._currentDrawObject) {
        this._currentDrawObject._tapX = x;
        this._currentDrawObject._tapY = y;
        this._currentDrawObject._dragX = x;
        this._currentDrawObject._dragY = y;
    }
    this._b = b;
    if (this._capture) {
        var res = this._capture.onMouseDown(x, y);
        return res;
    }
    this._capture = undefined;
    Main.getSession().getRootComponent().setKeyFocus(this);
    if (!this.isValid())
        return;
    this._currentSymbol._oldTimeEnd = new Date(this._currentSymbol._timeEnd.getTime());
    
    if (this._mouseAreaType === Chart.M_DEADZONE)
        return true;
    // Save state.
    this._drag = true;
    this._dragX = this._mouseOldX = x;
    this._dragY = this._mouseOldY = y;
    this._mouseDownArea = this._mouseArea;
    this._currentSymbol._oldUnitWidth = this._currentSymbol._unitWidth;
    
    if (this._mouseAreaType === Chart.M_IN_X_AXIS)
        return true;
    
    if (this._mode !== Chart.MODE_NORMAL) {
        if (!this._drawingNow) {
            this._drawingNow = true;
            this._currentDrawObject = DrawingObject.getDrawingObject(this, this._mode);
            if (typeof this._selectedColour === 'undefined') {
                this._selectedColour = this._objectColour;
            }
            this._currentDrawObject._colour = this._selectedColour;
            this._currentDrawObject.onMouseDownPre(x, y);
            this._currentDrawObject.onMouseMove(x, y);
            this._lineStartArea = this._mouseArea;
            this.changeTooltip(this._currentDrawObject.getTooltip());
            this.repaint();
            this._currentDrawObject._waitDrag = Main.isTouchClient();
            if (this._currentDrawObject._waitDrag) {
                this._currentDrawObject._newPrePoint = false;
            }
        } else {
            if (typeof this._currentDrawObject != 'undefined' && !this._currentDrawObject._waitDrag) {
                if (this._currentDrawObject.onMouseDownPre(x, y)) {
                    if (Main.isTouchClient()) {
                        this._currentDrawObject._finished = true;
                    } else {
                        this._addDrawingObject();
                        this._drawingNow = false;
                        this._drag = false;
                    }
                }
                if (typeof this._currentDrawObject !== 'undefined') {
                    this._currentDrawObject._waitDrag = Main.isTouchClient();
                    if (this._currentDrawObject._waitDrag) {
                        this._currentDrawObject._newPrePoint = true;
                    }
                    if (this._currentDrawObject._curPoint < this._currentDrawObject._points.length) {
                        this.changeTooltip(this._currentDrawObject.getTooltip());
                    }
                } else {
                    this.changeTooltip(Chart.T_NONE);
                }
                this.repaint();
                this.process();
            }   
        }
        return true;
    }
    var i = this._checkObjectSelection(x, y);
    if (i !== this._objectSelected) {
        if (this._objectSelected !== -1 && this._objectSelected < this._currentSymbol._drawObjects.length) {
            this._currentSymbol._drawObjects[this._objectSelected]._selected = false;
            // store main chart color
            this._selectedColour = this._objectColour;
        }
        this._objectSelected = i;
        if (this._objectSelected !== -1) {
            var curObj = this._currentSymbol._drawObjects[this._objectSelected];
            // store object color
            this._selectedColour = curObj._colour;
            curObj.onMouseDown(x, y);
            this.repaint();
            this.process();
        } else {
            this.changeTooltip(Chart.T_NONE);
        }
        this.resetToolbarColor();
        return true;
    }
    if (this._canvas._overlays[this._mouseArea]) {
        this._canvas._overlays[this._mouseArea].onMouseDown(x, y);
    }
    // draw the vertical line if using right mouse button
    if (b === 2) {
        this._currentSymbol._verticalLinePosition = x;
        this.repaint();
        this.process();
    }
    return true;
}
Chart.prototype.resetToolbarColor = function() {
    // set color on misctoolbar
    for (var j = 0; j < MiscToolbar.colourList.length; j++) {
        if (MiscToolbar.colourList[j] === this._selectedColour) {
            this._parent._miscBar.resetColours(j);
            break;
        }
    }
}
/** @override */
Chart.prototype.handleMouseUp = function(x, y) {
    x -= this._x;
    y -= this._y;
    return this.onMouseUp(x, y);
}
/** @override */
Chart.prototype.onMouseUp = function(x, y) {
    if (this._currentDrawObject) {
        if (this._currentDrawObject._tapX === x && this._currentDrawObject._tapY === y) {
            if (this._currentDrawObject._newPrePoint) {
                this._currentDrawObject._newPrePoint = false;
            } else {
                this._currentDrawObject._waitDrag = false;
                if (this._currentDrawObject._finished) {
                    this._addDrawingObject();
                    this._drawingNow = false;
                    this._drag = false;
                }
            }
            if (this._currentDrawObject)
                this.changeTooltip(this._currentDrawObject.getTooltip());
        }
    }
    if (this._capture) {
        var res = this._capture.onMouseUp(x, y);
        return res;
    }
    if (!this.isValid())
        return;
    this._capture = undefined;
    this._drag = false;
    RootComponent.releaseMouse(this);
    var curClickTime = new Date().getTime();
    var timeSinceLastClick = curClickTime - this._timeOfLastClick;
    this._timeOfLastClick = curClickTime;
    if (timeSinceLastClick <= Chart.DOUBLE_CLICK_SPEED && !this._prevDbl) {
        this._prevDbl = true;
        this.onMouseDoubleClick(x, y);
        this._parent.doSync();
        return;
    }
    this._prevDbl = false;
    if (this._currentSymbol._oldUnitWidth !== this._currentSymbol._unitWidth) {
        this._currentSymbol._currentLabelScale = this._currentSymbol.getLabelScale();
        this.repaint();
        this.process();
    }
    this._currentSymbol._oldUnitWidth = this._currentSymbol._unitWidth;
    
    if (this._mouseAreaType === Chart.M_IN_WINDOW && this._canvas._overlays[this._mouseArea]) {
        this._canvas._overlays[this._mouseArea].onMouseUp(x, y);
    }
    
    this.setDrawMode(this._mode);
    this._currentSymbol._savedWindowSizes = undefined;
    
    if (this._currentSymbol._verticalLinePosition >= 0) {
        this._currentSymbol._verticalLinePosition = -1;
        this.repaint();
        this.process();
    }
    if (this._mouseAreaType === Chart.M_IN_Y_AXIS && this._canvas._overlays[this._mouseArea]) {
        this._canvas._overlays[this._mouseArea]._oldYSpread = this._canvas._overlays[this._mouseArea]._ySpread;
    }
    return true;
}
/** @override */
Chart.prototype.handleMouseMove = function(x, y) {
    x -= this._x;
    y -= this._y;
    return this.onMouseMove(x, y);
}
/** @override */
Chart.prototype.onMouseMove = function(x, y) {
    if (!this.isValid()) 
        return false;
    if (this._drag)
        return this.onMouseDrag(x, y);
    
    this._mouseAreaType = Chart.M_DEADZONE;
    if (y <= this._drawY || x <= this._drawX) {
        if (this._mode === Chart.MODE_NORMAL)
            this.changeTooltip(Chart.T_NONE);
        this.onMouseLeave();
        return true;
    }
    if (y > this._drawY + this._drawHeight) {
        this.onMouseLeave();
        this._mouseAreaType = Chart.M_IN_X_AXIS;
        this.setCursor(Cursor.COL_RESIZE_CURSOR);
        this.changeTooltip(Chart.T_RESIZE);
        this.repaint();
        this.process();
        return true;
    }
    if (x > this._drawX + this._drawWidth) {
        this.onMouseLeave();
        this._mouseAreaType = Chart.M_IN_Y_AXIS;
        this.setCursor(Cursor.ROW_RESIZE_CURSOR);
        this.changeTooltip(Chart.T_RESIZE);
        this.repaint();
        this.process();
        return true;
    }
    this._mouseAreaType = Chart.M_IN_WINDOW;
    this._mouseArea = 0;
    var i;
    for (i = 0; i <= Chart.MAX_STUDIES; i++) {
        if (this._canvas._overlays[i] === undefined) 
            continue;
        var bottomY = this._canvas._overlays[i]._y + this._canvas._overlays[i]._height;
        if (y < bottomY - 1) {
            this._mouseArea = i;
            break;
        } else if (i < Chart.MAX_STUDIES && Math.abs(y - bottomY) <= 3) {
            for (var j = i + 1; j <= Chart.MAX_STUDIES; j++) {
                if (this._canvas._overlays[j] === undefined) 
                    continue;
                this._mouseArea = i;
                this._mouseAreaType = Chart.M_ON_WINDOW_BORDER;
                this.setCursor(Cursor.ROW_RESIZE_CURSOR);
                this._currentSymbol._savedWindowSizes = new Array(2);
                this._currentSymbol._savedWindowSizes[0] = new Array(2);
                this._currentSymbol._savedWindowSizes[1] = new Array(2);
                this._currentSymbol._savedWindowSizes[0][0] = this._canvas._overlays[i]._y;
                this._currentSymbol._savedWindowSizes[0][1] = this._canvas._overlays[i]._height;
                this._currentSymbol._savedWindowSizes[1][0] = this._canvas._overlays[j]._y;
                this._currentSymbol._savedWindowSizes[1][1] = this._canvas._overlays[j]._height;
                break;
            }
            break;
        }
    }
    for (i = 0; i <= Chart.MAX_STUDIES; i++) {
        if (this._canvas._overlays[i] && this._canvas._overlays[i]._legend) {
            var isOpen = this._mouseArea === i && this._canvas._overlays[i]._showLegend;
            this._canvas._overlays[i]._legend.setOpen(isOpen);
            this._canvas._overlays[i]._legend.refresh();
        }
    }
    if (this._mouseAreaType === Chart.M_IN_WINDOW) {
        if (this._mode !== Chart.MODE_NORMAL && this._drawingNow) {
            if ((!this._currentDrawObject._drawAcrossWindows || this._mouseArea === this._lineStartArea) && !this._currentDrawObject._waitDrag) {
                this._currentDrawObject.onMouseMove(x, y);
                this.repaint();
                this.process();
            }
        }
        if (!this._canvas._overlays[this._mouseArea].onMouseMove(x, y)) {
            if (this._mode === Chart.MODE_NORMAL && this._checkObjectSelection(x, y) >= 0) {
                this.setCursor(Cursor.HAND_CURSOR);
            } else {
                this.setCursor(this._mode === Chart.MODE_NORMAL ? Cursor.HAND_CURSOR : Cursor.CROSSHAIR_CURSOR);
            }
        }
    }
    this._mouseOldY = y;
    this._mouseOldX = x;
    return true;
}
/** 
 * @param {number=} x
 * @param {number=} y
 */
Chart.prototype.onMouseDoubleClick = function(x, y) {
    if (this._objectSelected !== -1 && this._objectSelected < this._currentSymbol._drawObjects.length) {
        var curObj = this._currentSymbol._drawObjects[this._objectSelected];
        curObj.onMouseDoubleClick(x, y);
    }
    return true;
}
/** 
 * @param {number} x
 * @param {number} y
 */
Chart.prototype.onMouseDrag = function(x, y) {
    var dx = 0.0, dt = 0;
    if (this._mouseAreaType === Chart.M_DEADZONE) {
        this._mouseOldY = y;
        this._mouseOldX = x;
        return true;
    }
    if (this._mode === Chart.MODE_NORMAL) {
        if (this._b === 3) {
            // right mouse button
            // set that we want to draw the line
            this._currentSymbol._verticalLinePosition = x;
            this._canvas._overlays[this._mouseArea].onMouseDrag(x, y);
        } else {
            if (this._mouseAreaType === Chart.M_IN_X_AXIS) {
                this.setCursor(Cursor.COL_RESIZE_CURSOR);
                var pow = Math.min(2.0, (this._dragX - x) / this._xSFWidth);
                pow = Math.max(-2.0, pow);
                dx = Math.pow(2, pow);
                this._currentSymbol.recalcXScale(dx);
            } else if (this._mouseAreaType === Chart.M_IN_Y_AXIS) {
                this._canvas._overlays[this._mouseArea].onYAxisDrag(x, y);
            } else {
                if (this._mouseAreaType === Chart.M_IN_WINDOW) {
                    this.setCursor(Cursor.HAND_CURSOR);
                    if (this._objectSelected !== -1) {
                        var curObj = this._currentSymbol._drawObjects[this._objectSelected];
                        curObj.onMouseDrag(x, y);
                        this.repaint();
                    } else {
                        // drag of legend
                        if (this._canvas._overlays[this._mouseArea]._capture) {
                            this._canvas._overlays[this._mouseArea]._capture.onMouseDrag(x, y);
                            this.repaint();
                            this.process();
                            return true;
                        }
                        ///
                        if (this._dragX < (this._drawX + this._drawWidth)) {
                            dx = x - this._dragX;
                            dt = dx * this._currentSymbol._numTimeUnits / this._width * Chart.X_ADJ_MULT;
                            if (Math.abs(dx) >= 1.0) {
                                if (this._currentSymbol._oldTimeEnd === undefined) {
                                    this._currentSymbol._oldTimeEnd = new Date(this._currentSymbol._timeEnd.getTime());
                                }
                                this._currentSymbol.setTimeEnd(this.timeAdjust(this._currentSymbol._oldTimeEnd, parseInt(-dt, 10)));
                            }
                        }
                        this._canvas._overlays[this._mouseArea].onMouseDrag(x, y);
                    }
                } else {
                    // We're dragging the borders between windows.
                    this._adjustOverlays(this._mouseDownArea, this._dragY - y);
                }
            }
        }
    } else {
        if (this._currentDrawObject && this._currentDrawObject._waitDrag) {
            this._currentDrawObject._newPrePoint = false;
            var deltax = x - this._currentDrawObject._dragX;
            var deltay = y - this._currentDrawObject._dragY;
            this._currentDrawObject.translateOnTouchDrag(deltax, deltay, x, y);
            this._currentDrawObject._dragX = x;
            this._currentDrawObject._dragY = y;
        } else
            this._canvas._overlays[this._mouseArea].onMouseDrag(x, y);
    }
    this.repaint();
    this.process();
    this._mouseOldY = y;
    this._mouseOldX = x;
    return true;
}
/** @override */
Chart.prototype.onKeyUp = function(keyCode) {
    var eol = "\n";
    var keyChar = String.fromCharCode(keyCode);
    switch (keyChar) {
        case 'm':
            this.setDrawMode(1 - this._mode);
            break;
        case 'b':
            console.log(Chart.S_BID_CLOSE);
            break;
        case 'c':
            console.log(Chart.S_CUR_CLOSE);
            break;
        case 'o':
            console.log(Chart.S_CUR_OPEN);
            break;
        case 'h':
            console.log(Chart.S_CUR_HIGH);
            break;
        case 'l':
            console.log(Chart.S_CUR_LOW);
            break;
        case 'v':
            console.log(Chart.S_TOTAL_VOLUME);
            break;
        case '1':
            console.log(Chart.S_OVERLAY);
            break;
        case '2':
            console.log(Chart.S_OVERLAY + 1);
            break;
        case 'f':
            var sr = this._canvas._overlays[0]._study[0]._series;
            var msg = sr.size() + " items" + eol;
            for (var j = 0; j < sr.size(); j++) {
                msg += sr.timeByIndex(j) + " - " + parseInt(sr.timeByIndex(j).getTime() / 1000, 10) + " - " + sr.getByIndex(j) + eol;
            }
            msg += eol;
            break;
        case 's':
            msg = "timeEnd = " + this._timeShow(this._currentSymbol._timeEnd) + " timeStart = " + this._timeShow(this._currentSymbol._timeStart) + "\\n";
            msg += "num_time_units = " + this._currentSymbol._numTimeUnits;
            break;
        case 't':

            break;
        case 'x':
            msg = "size = " + this.getMasterTimeList().size() + " start = " + this.getMasterTimeList().getByIndex(0) + " end = " + this.getMasterTimeList().getByIndex(-1) + eol + eol;
            msg += "time = " + this._timeShow(this._currentSymbol._time) + " timeStart = " + this._timeShow(this._currentSymbol._timeStart) + " timeEnd = " + this._timeShow(this._currentSymbol._timeEnd) + eol + eol;
            msg += "d_x = " + this._drawX + " d_y = " + this._drawY + " d_w = " + this._drawWidth + " d_x+d_w = " + (this._drawX + this._drawWidth) + " uw = " + this._currentSymbol._unitWidth + " ntu = " + this._currentSymbol._numTimeUnits + eol + eol;
            msg += "rts = " + this.getSeries(Chart.S_CUR_CLOSE).timeStart() + " rte = " + this.getSeries(Chart.S_CUR_CLOSE).timeEnd() + " hc = " + /*this.getSeries(Chart.S_CUR_CLOSE).hashCode() + eol*/ + eol;
            var i = XTIterator.reverseScreenIterator(this);
            do {
                msg += "x = " + i._x + " d = " + i._d + " t = " + parseInt(i._d.getTime() / 1000, 10);
                msg += " idx = " + i._idx + " op = " + this._percentDf.format(this.getSeries(Chart.S_CUR_OPEN).get(i._d)) + " hi = " + this._percentDf.format(this.getSeries(Chart.S_CUR_HIGH).get(i._d)) + " lo = " + this._percentDf.format(this.getSeries(Chart.S_CUR_LOW).get(i._d)) + " cl = " + this._percentDf.format(this.getSeries(Chart.S_CUR_CLOSE).get(i._d)) + " ws = " + i.withinSeries(this.getSeries(Chart.S_CUR_CLOSE)) + " it = " + i._d + " l = " + this.getLabel(i._d) + eol;
            } while(i.move());
            break;
        case 'q':
//            msg = "";
//            for (var key in em) {
//                msg += key + "=" + Main.getParams()[key] + eol;
//            }
            break;
        case 'i':
            break;
        default:
            if (keyCode === KeyEvent.BACKSPACE || keyCode === KeyEvent.DELETE) {
                if (this._objectSelected >= 0) {
                    this._deleteDrawingObject();
                }
            } else if (keyCode === 27) {
                if (Main.getSession().getRootComponent()._modal) {
                    Main.getSession().getRootComponent()._modal.setModal(false);
                }
            }
            break;
    }
    if (msg)
        console.log(msg);
    return true;
}
/** @override */
Chart.prototype.onMouseLeave = function() {
    if (this._capture) {
        this._capture.onMouseLeave();
    }
    for (var i = 0; i <= Chart.MAX_STUDIES; i++) {
        if (this._canvas._overlays[i] && this._canvas._overlays[i]._legend) {
            this._canvas._overlays[i]._legend.setOpen(false);
        }
    }
    this.repaint();
    this.process();
    this._currentSymbol._currentLabelScale = this._currentSymbol.getLabelScale();
    this.setCursor(Cursor.DEFAULT_CURSOR);
}
/** @override */
Chart.prototype.onCustomEvent = function(e) {
    if (this.isValid() && e._event === ChartEvent.MODAL_OK) {
        var curObj;
        if (Utils.getConstructorName(e._source) === 'CalloutDialog') {
            curObj = this._currentSymbol._drawObjects[this._objectSelected];
            curObj.setText(e._source.getText());
        } else if (Utils.getConstructorName(e._source) === 'ParamDialog') {
            curObj = this._currentSymbol._drawObjects[this._objectSelected];
            if (typeof curObj.handleDialogResult !== "undefined") {
                curObj.handleDialogResult(e._source.getParams());
            }
        }
        return true;
    }
    return false;
}
/** @static */
Chart.COLOR_BACKGROUND = new Color("#f8f8f8");
/** @static */
Chart.COLOR_PLOT = new Color("#333333");
/** @static */
Chart.COLOR_LABELS = Color.black;
/** @static */
Chart.MAX_STUDIES = 6;
/** @static */
Chart.MAX_OVERLAYS = 5;
/** @static */
Chart.MAX_SERIES = 10;
/** @static */
Chart.MAX_DRAW_OBJECTS = 100;
/** @static */
Chart.MODE_NORMAL = -1;
/** @static */
Chart.DOUBLE_CLICK_SPEED = 500;
/** @static */
Chart.NO_DRAG_ZONE = 10;
/** @static */
Chart.INITIAL_OVERLAY_H = 100;
/** @static */
Chart.MIN_OVERLAY_H = 40;
/** @static */
Chart.INITIAL_GRAB = 240;
/** @static */
Chart.INITIAL_HOURS = 24;
/** @static */
Chart.M_IN_WINDOW = 0;
/** @static */
Chart.M_ON_WINDOW_BORDER = 1;
/** @static */
Chart.M_DEADZONE = 2;
/** @static */
Chart.M_IN_X_AXIS = 3;
/** @static */
Chart.M_IN_Y_AXIS = 4;
/** @static */
Chart.X_ADJ_MULT = 1.23;
/** @static */
Chart.S_BID_CLOSE = 0;
/** @static */
Chart.S_OFFER_CLOSE = 1;
/** @static */
Chart.S_CUR_OPEN = 2;
/** @static */
Chart.S_CUR_HIGH = 3;
/** @static */
Chart.S_CUR_LOW = 4;
/** @static */
Chart.S_CUR_CLOSE = 5;
/** @static */
Chart.S_BUY_VOLUME = 6;
/** @static */
Chart.S_SELL_VOLUME = 7;
/** @static */
Chart.S_UNKNOWN_VOLUME = 8;
/** @static */
Chart.S_TOTAL_VOLUME = 9;
/** @static */
Chart.S_OVERLAY = 10;
/** @static */
Chart.T_NONE = 0;
/** @static */
Chart.T_RESIZE = 1;
/** @static */
Chart.T_DELETELINE = 2;
/** @static */
Chart.T_DRAWING = 3;
/** @static */
Chart.F_NO_LEFT_BORDER = 1 << 0;
/** @static */
Chart.F_FULL_INFO_LINE = 0;
/** @static */
Chart.F_NO_INFO_LINE = 1 << 1;
/** @static */
Chart.F_SIMPLE_INFO_LINE = 1 << 2;
/** @static */
Chart.F_MASK_INFO_LINE = Chart.F_NO_INFO_LINE | Chart.F_SIMPLE_INFO_LINE;
/** @static */
Chart.F_COLOUR_WHITE = 1 << 3;
/** @static */
Chart.F_SPARSE_X_LABELS = 1 << 4;
/** @static */
Chart.F_FULL_X_LABELS = 0;
/** @static */
Chart.F_SIMPLE_X_LABELS = 1 << 5;
/** @static */
Chart.F_NO_X_LABELS = 1 << 6;
/** @static */
Chart.F_MASK_X_LABELS = Chart.F_SIMPLE_X_LABELS | Chart.F_NO_X_LABELS;
/** @static */
Chart.F_OPEN_LEGEND = 0;
/** @static */
Chart.F_CLOSED_LEGEND = 1 << 7;
/** @static */
Chart.F_NO_LEGEND = 1 << 8;
/** @static */
Chart.F_MASK_LEGEND = Chart.F_CLOSED_LEGEND | Chart.F_NO_LEGEND;
/** @static */
Chart.F_NO_TOOLTIPS = 1 << 9;
/** @static */
Chart.F_NO_YEST_CLOSE_LINE = 1 << 10;
/** @static */
Chart.F_BORDER_WHITE = 1 << 11;
/** @static */
Chart.F_LINE_BLUE = 1 << 12;
/** @static */
Chart.F_NO_PRICE = 1 << 13;
/** @static */
Chart.F_NO_X_GRID = 1 << 14;
/** @static */
Chart.F_PUSH_DATA_LEFT = 1 << 15;
/** @static */
Chart.F_PUSH_DATA_LEFT_ON = 8;
/** @static */
Chart.F_PUSH_DATA_LEFT_OFF = 8;
/** @static */
Chart.F_NO_COPYRIGHT = 1 << 16;
/** @static */
Chart.F_NO_AXES_LABEL = 1 << 17;
/** @static */
Chart.F_NO_AXES_TICKS = 1 << 18;
/** @static */
Chart.F_NO_Y_AXIS = 1 << 19;
/** @static */
Chart.FREQUENCY_1 = 0;
/** @static */
Chart.FREQUENCY_5 = 1;
/** @static */
Chart.FREQUENCY_10 = 2;
/** @static */
Chart.FREQUENCY_15 = 3;
/** @static */
Chart.FREQUENCY_30 = 4;
/** @static */
Chart.FREQUENCY_60 = 5;
/** @static */
Chart.FREQUENCY_D = 6;
/** @static */
Chart.FREQUENCY_W = 7;
/** @static */
Chart.FREQUENCY_M = 8;
/** @static */
Chart.FREQUENCY_Q = 9;
/** @static */
Chart.FREQUENCY_Y = 10;
/** @static */
Chart.NUM_FREQUENCIES = 11;
/**
 * --------------
 * Chart_Dropdown
 * --------------
 * @constructor
 */
function Chart_Dropdown() {
    this._ov = 0;
    this._st = 0;
}