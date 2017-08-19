/**
 * --------------
 * ChartContainer
 * --------------
 * @constructor
 * @extends {Component}
 * @param {string} id - ID of div
 * @param {Component=} delegate
 * @param {Feed=} f
 * @param {Number=} fo - feedOffset
 */
function ChartContainer(id, delegate, f, fo) {
    Component.call(this, id, delegate);
    this.setBackground(Color.white);
    this.setBounds(0, 0, Main.getFrameWidth(), Main.getFrameHeight());
    this.setRoundedCorners(7);
    this.setBorderSize(1);
    this.setBorderColor(Color.gray1);
    this.setBorder(Component.BORDER_SOLID);
    
    this._view = Main.getParams().has('view') ? Main.getParams().get('view') : 'gb';
    this._noFeed = Main.getParams().has('nofeed');
    this._noHotticker = Main.getParams().has('nohotticker') || this._noFeed;
    this._noToolbar = Main.getParams().has('notoolbar');
    this._defaultToHistorical = Main.getParams().get('defaultperiod') === 'h';
    this._floatBars = Main.getParams().has("floatBars");
    
    this._statusLights = new StatusLight(this._id + "_lights", this, Main._drawBarWidth, Main._minToolbarHeight);
    this._statusLights.setLocation(Component.COMPONENT_X_GAP, 0);
    this.add(this._statusLights);
    
    Main.getSession()._root._statusLights = this._statusLights;
    
    this._feed = f;
    this._feedOffset = (fo === undefined) ? 0 : fo;
    
    this._chart = new Chart(this._id + "_chart", this);
    this.add(this._chart);
    this._chart.initialiseParams();
    this._chart.initialiseDrawArea();
    this._chart.initialiseStudies();
    
    this._chartAvailableWidth = this.getWidth() - this._statusLights.getX() - this._statusLights.getWidth() - Component.COMPONENT_X_GAP;
    this._chartAvailableHeight = this.getHeight() - this._statusLights.getHeight() - Main._minMiscbarHeight;
    
    this._currentSymbolIndex = -1;
    this._syncedCharts = false;
    this._symbolSets = [];
    this._feedFields = [FeedRequest.P_BID_PRICE, FeedRequest.P_OFFER_PRICE, FeedRequest.P_OPEN_PRICE, FeedRequest.P_HIGH_PRICE, FeedRequest.P_LOW_PRICE, FeedRequest.P_CUR_PRICE, FeedRequest.P_BUY_VOLUME, FeedRequest.P_SELL_VOLUME, FeedRequest.P_UNKNOWN_VOLUME, FeedRequest.P_VOLUME, FeedRequest.P_BID_PRICE, FeedRequest.P_OFFER_PRICE, FeedRequest.P_PERIOD_1_CUR_OPEN, FeedRequest.P_PERIOD_1_CUR_HIGH, FeedRequest.P_PERIOD_1_CUR_LOW, FeedRequest.P_PERIOD_1_CUR_CLOSE, FeedRequest.P_PERIOD_1_BUY_VOLUME, FeedRequest.P_PERIOD_1_SELL_VOLUME, FeedRequest.P_PERIOD_1_UNKNOWN_VOLUME, FeedRequest.P_PERIOD_1_TOTAL_VOLUME];
    this._openPriceHackMarker = []; // Boolean[]
    this._loadState = PriceDataLoader.NOT_LOADING;
    
    // create Default scheme
    this._config = Config.getConfig("charts");
    this._config.set("Default", this.saveScheme());
    //
    
    // set scheme
    this._defaultScheme = Main.getParams().has("config_override") ? Main.getParams().get("config_override").toString() : this._config._defaultScheme;
    if (this._defaultScheme && this._config.hasScheme(this._defaultScheme)) {
        let mycfg = new Map(this._config.get(this._defaultScheme));
        let ss0 = Main.getParams().get("ss0").toString();
        let p = parseInt(ss0.substring(0, ss0.indexOf(",")), 10);
        let ssList = ss0.substring(ss0.indexOf(",") + 1);
        let tmp = SymbolSet.parseSymbolSetString(ssList);
        if (Utils.hasFeature(Main.getParams(), "EQUI_D")) {
            
        } else if (tmp[0].length === 1) {
            let mainSym = tmp[0][0];
            let fr = tmp[1][0];
            ss0 = p + "," + mainSym + "," + fr;
            for (let i = 1; i <= Chart.MAX_OVERLAYS; i++) {
                let s = mycfg.get("o" + i);
                if (s && ss0.indexOf(s) === -1) {
                    ss0 = ss0 + "," + s + "," + fr;
                }
            }
            mycfg.set("ss0", ss0);
        }
        mycfg.forEach(function(value, key, map){
            if (key && key.toLowerCase() !== "sid") {
                Main.setParamsKeyValue(key, value);
            }
        })
    }
    //
    if (!this._noToolbar) {
        if (this._noFeed) {
            this._proChartsBar = new ProChartsToolbar(this._id + "_proToolBar", this);
            this.add(this._proChartsBar);
        }
        this._miscBar = new MiscToolbar(Main.getParams(), this._id + "_miscbar", this);
        this.add(this._miscBar);
        this._toolbar = new Toolbar(Main.getParams(), this._id + "_toolbar", this);
        this.add(this._toolbar);
        this._drawBar = new DrawingToolbar(Main.getParams(), this._id + "_drawbar", this);
        this.add(this._drawBar);
    }
    let cw = Main.getChartWidth();
    let ch = Main.getChartHeight();
    this.arrangeComponents(cw, ch);
    
    if (Main.getSession()._sid && Main.getSession()._sid.length > 0) {
        this._constructorInProgress = true;
        this._loadNewSymbolSets();
    } else {
        this._noFeed = true;
    }
}
/*
 * Inheriting
 */
