/* global DrawComponent, Color, FeedRequest, Feed, NumberFormat */
/**
 * ---------
 * HotTicker
 * ---------
 * @constructor
 * @extends {DrawComponent}
 * @param {Chart} parent
 * @param {Object} params
 */
function HotTicker(parent, params) {
    DrawComponent.call(this, parent, parent._canvas);
    // feed stuff
    this._feedCurPrice = 0;
    this._feedBid = 0;
    this._feedOffer = 0;
    this._feedVol = 0;
    // spacings and positionals
    this._pointWidth = 1;
    this._pointHeight = 2;
    this._topGap = 2;
    this._bottomGap = 1;
    // width and height of grid line spacing.
    this._gridWidth = (this._pointWidth + HotTicker.pointGap) * 15;
    this._gridHeight = 10 * this._pointHeight;
    // data structures
    this._curPrices = [];
    this._bidPrices = [];
    this._offerPrices = [];
    this._volumes = [];
    this._lastVolume = 0;
    this._current = 0;
    // internal variables
    this._lastTime = 0;
    this._rangeMax = 0;
    this._rangeMin = 0;
    this._rangeVolMax = 0;
    // sizes of areas
    this._dataAreaHeight = 0;
    this._volHeight = 0;
    // offsets from the above
    this._dataAreaOffsetX = 0;
    this._dataAreaOffsetY = 0;
    this._arraySize = 0;
    // graphics setup
    this._drawPrices = false;
    // the full array of points that can be used for the labels
    this._points = [0.0001, 0.0002, 0.0005, 0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000, 1000000, 2000000, 5000000, 10000000, 20000000, 50000000, 100000000, 200000000, 500000000];
    /**
     * constructor
     */
    this._feedOffset = 0;
    // general setup
    this._params = params;
    // get our draggable status
    this._notDraggable = params["notDraggable"] === '1';
    // get any skin we're meant to use
    var mySkin = params["hotTickerSkin"];
    if (mySkin && "level2" === mySkin) {
        // skinnable components
        this._posX = 0;
        this._posY = 0;
        // sizes of areas
        this._width = 228;
        this._height = 91;
        this._dataAreaHeight = 76;
        this._topGap = 2;
        this._bottomGap = 1;
        this._volHeight = this._height - this._dataAreaHeight - this._bottomGap - 2;
        this._arraySize = 2000;
        this._pointsToDisplay = this._width / (this._pointWidth + HotTicker.pointGap);
        // graphics setup
        this._priceColor = Color.white;
        this._priceHighlightColor = Color.red;
        // color information for vector graphics
        this._backgroundColor = new Color(13, 16, 50);
        this._backgroundGridColor = new Color(21, 50, 48);
        this._backgroundGridHighlightColor = new Color(71, 178, 117);
        this._bidOfferColor = new Color(93, 93, 144);
        this._bidOfferGridColor = new Color(101, 128, 164);
        this._bidOfferGridHighlightColor = new Color(91, 198, 137);
        this._volumeColor = new Color(255, 255, 0);
        this._textColor = new Color(255, 255, 0);
        this._textBgColor = Color.black;
    } else {
        // no skin or no valid skin defined
        // sizes of areas
        this._width = 200; 
        this._height = 100;
        // skinnable components
        this._posX = 10;
        // this._posY = -110;
        this._posY = this._parent._height/2 - this._height/2;
        this._dataAreaHeight = 84; 
        this._topGap = 2;
        this._bottomGap = 1;
        this._volHeight = this._height - this._dataAreaHeight - this._bottomGap - 2; 
        this._arraySize = 2000;
        this._pointsToDisplay = this._width / (this._pointWidth + HotTicker.pointGap);
        // graphics setup
        this._priceColor = Color.white;
        this._priceHighlightColor = Color.red;
        // color information for vector graphics
        this._backgroundColor = new Color(13, 16, 50);
        this._backgroundGridColor = new Color(21, 50, 48);
        this._backgroundGridHighlightColor = new Color(71, 178, 117);
        this._bidOfferColor = new Color(93, 93, 144);
        this._bidOfferGridColor = new Color(101, 128, 164);
        this._bidOfferGridHighlightColor = new Color(91, 198, 137);
        this._volumeColor = new Color(255, 255, 0);
        this._textColor = new Color(255, 255, 0);
        this._textBgColor = Color.black;
    }
    // offsets from the above
    this._dataAreaOffsetX = 0;
    this._dataAreaOffsetY = 0;
    this._curPrices = new Array(this._arraySize); // set up circular buffers
    this._curPrices.fillArrayWithValue(0);
    this._bidPrices = new Array(this._arraySize);
    this._bidPrices.fillArrayWithValue(0);
    this._offerPrices = new Array(this._arraySize);
    this._offerPrices.fillArrayWithValue(0);
    this._volumes = new Array(this._arraySize);
    this._volumes.fillArrayWithValue(0);
    // whether we draw the prices on top of the graph or not, default off
    this._drawPrices = false;
    // get our point size from params
    if (this._params.hasOwnProperty("pointsize") && this._params["pointsize"] !== undefined) {
        var temp = parseInt(this._params["pointsize"], 10);
        this._setPointWidth(temp);
    }
    this._initialiseFeed();
}
/**
 * Inheriting
 */
