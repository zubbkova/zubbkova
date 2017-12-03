/* global SymbolSet, MaxMin, StudyStock, Overlay, Chart, DecimalFormat, DrawingObject, PriceDataConstants, Calendar, Language, TimeIterator, CurrencyConverterSymbolInfo, PercentageChangeSymbolInfo, RelativeToSymbolInfo, RelativeToSeries, Cursor, PercentageChangeSeries, DataAggregator, CurrencyConverterSeries, LabelIterator */
/**
 * --------------
 * ChartSymbolSet
 * --------------
 * This class adds data required to display a chart to the basic SymbolSet class so that when we change to a different
 * set of symbols we can preserve the state of the display at that time.
 * @constructor
 * @extends {SymbolSet}
 * @param {PriceDataLoader} l
 * @param {Chart} c
 * @param {Array|string} s - symbols
 * @param {Array|number=} f - frequencies
 * @param {number=} p - period
 */
function ChartSymbolSet(l, c, s, f, p) {
    this._initialNumTimeUnits = 0;
    this._unitWidth = 0.0;
    this._oldUnitWidth = 0.0;
    this._numTimeUnits = 0.0;
    this._autoScale = true;
    this._logScale = false;
    this._fixedMid = false;
    this._yMid = 0.0;
    this._ySpread = 0.0;
    this._oldYSpread = 0.0;
    this._yFixedMid = 0.0;
    this._yMidAdjust = 0.0;
    this._ySpreadSF = 0.0;
    this._logMid = 0.0;
    this._logSpread = 0.0;
    this._yLabelStart = 0.0;
    this._yLabelInterval = 0.0;
    this._marketOpen = 0;
    this._marketClose = 0;
    this._delay = 0;
    this._verticalLinePosition = -1;
    this._yLabelFactor = 1;
    this._yLabelSuffix = 0;
    this._periodsMarketOpen = 0;
    this._showPercentageChanges = false;
    if (arguments.length === 3) {
        SymbolSet.call(this, l, c._parent, s);
        var pp = parseInt(s.substring(0, s.indexOf(',')), 10);
        this.init(c, pp);
    } else if (p) {
        SymbolSet.call(this, l, c._parent, s, f);
        this.init(c, p);
    }
}
/**
 * Inheriting
 */
ChartSymbolSet.prototype = Object.create(SymbolSet.prototype);
ChartSymbolSet.prototype.constructor = ChartSymbolSet;
/**
 * @param {Chart} c
 * @param {number} p
 */
ChartSymbolSet.prototype.init = function(c, p) {
    this._chart = c;
    this._period = p;
    this._drawObjects = [];
    this._currentLabelScale = -1;
    this._fixedLabelScale = -1;
    this._range = new MaxMin(this._chart);
    this._calcTimeInfo();
}
ChartSymbolSet.prototype.destroy = function() {
    if (this._drawObjects) 
        this._drawObjects = [];
    if (this._forexSymbolSet === undefined) {
        this._parent.deleteSymbolSet(this._forexSymbolSet);
    }
    if (this._relativeSymbolSet) {
        this._parent.deleteSymbolSet(this._relativeSymbolSet);
    }
    SymbolSet.prototype.destroy.call(this);
}
/** @override */
ChartSymbolSet.prototype.initialise = function(newSyms) {
    SymbolSet.prototype.initialise.call(this, newSyms);
    if (!this._isValid)
        return;
    var inf = SymbolSet.prototype.getSymbolInfo.call(this, 0); // ChartInfo
    this._marketOpen  = inf._marketOpen;
    this._marketClose = inf._marketClose;
    this._delay  = inf._delay;
    this._displayName = inf._displayName;
    var dd = new Date(this._parent._timestamp.getTime() - this._delay * 60000);
    this._time = this.getMasterTimeList().convertTime(dd, this.mainFrequency());
    this._changeProxyRoots();
}
/**
 * @param {number} style
 */