ChartContainer.prototype = Object.create(Component.prototype);
ChartContainer.prototype.constructor = ChartContainer;
/** @override */
ChartContainer.prototype.setBounds = function(x, y, width, height) {
    if (x < 0) x = 0;
    if (y < 0) y = 0;
    if (Component.prototype.setBounds.call(this, x, y, width, height)) {
        if (this._chart && (this._noToolbar || this._floatBars)) {
            this._chart.setSize(width, height);
            this._chart.repaint();
        }
        return true;
    }
    return false;
}
ChartContainer.prototype.webSaveDrawingObjects = function() {
    let data = this._chart._currentSymbol.getDrawingObjects();
    let json = {};
    data.forEach(function(value, key, map) {
        json[key] = value;
    });
    json = JSON.stringify(json);
    if (data.size > 0) {
        let params = "mainsymbol=" + this._chart._currentSymbol.mainSymbol().replace('\\', '_');
        params += "|daily=" + (this._chart._currentSymbol.mainFrequency() < PriceDataConstants.FREQUENCY_D ? "0" : "1");
        params += "|data=" + btoa(json);
        $.ajax({
            type: "POST",
            url: Main.getAdvfnURL() + "p.php?java=savedrawing",
            data: "param=" + encodeURIComponent(params),
            contentType: "application/x-www-form-urlencoded; charset=UTF-8",
            success: function(responseData, textStatus, jqXHR) {
                if (responseData.length === 0) {
                    return;
                }
                let response = responseData.toString().split("\n");
                let error = parseInt(response[0], 10);
                if (error !== 0) {
                    console.log("WebQuery: Error while trying to save drawing objects: ", ErrorCodes.strings[error]);
                }
            },
            error: function(responseData, textStatus, errorThrown) {
                console.log("WebQuery: Error while trying to save drawing objects:", textStatus);
            }
        });
    }
}
ChartContainer.prototype.webLoadDrawingObjects = function() {
    let params = "mainsymbol=" + this._chart._currentSymbol.mainSymbol().replace('\\', '_');
    params += "|daily=" + (this._chart._currentSymbol.mainFrequency() < PriceDataConstants.FREQUENCY_D ? "0" : "1");
    let self = this;
    $.ajax({
        type: "POST",
        url: Main.getAdvfnURL() + "p.php?java=loaddrawing",
        data: "param=" + encodeURIComponent(params),
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        success: function(responseData, textStatus, jqXHR) {
            self.onDoneWebLoadDrawingObjects(responseData);
        },
        error: function(responseData, textStatus, errorThrown) {
            console.log("WebQuery: Error while trying to load drawing objects:", textStatus);
        }
    });
}
/**
 * @param {Array} response
 */
ChartContainer.prototype.onDoneWebLoadDrawingObjects = function(response) {
    if (response.length === 0) {
        return;
    }
    response = response.toString().split("\n");
    let error = parseInt(response[0], 10);
    if (error !== 0) {
        console.log("WebQuery: Error while trying to load drawing objects: ", ErrorCodes.strings[error]);
        return;
    }
    let numRows = parseInt(response[1], 10);
    let numColumns = parseInt(response[2], 10);
    let table = new WebQuery_Table(numColumns, numRows);
    let lineNum = 3;
    for (let i = 0; i < numColumns; i++) {
        table._columnName[i] = response[lineNum];
        lineNum++;
    }
    for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numColumns; j++) {
            table._contents[i][j] = Utils.replace(response[lineNum], "\u001b", "\n");
            lineNum++;
        }
    }
    // parse data
    if (numColumns === 2) {
        let rowData = atob(table._contents[0][1]);
        let data = JSON.parse(rowData);
        this._chart._currentSymbol.initDrawingObjects(data);
        this._chart.repaint();
        this._chart.process();
    }
}
/**
 * @param {boolean} s
 */
ChartContainer.prototype.setSyncedSymbolSets = function(s) {
    if (s !== this._syncedCharts) {
        this._syncedCharts = s;
        if (!this._editingNewSymbolSet)
            this.doSync();
    }
}
/**
 * @param {string} s
 */
