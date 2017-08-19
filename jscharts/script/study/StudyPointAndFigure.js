/**
 * Point and Figure
 * An implementation of Point and Figure charts as a streaming chart study
 * Implementation reference:  http://www.stockcharts.com/support/pnfCharts.html
 * @author davidw
 * @constructor
 * @extends {Study}
 * @param {Overlay} o
 */
function StudyPointAndFigure(o) {
    /**
     * List of Column objects.
     */
    this._columns = [];
    this._currentFrequency = -1;
    Study.call(this, o);
    /**
     * The size of a box. 
     */
    this._boxSize = 0;
    /**
     * The number of multiples of the box size the price has to change by
     * in order to change the direction.
     */
    this._reversal = 3;
}
/**
 * Inheriting
 */
StudyPointAndFigure.prototype = Object.create(Study.prototype);
StudyPointAndFigure.prototype.constructor = StudyPointAndFigure;
/** 
 * @static
 * @param {Overlay} o
 */
StudyPointAndFigure.newInstance = function(o) {
    return new StudyPointAndFigure(o);
}
/** @static */
StudyPointAndFigure.mnemonic = "PointAndFigure";
/** @static */
StudyPointAndFigure.helpID = 1794;
/** @static */
StudyPointAndFigure.ownOverlay = false;
/** @static */
StudyPointAndFigure.getItems = function() {
    return [new StudyDialog_StudyEditParameter("boxSize", Language.getString("toolbardialogs_boxsize")), new StudyDialog_StudyEditParameter("reversal", Language.getString("toolbardialogs_reversal")), new StudyDialog_StudyButton("recalcboxsize", "Recalc box size")];
}
/**
 * @param {number} value
 */
StudyPointAndFigure.prototype.roundDownwardsToBoxSize = function(value) {
    let temp = Math.floor(value / this._boxSize);
    return temp * this._boxSize;
}
/**
 * @param {number} value
 */
StudyPointAndFigure.prototype.roundUpwardsToBoxSize = function(value) {
    let temp = Math.ceil(value / this._boxSize);
    return temp * this._boxSize;
}
/** @override */
StudyPointAndFigure.prototype.draw = function() {
    this.updateY();
    // Check whether the price range has changed so we need
    // to adjust box size and recalc.
    if (this._boxSize === 0.0 || this._currentFrequency !== this._parent._chartCanvas._chart._currentSymbol.mainFrequency()) {
        let newBoxSize = this.getBoxSize();
        this._currentFrequency = this._parent._chartCanvas._chart._currentSymbol.mainFrequency();
        if (newBoxSize !== this._boxSize) {
            this._boxSize = newBoxSize;
            this.setName();
            if (this._parent._legend)
                this._parent._legend.renameItem(this._legendIndex, this._name);
            Study.prototype.update.call(this);
        }
    }
    if (this._columns.length === 0)
        return;
    let cur = this._columns[0];
    let startX = this._parent.getXOffScale(cur._startDate);
    let endX;
    for (let n = 0; n < this._columns.length; n++) {
        let nextCol = this._columns[n];
        endX = this._parent.getXOffScale(nextCol._startDate);
        cur.drawColumn(startX, endX);
        startX = endX;
        cur = nextCol;
    }
    // draw the last one
    cur = this._columns[this._columns.length - 1];
    endX = this._parent.getXOffScale(this._parent._chartCanvas._chart._currentSymbol._time); 
    cur.drawColumn(startX, endX);
}
/** @override */
StudyPointAndFigure.prototype.getMaxMin = function(i) {
    this._range.reset();
    this._range.getMaxMin(this._high, i);
    this._range.getMaxMin(this._low, i);
}
/**
 * Calculates the range of prices on-screen and then returns an appropriate
 * box size for that range.
 */
