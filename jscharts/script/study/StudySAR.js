/**
 * @constructor
 * @extends {Study}
 * @param {Overlay} o
 */
function StudySAR(o) {
    this._series = new Series();
    this._sellIndications = new Series();
    this._buyIndications = new Series();
    Study.call(this, o);
    this._acceleration = 0.02;
    this._maxacc = 0.2;
}
/**
 * Inheriting
 */
StudySAR.prototype = Object.create(Study.prototype);
StudySAR.prototype.constructor = StudySAR;
/** @static */
StudySAR.getItems = function() {
    return [new StudyDialog_StudyEditParameter("acceleration", Language.getString("toolbardialogs_acceleration")),
                new StudyDialog_StudyEditParameter("maxacc", Language.getString("toolbardialogs_maxacc"))];
}
/** 
 * @static
 * @param {Overlay} o
 */
StudySAR.newInstance = function(o) {
    return new StudySAR(o);
}
/** @static */
StudySAR.mnemonic = "SAR";
/** @static */
StudySAR.helpID = 426;
/** @static */
StudySAR.ownOverlay = false;
/** @override */
StudySAR.prototype.setName = function() {
    this._name = Language.getString("study_parabolicsar") + " (" + this._acceleration + "," + this._maxacc + ")";
}
/** @override */
StudySAR.prototype.getParams = function() {
    return "acceleration-" + this._acceleration + ":maxacc-" + this._maxacc;
}
/** @override */
StudySAR.prototype.setParams = function(params) {
    let items = Utils.convertStringParams(params, ":", "-");
    if (items.has("acceleration"))
        this._acceleration = parseFloat(items.get("acceleration"));
    if (items.has("maxacc"))
        this._maxacc = parseFloat(items.get("maxacc"));
    Study.prototype.setParams.call(this, params);
}
/** @override */
StudySAR.prototype.update = function(start, end) {
    this._series.clear();
    this._buyIndications.clear();
    this._sellIndications.clear();
    let i = TimeIterator.forwardRangeIterator(this._parent._chartCanvas._chart.getMasterTimeList(), start, end);
    let high1 = 0; 
    let highest = 0.0;
    let lowest = Number.MAX_SAFE_INTEGER;
    let low1 = Number.MAX_SAFE_INTEGER;
    let sar1 = 0.0;
    let position_long = true;
    let acc = this._acceleration;
    let n = 0;
    let newtrade = true;
    let highVal, lowVal, sar;
    do {
        highVal = this._high.get(i._d);
        lowVal = this._low.get(i._d);
        if (isNaN(highVal) || isNaN(lowVal)) {
            continue;
        }
        if (newtrade) {
            if (highVal > highest)
                highest = highVal;
            if (lowVal < lowest)
                lowest = lowVal;
            if (position_long) {
                sar1 = sar = lowest;
                this._buyIndications.append(i._d, sar);
            } else {
                sar1 = sar = highest;
                this._sellIndications.append(i._d, sar);
            }
            highest = highVal;
            lowest = lowVal;
            acc = this._acceleration;
            newtrade = false;
            this._series.append(i._d, sar);
            high1 = highVal;
            low1 = lowVal;
            n++;
            continue;
        }
        if (position_long) {
            // SAR when long
            sar = (high1 - sar1) * acc + sar1;
            if (highVal > highest) {
                // New high so accelerate up to maxacc
                highest = highVal;
                if (acc < this._maxacc) {
                    acc += this._acceleration;
                }
            }
            if (sar >= lowVal || sar >= low1) {
                position_long = false;
                this._series.append(i._d, NaN);
                newtrade = true;
            } else {
                this._series.append(i._d, sar);
            }
        } else {
            //   SAR when short		
            sar = sar1 - (sar1 - lowVal) * acc;
            if (lowVal < lowest) {
                // New high so accelerate up to maxacc
                lowest = lowVal;
                if (acc < this._maxacc) {
                    acc += this._acceleration;
                }
            }
            if (sar <= highVal || sar <= high1) {
                position_long = true;
                this._series.append(i._d, NaN);
                newtrade = true;
            } else {
                this._series.append(i._d, sar);
            }
        }
        sar1 = sar;
        high1 = highVal;
        low1 = lowVal;
        this._buyIndications.append(i._d, NaN); // NaN means no indication
        this._sellIndications.append(i._d, NaN);
        n++;
    } while (i.move());
}
/** @override */
StudySAR.prototype.draw = function() {
    this.updateY();
    this._parent.drawSymbols(this._series, new Color(64, 64, 255), StudySymbol.DOT);
    this._parent.drawSymbols(this._buyIndications, this._colour, StudySymbol.BUY);
    this._parent.drawSymbols(this._sellIndications, this._colour, StudySymbol.SELL);
}