ChartContainer.prototype.changeScheme = function(s) {
    let h = this._config.get(s);
    if (h === undefined) {
        h = this._config.get(this._config._defaultScheme);
    }
    if (h.has("cw") && h.has("ch")) {
        let newW = parseInt(h.get("cw").toString(), 10);
        let newH = parseInt(h.get("ch").toString(), 10);
        if (this._chart.getWidth() !== newW || this._chart.height !== newH) {
            this.resize(newW, newH);
        }
    }
    this._initialiseState(h, false);
    if (h.has("ss0") && Utils.hasFeature(Main.getParams(), "EQUI_D")) {
        let ss0 = h.get("ss0");
        this._currentSymbol.changeSymbols(ss0);
        let p = parseInt(ss0.substring(0, ss0.indexOf(",")), 10);
        this._currentSymbol.changeFrequency(p, this._currentSymbol.mainFrequency(), true);
        this._toolbar.changeSymbols(this._currentSymbol);
    } else {
        for (let i = 1; i <= Chart.MAX_OVERLAYS; i++) {
            this._toolbar._overlaySymbols[i - 1].setSymbol("");
            if (h.get("o" + i)) {
                this._toolbar._overlaySymbols[i - 1].setSymbol(h.get("o"+ i));
            }
        }
        this._toolbar.handleSymbolSelect();
    }
}
ChartContainer.prototype.doSync = function() {
    if (this._syncedCharts) {
        for (let i = 0; i < this._symbolSets.length; i++) {
            if (i !== this._currentSymbolIndex) {
                this._symbolSets[i].syncTo(this._currentSymbol);
            }
        }
    }
}
ChartContainer.prototype.deleteSymbolSet = function() {
    if (!this._editingNewSymbolSet)
        this._loader.deleteSymbolSet(this._currentSymbol);
    this._symbolSets.splice(this._currentSymbolIndex, 1);
    this._proChartsBar.removeSymbolSet(this._currentSymbolIndex);
    if (this._symbolSets.length === 0) {
        this._currentSymbolIndex = -1;
        this.addSymbolSet();
    } else {
        this.setCurrentSymbolSet(this._currentSymbolIndex === this._symbolSets.length ? this._currentSymbolIndex - 1 : this._currentSymbolIndex);
    }
}
ChartContainer.prototype.addSymbolSet = function() {
    let newSet = new ChartSymbolSet(this._loader, this._chart, [], [], this._toolbar.getPeriod());
    this._symbolSets.push(newSet);
    this._editingNewSymbolSet = true;
    this._proChartsBar.addNewSymbolSet(_("procharts_newchart"), true);
    this.setCurrentSymbolSet(this._symbolSets.length - 1);
    this._loader.addSymbolSet(newSet);
    RootComponent.captureMouse(this._toolbar._mainSymbol._editBox);
    return newSet;
}
/**
 * @param {Array} syms
 */
ChartContainer.prototype.changeSymbols = function(syms) {
    console.log("changeSymbols", syms.toString());
    if (syms.length === 0)
        return;
    let newParams = this.buildParams(true);
    let ssNum = "ss" + this._currentSymbolIndex;
    
    // fix for freq and period 
    if (this._currentSymbol) {
        this._toolbar.buildFreqList(this._currentSymbol._period, this._currentSymbol.mainFrequency());
    }
    //
    let newSS = this._toolbar.getPeriod().toString();
    if (!newParams) {
        return;
    }
    for (let item of syms) {
        newSS += "," + item + "," + this._toolbar.getFrequency();
    }
    newParams.set(ssNum, newSS);
    this._originalBaseSymbol = this._currentSymbol.mainSymbol();
    
    if (this._editingNewSymbolSet) {
        this._currentSymbol.changeSymbols(newSS);
        if (this._currentSymbol._isValid) {
            this._toolbar._mainSymbol.setComponentHighlight(false);
            if (this._currentSymbol._period === ChartSymbolSet.PERIOD_RANGE) {
                let from = parseFloat(Main.getParams().get("from").toString()) * 60000;
                let to = parseFloat(Main.getParams().get("to").toString()) * 60000;
                this._currentSymbol.initialiseDateRangePeriod(from, to);
            } else {
                this._currentSymbol.initialiseRangeFromPeriod(true);
            }
            this._currentSymbol.setStart(new Date(this._currentSymbol.getMasterTimeList().add(this._currentSymbol._timeStart, - this._chart.calcMaxStudyRange())));
            this._currentSymbol.setEnd(new Date(this._currentSymbol.getMasterTimeList().add(this._currentSymbol._timeEnd, 10)));
            this._editingNewSymbolSet = false;
        }
    } else {
        let oldIsValid = this._currentSymbol._isValid;
        this._currentSymbol.changeSymbols(newSS);
        if (!oldIsValid) {
            if (this._currentSymbol._period === ChartSymbolSet.PERIOD_RANGE) {
                let from = parseFloat(Main.getParams().get("from").toString()) * 60000;
                let to = parseFloat(Main.getParams().get("to").toString()) * 60000;
                this._currentSymbol.initialiseDateRangePeriod(from, to);
            } else {
                this._currentSymbol.initialiseRangeFromPeriod(true);
            }
        }
        if (this._noFeed) {
            this._currentSymbol.setAllNew();
        }
    }
    if (!(this._originalBaseSymbol && this._originalBaseSymbol === this._currentSymbol.mainSymbol())) {
        if (this._currentSymbol._drawObjects) {
            this._currentSymbol._drawObjects = [];
        }
    }
    this.setCurrentSymbolSet(this._currentSymbolIndex);
    if (!this._currentSymbol)
            return;
   if (this._toolbar._outsideData) {
        this._chart.setOutsideData(this._toolbar._outsideData.getChecked());
    }
    if (this._currentSymbol._isValid) {
        this._currentSymbol.initialiseRangeFromPeriod(true);
    }
    this._editingNewSymbolSet = false;

    if (!this._noHotticker) {
        if (this._chart._hotTicker) {
            this._chart._hotTicker.stop();
        }
        this._chart._hotTicker = new HotTicker(this._chart, newParams);
        if (this._chart._tickScopeOpen) {
            this._chart.showTickScope();
        }
    }

    if (!this._noToolbar) {
        this._toolbar.loadMemos(this._currentSymbol.symbols());
    }
    if (this._proChartsBar) {
        this._proChartsBar.updateText(this._currentSymbol.getDescriptionText(), this._currentSymbolIndex);
        this._proChartsBar.refresh();
    }
    if (this._chart._canvas._overlays[0] && this._chart._canvas._overlays[0]._study && this._chart._canvas._overlays[0]._study.length > 0) {
        for (let item of this._chart._canvas._overlays[0]._study) {
            if (item) {
                item.restartStudy();
            }
        }
    }
    this._chart.setAutoScale(true);
    if (this._currentSymbol._isValid) {
        this._chart.symbolsChanged();
        this._chart.recalc();
    } else {
        this._toolbar._mainSymbol.setComponentHighlight(true);
    }
    if (!(this._originalBaseSymbol && this._originalBaseSymbol === this._currentSymbol.mainSymbol())) {
        this._chart.setLevel2Scope(false);
        if (this._drawBar && this._drawBar._l2scopeButton) {
            this._drawBar._l2scopeButton.setDown(false);
        }
    }
    this._chart.repaint();
    this._initialiseFeed();
}
/**
 * @param {number} p - period
 * @param {number} f - frequency
 * @param {boolean} reset
 */