HotTicker.prototype = Object.create(DrawComponent.prototype);
HotTicker.prototype.constructor = HotTicker;
/** @static */
HotTicker.FEED_CURPRICE = 0;
/** @static */
HotTicker.FEED_VOLUME = 1;
/** @static */
HotTicker.FEED_BID = 2;
/** @static */
HotTicker.FEED_OFFER = 3;
/** @static */
HotTicker.pointGap = 1;
/** @static */
HotTicker.endXoffset = 7;
/** @static */
HotTicker.loopTime = 1000;
/** @private */
HotTicker.prototype._drawbackground = function() {
    // fill with background colour
    this._chartCanvas.setFillColor(this._backgroundColor);
    this._chartCanvas.fillRect(this._x, this._y, this._width, this._height);
    this._drawGridLines(this._backgroundGridColor, this._backgroundGridHighlightColor, this._x, this._y, this._width, this._height);
}
/** 
 * @private
 * @param {Color|string} grid
 * @param {Color|string} highlight
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 */
HotTicker.prototype._drawGridLines = function(grid, highlight, x, y, w, h) {
    this._chartCanvas.setStrokeColor(grid);
    var i;
    for (i = w - this._gridWidth; i > 0; i -= this._gridWidth) {
        this._chartCanvas.drawLine(i + x, y, i + x, y + h);
    }
    for (i = this._gridHeight; i < h; i+= this._gridHeight) {
        this._chartCanvas.setStrokeColor(grid);
        this._chartCanvas.drawLine(x, i + y, x + w, i + y);
        // draw grid "highlights"
        this._chartCanvas.setStrokeColor(highlight);
        for (var j = w - this._gridWidth; j > 0; j -= this._gridWidth) {
            this._chartCanvas.drawLine(j + x - 0.5, i + y, j + x + 0.5, i + y);
        }
    }
}
/** 
 * @private
 * @param {number} p
 */
HotTicker.prototype._setPointWidth = function(p) {
    this._pointWidth = this._pointHeight = p;
    if (this._pointHeight < 2) 
        this._pointHeight = 2;
    this._gridWidth = (this._pointWidth + HotTicker.pointGap) * 15;
    this._gridHeight = this._pointHeight * 10;
}
/** @private */
HotTicker.prototype._initialiseFeed = function() {
    var tok = this._params["ss0"].toString().split(',');
    var symbol = tok[1];
    var fr = new FeedRequest("TickScope");
    fr.cmdSymbol(symbol);
    fr.cmdParam(FeedRequest.P_CUR_PRICE);
    fr.cmdParam(FeedRequest.P_PERIOD_1_TOTAL_VOLUME);
    fr.cmdParam(FeedRequest.P_BID_PRICE);
    fr.cmdParam(FeedRequest.P_OFFER_PRICE);
    if (!this._feed) {
        this._feed = new Feed("TickScope", fr.toString(), fr.size(), this);
    } else {
        this._feed.register("TickScope", fr.toString(), fr.size(), this);
    }
    this._feed.start();
}
/** 
 * @private
 * @param {number} width
 * @param {number} height
 * @param {number} dataHeight
 */
