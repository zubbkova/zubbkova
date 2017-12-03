/* eslint no-empty: "off" */
/* global StudyPointAndFigure, Language, Utils, TimeIterator, StudyDialog_StudyEditParameter, StudyDialog_StudyButton, Color */
/**
 * Renko study
 * 
 * Similar to PnF so extended from that.  Essentially different display style, and reversal fixed at 1.
 * 
 * To draw Renko bricks, today's close is compared with the high and low of the previous brick (white or black):
 * If the closing price rises above the top of the previous brick by at least the box size, one or more white bricks are drawn in new columns. The height of the bricks is always equal to the box size.
 * If the closing price falls below the bottom of the previous brick by at least the box size, one or more black bricks are drawn in new columns. Again, the height of the bricks is always equal to the box size.
 * 
 * Implementation reference:  http://www.marketscreen.com/help/atoz/default.asp?hideHF=&Num=94
 * 
 * @author davidw
 * @constructor
 * @extends {StudyPointAndFigure}
 * @param {Overlay} o
 */
function StudyRenko(o) {
    StudyPointAndFigure.call(this, o);
    this._boxSize = 0;
    this._reversal = 1; // hardcoded, this is the main difference between renko and pnf
}
/**
 * Inheriting
 */
StudyRenko.prototype = Object.create(StudyPointAndFigure.prototype);
StudyRenko.prototype.constructor = StudyRenko;
/** 
 * @static
 * @param {Overlay} o
 */
StudyRenko.newInstance = function(o) {
    return new StudyRenko(o);
}
/** @static */
StudyRenko.mnemonic = "Renko";
/** @static */
StudyRenko.helpID = 1794;
/** @static */
StudyRenko.ownOverlay = false;
/** @static */
StudyRenko.getItems = function() {
    return [new StudyDialog_StudyEditParameter("boxSize", Language.getString("toolbardialogs_boxsize")), new StudyDialog_StudyButton("recalcboxsize", "Recalc box size")];
}
/**
 * Draw the Renko boxes between certain values, between a certain range (ie scale the X boxes to fit)
 * @private
 * @param {number} startx
 * @param {number} endx
 * @param {number} startPrice
 * @param {number} endPrice
 */
