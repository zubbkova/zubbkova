/**
 * -----------
 * ChartCanvas
 * -----------
 * @constructor 
 * @extends {Canvas}
 * @param {Chart} chart
 * @param {string} id - ID of div
 * @param {Component=} delegate
 **/
function ChartCanvas(chart, id, delegate) {
    Canvas.call(this, id, delegate);   
    this._chart = chart;
    this._overlays = new Array(Chart.MAX_STUDIES + 1);    
    this._started = false;
    this._dirty = true;
    this._g_noChartColor = Color.white;
    this._g_border = new Color(240, 240, 240);
    this._g_background = Color.white;
}
/**
 * Inheriting
 */
ChartCanvas.prototype = Object.create(Canvas.prototype);
ChartCanvas.prototype.constructor = ChartCanvas;
ChartCanvas.prototype.getOverlays = function() {
    return this._overlays;
}
/**
 * @param {Overlay} overlay
 */
ChartCanvas.prototype.bringOverlayToTop = function(overlay) {
    for (let i = 0; i < this._overlays.length; i++) {
        if (this._overlays[i] === overlay) {
            this._overlays.splice(i, 1);
            break;
        }
    }
    this._overlays.push(overlay);
}
ChartCanvas.prototype.removeAllOverlays = function() {
    if (this._started) {
        for (let i = 0; i < this._overlays.length; i++) {
            if (this._overlays[i])
                this._overlays[i].stop();
        }    
    }    
    this._overlays = [];
}
/**
 * @param {Overlay} overlay
 * @param {number} slot
 */
ChartCanvas.prototype.setOverlay = function(overlay, slot) {
    this._overlays[slot] = overlay;
    if (this._started)
       overlay.start();
   this._dirty = true;
}
/**
 * @param {Overlay} overlay
 */
ChartCanvas.prototype.removeOverlay = function(overlay) {
    for (let i = 0; i < this._overlays.length; i++) {
        if (this._overlays[i] === overlay) {
            this._overlays[i] = undefined;
            break;
        }
    }
    if (this._started)
        overlay.stop();
   this._dirty = true;
}
/**
 * @param {number} slot
 */
ChartCanvas.prototype.removeOverlayAt = function(slot) {
    this.removeOverlay(this._overlays[slot]);
}
ChartCanvas.prototype.repaint = function() {
    this._dirty = true;
}
ChartCanvas.prototype.start = function() {
    if (!this._started) {
        this._started = true;
        for (let i = 0; i < this._overlays.length; i++) {
            if (this._overlays[i])
                this._overlays[i].start();
        }
    }
}
ChartCanvas.prototype.stop = function() {
    if (this._started) {
        for (let i = 0; i < this._overlays.length; i++) {
            if (this._overlays[i])
                this._overlays[i].stop();
        }
        this._started = false;
    }
}
/** @override */
ChartCanvas.prototype.draw = function(force) {
    Canvas.prototype.draw.call(this, force);
    this.setFont(new Font(Style._sansSerif, Style.FONT_STYLE_PLAIN, this._fontSize));
    if (!this._chart.isValid()) {
        this.setFillColor(this._g_noChartColor);
        this.fillRect(0, 0, this._width, this._height);
        return;
    }
    this.setFillColor(this._g_border);
    this.fillRect(0, 0, this._width, this._height);
    if (!this._chart._currentSymbol.hasData()) {
        this.setFont(new Font(Style._sansSerif, Style.FONT_STYLE_PLAIN, this._fontSize * 1.5));
        let nd = Language.getString("loading_chart_data");
        if (this._chart._currentSymbol._attempts > 3) {
            nd = Language.getString("no_data_available");
        }
        let fontW = this._gc.measureText(nd).width;
        this.setFillColor(Color.black);
        this.fillText(nd, this._width / 2 - fontW / 2, this._height / 2);
        this.setFont(new Font(Style._sansSerif, Style.FONT_STYLE_PLAIN, this._fontSize));
        return;
    }
    this.setFillColor(this._g_background);
    this.fillRect(this._chart._drawX, this._chart._drawY, this._chart._drawWidth, this._chart._drawHeight);
    this.setStrokeColor(Color.black);
    this.drawRect(this._chart._drawX, this._chart._drawY, this._chart._drawWidth, this._chart._drawHeight);
    this._drawXLabelsAndGrid(Color.lightGray, Color.gray, Color.black);
    if ((this._chart._features & Chart.F_NO_COPYRIGHT) !== Chart.F_NO_COPYRIGHT) {
        this.setFont(new Font(Style._sansSerif, Style.FONT_STYLE_PLAIN, 11));
        let copyright = Language.getString("copyright_advfn");
        let fontW = this._gc.measureText(copyright).width;
        let fontH = 11;
        this.setFillColor(this._g_border);
        this.fillRect(5, this._height - fontH - 4, fontW, fontH + 4);
        this.setFillColor(Color.black);
        this.fillText(copyright, 5, this._height - 4);
    }
    if (this._chart._objectSelected >= 0) {
        this._chart.changeTooltip(Chart.T_DELETELINE);
    }
    for (let i = 1; i <= Chart.MAX_STUDIES; i++) {
        if (this._overlays[i]) {
            this._overlays[i].draw(force);
        }
    }
    this._overlays[0].draw(force);
    if ((this._chart._features & Chart.F_MASK_INFO_LINE) !== Chart.F_NO_INFO_LINE) {
        this._drawDisplayInfo();
    }
    
    this._drawDrawingObjects(force);
    this._drawVerticalLine();
    let view = Main.getParams().get("view");
    if (view && view.toUpperCase() === "TU") {
        this._drawCrosshair(this._chart._mouseOldX, this._chart._mouseOldY);
    }
}
/**
 * @private
 * @param {Color|string} grid_col
 * @param {Color|string} day_col
 * @param {Color|string} tick_col
 */
