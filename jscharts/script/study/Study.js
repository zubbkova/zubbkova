/**
 * -----
 * Study
 * -----
 * @constructor
 * @param {Overlay} overlay
 */
function Study(overlay) {
    this._fixedMid = false;
    this._triple = false;
    this._couple = false;
    this._name = "";
    this._legendIndex = -1;
    this._parent = overlay;
    this._range = new MaxMin(overlay._chartCanvas._chart);
    this._comboMnemonics = Study.getMnemonics();
    this._series = new Series();
    this.updateDefaultDataSource();
}
Study.prototype.updateDefaultDataSource = function() {
    this._open = this._parent._chartCanvas._chart.getSeries(Chart.S_CUR_OPEN);
    this._high = this._parent._chartCanvas._chart.getSeries(Chart.S_CUR_HIGH);
    this._low = this._parent._chartCanvas._chart.getSeries(Chart.S_CUR_LOW);

    if (this._close === undefined || this._close === this._source)
        this._close = this._source = this._parent._chartCanvas._chart.getSeries(Chart.S_CUR_CLOSE);
    else
        this._close = this._parent._chartCanvas._chart.getSeries(Chart.S_CUR_CLOSE);

    this._buy = this._parent._chartCanvas._chart.getSeries(Chart.S_BUY_VOLUME);
    this._sell = this._parent._chartCanvas._chart.getSeries(Chart.S_SELL_VOLUME);
    this._unknown = this._parent._chartCanvas._chart.getSeries(Chart.S_UNKNOWN_VOLUME);
    this._vol = this._parent._chartCanvas._chart.getSeries(Chart.S_TOTAL_VOLUME);
    if (this._source) {
        if (this._source.timeStart().getTime() > 0 && this._source.timeStart() < this._parent._chartCanvas._chart._currentSymbol._time) {
            this.update(this._source.timeStart(), this._parent._chartCanvas._chart._currentSymbol._time);
        }
    }
}
/**
 * @param {Date=} start
 * @param {Date=} end
 */
Study.prototype.update = function(start, end) {
    if (arguments.length === 0) {
        if (this._source === undefined) {
            this.updateDefaultDataSource();
        }
    }
}
/** @protected */
Study.prototype._initLegend = function() {
    if (this._parent._legend && this._legendIndex === -1) {
        this._legendIndex = this._parent._legend.addItem(this._name);
        if (this._triple) {
            this._parent._legend.makeTriple(this._legendIndex);
            this._colour = this._parent._legend.getItem(this._legendIndex)._colour1;
            this._colour1 = this._parent._legend.getItem(this._legendIndex)._colour1;
            this._colour2 = this._parent._legend.getItem(this._legendIndex)._colour2;
            this._colour3 = this._parent._legend.getItem(this._legendIndex)._colour3;
        } else if (this._couple) {
            this._parent._legend.makeDouble(this._legendIndex);
            this._colour = this._parent._legend.getItem(this._legendIndex)._colour1;
            this._colour1 = this._parent._legend.getItem(this._legendIndex)._colour1;
            this._colour2 = this._parent._legend.getItem(this._legendIndex)._colour2;
        } else {
            this._colour = this._parent._legend.getItem(this._legendIndex)._colour;
        }
    } else {
        this._colour = Legend.getNextColour();
        if (this._triple) {
            this._colour1 =  Legend.getNextColour();
            this._colour2 =  Legend.getNextColour();
            this._colour3 =  Legend.getNextColour();
        } else if (this._couple) {
            this._colour1 =  Legend.getNextColour();
            this._colour2 =  Legend.getNextColour();
        }
    }
    return this._legendIndex;
}
/**
 * @param {Color|string} c
 */
Study.prototype.initLegend = function(c) {
    if (this._parent._legend && this._legendIndex === -1) {
        if (this._triple) {
            this._legendIndex = this._parent._legend.addItem(this._name);
            this._parent._legend.makeTriple(this._legendIndex);
            this._colour = this._parent._legend.getItem(this._legendIndex)._colour1;
            this._colour2 = this._parent._legend.getItem(this._legendIndex)._colour2;
            this._colour3 = this._parent._legend.getItem(this._legendIndex)._colour3;
        } else if (this._couple) {
            this._legendIndex = this._parent._legend.addItem(this._name);
            this._parent._legend.makeDouble(this._legendIndex);
            this._colour = this._parent._legend.getItem(this._legendIndex)._colour1;
            this._colour2 = this._parent._legend.getItem(this._legendIndex)._colour2;
        } else {
            this._legendIndex = this._parent._legend.addItem(this._name, c);
            this._colour = c;
        }
    }
    return this._legendIndex;
}
/**
 * @param {TimeIterator} i
 */
Study.prototype.getMaxMin = function(i) {
    this._range.reset();
    this._range.getMaxMin(this._series, i);
}
Study.prototype.refresh = function() {
    this.draw();
}
Study.prototype.draw = function() {
    this.updateY();
    this._parent.drawLineNormal(this._series, this._colour);
}
Study.prototype.restartStudy = function() {}
/**
 * @param {number} v
 */
