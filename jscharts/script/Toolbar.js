/**
 * -------
 * Toolbar
 * -------
 * @constructor
 * @extends {Component}
 * @param {Map} p - parameters 
 * @param {string} id
 * @param {Component=} delegate
 */
function Toolbar(p, id, delegate) {
    Component.call(this, id, delegate);
    this._params = p;
    this._freqBase = 0;
    this._initMain();
    this._initTabs();    
}
/**
 * Inheriting
 */
Toolbar.prototype = Object.create(Component.prototype);
Toolbar.prototype.constructor = Toolbar;
/**
 * @param {string|Array} symbols
 */
Toolbar.prototype.loadMemos = function(symbols) {
    if (typeof symbols === "string") {
        let memo = Utils.replace(symbols, "%%", "\n");
        memo = Utils.replace(memo, "&#39", "'");
        let s = [memo];
        this.updateMemos(s);
        return;
    }
    if (symbols.length === 0)
        return;
    let symbol = symbols[0];
    let memos = new Array(1);
    if (Toolbar.memos_loaded === undefined) {
        Toolbar.memos_loaded = new Map();
    }
    if (Toolbar.memos_loaded.has(symbol)) {
        memos[0] = Toolbar.memos_loaded.get(symbol).toString();
        this.updateMemos(memos);
    } else {
        let tmp = "";
        for (let i = 0; i < symbols.length; i++) {
            tmp += (i === 0 ? "" : ",") + symbols[i];
        }
        let params = encodeURIComponent("symbols=" + tmp);
        let self = this;
        $.ajax({
            type: "POST",
            url: Main.getAdvfnURL() + "p.php?java=memoload",
            crossdomain: true,
            data: "param=" + params,
            dataType: "text",
            success: function(responseData, textStatus, jqXHR) {
//                console.log("Toolbar memo response:", responseData);
                self._parseMemoResponse(responseData, symbols);
            },
            error: function(responseData, textStatus, errorThrown) {
                console.log("Toolbar. Can't load memo: " + textStatus);
            }
        });
//        console.log("Toolbar start: memoload, param=" + params);
    }
}
/**
 * @private
 * @param {string} response
 * @param {Array|string} symbols
 */
Toolbar.prototype._parseMemoResponse = function(response, symbols) {
    if (response.length === 0) {
        console.log("Toolbar. Empty memo");
        return;
    }
    let symbolsArray = [];
    if (typeof symbols === "string") {
        symbolsArray = [symbols];
    } else {
        symbolsArray = symbols;
    }
    let responseArray = response.toString().split("\n");
    let error = parseInt(responseArray[0], 10);
    if (error !== 0) {
        console.log("Toolbar. Can't load memo: " + ErrorCodes.strings[error]);
        return;
    }
    let numRows = parseInt(responseArray[1], 10);
    let numColumns = parseInt(responseArray[2], 10);
    let table = new WebQuery_Table(numColumns, numRows);
    let lineNum = 3;
    for (let i = 0; i < numColumns; i++) {
        table._columnName[i] = responseArray[lineNum];
        lineNum++;
    }
    for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numColumns; j++) {
            table._contents[i][j] = Utils.replace(responseArray[lineNum], "\u001b", "\n");
            lineNum++;
        }
    }
    let memos = [];
    if (table._contents[0][0]) {
        memos = table._contents[0][0].split("|");
        for (let i = 0; i < symbolsArray.length; i++) {
            Toolbar.memos_loaded.set(symbolsArray[i], (memos.length > i) ? memos[i] : "");
        }
    }
    this.updateMemos(memos);
}
/** @override */
Toolbar.prototype.setParent = function(parent) {
    Component.prototype.setParent.call(this, parent);
    this.setChart(this._parent._chart);
}
/**
 * @param {Chart} c
 */
Toolbar.prototype.setChart = function(c) {
    this._chart = c;
    this._chart._toolbar = this;
}
/**
 * @param {boolean} visible
 */
Toolbar.prototype.setDateRangeVisible = function(visible) {
    if (visible) {
        this._dateRangeBox.show();
        this._guideBox.hide();
    } else {
        this._dateRangeBox.hide();
        this._guideBox.show();
    }
}
/** @override */
Toolbar.prototype.setBounds = function(x, y, w, h) {
    Component.prototype.setBounds.call(this, x, y, w, h);
    // init main
    this._main.setBounds(2, 2, this._width / 2 - 4, this._height - 4);
    this._searchButton.setBounds(this._main.getWidth() - Component.COMPONENT_X_GAP - 60, 10, 60, 20);
    this._ok.setBounds(this._searchButton.getX() - Component.COMPONENT_X_GAP - 40, this._searchButton.getY(), 40, this._searchButton.getHeight());
    this._mainSymbol.setBounds(Component.COMPONENT_X_GAP, this._searchButton.getY() - 1, this._ok.getX() - Component.COMPONENT_X_GAP * 2, 24);
    this._frequencyCombo.setBounds(this._main.getWidth() - Component.COMPONENT_X_GAP * 2 - 90, this._mainSymbol.getY() + this._mainSymbol.getHeight() + Component.COMPONENT_Y_GAP * 2, 90, 20);
    this._periodCombo.setBounds(this._frequencyCombo.getX() - Component.COMPONENT_X_GAP - 90, this._frequencyCombo.getY(), this._frequencyCombo.getWidth(), this._frequencyCombo.getHeight());
    this._dateRangeBox.setBounds(this._periodCombo.getX() - 70, this._periodCombo.getY() + this._periodCombo.getHeight() + Component.COMPONENT_Y_GAP * 2, this._main.getWidth() - this._periodCombo.getX() + 70 - Component.COMPONENT_X_GAP * 2, 54);
    this._guideBox.setBounds(Component.COMPONENT_X_GAP, this._periodCombo.getY() + this._periodCombo.getHeight() + Component.COMPONENT_Y_GAP * 2, this._main.getWidth() - Component.COMPONENT_X_GAP * 2, this._main.getHeight() - this._periodCombo.getY() - this._periodCombo.getHeight() - Component.COMPONENT_Y_GAP * 4);
    this._guideTitle.setBounds(0, 5, this._guideBox.getWidth(), 17);
    this._guideHandImage.setBounds(3, this._guideTitle.getY() + this._guideTitle.getHeight(), 13, this._guideTitle.getHeight());
    this._guideDragText.rightOf(this._guideHandImage, Component.COMPONENT_X_GAP, 0, this._guideBox.getWidth() - this._guideHandImage.getX() - this._guideHandImage.getWidth() - Component.COMPONENT_X_GAP, this._guideTitle.getHeight());
    this._guideAxesImage.bottomOf(this._guideHandImage, -3, Component.COMPONENT_Y_GAP, 21, 9);
    this._guideDragAxes.bottomOf(this._guideDragText, 0, 0, this._guideDragText.getWidth(), this._guideDragText.getHeight());
    this._guideRightClick.bottomOf(this._guideDragAxes, 0, 0, this._guideDragAxes.getWidth(), this._guideDragAxes.getHeight());
    // init tabs
    this._tabs.setBounds(this._width / 2 + 2, 2, this._width / 2 - 4, this._height - 4);
    for (let i = 0; i < Toolbar.NUM_OVERLAYS; i++) {
        let y = 4 + i * 24;
        this._overlayStyleButtonContainer[i].setBounds(this._overlayTab.getWidth() - Component.COMPONENT_X_GAP - (this._overlayStyleButtons[i].length * Component.TOOLBAR_BUTTON_SIZE), y, this._overlayStyleButtons[i].length * Component.TOOLBAR_BUTTON_SIZE, 24);
        this._overlaySymbols[i].setBounds(2, y, this._overlayStyleButtonContainer[i].getX() - Component.COMPONENT_X_GAP, 24);
        this._overlayLoadingLabels[i].setBounds(this._overlayStyleButtonContainer[i]._x, this._overlayStyleButtonContainer[i]._y, this._overlayStyleButtonContainer[i]._width, this._overlayStyleButtonContainer[i]._height);
    }
    this._memoEditButton.setBounds(this._memoTab.getWidth() - 40 - Component.COMPONENT_X_GAP, 3, 40, 20);
    this._memoBox.setBounds(3, this._memoEditButton.getY(), this._memoEditButton.getX() - Component.COMPONENT_X_GAP, this._memoTab.getHeight() - 8);
    if (this._relativeDisplaySymbolEdit) {
        this._relativeDisplaySymbolEdit.bottomOf(this._relativeDisplayOnCheckbox, 0, Component.COMPONENT_Y_GAP, this._relativeDisplayOnCheckbox.getWidth() - Component.COMPONENT_X_GAP - 14 +  this._relativeDisplaySymbolEdit._editBoxSize, 24);
        this._relativeDisplayChangeButton.bottomOf(this._relativeDisplaySymbolEdit, this._relativeDisplaySymbolEdit.getWidth() - 60, Component.COMPONENT_Y_GAP, 60, 20);
    }   
}
Toolbar.prototype.getChartSize = function() {
    if (this._overrideSize) return this._overrideSize;
    let w = Toolbar.sizes[this._sizeCombo.getIndex()][0];
    let h = Toolbar.sizes[this._sizeCombo.getIndex()][1];
    return new Dimension(w, h);
}
/**
 * @param {number} i
 */