HotTicker.prototype._recalculateSizes = function(width, height, dataHeight) {
    this._pointsToDisplay = (this._width - HotTicker.endXoffset) / (this._pointWidth + HotTicker.pointGap);
    this._dataAreaHeight = dataHeight;
}
/** @private */
HotTicker.prototype._doDrawPrices = function() {
    var myH = this._dataAreaHeight - (this._bottomGap + this._topGap);
    if (this._rangeMin === 0)
        return;
    var pointsToDraw = this._getLabelPoints(this._rangeMin, this._rangeMax, this._height);
    for (var j = 0; j < pointsToDraw.length; j++) {
        var string = pointsToDraw[j].toString();
        var stringHeight = parseInt(this._chartCanvas._gc.measureText("W").width, 10)
        var stringWidth = parseInt(this._chartCanvas._gc.measureText(string).width, 10)
        var drawPos = parseInt(myH - ((pointsToDraw[j] - this._rangeMin) / (this._rangeMax - this._rangeMin)) * myH, 10) + this._topGap + this._dataAreaOffsetY + this._y;
        // draw the line at the relevant point
        this._chartCanvas.setStrokeColor(this._textBgColor);
        this._chartCanvas.drawLine(stringWidth + 4 + this._x, drawPos + 1, this._x + this._width, drawPos + 1);
        this._chartCanvas.setStrokeColor(this._textColor);
        this._chartCanvas.drawLine(stringWidth + 3  + this._x, drawPos, this._x + this._width, drawPos);
        drawPos += (stringHeight / 2);
        this._chartCanvas.setFillColor(this._textBgColor);
        this._chartCanvas.fillText(string, 2 + this._x, drawPos + 1);
        this._chartCanvas.setFillColor(this._textColor);
        this._chartCanvas.fillText(string, 1 + this._x, drawPos);
    }
}
/** @private */
HotTicker.prototype._calculateMaxMin = function() {
    this._rangeMax = this._curPrices[this._current];
    this._rangeMin = this._curPrices[this._current];
    this._rangeVolMax = 0;
    for (var i = 0, loop = this._current; i < this._pointsToDisplay; i++, loop--) {
        if (loop < 0) {
            loop = this._arraySize - 1;
        }
        if (!isNaN(this._curPrices[loop]) && this._curPrices[loop] !== 0.0) {
            this._rangeMax = Math.max(this._rangeMax, this._curPrices[loop]);
            this._rangeMin = Math.min(this._rangeMin, this._curPrices[loop]);
        }
        if (!isNaN(this._bidPrices[loop]) && this._bidPrices[loop] !== 0.0) {
            this._rangeMax = Math.max(this._rangeMax, this._bidPrices[loop]);
            this._rangeMin = Math.min(this._rangeMin, this._bidPrices[loop]);
        }
        if (!isNaN(this._offerPrices[loop]) && this._offerPrices[loop] !== 0.0) {
            this._rangeMax = Math.max(this._rangeMax, this._offerPrices[loop]);
            this._rangeMin = Math.min(this._rangeMin, this._offerPrices[loop]);
        }
        if (!isNaN(this._volumes[loop]) && this._volumes[loop] !== 0.0) {
            this._rangeVolMax = Math.max(this._rangeVolMax, this._volumes[loop]);
        }
    }
}
/** 
 * @private
 * @param {number} myX
 * @param {number} volHeight
 */
HotTicker.prototype._drawVolume = function(myX, volHeight) {
    var bottomY = this._y + this._height - this._bottomGap;
    var topY = bottomY - volHeight;
    this._chartCanvas.setFillColor(this._volumeColor);
    this._chartCanvas.fillRect(myX, topY, this._pointWidth, volHeight);
}
/** 
 * @private
 * @param {number} start
 * @param {number} end
 * @param {number} height
 */
HotTicker.prototype._getLabelPoints = function(start, end, height) {
    // work out preferred number of steps from the height.
    var preferred = height / 50;
    if (preferred < 2) 
        preferred = 2;
    if (preferred > 6) 
        preferred = 6;
    var nf = NumberFormat.getInstance();
    nf.setMinimumFractionDigits(4);
    // work out the delta from the range
    var range = parseFloat(nf.format(end - start));
    // find a "significant point" within the range
    var firstForLoop = this._largestUnder(this._points, range);
    // iterate down through "significant" quotients until we find N of them in that range.
    var delta = 0;
    for (delta = firstForLoop; delta >= 0; delta--) {
        var numInRange = range / this._points[delta];
        if (numInRange >= preferred) 
            break;
    }
    // quick fix in case we went way too far with the last step
    if ((range / this._points[delta]) > (preferred + 3) && delta < this._points.length) {
        delta++;    
    } 
    var result = []; // replace this with a growable array - or can we estimate the maximum size?
    // getting some weird anomalies at the end of numbers here so trim off any unwanted stuff, after 9dps should be fine.
    
//    nf.setMaximumFractionDigits(9);
    var temp = ((start / this._points[delta]) * this._points[delta]) + this._points[delta];
    result.push(nf.format(temp));
    // continue until hit the end
    temp += this._points[delta];
    while (temp < end) {
        result.push(nf.format(temp));
        temp += this._points[delta];
    }
    // return, extract from array
    var out = new Array(result.length);
    for (var i = 0; i < result.length; i++) {
        out[i] = parseFloat(result[i]);
    }
    return out;
}
/** 
 * @private
 * @param {Array} array
 * @param {number} value
 */
