/* eslint no-unused-vars: "off" */
/* global Study, Language, MontageOrderBook, Level2Book, Main, StudyDialog_StudyEditParameter, Utils, Color, Style */
/**
 * Level2Histogram
 * 
 * This provides a histogram of the Level2 order book on the chart.  
 * It loads Level2Books in the background to handle all the feed and stuff.
 * Obviously this will only be available to users who have access to Level2 information for this stock (as defined by the streamer)
 * 
 * @author davidw
 * 
 * @constructor
 * @extends {Study}
 * @param {Overlay} o
 */
function StudyLevel2Histogram(o) {
    this._positionsView = 8; // how many positions to show each side of the book
    this._maxWidth = 100; // width of the level 2 volume area, in pixels
    this._name = Language.getString("study_level2scope");
    this._orderBook = new MontageOrderBook(Main.getParams(), o._chart._currentSymbol.mainSymbol());
    this._buyBook = new Level2Book(o._chart._parent._id + "_buyBook", o._chart._parent, this._orderBook, true);
    this._sellBook = new Level2Book(o._chart._parent._id + "_sellBook", o._chart._parent, this._orderBook, false);
    this._maxVolume = 0.0; // the largest volume at any price point calculated.
    this._bidPrices = [];
    this._offerPrices = [];
    Study.call(this, o);
}
/**
 * Inheriting
 */
StudyLevel2Histogram.prototype = Object.create(Study.prototype);
StudyLevel2Histogram.prototype.constructor = StudyLevel2Histogram;
/** @static */
StudyLevel2Histogram.getItems = function() {
    return [new StudyDialog_StudyEditParameter("positionsView", Language.getString("toolbardialogs_positions")),
                new StudyDialog_StudyEditParameter("maxWidth", Language.getString("toolbardialogs_maxwidth"))];
}
/** 
 * @static
 * @param {Overlay} o
 */
StudyLevel2Histogram.newInstance = function(o) {
    return new StudyLevel2Histogram(o);
}
/** @static */
StudyLevel2Histogram.mnemonic = "Level2Histogram";
/** @static */
StudyLevel2Histogram.helpID = 558;
/** @static */
StudyLevel2Histogram.ownOverlay = false;
StudyLevel2Histogram.prototype.show = function() {
    Main.getSession().getRootComponent().addWindow(this._buyBook);
    Main.getSession().getRootComponent().addWindow(this._sellBook);
    Main.getSession().getRootComponent().refresh();
}
StudyLevel2Histogram.prototype.hide = function() {
    Main.getSession().getRootComponent().removeWindow(this._buyBook);
    Main.getSession().getRootComponent().removeWindow(this._sellBook);
    Main.getSession().getRootComponent().refresh();
}
/** @override */
StudyLevel2Histogram.prototype.getParams = function() {
    return "positionsView-" + this._positionsView + ":maxWidth-" + this._maxWidth;
}
/** @override */
StudyLevel2Histogram.prototype.setParams = function(params) {
    var items = Utils.convertStringParams(params, ":", "-");
    if (items.hasOwnProperty("positionsView") && typeof items["positionsView"] !== "undefined")
        this._positionsView = parseInt(items["positionsView"], 10);
    if (items.hasOwnProperty("maxWidth") && typeof items["maxWidth"] !== "undefined")
        this._maxWidth = parseInt(items["maxWidth"], 10);
}
/** @override */
StudyLevel2Histogram.prototype.getMaxMin = function() {
    this._range.reset();
    this._calcRange(this._buyBook.getPrices());
    this._calcRange(this._sellBook.getPrices());
}
/** @override */
StudyLevel2Histogram.prototype.update = function(start, end) {
    this._bidPrices = this._buyBook.getPrices();
    this._offerPrices = this._sellBook.getPrices();
    // calculate highest volume in the order book to work out the width to display the volume in
    this._maxVolume = 0;
    var i, o;
    for(i = 0; i < this._positionsView && i < this._bidPrices.length; i++) {
        o = this._bidPrices[i];
        this._maxVolume = Math.max(this._maxVolume, o._size);
    }
    for(i = 0; i < this._positionsView && i < this._offerPrices.length; i++) {
        o = this._offerPrices[i];
        this._maxVolume = Math.max(this._maxVolume, o._size);
    }
}
/** @override */
StudyLevel2Histogram.prototype.draw = function() {
    this.updateY();
    if (typeof this._bidPrices === "undefined" || typeof this._offerPrices === "undefined") {
        this.update();
    }
    this._paintVolume(this._bidPrices);
    this._paintVolume(this._offerPrices);
    // and now draw the bid and offer lines
    this._parent._chartCanvas.setFillColor(Color.black);
    var o = this._bidPrices[0];
    var y;
    if (o) {
        y = parseInt(this._parent.getY(o._price), 10);
        this._parent._chartCanvas.fillRectWithAdjust(this._parent._chartCanvas._topLineEndX - 7 - this._maxWidth, y, this._maxWidth, 2);
    }
    o = this._offerPrices[0];
    if (o) {
        y = parseInt(this._parent.getY(o._price), 10);
        this._parent._chartCanvas.fillRectWithAdjust(this._parent._chartCanvas._topLineEndX - 7 - this._maxWidth, y, this._maxWidth, 2);
    }
}
/**
 * Calculate the range used by the bids/offers.  This needs to be this complicated because we work out a lot
 * from the widths of previous entries (check the code for the last element)
 * 
 * This duplicates some from paintBook(), so maybe we could simplify that.  We do need to iterate through
 * this beforehand to find the range to display though.
 * @private
 * @param {Array} v
 */