ChartContainer.prototype.changeFrequency = function(p, f, reset) {
    if (this._editingNewSymbolSet)
        return;
    this._currentSymbol.changeFrequency(p, f, reset);
    this.setCurrentSymbolSet(this._currentSymbolIndex);
    this.doSync();
    this._chart.setAutoScale(true);
    if (this._proChartsBar) {
        this._proChartsBar.updateText(this._currentSymbol.getDescriptionText(), this._currentSymbolIndex);
    }
    this.process();
}
/**
 * @param {boolean} addSymbolInfo
 */
ChartContainer.prototype.buildParams = function(addSymbolInfo) {
    let p = new Map();
    if (this._toolbar) {
        var d = this._toolbar.getChartSize();
        p.set("w", d.getWidth().toString());
        p.set("h", d.getHeight().toString());
        p.set("cw", d.getWidth().toString());
        p.set("ch", d.getHeight().toString());
    }
    p.set("advfn_url", Main.getAdvfnURL());
    p.set("user", Main.getUserName());
    p.set("sid", Main.getSID());
    p.set("page_key", Main.getParams().get("page_key"));
    if (Main.getParams().has("nofeed")) {
        p.set("nofeed", Main.getParams().get("nofeed"));
    }
    if (addSymbolInfo || Utils.hasFeature(Main.getParams(), "EQUI_D")) {
        p.set("curss", this._currentSymbolIndex.toString());
        for (let i = 0; i < this._symbolSets.length; i++) {
            let cur = this._symbolSets[i];
            p.set("ss" + i, cur._period + "," + cur.getParamString());
        }
    }
    if (this._toolbar) {
        if (this._toolbar.getPeriod() === ChartSymbolSet.PERIOD_RANGE) {
            p.set("from", this._toolbar.getDate(Toolbar.DR_FROM).toString());
            p.set("to", this._toolbar.getDate(Toolbar.DR_TO).toString());
        }
        if (this._toolbar._logScaleCheckbox.getChecked()) {
            p.set("log", "1");
        }
    }
    if (this._miscBar) {
        p.set("style", this._miscBar.getStyle().toString());
        p.set("yc", this._miscBar._yestClose.getDown() ? "1" : "0");
    } else {
        if (Main.getParams().has("style")) {
            p.set("style", Main.getParams().get("style"));
        }
        if (Main.getParams().has("yc")) {
            p.set("yc", Main.getParams().get("yc"));
        }
    }
    if (Main.getParams().has("f")) {
        p.set("f", Main.getParams().get("f"));
    }
    if (this._chart) {
        let lastAdded = 0;
        for (let j = 0; j <= Chart.MAX_OVERLAYS; j++) {
            for (let i = 0; i < Chart.MAX_STUDIES; i++) {
                if (this._chart._canvas._overlays[j] && this._chart._canvas._overlays[j]._study[i]) {
                    p.set("s" + lastAdded, this._chart._canvas._overlays[j]._study[i].getMnemonic());
                    p.set("sp" + lastAdded, this._chart._canvas._overlays[j]._study[i].getParams());
                    lastAdded++;
                }
            }
        }
    }
    if (this._chart._currentSymbol && this._chart._currentSymbol._entries) {
        for (let i = 1; i < this._chart._currentSymbol._entries.length; i++) {
            p.set("o" + i, this._chart._currentSymbol._entries[i]._symbol);
            p.set("ostyle" + i, (this._chart._mainOverlay._study[Overlay.OVERLAY_STUDY_ID - 1 + i])._style.toString());
        }
    }
    if (this._chart) {
        p.set("drawingThickness", this._chart._drawingThickness.toString());
        p.set("objectColour", this._chart._objectColour.getLong());
    } else {
        p.set("drawingThickness", "1");
    }
    return p;
}
ChartContainer.prototype.saveScheme = function() {
    let items = this.buildParams(false);
    items.delete("symbol");
    items.delete("sid");
    items.delete("page_key");
    items.delete("nofeed");
    return items;
}
/** @override */
ChartContainer.prototype.process = function(t) {
    let res = false;
    if (!t) 
        t = new Date().getTime();
    if (!this._noFeed && this._feed && this._feed.process(t)) {
        res = true;
    }
    if (this._loader) {
        let curSec = Math.trunc(t / 1000);
        if (curSec !== this._lastSecond) {
            this._lastSecond = curSec;
            if (this._currentSymbol && !this._currentSymbol.hasData() && this._currentSymbol._attempts > 3) {
            } else {
                res = this._loader.load();    
            }
        }
    }
    if (this._chart) {
        res = this._chart.process(t, res);
    }
    return res;
}
/**
 * @param {number} idx
 */
