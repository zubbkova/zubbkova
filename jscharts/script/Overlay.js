/**
 * -------
 * Overlay
 * -------
 * @constructor
 * @extends {DrawComponent}
 * @param {ChartCanvas} chartCanvas
 * @param {number} oy - y position
 * @param {number} oh - height
 */
function Overlay(chartCanvas, oy, oh) {
    DrawComponent.call(this, chartCanvas, chartCanvas);
    this._notDraggable = true;
    this._y = oy;
    this._height = oh;
    this._x = this._chartCanvas._chart._drawX;
    this._width = this._chartCanvas._chart._drawWidth;
    if (this._chartCanvas._chart._legendMask !== Chart.F_NO_LEGEND) {
        this._legend = new Legend(this);
        this._legend.setOpen(false);
    }
    this._study = new Array(Overlay.MAX_STUDIES);
    this._range = new MaxMin(this._chartCanvas._chart);
    this._showLegend = true;
    this._autoScale = true;
    this._logScale = false;
    this._yMid = 0.0;
    this._ySpread = 0.0;
    this._oldYSpread = 0.0;
    this._yFixedMid = 0.0;
    this._isMain = false;
    this._logScaleNotReady = false;
    this._fixedMid = false;
    this._yMidAdjust = 0.0;
    this._ySpreadSF = 0.0;
    this._logMid = 0.0;
    this._logSpread = 0.0;
    this._yLabelStart = 0.0;
    this._yLabelInterval = 0.0;
    this._positionLegendId = -1;
}
/**
 * Inheriting
 */
Overlay.prototype = Object.create(DrawComponent.prototype);
Overlay.prototype.constructor = Overlay;
Overlay.prototype.setOverlayClip = function(){
    this._chartCanvas._gc.rect(this._chartCanvas._chart._drawX, this._y, this._chartCanvas._chart._drawWidth, this._height);
    this._chartCanvas._gc.clip();
}
Overlay.prototype.resetClip = function(){
    this._chartCanvas._gc.rect(0, 0, this._chartCanvas._width, this._chartCanvas._height);
    this._chartCanvas._gc.clip();
}
/** @override */
Overlay.prototype.draw = function() {
    if (this._range._max <= 0 && this._range._min <= 0 && this._isMain) {
        let nd = Language.getString("overlay_no_data_available");
        let str_w = this._chartCanvas._gc.measureText(nd).width;
        this._chartCanvas.setFillColor(Color.black);
        this._chartCanvas.fillText(nd, this._chartCanvas._chart._drawX + (this._chartCanvas._chart._drawWidth - str_w) / 2, this._y + this._height / 2);
        return;
    }
    this._drawYLabels(Color.black);
    this._drawYGrid(Color.lightGray, Color.black);
    for (let i = 0; i < Overlay.MAX_STUDIES; i++) {
        if (this._study[i] === undefined) 
            continue;
        if (i !== Overlay.MAIN_STUDY_ID && this._study[i]) {
            this._study[i].updateDefaultDataSource();
        }
        this._study[i].draw();
    }
    if (this._study[Overlay.MAIN_STUDY_ID]) {
        this._study[Overlay.MAIN_STUDY_ID].draw();
    }
    if (this._isMain) {
        this._chartCanvas._chart._signals.draw(this);
        this._drawEvents();
        if ((this._chartCanvas._chart._features & Chart.F_NO_TOOLTIPS) !== Chart.F_NO_TOOLTIPS) {
            if (this._chartCanvas._chart._curTooltip !== Chart.T_NONE) {
                let t = this._chartCanvas._chart._tooltips[this._chartCanvas._chart._curTooltip];
                let fontW = this._chartCanvas._gc.measureText(t).width;
                this._chartCanvas.setFillColor(Color.black);
                this._chartCanvas.fillText(t, this._chartCanvas._chart._width / 2 - fontW / 2, this._y + this._height - 10);
            }
        }
        if (this._chartCanvas._chart._parent._loadState > PriceDataLoader.NOT_LOADING) {
            this._chartCanvas.setFillColor(Color.red);
            if (this._chartCanvas._chart._parent._loadState === PriceDataLoader.CONNECTING) {
                this._chartCanvas.fillText(Language.getString("overlay_connecting"), this._chartCanvas._chart._drawX + 5, this._height - 5);
            } else {
                this._chartCanvas.setStrokeColor(Color.red);
                this._chartCanvas.drawRect(this._chartCanvas._chart._drawX + 5, this._height - 15, 100, 10);
                this._chartCanvas.fillRect(this._chartCanvas._chart._drawX + 5, this._height - 15, this._chartCanvas._chart._parent._loadState, 10);
            }
        }
    } else {
        this._chartCanvas.setStrokeColor(Color.black);
        this._chartCanvas.setLineWidth(1);
        this._chartCanvas.drawLine(this._chartCanvas._chart._drawX, this._y, this._chartCanvas._chart._drawX + this._chartCanvas._chart._drawWidth, this._y);
    }
    if (this._legend)
        this._legend.draw();
}
/** @override */
Overlay.prototype.refresh = function() {
    this.draw();
}
Overlay.prototype.calcAutoScale = function() {
    this._range.reset();
    if (this._chartCanvas._chart._currentSymbol === undefined)
        return; 
    this._chartCanvas._chart._currentSymbol.calculateScaleFactors();
    for (let i = 0; i < this._study.length; i++) {
        let item = this._study[i];
        if (item) {
            let it = XTIterator.reverseScreenIterator(this._chartCanvas._chart);
            item.updateDefaultDataSource();
            item.getMaxMin(it);
            this._range.adjust(item._range);
        }
    }
    if (this._fixedMid) {
        this._yMid = this._yFixedMid;
        this._ySpread = Math.max(this._range._max - this._yMid, this._yMid - this._range._min) * 2.0;
    } else {
        this._ySpread = (this._range._max - this._range._min);
        this._yMid = (this._range._min + this._ySpread / 2.0);
    }
    if (this._ySpread === 0) {
        this._ySpread = 1.0;
    } else if (this._ySpread < 0.0005) {
        this._ySpread = 0.0005;
    } else {
        this._ySpread *= 1.1;
    }
    this._oldYSpread = this._ySpread;
    if (this._logScaleNotReady) {
        if (this._range._min !== this._range._max) {
            this._logScaleNotReady = false;
            this._logScale = true;
        }
    }
    if (this._logScale) {
        if (this._range._min === this._range._max) {
            this._logScaleNotReady = true;
            this._logScale = false;
        } else {
            if (this._range._min < 0.00001) {
                this._logScale = false;
            } else {
                this._logSpread = Math.log(this._range._max / this._range._min);
                this._logMid = 0.5 * Math.log(this._range._min * this._range._max);
            }
            if (this._logSpread === 0.0) {
                this._logSpread = 0.5;
            } else {
                this._logSpread *= 1.1;
            }
        }
    }
}
/**
 * @param {Date} d
 * @param {number} sy
 */