ChartSymbolSet.prototype.initialiseStockStudies = function(style) {
    var stock = StudyStock.createMainStock(this._chart._mainOverlay);
    this._chart._mainOverlay._study[Overlay.MAIN_STUDY_ID] = stock;
    stock._style = style;
    var numOverlays = this._entries.length - 1;
    for (var i = 0; i < Chart.MAX_OVERLAYS; i++) {
        var newSym = '';
        var overlayStyle = StudyStock.ST_NORMAL;
        if (i < numOverlays) {
            if (!this._chart._parent.getNoToolbar()) {
                newSym = this.getDisplaySymbol(i + 1);
                for (var j = 0; j < this._chart._toolbar._overlaySymbols.length; j++) {
                    var se = this._chart._toolbar._overlaySymbols[j]; // SymbolEdit
                    if (se.getSymbol() === undefined) continue;
                    if (se.getSymbol() === newSym) {
                        for (var m = 0; m < this._chart._toolbar._overlayStyleButtons[j].length; m++) {
                            if (this._chart._toolbar._overlayStyleButtons[j][m].getDown()) {
                                overlayStyle = m;
                                break;
                            }
                        }
                    }
                }
            }
//            console.log("new Overlay", Overlay.OVERLAY_STUDY_ID + i);
            if (this._chart._mainOverlay._study[Overlay.OVERLAY_STUDY_ID + i] === undefined || this._chart._mainOverlay._study[Overlay.OVERLAY_STUDY_ID + i]._name !== this._chart._currentSymbol.getDisplaySymbol(i + 1)) {
                if (this._chart._mainOverlay._study[Overlay.OVERLAY_STUDY_ID + i] && this._chart._mainOverlay._legend) {
                    this._chart._mainOverlay._legend.removeItem(this._chart._mainOverlay._study[Overlay.OVERLAY_STUDY_ID + i]._legendIndex);
                }
                this._chart._mainOverlay._study[Overlay.OVERLAY_STUDY_ID + i] = StudyStock.createOverlayStock(this._chart._mainOverlay, i);
                this._chart._mainOverlay._study[Overlay.OVERLAY_STUDY_ID + i]._style = overlayStyle;
            }
        } else {
            if (this._chart._mainOverlay._study[Overlay.OVERLAY_STUDY_ID + i] && this._chart._mainOverlay._legend) {
                this._chart._mainOverlay._legend.removeItem(this._chart._mainOverlay._study[Overlay.OVERLAY_STUDY_ID + i]._legendIndex);
            }
            this._chart._mainOverlay._study[Overlay.OVERLAY_STUDY_ID + i] = undefined;
        }
    }
}
/**
 * work out the max each of significant places and decimal points we can use on the graph. maintain state in
 * parent.currentSymbols.yLabelFactor as to what factor we are going to use.
 * @param {Array} pricesToCheck
 * @param {number} maxCharacters
 */
ChartSymbolSet.prototype.initialiseFormatter = function(pricesToCheck, maxCharacters) {
    if (this._showPercentageChanges) {
        if (this._labelFormatter === undefined) {
            this._labelFormatter = new DecimalFormat();
            this._labelFormatter.setGroupingUsed(false);
            this._labelFormatter.setMinimumFractionDigits(0);
        }
        this._labelFormatter.setMaximumFractionDigits(2);
        return;
    }
    if (this._labelFormatter === undefined) {
        this._labelFormatter = new DecimalFormat();
        this._labelFormatter.setGroupingUsed(false);
    }
    var market = this.mainSymbol().substring(0, this.mainSymbol().indexOf('^'));
    if (market === 'FX') {
        this._labelFormatter.setMinimumFractionDigits(4);
        this._labelFormatter.setMaximumFractionDigits(4);
    } else {
        this._yLabelFactor = 1;
        this._yLabelSuffix = 0;
        maxCharacters--;
        var sfs = this._calcDPAndWidthValues(pricesToCheck); // Array
        if (sfs[ChartSymbolSet.MAX_PLACES_BEFORE_DP] > maxCharacters) {
            while (sfs[ChartSymbolSet.WIDEST_VALUE] >= 1000.0 && this._yLabelSuffix < ChartSymbolSet.SI_SUFFIXES.length - 1) {
                sfs[ChartSymbolSet.WIDEST_VALUE] /= 1000.0;
                this._yLabelFactor *= 1000;
                this._yLabelSuffix++;
                sfs[ChartSymbolSet.MAX_PLACES_BEFORE_DP] -= 3;
            }
            sfs[ChartSymbolSet.MAX_PLACES_BEFORE_DP]++;
        }
        var dpAllowed = maxCharacters - sfs[ChartSymbolSet.MAX_PLACES_BEFORE_DP];
        this._labelFormatter.setMinimumFractionDigits(0);
        this._labelFormatter.setMaximumFractionDigits(dpAllowed);
    }
}
/**
 * Initialise drawing objects from parameters.
 * @param {Object} p
 */
ChartSymbolSet.prototype.initDrawingObjects = function(p) {
    this._drawObjects = [];
    var idx = 0;
    while (p.hasOwnProperty('do' + idx)) {
        var s = p['do' + idx];
        this._drawObjects.push(DrawingObject.parseStringForm(s, this._chart, this._chart._mainOverlay));
        idx++;
    }
}
/**
 * Initialises the display area for date range period.
 * @param {number} from
 * @param {number} to
 */
ChartSymbolSet.prototype.initialiseDateRangePeriod = function(from, to) {
    if (!this._isValid)
        return;
    var masterTimeList = this.getMasterTimeList();
    if (this.mainFrequency() <= PriceDataConstants.FREQUENCY_60) {
        this._timeEnd = masterTimeList.setToMarketClose(new Date(to));
    } else {
        this._timeEnd = masterTimeList.setToMarketOpen(new Date(from));
    }
    this._timeStart = masterTimeList.setToMarketOpen(new Date(from));
    this._initialNumTimeUnits = masterTimeList.count(this._timeStart, this._timeEnd);
    this.setNumTimeUnits(this._initialNumTimeUnits);
}
/**
 * Given a new period this initialises the visible range of the chart.
 * @param {boolean} resetRange
 */