ChartContainer.prototype.setCurrentSymbolSet = function(idx) {
    if (this._currentSymbol && this._chart._mainOverlay) {
        this._currentSymbol = this._chart._mainOverlay.storeValues(this._currentSymbol);
        this._currentSymbol._attempts = 0;
    }
    let setToDifferentSet = this._currentSymbolIndex !== idx;
    this._currentSymbolIndex = idx;
    this._currentSymbol = this._symbolSets[idx];
    this._chart._currentSymbol = this._currentSymbol;
    if (!this._currentSymbol._isValid) {
        this._chart._frequency = this._defaultToHistorical ? PriceDataConstants.FREQUENCY_D : PriceDataConstants.FREQUENCY_1;
        for (let i = 0; i <= Chart.MAX_STUDIES; i++) {
            if (this._chart._canvas._overlays[i] && this._chart._canvas._overlays[i]._legend) {
                this._chart._canvas._overlays[i]._legend.setVisible(false);
            }
        }
        this._chart.setVisible(false);
        this._chart.refresh();
        if (!this._noToolbar) {
            this._toolbar._mainSymbol.setComponentHighlight(true);
        }
    } else {
        if (!this._noToolbar) {
            this._toolbar._mainSymbol.setComponentHighlight(false);
        }
        this._chart._frequency = this._currentSymbol.mainFrequency();
        
        this.initNewOverlay();
        
        this._chart.symbolsChanged();
        this._chart._mainOverlay.setValues();
        this._chart.setAutoScale(true);
        if (this._chart._mainOverlay._study[Chart.MAX_STUDIES] === undefined) {
            this._chart._mainOverlay._study[Overlay.YC_STUDY_ID] = new StudyYC(this._chart._mainOverlay);
            if (this._chart._mainOverlay._legend) {
                this._chart._yestCloseLegendId = this._chart._mainOverlay._study[Chart.MAX_STUDIES].initLegend(Color.red);
                this._chart.setShowYestClose(this._chart._showYestClose);
            }
        } else {
            this._chart.setShowYestClose(this._chart._showYestClose);
        }
        if (this._miscBar) {
            this._miscBar._yestClose.setDown(this._chart._showYestClose);
        }
        this._chart.setVisible(true);
        this._chart.refresh();
        this._chart.setRecalcStudies();
    }
    this._chart.repaint();
    if (!this._noToolbar) {
        this._drawBar.setVisible(this._chart.isValid());
        this._drawBar.refresh();
        this._miscBar.setActive(this._chart.isValid());
        this._miscBar.refresh();
        this._toolbar.setDateRangeVisible(this._toolbar.getPeriod() === ChartSymbolSet.PERIOD_RANGE);
        // todo: delete
        if (this._currentSymbol) {
            this._toolbar.initOverlayStyleButtons(this._currentSymbol);
        }
        //
        if (setToDifferentSet) {
            this._toolbar.changeSymbols(this._currentSymbol);
        }
    }
    if (this._proChartsBar) {
        this._proChartsBar.setCurrentSymbolSet(this._currentSymbolIndex);
    }
}
ChartContainer.prototype.initNewOverlay = function() {
    let st = StudyStock.ST_NORMAL;
    if ("jp" === this._view) {
        st = StudyStock.ST_CANDLE;
    }
    if (this._chart._mainOverlay._study[Overlay.MAIN_STUDY_ID]) {
        st = (this._chart._mainOverlay._study[Overlay.MAIN_STUDY_ID])._style;
    } else if (Main.getParams().has("style")) {
        st = parseInt(Main.getParams().get("style").toString(), 10);
    }
    if (!this._noToolbar) {
        this._miscBar.setChartLineStyle(st);
    }
    this._currentSymbol.initialiseStockStudies(st);
}
ChartContainer.prototype.stop = function() {
    if (this._chart._hotTicker) {
        this._chart._hotTicker.stop();
    }
    if (this._feed) {
        this._feed.stop();
        this._feed = undefined;
    }
}
ChartContainer.prototype.destroy = function() {
    if (this._symbolSets) {
        for (let ss of this._symbolSets) {
            this._loader.deleteSymbolSet(ss);
            ss.destroy();
        }
    }
    this._symbolSets = undefined;
    this._currentSymbol = undefined;
    if (this._config) {
        this._config = undefined;
    }
}
/**
 * @param {number} newwidth
 * @param {number} newheight
 */