Toolbar.prototype.getDate = function(i) {
    let day = this._dateRange[i][Toolbar.DR_DAY].getIndex() + 1;
    let month = this._dateRange[i][Toolbar.DR_MONTH].getIndex() + 1;
    let year = this._dateRange[i][Toolbar.DR_YEAR].getIndex() + 1970;
    let c = Calendar.getInstance();
    c.set(Calendar.YEAR, year);
    c.set(Calendar.MONTH, month);
    c.set(Calendar.DAY_OF_MONTH, day);
    c.set(Calendar.HOUR_OF_DAY, 23);
    c.set(Calendar.MINUTE, 59);
    c.set(Calendar.SECOND, 0);
    c.set(Calendar.MILLISECOND, 0);
    while (c.get(Calendar.DAY_OF_WEEK) === 5 || c.get(Calendar.DAY_OF_WEEK) === 6) {
        c.add(Calendar.DATE, i === 0 ? 1 : -1);
    }
    return c.getTime().getTime() / 60000;
}
Toolbar.prototype.getPeriod = function() {
    return this._periodCombo.getIndex();
}
Toolbar.prototype.getFrequency = function() {
    return this._frequencyCombo.getIndex() + this._freqBase;
}
/**
 * @param {number} overlay
 * @param {number} style
 */
Toolbar.prototype.setOverlayStyle = function(overlay, style) {
    let loopnum = overlay;
    if (loopnum > 0) {
        for (let i = 0; i < loopnum; i++) {
            if (i < this._overlaySymbols.length && this._overlaySymbols[i] && this._overlaySymbols[i].getSymbol() === "") {
                overlay--;
            }
        }
    }
    if (this._chart && this._chart._canvas._overlays && this._chart._canvas._overlays[0]) {
        let overlayOffset = Chart.MAX_STUDIES + 3;
        // adjust overlay number / if some previos edits is empty
        let temp = overlay;
        for (let i = 0; i < temp; i++) {
            if (this._overlaySymbols[i].getText().length === 0)
                overlay--;
        }
        //
        if (this._chart._canvas._overlays[0]._study[overlayOffset + overlay]) {
            this._chart._canvas._overlays[0]._study[overlayOffset + overlay]._style = style;
            this._chart.repaint();
            this._chart.process();
        }
    }
}
/**
 * @param {ChartSymbolSet} ss
 */