StudyRenko.prototype._drawRenkoBoxes = function(startx, endx, startPrice, endPrice) {
    if ((startx === 0 && endx === 0) || startx === endx)
        return;
    var up = endPrice > startPrice ? true : false;
    var numBoxes, boxWidth, boxHeight, starty, i;
    if (up) {
        // find number of boxes
        numBoxes = parseInt((endPrice - startPrice) / this._boxSize, 10);
        if (numBoxes <= 0) 
            return;
        // find width and height of each box
        boxWidth = (endx - startx) / numBoxes;
        boxHeight = parseInt(this._parent.getY(0) - this._parent.getY(this._boxSize), 10);	// bit of a hack this, doesn't account for log scale
        starty = parseInt(this._parent.getY(startPrice), 10);
        // draw
        for (i = 0; i < numBoxes; i++) {
            this._parent._chartCanvas.setFillColor(Color.white);
            this._parent._chartCanvas.fillRectWithAdjust(startx + (boxWidth * i), starty - (boxHeight * (i + 1)), boxWidth, boxHeight);
            this._parent._chartCanvas.setStrokeColor(Color.black);
            this._parent._chartCanvas.drawRectWithAdjust(startx + (boxWidth * i), starty - (boxHeight * (i + 1)), boxWidth, boxHeight);
        }
    } else {
        // find number of boxes
        numBoxes = parseInt((startPrice - endPrice) / this._boxSize, 10);
        if (numBoxes <= 0) 
            return;
        // find width and height of each box
        boxWidth = (endx - startx) / numBoxes;
        boxHeight = parseInt(this._parent.getY(0) - this._parent.getY(this._boxSize), 10); // bit of a hack this, doesn't account for log scale
        starty = parseInt(this._parent.getY(startPrice), 10);
        // draw
        for (i = 0; i < numBoxes; i++) {
            this._parent._chartCanvas.setFillColor(Color.black);
            this._parent._chartCanvas.fillRectWithAdjust(startx + (boxWidth * i), starty + (boxHeight * i), boxWidth, boxHeight);
        }
    }
}
/** @override */
StudyRenko.prototype.draw = function() {
    this.updateY();
    var c = this._parent._chart;
    // Check whether the price range has changed so we need
    // to adjust box size and recalc.
    if (this._boxSize === 0.0 || this._currentFrequency != c._currentSymbol.mainFrequency()) {
        var newBoxSize = this.getBoxSize();
        this._currentFrequency = c._currentSymbol.mainFrequency();
        if (newBoxSize != this._boxSize) {
            this._boxSize = newBoxSize;
            this.setName();
            if (this._parent._legend)
                this._parent._legend.renameItem(this._legendIndex, this._name);
            this.update(this._source.timeStart(), c._currentSymbol._time);
        }
    }
    if (this._series.size() < 2) 
        return;	// we assume two in here so we can compare :)
    var startx = this._parent.getXOffScale(this._series.timeByIndex(0));
    var endx;
    var startPrice = this._series.getByIndex(0);
    var endPrice = this._series.getByIndex(1); 
    var currentDirection = endPrice > startPrice ? true : false;
    for (var n = 1; n < this._series.size(); n++) {
        endx = this._parent.getXOffScale(this._series.timeByIndex(n));
        endPrice = this._series.getByIndex(n);
        // check against current direction, to find reversals
        var myDirection = endPrice > startPrice ? true : false;
        // check whether the bar is actually onscreen
        if (endx > 0 && (startx < (c._drawX + c.getDrawGraphWidth()) || endx < (c._drawX + c.getDrawGraphWidth()))) {
            if (myDirection !== currentDirection) { // detect reversals to allow for different starting point to draw from.
                if (myDirection) { // reverse from down to up
                    startPrice += this._boxSize;
                } else { // from up to down
                    startPrice -= this._boxSize;
                }
            }
            this._drawRenkoBoxes(startx, endx, startPrice, endPrice);
        }
        startx = endx;
        startPrice = endPrice;
        currentDirection = myDirection;
    }
}
/** @override */
StudyRenko.prototype.update = function(start, end) {
    if (this._boxSize == 0.0)
        return;
    var c = this._parent._chart;
    this._series.clear();
    this._range.reset();
    // start with the first bar, work out whether prices are rising or falling
    var boundaryLow, boundaryHigh; // the values that would have to be exceeded to cause another box or a reversal. 
    var ti = TimeIterator.forwardRangeIterator(c.getMasterTimeList(), start, end);
    while ((isNaN(this._high.get(ti._d)) || isNaN(this._low.get(ti._d))) && ti.move()) {
    }
    var close1 = this._close.get(ti._d);
    ti.move();
    var close2 = this._close.get(ti._d);
    if (close2 >= close1) { // price is going up.
        boundaryLow = close1 - this._boxSize;
        boundaryHigh = close1 + (this._boxSize * 2);
    } else {
        boundaryLow = close1 - (this._boxSize * 2);
        boundaryHigh = close1 + this._boxSize;
    }
    // restart the iterator
    ti = TimeIterator.forwardRangeIterator(c.getMasterTimeList(), start, end);
    while ((isNaN(this._high.get(ti._d)) || isNaN(this._low.get(ti._d))) && ti.move()) {
    }
    do {
        // loop analysing close values til we go past a box boundary
        if (this._close.get(ti._d) > boundaryHigh) {
            // we don't know where boundaryLow is because this might be a reversal.  We do know we are at the right place
            // on boundaryHigh, so force boundaryLow to the right place.
            boundaryLow = boundaryHigh - (this._boxSize * 3);
            // loop to see how many boxes we've gone up (might be more than 1 in a single time)
            while (this._close.get(ti._d) > boundaryHigh) {
                boundaryHigh += this._boxSize;
                boundaryLow += this._boxSize;
            }
            // we now have a box that includes the price.  write a box up
            this._series.append(ti._d, boundaryHigh - this._boxSize); // due to the loop we went one too high for the current value :)
        } else if (this._close.get(ti._d) < boundaryLow) {
            // we don't know where boundaryHigh is because this might be a reversal.  We do know we are at the right place
            // on boundaryLow, so force boundaryHigh to the right place.
            boundaryHigh = boundaryLow + (this._boxSize * 3);
            // loop to see how many boxes we've gone down (might be more than 1 in a single time)
            while (this._close.get(ti._d) < boundaryLow) {
                boundaryHigh -= this._boxSize;
                boundaryLow -= this._boxSize;
            }
            // we now have a box that includes the price.  write a box down
            this._series.append(ti._d, boundaryLow + this._boxSize); // due to the loop we went one too low for the current value :)
        }
    } while (ti.move());
    // write out the last value?
}
/** @override */
StudyRenko.prototype.setParams = function(params) {
    var items = Utils.convertStringParams(params, ":", "-");
    if (items.hasOwnProperty("boxSize") && typeof items["boxSize"] !== "undefined")
        this._boxSize = parseFloat(items["boxSize"]);
    StudyPointAndFigure.prototype.setParams.call(this, params);
}
/** @override */
StudyRenko.prototype.getParams = function() {
    return "boxSize-" + this._boxSize;
}
/** @override */
StudyRenko.prototype.setName = function() {
    this._name = Language.getString("study_renko") + " (" + this._boxSize + ")";
}