Study.prototype.diff = function(v) {
    return (v > 0.0 ? "+" : "") + Study.csvFormat.format(v);
}
/**
 * @param {number} v
 */
Study.prototype.i = function(v) {
    return v.toString();
}
/**
 * @param {number} v
 */
Study.prototype.d = function(v) {
    return Study.csvFormat.format(v);
}
/**
 * @param {Date} d
 */
Study.prototype.getColumnValues = function(d) {
    return [this.d(this._series.get(d))];
}
Study.prototype.getColumnNames = function() {
    return [this._name];
}
Study.prototype.getRange = function() {
    return 0;
}
/**
 * @param {DataSeries} s
 */
Study.prototype.checkRange = function(s) {
    let range = this.getRange();
    let ss = this._parent._chartCanvas._chart._currentSymbol;
    let size = ss.getMasterTimeList().count(s.timeStart(), s.timeEnd());
    if (range > size) {
        ss.setStart(this._parent._chartCanvas._chart.timeAdjust(ss.getStart(), -range));
        return false;
    }
    return true;
}
/**
 * @param {string} p
 */
Study.prototype.setParams = function(p) {
    this.setName();
    if (this._parent._legend) {
        this._parent._legend.renameItem(this._legendIndex, this._name);
    }
    this._parent._chartCanvas._chart._currentSymbol.setStart(new Date(this._parent._chartCanvas._chart._currentSymbol.getMasterTimeList().add(this._parent._chartCanvas._chart._currentSymbol._timeStart, -this._parent._chartCanvas._chart.calcMaxStudyRange())));
}
Study.prototype.setName = function() {}
Study.prototype.getParams = function() {
    return "";
}
Study.prototype.destroy = function() {
    if (this._parent._legend && this._legendIndex !== -1) 
        this._parent._legend.removeItem(this._legendIndex);
}
Study.prototype.getMnemonic = function() {
    return this.constructor.mnemonic === undefined ? "" : this.constructor.mnemonic;
}
Study.prototype.updateY = function() {
    this._parent._chartCanvas._topLineY = this._parent._y;
    this._parent._chartCanvas._bottomLineY = this._parent._y + this._parent._height;
}
/** @static */
Study.csvFormat = new DecimalFormat();
Study.csvFormat.setGroupingUsed(false);
Study.csvFormat.setMaximumFractionDigits(3);
/** @static */
Study.ownOverlay = false;
/** @static */
Study.mnemonic = "";
/** 
 * @static 
 * @param {string} m
 */
