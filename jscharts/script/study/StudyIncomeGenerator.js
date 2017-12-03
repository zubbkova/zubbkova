/* eslint no-unused-vars: "off" */
/* global Study, Series, Main, WebQuery_Table, Utils, Language, ErrorCodes, Color, Font, Style */
/**
 * @constructor
 * @extends {Study}
 * @param {Overlay} o
 */
function StudyIncomeGenerator(o) {
    this._entryPrice = 0;
    this._stopLossPrice = 0;
    this._foundActivatorDay = false;
    this._activatorLong = false;
    Study.call(this, o);
    this._performWebQuery();
}
/**
 * Inheriting
 */
StudyIncomeGenerator.prototype = Object.create(Study.prototype);
StudyIncomeGenerator.prototype.constructor = StudyIncomeGenerator;
/** @static */
StudyIncomeGenerator.getItems = function() {
    return [];
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyIncomeGenerator.newInstance = function(o) {
    return new StudyIncomeGenerator(o);
}
/** @static */
StudyIncomeGenerator.mnemonic = "IncomeGenerator";
/** @static */
StudyIncomeGenerator.helpID = 418;
/** @static */
StudyIncomeGenerator.ownOverlay = false;
 /** @private */
StudyIncomeGenerator.prototype._performWebQuery = function() {
    var symbol = this._parent._chart._currentSymbol.mainSymbol();
    if (typeof this._cachedSymbol === "undefined" || this._cachedSymbol !== symbol) {
        this._doWebQuery(symbol);
        this._cachedSymbol = symbol;
    }
}
/**
 * @private 
 * @param {string} symbol
 */
StudyIncomeGenerator.prototype._doWebQuery = function(symbol) {
    this._series = new Series();
    symbol.replace('\\', '_');
    var params = "mainsymbol=" + symbol;
    params = encodeURIComponent(params);
    var self = this;
    $.ajax({
        type: "POST",
        url: Main.getAdvfnURL() + "p.php?java=incomegenerator",
        crossdomain: true,
        data: "param=" + params,
        dataType: "text",
        success: function(responseData) {
            self._onLoadIncomegenerator(responseData);
        },
        error: function(responseData, textStatus) {
            console.log("StudyIncomeGenerator. Can't load incomegenerator: " + textStatus);
        }
    });
}
/**
 * @private 
 * @param {Array} response
 */
StudyIncomeGenerator.prototype._onLoadIncomegenerator = function(response) {
    if (response.length === 0) {
        return;
    }
    response = response.toString().split("\n");
    var error = parseInt(response[0], 10);
    if (error !== 0) {
        console.log("StudyIncomeGenerator. Error load incomegenerator: " + ErrorCodes.strings[error]);
        return;
    }
    var numRows = parseInt(response[1], 10);
    var numColumns = parseInt(response[2], 10);
    var table = new WebQuery_Table(numColumns, numRows);
    var lineNum = 3;
    var i;
    for (i = 0; i < numColumns; i++) {
        table._columnName[i] = response[lineNum];
        lineNum++;
    }
    for (i = 0; i < numRows; i++) {
        for (var j = 0; j < numColumns; j++) {
            table._contents[i][j] = Utils.replace(response[lineNum], "\u001b", "\n");
            lineNum++;
        }
    }
    // parse data
    console.log("StudyIncomeGenerator. numRows", numRows, "numColumns", numColumns);
    if (numRows === 1) {
        if (numColumns === 5) {
            this._foundActivatorDay = true;
            this._activatorDayDate = new Date(1000 * parseInt(table._contents[0][table._columnName.indexOf("activatorDayDate")], 10));
            this._entryPrice = parseFloat(table._contents[0][table._columnName.indexOf("entryPrice")]);
            this._stopLossPrice = parseFloat(table._contents[0][table._columnName.indexOf("stopLossPrice")]);
            this._stopLineStartDate = new Date(1000 * parseInt(table._contents[0][table._columnName.indexOf("stopLineStartDate")], 10));
            this._activatorLong = table._contents[0][table._columnName.indexOf("activatorLong")].toLowerCase() === "true";
        } else {
            console.error("Not an activator day");
            this._foundActivatorDay = false;
        }
    }
}
/** @override */
StudyIncomeGenerator.prototype.setName = function() {
    this._name = Language.getString("study_incomegenerator");
}
/** @override */
StudyIncomeGenerator.prototype.getParams = function() {
    return "";
}
/** @override */
StudyIncomeGenerator.prototype.update = function(start, end) {
    if (this._foundActivatorDay) {
        var info = this._parent._chart._currentSymbol.getSymbolInfo(0);
        var intraDayHigh = info.getHighPrice();
        var intraDayLow = info.getLowPrice();
        if (this._activatorLong) {
            if (intraDayLow <= this._stopLossPrice) {
                console.log("Stopped out as intraday low " + intraDayLow + " <= " + this._stopLossPrice);
                this._foundActivatorDay = false;
            }
        } else {
            if (intraDayHigh >= this._stopLossPrice) {
                console.log("Stopped out as intraday high " + intraDayHigh + " >= " + this._stopLossPrice);
                this._foundActivatorDay = false;
            }
        }
    }
}
/** @override */
StudyIncomeGenerator.prototype.drawPrice = function() {
    this._parent.drawPrice(this._entryPrice, Color.blue);
    this._parent.drawPrice(this._stopLossPrice, Color.red);
}
/** @override */
StudyIncomeGenerator.prototype.draw = function() {
    this.updateY();
    if (this._foundActivatorDay) {
        var markerY;
        var markerX = parseInt(this._parent.getX(this._activatorDayDate), 10);
        var marker;
        if (this._activatorLong) {
            markerY = parseInt(this._parent.getY(this._entryPrice) - 4, 10);
            marker = "L";
        } else {
            markerY = parseInt(this._parent.getY(this._entryPrice) - 4, 10);
            marker = "S";
        }
        var entryPriceY = parseInt(this._parent.getY(this._entryPrice), 10);
        var stopPriceY = parseInt(this._parent.getY(this._stopLossPrice), 10);
        var xMax = this._parent._chartCanvas._topLineEndX;

        // plot entry line
        this._parent._chartCanvas.setStrokeColor(Color.blue);
        this._parent._chartCanvas.setLineWidth(2);
        this._parent._chartCanvas.drawLineWithAdjust(this._parent._chartCanvas._topLineStartX, entryPriceY, xMax, entryPriceY);
        
        // plot stop loss
        this._parent._chartCanvas.setStrokeColor(Color.red);
        this._parent._chartCanvas.drawLineWithAdjust(this._parent._chartCanvas._topLineStartX, stopPriceY, xMax, stopPriceY);
        
        
        this._parent._chartCanvas.setFillColor(new Color(0, 0, 0));
        var oldFont = this._parent._chartCanvas.getFont();
        this._parent._chartCanvas.setFont(new Font("Arial", Style.FONT_STYLE_BOLD, 16));
        this._parent._chartCanvas.fillText(marker, markerX, markerY);
        this._parent._chartCanvas.setFont(oldFont);
    }
    this._parent._chartCanvas.setLineWidth(this._parent._chart._drawingThickness);
}
/** @override */
StudyIncomeGenerator.prototype.updateDefaultDataSource = function() {
    Study.prototype.updateDefaultDataSource.call(this);
    this._performWebQuery();
}
/** @override */
StudyIncomeGenerator.prototype.getMaxMin = function(i) {
    if (this._foundActivatorDay) {
        if (this._activatorLong) {
            this._range._min = this._entryPrice;
            this._range._max = this._stopLossPrice;
        } else {
            this._range._min = this._stopLossPrice;
            this._range._max = this._entryPrice;
        }
    }
}