ChartSymbolSet.prototype.initialiseRangeFromPeriod = function(resetRange) {
    if (!this._isValid) 
        return;
    var masterTimeList = this.getMasterTimeList();
    var count = 0;
    if (resetRange || this._timeEnd === undefined) {
        if (this._time === undefined) {
            var dd = new Date(this._parent._timestamp.getTime() - this._delay * 60000);
            this._time = masterTimeList.convertTime(dd, this.mainFrequency());
        }
        if (this.mainFrequency() !== PriceDataConstants.FREQUENCY_D) {
            this._timeEnd = masterTimeList.moveBackIntoMarketHours(this._time);
        } else {
            var myCal = Calendar.getInstance();
            myCal.setTime(this._time);
            var day = myCal.get(Calendar.DAY_OF_WEEK);
            if ((day === Calendar.SATURDAY || day === Calendar.SUNDAY) && this._time === masterTimeList.setToMarketOpen(this._time)) {
                this._timeEnd = this._time;
            } else {
                this._timeEnd = masterTimeList.moveBackIntoMarketHours(this._time);
            }
        }
        var yearStart;
        var c;
        switch (this._period) {
            case ChartSymbolSet.PERIOD_INT:
                count = 90;
                break;
            case ChartSymbolSet.PERIOD_1D:
                masterTimeList.generateForward(this._periodsMarketOpen);
                if (resetRange) 
                    this._timeEnd = masterTimeList.setToMarketClose(this._timeEnd);
                count = this._periodsMarketOpen;
                break;
            case ChartSymbolSet.PERIOD_2D:
                masterTimeList.generateForward(this._periodsMarketOpen);
                if (resetRange) 
                    this._timeEnd = masterTimeList.setToMarketClose(this._timeEnd);
                count = this._periodsMarketOpen * 2;
                break;
            case ChartSymbolSet.PERIOD_3D:
                masterTimeList.generateForward(this._periodsMarketOpen);
                if (resetRange) 
                    this._timeEnd = masterTimeList.setToMarketClose(this._timeEnd);
                count = this._periodsMarketOpen * 3;
                break;
            case ChartSymbolSet.PERIOD_5D:
                masterTimeList.generateForward(this._periodsMarketOpen);
                if (resetRange) 
                    this._timeEnd = masterTimeList.setToMarketClose(this._timeEnd);
                count = this._periodsMarketOpen * 5;
                break;
            case ChartSymbolSet.PERIOD_15D:
                masterTimeList.generateForward(this._periodsMarketOpen);
                if (resetRange) 
                    this._timeEnd = masterTimeList.setToMarketClose(this._timeEnd);
                count = this._periodsMarketOpen * 15;
                break;
            case ChartSymbolSet.PERIOD_1M:
            case ChartSymbolSet.PERIOD_2M:
            case ChartSymbolSet.PERIOD_3M:
                c = Calendar.getInstance();
                c.setTime(this._timeEnd);
                c.add(Calendar.MONTH, -(this._period - ChartSymbolSet.PERIOD_1M + 1));
                yearStart = c.getTime();
                masterTimeList.generateBackTo(yearStart);
                count = masterTimeList.count(yearStart, this._timeEnd);
                break;
            case ChartSymbolSet.PERIOD_6M:
                c = Calendar.getInstance();
                c.setTime(this._timeEnd);
                c.add(Calendar.MONTH, -6);
                yearStart = c.getTime();
                masterTimeList.generateBackTo(yearStart);
                count = masterTimeList.count(yearStart, this._timeEnd);
                break;
            case ChartSymbolSet.PERIOD_1Y:
            case ChartSymbolSet.PERIOD_2Y:
            case ChartSymbolSet.PERIOD_3Y:
                c = Calendar.getInstance();
                c.setTime(this._timeEnd);
                c.add(Calendar.YEAR, -(this._period - ChartSymbolSet.PERIOD_1Y + 1));
                yearStart = c.getTime();
                masterTimeList.generateBackTo(yearStart);
                count = masterTimeList.count(yearStart, this._timeEnd);
                break;
            case ChartSymbolSet.PERIOD_5Y:
                c = Calendar.getInstance();
                c.setTime(this._timeEnd);
                c.add(Calendar.YEAR, -5);
                yearStart = c.getTime();
                masterTimeList.generateBackTo(yearStart);
                count = masterTimeList.count(yearStart, this._timeEnd);
                break;
            case ChartSymbolSet.PERIOD_YTD:
                yearStart = masterTimeList.getFirstDayOfYear(this._timeEnd);
                c = Calendar.getInstance();
                c.setTime(this._timeEnd);
                c.add(Calendar.YEAR, 1);
                this._timeEnd = masterTimeList.getFirstDayOfYear(c.getTime());
                masterTimeList.generateForwardTo(this._timeEnd);
                count = masterTimeList.count(yearStart, this._timeEnd);
                break;
            case ChartSymbolSet.PERIOD_RANGE:
                c = Calendar.getInstance();
                c.setTime(this._timeEnd);
                c.add(Calendar.YEAR, -1);
                yearStart = new Date(c.getTime());
                if (this._chart._parent._toolbar && this._chart._parent._toolbar._dateRange) {
                    c.set(Calendar.YEAR, (this._chart._parent._toolbar._dateRange[0][2].getIndex() === -1 ? 0 : (this._chart._parent._toolbar._dateRange[0][2].getIndex() + 1970)));
                    c.set(Calendar.MONTH, (this._chart._parent._toolbar._dateRange[0][1].getIndex() === -1 ? 0 : this._chart._parent._toolbar._dateRange[0][1].getIndex()));
                    c.set(Calendar.DAY_OF_MONTH, (this._chart._parent._toolbar._dateRange[0][0].getIndex() === -1 ? 0 : this._chart._parent._toolbar._dateRange[0][0].getIndex() + 1));
                    yearStart = new Date(c.getTime());
                    c.set(Calendar.YEAR, (this._chart._parent._toolbar._dateRange[1][2].getIndex() === -1 ? 0 : (this._chart._parent._toolbar._dateRange[1][2].getIndex() + 1970)));
                    c.set(Calendar.MONTH, (this._chart._parent._toolbar._dateRange[1][1].getIndex() === -1 ? 0 : this._chart._parent._toolbar._dateRange[1][1].getIndex()));
                    c.set(Calendar.DAY_OF_MONTH, (this._chart._parent._toolbar._dateRange[1][0].getIndex() === -1 ? 0 : this._chart._parent._toolbar._dateRange[1][0].getIndex() + 1));
                    this._timeEnd = c.getTime();
                }
                masterTimeList.generateBackTo(yearStart);
                count = masterTimeList.count(yearStart, this._timeEnd);
                break;
        }
    } else {
        this._timeStart = masterTimeList.convertTime(this._timeStart, this.mainFrequency());
        var newTimeEnd = masterTimeList.convertTime(this._timeEnd, this.mainFrequency());
        if (this.mainFrequency() <= PriceDataConstants.FREQUENCY_60 && newTimeEnd !== this._timeEnd) {
            this._timeEnd = new Date(masterTimeList.add(newTimeEnd, 1));
        } else {
            this._timeEnd = new Date(newTimeEnd.getTime());
        }
        count = masterTimeList.count(this._timeStart, this._timeEnd);
    }
    this._initialNumTimeUnits = count;
    this.setNumTimeUnits(count);
    var maxRange = this._chart.calcMaxStudyRange();
    this.setStart(new Date(masterTimeList.add(this._timeStart, -maxRange)));
}
/**
 * Request data for a new set of symbols and frequency.
 * @override
 */