Overlay.prototype.snapDescaleY = function(d, sy) {
    let val = this.descaleY(sy);
    let newVal = val;
    let minDistance = Number.MAX_SAFE_INTEGER;
    for (let i = Overlay.MAIN_STUDY_ID; i < this._study.length; i++) {
        let cur = this._study[i];
        if (cur === undefined) 
            continue;
        let curVal = cur._close.get(d);
        let newDistance = Math.abs(val - curVal);
        if (newDistance < minDistance) {
            minDistance = newDistance;
            newVal = curVal;
        }
        if (cur._style !== StudyStock.ST_NORMAL && cur._style !== StudyStock.ST_NONE) {
            curVal = cur._high.get(d);
            newDistance = Math.abs(val - curVal);
            if (newDistance < minDistance) {
                minDistance = newDistance;
                newVal = curVal;
            }
            curVal = cur._low.get(d);
            newDistance = Math.abs(val - curVal);
            if (newDistance < minDistance) {
                minDistance = newDistance;
                newVal = curVal;
            }
        }
    }
    return newVal;
}
/**
 * @param {number} sy
 */
Overlay.prototype.descaleY = function(sy) {
    let val = 0.0;
    let r = 0.5 - (sy - this._y) / this._height;
    if (!this._logScale) {
        val = this._yMid + this._ySpread * r;
    } else {
        val = Math.exp(this._logMid + this._logSpread * r);
    }
    return val;
}
/**
 * @param {number} sx
 */
Overlay.prototype.descaleXFrac = function(sx) {
    let unitsBack = ((this._chartCanvas._chart._drawX + this._chartCanvas._chart.getDrawGraphWidth()) - sx) / this._chartCanvas._chart._currentSymbol._unitWidth;
    let d = this._chartCanvas._chart.timeAdjust(this._chartCanvas._chart._currentSymbol._timeEnd, Math.trunc(-(unitsBack + 1)));
    return new Overlay_TimePos(d, 1 - (unitsBack - Math.floor(unitsBack)));
}
/**
 * @param {number} sx
 */
Overlay.prototype.descaleXForMouse = function(sx) {
    let unitsBack = ((this._chartCanvas._chart._drawX + this._chartCanvas._chart.getDrawGraphWidth()) - sx) / this._chartCanvas._chart._currentSymbol._unitWidth;
    if (this._study[Overlay.MAIN_STUDY_ID] && this._study[Overlay.MAIN_STUDY_ID]._style > 0) {
        unitsBack -= 0.5;
    }
    return this._chartCanvas._chart.timeAdjust(this._chartCanvas._chart._currentSymbol._timeEnd, Math.trunc(-(unitsBack + 1)));
}
/**
 * @param {number} val
 * @param {Color} col
 * @param {boolean=} d
 */
Overlay.prototype.drawPrice = function(val, col, d) {
    let dontDraw = this._chartCanvas._chart._features & (Chart.F_NO_PRICE | Chart.F_NO_Y_AXIS) !== 0;
    if (d) {
        dontDraw = d;
    }
    if (dontDraw) 
        return;
    let curY = this.getY(val);
    if (isNaN(curY))
        return;
    this._chartCanvas.setLineWidth(1.0);
    this._chartCanvas.setFillColor(col);
    curY = curY - ((this._chartCanvas._fontSize * 1.3) / 2);
    let curX = this._chartCanvas._chart._drawX + this._chartCanvas._chart._drawWidth + 1;
    this._chartCanvas.fillRect(curX, curY, this._chartCanvas._chart._width - (this._chartCanvas._chart._drawX + this._chartCanvas._chart._drawWidth + 2), this._chartCanvas._fontSize * 1.3);
    this._chartCanvas.setFillColor(Color.white);
    this._chartCanvas.fillText(this.getYLabel(val), curX + 2, curY + this._chartCanvas._fontSize*1.05);
    if ("tu" === Main.getParams().get("view").toString()) {
        let y = Math.trunc(this.getY(this._chartCanvas._chart._currentSymbol.getSymbolInfo(0)._curPrice));
        this._chartCanvas.setStrokeColor(Color.gray);
        this._chartCanvas.drawLine(this._chartCanvas._chart._drawX, this._y, this._chartCanvas._chart._drawX + this._chartCanvas._chart._drawWidth, this._y);
    }
}
/**
 * @param {DataSeries} top
 * @param {DataSeries} bottom
 * @param {Color|string} col
 */
Overlay.prototype.drawShading = function(top, bottom, col) {
    this._chartCanvas.setLineWidth(this._chartCanvas._chart._drawingThickness);
    this._chartCanvas.setFillColor(col);
    let myStyle = 0;
    let drawOffset = -1;
    let myStock = this._chartCanvas._overlays[0]._study[Overlay.MAIN_STUDY_ID];
    if (myStock) {
        myStyle = myStock._style;
    }
    if (myStyle === StudyStock.ST_BAR || myStyle === StudyStock.ST_CANDLE) {
        drawOffset = -(Math.trunc(this._chartCanvas._chart._currentSymbol._unitWidth)) / 2;
    }
    let cx = Math.max(1, Math.trunc(this._chartCanvas._chart._currentSymbol._unitWidth));
    let i = XTIterator.reverseScreenIterator(this._chartCanvas._chart);
    this._chartCanvas._bottomLineY = this._y + this._height - 1;
    do {
        let a = this.getY(top.get(i._d));
        let b = this.getY(bottom.get(i._d));
        let topY = Math.max(a, b);
        let bottomY = Math.min(a, b);
        if (!isNaN(topY) && i.withinSeries(top)) {
            if (topY !== -1 && !(i._d > this._chartCanvas._chart._currentSymbol._time)) {
                this._chartCanvas.fillRect(i._x + drawOffset, Math.trunc(bottomY), cx, Math.trunc(topY - bottomY));
            }
        }
    } while(i.move() && i._x > this._chartCanvas._chart._drawX + 1);
}
/**
 * @param {DataSeries} s
 * @param {Color|string} col
 * @param {number} midPoint
 */