ChartContainer.prototype.resize = function(newwidth, newheight) {
    Main.formatSizes(newwidth, newheight);
    this.setSize(Main._frameWidth, Main._frameHeight);
    Main.getSession()._root.setSize(Main._frameWidth, Main._frameHeight);
    this.arrangeComponents(Main._chartWidth, Main._chartHeight);
    this._chart.resizeOverlays();
    this.refresh();
}
/**
 * @param {number} state
 */
ChartContainer.prototype.changeStatus = function(state) {
    if (this._statusLight) {
        this._statusLight.changeStatus(state);
    }
}
/**
 * @param {number} chartWidth
 * @param {number} chartHeight
 */
ChartContainer.prototype.arrangeComponents = function(chartWidth, chartHeight) {
    
    this._toolbar.setBounds(this._statusLights.getX() + this._statusLights.getWidth(), this._statusLights.getY(), Math.max(Main._minToolbarWidth, chartWidth), this._statusLights.getHeight());
    
    let cx = this._statusLights.getX() + this._statusLights.getWidth();
    if (this._chartAvailableWidth > chartWidth) {
        cx += (this._chartAvailableWidth - chartWidth) / 2;
    }
    let cy = this._toolbar.getY() + this._toolbar.getHeight();
    if (this._proChartsBar) {
        this._proChartsBar.setBounds(this._toolbar._x + (this._toolbar._width - Main._proToolbarWidth) / 2, cy, Main._proToolbarWidth, Main._proToolbarHeight);
        cy = this._proChartsBar.getY() + this._proChartsBar.getHeight();
    }
    
    this._chart.setBounds(cx, cy, chartWidth, chartHeight);

    this._miscBar.setBounds(this._toolbar.getX(), this._chart.getY() + this._chart.getHeight(), this._toolbar.getWidth(), Main._minMiscbarHeight);
    
    if (this._noToolbar || this._floatBars) {
        this._chart.setBounds(0, 0, chartWidth, chartHeight);
        if (this._drawBar) {
            this._drawBar.setOrientation(false);
        }
        return;
    }
    let vertical = chartHeight >= Main._minDrawbarHeight;
    if (vertical) {
        this._drawBar.bottomOf(this._statusLights, 0, 0, this._statusLights.getWidth(), this._chart.getHeight());
    } else {
        this._drawBar.bottomOf(this._miscBar, 0, Component.COMPONENT_Y_GAP * 2, this._miscBar.getWidth(), this._statusLights.getWidth());
    }
    this._drawBar.setOrientation(vertical);
}
/**
 * @param {number} state
 */
ChartContainer.prototype.WebLoader_GetInfoDelegate_loadStateChanged = function(state) {
    if (this._loadState !== state && state !== 0) {
        this._loadState = state;
        this._chart.repaint();
        this._chart.setRecalcStudies();
        this._chart.process();
    } else {
        this._loadState = state;
    }
}
/**
 * @param {Array} gets
 * @param {Array} counts
 */
