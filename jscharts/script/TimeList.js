/**
 * --------
 * TimeList
 * --------
 * @constructor
 */
function TimeList() {
    this._size = 0;
    this._has = false; 
    this._limitSerialise = false;
    this._lastTime = 0;
    this._lastIndex = 0;
    this.clear();
}
/** @static */
TimeList.CAPACITY_INCREMENT = 50;
/** @static */
TimeList.MARKET_SPECIAL_BEHAVIOUR = {'FX': new ForexBehaviour(), 'COM': new CommoditiesBehaviour(), 'NYM': new CommoditiesBehaviour()}
TimeList.prototype.copy = function() {
    let s = new TimeList();
    s._data = new Array(this._data.length);
    s._lastTime = this._lastTime;
    s._lastIndex = this._lastIndex;
    s._size = this._size;
    return s;
}
TimeList.prototype.clear = function() {
    this._data = [];
    this._lastTime = 0;
    this._lastIndex = 0;
    this._size = 0;
    this._has = false;
}
TimeList.prototype.destroy = function() {
    this._data = undefined;
}
TimeList.prototype.size = function() {
    return this._size;
}
/** 
 * @param {number} index 
 */
TimeList.prototype.getByIndex = function(index) {
    return this._data[index >= 0 ? index : this._size + index];
}
/**
 * @param {number|Date} d 
 */
TimeList.prototype.set = function(d) {
    let time = d;
    if (d.constructor.name === "Date") {
        time = d.getTime();
    }
    let index = this.get(time);
    if (this._has)
        return index;
    this._lastIndex = ++index;
    let capacity = this._data.length;
    if (index >= this._size) {
        if (this._size + 1 >= capacity) {
            this._data.push(new Array(TimeList.CAPACITY_INCREMENT));
        }
        this._data[this._size++] = time;
        return index;
    }
    if (this._size + 1 >= capacity) {
        // 1 2 3 4 5
        // index = 3
        // 1 2 3 x 4 5
        this._data.splice(index, 0, time);
        this._data.push(new Array(TimeList.CAPACITY_INCREMENT - 1));
        this._size++;
        return index;
    }
    // 1 2 3 (4 5)
    // index = 3
    // 1 2 3 x (4 5)
    this._data.splice(index, 0, time);
    this._size++;
    return index;
}
/** 
 * @param {number|Date} d 
 */
TimeList.prototype.get = function(d) {
    let time = d;
    if (typeof d === "object") {
        time = d.getTime();
    }
    if (this._lastTime === time) 
        return this._lastIndex;
    this._has = false;
    if (this._size === 0 || time < this._data[0]) 
        return -1;
    let mid = this._size - 1;
    let curDate = this._data[mid];
    if (time >= curDate) {
        this._has = (curDate === time);
        return mid;
    }
    let high = this._size;
    let low = 0;
    // my version
    while (true) {
        mid = Math.trunc((high - low) / 2) + low;
        curDate = this._data[mid];
        if (time === curDate) {
            this._has = true;
            return mid;
        }
        if (high - low <= 1) {
            if (this._data[low] === time) {
                this._has = true;
                return low;
            }
            if (this._data[high] === time) {
                this._has = true;
                return high;
            }
            this._has = true;
            return low;
        }
        if (time > curDate) {
            low = mid;
        } else {
            high = mid;
        }
    }
    //
}
/** 
 * @param {number|Date} start 
 * @param {number|Date} end 
 */
TimeList.prototype.count = function(start, end) {
    let startIdx = this.get(start);
    let endIdx = this.get(end);
    return Math.abs(endIdx - startIdx);
}
/** 
 * @param {number|Date} start 
 * @param {number|Date} end 
 */
TimeList.prototype.countBack = function(start, end) {
    let startIdx = this.get(start);
    let endIdx = this.get(end);
    return endIdx - startIdx;
}
TimeList.prototype.toString = function() {
    let max = this._size - 1;
    let buf = '[';
    for (let i = 0; i <= max; i++) {
        buf += new Date(this._data[i]).toString();
        if (i < max) buf += ', ';
    }
    buf += ']';
    return buf;
}