Overlay.prototype.drawLineHistMid = function(s, col, midPoint) {
    this._chartCanvas.setLineWidth(this._chartCanvas._chart._drawingThickness);
    this._chartCanvas.setFillColor(col);
    let startY = this.getY(midPoint);
    let i = XTIterator.reverseScreenIterator(this._chartCanvas._chart);
    this._chartCanvas._bottomLineY = this._y + this._height - 1;
    do {
        let endY = this.getY(s.get(i._d));
        if (!isNaN(endY) && i.withinSeries(s)) {
            if (endY < startY) {
                this._chartCanvas.fillRect(i._x - Math.trunc(this._chartCanvas._chart._currentSymbol._unitWidth), Math.trunc(endY), Math.max(Math.trunc(this._chartCanvas._chart._currentSymbol._unitWidth - 1), 1), Math.trunc(startY - endY));
            } else {
                this._chartCanvas.fillRect(i._x - Math.trunc(this._chartCanvas._chart._currentSymbol._unitWidth), Math.trunc(startY), Math.max(Math.trunc(this._chartCanvas._chart._currentSymbol._unitWidth - 1), 1), Math.trunc(endY - startY));
            }
        }
    } while(i.move() && i._x > this._chartCanvas._chart._drawX + 1);
}
/**
 * @param {DataSeries} os
 * @param {DataSeries} hs
 * @param {DataSeries} ls
 * @param {DataSeries} cs
 * @param {Color|string} high_col
 * @param {Color|string} low_col
 * @param {Color|string} up_col
 * @param {Color|string} down_col
 */
Overlay.prototype.drawHeikenAshi = function(os, hs, ls, cs, high_col, low_col, up_col, down_col) {
    let haClose = new Series();
    haClose.clear();
    let haOpen = new Series();
    haOpen.clear();
    let haHigh = new Series();
    haHigh.clear();
    let haLow = new Series();
    haLow.clear();
    let start = cs.timeStart();
    let end = this._chartCanvas._chart._parent._currentSymbol._time;
    let oldhaOpen = os.get(start);
    let oldhaClose = cs.get(start);
    let myi = TimeIterator.forwardRangeIterator(this._chartCanvas._chart.getMasterTimeList(), start, end);
    this._chartCanvas._bottomLineY = this._y + this._height - 1;
    do {
        if (isNaN(oldhaOpen) || isNaN(oldhaClose)) {
            myi.move();
            continue;
        }
        let newOpen = os.get(myi._d);
        let newHigh = hs.get(myi._d);
        let newLow = ls.get(myi._d);
        let newClose = cs.get(myi._d);
        let newhaOpen = (oldhaOpen + oldhaClose) / 2;
        let newhaClose = (newOpen + newHigh + newLow + newClose) / 4;
        haClose.append(myi._d, newhaClose);
        haOpen.append(myi._d, newhaOpen);
        haHigh.append(myi._d, Math.max(Math.max(newHigh, newhaOpen), newhaClose));
        haLow.append(myi._d, Math.min(Math.min(newLow, newhaOpen), newhaClose));
        oldhaOpen = newhaOpen;
        oldhaClose = newhaClose;
    } while (myi.move());
    let cx = Math.trunc(this._chartCanvas._chart._currentSymbol._unitWidth / 2);
    let i = XTIterator.reverseScreenIterator(this._chartCanvas._chart);
    this._chartCanvas.setLineWidth(this._chartCanvas._chart._drawingThickness);
    do {
        let oy = Math.trunc(this.getY(haOpen.get(i._d)));
        let hy = Math.trunc(this.getY(haHigh.get(i._d)));
        let ly = Math.trunc(this.getY(haLow.get(i._d)));
        let cyd = this.getY(haClose.get(i._d));
        if (!isNaN(cyd) && i.withinSeries(haClose)) {
            let cy = Math.trunc(cyd);
            
            this._chartCanvas.setStrokeColor(high_col);
            this._chartCanvas.drawLineWithAdjust(i._x, hy, i._x, oy);
            this._chartCanvas.setStrokeColor(low_col);
            this._chartCanvas.drawLineWithAdjust(i._x, ly, i._x, oy);
            if (oy < cy) {
                this._chartCanvas.setFillColor(down_col);
                this._chartCanvas.fillRectWithAdjust(i._x - cx + 1, oy, Math.trunc(Math.max(this._chartCanvas._chart._currentSymbol._unitWidth - 1, 1)), cy - oy);
            } else if (oy > cy) {
                this._chartCanvas.setFillColor(up_col);
                this._chartCanvas.fillRectWithAdjust(i._x - cx + 1, cy, Math.trunc(Math.max(this._chartCanvas._chart._currentSymbol._unitWidth - 1, 1)), oy - cy);
            } else {
                this._chartCanvas.setStrokeColor(up_col);
                this._chartCanvas.drawLineWithAdjust(i._x - cx + 1, cy, i._x + cx - 1, cy);
            }
        }
    } while (i._x > this._chartCanvas._chart._drawX + 1 && i.move());
}
/**
 * @param {DataSeries} high
 * @param {DataSeries} low
 * @param {DataSeries} cur
 * @param {Color|string} col
 */
Overlay.prototype.drawCBands = function(high, low, cur, col) {
    let i = XTIterator.reverseScreenIterator(this._chartCanvas._chart);
    let startX = i._x;
    let lastStartY = this.getY(low.get(i._d));
    let lastEndY = this.getY(high.get(i._d));
    let lastCloseY = this.getY(cur.get(i._d));
    this._chartCanvas.setLineWidth(this._chartCanvas._chart._drawingThickness);
    let points;
    this._chartCanvas._bottomLineY = this._y + this._height - 1;
    do {
        let startY = this.getY(low.get(i._d));
        let endY = this.getY(high.get(i._d));
        let closeY = this.getY(cur.get(i._d));
        if (!isNaN(startY) && i.withinSeries(cur)) {
            if (!isNaN(endY)) {
                
                this._chartCanvas.begin(Canvas.POLYGON);
                this._chartCanvas.vertex(startX, Math.trunc(lastEndY));
                this._chartCanvas.vertex(i._x, Math.trunc(endY));
                this._chartCanvas.vertex(i._x, Math.trunc(startY));
                this._chartCanvas.vertex(startX, Math.trunc(lastStartY));
                this._chartCanvas.setFillColor(col);
                this._chartCanvas.setStrokeColor(col);
                this._chartCanvas.end();
                
                this._chartCanvas.setStrokeColor(Color.white);
                this._chartCanvas.drawLineWithAdjust(startX, Math.trunc(lastCloseY), i._x, Math.trunc(closeY));
                this._chartCanvas.setStrokeColor(col);
                this._chartCanvas.drawLineWithAdjust(startX, Math.trunc(lastEndY), i._x, Math.trunc(endY));
                this._chartCanvas.drawLineWithAdjust(startX, Math.trunc(lastStartY), i._x, Math.trunc(startY));
            }
        }
        startX = i._x;
        lastStartY = startY;
        lastEndY = endY;
        lastCloseY = closeY;
    } while(startX > this._chartCanvas._chart._drawX + 1 && i.move());
}
/**
 * @param {DataSeries} os
 * @param {DataSeries} hs
 * @param {DataSeries} ls
 * @param {DataSeries} cs
 */
