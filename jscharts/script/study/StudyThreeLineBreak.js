/**
 * Three line break
 * 
 * Three Line Break charts display a series of vertical boxes ("lines") that are based on changes in prices. 
 * The Three Line Break charting method is so-named because of the number of lines typically used,
 * but any number of lines can be used. (This study allows for that value to be changed
 * 
 * The three line break chart is similar in concept to point and figure charts. The decision criteria for 
 * determining "reversals" are somewhat different. The three-line break chart looks like a series of 
 * rising and falling lines of varying heights. Each new line, like the X's and O's of a point and figure chart, 
 * occupies a new column. Using closing prices (or highs and lows), a new rising line is drawn if the 
 * previous high is exceeded. A new falling line is drawn if the price hits a new low. 
 * 
 * The term "three line break" comes from the criterion that the price has to break the high or low of the 
 * previous three lines in order to reverse and create a line of the opposite color.
 * 
 * Implementation reference:  http://www.tradingsimulatorsoftware.com/hlp/Web/threelinebreak.htm
 * 
 * @author davidw
 * @constructor
 * @extends {Study}
 * @param {Overlay} o
 */
function StudyThreeLineBreak(o) {
    Study.call(this, o);
    this._lines = 3;
    this._series = new Series();
}
/**
 * Inheriting
 */
StudyThreeLineBreak.prototype = Object.create(Study.prototype);
StudyThreeLineBreak.prototype.constructor = StudyThreeLineBreak;
/** 
 * @static
 * @param {Overlay} o
 */
StudyThreeLineBreak.newInstance = function(o) {
    return new StudyThreeLineBreak(o);
}
/** @static */
StudyThreeLineBreak.mnemonic = "ThreeLineBreak";
/** @static */
StudyThreeLineBreak.helpID = 1544;
/** @static */
StudyThreeLineBreak.ownOverlay = false;
/** @static */
StudyThreeLineBreak.getItems = function() {
    return [new StudyDialog_StudyEditParameter("lines", Language.getString("toolbardialogs_linebreaks"))];
}
/** @override */
StudyThreeLineBreak.prototype.setName = function() {
    this._name = Language.getString("study_threelinebreak") + " (" + this._lines + ")";
}
/** @override */
StudyThreeLineBreak.prototype.getParams = function() {
    return "lines-" + this._lines;
}
/** @override */
StudyThreeLineBreak.prototype.setParams = function(params) {
    let items = Utils.convertStringParams(params, ":", "-");
    if (items.has("lines"))
        this._lines = parseInt(items.get("lines"), 10);
    Study.prototype.setParams.call(this, params);
}
/** @override */
StudyThreeLineBreak.prototype.update = function(start, end) {
    if (!start || !end)
        return;
    this._series.clear();
    let direction = true; // true is up, false is down.
    let lineCount = 1; // the number of lines we've been going in the same direction
    // get the first item
    let i = TimeIterator.forwardRangeIterator(this._parent._chartCanvas._chart.getMasterTimeList(), start, end);
    let lastHigh = this._source.get(start); // the values we are comparing against
    let lastLow = this._source.get(start); // if we're in a break, then they are the high and low of the range
    this._series.append(start, lastHigh);
    i.move(); // skip to second entry and set direction accordingly.
    if (this._source.get(i._d) >= lastHigh)
        direction = true;
    else
        direction = false;
    do {
        let value = this._source.get(i._d);
        // If the price exceeds the previous line's high price, a new green line is drawn.
        if (value > lastHigh) {
            // append to data
            this._series.append(i._d, value);
            // test lineCount to see if we've reversed direction
            if (direction) {
                lineCount++; 
                lastLow = lastHigh; // cause we've gone up a step
                lastHigh = value;
            } else { 
                lineCount = 1; 
                direction = true; 
                // keep lastLow the same, we've flipped
                lastHigh = value;
            }
            // set up for next iteration
            // test for linebreak condition
            if (lineCount >= this._lines) {
                // get the value from (lines) linebreaks ago.
                lastLow = (this._series.getByIndex(Math.max(0, this._series.getIndexByDate(i._d) - this._lines)));
            }
        }
        // If the price falls below the previous line's low price, a new red line is drawn. 
        else if (value < lastLow) {
            // append to data
            this._series.append(i._d, value);
            // test lineCount to see if we've reversed direction
            if (!direction) {
                lineCount++; 
                lastHigh = lastLow; // cause we've gone down a step
                lastLow = value;
            } else { 
                lineCount = 1; 
                direction = false; 
                // lastHigh is unchanged as we've flipped direction
                lastLow = value;
            }
            // test for linebreak condition
            if (lineCount >= this._lines) {
                // get the value from (lines) linebreaks ago.
                lastHigh = (this._series.getByIndex(Math.max(0, this._series.getIndexByDate(i._d) - this._lines)));
            }
        }
        // If the price does not rise above nor fall below the previous bar, do nothing (time goes on)
    } while(i.move());
    // get last item?
}
/** @override */
StudyThreeLineBreak.prototype.getMaxMin = function(i) {
    this.updateDefaultDataSource();
    Study.prototype.update.call(this);
    Study.prototype.getMaxMin.call(this, i);
}
/** @override */
StudyThreeLineBreak.prototype.getRange = function() {
    return this._lines;
}
/** @override */
StudyThreeLineBreak.prototype.draw = function() {
    // draw the three line break code in here, as shouldn't need to be used elsewhere
    // if you want to move it, put it in the parent (Overlay)
    let c = this._parent._chartCanvas._chart;
    let colourUp = Color.green;
    let colourDown = Color.red;
    this.updateDefaultDataSource();
    Study.prototype.update.call(this);
    let startx = this._parent.getXOffScale(this._series.timeByIndex(0));
    let endx;
    let starty = this._parent.getY(this._series.getByIndex(0));
    let endy;
    this.updateY();
    for (let n = 1; n < this._series.size(); n++) {
        endx = this._parent.getXOffScale(this._series.timeByIndex(n));
        endy = this._parent.getY(this._series.getByIndex(n));
        // check whether the bar is actually onscreen
        if (startx < (c._drawX + c.getDrawGraphWidth()) || endx < (c._drawX + c.getDrawGraphWidth())) {
            if (endy < starty) {
                this._parent._chartCanvas.setFillColor(colourUp);
                this._parent._chartCanvas.fillRectWithAdjust(startx, Math.trunc(endy), endx - startx, Math.trunc(starty - endy));
            } else {
                this._parent._chartCanvas.setFillColor(colourDown);
                this._parent._chartCanvas.fillRectWithAdjust(startx, Math.trunc(starty), endx - startx, Math.trunc(endy-starty));
            }
        }
        startx = endx;
        starty = endy;
    }
}