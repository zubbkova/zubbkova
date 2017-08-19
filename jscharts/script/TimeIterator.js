/**
 * ------------
 * TimeIterator
 * ------------
 * @constructor
 * @param {MasterTimeList} masterTimeList
 * @param {Date|number} start
 * @param {number} steps
 */
function TimeIterator(masterTimeList, start, steps) {
    this._initialCount = 0;
    this._source = masterTimeList;
    this._count = this._initialCount = steps;
    if (typeof start === "object") {
        this._d = new Date(start.getTime());
        this._initialD = new Date(start.getTime());
    }
    else {
        this._d = new Date(start);
        this._initialD = new Date(start);
    }
    this._idx = this._initialIdx = this._source.get(start);
    this._delta = TimeIterator.BACKWARD;
}
/** @static */
TimeIterator.FORWARD = 1;
/** @static */
TimeIterator.BACKWARD = -1;
/** 
 * @static
 * @param {MasterTimeList} t
 * @param {Date|number=} start
 * @param {Date|number=} end
 */
TimeIterator.forwardRangeIterator = function(t, start, end) {
    if (!start || !end)
        return NaN;
    let i = new TimeIterator(t, start, t.count(start, end));
    i._delta = TimeIterator.FORWARD;
    return i;
}
TimeIterator.prototype.reset = function() {
    this._d = new Date(this._initialD.getTime());
    this._idx = this._initialIdx;
    this._count = this._initialCount;
}
TimeIterator.prototype.move = function() {
    if (this._delta === TimeIterator.FORWARD) {
        if (this._idx === this._source.size() - 1) {
            this._source.generateForward(1);
        }
    } else {
        if (this._idx === 0) {
            this._source.generateBack(1);
            this._idx++;
        }
    }
    this._idx += this._delta;
    if (this._d === undefined) {
        this._d = new Date(this._source.getByIndex(this._idx));
    } else {
        this._d.setTime(this._source.getByIndex(this._idx));
    }
    return (--this._count >= 0);
}