StudyLevel2Histogram.prototype._calcRange = function(v) {
    for (var i = 0; i < this._positionsView && i < v.length; i++) {
        var o = v[i];
        var price; // price of the current point (also reflects the height of the bar)
        if (i === v.length - 1 && i !== 0) { // if we're on the last element, mimic the height of the previous bar
            price = o._price;
            var o1 = v[i-1]; // get the previous order for comparison
            if (o._price < o1._price) { // last order has higher price, these are bids 
                price = o._price - (o1._price - o._price);									
            } else { // and these are offers
                price = o._price + (o._price - o1._price);								
            }
        } else if (i == v.length - 1 && i === 0) {
            // special case, only one element in the entire thing
            price = o._price;
        } else {
            price = o._price;
        }
        // and store the prices for the range calculation
        this._range._min = Math.min(this._range._min, price);
        this._range._max = Math.max(this._range._max, price);
    }
}
/**
 * Paint the volume bars at the end of the study.
 * This is the version for SEAC Stocks only, that don't look at the individual orders but just the summary.
 * If we are looking at an MM or SETS/MM, then we need to colour the bits of the bars according to the MMs.
 * @private
 * @param {Array} v - the Order Book
 */
StudyLevel2Histogram.prototype._paintVolume = function(v) {
    /*
     * For SEAC stocks, just colour each volume according to position in the order book.
     */
    for (var i = 0; i < this._positionsView && i < v.length; i++) {
        var o = v[i];
        // use Level2 colouring where possible
        if (i <= 4)		 {
            this._parent._chartCanvas.setFillColor(Style.getBackground(Style.PRICE_1 + i));
        } else {
            this._parent._chartCanvas.setFillColor(Style.getBackground(Style.PRICE_5));
        }
        var width = parseInt((o._size / this._maxVolume) * this._maxWidth, 10); // width of bar, with minimum size
        if (width < 2) 
            width = 2;
        var y, dy, o1; // work out y-positions
        if (i === v.length - 1 && i !== 0) { // if we're on the last element, mimic the width of the previous bar
            y = parseInt(this._parent.getY(o._price), 10);
            o1 = v[i-1]; // get the previous order for comparison
            var y1 = parseInt(this._parent.getY(o1._price), 10);
            if (o._price > o1._price) { // last order has higher price, these are offers. 
                dy = y1 - y; // shift the bar up
                y -= dy;
            } else { // and these are bids
                dy = y - y1;
            }
        } else if (i === v.length - 1 && i === 0) {
            // special case, only one element in the entire thing
            y = parseInt(this._parent.getY(o._price), 10);
            dy = 5;
        } else {
            o1 = v[i+1]; // get the distance between this and the next one
            y = parseInt(this._parent.getY(Math.max(o1._price, o._price)), 10);
            dy = -(y - parseInt(this._parent.getY(Math.min(o1._price, o._price)), 10));
        }
        // not entirely sure where this 7 comes from in chart but it's the gap at the end.
        this._parent._chartCanvas.fillRectWithAdjust(this._parent._chartCanvas._topLineEndX - 7 - this._maxWidth, y, width, dy);
        // write the text for the particular amount on it too
        this._parent._chartCanvas.setFillColor(Color.black);
        var textY = y + (dy / 2);
        if (textY - 7 > this._parent._chartCanvas._topLineY && textY < this._parent._chartCanvas._bottomLineY)
            this._parent._chartCanvas.fillText(o._size, this._parent._chartCanvas._topLineEndX - 7 - this._maxWidth + 5, textY);
    }
}
/** @override */
StudyLevel2Histogram.prototype.restartStudy = function() {
    this._bidPrices = [];
    this._offerPrices = [];
    // restart the feeds
    if (this._orderBook)  {
        this._orderBook.stop();
    }
    this._orderBook = new MontageOrderBook(Main.getParams(), this._parent._chart._currentSymbol.mainSymbol());
    this._buyBook = new Level2Book(this._parent._chart._parent._id + "_buyBook", this._parent._chart._parent, this._orderBook, true);
    this._sellBook = new Level2Book(this._parent._chart._parent._id + "_sellBook", this._parent._chart._parent, this._orderBook, false);
}
/** @override */
StudyLevel2Histogram.prototype.destroy = function() {
    Study.prototype.destroy.call(this);
    if (this._orderBook) {
        this.hide();
        this._orderBook.stop();
        this._orderBook = undefined;
    }
}
/** 
 * @param {number} t
 * @param {boolean=} res
 */
StudyLevel2Histogram.prototype.process = function(t, res) {
    if (this._orderBook.process(t) && this._orderBook.isLoaded()) {
        this.getMaxMin();
        this.update();
        this._parent._chart.repaint();
        return true;
    }
    return res;
}