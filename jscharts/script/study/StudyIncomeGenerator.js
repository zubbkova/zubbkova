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
    let symbol = this._parent._chartCanvas._chart._currentSymbol.mainSymbol();
    if (this._cachedSymbol === undefined || this._cachedSymbol !== symbol) {
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
    let advfnUrl = Main.getAdvfnURL();
    symbol.replace('\\', '_');
    let params = "mainsymbol=" + symbol;
    params = encodeURIComponent(params);
    let self = this;
    $.ajax({
        type: "POST",
        url: Main.getAdvfnURL() + "p.php?java=incomegenerator",
        crossdomain: true,
        data: "param=" + params,
        dataType: "text",
        success: function(responseData, textStatus, jqXHR) {
            self._onLoadIncomegenerator(responseData);
        },
        error: function(responseData, textStatus, errorThrown) {
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
    let error = parseInt(response[0], 10);
    if (error !== 0) {
        console.log("StudyIncomeGenerator. Error load incomegenerator: " + ErrorCodes.strings[error]);
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
        let info = this._parent._chartCanvas._chart._currentSymbol.getSymbolInfo(0);
        let intraDayHigh = info.getHighPrice();
        let intraDayLow = info.getLowPrice();
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
StudyIncomeGenerator.prototype.draw = function() {
    this.updateY();
    if (this._foundActivatorDay) {
        let markerY;
        let markerX = parseInt(this._parent.getX(this._activatorDayDate), 10);
        let marker;
        if (this._activatorLong) {
            markerY = parseInt(this._parent.getY(this._entryPrice) - 4, 10);
            marker = "L";
        } else {
            markerY = parseInt(this._parent.getY(this._entryPrice) - 4, 10);
            marker = "S";
        }
        let entryPriceY = parseInt(this._parent.getY(this._entryPrice), 10);
        let stopPriceY = parseInt(this._parent.getY(this._stopLossPrice), 10);
        let red = new Color(255, 0, 0);
        let blue = new Color(0, 0, 255);
        let c = this._parent._chartCanvas._chart;
        let xMax = this._parent._chartCanvas._topLineEndX;

        // plot entry line
        this._parent._chartCanvas.setStrokeColor(blue);
        this._parent._chartCanvas.setLineWidth(2);
        this._parent._chartCanvas.drawLineWithAdjust(this._parent._chartCanvas._topLineStartX, entryPriceY, xMax, entryPriceY);
        this._parent.drawPrice(this._entryPrice, blue);
        // plot stop loss
        this._parent._chartCanvas.setStrokeColor(red);
        this._parent._chartCanvas.drawLineWithAdjust(this._parent._chartCanvas._topLineStartX, stopPriceY, xMax, stopPriceY);
        this._parent.drawPrice(this._stopLossPrice, red);
        
        this._parent._chartCanvas.setFillColor(new Color(0, 0, 0));
        let oldFont = this._parent._chartCanvas.getFont();
        this._parent._chartCanvas.setFont(new Font("Arial", Style.FONT_STYLE_BOLD, 16));
        this._parent._chartCanvas.fillText(marker, markerX, markerY);
        this._parent._chartCanvas.setFont(oldFont);
    }
    this._parent._chartCanvas.setLineWidth(this._parent._chartCanvas._chart._drawingThickness);
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