Overlay.prototype.drawBarGreenRed = function(os, hs, ls, cs) {
    let cx = Math.max(Math.trunc(this._chartCanvas._chart._currentSymbol._unitWidth / 2), 1);
    let i = XTIterator.reverseScreenIterator(this._chartCanvas._chart);
    let upColor = Color.green;
    let downColor = Color.red;
    this._chartCanvas.setLineWidth(this._chartCanvas._chart._drawingThickness);
    this._chartCanvas._bottomLineY = this._y + this._height - 1;
    do {
        let oy = this.getY(os.get(i._d));
        let hy = this.getY(hs.get(i._d));
        let ly = this.getY(ls.get(i._d));
        let cy = this.getY(cs.get(i._d));
        this._chartCanvas.setStrokeColor(os.get(i._d) > cs.get(i._d) ? downColor : upColor);
        if (!isNaN(cy) && !isNaN(oy) && !isNaN(hy) && !isNaN(ly) && i.withinSeries(cs)) {
            this._chartCanvas.drawLineWithAdjust(i._x, Math.trunc(ly), i._x, Math.trunc(hy));
            this._chartCanvas.drawLineWithAdjust(i._x - cx + (cx > 2 ? 1 : 0), Math.trunc(oy), i._x, Math.trunc(oy));
            this._chartCanvas.drawLineWithAdjust(i._x, Math.trunc(cy), i._x + cx, Math.trunc(cy));
        }
    } while (i._x > this._chartCanvas._chart._drawX + 1 && i.move());
}
/**
 * @param {DataSeries} os
 * @param {DataSeries} hs
 * @param {DataSeries} ls
 * @param {DataSeries} cs
 */
Overlay.prototype.draw4HourBarGreenRed = function(os, hs, ls, cs) {
    let cx = Math.max(Math.trunc(this._chartCanvas._chart._currentSymbol._unitWidth / 2), 1);
    let i = XTIterator.reverseScreenIterator(this._chartCanvas._chart);
    let upColor = Color.green;
    let downColor = Color.red;
    let divisor  = 4;
    cx *= divisor;
    let xDate = new Date();
    let lastXDate = new Date();
    let moreData = true;
    let first = true;
    let open = 0, high = 0, low = 0, close = 0;
    this._chartCanvas.setLineWidth(this._chartCanvas._chart._drawingThickness);
    this._chartCanvas._bottomLineY = this._y + this._height - 1;
    do {
        first = true;
        let divMarker = false;
        do {
            lastXDate = new Date(xDate.getTime());
            let dataDate = i._d;
            let cal = Calendar.getInstance();
            cal.setTime(dataDate);
            let hourOfDay = cal.get(Calendar.HOUR_OF_DAY);
            divMarker = (hourOfDay % divisor === 0);
            if (divMarker) {
                xDate = new Date(dataDate.getTime());
            }
            if (first) {
                open = os.get(dataDate);
                high = hs.get(dataDate);
                low = ls.get(dataDate);
                close = cs.get(dataDate);
                first = false;
            } else {
                high = Math.max(high, hs.get(dataDate));
                low = Math.min(low, ls.get(dataDate));
                open = os.get(dataDate);
            }
            moreData = i.move();
            if (!moreData) break;
        } while(!divMarker);
        let oy = this.getY(open);
        let hy = this.getY(high);
        let ly = this.getY(low);
        let cy = this.getY(close);
        this._chartCanvas.setStrokeColor(os.get(xDate) > cs.get(xDate) ? downColor : upColor);
        let differentTime = (lastXDate.getTime() !== xDate.getTime());
        if (!isNaN(cy) && !isNaN(oy) && !isNaN(hy) && !isNaN(ly) && i.withinSeries(cs) && differentTime) {
            let xPos = this.getX(xDate);
            this._chartCanvas.drawLine(xPos, Math.trunc(ly), xPos, Math.trunc(hy));
            this._chartCanvas.drawLine(xPos - cx + (cx > 2 ? 1 : 0), Math.trunc(oy), xPos, Math.trunc(oy));
            this._chartCanvas.drawLine(xPos, Math.trunc(cy), xPos + cx, Math.trunc(cy));
        }
    } while(moreData && i._x > this._chartCanvas._chart._drawX + 1);
}
/**
 * @param {DataSeries} os
 * @param {DataSeries} hs
 * @param {DataSeries} ls
 * @param {DataSeries} cs
 * @param {Color|string} col
 */
Overlay.prototype.drawBar = function(os, hs, ls, cs, col) {
    let cx = Math.max(Math.trunc(this._chartCanvas._chart._currentSymbol._unitWidth / 2), 1);
    this._chartCanvas.setLineWidth(this._chartCanvas._chart._drawingThickness);
    this._chartCanvas.setStrokeColor(col);
    let i = XTIterator.reverseScreenIterator(this._chartCanvas._chart);
    this._chartCanvas._bottomLineY = this._y + this._height - 1;
    do {
        let oy = this.getY(os.get(i._d));
        let hy = this.getY(hs.get(i._d));
        let ly = this.getY(ls.get(i._d));
        let cy = this.getY(cs.get(i._d));
        if (!isNaN(cy) && !isNaN(oy) && !isNaN(hy) && !isNaN(ly) && i.withinSeries(cs)) {
            this._chartCanvas.drawLineWithAdjust(i._x, Math.trunc(ly), i._x, Math.trunc(hy));
            this._chartCanvas.drawLineWithAdjust(i._x - cx + (cx > 2 ? 1 : 0), Math.trunc(oy), i._x, Math.trunc(oy));
            this._chartCanvas.drawLineWithAdjust(i._x, Math.trunc(cy), i._x + cx, Math.trunc(cy));
        }
    } while(i._x > this._chartCanvas._chart._drawX + 1 && i.move());
}
/**
 * @param {DataSeries} data
 * @param {Color|string} col
 * @param {StudySymbol} shape
 */