StudyPointAndFigure.prototype.getBoxSize = function() {
    let i = XTIterator.reverseScreenIterator(this._parent._chartCanvas._chart);
    let h = Number.MIN_SAFE_INTEGER;
    let l = Number.MAX_SAFE_INTEGER;
    do {
        if (!(isNaN(this._high.get(i._d)) || isNaN(this._low.get(i._d)))) {
            h = Math.max(h, this._high.get(i._d));
            l = Math.min(l, this._low.get(i._d));
        }
    } while (i.move());
    let myRange = h - l;
    let boxSize;
    if (isNaN(myRange))
        boxSize = 0.0;
    else if (myRange <= 0.25)
        boxSize = 0.0625;
    else if (myRange <= 1.0)
        boxSize = 0.125;
    else if (myRange <= 5.0)
        boxSize = 0.25;
    else if (myRange <= 20.0)
        boxSize = 0.5;
    else if (myRange <= 100.0)
        boxSize = 1.0;
    else if (myRange <= 200.0)
        boxSize = 2.0;
    else if (myRange <= 500.0)
        boxSize = 4.0;
    else if (myRange <= 500.0)
        boxSize = 4.0;
    else if (myRange <= 1000.0)
        boxSize = 5.0;
    else if (myRange <= 25000.0)
        boxSize = 50.0;
    else
        boxSize = 500.0;
    return boxSize;
}
/** @override */
StudyPointAndFigure.prototype.update = function(start, end) {
    // todo: fix for now    
    if (parseInt(this._parent._chartCanvas._chart._currentSymbol._lowTarget.getFullYear(), 10) > 2001) {
        this._parent._chartCanvas._chart._currentSymbol._lowTarget.setFullYear(2001);
    }
    //
    let c = this._parent._chartCanvas._chart;
    this._range.reset();
    this._columns = [];
    // start with the first bar, work out whether prices are rising or falling
    let ti = TimeIterator.forwardRangeIterator(c.getMasterTimeList(), start, end);
    while ((isNaN(this._high.get(ti._d)) || isNaN(this._low.get(ti._d))) && ti.move()) {
    }
    let startHigh = this._high.get(ti._d);
    let startLow = this._low.get(ti._d);
    let firstDate = new Date(ti._d.getTime());
    let currentColumn;
    do {
        if (this._high.get(ti._d) > (startHigh + this._boxSize)) {
            currentColumn = new StudyPointAndFigure_Column(firstDate, startLow, this._high.get(ti._d), this);
            break;
        } else if (this._low.get(ti._d) < (startLow - this._boxSize)) {
            currentColumn = new StudyPointAndFigure_Column(firstDate, this._low.get(ti._d), startHigh, this);
            currentColumn._upTrend = false;
            break;
        }
    } while (ti.move());
    if (currentColumn === undefined)
        return;
    ti = TimeIterator.forwardRangeIterator(c.getMasterTimeList(), firstDate, end);
    do {
        let nextCol = currentColumn.addValues(ti._d, this._low.get(ti._d), this._high.get(ti._d));
        if (nextCol) {
            this._columns.push(currentColumn);
            currentColumn = nextCol;
        }
    } while (ti.move());
    // write out the last value?
    this._columns.push(currentColumn);
}
StudyPointAndFigure.prototype.processParameterButtonClick = function() {
    this._boxSize = this.getBoxSize();
    Study.prototype.setParams.call(this, "");
    this._parent._chartCanvas.repaint();
    Study.prototype.update.call(this);
}
/** @override */
StudyPointAndFigure.prototype.setParams = function(params) {
    let items = Utils.convertStringParams(params, ":", "-");
    if (items.has("boxSize"))
        this._boxSize = parseFloat(items.get("boxSize"));
    if (items.has("reversal"))
        this._reversal = parseInt(items.get("reversal"), 10);
    Study.prototype.setParams.call(this, params);
}
/** @override */
StudyPointAndFigure.prototype.getParams = function() {
    return "boxSize-" + this._boxSize + ":reversal-" + this._reversal;
}
/** @override */
StudyPointAndFigure.prototype.setName = function() {
    this._name = Language.getString("study_pointandfigure") + " (" + this._boxSize + "," + this._reversal + ")";
}
/**
 * Class representing a single column of Xs or Os.
 * @author jamess
 * @constructor
 * @param {Date} start
 * @param {number} cl
 * @param {number} ch
 * @param {StudyPointAndFigure} delegate
 */