ChartSymbolSet.prototype.changeSymbols = function(s, f) {
    if (arguments.length === 1) {
        SymbolSet.prototype.changeSymbols.call(this, s.substring(s.indexOf(',') + 1));
    } else {
        SymbolSet.prototype.changeSymbols.call(this, s, f);
    }
}
/**
 * Generates a label for the price axis.
 * @param {number} val
 */
ChartSymbolSet.prototype.getYLabel = function(val) {
    if (this._labelFormatter === undefined) {
        this._labelFormatter = new DecimalFormat();
        this._labelFormatter.setGroupingUsed(false);
    }
    var market = this.mainSymbol().substring(0, this.mainSymbol().indexOf('^'));
    if (market === 'FX') {
        this._labelFormatter.setMinimumFractionDigits(4);
    } else {
        this._labelFormatter.setMinimumFractionDigits(2);
    }
    if (Math.abs(val) < 1e-6) val = 0.0;
    var l = this._labelFormatter.format(val / this._yLabelFactor) + ChartSymbolSet.SI_SUFFIXES[this._yLabelSuffix];
    if (this._showPercentageChanges) {
        l += "%";
        if (val > 0.0) l = "+" + l;
    }
    return l;
}
/**
 * Returns a description of this symbol set for the Pro charts toolbar.
 */
ChartSymbolSet.prototype.getDescriptionText = function() {
    var t = this._displayName + ' ' + Language.getString(this.mainFrequency() <= PriceDataConstants.FREQUENCY_60 ? 'toolbar_intraday' : 'toolbar_historical');
    return t;
}
/**
 * Calculates and sets scale factors (i.e. the ratio of close prices at the left side of the screen) for every stock
 * in the symbol set.
 */
ChartSymbolSet.prototype.calculateScaleFactors = function() {
    var series;
    for (var j = Chart.S_BID_CLOSE; j <= Chart.S_CUR_CLOSE; j++) {
        series = SymbolSet.prototype.getSeries.call(this, 0, j);
        if (series) 
            series.setScaleFactor(1.0);
    }
    // Diana: set other overlays scale 1.0
//    for (var i = 1; i < this._entries.length; i++) {
//        for (var j = Chart.S_BID_CLOSE; j <= Chart.S_CUR_CLOSE; j++) {
//            var series = SymbolSet.prototype.getSeries.call(this, i, j);
//            if (series) 
//                series.setScaleFactor(1.0);
//        }
//    }
    //
    // Diana: this makes scales for price
    series = this.getSeries(0, Chart.S_CUR_CLOSE);
    var initialStart = this._timeStart;
    if (series) {
        initialStart = Math.max(series.timeStart(), this._timeStart);
    }
    for (var i = 1; i < this._entries.length; i++) {
        var myI = TimeIterator.forwardRangeIterator(this.getMasterTimeList(), initialStart, this._timeEnd);
        var overlayPrice = undefined;
        var overlayClose = this.getSeries(i, Chart.S_CUR_CLOSE);
        do {
            overlayPrice = overlayClose.getUnscaled(myI._d);
        } while (overlayPrice === undefined && myI.move());
        var mainPrice = this.getSeries(0, Chart.S_CUR_CLOSE).getUnscaled(myI._d);
        for (j = Chart.S_BID_CLOSE; j <= Chart.S_CUR_CLOSE; j++) {
            this._entries[i]._series[j].calcScaleFactor(mainPrice, overlayPrice);
        }
    }
    //
}
/**
 * Overriden to wrap SymbolInfo objects if we're doing currency conversion. Since SymbolInfo objects are typically
 * obtained just to get a couple of values and then discarded, we do the wrapping here so as to avoid having to
 * expose every field in the SymbolInfo as a method we'd need to wrap as we do with DataSeries and its subclasses.
 * @override
 */