Study.studyMnemonicToIndex = function(m) {
    for (let i = 0; i < Study.comboMnemonics.length; i++) {
        if (Study.comboMnemonics[i][1] === m)
            return i;
    }
    return 0;
}
/** @static */
Study.getMnemonics = function() {
    let temp = [[Language.getString("study_nostudy"), ""] ,
                [Language.getString("study_title_mostpopular"), ""],
                [Language.getString("study_keltner"), "Keltner"],
                [Language.getString("study_pointandfigure"), "PointAndFigure"],
                [Language.getString("study_renko"), "Renko"],
                [Language.getString("study_threelinebreak"), "ThreeLineBreak"],
                [Language.getString("study_truestrengthindicator"), "TrueStrengthIndicator"],
                [Language.getString("study_simplemovingaverage"), "SMA"],
                [Language.getString("study_bollingerbands"), "Bol"],
                [Language.getString("study_bidofferspread"), "BOS"],
                [Language.getString("study_macd"), "MACD"],
                [Language.getString("study_relativestrengthindex"), "RSI"],
                [Language.getString("study_volume"), "Vol"],
                [Language.getString("study_highandlow"), "HighLow"],
                
                [Language.getString("study_title_movingaverages"), ""],
                [Language.getString("study_adaptivemovingaverage"), "AMA"],
                [Language.getString("study_deltaweightedmovingaverage"), "DeltaWeightedMovingAverage"],
                [Language.getString("study_exponentialmovingaverage"), "EMA"],
                [Language.getString("study_highlowmovingaverage"), "HighLowMA"],
                [Language.getString("study_simplemovingaverage"), "SMA"],
                [Language.getString("study_weightedmovingaverage"), "WMA"],
                [Language.getString("study_volumeweightedmovingaverage"), "VMA"],
                [Language.getString("study_triplemovingaverage"), "TripleMA"],
                
                [Language.getString("study_title_bands"), ""],
                [Language.getString("study_bollingerbands"), "Bol"],
                [Language.getString("study_cci"), "CCI"],
                [Language.getString("study_ccimacrossover"), "CCIMACrossover"],
                [Language.getString("study_donchianchannels"), "Donchian"],
                [Language.getString("study_highlowmovingaverage"), "HighLowMA"],
                [Language.getString("study_maenvelopes"), "MAEnvelope"],
                [Language.getString("study_bidofferspread"), "BOS"],
                [Language.getString("study_skewbands"), "SkewBands"],
                [Language.getString("study_highandlow"), "HighLow"],
        
                [Language.getString("study_title_signals"), ""],
                [Language.getString("study_cci"), "CCI"],
                [Language.getString("study_parabolicsar"),  "SAR"],
                [Language.getString("study_macd"), "MACD"],
                [Language.getString("study_macdhistogram"), "MACDHistogram"],
                
                [Language.getString("study_title_statistical"), ""],
                [Language.getString("study_linearregression"), "LinearRegression"],
                [Language.getString("study_linearregressiondetrended"), "LinearRegressionDetrended"],
                [Language.getString("study_stddeviation"), "StdDeviation"],
                
                [Language.getString("study_title_volume"), ""],
                [Language.getString("study_volume"), "Vol"],
                [Language.getString("study_volume_plus"), "VolPlus"],
                [Language.getString("study_volumeama"), "VolumeAMA"],
                [Language.getString("study_volumeema"), "VolumeEMA"],
                [Language.getString("study_volumesma"), "VolumeMA"],
                [Language.getString("study_volumeaccumulation"), "VolumeAccumulation"],
                [Language.getString("study_volumeefficiency"), "Eff"],
                [Language.getString("study_buysellvolumeratioma"), "BuySellVolumeMA"],
                
                [Language.getString("study_title_momentum"), ""],
                [Language.getString("study_momentum"), "Mom"],
                [Language.getString("study_rateofchange"), "ROC"],
                [Language.getString("study_relativestrengthindex"), "RSI"],
                [Language.getString("study_stochastic"), "Sto"],
                [Language.getString("study_stochasticrsi"), "StochRSI"],
                [Language.getString("study_chandesmomentumoscillator"), "ChandeMomentum"],
                [Language.getString("study_coppockcurve"), "Coppock"],
                [Language.getString("study_massindex"), "Mass"],
                [Language.getString("study_moneyflow"), "Flow"],
                [Language.getString("study_onbalancevolume"), "OBV"],
                
                [Language.getString("study_title_volatility"), ""],
                [Language.getString("study_volatility"), "Volatility"],
                [Language.getString("study_volatilityratio"), "VolatilityRatio"],
                [Language.getString("study_averagetruerange"), "ATR"],
                [Language.getString("study_chaikinvolatility"), "ChaikinVol"],
                [Language.getString("study_kurtosis"), "Kurtosis"],
                [Language.getString("study_fastslowkurtosis"), "FastSlowKurtosis"],
                [Language.getString("study_skew"), "Skew"],
                
                [Language.getString("study_title_oscillators"), ""],
                [Language.getString("study_chaikinoscillator"), "Chaikin"],
                [Language.getString("study_chandesmomentumoscillator"), "ChandeMomentum"],
                [Language.getString("study_detrendedpriceoscillator"), "DPO"],
                [Language.getString("study_disparityindex"), "Disparity"],
                [Language.getString("study_priceoscillator"), "PO"],
                [Language.getString("study_ultimateoscillator"), "Ultimate"],
                [Language.getString("study_volumeoscillator"), "VOsc"],
                
                [Language.getString("study_title_exclusive"), ""],
                [Language.getString("study_level2scope"), "Level2Histogram"],
                [Language.getString("study_buysellvolumeratioma"), "BuySellVolumeMA"],
                [Language.getString("study_deltaweightedmovingaverage"), "DeltaWeightedMovingAverage"],
                [Language.getString("study_fractaldimension"), "FractalDimension"],
                [Language.getString("study_pathlength"), "PathLength"],
                [Language.getString("study_truestrengthindicator"), "TrueStrengthIndicator"],
                [Language.getString("study_zigzag"), "ZigZag"],
                
                [Language.getString("study_title_additional"), ""],
                [Language.getString("study_accumulationdistribution"), "AccDst"],
                [Language.getString("study_adxdmi"), "DMI"],
                [Language.getString("study_adxr"), "ADXR"],
                [Language.getString("study_aroon"), "Aroon"],
                [Language.getString("study_bollingerbandwidth"), "BolBandWidth"],
                [Language.getString("study_chaikinmoneyflow"), "CMoney"],
                [Language.getString("study_chaikinmoneyflowpersistance"), "CMoneyPersistence"],
                [Language.getString("study_choppiness"), "Choppiness"],
                [Language.getString("study_histogram"), "Hist"],
                [Language.getString("study_ichimokukinkohyo"), "Ichimoku"],
                [Language.getString("study_logreturns"), "Returns"],
                [Language.getString("study_threelinebreak"), "ThreeLineBreak"],
                [Language.getString("study_VWAP"), "VWAP"],
                [Language.getString("study_williams_r"), "Williams"],
                [Language.getString("study_pivotpoints"), "PivotPoints"],
                [Language.getString("study_incomegenerator"), "IncomeGenerator"],                             
                
                [Language.getString("study_title_jcm"), ""],
                [Language.getString("study_hir"), "Hir"],
                [Language.getString("study_girella"), "Girella"],
                [Language.getString("study_mx"), "Mx"],
                [Language.getString("study_mpointer"), "Mpointer"],
                [Language.getString("study_zone"), "Zone"]];
    return temp;
}