Toolbar.prototype._setSymbolComponentsFromSymbolSet = function(ss) {
    if (!ss) {
        this._mainSymbol.setSymbol("");
        for (let item of this._overlaySymbols) {
            item.setSymbol('');
        }
    } else {
        this._mainSymbol.setSymbol(ss.mainSymbol());
        for (let i = 1; i < ss._entries.length; i++) {
            this._overlaySymbols[i - 1].setSymbol(ss._entries[i]._symbol);
        }
        for (let i = Math.max(ss._entries.length - 1, 0); i < this._overlaySymbols.length; i++) {
            this._overlaySymbols[i].setSymbol("");
        }
    }
}
/** @override */
Toolbar.prototype.onCustomEvent = function(e) {
    switch (e._event) {
        case ChartEvent.EDIT_CHANGED:
            return true;
        case ChartEvent.BUTTON_CLICK:
            if (e._source === this._ok) {
                this.updateSymbols();
                return true;
            } else if (e._source === this._schemeButton) {
                this._schemeModal = new ToolbarDialogs_PrefsDialog(this._id + "_schemeModal", this);
                if (this._schemeCombo.getValue() !== "Default") {
                    this._schemeModal._nameEdit.setText(this._schemeCombo.getValue());
                } else {
                    this._schemeModal._okButton.setEnabled(false);
                }
                this._schemeButton.getAbsoluteBounds();
                this._schemeModal.setLocation(this._schemeButton._absoluteX - 150, this._schemeButton._absoluteY + this._schemeButton._height + 4);
                Main.getSession()._root.showModal(this._schemeModal);
                this.setEnabled(false);
                this.refresh();
                return true;
            } else if (e._source === this._schemeDelButton) {
                let scheme = this._schemeCombo.getValue();
                if (scheme !== "Default") {
                    this._parent.getConfig().delete(scheme);
                    this._schemeCombo.removeItem(this._schemeCombo.getIndex());
                    this._schemeCombo.setIndex(0);
                    this._schemeCombo.refresh();
                    this._parent.getConfig().setDefault("Default");
                    this._parent.changeScheme(this._schemeCombo.getValue());
                }
                return true;
            } else if (e._source === this._memoEditButton) {
                this._editMemo();
                return true;
            } else if (e._source === this._relativeDisplayChangeButton) {
                if (this._relativeDisplaySymbolEdit.isValidSymbol()) {
                    this._relativeDisplayOnCheckbox.setChecked(false);
                    this._parent._currentSymbol.setRelativeDisplay(this._relativeDisplaySymbolEdit.getSymbol().getFeedSymbol(), false);
                } else {
                    this._relativeDisplayOnCheckbox.setChecked(false);
                    this._parent._currentSymbol.setRelativeDisplay(undefined, false);
                }
            } else {
                for (let i = 0; i < Toolbar.NUM_STUDIES; i++) {
                    if (e._source === this._studyEditButtons[i]) {
                        if (this._chart.getStudy(i)) {
                            this._currentStudyEditDialog = ToolbarDialogs.getStudyDialog(this._id + "_editStudyModal", this, this._chart.getStudy(i));
                            let r = this._studyEditButtons[i].getAbsoluteBounds();
                            this._currentStudyEditDialog.setBounds(r._x - 70, r._y + r._height + 2,  this._currentStudyEditDialog._width, this._currentStudyEditDialog._height);
                            Main.getSession()._root.showModal(this._currentStudyEditDialog);
                            this.setEnabled(false);
                            this.refresh();
                        }
                        return true;
                    }
                }
                for (let i = 0; i < Toolbar.NUM_OVERLAYS; i++) {
                    if (e._source === this._overlayStyleButtonContainer[i]) {
                        this.setOverlayStyle(i, e._source.getIndex());
                    }
                }
            }
            break;
        case ChartEvent.TAB_SELECT:
            return true;
        case ChartEvent.COMBO_SELECT:
            if (e._source === this._periodCombo) {
                this.setDateRangeVisible(this.getPeriod() === ChartSymbolSet.PERIOD_RANGE);
                this.buildFreqList(this.getPeriod(), this.getFrequency());
                this._parent.changeFrequency(this.getPeriod(), this.getFrequency(), true);
                return true;
            } else if (e._source === this._frequencyCombo) {
                this._parent.changeFrequency(this.getPeriod(), this.getFrequency(), false);
                return true;
            } else if (e._source === this._schemeCombo) {
                this._parent.changeScheme(this._schemeCombo.getValue());
                this._parent._config.setDefault(this._schemeCombo.getText());
                if (this._chart.isValid()) {
                    this._chart._recalcStudies = true;
                    this._chart._dirty = true;
                }
                return true;
            } else if (e._source === this._sizeCombo) {
                if (this._chart.isValid()) {
                    let cur = this.getChartSize();
                    this._parent.resize(cur._width, cur._height);
                }
            } else if (e._source === this._displayCurrencyCombo) {
                if (!this._baseCurrencyCheckbox.getChecked()) {
                    let curCode = Currency.currencies[this._displayCurrencyCombo.getIndex()];
                    this._parent._currentSymbol.setDisplayCurrency(curCode, false);
                }
            } else {
                for (let i = 0; i < Toolbar.NUM_STUDIES; i++) {
                    if (e._source === this._studyListsCombo[i]) {
                         if (this._studyListsCombo[i].getIndex() !== -1) {
                             let mnemonic = Study.comboMnemonics[this._studyListsCombo[i].getIndex()][1];
                             let help = this._getHelpAnchor(mnemonic);
                             if (Language.getLanguageID() === "fr") {
                                help = Main.getAdvfnURL() + "Aide/contactez-nous-274.html";
                             }
                             this._studyHelpLinks[i].setLink(help);
                             this._studyHelpLinks[i].refresh();
                             if (this._chart.isValid()) {
                                 this._chart.setStudy(i, mnemonic);
                             }
                         }
                        return true;
                    }
                }
            }
            break;
        case ChartEvent.CHECKBOX_CHANGED:
            if (e._source === this._autoScaleCheckbox) {
                this._chart.setAutoScale(this._autoScaleCheckbox.getChecked());
            } else if (e._source === this._logScaleCheckbox) {
                this._chart.setLogScale(this._logScaleCheckbox.getChecked());
//            } else if (e._source === this._outsideDataCheckbox) {
//                this._chart.setOutsideData(this._outsideDataCheckbox.getChecked());
            } else if (e._source === this._baseCurrencyCheckbox) {
                if (this._baseCurrencyCheckbox.getChecked()) {
                    this._parent._currentSymbol.setDisplayCurrency(undefined, false);
                } else {
                    let curCode = Currency.currencies[this._displayCurrencyCombo.getIndex()];
                    this._parent._currentSymbol.setDisplayCurrency(curCode, true);
                }
            } else if (e._source === this._relativeDisplayOnCheckbox) {
                if (!this._relativeDisplayOnCheckbox.getChecked()) {
                    this._parent._currentSymbol.setRelativeDisplay(undefined, false);
                } else {
                    if (this._relativeDisplaySymbolEdit.isValidSymbol()) {
                        this._parent._currentSymbol.setRelativeDisplay(this._relativeDisplaySymbolEdit.getSymbol().getFeedSymbol(), false);
                    } else {
                        this._parent._currentSymbol.setRelativeDisplay(undefined, false);
                    }
                }
            }
            return true;
        case ChartEvent.SYMBOL_SELECT:
            this.updateSymbols();
            return true;
    }
    return Component.prototype.onCustomEvent.call(this, e);
}
/**
 * @param {StudyDialog|ToolbarDialogs_PrefsDialog} m
 */
Toolbar.prototype.ToolbarDialogs_Cancel = function(m) {
    Main.getSession().getRootComponent().removeWindow(m);
    this.setEnabled(true);
    this.refresh();
}
Toolbar.prototype.ToolbarDialogs_StudyDialogDelegate_OK = function() {
    if (this._chart.isValid()) {
        this._currentStudyEditDialog.writeParams();
        this._chart.recalcStudies = true;
        this._chart.repaint();
        this._chart.process();
    }
    this.ToolbarDialogs_Cancel(this._currentStudyEditDialog);
}
Toolbar.prototype.ToolbarDialogs_PrefsDialogDelegate_OK = function() {
    let scheme = this._schemeModal._nameEdit.getText();
    let newScheme = !this._parent._config.hasScheme(scheme);
    if (newScheme) {
        this._schemeCombo.addItem(scheme);
        this._schemeCombo.setIndex(this._schemeCombo.size() - 1);
        this._schemeCombo.refresh();
    }
    this._parent._config.set(scheme, this._parent.saveScheme());
    this._parent._config.write(scheme, true);
    this.ToolbarDialogs_Cancel(this._schemeModal);
}
Toolbar.prototype.handleSymbolSelect = function() {
    let symbol_array = new Array(1 + this._overlaySymbols.length);
    if (this._mainSymbol) {
        if (this._mainSymbol.isValidSymbol()) {
            symbol_array[0] = this._mainSymbol.getSymbol().getFeedSymbol();
        } else {
            symbol_array[0] = "";
        }
    }
    if (this._overlaySymbols) {
        for (let i = 1; i <= this._overlaySymbols.length; i++) {
            if (this._overlaySymbols[i-1].isValidSymbol()) {
                if (!this._overlayStyleButtonContainer[i-1]._shown) {
                    this._overlayLoadingLabels[i-1].show();
                    this._overlayLoadingLabels[i-1].refresh();
                }
                symbol_array[i] = this._overlaySymbols[i - 1].getSymbol().getFeedSymbol();
            } else {
                symbol_array[i] = "";
            }
        }
    }
    this._parent.changeSymbols(symbol_array);
}
/**
 * @param {ChartSymbolSet} ss
 */