ChartSymbolSet.prototype.getSymbolInfo = function(index) {
    var si = SymbolSet.prototype.getSymbolInfo.call(this, index);
    if (this._displayCurrency && !si.isCurrency(this._displayCurrency)) {
        var sym = "FX^" + si.getForexCurrency() + this._displayCurrency;
        var forexData = this._forexSymbolSet.getData(sym, PriceDataConstants.FREQUENCY_D);
        si = new CurrencyConverterSymbolInfo(si, forexData._proxies[Chart.S_CUR_OPEN].getByIndex(-1));
    }
    if (this._showPercentageChanges) {
        si = new PercentageChangeSymbolInfo(si, this._entries[0]._series[Chart.S_CUR_CLOSE].getRootSeries().get(this._timeStart));
    }
    if (this._relativeSymbol) {
        var relativeData = this._relativeSymbolSet.getData(this._relativeSymbol, this.mainFrequency());
        si = new RelativeToSymbolInfo(si, relativeData._proxies[Chart.S_CUR_OPEN].getByIndex(-1));
    }
    return si;
}
/**
 * Overriden to wrap ProxySeries objects if we're doing currency conversion.
 * @override
 */
ChartSymbolSet.prototype.getSeries = function(si, series) {
    if (si < this._entries.length) {
        return this._entries[si]._series[series];
    }
    return undefined;
}
/**
 * @param {string} symbol
 * @param {boolean} override
 */
ChartSymbolSet.prototype.setRelativeDisplay = function(symbol, override) {
    if (!override && symbol === this._relativeSymbol) return;
    if (symbol === undefined) {
        this._removeFromAllProxies(RelativeToSeries.name);
        this._relativeSymbol = undefined;
        if (this._chart) {
            this._chart.setAutoScale(true);
            this._chart.symbolsChanged();
            this._chart.repaint();
            this._chart.setRecalcStudies();
        }
    } else {
        if (this._relativeSymbol) {
            this._removeFromAllProxies(RelativeToSeries.name);
        }
        this._relativeSymbol = symbol;
        var currentKeys = this._relativeSymbolSet ? [this._relativeSymbolSet.allEntryKeys()] : [];
        var newSymbol = !currentKeys.includes(symbol + this.mainFrequency());
        var syms = newSymbol ? [symbol] : [];
        if (syms.length === 0) {
            this.loadCompleted();
        } else {
            if (this._relativeSymbolSet === undefined) {
                this._relativeSymbolSet = new SymbolSet(this._parent, this, syms, this.mainFrequency());
            } else {
                this._relativeSymbolSet.changeSymbols(syms, this.mainFrequency());
            }
            this._relativeSymbolSet.setStart(this._lowTarget);
            this._relativeSymbolSet.setEnd(this._highTarget);
            if (this._chart) {
                this._chart.changeCursor(Cursor.WAIT_CURSOR);
            }
            this._parent.load();
        }
    }
}
/**
 * @param {boolean} show
 * @param {boolean} override
 */
ChartSymbolSet.prototype.setShowChange = function(show, override) {
    if (!override && show === this._showPercentageChanges) return;
    if (this._showPercentageChanges) {
        this._removeFromAllProxies(PercentageChangeSeries.name);
    }
    this._showPercentageChanges = show;
    if (this._showPercentageChanges) {
        for (var i = 0; i < this._entries.length; i++) {
            for (var j = 0; j < DataAggregator.NUM_SERIES; j++) {
                this._entries[i]._series[j] = new PercentageChangeSeries(this._entries[i]._series[j], this);
            }
        }
    }
    if (this._chart) {
        this._chart.symbolsChanged();
        this._chart.repaint();
        this._chart.setRecalcStudies();
    }
}
/**
 * Gets called when FOREX data has been loaded for currency conversion and adds the converter wrapper to proxy
 * chains so that the user's display updates only when we're ready.
 */
