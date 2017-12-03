/* global PriceDataConstants, Calendar */
/**
 * -------------
 * LabelIterator
 * -------------
 * @constructor
 * @param {Chart} p
 * @param {boolean} m - is major
 */
function LabelIterator(p, m) {
    this._major = m;
    this._parent = p;
    this._symbolSet = p._currentSymbol;
    this._market = this._symbolSet.mainSymbol().split("^")[0];
    this._firstOfWeek = p._parent._loader.getMasterTimeList(this._symbolSet.mainSymbol(), PriceDataConstants.FREQUENCY_W);
    this._firstOfMonth = this._parent._parent._loader.getMasterTimeList(this._symbolSet.mainSymbol(), PriceDataConstants.FREQUENCY_M);
    this._firstOfYear = this._parent._parent._loader.getMasterTimeList(this._symbolSet.mainSymbol(), PriceDataConstants.FREQUENCY_Y);
    this._idx = 0;
    if (this._major) {
        if (this._symbolSet._currentLabelScale <= LabelIterator.L_1YEAR) {
            return;
        } else if (this._symbolSet._currentLabelScale <= LabelIterator.L_1MONTH) {
            this._idx = this._firstOfYear.get(this._symbolSet._timeStart);
            this._d = new Date(this._firstOfYear.getByIndex(this._idx));
        } else if (this._symbolSet._currentLabelScale <= LabelIterator.L_1DAY) {
            this._idx = this._firstOfMonth.get(this._symbolSet._timeStart);
            this._d = new Date(this._firstOfMonth.getByIndex(this._idx));
        } else {
            this._mtl = this._symbolSet.getDailyMasterTimeList();
            this._idx = this._mtl.get(this._mtl.moveBackToStartOfDay(this._symbolSet._timeStart));
            this._d = new Date(this._mtl.getByIndex(this._idx));
            if (this._market === "FX" || this._market === "FX2") {
                this.adjustForFOREX(this._d);
            }
        }
    } else {
        var monthOffset;
        switch (this._symbolSet._currentLabelScale) {
            case LabelIterator.L_5YEARS:
                this._idx = parseInt(this._firstOfYear.get(this._symbolSet._timeStart) / 5, 10) * 5;
                this._d = new Date(this._firstOfYear.getByIndex(this._idx));
                break;
            case LabelIterator.L_2YEARS:
                this._idx = parseInt(this._firstOfYear.get(this._symbolSet._timeStart) / 2, 10) * 2;
                this._d = new Date(this._firstOfYear.getByIndex(this._idx));
                break;
            case LabelIterator.L_1YEAR:
                this._idx = this._firstOfYear.get(this._symbolSet._timeStart);
                this._d = new Date(this._firstOfYear.getByIndex(this._idx));
                break;
            case LabelIterator.L_6MONTHS:
                LabelIterator.cal.setTime(new Date(this._firstOfMonth.getByIndex(0)));
                monthOffset = LabelIterator.cal.get(Calendar.MONTH) % 6;
                this._idx = parseInt((this._firstOfMonth.get(this._symbolSet._timeStart) + monthOffset) / 6, 10) * 6 - monthOffset;
                this._d = new Date(this._firstOfMonth.getByIndex(this._idx));
                break;
            case LabelIterator.L_3MONTHS:
                LabelIterator.cal.setTime(new Date(this._firstOfMonth.getByIndex(0)));
                monthOffset = LabelIterator.cal.get(Calendar.MONTH) % 3;
                this._idx = parseInt((this._firstOfMonth.get(this._symbolSet._timeStart) + monthOffset) / 3, 10) * 3 - monthOffset;
                this._d = new Date(this._firstOfMonth.getByIndex(this._idx));
                break;
            case LabelIterator.L_2MONTHS:
                LabelIterator.cal.setTime(new Date(this._firstOfMonth.getByIndex(0)));
                monthOffset = LabelIterator.cal.get(Calendar.MONTH) % 2;
                this._idx = parseInt((this._firstOfMonth.get(this._symbolSet._timeStart) + monthOffset) / 2, 10) * 2 - monthOffset;
                this._d = new Date(this._firstOfMonth.getByIndex(this._idx));
                break;
            case LabelIterator.L_1MONTH:
                this._idx = this._firstOfMonth.get(this._symbolSet._timeStart);
                this._d = new Date(this._firstOfMonth.getByIndex(this._idx));
                break;
            case LabelIterator.L_2WEEKS:
            case LabelIterator.L_1WEEK:
                this._idx = parseInt(this._firstOfWeek.get(this._symbolSet._timeStart) / 2, 10) * 2;
                this._d = new Date(this._firstOfWeek.getByIndex(this._idx));
                break;
            case LabelIterator.L_2DAYS:
            case LabelIterator.L_1DAY:
                this._mtl = this._symbolSet.getDailyMasterTimeList();
                this._idx = this._mtl.get(this._symbolSet._timeStart);
                this._d = new Date(this._mtl.getByIndex(this._idx));
                break;
            default:
                this._mtl = this._symbolSet.getIntraMasterTimeList();
                var foo = this._mtl.moveBackToStartOfDay(this._symbolSet._timeStart);
                this._idx = this._mtl.get(foo);
                if (this._idx < 0) {
                    this._mtl.generateBackTo(foo);
                    this._idx = this._mtl.get(foo);
                }
                if (foo.getTime() !== this._mtl.getByIndex(this._idx)) {
                    this._idx++;
                }
                this._d = new Date(this._mtl.getByIndex(this._idx));
                this._endOfDay = this._mtl.moveForwardToEndOfDay(this._d);
                break;
        }
    }
    this._x = p._mainOverlay.getX(this._d);
}
LabelIterator.prototype.valid = function() {
    if (this._major && this._symbolSet._currentLabelScale <= LabelIterator.L_1YEAR) 
        return false;
    return (this._d < this._symbolSet._timeEnd);
}
LabelIterator.prototype.next = function() {
    if (this._major) {
        if (this._symbolSet._currentLabelScale <= LabelIterator.L_1MONTH) {
            this._d = new Date(this._firstOfYear.getByIndex(++this._idx));
        } else if (this._symbolSet._currentLabelScale <= LabelIterator.L_1DAY) {
            this._d = new Date(this._firstOfMonth.getByIndex(++this._idx));
        } else {
            this._d = new Date(this._mtl.getByIndex(++this._idx));
            if (this._market === "FX" || this._market === "FX2") {
                this.adjustForFOREX(this._d);
            }
        }
        if (this._symbolSet.getDailyMasterTimeList().isWeekendOrHoliday(this._d.getTime())) {
            this._d = this._symbolSet.getDailyMasterTimeList().moveToMarketOpenOfNextDay(this._d);
        }
    } else {
        this._idx += LabelIterator.delta[this._symbolSet._currentLabelScale];
        if (this._symbolSet._currentLabelScale <= LabelIterator.L_1YEAR) {
            this._d = new Date(this._firstOfYear.getByIndex(this._idx));
            if (this._symbolSet.getDailyMasterTimeList().isWeekendOrHoliday(this._d.getTime())) {
                this._d = this._symbolSet.getDailyMasterTimeList().moveToMarketOpenOfNextDay(this._d);
            }
        } else if (this._symbolSet._currentLabelScale <= LabelIterator.L_1MONTH) {
            this._d = new Date(this._firstOfMonth.getByIndex(this._idx));
            if (this._symbolSet.getDailyMasterTimeList().isWeekendOrHoliday(this._d.getTime())) {
                this._d = this._symbolSet.getDailyMasterTimeList().moveToMarketOpenOfNextDay(this._d);
            }
        } else if (this._symbolSet._currentLabelScale <= LabelIterator.L_1WEEK) {
            this._d = new Date(this._firstOfWeek.getByIndex(this._idx));
            if (this._symbolSet.getDailyMasterTimeList().isWeekendOrHoliday(this._d.getTime())) {
                this._d = this._symbolSet.getDailyMasterTimeList().moveToMarketOpenOfNextDay(this._d);
            }
        } else if (this._symbolSet._currentLabelScale <= LabelIterator.L_1DAY) {
            this._d = new Date(this._mtl.getByIndex(this._idx));
        } else {
            if (this._idx >= this._mtl.size()) {
                this._mtl.generateForward(LabelIterator.delta[this._symbolSet._currentLabelScale]);
            }
            this._d = new Date(this._mtl.getByIndex(this._idx));
            if (this._d > this._endOfDay) {
                this._d = this._mtl.moveBackToStartOfDay(this._d);
                this._idx = this._mtl.get(this._d);
                if (this._d.getTime() !== this._mtl.getByIndex(this._idx)) {
                    this._idx++;
                }
                this._endOfDay = this._mtl.moveForwardToEndOfDay(this._d);
            }
        }
    }
    this._x = this._parent._mainOverlay.getX(this._d);
}
/**
 * @param {Date} dd
 */