ChartCanvas.prototype._drawXLabelsAndGrid = function(grid_col, day_col, tick_col) {
    if (this._chart._currentSymbol._currentLabelScale === -1) {
        this._chart._currentSymbol.setNumTimeUnits(this._chart._currentSymbol._numTimeUnits);
    }
    let curPos = 0, curWidth = 0;
    let curString = undefined;
    let curY = this._chart._drawY + this._chart._drawHeight + this._fontSize + 1;
    
    let it = new LabelIterator(this._chart, true);
    let mls = [];
    this.setLineWidth(1.0);
    while (it.valid()) {
        if ((this._chart._features & Chart.F_MASK_X_LABELS) !== Chart.F_NO_X_LABELS) {
            // draw X labels
            curString = this._chart.getMajorLabel(it._d);
            curWidth = this._gc.measureText(curString).width;
            curPos = it._x - (curWidth / 2);
            if ((curPos >= this._chart._drawX) && (curPos + curWidth < this._chart._drawX + this._chart.getDrawGraphWidth())) {
                mls.push([curPos, curPos + curWidth, it.x]);
                this.setFillColor(this._g_border);
                this.fillRect(curPos, curY - this._fontSize, curWidth, this._fontSize);
                this.setFillColor(Color.black);
                this.fillText(curString, curPos, curY);
            }
        }
        if ((this._chart._features & Chart.F_NO_X_GRID) !== Chart.F_NO_X_GRID) {
            // draw X lines
            this.setStrokeColor(day_col);
            let curX = it._x;
            if (curPos > this._chart._drawX) {
                this.drawLine(curX, this._chart._drawY, curX, this._chart._drawY + this._chart._drawHeight - 1);
                if ((this._chart._features & Chart.F_NO_AXES_TICKS) !== Chart.F_NO_AXES_TICKS) {
                    this.setStrokeColor(tick_col);
                    this.drawLine(curX, this._chart._drawY + this._chart._drawHeight - 3, curX, this._chart._drawY + this._chart._drawHeight - 1);
                    this.drawLine(curX, this._chart._drawY, curX, this._chart._drawY + 2);
                }
            }
        }
        it.next();
    }
    
    it = new LabelIterator(this._chart, false);
    let idx = 0;
    while(it.valid()) {
        let cmls = idx === mls.length ? undefined : mls[idx];
        if ((this._chart._features & Chart.F_MASK_X_LABELS) !== Chart.F_NO_X_LABELS) {
            curString = this._chart.getLabel(it._d);
            curWidth = this._gc.measureText(curString).width;
            curPos = it._x - (curWidth / 2);
            if ((curPos >= this._chart._drawX) && (curPos + curWidth < this._chart._drawX + this._chart.getDrawGraphWidth())) {
                if (cmls === undefined || (curPos + curWidth) <= cmls[0] || curPos >= cmls[1]) {
                    this.setFillColor(this._g_border);
                    this.fillRect(curPos, curY - this._fontSize, curWidth, this._fontSize);
                    this.setFillColor(Color.black);
                    this.fillText(curString, curPos, curY);
                }
                if (cmls && (curPos + curWidth) >= cmls[1]) {
                    idx++;
                }
            }
        }
        if ((this._chart._features & Chart.F_NO_X_GRID) !== Chart.F_NO_X_GRID) {
            if (cmls === undefined || it._x !== cmls[2]) {
                this.setStrokeColor(grid_col);
                let curPos = it._x;
                if (curPos > this._chart._drawX) {
                    this.drawLine(curPos, this._chart._drawY, curPos, this._chart._drawY + this._chart._drawHeight - 1);
                    if ((this._chart._features & Chart.F_NO_AXES_TICKS) !== Chart.F_NO_AXES_TICKS) {
                        this.setStrokeColor(tick_col);
                        this.drawLine(curPos, this._chart._drawY + this._chart._drawHeight - 3, curPos, this._chart._drawY + this._chart._drawHeight - 1);
                        this.drawLine(curPos, this._chart._drawY, curPos, this._chart._drawY + 2);
                    }
                }
            }
        }
        it.next();
    }
}
/** @private */
ChartCanvas.prototype._drawDisplayInfo = function() {
    let si = this._chart._currentSymbol.getSymbolInfo(0);
    let infoline = si._displaySymbol;
    if (this._fullInfo) {
        infoline += " (" + si._displayName + ")";
    }
    let fontW = this._gc.measureText(infoline).width;
    this.setLineWidth(1.0);
    this.setFillColor(Color.black);
    this.fillText(infoline, this._width / 2 - fontW / 2, this._fontSize + 3);
    if (!this._fullInfo)
        return;
    infoline = "";
    if (si.getOpenPrice() > 0) {
        infoline += Language.getString("infoline_open") + " " + si.getOpenPrice() + " ";
    }
    if (si.getHighPrice() > 0) {
        infoline += Language.getString("infoline_high") + " " + si.getHighPrice() + " ";
    }
    if (si.getLowPrice() > 0) {
        infoline += Language.getString("infoline_low") + " " + si.getLowPrice() + " ";
    }
    infoline += Language.getString("infoline_cur") + " " + si.getCurPrice();
    if (si.getYesterdaysClose() > 0) {
        infoline += " (";
        if (si.getYesterdaysClose() > si.getCurPrice()) {
            infoline += "-" + this._chart._priceDf.format(si.getYesterdaysClose() - si.getCurPrice()) + "/-" + this._chart._percentDf.format(100 - (100.0 * si.getCurPrice() / si.getYesterdaysClose())) + "%";
        } else if (si.getYesterdaysClose() < si.getCurPrice()) {
            infoline += "+" + this._chart._priceDf.format(si.getCurPrice() - si.getYesterdaysClose()) + "/+" + this._chart._percentDf.format(100.0 * si.getCurPrice() / si.getYesterdaysClose() - 100.0) + "%";
        } else {
            infoline += "-/-";
        }
        infoline += ")";
    }
    fontW = this._gc.measureText(infoline).width;
    this.setFillColor(Color.black);
    this.fillText(infoline, this._width / 2 - fontW / 2, this._fontSize * 2 + 6);
}
/**
 * @private
 * @param {boolean} force
 */
