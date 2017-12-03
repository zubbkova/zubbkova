/* eslint no-unused-vars: "off" */
/* global Study, Series, Language, Utils, Calendar, Holidays, Main, ErrorCodes, WebQuery_Table, Color, DrawingUtilities */
/**
 * @constructor
 * @extends {Study}
 * @param {Overlay} o
 */
function StudyPivotPoints(o) {
    Study.call(this, o);
    this._performWebQuery();
}
/**
 * Inheriting
 */
StudyPivotPoints.prototype = Object.create(Study.prototype);
StudyPivotPoints.prototype.constructor = StudyPivotPoints;
/** @static */
StudyPivotPoints.getItems = function() {
    return [];
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyPivotPoints.newInstance = function(o) {
    return new StudyPivotPoints(o);
}
/** @static */
StudyPivotPoints.mnemonic = "PivotPoints";
/** @static */
StudyPivotPoints.helpID = 418;
/** @static */
StudyPivotPoints.ownOverlay = false;
/** @private */
StudyPivotPoints.prototype._performWebQuery = function() {
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
StudyPivotPoints.prototype._doWebQuery = function(symbol) {
    this._series = new Series();
    var cal = Calendar.getInstance();
    cal.set(Calendar.HOUR_OF_DAY, 0);
    cal.set(Calendar.MINUTE, 0);
    cal.set(Calendar.SECOND, 0);
    cal.set(Calendar.MILLISECOND, 0);
    var zoneOffset = cal.get(Calendar.ZONE_OFFSET);
    // todo: 
//    var dstOffset = cal.get(Calendar.DST_OFFSET);
//    var offsetMillis = dstOffset - zoneOffset;
    var offsetMillis = zoneOffset;
    cal.add(Calendar.MILLISECOND, offsetMillis);
    if (cal.get(Calendar.DAY_OF_WEEK) === Calendar.MONDAY) {
        cal.add(Calendar.DAY_OF_MONTH, -3);
    } else {
        cal.add(Calendar.DAY_OF_MONTH, -1);
        if (symbol.indexOf('^') !== -1)  {
            var market = symbol.substring(0, symbol.indexOf('^')); 
            var b = Holidays.isMarketWeekendOrHoliday(market, cal);
            var loop_limit = 7;
            var loop = 0;
            while (b) {
                loop += 1;
                cal.add(Calendar.DAY_OF_MONTH, -1);
                if (loop >= loop_limit) {
                    console.error("Could not find valid day after going back "+loop_limit+" days. Giving up.");
                    b = false;
                } else {
                    b = Holidays.isMarketWeekendOrHoliday(market, cal);
                    if (b) {
                        console.log("Date is holiday, going to go back to find a valid day. (count="+loop+")");
                    } else {
                        console.log("Date found. Continuing.");
                    }
                }
            }
        }
    }
    var yestStartMillis = cal.getTime().getTime();
    symbol.replace('\\', '_');
    var params = "mainsymbol=" + symbol + "|startMillis=" + yestStartMillis;
    params = encodeURIComponent(params);
    var self = this;
    $.ajax({
        type: "POST",
        url: Main.getAdvfnURL() + "p.php?java=ohlc",
        crossdomain: true,
        data: "param=" + params,
        dataType: "text",
        success: function(responseData) {
            self._onLoadOHLC(responseData);
        },
        error: function(responseData, textStatus) {
            console.log("StudyPivotPoints. Can't load ohlc: " + textStatus);
        }
    });
}
/**
 * @private
 * @param {Array} response
 */
StudyPivotPoints.prototype._onLoadOHLC = function(response) {
    if (response.length === 0) {
        return;
    }
    response = response.toString().split("\n");
    var error = parseInt(response[0], 10);
    if (error !== 0) {
        console.log("StudyPivotPoints. Error load ohlc:: " + ErrorCodes.strings[error]);
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
    // we should have data
    var high = parseFloat(table._contents[0][table._columnName.indexOf("high")]);
    var low = parseFloat(table._contents[0][table._columnName.indexOf("low")]);
    var close = parseFloat(table._contents[0][table._columnName.indexOf("close")]);
    this._pp = (high + low + close) / 3;
    this._s1 = (2 * this._pp) - high;
    this._s2 = this._pp - (high - low);
    this._r1 = (2 * this._pp) - low;
    this._r2 = this._pp + (high - low);

    this._r1mid = this._pp + (this._r1 - this._pp) / 2;
    this._r2mid = this._r1 + (this._r2 - this._r1) / 2;
    this._s1mid = this._s1 + (this._pp - this._s1) / 2;
    this._s2mid = this._s2 + (this._s1 - this._s2) / 2;
    this._range._min = this._s2;
    this._range._max = this._r2;
}
/** @override */
StudyPivotPoints.prototype.setName = function() {
    this._name = Language.getString("study_pivotpoints");
}
/** @override */
StudyPivotPoints.prototype.getMaxMin = function(i) {
    this._range.min = this._s2;
    this._range.max = this._r2;
}
/** @override */
StudyPivotPoints.prototype.getParams = function() {
    return "";
}
/** @override */
StudyPivotPoints.prototype.update = function(start, end) {}
/** @override */
StudyPivotPoints.prototype.updateDefaultDataSource = function() {
    Study.prototype.updateDefaultDataSource.call(this);
    this._performWebQuery();
}
/** @override */
StudyPivotPoints.prototype.drawPrice = function() {
    this._parent.drawPrice(this._pp, Color.blue);
    this._parent.drawPrice(this._s2, Color.brightGreen);
    this._parent.drawPrice(this._s1, Color.brightGreen);
    this._parent.drawPrice(this._r2, Color.magenta);
    this._parent.drawPrice(this._r1, Color.magenta);
}
/** @override */
StudyPivotPoints.prototype.draw = function() {
    this.updateY();
    var xMax = this._parent._chartCanvas._topLineEndX;
    var ppY = parseInt(this._parent.getY(this._pp), 10);
    var s1Y = parseInt(this._parent.getY(this._s1), 10);
    var s2Y = parseInt(this._parent.getY(this._s2), 10);
    var r1Y = parseInt(this._parent.getY(this._r1), 10);
    var r2Y = parseInt(this._parent.getY(this._r2), 10);

    var r1midY = parseInt(this._parent.getY(this._r1mid), 10);
    var r2midY = parseInt(this._parent.getY(this._r1mid), 10);
    var s1midY = parseInt(this._parent.getY(this._r1mid), 10);
    var s2midY = parseInt(this._parent.getY(this._r1mid), 10);

    this._parent._chartCanvas.setStrokeColor(Color.blue);
    this._parent._chartCanvas.setLineWidth(2);
    this._parent._chartCanvas.drawLineWithAdjust(this._parent._chartCanvas._topLineStartX, ppY, xMax, ppY);

    this._parent._chartCanvas.setStrokeColor(Color.brightGreen);
    this._parent._chartCanvas.drawLineWithAdjust(this._parent._chartCanvas._topLineStartX, s2Y, xMax, s2Y);
    this._parent._chartCanvas.drawLineWithAdjust(this._parent._chartCanvas._topLineStartX, s1Y, xMax, s1Y);
    

    DrawingUtilities.drawDashedLine(this._parent._chartCanvas, this._parent._chartCanvas._topLineStartX, s1midY, xMax, s1midY);
    DrawingUtilities.drawDashedLine(this._parent._chartCanvas, this._parent._chartCanvas._topLineStartX, s2midY, xMax, s2midY);

    this._parent._chartCanvas.setStrokeColor(Color.magenta);
    this._parent._chartCanvas.drawLineWithAdjust(this._parent._chartCanvas._topLineStartX, r2Y, xMax, r2Y);
    this._parent._chartCanvas.drawLineWithAdjust(this._parent._chartCanvas._topLineStartX, r1Y, xMax, r1Y);
    DrawingUtilities.drawDashedLine(this._parent._chartCanvas, this._parent._chartCanvas._topLineStartX, r1midY, xMax, r1midY);
    DrawingUtilities.drawDashedLine(this._parent._chartCanvas, this._parent._chartCanvas._topLineStartX, r2midY, xMax, r2midY);
    
    this._parent._chartCanvas.setLineWidth(this._parent._chart._drawingThickness);
}