ChartContainer.prototype.WebLoader_GetInfoDelegate_loadCompleted = function(gets, counts) {
    if ((counts.length === 0 || counts[0] === null) && this._chart._currentSymbol) {
        this._chart._currentSymbol._attempts++;
    }
    if (this._constructorInProgress) {
        this._constructorInProgress = false;
        // set currentSymbolSet
        let c = -1;
        if (this._symbolSets.length > 0) {
            c = Main.getParams().has("curss") ? parseInt(Main.getParams().get("curss").toString(), 10) : 0;
        } else {
            this._editingNewSymbolSet = true;
        }
        this.setCurrentSymbolSet(Math.max(0, c));
        //
        // set states for toolbars
        this._initialiseState(Main.getParams(), true);
        //

        // load memos
        if (!this._noToolbar && Main.getParams()["memo"]) {
            this._toolbar.loadMemos(Main.getParams()["memo"].toString());
        }
        //

        //
        for (let i = 1; i < this._currentSymbol.size(); i++) {
            let st = 0;
            if (Main.getParams().get("ostyle" + i)) {
                st = parseInt(Main.getParams().get("ostyle" + i).toString(), 10);
            }
            this._chart._mainOverlay._study[Overlay.OVERLAY_STUDY_ID - 1 + i]._style = st;
        }
        //
        this._lastSecond = Math.trunc(new Date().getTime() / 1000);
    }
    
    this._chart.repaint();
    this._chart.setRecalcStudies();
    this.process();
}
ChartContainer.prototype.stopWorker = function() {
    if (ChartContainer.feedWorker) {
        ChartContainer.feedWorker.terminate();
    }
}
/** @override */
ChartContainer.prototype.feedDelegate_loadingComplete = function(contents) {}
/** @override */
ChartContainer.prototype.feedDelegate_feed = function(contents) {
    contents._id -= this._feedOffset;
    if (!contents._contents || contents._id < 0) 
        return;
    if (contents._id === 0) {
        let ts = parseInt(contents._contents, 10);
        this._undelayedTime = (this._symbolSets[0]).getMasterTimeList().convertTimestamp(ts, PriceDataConstants.FREQUENCY_1);
        this._loader._timestamp = this._undelayedTime;
        for (let cur of this._symbolSets) {
            var curMTL = cur.getMasterTimeList();
            var atEnd = cur._timeEnd.getTime() === curMTL.moveBackIntoMarketHours(cur._time).getTime();
            cur._time = curMTL.convertTimestamp(ts - cur._delay * 60, cur.mainFrequency());
            if (atEnd && curMTL.insideMarketHours(cur._time.getTime())) {
                cur.setTimeEnd(cur._time);
            }
            if (cur._time.getTime() > curMTL.getByIndex(-1) && curMTL.insideMarketHours(cur._time.getTime())) {
                curMTL.set(cur._time.getTime());
            }
        }
        if (this._openPriceHackMarker) {
            for (let i = 0; i < this._openPriceHackMarker.length; i++) {
                this._openPriceHackMarker[i] = false;
            }
        }
        this._chart.setRecalcStudies();
        this._chart.repaint();
        return;
    }
    contents._id--;
    let idx = Math.trunc(contents._id / this._feedFields.length);
    
    let field = contents._id % this._feedFields.length;
    let val = parseFloat(contents._contents);
    if (isNaN(val)) 
        return;
//    console.log("idx", idx);
    if (idx >= this._currentSymbol._entries.length)
        return;
    let sym = this._currentSymbol._entries[idx]._symbol;
    let si = this._loader._symbolInfo.get(sym);
    if (!this._openPriceHackMarker || this._openPriceHackMarker.length !== this._currentSymbol._entries.length) {
        this._openPriceHackMarker = new Array(this._currentSymbol._entries.length);
    }
    if (field <= 9) {
        if (this._undelayedTime && !PriceDataLoader.loading) {
            let fd = this._loader.getData(this, sym, PriceDataConstants.FREQUENCY_D);
            if (field === 3 || field === 4) {
                let intraTime = new Date(this._undelayedTime.getTime() - si._delay * 60000);
                if (!fd._timeList.insideMarketHours(intraTime.getTime())) 
                    return;
            }
            let setTime = fd._timeList.convertTime(this._undelayedTime, PriceDataConstants.FREQUENCY_D);
            if (!isNaN(val)) {
                fd._proxies[field].set(setTime, val);
                this._loader.aggregateSetUpwards(fd, setTime);
                this._chart.repaint();
                this._chart.setRecalcStudies();
            }
        }
        if (field === 2) {
            si._openPrice = val;
        }else if (field === 3) {
            si._highPrice = val;
//            console.log(sym, "high: ", val);
        } else if (field === 4) {
            si._lowPrice = val;
//            console.log(sym, "low: ", val);
        } else if (field === 5) {
//            console.log("curPrice", val);
            si._curPrice = val;
        }
    } else if (field <= 19) {
        if (!this._undelayedTime) 
            return;
        let setTime = new Date(this._undelayedTime.getTime() - si._delay * 60000);
        let fd = this._loader.getData(this, sym, PriceDataConstants.FREQUENCY_1);
        if (!fd._timeList.insideMarketHours(setTime.getTime())) 
            return;
        field -= 10;
        if (field === 2) {
            this._openPriceHackMarker[idx] = true;
        }
        if (isNaN(val)) 
            return;
        if (field === DataAggregator.S_CUR_HIGH || field === DataAggregator.S_CUR_LOW) {

        } else if (field === DataAggregator.S_CUR_CLOSE) {
            fd._proxies[field].set(setTime, val);
            fd._proxies[DataAggregator.S_CUR_HIGH].set(setTime, Math.max(val, fd._proxies[DataAggregator.S_CUR_HIGH].getUnscaled(setTime)));
            fd._proxies[DataAggregator.S_CUR_LOW].set(setTime, Math.min(val, fd._proxies[DataAggregator.S_CUR_LOW].getUnscaled(setTime)));
        } else if (field === DataAggregator.S_BUY_VOLUME || field === DataAggregator.S_SELL_VOLUME || field === DataAggregator.S_TOTAL_VOLUME || field === DataAggregator.S_UNKNOWN_VOLUME) {
            if (val < fd._proxies[field].get(setTime)) {

            } else {
                fd._proxies[field].set(setTime, val);
            }
        } else {
            fd._proxies[field].set(setTime, val);
        }
        if (field === DataAggregator.S_CUR_CLOSE && !this._openPriceHackMarker[idx]) {
            fd._proxies[DataAggregator.S_CUR_OPEN].set(setTime, val);
            fd._proxies[DataAggregator.S_CUR_HIGH].set(setTime, val);
            fd._proxies[DataAggregator.S_CUR_LOW].set(setTime, val);
            this._openPriceHackMarker[idx] = true;
        }
        this._loader.aggregateSetUpwards(fd, setTime);
        this._chart.repaint();
        this._chart.setRecalcStudies();
    }
}
/** @override */
ChartContainer.prototype.handleMouseDown = function(x, y, b) {
    RootComponent.captureMouse(this);
	if (this.onMouseDown(x - this._x, y - this._y, b)) 
        return true;
    return Component.prototype.handleMouseDown.call(this, x, y, b);
}
/** @override */
ChartContainer.prototype.onMouseDown = function(x, y, b) {
    return false;
}
/** @override */
ChartContainer.prototype.handleMouseUp = function(x, y) {
	if (this.onMouseUp(x - this._x, y - this._y)) 
        return true;
    return Component.prototype.handleMouseUp.call(this, x, y);
}
/** @override */
ChartContainer.prototype.onMouseUp = function(x, y) {
    RootComponent.releaseMouse(this);
	return false;
}
/** @override */
ChartContainer.prototype.handleMouseMove = function(x, y) {
	if (this.onMouseMove(x - this._x, y - this._y)) 
        return true;
    return Component.prototype.handleMouseMove.call(this, x, y);
}
/** @override */
ChartContainer.prototype.onMouseMove = function(x, y) {
    return false;
}
ChartContainer.prototype.onCaptureLost = function() {
    return true;
} 
ChartContainer.prototype.getCurrentSymbolsIndex = function() {
    return this._currentSymbolIndex;
}
ChartContainer.prototype.getLoadState = function() {
    return this._loadState;
}
ChartContainer.prototype.getView = function() {
    return this._view;
}
ChartContainer.prototype.getNoFeed = function() {
    return this._noFeed;
}
ChartContainer.prototype.getNoHotticker = function() {
    return this._noHotticker;
}
ChartContainer.prototype.getNoToolbar = function() {
    return this._noToolbar;
}
ChartContainer.prototype.getDefaultToHistorical = function() {
    return this._defaultToHistorical;
}
ChartContainer.prototype.getDefaultScheme = function() {
    return this._defaultScheme;
}
ChartContainer.prototype.getToolbar = function() {
    return this._toolbar;
}
ChartContainer.prototype.getMiscToolbar = function() {
    return this._miscBar;
}
ChartContainer.prototype.getDrawBar = function() {
    return this._drawBar;
}
ChartContainer.prototype.getConfig = function() {
    return this._config;
}
/** @private */
ChartContainer.prototype._loadNewSymbolSets = function() {    
    this._loader = PriceDataLoader.createLoader(this);
    this._currentSymbol = undefined;
    if (this._chart) {
        this._chart._currentSymbol = undefined;
    }
    let allSymbols = [];
    let idx = 0;
    let key = 'ss' + idx;
    while(Main.getParams().has(key)) {
        let val = Main.getParams().get(key); // for example: '9,FX^EURUSD,6'
        let period = parseInt(val.substring(0, val.indexOf(',')), 10);
        let ssList = val.substring(val.indexOf(',') + 1);
        let tmp = SymbolSet.parseSymbolSetString(ssList);
        let syms = tmp[0];
        allSymbols.push(syms);
        this._loader._info.push([period, syms, tmp[1]]);
        idx++;
        key = 'ss' + idx;
    }
    if (allSymbols.length > 0) {
        this._loader.getChartInfo(allSymbols);
        let sets = [];
        let info = this._loader._info;
        this._loader._info = [];
        for (let curInfo of info) {
            sets.push(new ChartSymbolSet(this._loader, this._chart, curInfo[1], curInfo[2], curInfo[0]));
        }
        if (sets.length > 0) {
            for (let i = 0; i < sets.length; i++) {
                let ss = sets[i];
                if (ss._period === ChartSymbolSet.PERIOD_RANGE) {
                    let from = parseFloat(Main.getParams().get("from").toString()) * 60000;
                    let to = parseFloat(Main.getParams().get("to").toString()) * 60000;
                    ss.initialiseDateRangePeriod(from, to);
                } else {
                    ss.initialiseRangeFromPeriod(true);
                }
                if (ss._isValid) {
                    ss.setStart(ss.getMasterTimeList().moveBackToStartOfDay(ss._timeStart));
                }
                this._loader.addSymbolSet(ss);
                this._symbolSets.push(ss);
                if (this._proChartsBar) {
                    this._proChartsBar.addNewSymbolSet(ss.getDescriptionText(), false);
                }
                if (i === 0 && Main.getParams().has("do0")) {
                    ss._chart._currentSymbol = ss; 
                    ss.initDrawingObjects(Main.getParams());
                }
            }
            this._loader.load();
        }
    }
}
/** 
 * @private 
 * @param {Map} p
 * @param {boolean} transparent
 */