Toolbar.prototype.changeSymbols = function(ss) {
    this._setSymbolComponentsFromSymbolSet(ss);
    this.initOverlayStyleButtons(ss);
    if (!ss) {
        this._autoScaleCheckbox.setChecked(true);
        if (this._parent.getDefaultToHistorical()) {
            this.buildFreqList(PriceDataConstants.PERIOD_1M, PriceDataConstants.FREQUENCY_D);
        } else {
            this.buildFreqList(PriceDataConstants.PERIOD_INT, PriceDataConstants.FREQUENCY_1);
        }
    } else {
        this._autoScaleCheckbox.setChecked(ss._autoScale);
        this.buildFreqList(ss._period, ss.mainFrequency());
    }
    this.refresh();
}
/**
 * @param {number} p
 * @param {number} f
 */
Toolbar.prototype.buildFreqList = function(p, f) {
    this._frequencyCombo.clear();
    this._periodCombo.setIndex(p);
    if (f === -1) {
        f = 0;
    }
    if (p <= ChartSymbolSet.PERIOD_5D || p === ChartSymbolSet.PERIOD_15D) {
        this._frequencyCombo.addItem(Language.getString("toolbar_1min"));
        this._frequencyCombo.addItem(Language.getString("toolbar_5min"));
        this._frequencyCombo.addItem(Language.getString("toolbar_10min"));
        this._frequencyCombo.addItem(Language.getString("toolbar_15min"));
        this._frequencyCombo.addItem(Language.getString("toolbar_30min"));
        this._frequencyCombo.addItem(Language.getString("toolbar_60min"));
        if (this._freqBase === PriceDataConstants.FREQUENCY_D) {
            f = this._freqBase = PriceDataConstants.FREQUENCY_1;
        } else if (f > PriceDataConstants.FREQUENCY_60) {
            f = PriceDataConstants.FREQUENCY_60;
        }
    } else {
        this._frequencyCombo.addItem(Language.getString("toolbar_daily"));
        this._frequencyCombo.addItem(Language.getString("toolbar_weekly"));
        this._frequencyCombo.addItem(Language.getString("toolbar_monthly"));
        this._frequencyCombo.addItem(Language.getString("toolbar_quarterly"));
        this._frequencyCombo.addItem(Language.getString("toolbar_yearly"));
        if (this._freqBase === PriceDataConstants.FREQUENCY_1) {
            f = this._freqBase = PriceDataConstants.FREQUENCY_D;
        } else if (f < PriceDataConstants.FREQUENCY_D) {
            f = PriceDataConstants.FREQUENCY_D;
        }
    }
    this._frequencyCombo.setIndex(f - this._freqBase);
    this._frequencyCombo.refresh();
}
/**
 * @param {Array} memos
 */
Toolbar.prototype.updateMemos = function(memos) {
    if (memos && memos.length > 0) {
        this._memoBox.setText(memos[0]);
    } else {
        this._memoBox.setText("");
    }
    this._memoBox.refresh();
}
Toolbar.prototype.updateSymbols = function() {
    if (this._mainSymbol) {
        this._mainSymbol.updateSymbol();
    }
    if (this._overlaySymbols) {
        for (let item of this._overlaySymbols) {
            item.updateSymbol();
        }
    }
    this.handleSymbolSelect();
}
/** @private */
Toolbar.prototype._initMain = function() {
    this._main = new Component(this._id + "_main");
    this.add(this._main);
    this._main.setBorderSize(1);
    this._main.setBorderColor(Color.black);
    this._main.setBorder(Component.BORDER_SOLID);
    let p = this._params.has("period") ? parseInt(this._params.get("period").toString(), 10) : 0;
    this._chartGuide(p !== ChartSymbolSet.PERIOD_RANGE);
    this._mainSymbol = new SymbolEdit(this._main._id + "_symbolEdit", this, true);
    this._ok = new Button(this._main._id + "_ok", this);
    this._ok.setText(Language.getString("toolbar_draw"));
    this._main.add(this._ok);
    this._searchButton = new Button(this._main._id + "_search", this);
    this._searchButton.setText(Language.getString("toolbar_search"));
    this._searchButton.setLink(Main.getAdvfnURL() + "p.php?pid=search&fpid=charts");
    this._searchButton.setNoBorder(true);
    this._searchButton.setColors("none", "none", "none", "none", Color.blue, "none");
    this._searchButton.setVisitedColor("darkblue");
    this._searchButton.setTextDecoration(Component.TEXT_DECORATION_UNDERLINE);
    this._main.add(this._searchButton);
    if (this._params.has("floatBars")) {
        this._mainSymbol.hide();
        this._searchButton.hide();
    }
    this._mainDateRange(p === ChartSymbolSet.PERIOD_RANGE);
    this._periodCombo = new ComboBox(this._main._id + "_periodCombo", this);  
    this._periodCombo.addItem(Language.getString("toolbar_intraday"));
    this._periodCombo.addItem(Language.getString("toolbar_1day"));
    this._periodCombo.addItem(Language.getString("toolbar_2day"));
    this._periodCombo.addItem(Language.getString("toolbar_3day"));
    this._periodCombo.addItem(Language.getString("toolbar_5day"));
    this._periodCombo.addItem(Language.getString("toolbar_1month"));
    this._periodCombo.addItem(Language.getString("toolbar_2month"));
    this._periodCombo.addItem(Language.getString("toolbar_3month"));
    this._periodCombo.addItem(Language.getString("toolbar_6month"));
    this._periodCombo.addItem(Language.getString("toolbar_1year"));
    this._periodCombo.addItem(Language.getString("toolbar_2year"));
    this._periodCombo.addItem(Language.getString("toolbar_3year"));
    this._periodCombo.addItem(Language.getString("toolbar_5year"));
    this._periodCombo.addItem(Language.getString("toolbar_ytd"));
    this._periodCombo.addItem(Language.getString("toolbar_daterange"));
    this._periodCombo.addItem("1" + Language.getString("toolbar_5day"));
    this._periodCombo.setIndex(p);
    this._main.add(this._periodCombo);
    this._frequencyCombo = new ComboBox(this._main._id + "_frequencyCombo", this);
    this._main.add(this._frequencyCombo);
    this._main.add(this._mainSymbol);
}
/**
 * @private
 * @param {boolean} visible
 */