ChartSymbolSet.prototype.loadCompleted = function() {
    var i, j;
    if (this._displayCurrency) {
        for (i = 0; i < this._entries.length; i++) {
            var curSymInfo = this._parent._symbolInfo[this._entries[i]._symbol];
            if (curSymInfo.isCurrency(this._displayCurrency)) continue;
            if (this._entries[i]._series[0].isInChain(CurrencyConverterSeries.name)) continue;
            var sym = "FX^" + curSymInfo.getForexCurrency() + this._displayCurrency;
            var forexData = this._forexSymbolSet.getData(sym, PriceDataConstants.FREQUENCY_D);
            for (j = 0; j < DataAggregator.NUM_SERIES; j++) {
                this._entries[i]._series[j] = new CurrencyConverterSeries(this._entries[i]._series[j], this, forexData._proxies[Chart.S_CUR_OPEN], curSymInfo.getCurrency());
            }
        }
    }
    if (this._relativeSymbol) {
        var relativeData = this._relativeSymbolSet.getData(this._relativeSymbol, this.mainFrequency());
        for (i = 0; i < this._entries.length; i++) {
            if (this._entries[i]._series[0].isInChain(RelativeToSeries.name)) continue;
            for (j = 0; j < DataAggregator.NUM_SERIES; j++) {
                this._entries[i]._series[j] = new RelativeToSeries(this._entries[i]._series[j], this, relativeData._proxies[j]);
            }
        }
    }
    if (this._chart) {
        this._chart.setAutoScale(true);
        this._chart.symbolsChanged();
        this._chart.repaint();
        this._chart.setRecalcStudies();
        this._chart.changeCursor(Cursor.DEFAULT_CURSOR);
    }
}
/**
 * Sets the currency we want to display prices in. If null is passed then it reverts to viewing prices in their
 * natural currency. This method will also load any FOREX data required to convert prices for display.
 * @param {string} c
 * @param {boolean} override
 */
ChartSymbolSet.prototype.setDisplayCurrency = function(c, override) {
    if (!override && this._displayCurrency === c)
        return;
    if (c === undefined) {
        this._removeFromAllProxies(CurrencyConverterSeries.name);
        this._displayCurrency = undefined;
        if (this._chart) {
            this._chart.symbolsChanged();
            this._chart.repaint();
            this._chart.setRecalcStudies();
        }
    } else {
        if (this._displayCurrency) {
            this._removeFromAllProxies(CurrencyConverterSeries.name);
        }
        this._displayCurrency = c;
        var currentForexSyms = new Array();
        if (this._forexSymbolSet) {
            currentForexSyms.push(this._forexSymbolSet.symbols());
        }
        var newForexSyms = new Array();
        for (var i = 0; i < this._entries.length; i++) {
            var curSymInfo = this._parent._symbolInfo[this._entries[i]._symbol];
            if (!curSymInfo.isCurrency(this._displayCurrency)) {
                var sym = "FX^" + curSymInfo.getForexCurrency() + this._displayCurrency;
                newForexSyms.push(sym);
            }
            // Only get data for items not already in the FOREX set.
            var addedForexSyms = newForexSyms.difference(currentForexSyms);
            if (addedForexSyms.length > 0) {
                // Load symbol info first.
                this._parent.getChartInfo(addedForexSyms);
                
                // This will make sure that we've got as much FOREX data as possible - easier to
                // load it all in one go and cache it.
                if (this._forexSymbolSet === undefined) {
                    this._forexSymbolSet = new SymbolSet(this._parent, this, addedForexSyms, PriceDataConstants.FREQUENCY_D);
                    this._parent.addSymbolSet(this._forexSymbolSet);
                } else {
                    this._forexSymbolSet.changeSymbols(addedForexSyms, PriceDataConstants.FREQUENCY_D);
                }
                
                this._forexSymbolSet.setStart(new Date(0));
                this._forexSymbolSet.setEnd(this._time);
                this._chart.changeCursor(Cursor.WAIT_CURSOR);
                
                this._parent.load();
            } else if (override) {
                this.loadCompleted();
            } else if (this._chart) {
                this._chart.symbolsChanged();
                this._chart.repaint();
                this._chart.setRecalcStudies();
            }
        }
    }
}
/**
 * Convert all drawing objects into a text form.
 */
ChartSymbolSet.prototype.getDrawingObjects = function() {
    var objects = new Object();
    for (var i = 0; i < this._drawObjects.length; i++) {
        objects['do' + i] = this._drawObjects[i].getStringForm();
    }
    return objects;
}
/**
 * Copies all details from another ChartSymbolSet.
 * @param {ChartSymbolSet} other
 */
ChartSymbolSet.prototype.syncTo = function(other) {
    this.changeFrequency(other._period, other.mainFrequency(), false);
    this._unitWidth = other._unitWidth;
    this._numTimeUnits = other._numTimeUnits;
    this.setTimeEnd(this.getMasterTimeList().moveBackIntoMarketHours(other._timeEnd));
    this._currentLabelScale = other._currentLabelScale;
    this._fixedLabelScale = other._fixedLabelScale;
    this._verticalLinePosition = other._verticalLinePosition;
}
/**
 * Calculates which label scale to use.
 * This used to use a weird iterative thing that could often get things wrong,
 * so this is now simplified to return a fixed type based on the amount of data being displayed.
 * 
 * Should be nicely faster too.
 * 
 * @return New label scale.
 */