ChartContainer.prototype._initialiseState = function(p, transparent) {
    if (p.has("drawingThickness")) {
        var t = parseInt(p.get("drawingThickness"), 10);
        this._chart._drawingThickness = t;
    } else {
        this._chart._drawingThickness = 1;
    }
    if (p.has("objectColour")) {
        var colourParam = parseInt(p.get("objectColour"), 10);
        this._chart._objectColour = new Color(colourParam);
    } else {
        this._chart._objectColour = Color.black;
    }
    if (!this._noToolbar && this._toolbar) {
        this._toolbar.initialiseState(p, transparent);
        this._miscBar.initialiseState(p, transparent);
    }
}
/** @private */
ChartContainer.prototype._initialiseFeed = function() {
    if (this._noFeed || !this._currentSymbol || this._currentSymbol._entries.length === 0) {
        if (this._feed) {
            this._feed.stop();
            this._feed = undefined;
        }
        return;
    }
    
    let fieldCount = 1 + this._currentSymbol._entries.length * this._feedFields.length;
    let fr = new FeedRequest("chart");
    fr.cmdSymbol('===');
    fr.cmdParam(0xe0);
    for (let item of this._currentSymbol._entries) {
        fr.cmdSymbol(item._symbol);
        fr.cmdParamArray(this._feedFields);
    }
    if (this._feed) {
        this._feed.register('Chart', fr.toString(), fr.size(), this);
    } else {
        this._feed = new Feed('Chart', fr.toString(), fr.size(), this);    
    }
    this._feed.start();
}