Toolbar.prototype._mainDateRange = function(visible) {
    this._dateRange = new Array(2);
    let cur = new Date();
    let c = Calendar.getInstance();
    c.setTime(cur);
    this._dateRangeBox = new Component(this._main._id + "_rangeBox");
    if (!visible) {
        this._dateRangeBox.hide();
    }
    this._main.add(this._dateRangeBox);
    
    let curYear = c.get(Calendar.YEAR);
    for (let i = 1; i >= 0; i--) {
        let y = 5 + i * 24;
        this._dateRange[i] = new Array(3);
        if (Language.getLanguageID() === "jp") {
            let year = new ComboBox(this._dateRangeBox._id + (i === 0 ? "_fromYearCombo" : "_toYearCombo"), this);
            year.setBounds(50, y, 60, 20);
            for (let yr = 1970; yr <= curYear; yr++) {
                year.addItem(yr.toString());
            }
            this._dateRange[i][Toolbar.DR_YEAR] = year;
            this._dateRangeBox.add(year);
            let slash1 = new Label(this._dateRangeBox._id + (i === 0 ? "_fromSlash1Label" : "_toSlash1Label"), this);
            slash1.setText("/");
            slash1.setBounds(year.getX() + year.getWidth() + Component.COMPONENT_X_GAP / 2, y, 5, 20);
            slash1.setAlign(Label.ALIGN_RIGHT);
            this._dateRangeBox.add(slash1);
            let month = new ComboBox(this._dateRangeBox._id + (i === 0 ? "_fromMonthCombo" : "_toMonthCombo"), this);
            month.setBounds(slash1.getX() + slash1.getWidth() + Component.COMPONENT_X_GAP / 2, y, 40, 20);
            for (let m = 1; m <= 12; m++) {
                month.addItem(m.toString());
            }
            this._dateRange[i][Toolbar.DR_MONTH] = month;
            this._dateRangeBox.add(month);
            let slash2 = new Label(this._dateRangeBox._id + (i === 0 ? "_fromSlash2Label" : "_toSlash2Label"), this);
            slash2.setText("/");
            slash2.setBounds(month.getX() + month.getWidth() + Component.COMPONENT_X_GAP / 2, y, 5, 20);
            slash2.setAlign(Label.ALIGN_RIGHT);
            this._dateRangeBox.add(slash2);
            let day = new ComboBox(this._dateRangeBox._id + (i === 0 ? "_fromDayCombo" : "_toDayCombo"), this);
            day.setBounds(slash2.getX() + slash2.getWidth() + Component.COMPONENT_X_GAP / 2, y, 40, 20);
            for (let d = 1; d <= 31; d++) {
                day.addItem(d.toString());
            }
            this._dateRange[i][Toolbar.DR_DAY] = day;
            this._dateRangeBox.add(day);
            let l = new Label(this._dateRangeBox._id + (i === 0 ? "_fromLabel" : "_toLabel"), this);
            l.setText((i === 0) ? Language.getString("toolbar_from") : Language.getString("toolbar_to"));
            l.setBounds(day.getX() + day.getWidth() + Component.COMPONENT_X_GAP / 2, y, 60, 20);
            l.setAlign(Label.ALIGN_LEFT);
            this._dateRangeBox.add(l);
        } else {
            let l = new Label(this._dateRangeBox._id + (i === 0 ? "_fromLabel" : "_toLabel"), this);
            l.setText((i === 0) ? Language.getString("toolbar_from") : Language.getString("toolbar_to"));
            l.setBounds(0, y, 70 - Component.COMPONENT_X_GAP, 20);
            l.setAlign(Label.ALIGN_RIGHT);
            this._dateRangeBox.add(l);
            let day = new ComboBox(this._dateRangeBox._id + (i === 0 ? "_fromDayCombo" : "_toDayCombo"), this);
            day.setBounds(l.getX() + l.getWidth() + Component.COMPONENT_X_GAP, y, 40, 20);
            for (let d = 1; d <= 31; d++) {
                day.addItem(d.toString());
            }
            this._dateRange[i][Toolbar.DR_DAY] = day;
            this._dateRangeBox.add(day);
            let month = new ComboBox(this._dateRangeBox._id + (i === 0 ? "_fromMonthCombo" : "_toMonthCombo"), this);
            month.setBounds(day.getX() + day.getWidth() + Component.COMPONENT_X_GAP, y, 40, 20);
            for (let m = 1; m <= 12; m++) {
                month.addItem(m.toString());
            }
            this._dateRange[i][Toolbar.DR_MONTH] = month;
            this._dateRangeBox.add(month);
            let year = new ComboBox(this._dateRangeBox._id + (i === 0 ? "_fromYearCombo" : "_toYearCombo"), this);
            year.setBounds(month.getX() + month.getWidth() + Component.COMPONENT_X_GAP, y, 60, 20);
            for (let yr = 1970; yr <= curYear; yr++) {
                year.addItem(yr.toString());
            }
            this._dateRange[i][Toolbar.DR_YEAR] = year;
            this._dateRangeBox.add(year);
        }
    }
    if (this._params.has("from")) {
        this._setDate(Toolbar.DR_FROM, new Date(60000 * parseFloat(this._params.get("from").toString())));
    } else {
        let cal = Calendar.getInstance();
        cal.setTime(cur);
        cal.add(Calendar.YEAR, -1);
        this._setDate(Toolbar.DR_FROM, cal.getTime());
    }
    if (this._params.has("to")) {
        this._setDate(Toolbar.DR_TO, new Date(60000 * parseFloat(this._params.get("to").toString())));
    } else {
        this._setDate(Toolbar.DR_TO, cur);
    }
}
/**
 * @private
 * @param {number} i
 * @param {Date} d
 */
Toolbar.prototype._setDate = function(i, d) {
    let c = Calendar.getInstance();
    c.setTime(d);
    let day = c.get(Calendar.DAY_OF_MONTH);
    let month = c.get(Calendar.MONTH);
    let year = c.get(Calendar.YEAR);
    this._dateRange[i][Toolbar.DR_DAY].setIndex(day - 1);
    this._dateRange[i][Toolbar.DR_MONTH].setIndex(month);
    this._dateRange[i][Toolbar.DR_YEAR].setIndex(year - 1970);
}
/**
 * @private
 * @param {boolean} makeVisible
 */