function StudyPointAndFigure_Column(start, cl, ch, delegate) {
    this._delegate = delegate;
    /**
     * Whether this column is an upwards trend or not.
     */
    this._upTrend = true;
    /**
     * Start date of this column. 
     */
    this._startDate = start;
    /**
     * Low value of the column expressed in boxsize units.
     */
    this._boxLow = this._delegate.roundUpwardsToBoxSize(cl);
    /**
     * High value of the column expressed in boxsize units.
     */
    this._boxHigh = this._delegate.roundDownwardsToBoxSize(ch);
}
/**
 * @param {number} startX
 * @param {number} endX
 */
StudyPointAndFigure_Column.prototype.drawColumn = function(startX, endX) {
    if (this._delegate._boxSize === 0.0)
        return;
    // set up the starting values.
    // note that we always skip the first box, just the way PnF works, so don't be alarmed by that :)
    if (!this._upTrend) {
        this._delegate._parent._chartCanvas.setStrokeColor(Color.red);
        let c = this._boxHigh;
        do {
            let n = c - this._delegate._boxSize;
            let curY = parseInt(this._delegate._parent.getY(c), 10);
            if (isNaN(curY)) curY = 0;
            let nextY = parseInt(this._delegate._parent.getY(n), 10);
            if (isNaN(nextY)) nextY = 0;
//            console.log("oval", startX, curY, endX - startX, nextY - curY);
            this._delegate._parent._chartCanvas.drawOval(startX, curY, endX - startX, nextY - curY);
            c = n;
        } while (c > this._boxLow);
    } else {
        this._delegate._parent._chartCanvas.setStrokeColor(Color.blue);
        let c = this._boxLow;
        do {
            let n = c + this._delegate._boxSize;
            let curY = parseInt(this._delegate._parent.getY(c), 10);
            if (isNaN(curY)) curY = 0;
            let nextY = parseInt(this._delegate._parent.getY(n), 10);
            if (isNaN(nextY)) nextY = 0;
            this._delegate._parent._chartCanvas.drawLineWithAdjust(startX, curY, endX, nextY);
            this._delegate._parent._chartCanvas.drawLineWithAdjust(startX, nextY, endX, curY);
            c = n;
        } while (c < this._boxHigh);
    }
}
/**
 * Add a new price to this column. This checks to see whether we have a new high
 * or low value, and checks to see if a reversal has occurred. If we do get a
 * reversal then it creates a new Column object trending the opposite direction
 * and returns that, otherwise it returns null.
 * @param {Date} cur
 * @param {number} low
 * @param {number} high
 */
StudyPointAndFigure_Column.prototype.addValues = function(cur, low, high) {
    let newLow = this._delegate.roundUpwardsToBoxSize(low);
    let newHigh = this._delegate.roundDownwardsToBoxSize(high);
    if (this._upTrend) {
        if (newHigh > this._boxHigh) {
            this._boxHigh = newHigh;
            return;
        }
        let reversalValue = this._boxHigh - this._delegate._reversal * this._delegate._boxSize;
        if (newLow <= reversalValue) {
            let newCol = new StudyPointAndFigure_Column(new Date(cur.getTime()), newLow, this._boxHigh - this._delegate._boxSize, this._delegate);
            newCol._upTrend = false;
            return newCol;
        }
    } else {
        if (newLow < this._boxLow) {
            this._boxLow = newLow;
//            console.log(this._boxLow);
            return;
        }
        let reversalValue = this._boxLow + this._delegate._reversal * this._delegate._boxSize;
        if (newHigh >= reversalValue) {
            let newCol = new StudyPointAndFigure_Column(new Date(cur.getTime()), this._boxLow + this._delegate._boxSize, newHigh, this._delegate);
            newCol._upTrend = true;
            return newCol;
        }
    }
}