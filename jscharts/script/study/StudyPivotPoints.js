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
StudyPivotPoints.prototype._doWebQuery = function(symbol) {
    this._series = new Series();
    let cal = Calendar.getInstance();
    cal.set(Calendar.HOUR_OF_DAY, 0);
    cal.set(Calendar.MINUTE, 0);
    cal.set(Calendar.SECOND, 0);
    cal.set(Calendar.MILLISECOND, 0);
    let zoneOffset = cal.get(Calendar.ZONE_OFFSET);
    // todo: 
//    let dstOffset = cal.get(Calendar.DST_OFFSET);
//    let offsetMillis = dstOffset - zoneOffset;
    let offsetMillis = zoneOffset;
    cal.add(Calendar.MILLISECOND, offsetMillis);
    if (cal.get(Calendar.DAY_OF_WEEK) === Calendar.MONDAY) {
        cal.add(Calendar.DAY_OF_MONTH, -3);
    } else {
        cal.add(Calendar.DAY_OF_MONTH, -1);
        if (symbol.indexOf('^') !== -1)  {
            let market = symbol.substring(0, symbol.indexOf('^')); 
            let b = Holidays.isMarketWeekendOrHoliday(market, cal);
            let loop_limit = 7;
            let loop = 0;
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
    let yestStartMillis = cal.getTime().getTime();;
    let advfnUrl = Main.getAdvfnURL();
    
    symbol.replace('\\', '_');
    let params = "mainsymbol=" + symbol + "|startMillis=" + yestStartMillis;
    params = encodeURIComponent(params);
    let self = this;
    $.ajax({
        type: "POST",
        url: Main.getAdvfnURL() + "p.php?java=ohlc",
        crossdomain: true,
        data: "param=" + params,
        dataType: "text",
        success: function(responseData, textStatus, jqXHR) {
            self._onLoadOHLC(responseData);
        },
        error: function(responseData, textStatus, errorThrown) {
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
    let error = parseInt(response[0], 10);
    if (error !== 0) {
        console.log("StudyPivotPoints. Error load ohlc:: " + ErrorCodes.strings[error]);
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
    // we should have data
    let open = parseFloat(table._contents[0][table._columnName.indexOf("open")]);
    let high = parseFloat(table._contents[0][table._columnName.indexOf("high")]);
    let low = parseFloat(table._contents[0][table._columnName.indexOf("low")]);
    let close = parseFloat(table._contents[0][table._columnName.indexOf("close")]);
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
StudyPivotPoints.prototype.draw = function() {
    this.updateY();
    let c = this._parent._chartCanvas._chart;
    let blue = new Color(0, 0, 255);
    let green = new Color(0, 255, 0);
    let pink = new Color(255, 0, 255);
    let xMax = this._parent._chartCanvas._topLineEndX;
    let ppY = parseInt(this._parent.getY(this._pp), 10);
    let s1Y = parseInt(this._parent.getY(this._s1), 10);
    let s2Y = parseInt(this._parent.getY(this._s2), 10);
    let r1Y = parseInt(this._parent.getY(this._r1), 10);
    let r2Y = parseInt(this._parent.getY(this._r2), 10);

    let r1midY = parseInt(this._parent.getY(this._r1mid), 10);
    let r2midY = parseInt(this._parent.getY(this._r1mid), 10);
    let s1midY = parseInt(this._parent.getY(this._r1mid), 10);
    let s2midY = parseInt(this._parent.getY(this._r1mid), 10);

    this._parent._chartCanvas.setStrokeColor(blue);
    this._parent._chartCanvas.setLineWidth(2);
    this._parent._chartCanvas.drawLineWithAdjust(this._parent._chartCanvas._topLineStartX, ppY, xMax, ppY);
    this._parent.drawPrice(this._pp, blue);

    this._parent._chartCanvas.setStrokeColor(green);
    this._parent._chartCanvas.drawLineWithAdjust(this._parent._chartCanvas._topLineStartX, s2Y, xMax, s2Y);
    this._parent._chartCanvas.drawLineWithAdjust(this._parent._chartCanvas._topLineStartX, s1Y, xMax, s1Y);
    this._parent.drawPrice(this._s2, green);
    this._parent.drawPrice(this._s1, green);

    DrawingUtilities.drawDashedLine(this._parent._chartCanvas, this._parent._chartCanvas._topLineStartX, s1midY, xMax, s1midY);
    DrawingUtilities.drawDashedLine(this._parent._chartCanvas, this._parent._chartCanvas._topLineStartX, s2midY, xMax, s2midY);

    this._parent._chartCanvas.setStrokeColor(pink);
    this._parent._chartCanvas.drawLineWithAdjust(this._parent._chartCanvas._topLineStartX, r2Y, xMax, r2Y);
    this._parent._chartCanvas.drawLineWithAdjust(this._parent._chartCanvas._topLineStartX, r1Y, xMax, r1Y);
    this._parent.drawPrice(this._r2, pink);
    this._parent.drawPrice(this._r1, pink);
    DrawingUtilities.drawDashedLine(this._parent._chartCanvas, this._parent._chartCanvas._topLineStartX, r1midY, xMax, r1midY);
    DrawingUtilities.drawDashedLine(this._parent._chartCanvas, this._parent._chartCanvas._topLineStartX, r2midY, xMax, r2midY);
    
    this._parent._chartCanvas.setLineWidth(this._parent._chartCanvas._chart._drawingThickness);
}