Overlay.prototype.drawSymbols = function(data, col, shape) {
    this._chartCanvas.setFillColor(col);
    this._chartCanvas.setStrokeColor(col);
    this._chartCanvas.setLineWidth(1.0);
    let i = XTIterator.reverseScreenIterator(this._chartCanvas._chart);
    do {
        let value = data.getNoInterpolate(i._d);
        if (!isNaN(value)) {
            shape.draw(this._chartCanvas, i._x, Math.trunc(this.getY(value)));
        }
    } while(i.move() && i._x > this._chartCanvas._chart._drawX + 1);
}
/**
 * @param {DataSeries} os
 * @param {DataSeries} hs
 * @param {DataSeries} ls
 * @param {DataSeries} cs
 * @param {Color|string} line_col
 * @param {Color|string} up_col
 * @param {Color|string} down_col
 */
Overlay.prototype.drawCandle = function(os, hs, ls, cs, line_col, up_col, down_col) {
    let cx = parseInt(this._chartCanvas._chart._currentSymbol._unitWidth / 2, 10);
    let i = XTIterator.reverseScreenIterator(this._chartCanvas._chart);
    this._chartCanvas.setLineWidth(this._chartCanvas._chart._drawingThickness);
    this._chartCanvas._bottomLineY = this._y + this._height - 1;
    do {
        let oy = this.getY(os.get(i._d));
        let hy = this.getY(hs.get(i._d));
        let ly = this.getY(ls.get(i._d));
        let cy = this.getY(cs.get(i._d));
        if (!isNaN(cy) && !isNaN(oy) && !isNaN(hy) && !isNaN(ly) && i.withinSeries(cs)) {
            let cyi = Math.trunc(cy);
            this._chartCanvas.setStrokeColor(line_col);
            this._chartCanvas.drawLineWithAdjust(i._x, Math.trunc(hy), i._x, Math.trunc(ly));
            if (oy < cy) {
                this._chartCanvas.drawRectWithAdjust(i._x - cx + 1, Math.trunc(oy), Math.trunc(this._chartCanvas._chart._currentSymbol._unitWidth) - 2, cyi - Math.trunc(oy));
                this._chartCanvas.setFillColor(down_col);
                this._chartCanvas.fillRectWithAdjust(i._x - cx + 2, Math.trunc(oy) + 1, Math.trunc(this._chartCanvas._chart._currentSymbol._unitWidth) - 3, cyi - Math.trunc(oy) - 1);
            } else if (oy > cy) {
                this._chartCanvas.drawRectWithAdjust(i._x - cx + 1, cyi, Math.trunc(this._chartCanvas._chart._currentSymbol._unitWidth) - 2, Math.trunc(oy - cyi));
                this._chartCanvas.setFillColor(up_col);
                this._chartCanvas.fillRectWithAdjust(i._x - cx + 2, cyi + 1, Math.trunc(this._chartCanvas._chart._currentSymbol._unitWidth) - 3, Math.trunc(oy - cyi - 1));
            } else {
                this._chartCanvas.drawLineWithAdjust(i._x - cx + 1, cyi, i._x + cx - 1, cyi);
            }
        }
    } while(i._x > this._chartCanvas._chart._drawX + 1 && i.move());
}
/**
 * @param {DataSeries} s
 * @param {Color|string} col
 */
Overlay.prototype.drawLineSquare = function(s, col) {
    let i = XTIterator.reverseScreenIterator(this._chartCanvas._chart);
    let lasty = this.getY(s.get(i._d));
    let cx = Math.round(this._chartCanvas._chart._currentSymbol._unitWidth / 2);
    this._chartCanvas.setLineWidth(this._chartCanvas._chart._drawingThickness);
    this._chartCanvas.setStrokeColor(col);
    this._chartCanvas._bottomLineY = this._y + this._height - 1;
    let prevx = -1;
    do {
        let cury = this.getY(s.get(i._d));
        if (!isNaN(cury) && i.withinSeries(s)) {
            if (prevx === -1)
                prevx = i._x + cx * 2;
            this._chartCanvas.drawLineWithAdjust(i._x + cx, Math.round(lasty), prevx, Math.round(lasty));
            this._chartCanvas.drawLineWithAdjust(i._x + cx, Math.round(lasty), i._x + cx, Math.round(cury));
            this._chartCanvas.drawLineWithAdjust(i._x, Math.round(cury), i._x + cx, Math.round(cury));
        }
        prevx = i._x;
        lasty = cury;
    } while (i._x > this._chartCanvas._chart._drawX + 1 && i.move());
}
/**
 * @param {DataSeries} s1
 * @param {DataSeries} s2
 * @param {Color|string} c1
 * @param {Color|string} c2
 */
Overlay.prototype.drawShadedChannel = function(s1, s2, c1, c2) {
    let i = XTIterator.reverseScreenIterator(this._chartCanvas._chart);
    this._chartCanvas.setLineWidth(this._chartCanvas._chart._drawingThickness);
    this._chartCanvas._bottomLineY = this._y + this._height - 1;
    do {
        let y1 = this.getY(s1.get(i._d));
        let y2 = this.getY(s2.get(i._d));
        if (y1 < y2) {
            this._chartCanvas.setStrokeColor(c1);
        } else {
            this._chartCanvas.setStrokeColor(c2);
        }
        if (!isNaN(y1) && i.withinSeries(s1)) {
            this._chartCanvas.drawLineWithAdjust(i._x, Math.trunc(y1), i._x, Math.trunc(y2));
        }
    } while (i._x > this._chartCanvas._chart._drawX + 1 && i.move());
    this.drawLineNormal(s1, c1);
    this.drawLineNormal(s2, c2);
}
/**
 * @param {DataSeries} s
 * @param {Color|string} col
 */
Overlay.prototype.drawLineNormalNoIterator = function(s, col) {
    let startx = this.getXOffScale(s.timeByIndex(0));
    let endx;
    let starty = this.getY(s.getByIndex(0));
    let endy;
    this._chartCanvas.setLineWidth(this._chartCanvas._chart._drawingThickness);
    this._chartCanvas.setStrokeColor(col);
    for (let n = 0; n < s.size(); n++) {
        endx = this.getXOffScale(s.timeByIndex(n));
        endy = this.getY(s.getByIndex(n));
        // check whether we've moved since the last entry
        if (starty != endy) {
            // check whether the line is actually onscreen
//            if (startx > this._chartCanvas._topLineStartX && startx < this._chartCanvas._topLineEndX && endx > this._chartCanvas._topLineStartX && endx < this._chartCanvas._topLineEndX) {
                this._chartCanvas.drawLineWithAdjust(startx, Math.trunc(starty), endx, Math.trunc(endy));
//            }
            startx = endx;
            starty = endy;
        }
    }
}
/**
 * @param {DataSeries} s
 * @param {Color|string} col
 */