LabelIterator.prototype.adjustForFOREX = function(dd) {
    LabelIterator.cal.setTime(dd);
    dd.setTime(dd.getTime() - LabelIterator.cal.get(Calendar.ZONE_OFFSET));
}
/** @static */
LabelIterator.L_5YEARS = 0;
/** @static */
LabelIterator.L_2YEARS = 1;
/** @static */
LabelIterator.L_1YEAR = 2;
/** @static */
LabelIterator.L_6MONTHS = 3;
/** @static */
LabelIterator.L_3MONTHS = 4;
/** @static */
LabelIterator.L_2MONTHS = 5;
/** @static */
LabelIterator.L_1MONTH = 6;
/** @static */
LabelIterator.L_2WEEKS = 7;
/** @static */
LabelIterator.L_1WEEK = 8;
/** @static */
LabelIterator.L_2DAYS = 9;
/** @static */
LabelIterator.L_1DAY = 10;
/** @static */
LabelIterator.L_4HOURS = 11;
/** @static */
LabelIterator.L_2HOURS = 12;
/** @static */
LabelIterator.L_1HOUR = 13;
/** @static */
LabelIterator.L_30MINS = 14;
/** @static */
LabelIterator.L_15MINS = 15;
/** @static */
LabelIterator.L_10MINS = 16;
/** @static */
LabelIterator.L_5MINS = 17;
/** @static */
LabelIterator.L_1MIN = 18;
/** @static */
LabelIterator.basicLabelScale = [15, 14, 13, 12, 12, 11, 8, 6, 3, 1, 0];
/** @static */
LabelIterator.delta = [5, 2, 1, 6, 3, 2, 1, 2, 1, 2, 1, 240, 120, 60, 30, 15, 10, 5, 1];
/** @static */
LabelIterator.cal = Calendar.getInstance();