ChartSymbolSet.prototype.getLabelScale = function() {
    if (!this._isValid) 
        return;
    if (this._fixedLabelScale !== -1) 
        return this._fixedLabelScale;
    if (this._chart._currentSymbol === undefined) 
        return -1;
    var labelScale = this._currentLabelScale;
    var displayedTime = this._timeEnd.getTime() - this._timeStart.getTime();
    if (displayedTime <= 600000) { // for less than 10 mins, display 1 minute labels
        labelScale = LabelIterator.L_1MIN;
    } else if (displayedTime <= 1440000) { // less than 30 mins, 5 min labels
        labelScale = LabelIterator.L_5MINS;
    } else if (displayedTime <= 2460000) { // less than 45 mins, 10 min labels
        labelScale = LabelIterator.L_10MINS;
    } else if (displayedTime <= 5400000) { // less than 1.5 hours, 15 min labels
        labelScale = LabelIterator.L_15MINS;
    } else if (displayedTime <= 9540000) { // less than 3 hours, 30 min labels
        labelScale = LabelIterator.L_30MINS;
    } else if (displayedTime <= 86400000) { // less than 7 hours, 1 hour labels
        labelScale = LabelIterator.L_1HOUR;
    } else if (displayedTime <= 280000000) { // less than 2 days, 2 hour labels
        labelScale = LabelIterator.L_2HOURS;
    } else if (displayedTime <= 440720000) { // less than 3 days, 4 hour labels
        labelScale = LabelIterator.L_4HOURS;
    } else if (displayedTime <= 800000000) { // less than 1 week, 1 day labels
        labelScale = LabelIterator.L_1DAY;
    } else if (displayedTime <= 1500000000) { // less than 2 weeks, 2 day labels
        labelScale = LabelIterator.L_2DAYS;
    } else if (displayedTime <= 4000000000) { // less than 2 months, 1 week labels
        labelScale = LabelIterator.L_1WEEK;
    } else if (displayedTime <= 8553600000) { // less than 3 months, 2 week labels
        labelScale = LabelIterator.L_2WEEKS;
    } else if (displayedTime <= 17103600000) { // less than 6 months, 1 month labels
        labelScale = LabelIterator.L_1MONTH;
    } else if (displayedTime <= 32313600000) { // less than 1 year, 2 month labels
        labelScale = LabelIterator.L_2MONTHS;
    } else if (displayedTime <= 64713600000) { // less than 2 years, 3 month labels
        labelScale = LabelIterator.L_3MONTHS;
    } else if (displayedTime <= 97027200000) { // less than 3 years, 6 month labels
        labelScale = LabelIterator.L_6MONTHS;
    } else if (displayedTime <= 200000000000) { // less than 5 years, 1 year labels
        labelScale = LabelIterator.L_1YEAR;
    } else if (displayedTime <= 400000000000) { // less than 10 years, 2 year labels
        labelScale = LabelIterator.L_2YEARS;
    } else {
        labelScale = LabelIterator.L_5YEARS;
    }
    return labelScale;
}
/**
 * From a given scale factor, recalculate unit size and number of time units onscreen.
 * @param {number} dx - X-axis scale factor.
 */
ChartSymbolSet.prototype.recalcXScale = function(dx) {
    this._unitWidth = Math.min(this._chart.getDrawGraphWidth(), this._oldUnitWidth * dx);
    this._numTimeUnits = parseInt(this._chart.getDrawGraphWidth() / this._unitWidth, 10);
    this.setTimeEnd(this._timeEnd);
}
/**
 * Sets the timeEnd.
 * @param {Date} d - The timeEnd to set
 */
ChartSymbolSet.prototype.setTimeEnd = function(d) {
    if (!d)
        return;
    this._timeEnd = new Date(d.getTime());
    var mtl = this.getMasterTimeList();
    if (mtl) {
        this._timeStart = new Date(mtl.add(this._timeEnd, -Math.ceil(this._numTimeUnits)));
        this.setStart(this._timeStart);
    } else {
        this.setStart(this._timeEnd > this._time ? this._time : this._timeEnd);
    }
    this.setEnd(this._timeEnd > this._time ? this._time : this._timeEnd);
}
/**
 * Sets the timeStart.
 * @param {Date} d - The timeStart to set
 */
ChartSymbolSet.prototype.setTimeStart = function(d) {
    if (!d)
        return;
    this._timeStart = new Date(d.getTime());
    this._timeEnd = new Date(this.getMasterTimeList().add(this._timeStart, Math.ceil(this._numTimeUnits)));
    this.setStart(this._timeStart);
    this.setEnd(this._timeEnd > this._time ? this._time : this._timeEnd);
}
/**
 * Set the number of units that cover the screen's width.
 * @param {number} units - The number of units.
 */
ChartSymbolSet.prototype.setNumTimeUnits = function(units) {
    this._numTimeUnits = units;
    this._oldUnitWidth = this._unitWidth = this._chart.getDrawGraphWidth() / units;
    this.setTimeEnd(this._timeEnd);
    if (this.mainFrequency() < LabelIterator.basicLabelScale.length) {
        this._currentLabelScale = LabelIterator.basicLabelScale[this.mainFrequency()];
    } else {
        this._currentLabelScale = LabelIterator.basicLabelScale[0];
    }
    this._currentLabelScale = this.getLabelScale();
}
/** @override */
ChartSymbolSet.prototype.setEnd = function(end) {
    SymbolSet.prototype.setEnd.call(this, end);
    if (this._relativeSymbolSet) {
        this._relativeSymbolSet.setEnd(end);
    }
}
/** @override */
ChartSymbolSet.prototype.setStart = function(start) {
    SymbolSet.prototype.setStart.call(this, start);
    if (this._relativeSymbolSet!== undefined) {
        this._relativeSymbolSet.setStart(start);
    }
}
/**
 * Changes the frequency and period of this symbol set.
 * @param {number} p - period
 * @param {number} f - frequency
 * @param {boolean} reset
 */