ChartCanvas.prototype._drawDrawingObjects = function(force) {
    if (this._chart._drawingNow) {
        if (this._chart._currentDrawObject) {
            this._chart._currentDrawObject.draw(force);
        }
    }
    for (let i = 0; i < this._chart._currentSymbol._drawObjects.length; i++) {
        let curObj = this._chart._currentSymbol._drawObjects[i];
        if (curObj) 
            curObj.draw(force);
    }
}
/** @private */
ChartCanvas.prototype._drawVerticalLine = function() {
    if (this._chart._currentSymbol._verticalLinePosition < 0) 
        return;
    let myPrice =  this._chart.getSeries(Chart.S_CUR_CLOSE).get(this._chart._mainOverlay.descaleXForMouse(this._chart._currentSymbol._verticalLinePosition));
    let myYI = this._chart._mainOverlay.getY(myPrice);
    if (myYI > this._topLineY && myYI < this._bottomLineY) {
        this.setLineWidth(1.0);
        this.setStrokeColor(Color.darkRed);
        this.drawLine(this._chart._currentSymbol._verticalLinePosition, this._topLineY, this._chart._currentSymbol._verticalLinePosition, this._bottomLineY);
        this.drawLine(this._chart._drawX, myYI, this._chart._drawX + this._chart._drawWidth, myYI);
        this._chart._mainOverlay.drawPrice(myPrice, Color.darkRed, false);
    }
}
/**
 * @private
 * @param {number} x
 * @param {number} y
 */
ChartCanvas.prototype._drawCrosshair = function(x, y) {
    this.setLineWidth(1.0);
    this.setStrokeColor(Color.gray);
    this.drawLine(x, 0, x, this._height);
    this.drawLine(this._chart._drawX, y, this._chart._drawX + this._chart._drawWidth, y);
    let myOverlay = 0;
    for (let i = 0; i <= Chart.MAX_STUDIES; i++) {
        if (this._overlays[i] === undefined) 
            continue;
        let bottomY = this._overlays[i]._y + this._overlays[i]._height;
        if (y < bottomY - 1) {
            myOverlay = i;
            break;
        }
        if (i < Chart.MAX_STUDIES && Math.abs(y - bottomY) <= 3) {
            for (let j = i + 1; j <= Chart.MAX_STUDIES; j++) {
                if (this._overlays[j] === undefined) 
                    continue;
                myOverlay = i;
                break;
            }
            break;
        }
    }
    let myPrice = this._overlays[myOverlay].descaleY(y);
    this._overlays[myOverlay].drawPrice(myPrice, Color.gray, false);
}