HotTicker.prototype._largestUnder = function(array, value) {
    var currentValue = -1.0 / 0.0;
    var currentOffset = -1;
    for (var i = 0; i < array.length; i++) {
        if (array[i] > currentValue && array[i] <= value) {
            currentValue = array[i];
            currentOffset = i;
        }
    }
    return currentOffset;
}
HotTicker.prototype.stop = function() {
    if (this._feed) {
        this._feed.stop();
        this._feed = undefined;
    }
}
/** @override */
HotTicker.prototype.setBounds = function(x, y, w, h) {
    DrawComponent.prototype.setBounds.call(this, x, y, w, h);
    // maintain the height of the volume area from the original.
    this._recalculateSizes(w, h, h - (this._height - this._dataAreaHeight));
}
/** @override */
HotTicker.prototype.onMouseMove = function(x, y) {
    DrawComponent.prototype.onMouseMove.call(this, x, y);
    return true;
}
/** @override */
HotTicker.prototype.onMouseDrag = function(x, y) {
    var deltaX = x - this._dragX;
    var deltaY = y - this._dragY;
    var newX = this._x + deltaX;
    var newY = this._y + deltaY;
    this._dragX = x;
    this._dragY = y;
    // adjust
    if (newY < this._chartCanvas._y) {
        newY = this._chartCanvas._y;
    } else if (newY > this._chartCanvas._y + this._chartCanvas._height - this._height) {
        newY = this._chartCanvas._y + this._chartCanvas._height - this._height + 1;
    }
    if (newX < this._chartCanvas._x) {
        newX = this._chartCanvas._x;
    } else if (newX > this._chartCanvas._x + this._chartCanvas._width - this._width) {
        newX = this._chartCanvas._x + this._chartCanvas._width - this._width - 1;
    }
    this.setLocation(newX, newY);
    this._parent.repaint();
    this._parent.process();
    return true;
}
HotTicker.prototype.feedDelegate_connected = function() {}
HotTicker.prototype.feedDelegate_loadingComplete = function() {}
/** 
 * @param {FeedContent} contents
 */
HotTicker.prototype.feedDelegate_feed = function(contents) {
    contents._id -= this._feedOffset;
    if (!contents._contents || contents._id < 0) 
        return;
    var val = parseFloat(contents._contents);
    switch (contents._id) {
        case HotTicker.FEED_CURPRICE:
            this._feedCurPrice = val;
            break;
        case HotTicker.FEED_VOLUME:
            this._feedVol = val;
            if (isNaN(this._feedVol)) 
                this._feedVol = 0;
            break;
        case HotTicker.FEED_BID:
            this._feedBid = val;
            break;
        case HotTicker.FEED_OFFER :
            this._feedOffer = val;
            break;
        default :
            // something we're not interested in
    }
    this.refresh();
}
/** @override */
HotTicker.prototype.show = function() {
    if (DrawComponent.prototype.show.call(this))
        this._dirty = true;
}
/** 
 * @param {number} t
 * @param {boolean} res
 */