Overlay.prototype.drawLineNormal = function(s, col) {
    let i = XTIterator.reverseScreenIterator(this._chartCanvas._chart);
    let startx = i._x;
    let starty = this.getY(s.get(i._d));
    let endy = 0;
    let lastInSeries = true;
    this._chartCanvas.setLineWidth(this._chartCanvas._chart._drawingThickness);
    this._chartCanvas.setStrokeColor(col);
    let tempY;
    this._chartCanvas.setStrokeColor(col);
    this._chartCanvas._bottomLineY = this._y + this._height - 1;
    do {
        let curval = s.get(i._d);
        // todo: fix for now
        if (curval === 0) continue;
        //
        endy = this.getY(curval);
        if (!isNaN(starty) && i.withinSeries(s) && lastInSeries) {
            if (isNaN(endy)) {
                tempY = starty;
            } else {
                tempY = endy;
            }
            this._chartCanvas.drawLineWithAdjust(startx, Math.trunc(starty), i._x, Math.trunc(tempY));
        }
        startx = i._x;
        starty = endy;
        lastInSeries = i.withinSeries(s);
    } while (i.move() && startx > this._chartCanvas._chart._drawX + 1);
}
/**
 * @param {DataSeries} s
 * @param {Color|string} col
 */
Overlay.prototype.drawShadedArea = function(s, col) {
    let i = XTIterator.reverseScreenIterator(this._chartCanvas._chart);
    let startx = i._x;
    let starty = this.getY(s.get(i._d));
    let endy = 0;
    let lastInSeries = true;
    this._chartCanvas.setLineWidth(1.0);
    this._chartCanvas.setFillColor(col);
    this._chartCanvas._bottomLineY = this._y + this._height - 1;
    do {
        endy = this.getY(s.get(i._d));
        if (!isNaN(starty) && i.withinSeries(s) && lastInSeries) {
            if (!isNaN(endy)) {
                this._chartCanvas.begin(Canvas.POLYGON);
                this._chartCanvas.vertex(startx, Math.trunc(starty));
                this._chartCanvas.vertex(startx, this._chartCanvas._bottomLineY - 1);
                this._chartCanvas.vertex(i._x, this._chartCanvas._bottomLineY - 1);
                this._chartCanvas.vertex(i._x, Math.trunc(endy));
                this._chartCanvas.end();
            }
        }
        startx = i._x;
        starty = endy;
        lastInSeries = i.withinSeries(s);
    } while(i.move() && startx > this._chartCanvas._topLineStartX);
}
Overlay.prototype.symbolsChanged = function() {
    for (let i = 0; i < Overlay.MAX_STUDIES; i++) {
        if (this._study[i]) {
            this._study[i].updateDefaultDataSource();
        }
    }
}
/**
 * @param {ChartSymbolSet} css
 */
Overlay.prototype.storeValues = function(css) {
    css._autoScale = this._autoScale;
    css._logScale = this._logScale;
    css._fixedMid = this._fixedMid;
    css._yMid = this._yMid;
    css._ySpread = this._ySpread;
    css._oldYSpread = this._oldYSpread;
    css._yFixedMid = this._yFixedMid;
    css._yMidAdjust = this._yMidAdjust;
    css._ySpreadSF = this._ySpreadSF;
    css._logMid = this._logMid;
    css._logSpread = this._logSpread;
    css._yLabelStart = this._yLabelStart;
    css._yLabelInterval = this._yLabelInterval;
    css._labelFormatter = this._labelFormatter;
    return css;
}
/**
 * @param {number} numLines
 */
Overlay.prototype.calcMaxSigFigs = function(numLines) {
    let maxSigFigs = (this._chartCanvas._chart._features & Chart.F_NO_LEFT_BORDER) !== Chart.F_NO_LEFT_BORDER ? 7 : 6;
    let curPrice = this._yLabelStart + this._yLabelInterval;
    let iter = 0;
    let pricesToCheck = [];
    while (curPrice < (this._yMid + this._ySpread) && iter < 20) {
        pricesToCheck.push(curPrice);
        curPrice += this._yLabelInterval;
        iter++;
    }
    if (this._isMain && this._chartCanvas._chart.getData() && this._chartCanvas._chart.getData().size() > 0) {
        pricesToCheck.push(this._chartCanvas._chart.getSeries(Chart.S_CUR_CLOSE).getByIndex(-1));
    }
    if (this._isMain && this._legend) {
        let yesterdaysCloseItem = this._legend.getItem(this._chartCanvas._chart._yestCloseLegendId);
        if (yesterdaysCloseItem && yesterdaysCloseItem._shown) {
            pricesToCheck.push(this._chartCanvas._chart._currentSymbol.getSymbolInfo(0).getYesterdaysClose());
        }
    }
    if (this._chartCanvas._chart._currentSymbol)
        this._chartCanvas._chart._currentSymbol.initialiseFormatter(pricesToCheck, maxSigFigs);
}
Overlay.prototype.stop = function() {}
Overlay.prototype.start = function() {}
/**
 * @param {number} val
 */
Overlay.prototype.getYLabel = function(val) {
    return this._chartCanvas._chart._currentSymbol.getYLabel(val);
}
/**
 * @param {number} price
 */
Overlay.prototype.getY = function(price) {
    if (isNaN(price))
        return NaN;
    let f = this._logScale ? (Math.log(price) - this._logMid) / this._logSpread : (price - this._yMid) / this._ySpread;
    return (this._y + (0.5 - f) * this._height) - 1;
}
/**
 * @param {Overlay_TimePos} t
 */
Overlay.prototype.getXFrac = function(t) {
    let count = this._chartCanvas._chart.getMasterTimeList().countBack(t._d, this._chartCanvas._chart._currentSymbol._timeEnd);
    let x = (this._chartCanvas._chart._drawX + this._chartCanvas._chart.getDrawGraphWidth()) - Math.trunc(count * this._chartCanvas._chart._currentSymbol._unitWidth);
    x += Math.trunc(this._chartCanvas._chart._currentSymbol._unitWidth * t._frac);
    return x;
}
/**
 * @param {Date} d
 */