Toolbar.prototype._chartGuide = function(makeVisible) {
    this._guideBox = new Component(this._main._id + "_quideBox", this);
    if (!makeVisible) {
        this._guideBox.hide();
    }
    this._main.add(this._guideBox);
    this._guideTitle = new Label(this._main._id + "_guideTitle", this);
    this._guideTitle.setAlign(Label.ALIGN_LEFT);
    this._guideTitle.setText(Language.getString("toolbar_charts_guide_title"));
    this._guideTitle.setBold(true);
    this._guideBox.add(this._guideTitle);
    this._guideHandImage = new UIImage(Main.getImagesURL() + Style.getImage(Style.IMAGE_CURSOR_HAND), this._main._id + "_handImage", this);
    this._guideBox.add(this._guideHandImage);
    this._guideDragText = new Label(this._main._id + "_guideDrag", this);
    this._guideDragText.setText(Language.getString("toolbar_charts_guide_dragmouse"));
    this._guideBox.add(this._guideDragText);
    this._guideAxesImage = new UIImage(Main.getImagesURL() + Style.getImage(Style.IMAGE_CURSOR_HORIZONTAL), this._main._id + "_axesImage", this);
    this._guideBox.add(this._guideAxesImage);
    this._guideDragAxes = new Label(this._main._id + "_guideDragAxes", this);
    this._guideDragAxes.setText(Language.getString("toolbar_charts_guide_dragaxes"));
    this._guideBox.add(this._guideDragAxes);
    this._guideRightClick = new Label(this._main._id + "_guideRight", this);
    this._guideRightClick.setText(Language.getString("toolbar_charts_guide_rightclick"));
    this._guideBox.add(this._guideRightClick);
}
/** @private */
Toolbar.prototype._initTabs = function() {
    this._studyListsCombo = new Array(Toolbar.NUM_STUDIES);
    this._studyEditButtons = new Array(Toolbar.NUM_STUDIES);
    this._studyHelpLinks = new Array(Toolbar.NUM_STUDIES);
    this._overlaySymbols = new Array(Toolbar.NUM_OVERLAYS);
    this._overlayStyleButtonContainer = new Array(Toolbar.NUM_OVERLAYS);
    this._overlayStyleButtons = new Array(Toolbar.NUM_OVERLAYS);
    this._tabs = new Tabs(this._id + "_tabs", this);
    this.add(this._tabs);
    this._initTabStudies();
    this._initTabOverlays();
    if (Utils.hasFeature(this._params, "EQUI_D")) {
        this._initTabCurrency();
        this._initTabRelative();
    }
    this._initTabOptions();
    this._initTabPrefs();
    this._initTabMemo();
    this._tabs.setSelected(0);
}
/** @private */
Toolbar.prototype._initTabStudies = function() {
    let i = this._tabs.size();
    this._tabs.addTab(this._tabs._id + "_t" + i, Language.getString("tab_studies"));
    this._studyTab = new Tabs_data(this._tabs.getTab(i)._id + "_data", this);
    this._tabs.setDataControl(i, this._studyTab);
    for (let i = Toolbar.NUM_STUDIES - 1; i >= 0 ; i--) {
        let combo = new ComboBox(this._studyTab._id + "_combo" + i, this);
        let y = 4 + i * 24;
        combo.setBounds(Component.COMPONENT_X_GAP, y, 250, 20);
        Study.comboMnemonics = Study.getMnemonics();
        for (let j = 0; j < Study.comboMnemonics.length; j++) {
            combo.addItem(Study.comboMnemonics[j][0], Study.comboMnemonics[j][0]);
            if (Study.comboMnemonics[j][1].length === 0) {
                combo.getListRow(j)._enabled = false;
            } else {
                combo.getListRow(j)._enabled = true;
            }
        }
        // enable first item
        combo.getListRow(0)._enabled = true;
        this._studyListsCombo[i] = combo;
        this._studyTab.add(combo);
        
        let e = new Button(this._studyTab._id + "_editButton" + i, this);
        e.setText(Language.getString("toolbar_edit"));
        e.rightOf(combo, Component.COMPONENT_X_GAP, 0, 40, 20);
        this._studyEditButtons[i] = e;
        this._studyTab.add(e);
        
        let sel = "";
        let idx = 0;
        if (this._params.has("s" + i)) {
            sel = this._params.get("s" + i);
            idx = Study.studyMnemonicToIndex(sel);
        }
        combo.setIndex(idx);
        let h = new Button(this._studyTab._id + "_helpButton" + i, this);
        h.setColors("none", "none", "none", "none", Color.blue, "none");
        h.setNoBorder(true);
        h.setTextDecoration(Component.TEXT_DECORATION_UNDERLINE);
        h.setText(Language.getString("toolbar_help"));
        h.rightOf(e, Component.COMPONENT_X_GAP, 0, 40, 20);
        this._studyHelpLinks[i] = h;
        this._studyTab.add(h);
    }
}
/** @private */
Toolbar.prototype._initTabOverlays = function() {
    let i = this._tabs.size();
    this._tabs.addTab(this._tabs._id + "_t" + i, Language.getString("tab_overlays"));
    this._overlayTab = new Tabs_data(this._tabs.getTab(i)._id + "_data", this);
    this._tabs.setDataControl(i, this._overlayTab);
    this._overlayLoadingLabels = new Array(Toolbar.NUM_OVERLAYS);
    for (let i = Toolbar.NUM_OVERLAYS - 1; i >= 0; i--) {
        let sc = new SymbolEdit(this._overlayTab._id + "_edit" + i, this);
        this._overlaySymbols[i] = sc;
        this._overlayTab.add(sc);
        this._overlayStyleButtonContainer[i] = new ToggleBar(this._overlayTab._id + "_buttons" + i, this);
        this._overlayTab.add(this._overlayStyleButtonContainer[i]);
        this._overlayLoadingLabels[i] = new Label(this._overlayTab._id + "_loading" + i, this);
        this._overlayLoadingLabels[i].setText(Language.getString("loading"));
        this._overlayLoadingLabels[i].hide();
        this._overlayTab.add(this._overlayLoadingLabels[i]);
        this._overlayStyleButtonContainer[i].setButtonWidth(Component.TOOLBAR_BUTTON_SIZE);
        // miss the last two ("none" and "shaded area")
        this._overlayStyleButtons[i] = new Array(MiscToolbar.styleNames.length - 2);
        for (let j = 0; j < this._overlayStyleButtons[i].length; j++) {
            this._overlayStyleButtons[i][j] = this._overlayStyleButtonContainer[i].addImageButton(Style.getImage(Style.IMAGE_STYLE_LINE + j), MiscToolbar.styleNames[j], j === 0);
        }
    }
    for (let i = 0; i < Toolbar.NUM_OVERLAYS; i++) {
        let nexti = (i === Toolbar.NUM_OVERLAYS - 1) ? 0 : i + 1;
        this._overlaySymbols[i]._editBox.setNextControl(this._overlaySymbols[nexti]._editBox);
    }
}
/** @private */
Toolbar.prototype._initTabCurrency = function() {
    let i = this._tabs.size();
    this._tabs.addTab(this._tabs._id + "_t" + i, Language.getString("tab_currency"));
    this._currencyTab = new Tabs_data(this._tabs.getTab(i)._id + "_data", this);
    this._tabs.setDataControl(i, this._currencyTab);

    this._baseCurrencyCheckbox = new Checkbox(this._overlayTab._id + "_checkbox", this, true, "Use default currencies?");
    this._baseCurrencyCheckbox.setRightAlign(true);
    this._baseCurrencyCheckbox.setBounds(10, 10, 170, 20);
    this._currencyTab.add(this._baseCurrencyCheckbox);
    
    let displayCurrencyLabel = new Label(this._overlayTab._id + "_label", this);
    displayCurrencyLabel.setText("Display in");
    displayCurrencyLabel.setAlign(Label.ALIGN_RIGHT);
    displayCurrencyLabel.bottomOf(this._baseCurrencyCheckbox, 0, Component.COMPONENT_Y_GAP, this._baseCurrencyCheckbox.getWidth() - Component.COMPONENT_X_GAP * 2 - 14, 20);
    this._currencyTab.add(displayCurrencyLabel);
    this._displayCurrencyCombo = new ComboBox(this._overlayTab._id + "_combo", this);
    this._displayCurrencyCombo.rightOf(displayCurrencyLabel, Component.COMPONENT_X_GAP, 0, 220, 20);
    for (let i = 0; i < Currency.currencies.length; i++) {
        this._displayCurrencyCombo.addItem(Currency.currencies[i] + " (" + Currency.currencyNames[i] + ")");
    }
    this._displayCurrencyCombo.setIndex(0);
    this._currencyTab.add(this._displayCurrencyCombo);
}
/** @private */
Toolbar.prototype._initTabRelative = function() {
    let i = this._tabs.size();
    this._tabs.addTab(this._tabs._id + "_t" + i, Language.getString("tab_relative"));
    this._relativeTab = new Tabs_data(this._tabs.getTab(i)._id + "_data", this);
    this._tabs.setDataControl(i, this._relativeTab);
    
    this._relativeDisplayOnCheckbox = new Checkbox(this._relativeTab._id + "_checkbox", this, false, "Use relative display?");
    this._relativeDisplayOnCheckbox.setRightAlign(true);
    this._relativeDisplayOnCheckbox.setBounds(10, 10, 170, 20);
    this._relativeTab.add(this._relativeDisplayOnCheckbox);
    
    this._relativeDisplaySymbolEdit = new SymbolEdit(this._overlayTab._id + "_edit", this);;
    this._relativeTab.add(this._relativeDisplaySymbolEdit);
    
    this._relativeDisplayChangeButton = new Button(this._relativeTab._id + "_button", this);
    this._relativeDisplayChangeButton.setText("Change");
    this._relativeTab.add(this._relativeDisplayChangeButton);
}
/** @private */
Toolbar.prototype._initTabOptions = function() {
    let i = this._tabs.size();
    this._tabs.addTab(this._tabs._id + "_t" + i, Language.getString("tab_options"));
    this._optionTab = new Tabs_data(this._tabs.getTab(i)._id + "_data", this);
    this._tabs.setDataControl(i, this._optionTab);
    
    this._autoScaleCheckbox = new Checkbox(this._optionTab._id + "_autoscale", this, true, Language.getString("toolbar_autoscale"));
    this._autoScaleCheckbox.setBounds(10, 10, 140, 16);
    this._optionTab.add(this._autoScaleCheckbox);
    
    let ls = this._params.has("logscale") ? (this._params.get("logscale") === "true") : false;
    this._logScaleCheckbox = new Checkbox(this._optionTab._id + "_logscale", this, ls, Language.getString("toolbar_logscale"));
    this._logScaleCheckbox.setBounds(this._autoScaleCheckbox.getX(), this._autoScaleCheckbox.getY() + this._autoScaleCheckbox.getHeight() + Component.COMPONENT_Y_GAP * 3, this._autoScaleCheckbox.getWidth(), this._autoScaleCheckbox.getHeight());
    this._optionTab.add(this._logScaleCheckbox);
    
    let sizeLabel = new Label(this._optionTab._id + "_sizeLabel", this);
    sizeLabel.setText(Language.getString("toolbar_size"));
    sizeLabel.setBounds(this._autoScaleCheckbox.getX(), this._logScaleCheckbox.getY() + this._logScaleCheckbox.getHeight() + Component.COMPONENT_Y_GAP * 3, 40, 24);
    sizeLabel.setAlign(Label.ALIGN_RIGHT);
    this._optionTab.add(sizeLabel);
    
    this._sizeCombo = new ComboBox(this._optionTab._id + "_sizeCombo", this);
    this._sizeCombo.setBounds(sizeLabel.getX() + sizeLabel.getWidth() + Component.COMPONENT_X_GAP, sizeLabel.getY() + 2, 100, 20);
    let which = 0;
    let cw = parseInt(this._params.get("cw").toString(), 10);
    let ch = parseInt(this._params.get("ch").toString(), 10);
    for (let i = 0; i < Toolbar.sizes.length; i++) {
        this._sizeCombo.addItem(Toolbar.sizes[i][0] + " x " + Toolbar.sizes[i][1]);
        if (cw === Toolbar.sizes[i][0] && ch === Toolbar.sizes[i][1]) {
            which = i;
        }
    }
    this._sizeCombo.setIndex(which);
    this._optionTab.add(this._sizeCombo);
    if (this._params.has("floatBars") || this._params.has("noscale")) {
        sizeLabel.hide();
        this._sizeCombo.hide();
    }
}
/** @private */
Toolbar.prototype._initTabPrefs = function() {
    let i = this._tabs.size();
    this._tabs.addTab(this._tabs._id + "_t" + i, Language.getString("tab_chartpreferences"));
    this._prefsTab = new Tabs_data(this._tabs.getTab(i)._id + "_data", this);
    this._tabs.setDataControl(i, this._prefsTab);
    let schemeLabel = new Label(this._optionTab._id + "_schemeLabel", this);
    schemeLabel.setText(Language.getString("toolbar_scheme"));
    schemeLabel.setBounds(0, 10, 60, 20);
    schemeLabel.setAlign(Label.ALIGN_RIGHT);
    this._prefsTab.add(schemeLabel);
    this._schemeCombo = new ComboBox(this._optionTab._id + "_combo", this);
    this._schemeCombo.rightOf(schemeLabel, Component.COMPONENT_X_GAP, 0, 170, schemeLabel.getHeight());
    this._schemeCombo.addItem(Language.getString("toolbar_default"));
    this._schemeCombo.setIndex(0);
    this._prefsTab.add(this._schemeCombo);
    this._schemeButton = new Button(this._optionTab._id + "_saveButton", this);
    this._schemeButton.setText(Language.getString("toolbar_save"));
    this._schemeButton.rightOf(this._schemeCombo, Component.COMPONENT_X_GAP, 0, 40, schemeLabel.getHeight());
    this._prefsTab.add(this._schemeButton);
    this._schemeDelButton = new Button(this._optionTab._id + "_deleteButton", this);
    this._schemeDelButton.setText(Language.getString("toolbar_delete"));
    this._schemeDelButton.rightOf(this._schemeButton, Component.COMPONENT_X_GAP, 0, 50, schemeLabel.getHeight());
    this._prefsTab.add(this._schemeDelButton);
}
/** @private */
Toolbar.prototype._initTabMemo = function() {
    let i = this._tabs.size();
    this._tabs.addTab(this._tabs._id + "_t" + i, Language.getString("tab_memo"));
    this._memoTab = new Tabs_data(this._tabs.getTab(i)._id + "_data", this);
    this._tabs.setDataControl(i, this._memoTab);
    this._memoBox = new Label(this._memoTab._id + "_editBox", this);
    this._memoBox.setVerticalAlign(Label.VERTICAL_ALIGN_TOP);
    this._memoBox.setAlign(Label.ALIGN_CENTER);
    this._memoTab.add(this._memoBox);
    this._memoEditButton = new Button(this._memoTab._id + "_editButton", this);
    this._memoEditButton.setText(Language.getString("toolbar_edit"));
    this._memoTab.add(this._memoEditButton);
}
/** @private */
Toolbar.prototype._getHelpAnchor = function(mnemonic) {
    let help = '';
    if (this._parent.getView() === "jp" || this._parent.getView() === "excite") {
        if (mnemonic !== '') {
            let hid = StudyFactory.getHelpCode(mnemonic);
            if (hid <= 0) hid = 414;
            help = Main.getAdvfnURL() + "p.php?pid=glossary&id=" + hid;
        } else {
            help = Main.getAdvfnURL() + "p.php?pid=glossary&id=414";
        }
    } else {
        if (mnemonic !== '') { 
            let hid = StudyFactory.getHelpCode(mnemonic);
            if (hid <= 0) hid = 414;
            help = Main.getAdvfnURL() + "p.php?pid=help&hid=" + hid;
        } else {
            help = Main.getAdvfnURL() + "p.php?pid=help&hid=414";
        }
    }
    return help;
}
/** @private */
Toolbar.prototype._editMemo = function() {
    let p = new Map();
    p.set("pid", "m_memo");
    let symbol = encodeURIComponent(this._chart._currentSymbol.symbols()[0]);
    p.set("symbol", symbol);
    p.set("showBack", "false");
    p.set("ref", "charts");
    let pp = Utils.convertHashParamsWithoutDefaults(p, "&", "=");
    this._memoEditButton.setLink(Main.getAdvfnURL() + "p.php?" + pp);
    this._memoEditButton.onClick();
    this._memoEditButton.setLink(undefined);
}
/** 
 * @param {ChartSymbolSet} ss
 */