HotTicker.prototype.process = function(t, res) {
    if (this._feed) {
        res = this._feed.process(t);
    }
    if (t - this._lastTime < HotTicker.loopTime) {
        return res;
    }
    // get the current price from the feed
    this._curPrices[this._current] = this._feedCurPrice;
    this._bidPrices[this._current] = this._feedBid;
    this._offerPrices[this._current] = this._feedOffer;
    // alter the volume so we only get the difference between this and last time.
    // special case - if last is zero, we ignore and initialize.
    if (this._lastVolume === 0) {
        this._lastVolume = this._feedVol;
    }
    // special case, if volume has *dropped*, we started a new minute.
    if (this._feedVol < this._lastVolume) {
        this._lastVolume = 0;
    }
    this._volumes[this._current] = this._feedVol - this._lastVolume;
    if (this._curPrices[this._current] !== 0) {
        this._dirty = true;
    }
    this.draw();
    // set up for next iteration.
    this._lastVolume += this._volumes[this._current];
    this._current++;
    if (this._current === this._arraySize) {
        this._current = 0;
    }
    this._lastTime = t;
    return res;
}
/** @override */
HotTicker.prototype.draw = function() {
    if (!this._dirty)
        return;
    if (!this._shown)
        return;
    this._drawbackground();
    this._calculateMaxMin();
    
    if (this._rangeMax === this._rangeMin) {
        // special case, all the points are the same.  force them to the middle.
        this._rangeMax = this._rangeMax + 1;
        this._rangeMin = this._rangeMin - 1;
    }
    // iterate through and draw the dots.
    var myX = this._width + this._x + this._dataAreaOffsetX - HotTicker.endXoffset;
    var myH = this._dataAreaHeight - (this._bottomGap + this._topGap);
    for (var i = 0, loop = this._current; i < this._pointsToDisplay; i++, loop--, myX -= (this._pointWidth + HotTicker.pointGap)) {
        if (loop < 0) {
            loop = this._arraySize - 1;
        }
        if (this._volumes[loop] !== 0.0) {
            var volY = parseInt(((this._volumes[loop] / this._rangeVolMax) * this._volHeight), 10);
            this._drawVolume(myX, volY);
        }
        // draw the bid and offer as a rectangle filled with the bid/offer spread graphic.
        if (this._bidPrices[loop] !== 0.0 && !isNaN(this._bidPrices[loop])) {
            var bidY = parseInt(myH - ((this._bidPrices[loop] - this._rangeMin) / (this._rangeMax - this._rangeMin)) * myH, 10) + this._topGap + this._dataAreaOffsetY;
            var offerY = parseInt(myH - ((this._offerPrices[loop] - this._rangeMin) / (this._rangeMax - this._rangeMin)) * myH, 10) + this._topGap + this._dataAreaOffsetY;
            this._drawBidOfferSpread(myX, bidY, offerY);
        }
        // draw the price values, if required
//        if (this._drawPrices) {
//           this._doDrawPrices(); 
//        }
        // draw the price points
        if (this._curPrices[loop] !== 0.0) {
            // highlight the price if there was volume movement during this second.
            this._chartCanvas.setFillColor(this._volumes[loop] > 0 ? this._priceHighlightColor : this._priceColor);
            var myY = parseInt(myH - ((this._curPrices[loop] - this._rangeMin) / (this._rangeMax - this._rangeMin)) * myH, 10) + this._topGap + this._dataAreaOffsetY + this._y;
            this._chartCanvas.fillRect(myX, myY, this._pointWidth, this._pointHeight);
        }
        // if all prices are zero, show some text or something instead?
    }
    // draw the price values, if required
    if (this._drawPrices) {
       this._doDrawPrices(); 
    }
    //
    
    this._dirty = false;
}
/** 
 * @private
 * @param {number} myX
 * @param {number} bidY
 * @param {number} offerY
 */
HotTicker.prototype._drawBidOfferSpread = function(myX, bidY, offerY) {
    this._chartCanvas.setFillColor(this._bidOfferColor);
    this._chartCanvas.fillRect(myX, this._y + offerY, this._pointWidth + HotTicker.pointGap, (bidY - offerY) + this._pointHeight);
    this._chartCanvas.setStrokeColor(this._bidOfferGridColor);
    var x = myX;
    var w = this._pointWidth + HotTicker.pointGap;
    var y = this._y + offerY;
    var h = (bidY - offerY) + this._pointHeight;
    var i;
    for (i = this._x + this._width - this._gridWidth; i > this._x; i -= this._gridWidth) {
        if (i >= x && i <= x + w)
            this._chartCanvas.drawLine(i, y - 0.5, i, y + h - 0.5);
    }
    for (i = this._y + this._gridHeight; i < y + h; i += this._gridHeight) {
        this._chartCanvas.setStrokeColor(this._bidOfferGridColor);
        if (i >= y && i <= y + h)
            this._chartCanvas.drawLine(x - 0.5, i, x + w - 0.5, i);
        // draw grid "highlights"
        this._chartCanvas.setStrokeColor(this._bidOfferGridHighlightColor);
        for (var j = this._x + this._width - this._gridWidth; j > this._x; j -= this._gridWidth) {
            if (j >= x && j <= x + w)
                this._chartCanvas.drawLine(j - 0.5, i, j + 0.5, i);
        }
    }
    
}