Overlay.prototype.getXOffScale = function(d) {
    let count = this._chartCanvas._chart.getMasterTimeList().count(d, this._chartCanvas._chart._currentSymbol._timeEnd);
    let result = 0;
    if (d > this._chartCanvas._chart._currentSymbol._timeEnd) {
        result = (this._chartCanvas._chart._drawX + this._chartCanvas._chart.getDrawGraphWidth()) + Math.trunc(count * this._chartCanvas._chart._currentSymbol._unitWidth);
    } else {
        result = (this._chartCanvas._chart._drawX + this._chartCanvas._chart.getDrawGraphWidth()) - Math.trunc(count * this._chartCanvas._chart._currentSymbol._unitWidth);
    }
    return (result > 0 ? result : 0);
}
/**
 * @param {Date} d
 */
Overlay.prototype.getX = function(d) {
    if ((d < this._chartCanvas._chart._currentSymbol._timeStart) || (d > this._chartCanvas._chart._currentSymbol._timeEnd)) {
        return 0;
    }
    let count = this._chartCanvas._chart.getMasterTimeList().count(d, this._chartCanvas._chart._currentSymbol._timeEnd);
    return (this._chartCanvas._chart._drawX + this._chartCanvas._chart.getDrawGraphWidth()) - Math.trunc(count * this._chartCanvas._chart._currentSymbol._unitWidth);
}
/**
 * @param {number} slot
 * @param {string} mnemonic
 */
Overlay.prototype.setStudy = function(slot, mnemonic) {
    this._study[slot] = (mnemonic === "" ? undefined : StudyFactory.getStudy(this, mnemonic));
}
Overlay.prototype.setValues = function() {
    let css = this._chartCanvas._chart._currentSymbol;
    this._autoScale = css._autoScale;
    this._logScale = css._logScale;
    this._fixedMid = css._fixedMid;
    this._yMid = css._yMid;
    this._ySpread = css._ySpread;
    this._oldYSpread = css._oldYSpread;
    this._yFixedMid = css._yFixedMid;
    this._yMidAdjust = css._yMidAdjust;
    this._ySpreadSF = css._ySpreadSF;
    this._logMid = css._logMid;
    this._logSpread = css._logSpread;
    this._yLabelStart = css._yLabelStart;
    this._yLabelInterval = css._yLabelInterval;
    this._labelFormatter = css._labelFormatter;
}
Overlay.prototype.setMain = function() {
    this._isMain = true;
    if (this._legend) {
        this._legend.setLarge(true);
        this._positionLegendId = this._legend.addItem("", Color.white);
    }
}
/**
 * @private
 * @param {number} x
 * @param {number} y
 */
Overlay.prototype._getBarData = function(x, y) {
    let d = this.descaleXForMouse(x);
    let h = this._chartCanvas._chart.getSeries(Chart.S_CUR_HIGH).get(d);
    let l = this._chartCanvas._chart.getSeries(Chart.S_CUR_LOW).get(d);
    let o = this._chartCanvas._chart.getSeries(Chart.S_CUR_OPEN).get(d);
    let c = this._chartCanvas._chart.getSeries(Chart.S_CUR_CLOSE).get(d);
    if (!isNaN(h) && !isNaN(l) && !isNaN(o) && !isNaN(c)) {
        if (y < this.getY(h) || y > this.getY(l)) {
            this._legend.setLarge(false);
            return this._chartCanvas._chart.getLabel(d) + ", " + this.getYLabel(this.descaleY(y));
        }
        let s = '';
        let df = new DecimalFormat();
        df.setMinimumIntegerDigits(2);
        df.setMaximumFractionDigits(2);
        df.setGroupingUsed(false);
        this._chartCanvas._chart._localCalendar.setTime(d);
        if (this._chartCanvas._chart._frequency < Chart.FREQUENCY_D) {
            s = df.format(this._chartCanvas._chart._localCalendar.get(Calendar.HOUR_OF_DAY)) + df.format(this._chartCanvas._chart._localCalendar.get(Calendar.MINUTE)) + " " + this._chartCanvas._chart._months[this._chartCanvas._chart._localCalendar.get(Calendar.MONTH)] + " " + this._chartCanvas._chart._localCalendar.get(Calendar.DAY_OF_MONTH);
        } else {
            s = this._chartCanvas._chart._months[this._chartCanvas._chart._localCalendar.get(Calendar.MONTH)] + " " + this._chartCanvas._chart._localCalendar.get(Calendar.DAY_OF_MONTH) + " " + this._chartCanvas._chart._localCalendar.get(Calendar.YEAR).toString();
        }
        this._legend.setLarge(true);
        return s + "  " + Language.getString("Legend_O") + this.getYLabel(o) + ",  " + Language.getString("Legend_H") + this.getYLabel(h) + "  " + Language.getString("Legend_L") + this.getYLabel(l) + "  " + Language.getString("Legend_C") + this.getYLabel(c);
    }
    return "";
}
/** @private */
Overlay.prototype._drawEvents = function() {
    let i = EventIterator.getEventIterator(this._chartCanvas._chart);
    if (i) {
        do {
            let v = this._chartCanvas._chart.getData().getEvents(i._d);
            if (v) {
                this._chartCanvas.setLineWidth(1.0);
                for (let j = 0; j < v.length; j++) {
                    this._chartCanvas.setStrokeColor(v[j]._colour);
                    this._chartCanvas.drawLine(i._x, this._y, i._x, this._y + this._height - 1);
                    this._chartCanvas.setFillColor(v[j]._colour);
                    this._chartCanvas.fillText(v[j]._label, i._x + 5, this._y + 15 * (j + 1));
                }
            }
        } while(i._x > this._chartCanvas._chart._drawX && i.move());
    }
}
/**
 * @private
 * @param {Color|string} grid_col
 * @param {Color|string} tick_col
 */