ChartSymbolSet.prototype.changeFrequency = function(p, f, reset) {
    if (f !== this.mainFrequency()) {
        var newFreqList = new Array(this._entries.length);
        newFreqList.fillArrayWithValue(f);
        SymbolSet.prototype.changeOnlyFrequency.call(this, newFreqList);
    }
    this._currentLabelScale = -1;
    this._period = p;
    this._calcTimeInfo();
    this.initialiseRangeFromPeriod(reset);
}
/**
 * @private
 * @param {Array} values
 */
ChartSymbolSet.prototype._calcDPAndWidthValues = function(values) {
    var results = new Array(3);
    for (var i = 0; i < values.length; i++) {
        var curValue = Math.abs(values[0]);
        if (curValue === 0.0) 
            continue;
        var floorValue = Math.floor(curValue);
        var digitsBefore = 1 + Math.floor(Math.log(floorValue) / Math.log(10.0));
        var totalDigits = digitsBefore;
        if (floorValue !== curValue) {
            var fracValue = curValue - floorValue;
            var decimalPlaces = 0;
            while (fracValue < 1.0) {
                decimalPlaces++;
                fracValue *= 10.0;
            }
            totalDigits += 1 + decimalPlaces;
        }
        if (totalDigits > results[ChartSymbolSet.MAX_TOTAL_DIGITS]) {
            results[ChartSymbolSet.MAX_TOTAL_DIGITS] = totalDigits;
            results[ChartSymbolSet.WIDEST_VALUE] = Math.max(curValue, results[ChartSymbolSet.WIDEST_VALUE]);
        }
        results[ChartSymbolSet.MAX_PLACES_BEFORE_DP] = Math.max(results[ChartSymbolSet.MAX_PLACES_BEFORE_DP], digitsBefore);
    }
    return results;
}
/**
 * Remove a single type of wrapper from all proxied objects it's in.
 * @private
 * @param {string} k
 */
ChartSymbolSet.prototype._removeFromAllProxies = function(k) {
    for (var i = 0; i < this._entries.length; i++) {
        for (var j = 0; j < DataAggregator.NUM_SERIES; j++) {
            if (Utils.getConstructorName(this._entries[i]._series[j]) === "RelativeSeries")
                this._entries[i]._series[j] = this._entries[i]._series[j].removeFromChain(k);
        }
    }
}
/**
 * @private
 * Change all proxies to have a different root object i.e. a ProxySeries pointing to a different DataAggregator than
 * before. Called when symbols or frequencies have changed in this symbol set.
 */
ChartSymbolSet.prototype._changeProxyRoots = function() {
    for (var i = 0; i < this._entries.length; i++) {
        for (var j = 0; j < DataAggregator.NUM_SERIES; j++) {
            this._entries[i]._series[j] = SymbolSet.prototype.getSeries.call(this, i, j);
        }
    }
    this.setDisplayCurrency(this._displayCurrency, true);
    this.setShowChange(this._showPercentageChanges, true);
    this.setRelativeDisplay(this._relativeSymbol, true);
}
/**
 * @private
 * Calculates time info needed for display.
 */
ChartSymbolSet.prototype._calcTimeInfo = function() {
    if (!this._isValid) 
        return;
    if (this.mainFrequency() <= PriceDataConstants.FREQUENCY_60) {
        if (this._marketClose > this._marketOpen) {
            this._periodsMarketOpen = (this._marketClose - this._marketOpen) / PriceDataConstants.minutes[this.mainFrequency()];
        } else {
            this._periodsMarketOpen = (this._marketClose + (1440 - this._marketOpen)) / PriceDataConstants.minutes[this.mainFrequency()];
        }
    } else {
        this._periodsMarketOpen = 0;
    }
}
/** @static */
ChartSymbolSet.PERIOD_INT = 0;
/** @static */
ChartSymbolSet.PERIOD_1D = 1;
/** @static */
ChartSymbolSet.PERIOD_2D = 2;
/** @static */
ChartSymbolSet.PERIOD_3D = 3;
/** @static */
ChartSymbolSet.PERIOD_5D = 4;
/** @static */
ChartSymbolSet.PERIOD_1M = 5;
/** @static */
ChartSymbolSet.PERIOD_2M = 6;
/** @static */
ChartSymbolSet.PERIOD_3M = 7;
/** @static */
ChartSymbolSet.PERIOD_6M = 8;
/** @static */
ChartSymbolSet.PERIOD_1Y = 9;
/** @static */
ChartSymbolSet.PERIOD_2Y = 10;
/** @static */
ChartSymbolSet.PERIOD_3Y = 11;
/** @static */
ChartSymbolSet.PERIOD_5Y = 12;
/** @static */
ChartSymbolSet.PERIOD_YTD = 13;
/** @static */
ChartSymbolSet.PERIOD_RANGE = 14;
/** @static */
ChartSymbolSet.PERIOD_15D = 15;
/** @static */
ChartSymbolSet.SI_SUFFIXES = ["", "K", "M", "B", "T", "Q"];
/** @static */
ChartSymbolSet.MAX_TOTAL_DIGITS = 0;
/** @static */
ChartSymbolSet.WIDEST_VALUE = 1;
/** @static */
ChartSymbolSet.MAX_PLACES_BEFORE_DP = 2;