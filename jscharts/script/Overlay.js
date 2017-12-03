/* global DrawComponent, Chart, Legend, MaxMin, Language, Color, Main, PriceDataLoader, XTIterator, StudyStock, Series, TimeIterator, Canvas, Calendar, StudyFactory, DecimalFormat, EventIterator  */
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
    this._x = this._chart._drawX;
    this._width = this._chart._drawWidth;
    if (this._chart._legendMask !== Chart.F_NO_LEGEND) {
        this._legend = new Legend(this);
        this._legend.setOpen(false);
    }
    this._study = new Array(Overlay.MAX_STUDIES);
    this._range = new MaxMin(this._chart);
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
    this._chartCanvas._gc.rect(this._chart._drawX, this._y, this._chart._drawWidth, this._height);
    this._chartCanvas._gc.clip();
}
Overlay.prototype.resetClip = function(){
    this._chartCanvas._gc.rect(0, 0, this._chartCanvas._width, this._chartCanvas._height);
    this._chartCanvas._gc.clip();
}
/** @override */
Overlay.prototype.draw = function() {
    if (this._range._max <= 0 && this._range._min <= 0 && this._isMain) {
        var nd = Language.getString("overlay_no_data_available");
        var str_w = this._chartCanvas._gc.measureText(nd).width;
        this._chartCanvas.setFillColor(Color.black);
        this._chartCanvas.fillText(nd, this._chart._drawX + (this._chart._drawWidth - str_w) / 2, this._y + this._height / 2);
        return;
    }
    this._preYLabels();
    this._drawYGrid(Color.lightGray, Color.black);
    this._chartCanvas.setFillColor(Color.black);
    for (var i = 0; i < Overlay.MAX_STUDIES; i++) {
        if (typeof this._study[i] === "undefined") {
            continue;
        }
        if (i !== Overlay.MAIN_STUDY_ID) {
            this._study[i].updateDefaultDataSource();
            this._study[i].draw();
        }
    }
    if (this._study[Overlay.MAIN_STUDY_ID]) {
        this._study[Overlay.MAIN_STUDY_ID].draw();
    }
    if (this._isMain) {
        this._chart._signals.draw(this);
        this._drawEvents();
        if ((this._chart._features & Chart.F_NO_TOOLTIPS) !== Chart.F_NO_TOOLTIPS) {
            if (this.getChartTooltip() !== Chart.T_NONE) {
                var t;
                if (typeof this.getChartTooltip() == 'string')
                    t = this.getChartTooltip();
                else {
                    if (this.getChartTooltip() === Chart.T_DRAWING && this._chart._tooltips.length == 3) {
                        this._chart._tooltips.push(Language.getString(Main.isTouchClient() ? "tooltip_tap_to_add" : "tooltip_click_to_add"));   
                    }
                    t = this._chart._tooltips[this.getChartTooltip()];
                }
                    
                var fontW = this._chartCanvas._gc.measureText(t).width;
                this._chartCanvas.setFillColor(Color.black);
                this._chartCanvas.fillText(t, this._chart._width / 2 - fontW / 2, this._y + this._height - 10);
            }
        }
        if (this._chart._parent._loadState > PriceDataLoader.NOT_LOADING) {
            this._chartCanvas.setFillColor(Color.red);
            if (this._chart._parent._loadState === PriceDataLoader.CONNECTING) {
                this._chartCanvas.fillText(Language.getString("overlay_connecting"), this._chart._drawX + 5, this._height - 5);
            } else {
                this._chartCanvas.setStrokeColor(Color.red);
                this._chartCanvas.drawRect(this._chart._drawX + 5, this._height - 15, 100, 10);
                this._chartCanvas.fillRect(this._chart._drawX + 5, this._height - 15, this._chart._parent._loadState, 10);
            }
        }
    } else {
        this._chartCanvas.setStrokeColor(Color.black);
        this._chartCanvas.setLineWidth(1);
        this._chartCanvas.drawLine(this._chart._drawX, this._y, this._chart._drawX + this._chart._drawWidth, this._y);
    }
    if (this._legend)
        this._legend.draw();
}
Overlay.prototype.fillBorder = function() {
    if (this._isMain) {
        this._chartCanvas.setFillColor(this._chartCanvas._g_border);
        this._chartCanvas.fillRect(0, 0, this._chartCanvas._width, this._chart._drawY - 0.5);
        this._chartCanvas.fillRect(0, 0, this._chart._drawX - 0.5, this._chartCanvas._height);
        this._chartCanvas.fillRect(0, this._chart._drawY + this._chart._drawHeight + 0.5, this._chartCanvas._width, this._height - this._chart._drawY + this._chart._drawHeight - 0.5);
        this._chartCanvas.fillRect(this._chart._drawX + this._chart._drawWidth + 0.5, 0, this._width - this._chart._drawX + this._chart._drawWidth - 0.5, this._chartCanvas._height);
        this._chartCanvas.drawXLabels();
        this._chartCanvas.setStrokeColor(Color.black);
        this._chartCanvas.setLineWidth(1.0);
        this._chartCanvas.drawRect(this._chart._drawX, this._chart._drawY, this._chart._drawWidth, this._chart._drawHeight);
    }
    this._drawYLabels(Color.black);
    for (var i = 0; i < Overlay.MAX_STUDIES; i++) {
        if (typeof this._study[i] === "undefined") {
            continue;
        }
        this._study[i].drawPrice();
    }
}
/** @override */
Overlay.prototype.refresh = function() {
    this.draw();
}
Overlay.prototype.calcAutoScale = function() {
    this._range.reset();
    if (this._chart._currentSymbol === undefined)
        return; 
    this._chart._currentSymbol.calculateScaleFactors();
    for (var i = 0; i < this._study.length; i++) {
        var item = this._study[i];
        if (item) {
            var it = XTIterator.reverseScreenIterator(this._chart);
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
    var val = this.descaleY(sy);
    var newVal = val;
    var minDistance = Number.MAX_SAFE_INTEGER;
    for (var i = Overlay.MAIN_STUDY_ID; i < this._study.length; i++) {
        var cur = this._study[i];
        if (cur === undefined) 
            continue;
        var curVal = cur._close.get(d);
        var newDistance = Math.abs(val - curVal);
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
    var val = 0.0;
    var r = 0.5 - (sy - this._y) / this._height;
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
    var unitsBack = ((this._chart._drawX + this._chart.getDrawGraphWidth()) - sx) / this._chart._currentSymbol._unitWidth;
    var d = this._chart.timeAdjust(this._chart._currentSymbol._timeEnd, parseInt(-(unitsBack + 1), 10));
    return new Overlay_TimePos(d, 1 - (unitsBack - Math.floor(unitsBack)));
}
/**
 * @param {number} sx
 */
Overlay.prototype.descaleXForMouse = function(sx) {
    var unitsBack = ((this._chart._drawX + this._chart.getDrawGraphWidth()) - sx) / this._chart._currentSymbol._unitWidth;
    if (this._study[Overlay.MAIN_STUDY_ID] && this._study[Overlay.MAIN_STUDY_ID]._style > 0) {
        unitsBack -= 0.5;
    }
    return this._chart.timeAdjust(this._chart._currentSymbol._timeEnd, parseInt(-(unitsBack + 1), 10));
}
/**
 * @param {number} val
 * @param {Color} col
 * @param {boolean=} d
 */
Overlay.prototype.drawPrice = function(val, col, d) {
    var dontDraw = this._chart._features & (Chart.F_NO_PRICE | Chart.F_NO_Y_AXIS) !== 0;
    if (d) {
        dontDraw = d;
    }
    if (dontDraw) 
        return;
    var curY = this.getY(val);
    if (isNaN(curY))
        return;
    this._chartCanvas.setLineWidth(1.0);
    this._chartCanvas.setFillColor(col);
    curY = curY - ((this._chartCanvas._fontSize * 1.3) / 2);
    var curX = this._chart._drawX + this._chart._drawWidth + 1;
    this._chartCanvas.fillRect(curX, curY, this._chart._width - (this._chart._drawX + this._chart._drawWidth + 2), this._chartCanvas._fontSize * 1.3);
    this._chartCanvas.setFillColor(Color.white);
    this._chartCanvas.fillText(this.getYLabel(val), curX + 2, curY + this._chartCanvas._fontSize*1.05);
    if ("tu" === Main.getView()) {
        var y = parseInt(this.getY(this._chart._currentSymbol.getSymbolInfo(0)._curPrice), 10);
        this._chartCanvas.setStrokeColor(Color.gray);
        this._chartCanvas.drawLine(this._chart._drawX, y, this._chart._drawX + this._chart._drawWidth, y);
    }
}
/**
 * @param {DataSeries} top
 * @param {DataSeries} bottom
 * @param {Color|string} col
 */
Overlay.prototype.drawShading = function(top, bottom, col) {
    this._chartCanvas.setLineWidth(this._chart._drawingThickness);
    this._chartCanvas.setFillColor(col);
    var myStyle = 0;
    var drawOffset = -1;
    var myStock = this._chartCanvas._overlays[0]._study[Overlay.MAIN_STUDY_ID];
    if (myStock) {
        myStyle = myStock._style;
    }
    if (myStyle === StudyStock.ST_BAR || myStyle === StudyStock.ST_CANDLE) {
        drawOffset = -(parseInt(this._chart._currentSymbol._unitWidth, 10)) / 2;
    }
    var cx = Math.max(1, parseInt(this._chart._currentSymbol._unitWidth, 10));
    var i = XTIterator.reverseScreenIterator(this._chart);
    this._chartCanvas._bottomLineY = this._y + this._height - 1;
    do {
        var a = this.getY(top.get(i._d));
        var b = this.getY(bottom.get(i._d));
        var topY = Math.max(a, b);
        var bottomY = Math.min(a, b);
        if (!isNaN(topY) && i.withinSeries(top)) {
            if (topY !== -1 && !(i._d > this._chart._currentSymbol._time)) {
                this._chartCanvas.fillRect(i._x + drawOffset, parseInt(bottomY, 10), cx, parseInt(topY - bottomY, 10));
            }
        }
    } while(i.move() && i._x > this._chart._drawX + 1);
}
/**
 * @param {DataSeries} s
 * @param {Color|string} col
 * @param {number} midPoint
 */
Overlay.prototype.drawLineHistMid = function(s, col, midPoint) {
    this._chartCanvas.setLineWidth(this._chart._drawingThickness);
    this._chartCanvas.setFillColor(col);
    var startY = this.getY(midPoint);
    var i = XTIterator.reverseScreenIterator(this._chart);
    this._chartCanvas._bottomLineY = this._y + this._height - 1;
    do {
        var endY = this.getY(s.get(i._d));
        if (!isNaN(endY) && i.withinSeries(s)) {
            if (endY < startY) {
                this._chartCanvas.fillRect(i._x - parseInt(this._chart._currentSymbol._unitWidth, 10), parseInt(endY, 10), Math.max(parseInt(this._chart._currentSymbol._unitWidth - 1, 10), 1), parseInt(startY - endY, 10));
            } else {
                this._chartCanvas.fillRect(i._x - parseInt(this._chart._currentSymbol._unitWidth, 10), parseInt(startY, 10), Math.max(parseInt(this._chart._currentSymbol._unitWidth - 1, 10), 1), parseInt(endY - startY, 10));
            }
        }
    } while(i.move() && i._x > this._chart._drawX + 1);
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
    var haClose = new Series();
    haClose.clear();
    var haOpen = new Series();
    haOpen.clear();
    var haHigh = new Series();
    haHigh.clear();
    var haLow = new Series();
    haLow.clear();
    var start = cs.timeStart();
    var end = this._chart._parent._currentSymbol._time;
    var oldhaOpen = os.get(start);
    var oldhaClose = cs.get(start);
    var myi = TimeIterator.forwardRangeIterator(this._chart.getMasterTimeList(), start, end);
    this._chartCanvas._bottomLineY = this._y + this._height - 1;
    do {
        if (isNaN(oldhaOpen) || isNaN(oldhaClose)) {
            myi.move();
            continue;
        }
        var newOpen = os.get(myi._d);
        var newHigh = hs.get(myi._d);
        var newLow = ls.get(myi._d);
        var newClose = cs.get(myi._d);
        var newhaOpen = (oldhaOpen + oldhaClose) / 2;
        var newhaClose = (newOpen + newHigh + newLow + newClose) / 4;
        haClose.append(myi._d, newhaClose);
        haOpen.append(myi._d, newhaOpen);
        haHigh.append(myi._d, Math.max(Math.max(newHigh, newhaOpen), newhaClose));
        haLow.append(myi._d, Math.min(Math.min(newLow, newhaOpen), newhaClose));
        oldhaOpen = newhaOpen;
        oldhaClose = newhaClose;
    } while (myi.move());
    var cx = parseInt(this._chart._currentSymbol._unitWidth / 2, 10);
    var i = XTIterator.reverseScreenIterator(this._chart);
    this._chartCanvas.setLineWidth(this._chart._drawingThickness);
    do {
        var oy = parseInt(this.getY(haOpen.get(i._d)), 10);
        var hy = parseInt(this.getY(haHigh.get(i._d)), 10);
        var ly = parseInt(this.getY(haLow.get(i._d)), 10);
        var cyd = this.getY(haClose.get(i._d));
        if (!isNaN(cyd) && i.withinSeries(haClose)) {
            var cy = parseInt(cyd, 10);
            
            this._chartCanvas.setStrokeColor(high_col);
            this._chartCanvas.drawLineWithAdjust(i._x, hy, i._x, oy);
            this._chartCanvas.setStrokeColor(low_col);
            this._chartCanvas.drawLineWithAdjust(i._x, ly, i._x, oy);
            if (oy < cy) {
                this._chartCanvas.setFillColor(down_col);
                this._chartCanvas.fillRectWithAdjust(i._x - cx + 1, oy, parseInt(Math.max(this._chart._currentSymbol._unitWidth - 1, 1), 10), cy - oy);
            } else if (oy > cy) {
                this._chartCanvas.setFillColor(up_col);
                this._chartCanvas.fillRectWithAdjust(i._x - cx + 1, cy, parseInt(Math.max(this._chart._currentSymbol._unitWidth - 1, 1), 10), oy - cy);
            } else {
                this._chartCanvas.setStrokeColor(up_col);
                this._chartCanvas.drawLineWithAdjust(i._x - cx + 1, cy, i._x + cx - 1, cy);
            }
        }
    } while (i._x > this._chart._drawX + 1 && i.move());
}
/**
 * @param {DataSeries} high
 * @param {DataSeries} low
 * @param {DataSeries} cur
 * @param {Color|string} col
 */
Overlay.prototype.drawCBands = function(high, low, cur, col) {
    var i = XTIterator.reverseScreenIterator(this._chart);
    var startX = i._x;
    var lastStartY = this.getY(low.get(i._d));
    var lastEndY = this.getY(high.get(i._d));
    var lastCloseY = this.getY(cur.get(i._d));
    this._chartCanvas.setLineWidth(this._chart._drawingThickness);
    this._chartCanvas._bottomLineY = this._y + this._height - 1;
    do {
        var startY = this.getY(low.get(i._d));
        var endY = this.getY(high.get(i._d));
        var closeY = this.getY(cur.get(i._d));
        if (!isNaN(startY) && i.withinSeries(cur)) {
            if (!isNaN(endY)) {
                
                this._chartCanvas.begin(Canvas.POLYGON);
                this._chartCanvas.vertex(startX, parseInt(lastEndY, 10));
                this._chartCanvas.vertex(i._x, parseInt(endY, 10));
                this._chartCanvas.vertex(i._x, parseInt(startY, 10));
                this._chartCanvas.vertex(startX, parseInt(lastStartY, 10));
                this._chartCanvas.setFillColor(col);
                this._chartCanvas.setStrokeColor(col);
                this._chartCanvas.end();
                
                this._chartCanvas.setStrokeColor(Color.white);
                this._chartCanvas.drawLineWithAdjust(startX, parseInt(lastCloseY, 10), i._x, parseInt(closeY, 10));
                this._chartCanvas.setStrokeColor(col);
                this._chartCanvas.drawLineWithAdjust(startX, parseInt(lastEndY, 10), i._x, parseInt(endY, 10));
                this._chartCanvas.drawLineWithAdjust(startX, parseInt(lastStartY, 10), i._x, parseInt(startY, 10));
            }
        }
        startX = i._x;
        lastStartY = startY;
        lastEndY = endY;
        lastCloseY = closeY;
    } while(startX > this._chart._drawX + 1 && i.move());
}
/**
 * @param {DataSeries} os
 * @param {DataSeries} hs
 * @param {DataSeries} ls
 * @param {DataSeries} cs
 */
Overlay.prototype.drawBarGreenRed = function(os, hs, ls, cs) {
    var cx = Math.max(parseInt(this._chart._currentSymbol._unitWidth / 2, 10), 1);
    var i = XTIterator.reverseScreenIterator(this._chart);
    var upColor = Color.green;
    var downColor = Color.red;
    this._chartCanvas.setLineWidth(this._chart._drawingThickness);
    this._chartCanvas._bottomLineY = this._y + this._height - 1;
    do {
        var oy = this.getY(os.get(i._d));
        var hy = this.getY(hs.get(i._d));
        var ly = this.getY(ls.get(i._d));
        var cy = this.getY(cs.get(i._d));
        this._chartCanvas.setStrokeColor(os.get(i._d) > cs.get(i._d) ? downColor : upColor);
        if (!isNaN(cy) && !isNaN(oy) && !isNaN(hy) && !isNaN(ly) && i.withinSeries(cs)) {
            this._chartCanvas.drawLineWithAdjust(i._x, parseInt(ly, 10), i._x, parseInt(hy, 10));
            this._chartCanvas.drawLineWithAdjust(i._x - cx + (cx > 2 ? 1 : 0), parseInt(oy, 10), i._x, parseInt(oy, 10));
            this._chartCanvas.drawLineWithAdjust(i._x, parseInt(cy, 10), i._x + cx, parseInt(cy, 10));
        }
    } while (i._x > this._chart._drawX + 1 && i.move());
}
/**
 * @param {DataSeries} os
 * @param {DataSeries} hs
 * @param {DataSeries} ls
 * @param {DataSeries} cs
 */
Overlay.prototype.draw4HourBarGreenRed = function(os, hs, ls, cs) {
    var cx = Math.max(parseInt(this._chart._currentSymbol._unitWidth / 2, 10), 1);
    var i = XTIterator.reverseScreenIterator(this._chart);
    var upColor = Color.green;
    var downColor = Color.red;
    var divisor  = 4;
    cx *= divisor;
    var xDate = new Date();
    var lastXDate = new Date();
    var moreData = true;
    var first = true;
    var open = 0, high = 0, low = 0, close = 0;
    this._chartCanvas.setLineWidth(this._chart._drawingThickness);
    this._chartCanvas._bottomLineY = this._y + this._height - 1;
    do {
        first = true;
        var divMarker = false;
        do {
            lastXDate = new Date(xDate.getTime());
            var dataDate = i._d;
            var cal = Calendar.getInstance();
            cal.setTime(dataDate);
            var hourOfDay = cal.get(Calendar.HOUR_OF_DAY);
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
        var oy = this.getY(open);
        var hy = this.getY(high);
        var ly = this.getY(low);
        var cy = this.getY(close);
        this._chartCanvas.setStrokeColor(os.get(xDate) > cs.get(xDate) ? downColor : upColor);
        var differentTime = (lastXDate.getTime() !== xDate.getTime());
        if (!isNaN(cy) && !isNaN(oy) && !isNaN(hy) && !isNaN(ly) && i.withinSeries(cs) && differentTime) {
            var xPos = this.getX(xDate);
            this._chartCanvas.drawLine(xPos, parseInt(ly, 10), xPos, parseInt(hy, 10));
            this._chartCanvas.drawLine(xPos - cx + (cx > 2 ? 1 : 0), parseInt(oy, 10), xPos, parseInt(oy, 10));
            this._chartCanvas.drawLine(xPos, parseInt(cy, 10), xPos + cx, parseInt(cy, 10));
        }
    } while(moreData && i._x > this._chart._drawX + 1);
}
/**
 * @param {DataSeries} os
 * @param {DataSeries} hs
 * @param {DataSeries} ls
 * @param {DataSeries} cs
 * @param {Color|string} col
 */
Overlay.prototype.drawBar = function(os, hs, ls, cs, col) {
    var cx = Math.max(parseInt(this._chart._currentSymbol._unitWidth / 2, 10), 1);
    this._chartCanvas.setLineWidth(this._chart._drawingThickness);
    this._chartCanvas.setStrokeColor(col);
    var i = XTIterator.reverseScreenIterator(this._chart);
    this._chartCanvas._bottomLineY = this._y + this._height - 1;
    do {
        var oy = this.getY(os.get(i._d));
        var hy = this.getY(hs.get(i._d));
        var ly = this.getY(ls.get(i._d));
        var cy = this.getY(cs.get(i._d));
        if (!isNaN(cy) && !isNaN(oy) && !isNaN(hy) && !isNaN(ly) && i.withinSeries(cs)) {
            this._chartCanvas.drawLineWithAdjust(i._x, parseInt(ly, 10), i._x, parseInt(hy, 10));
            this._chartCanvas.drawLineWithAdjust(i._x - cx + (cx > 2 ? 1 : 0), parseInt(oy, 10), i._x, parseInt(oy, 10));
            this._chartCanvas.drawLineWithAdjust(i._x, parseInt(cy, 10), i._x + cx, parseInt(cy, 10));
        }
    } while(i._x > this._chart._drawX + 1 && i.move());
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
    var i = XTIterator.reverseScreenIterator(this._chart);
    do {
        var value = data.getNoInterpolate(i._d);
        if (!isNaN(value)) {
            shape.draw(this._chartCanvas, i._x, parseInt(this.getY(value), 10));
        }
    } while(i.move() && i._x > this._chart._drawX + 1);
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
    var cx = parseInt(this._chart._currentSymbol._unitWidth / 2, 10);
    var i = XTIterator.reverseScreenIterator(this._chart);
    this._chartCanvas.setLineWidth(1.0);
    this._chartCanvas._bottomLineY = this._y + this._height - 1;
    var x, y, w, h;
    do {
        var oy = this.getY(os.get(i._d));
        var hy = this.getY(hs.get(i._d));
        var ly = this.getY(ls.get(i._d));
        var cy = this.getY(cs.get(i._d));
        if (!isNaN(cy) && !isNaN(oy) && !isNaN(hy) && !isNaN(ly) && i.withinSeries(cs)) {
            var cyi = parseInt(cy, 10);
            this._chartCanvas.setStrokeColor(line_col);
            this._chartCanvas.drawLineWithAdjust(i._x, parseInt(hy, 10), i._x, parseInt(ly, 10));
            x = i._x - cx;
            y = parseInt(oy, 10);
            w = parseInt(this._chart._currentSymbol._unitWidth, 10);
            h = cyi - parseInt(oy, 10);
            if (oy < cy) {
                this._chartCanvas.drawRectWithAdjust(x + 1, y, w - 2, h);
                this._chartCanvas.setFillColor(down_col);
                this._chartCanvas.fillRectWithAdjust(x + 1.5, y + 0.5, w - 3, h - 1);
            } else if (oy > cy) {
                this._chartCanvas.drawRectWithAdjust(x + 1, cyi, w - 2, y - cyi);
                this._chartCanvas.setFillColor(up_col);
                this._chartCanvas.fillRectWithAdjust(x + 1.5, cyi + 0.5, w - 3, y - cyi - 1);
            } else {
                this._chartCanvas.drawLineWithAdjust(i._x - cx + 1, cyi, i._x + cx - 1, cyi);
            }
        }
    } while(i._x > this._chart._drawX + 1 && i.move());
}
/**
 * @param {DataSeries} s
 * @param {Color|string} col
 */
Overlay.prototype.drawLineSquare = function(s, col) {
    var i = XTIterator.reverseScreenIterator(this._chart);
    var lasty = this.getY(s.get(i._d));
    var cx = Math.round(this._chart._currentSymbol._unitWidth / 2);
    this._chartCanvas.setLineWidth(this._chart._drawingThickness);
    this._chartCanvas.setStrokeColor(col);
    this._chartCanvas._bottomLineY = this._y + this._height - 1;
    var prevx = -1;
    do {
        var cury = this.getY(s.get(i._d));
        if (!isNaN(cury) && i.withinSeries(s)) {
            if (prevx === -1)
                prevx = i._x + cx * 2;
            this._chartCanvas.drawLineWithAdjust(i._x + cx, Math.round(lasty), prevx, Math.round(lasty));
            this._chartCanvas.drawLineWithAdjust(i._x + cx, Math.round(lasty), i._x + cx, Math.round(cury));
            this._chartCanvas.drawLineWithAdjust(i._x, Math.round(cury), i._x + cx, Math.round(cury));
        }
        prevx = i._x;
        lasty = cury;
    } while (i._x > this._chart._drawX + 1 && i.move());
}
/**
 * @param {DataSeries} s1
 * @param {DataSeries} s2
 * @param {Color|string} c1
 * @param {Color|string} c2
 */
Overlay.prototype.drawShadedChannel = function(s1, s2, c1, c2) {
    var i = XTIterator.reverseScreenIterator(this._chart);
    this._chartCanvas.setLineWidth(1.0);
    this._chartCanvas._bottomLineY = this._y + this._height - 1;
    do {
        var y1 = this.getY(s1.get(i._d));
        var y2 = this.getY(s2.get(i._d));
        if (y1 < y2) {
            this._chartCanvas.setStrokeColor(c1);
        } else {
            this._chartCanvas.setStrokeColor(c2);
        }
        if (!isNaN(y1) && i.withinSeries(s1)) {
            this._chartCanvas.drawLineWithAdjust(i._x, parseInt(y1, 10), i._x, parseInt(y2, 10));
        }
    } while (i._x > this._chart._drawX + 1 && i.move());
    this._chartCanvas.setLineWidth(this._chart._drawingThickness);
    this.drawLineNormal(s1, c1);
    this.drawLineNormal(s2, c2);
}
/**
 * @param {DataSeries} s
 * @param {Color|string} col
 */
Overlay.prototype.drawLineNormalNoIterator = function(s, col) {
    var startx = this.getXOffScale(s.timeByIndex(0));
    var endx;
    var starty = this.getY(s.getByIndex(0));
    var endy;
    this._chartCanvas.setLineWidth(this._chart._drawingThickness);
    this._chartCanvas.setStrokeColor(col);
    for (var n = 0; n < s.size(); n++) {
        endx = this.getXOffScale(s.timeByIndex(n));
        endy = this.getY(s.getByIndex(n));
        // check whether we've moved since the last entry
        if (starty != endy) {
            // check whether the line is actually onscreen
//            if (startx > this._chartCanvas._topLineStartX && startx < this._chartCanvas._topLineEndX && endx > this._chartCanvas._topLineStartX && endx < this._chartCanvas._topLineEndX) {
                this._chartCanvas.drawLineWithAdjust(startx, parseInt(starty, 10), endx, parseInt(endy, 10));
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
    var i = XTIterator.reverseScreenIterator(this._chart);
    var startx = i._x;
    var starty = this.getY(s.get(i._d));
    var endy = 0;
    var lastInSeries = true;
    this._chartCanvas.setLineWidth(this._chart._drawingThickness);
    this._chartCanvas.setStrokeColor(col);
    var tempY;
    this._chartCanvas._bottomLineY = this._y + this._height - 1;
    do {
        var curval = s.get(i._d);
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
            this._chartCanvas.drawLineWithAdjust(startx, parseInt(starty, 10), i._x, parseInt(tempY, 10));
        }
        startx = i._x;
        starty = endy;
        lastInSeries = i.withinSeries(s);
    } while (i.move() && startx > this._chart._drawX + 1);
}
/**
 * @param {DataSeries} s
 * @param {Color|string} col
 */
Overlay.prototype.drawShadedArea = function(s, col) {
    var i = XTIterator.reverseScreenIterator(this._chart);
    var startx = i._x;
    var starty = this.getY(s.get(i._d));
    var endy = 0;
    var lastInSeries = true;
    this._chartCanvas.setLineWidth(1.0);
    this._chartCanvas.setFillColor(col);
    this._chartCanvas._bottomLineY = this._y + this._height - 1;
    do {
        endy = this.getY(s.get(i._d));
        if (!isNaN(starty) && i.withinSeries(s) && lastInSeries) {
            if (!isNaN(endy)) {
                this._chartCanvas.begin(Canvas.POLYGON);
                this._chartCanvas.vertex(startx, parseInt(starty, 10));
                this._chartCanvas.vertex(startx, this._chartCanvas._bottomLineY - 1);
                this._chartCanvas.vertex(i._x, this._chartCanvas._bottomLineY - 1);
                this._chartCanvas.vertex(i._x, parseInt(endy, 10));
                this._chartCanvas.end();
            }
        }
        startx = i._x;
        starty = endy;
        lastInSeries = i.withinSeries(s);
    } while(i.move() && startx > this._chartCanvas._topLineStartX);
}
Overlay.prototype.symbolsChanged = function() {
    for (var i = 0; i < Overlay.MAX_STUDIES; i++) {
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
Overlay.prototype.calcMaxSigFigs = function() {
    var maxSigFigs = (this._chart._features & Chart.F_NO_LEFT_BORDER) !== Chart.F_NO_LEFT_BORDER ? 7 : 6;
    var curPrice = this._yLabelStart + this._yLabelInterval;
    var iter = 0;
    var pricesToCheck = [];
    while (curPrice < (this._yMid + this._ySpread) && iter < 20) {
        pricesToCheck.push(curPrice);
        curPrice += this._yLabelInterval;
        iter++;
    }
    if (this._isMain && this._chart.getData() && this._chart.getData().size() > 0) {
        pricesToCheck.push(this._chart.getSeries(Chart.S_CUR_CLOSE).getByIndex(-1));
    }
    if (this._isMain && this._legend) {
        var yesterdaysCloseItem = this._legend.getItem(this._chart._yestCloseLegendId);
        if (yesterdaysCloseItem && yesterdaysCloseItem._shown) {
            pricesToCheck.push(this._chart._currentSymbol.getSymbolInfo(0).getYesterdaysClose());
        }
    }
    if (this._chart._currentSymbol)
        this._chart._currentSymbol.initialiseFormatter(pricesToCheck, maxSigFigs);
}
Overlay.prototype.stop = function() {}
Overlay.prototype.start = function() {}
/**
 * @param {number} val
 */
Overlay.prototype.getYLabel = function(val) {
    return this._chart._currentSymbol.getYLabel(val);
}
/**
 * @param {number} price
 */
Overlay.prototype.getY = function(price) {
    if (isNaN(price))
        return NaN;
    var f = this._logScale ? (Math.log(price) - this._logMid) / this._logSpread : (price - this._yMid) / this._ySpread;
    return (this._y + (0.5 - f) * this._height) - 1;
}
/**
 * @param {Overlay_TimePos} t
 */
Overlay.prototype.getXFrac = function(t) {
    var count = this._chart.getMasterTimeList().countBack(t._d, this._chart._currentSymbol._timeEnd);
    var x = (this._chart._drawX + this._chart.getDrawGraphWidth()) - parseInt(count * this._chart._currentSymbol._unitWidth, 10);
    x += parseInt(this._chart._currentSymbol._unitWidth * t._frac, 10);
    return x;
}
/**
 * @param {Date} d
 */
Overlay.prototype.getXOffScale = function(d) {
    var count = this._chart.getMasterTimeList().count(d, this._chart._currentSymbol._timeEnd);
    var result = 0;
    if (d > this._chart._currentSymbol._timeEnd) {
        result = (this._chart._drawX + this._chart.getDrawGraphWidth()) + parseInt(count * this._chart._currentSymbol._unitWidth, 10);
    } else {
        result = (this._chart._drawX + this._chart.getDrawGraphWidth()) - parseInt(count * this._chart._currentSymbol._unitWidth, 10);
    }
    return (result > 0 ? result : 0);
}
/**
 * @param {Date} d
 */
Overlay.prototype.getX = function(d) {
    if ((d < this._chart._currentSymbol._timeStart) || (d > this._chart._currentSymbol._timeEnd)) {
        return 0;
    }
    var count = this._chart.getMasterTimeList().count(d, this._chart._currentSymbol._timeEnd);
    return (this._chart._drawX + this._chart.getDrawGraphWidth()) - parseInt(count * this._chart._currentSymbol._unitWidth, 10);
}
/**
 * @param {number} slot
 * @param {string} mnemonic
 */
Overlay.prototype.setStudy = function(slot, mnemonic) {
    this._study[slot] = (mnemonic === "" ? undefined : StudyFactory.getStudy(this, mnemonic));
}
Overlay.prototype.setValues = function() {
    var css = this._chart._currentSymbol;
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
    var d = this.descaleXForMouse(x);
    var h = this._chart.getSeries(Chart.S_CUR_HIGH).get(d);
    var l = this._chart.getSeries(Chart.S_CUR_LOW).get(d);
    var o = this._chart.getSeries(Chart.S_CUR_OPEN).get(d);
    var c = this._chart.getSeries(Chart.S_CUR_CLOSE).get(d);
    if (!isNaN(h) && !isNaN(l) && !isNaN(o) && !isNaN(c)) {
        if (y < this.getY(h) || y > this.getY(l)) {
            this._legend.setLarge(false);
            return this._chart.getLabel(d) + ", " + this.getYLabel(this.descaleY(y));
        }
        var s = '';
        var df = new DecimalFormat();
        df.setMinimumIntegerDigits(2);
        df.setMaximumFractionDigits(2);
        df.setGroupingUsed(false);
        this._chart._localCalendar.setTime(d);
        if (this._chart._frequency < Chart.FREQUENCY_D) {
            s = df.format(this._chart._localCalendar.get(Calendar.HOUR_OF_DAY)) + df.format(this._chart._localCalendar.get(Calendar.MINUTE)) + " " + this._chart._months[this._chart._localCalendar.get(Calendar.MONTH)] + " " + this._chart._localCalendar.get(Calendar.DAY_OF_MONTH);
        } else {
            s = this._chart._months[this._chart._localCalendar.get(Calendar.MONTH)] + " " + this._chart._localCalendar.get(Calendar.DAY_OF_MONTH) + " " + this._chart._localCalendar.get(Calendar.YEAR).toString();
        }
        this._legend.setLarge(true);
        return s + "  " + Language.getString("Legend_O") + this.getYLabel(o) + ",  " + Language.getString("Legend_H") + this.getYLabel(h) + "  " + Language.getString("Legend_L") + this.getYLabel(l) + "  " + Language.getString("Legend_C") + this.getYLabel(c);
    }
    return "";
}
/** @private */
Overlay.prototype._drawEvents = function() {
    var i = EventIterator.getEventIterator(this._chart);
    if (i) {
        do {
            var v = this._chart.getData().getEvents(i._d);
            if (v) {
                this._chartCanvas.setLineWidth(1.0);
                for (var j = 0; j < v.length; j++) {
                    this._chartCanvas.setStrokeColor(v[j]._colour);
                    this._chartCanvas.drawLine(i._x, this._y, i._x, this._y + this._height - 1);
                    this._chartCanvas.setFillColor(v[j]._colour);
                    this._chartCanvas.fillText(v[j]._label, i._x + 5, this._y + 15 * (j + 1));
                }
            }
        } while(i._x > this._chart._drawX && i.move());
    }
}
/**
 * @private
 * @param {Color|string} grid_col
 * @param {Color|string} tick_col
 */
Overlay.prototype._drawYGrid = function(grid_col, tick_col) {
    var curPrice = this._yLabelStart + this._yLabelInterval / 2;
    var idx = 1;
    while (curPrice < (this._yMid + this._ySpread)) {
        var curY = parseInt(this.getY(curPrice), 10);
        if ((curY > this._y) && curY < (this._y + this._height - 1)) {
            if ((idx % 2) === 0) {
                this._chartCanvas.setLineWidth(1.0);
                this._chartCanvas.setStrokeColor(grid_col);
                this._chartCanvas.drawLine(this._chart._drawX, curY, this._chart._drawX + this._chart._drawWidth - 1, curY);
                if ((this._chart._features & Chart.F_NO_AXES_TICKS) !== Chart.F_NO_AXES_TICKS) {

                        this._chartCanvas.setStrokeColor(tick_col);
                        this._chartCanvas.drawLine(this._chart._drawX + this._chart._drawWidth - 3, curY, this._chart._drawX + this._chart._drawWidth, curY);
                        this._chartCanvas.drawLine(this._chart._drawX, curY, this._chart._drawX + 2, curY);

                }
            } else {
                if ((this._chart._features & Chart.F_NO_AXES_TICKS) !== Chart.F_NO_AXES_TICKS) {

                        this._chartCanvas.setStrokeColor(tick_col);
                        this._chartCanvas.drawLine(this._chart._drawX + this._chart._drawWidth - 1, curY, this._chart._drawX + this._chart._drawWidth, curY);
                        this._chartCanvas.drawLine(this._chart._drawX, curY, this._chart._drawX + 1, curY);
                }
            }
        }
        curPrice += this._yLabelInterval / 2;
        idx++;
    }
}
/** @private */
Overlay.prototype._preYLabels = function() {
    if (this._ySpread <= 0) {
        this.calcAutoScale();
    }
    var check = [0.000001, 0.00001, 0.0001, 0.001, 0.01, 0.1, 0.2, 0.5, 1.0, 2.0, 5.0];
    var numLines = 0;
    var i = 0;
    var power = parseInt((Math.log(this._ySpread / 10.0) / Math.log(10)) + 0.5, 10);
    var c = Math.pow(10, power);
    for (i = check.length - 1; i >= 0; i--) {
        numLines = this._ySpread / (c * check[i]);
        if (numLines > 3) 
            break;
    }
    if (i === -1)
        i = 0;
    this._yLabelInterval = c * check[i];
    this._yLabelStart = parseInt((this._yMid - this._ySpread) / this._yLabelInterval, 10) * this._yLabelInterval;
    this.calcMaxSigFigs();
}
/**
 * @private
 * @param {Color|string} col
 */
Overlay.prototype._drawYLabels = function(col) {
    if ((this._chart._features & Chart.F_NO_Y_AXIS) !== 0) return;
    this._chartCanvas.setFillColor(col);
    this._chartCanvas.setLineWidth(1.0);
    var curPrice = this._yLabelStart + this._yLabelInterval;
    var iter = 0;
    while (curPrice < (this._yMid + this._ySpread) && iter < 20) {
        var curY = this.getY(curPrice) + this._chartCanvas._fontSize / 3;
        if ((curY > this._y - 1) && curY < (this._y + this._height + 3)) {
            this._chartCanvas.fillText(this.getYLabel(curPrice), this._chart._drawX + this._chart._drawWidth + 3, parseInt(curY, 10));
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
        var res = this._capture.onMouseUp(x, y);
        this._capture = undefined;
        return res;
    }
    this._oldYSpread = this._ySpread;
    this._drag = false;
    return false;
}
/** @override */
Overlay.prototype.onMouseMove = function(x, y) {
    if (!this._chart.isValid())
        return false;
    if (this._positionLegendId !== -1) {
        var leg = this._getBarData(x, y);
        if (this._chart._currentSymbol._displayCurrency) {
            leg += " (" + this._chart._currentSymbol._displayCurrency + ")";
        }
        this._legend.renameItem(this._positionLegendId, leg, true);
        this._chart.repaint();
        this._chart.process();
    }
    return false;
}
/** @override */
Overlay.prototype.onMouseDrag = function(x, y) {
    var dy = y - this._chart._dragY;
    if (this._chart._mode === Chart.MODE_NORMAL) {
        if (this._chart._dragX < this._chart._drawX + this._chart._drawWidth) {
            if (Math.abs(dy) > 10.0) {
                dy = (y - this._chart._mouseOldY) * this._ySpread / this._height * Overlay.Y_ADJ_MULT;
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
    var dy = y - this._chart._dragY;
    if (!this._logScale && this._isMain) {
        dy = dy / this._height * Overlay.Y_SF_MULT + 1.0;
        this._ySpread = this._oldYSpread * dy;
        if (this._isMain) {
            this._chart.setAutoScale(false);
        } else {
            this._autoScale = false;
        }
    }
}
Overlay.prototype.getChartTooltip = function() {
    return this._chart._curTooltip;
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