Overlay.prototype._drawYGrid = function(grid_col, tick_col) {
    let curPrice = this._yLabelStart + this._yLabelInterval / 2;
    let idx = 1;
    while (curPrice < (this._yMid + this._ySpread)) {
        let curY = Math.trunc(this.getY(curPrice));
        if ((curY > this._y) && curY < (this._y + this._height - 1)) {
            if ((idx % 2) === 0) {
                this._chartCanvas.setLineWidth(1.0);
                this._chartCanvas.setStrokeColor(grid_col);
                this._chartCanvas.drawLine(this._chartCanvas._chart._drawX, curY, this._chartCanvas._chart._drawX + this._chartCanvas._chart._drawWidth - 1, curY);
                if ((this._chartCanvas._chart._features & Chart.F_NO_AXES_TICKS) !== Chart.F_NO_AXES_TICKS) {

                        this._chartCanvas.setStrokeColor(tick_col);
                        this._chartCanvas.drawLine(this._chartCanvas._chart._drawX + this._chartCanvas._chart._drawWidth - 3, curY, this._chartCanvas._chart._drawX + this._chartCanvas._chart._drawWidth, curY);
                        this._chartCanvas.drawLine(this._chartCanvas._chart._drawX, curY, this._chartCanvas._chart._drawX + 2, curY);

                }
            } else {
                if ((this._chartCanvas._chart._features & Chart.F_NO_AXES_TICKS) !== Chart.F_NO_AXES_TICKS) {

                        this._chartCanvas.setStrokeColor(tick_col);
                        this._chartCanvas.drawLine(this._chartCanvas._chart._drawX + this._chartCanvas._chart._drawWidth - 1, curY, this._chartCanvas._chart._drawX + this._chartCanvas._chart._drawWidth, curY);
                        this._chartCanvas.drawLine(this._chartCanvas._chart._drawX, curY, this._chartCanvas._chart._drawX + 1, curY);
                }
            }
        }
        curPrice += this._yLabelInterval / 2;
        idx++;
    }
}
/**
 * @private
 * @param {Color|string} col
 */
Overlay.prototype._drawYLabels = function(col) {
    if (this._ySpread <= 0) {
        this.calcAutoScale();
    }
    let check = [0.000001, 0.00001, 0.0001, 0.001, 0.01, 0.1, 0.2, 0.5, 1.0, 2.0, 5.0];
    let numLines = 0;
    let i = 0;
    let power = Math.trunc((Math.log(this._ySpread / 10.0) / Math.log(10)) + 0.5);
    let c = Math.pow(10, power);
    for (i = check.length - 1; i >= 0; i--) {
        numLines = this._ySpread / (c * check[i]);
        if (numLines > 3) 
            break;
    }
    if (i === -1)
        i = 0;
    this._yLabelInterval = c * check[i];
    this._yLabelStart = (Math.trunc((this._yMid - this._ySpread) / this._yLabelInterval)) * this._yLabelInterval;
    this.calcMaxSigFigs(numLines);
    if ((this._chartCanvas._chart._features & Chart.F_NO_Y_AXIS) !== 0) return;
    this._chartCanvas.setFillColor(col);
    this._chartCanvas.setLineWidth(1.0);
    let curPrice = this._yLabelStart + this._yLabelInterval;
    let iter = 0;
    while (curPrice < (this._yMid + this._ySpread) && iter < 20) {
        let curY = this.getY(curPrice) + this._chartCanvas._fontSize / 3;
        if ((curY > this._y - 1) && curY < (this._y + this._height + 3)) {
            this._chartCanvas.fillText(this.getYLabel(curPrice), this._chartCanvas._chart._drawX + this._chartCanvas._chart._drawWidth + 3, Math.trunc(curY));
        }
        curPrice += this._yLabelInterval;
        iter++;
    }
}
/** @override */
Overlay.prototype.onMouseDown = function(x, y) {
    if (this._positionLegendId !== -1 && (x > this._legend._x && x < this._legend._x + this._legend._width && y > this._legend._y && y < this._legend._y + this._legend._height)) {
        this._capture = this._legend;
        return this._capture.onMouseDown(x, y);
    }
    this._capture = undefined;
    return false;
}
/** @override */
Overlay.prototype.onMouseUp = function(x, y) {
    if (this._capture) {
        let res = this._capture.onMouseUp(x, y);
        this._capture = undefined;
        return res;
    }
    this._oldYSpread = this._ySpread;
    this._drag = false;
    return false;
}
/** @override */
Overlay.prototype.onMouseMove = function(x, y) {
    if (!this._chartCanvas._chart.isValid())
        return false;
    if (this._positionLegendId !== -1) {
        let leg = this._getBarData(x, y);
        if (this._chartCanvas._chart._currentSymbol._displayCurrency) {
            leg += " (" + this._chartCanvas._chart._currentSymbol._displayCurrency + ")";
        }
        this._legend.renameItem(this._positionLegendId, leg, true);
        this._chartCanvas._chart.repaint();
        this._chartCanvas._chart.process();
    }
    return false;
}
/** @override */
Overlay.prototype.onMouseDrag = function(x, y) {
    let dy = y - this._chartCanvas._chart._dragY;
    if (this._chartCanvas._chart._mode === Chart.MODE_NORMAL) {
        if (this._chartCanvas._chart._dragX < this._chartCanvas._chart._drawX + this._chartCanvas._chart._drawWidth) {
            if (Math.abs(dy) > 10.0) {
                dy = (y - this._chartCanvas._chart._mouseOldY) * this._ySpread / this._height * Overlay.Y_ADJ_MULT;
                this._yMid += dy;
            }
        }
    }
    return true;
}
/**
 * @param {number} x
 * @param {number} y
 */
Overlay.prototype.onYAxisDrag = function(x, y) {
    let dy = y - this._chartCanvas._chart._dragY;
    if (!this._logScale && this._isMain) {
        let curYSpread = this._ySpread;
        let curdy = dy;
        dy = dy / this._height * Overlay.Y_SF_MULT + 1.0;
        this._ySpread = this._oldYSpread * dy;
        if (this._isMain) {
            this._chartCanvas._chart.setAutoScale(false);
        } else {
            this._autoScale = false;
        }
    }
}
/** @static */
Overlay.MAX_STUDIES = Chart.MAX_STUDIES + 3 + Chart.MAX_OVERLAYS;
/** @static */
Overlay.YC_STUDY_ID = Chart.MAX_STUDIES;
/** @static */
Overlay.MAIN_STUDY_ID = Chart.MAX_STUDIES + 1;
/** @static */
Overlay.LEVEL2SCOPE_STUDY_ID = Chart.MAX_STUDIES + 2;
/** @static */
Overlay.OVERLAY_STUDY_ID = Chart.MAX_STUDIES + 3;
/** @static */
Overlay.Y_SF_MULT = 1.0;
/** @static */
Overlay.Y_ADJ_MULT = 1.5;
/**
 * @constructor
 * @param {Date} d
 * @param {number} f
 */
function Overlay_TimePos(d, f) {
    this._d = new Date(d.getTime());
    this._frac = f;
}