Toolbar.prototype.initOverlayStyleButtons = function(ss) {
    if (!ss)
        return;
    let which = 0;
    for (let i = 0; i < Toolbar.NUM_OVERLAYS; i++, which++) {
        let s = this._overlaySymbols[i].getSymbol();
        if (s) {
            this._overlayStyleButtonContainer[i].show();
            for (let j = 0; j < this._overlayStyleButtons[i].length; j++) {
                if (this._chart._mainOverlay._study[Overlay.OVERLAY_STUDY_ID + i]) {
                    if (j === (this._chart._mainOverlay._study[Overlay.OVERLAY_STUDY_ID + i])._style) {
                        this._overlayStyleButtons[which][j].down();
                    } else {
                        this._overlayStyleButtons[which][j].up();
                    }
                } else {
                    which++;
                }
            }
        } else {
            this._overlayStyleButtonContainer[i].hide();
        }
        this._overlayLoadingLabels[i].hide();
    }
    if (this._overlayTab._div) {
        this._overlayTab.refresh();
    }
}
/**
 * @param {Map} p
 * @param {boolean} transparent
 */
Toolbar.prototype.initialiseState = function(p, transparent) {
    this._params = p;
    if (this.getPeriod() === ChartSymbolSet.PERIOD_RANGE && !transparent) {
        if (this._params.get("from") && this._params.get("to")) {
            this._setDate(Toolbar.DR_FROM, new Date(parseFloat(this._params.get("from").toString()) * 60000));
            this._setDate(Toolbar.DR_TO, new Date(parseFloat(this._params.get("to").toString()) * 60000));
        }
    }
    if (this._params.has("log")) {
        this._logScaleCheckbox.setChecked(this._params.get("log").toString() === "1");
    } else if (!transparent) {
        this._logScaleCheckbox.setChecked(false);
    }
    this._chart.setLogScale(this._logScaleCheckbox.getChecked());
    for (let slot = 0; slot < Toolbar.NUM_STUDIES; slot++) {
        if (this._params.has("s" + slot)) {
            let mnemonic = this._params.get("s" + slot);
            this._studyListsCombo[slot].setIndex(Study.studyMnemonicToIndex(mnemonic));
            this._studyHelpLinks[slot].setLink(this._getHelpAnchor(mnemonic));
            this._studyHelpLinks[slot].refresh();
            if (this._chart) {
                this._chart.setStudy(slot, mnemonic);
            }
            
            if (this._params.has("sp" + slot)) {
                if (this._chart) {
                    let p = this._params.get("sp" + slot).toString();
                    this._chart.setStudyParams(slot, p);
                }
            }
        } else if (!transparent) {
            this._studyListsCombo[slot].setIndex(0);
            this._chart.setStudy(slot, "");
            this._chart.setStudyParams(slot, "");
        }
    }
    if (this._schemeCombo.size() === 1) {
        for (let scheme of this._parent.getConfig().getSchemes()) {
            if (scheme !== "Default") {
                this._schemeCombo.addItem(scheme);
                if (scheme === this._parent.getDefaultScheme()) {
                    this._schemeCombo.setIndex(this._schemeCombo.size() - 1);
                }
            }
        }
    }
    if (this._params.has("cw") && !transparent) {
        let cw = parseInt(this._params.get("cw").toString(), 10);
        let ch = parseInt(this._params.get("ch").toString(), 10);
        this._sizeCombo.setIndex(this._getSizeIndex(cw, ch));
    }
    if (this._chart) {
        this._chart.repaint();
        this._chart.setRecalcStudies();
    }
}
/** 
 * @private 
 * @param {number} w
 * @param {number} h
 */
Toolbar.prototype._getSizeIndex = function(w, h) {
    for (let i = 0; i < Toolbar.sizes.length; i++) {
        if ((w === Toolbar.sizes[i][0]) && (h === Toolbar.sizes[i][1])) {
            return i;
        }
    }
    return 0;
}
/** @static */
Toolbar.NUM_STUDIES = 5;
/** @static */
Toolbar.NUM_OVERLAYS = 5;
/** @static */
Toolbar.DR_FROM = 0;
/** @static */
Toolbar.DR_TO = 1;
/** @static */
Toolbar.DR_DAY = 0;
/** @static */
Toolbar.DR_MONTH = 1;
/** @static */
Toolbar.DR_YEAR = 2;
/** @static */
Toolbar.sizes = [[648, 400], [648, 600], [648, 800], [648, 1200], [972, 400], [972, 600], [972, 800], [972, 1200], [1296, 400], [1296, 600], [1296, 800], [1296, 1200], [324, 200], [486, 300]];