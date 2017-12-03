/* global Series, TimeIterator */
/**
 * ---------
 * MetaStudy
 * ---------
 * this class contains static methods to do common transfromations to Series objects
 * use this to generate series for common chart Studies.
 */
var MetaStudy = new Object();
/**
 * @param {Chart} c
 * @param {Series} source
 * @param {number=} p
 * @param {number=} o
 */
MetaStudy.SMA = function(c, source, p, o) {
    var period = 15;
    if (p)
        period = p;
    var offset = 0;
    if (o)
        offset = o;
    var dest = new Series();
    var start = source.timeStart();
    var end = c._parent._currentSymbol._time;
    var pos = 0, n = 0;
    var buffer = new Array(period);
    dest.clear();
    var i = TimeIterator.forwardRangeIterator(c.getMasterTimeList(), start, end);
    var total = 0.0;
    for (; n < period; i.move()) {
        buffer[n] = source.get(i._d);
        total += buffer[n];
        dest.append(c.timeAdjust(i._d, -offset), total / (++n));
    }
    do {
        var curval = source.get(i._d);
        total -= buffer[pos];
        total += curval;
        buffer[pos] = curval;
        if (++pos == period)
            pos = 0;
        dest.append(c.timeAdjust(i._d, -offset), total / period);
    } while (i.move());
    return dest;
}
/**
 * @param {Chart} c
 * @param {Series} source
 * @param {number=} p
 * @param {number=} o
 */
MetaStudy.EMA = function(c, source, p, o) {
    var period = 15;
    if (p)
        period = p;
    var offset = 0;
    if (o)
        offset = o;
    var dest = new Series();
    var start = source.timeStart();
    var end = c._parent._currentSymbol._time;
    var smooth, total = 0.0, current = 0.0;
    var n = 0;
    dest.clear();
    var i = TimeIterator.forwardRangeIterator(c.getMasterTimeList(), start, end);
    // Use simple average for initial period.
    for (; n < period; i.move()) {
        total += source.get(i._d);
        current = total / (++n);
        dest.append(c.timeAdjust(i._d, -offset), current);
    }
    // Use exp. average for the rest.
    smooth = 2.0 / (1 + period);
    do {
        current = current + smooth * (source.get(i._d) - current);
        dest.append(c.timeAdjust(i._d, -offset), current);
    } while (i.move());
    return dest;
}
/**
 * @param {Chart} c
 * @param {Series} source
 * @param {number=} p
 */
MetaStudy.ROC = function(c, source, p) {
    var period = 15;
    if (p)
        period = p;
    var dest = new Series();
    var start = source.timeStart();
    var end = c._parent._currentSymbol._time;
    var n = 0;
    dest.clear();
    var i = TimeIterator.forwardRangeIterator(c.getMasterTimeList(), start, end);
    for (; n < period; i.move(), n++)
        dest.append(i._d, 0.0);
    do {
        if (source.get(c.timeAdjust(i._d, -period)) !== 0.0) {
            var previous = source.get(c.timeAdjust(i._d, -period));
            dest.append(i._d, 100.0 * (source.get(i._d) - previous) / previous);
        } else {
            dest.append(i._d, 0.0);
        }
    } while (i.move());
    return dest;
}
/**
 * @param {Chart} c
 * @param {Series} source
 * @param {number=} p
 */
MetaStudy.RSI = function(c, source, p) {
    var period = 14;
    if (p)
        period = p;
    var dest = new Series();
    var start = source.timeStart();
    var end = c._parent._currentSymbol._time;
    var n = 0;
    dest.clear();
    var i = TimeIterator.forwardRangeIterator(c.getMasterTimeList(), start, end);
    // Calculate initial RS.
    var avgain = 0.0;
    var avloss = 0.0;
    var last = 0.0;
    var diff;
    for (; n < period; i.move(), n++) {
        var now = source.get(i._d);
        if (last === 0.0) {
            last = now;
            dest.append(i._d, 50.0);
        } else {
            diff = now - last;
            last = now;
            if (diff > 0.0)
                avgain += diff / period;
            else
                avloss -= diff / period;
            dest.append(i._d, 100.0 - 100.0 / (1 + avgain / avloss));
        }
    }
    // Use smoothed RS afterwards.
    do {
        diff = source.get(i._d) - source.get(c.timeAdjust(i._d, -1));
        if (diff > 0.0) {
            avgain = (avgain * (period - 1) + diff) / period;
            avloss = (avloss * (period - 1)) / period;
        } else {
            avgain = (avgain * (period - 1)) / period;
            avloss = (avloss * (period - 1) - diff) / period;
        }
        dest.append(i._d, 100.0 - 100.0 / (1 + avgain / avloss));
    } while (i.move());
    return dest;
}
/**
 * @param {Chart} c
 * @param {Series} source
 * @param {number=} p
 */
MetaStudy.Momentum = function(c, source, p) {
    var period = 15;
    if (p)
        period = p;
    var dest = new Series();
    var start = source.timeStart();
    var end = c._parent._currentSymbol._time;
    var n = 0;
    dest.clear();
    var i = TimeIterator.forwardRangeIterator(c.getMasterTimeList(), start, end);
    for (; n < period; i.move(), n++)
        dest.append(i._d, 0.0);
    do {
        if (source.get(c.timeAdjust(i._d, -period)) != 0.0)
            dest.append(i._d, source.get(i._d) - source.get(c.timeAdjust(i._d, -period)));
    } while (i.move());
    return dest;
}
/**
 * @param {Array} array
 */
MetaStudy.HighestInArray = function(array) {
    var dest = Number.MIN_SAFE_INTEGER;
    for (var i = 0; i < array.length; i++) {
        if (array[i] > dest) 
            dest = array[i];
    }
    return dest;
}
/**
 * @param {Array} array
 */
MetaStudy.LowestInArray = function(array) {
    var dest = Number.MAX_SAFE_INTEGER;
    for (var i = 0; i < array.length; i++) {
        if (array[i] < dest && array[i] > 0) 
            dest = array[i];
    }
    return dest;
}
/**
 * return the highest high within the period specified
 * @param {Chart} c
 * @param {DataSeries} source
 * @param {number} period
 */
MetaStudy.HighestHigh = function(c, source, period) {
    var dest = new Series();
    dest.clear();
    var start = source.timeStart();
    var end = c._parent._currentSymbol._time;
    var pos = 0, n = 0;
    var buffer = new Array(period);
    var i = TimeIterator.forwardRangeIterator(c.getMasterTimeList(), start, end);
    for (; ((n < period) && i.move()); n++) {
        buffer[n] = source.get(i._d);
        dest.append(i._d, MetaStudy.HighestInArray(buffer));
    }
    do {
        buffer[pos] = source.get(i._d);
        // loop through the buffer
        if (++pos === period)
            pos = 0;
        dest.append(i._d, MetaStudy.HighestInArray(buffer));
    } while (i.move());
    return dest;
}
/**
 * return the lowest low within the period specified
 * @param {Chart} c
 * @param {DataSeries} source
 * @param {number} period
 */
MetaStudy.LowestLow = function(c, source, period) {
    var dest = new Series();
    dest.clear();
    var start = source.timeStart();
    var end = c._parent._currentSymbol._time;
    var pos = 0, n = 0;
    var buffer = new Array(period);
    var i = TimeIterator.forwardRangeIterator(c.getMasterTimeList(), start, end);
    for (; (n < period && i.move()); n++) {
        buffer[n] = source.get(i._d);
        dest.append(i._d, MetaStudy.LowestInArray(buffer));
    }
    do {
        buffer[pos] = source.get(i._d);
        // loop through the buffer
        if (++pos === period)
            pos = 0;
        dest.append(i._d, MetaStudy.LowestInArray(buffer));
    } while (i.move());
    return dest;
}
/**
 * For each element in the two series, return the average of the two points.
 * This assumes the series cover the same time ranges.
 * @param {Chart} c
 * @param {DataSeries} s1
 * @param {DataSeries} s2
 */
MetaStudy.averageSeriesTwo = function(c, s1, s2) {
    var dest = new Series();
    dest.clear();
    var start = s1.timeStart();
    var end = c._parent._currentSymbol._time;
    var i = TimeIterator.forwardRangeIterator(c.getMasterTimeList(), start, end);
    do {
        // basic check to ensure we don't process on no data
        if (s1.get(i._d) === 0) {
            dest.append(i._d, s2.get(i._d));
        } else if (s2.get(i._d) === 0) {
            dest.append(i._d, s1.get(i._d));
        } else {
            // proper average
            dest.append(i._d, (s1.get(i._d) + s2.get(i._d)) / 2);
        }
    } while(i.move());
    return dest;
}
/**
 * For each element in the three series, return the average of the three points.
 * This assumes the series cover the same time ranges and that their values are greater than zero.
 * @param {Chart} c
 * @param {DataSeries} s1
 * @param {DataSeries} s2
 * @param {DataSeries} s3
 */
MetaStudy.averageSeries = function(c, s1, s2, s3) {
    var dest = new Series();
    dest.clear();
    var start = s1.timeStart();
    var end = c._parent._currentSymbol._time;
    var i = TimeIterator.forwardRangeIterator(c.getMasterTimeList(), start, end);
    do {
        var total = 0;
        var number = 0;
        if (s1.get(i._d) > 0) {
            total += s1.get(i._d);
            number++;
        }
        if (s2.get(i._d) > 0) {
            total += s2.get(i._d);
            number++;
        }
        if (s3.get(i._d) > 0) {
            total += s3.get(i._d);
            number++;
        }
        if (number > 0) {
            dest.append(i._d, total / number);
        }
    } while(i.move());
    return dest;
}
/**
 * For each element in the two series, return the sum of the two points.
 * This assumes the series cover the same time ranges.
 * @param {Chart} c
 * @param {DataSeries} s1
 * @param {DataSeries} s2
 */
MetaStudy.sumSeries = function(c, s1, s2) {
    var dest = new Series();
    dest.clear();
    var start = s1.timeStart();
    var end = c._parent._currentSymbol._time;
    var i = TimeIterator.forwardRangeIterator(c.getMasterTimeList(), start, end);
    do {
        dest.append(i._d, (s1.get(i._d) + s2.get(i._d)));
    } while(i.move());
    return dest;
}
/**
 * Add a specific value to a series.  Useful for detrending/offsetting.
 * @param {Chart} c
 * @param {DataSeries} s
 * @param {number} val
 */
MetaStudy.addValueToSeries = function(c, s, val) {
    var dest = new Series();
    dest.clear();
    var start = s.timeStart();
    var end = c._parent._currentSymbol._time;
    var i = TimeIterator.forwardRangeIterator(c.getMasterTimeList(), start, end);
    do {
        dest.append(i._d, (s.get(i._d) + val));
    } while(i.move());
    return dest;
}
/**
 * Multiply each element in a series by a specific value.  Useful for detrending/offsetting.
 * @param {Chart} c
 * @param {DataSeries} s
 * @param {number} val
 */
MetaStudy.multipleSeriesByValue = function(c, s, val) {
   var dest = new Series();
    dest.clear();
    var start = s.timeStart();
    var end = c._parent._currentSymbol._time;
    var i = TimeIterator.forwardRangeIterator(c.getMasterTimeList(), start, end);
    do {
        dest.append(i._d, (s.get(i._d) * val));
    } while(i.move());
    return dest; 
}
/**
 * Divide each element in a series by a specific value.  Useful for detrending/offsetting.
 * @param {Chart} c
 * @param {DataSeries} s
 * @param {number} val
 */
MetaStudy.divideSeriesByValue = function(c, s, val) {
    var dest = new Series();
    dest.clear();
    var start = s.timeStart();
    var end = c._parent._currentSymbol._time;
    var i = TimeIterator.forwardRangeIterator(c.getMasterTimeList(), start, end);
    if (!isNaN(val) && val != 0.0) {
        do {
            dest.append(i._d, (s.get(i._d) / val));
        } while(i.move());
    }   
    return dest;
}
/**
 * For each element in the two series, return the first minus the second series' elements.
 * This assumes the series cover the same time ranges.
 * @param {Chart} c
 * @param {DataSeries} s1
 * @param {DataSeries} s2
 */
MetaStudy.subtractSeries = function(c, s1, s2) {
    var dest = new Series();
    dest.clear();
    var start = s1.timeStart();
    var end = c._parent._currentSymbol._time;
    var i = TimeIterator.forwardRangeIterator(c.getMasterTimeList(), start, end);
    do {
        dest.append(i._d, (s1.get(i._d) - s2.get(i._d)));
    } while(i.move());
    return dest;
}
/**
 * For each element in the two series, return the product of the two points.
 * This assumes the series cover the same time ranges.
 * @param {Chart} c
 * @param {DataSeries} s1
 * @param {DataSeries} s2
 */
MetaStudy.multiplySeries = function(c, s1, s2) {
    var dest = new Series();
    dest.clear();
    var start = s1.timeStart();
    var end = c._parent._currentSymbol._time;
    var i = TimeIterator.forwardRangeIterator(c.getMasterTimeList(), start, end);
    do {
        if (!isNaN(s1.get(i._d)) && !isNaN(s2.get(i._d)))
            dest.append(i._d, (s1.get(i._d) * s2.get(i._d)));
    } while(i.move());
    return dest;
}
/**
 * For each element in the two series, return the value of the first divided by the second..
 * This assumes the series cover the same time ranges.
 * @param {Chart} c
 * @param {DataSeries} s1
 * @param {DataSeries} s2
 */
MetaStudy.divideSeries = function(c, s1, s2) {
    var dest = new Series();
    dest.clear();
    var start = s1.timeStart();
    var end = c._parent._currentSymbol._time;
    var i = TimeIterator.forwardRangeIterator(c.getMasterTimeList(), start, end);
    do {
        if (!isNaN(s1.get(i._d)) && !isNaN(s2.get(i._d)) && s2.get(i._d) != 0.0)
            dest.append(i._d, (s1.get(i._d) / s2.get(i._d)));
    } while(i.move());
    return dest;
}
/**
 * For each element in the two series, return the ratio of the two points as a percentage
 * ie 100 * s1 / s2
 * This assumes the series cover the same time ranges.
 * @param {Chart} c
 * @param {DataSeries} s1
 * @param {DataSeries} s2
 */
MetaStudy.percentageRatioSeries = function(c, s1, s2) {
    var dest = new Series();
    dest.clear();
    var start = s1.timeStart();
    var end = c._parent._currentSymbol._time;
    var i = TimeIterator.forwardRangeIterator(c.getMasterTimeList(), start, end);
    do {
        if (s2.get(i._d) === 0) {
            dest.append(i._d, 0);
        } else {
            dest.append(i._d, (100 * (s1.get(i._d)) / s2.get(i._d)));
        }
    } while(i.move());  
    return dest;
}
/**
 * Offset a series by a set number of periods.
 * Negative values in the offset shift it forward in time, positive back in time  
 * I guess previous comment is completely wrong, for my test this is the opposite, negative values shift back in time, positive forward in time (carlov)
 * @param {Chart} c
 * @param {Series} source
 * @param {number} offset
 */
MetaStudy.offsetSeries = function(c, source, offset) {
    var dest = new Series();
    var start = source.timeStart();
    var end = c._parent._currentSymbol._time;
    var i = TimeIterator.forwardRangeIterator(c.getMasterTimeList(), start, end);
    do {
        dest.append(c.timeAdjust(i._d, -offset), source.get(i._d));
    } while(i.move());
    return dest;
}
/**
 * Return absolute value of each entry in a series.
 * @param {Chart} c
 * @param {Series} source
 */
MetaStudy.absoluteValueSeries = function(c, source) {
    var dest = new Series();
    var start = source.timeStart();
    var end = c._parent._currentSymbol._time;
    var i = TimeIterator.forwardRangeIterator(c.getMasterTimeList(), start, end);
    do {
        dest.append(i._d, Math.abs(source.get(i._d)));
    } while(i.move());
    return dest;
}
/**
 * Return the difference between each value in the series and the last value in it
 * eg (1, 2, 4, 1) gives (0, 1, 2, -3) 
 * @param {Chart} c
 * @param {Series} source
 */
MetaStudy.deltaSeries = function(c, source) {
    var dest = new Series();
    var start = source.timeStart();
    var end = c._parent._currentSymbol._time;
    var i = TimeIterator.forwardRangeIterator(c.getMasterTimeList(), start, end);
    var loop = 0;
    var oldValue = 0;
    do {
        if (loop === 0) {
            // special case for first time in
            dest.append(i._d, 0);
        } else {
            dest.append(i._d, source.get(i._d) - oldValue);
        }
        loop++;
        oldValue = source.get(i._d);
    }
    while(i.move());
    return dest;
}
/**
 * Return the standard deviation at each point.
 * @param {Chart} c
 * @param {Series} source
 * @param {Series} means
 * @param {number=} period
 */
MetaStudy.stdDeviationSeries = function(c, source, means, period) {
    var dest = new Series();
    var start = source.timeStart();
    var end = c._parent._currentSymbol._time;
    var i = TimeIterator.forwardRangeIterator(c.getMasterTimeList(), start, end);
    var n = 0;
    for (; n < period; i.move()) {
        dest.append(i._d, Math.sqrt(Math.pow(source.get(i._d) - means.get(i._d), 2)/ (++n)));
    }
    do {
        dest.append(i._d, Math.sqrt(Math.pow(source.get(i._d) - means.get(i._d), 2) / period));
    } while (i.move());
    return dest;
}
/** 
 * Return the sum of all the values in a series that are visible on screen
 * Used by Linear Regression study
 * @param {Chart} c
 * @param {Series} s
 */
MetaStudy.sumValuesInSeries = function(c, s) {
    var out = 0;
    var start = c._parent._currentSymbol._timeStart;
    var end = c._parent._currentSymbol._time;
    if (isNaN(s.get(start))) 
        start = s.timeStart();
    var i = TimeIterator.forwardRangeIterator(c.getMasterTimeList(), start, end);
    do {
        out += s.get(i._d);
    } while (i.move());
    return out;
}
/** 
 * Return the sum of all the squares of the values in a series that are visible on screen
 * needed for linear regression study
 * @param {Chart} c
 * @param {Series} s
 */
MetaStudy.sumSquareValuesInSeries = function(c, s) {
    var out = 0;
    var start = c._parent._currentSymbol._timeStart;
    var end = c._parent._currentSymbol._time;
    if (isNaN(s.get(start))) 
        start = s.timeStart();
    var i = TimeIterator.forwardRangeIterator(c.getMasterTimeList(), start, end);
    do {
        out += s.get(i._d) * s.get(i._d);
    } while (i.move());
    return out;
}
/**
 * Calculate and return the linear regression of a set of data
 * Take the data and calculate the linear regression of this data
 * Then apply this to the visible data and return a series that  reflects this (can just be two points?)
 * Now calculates all points in the series.
 * @param {Chart} c
 * @param {Series} source
 */
MetaStudy.linearRegression = function(c, source) {
    var out = new Series();
    // Series for maintaining a "count" on the X axis, to avoid using dates
    var x = new Series();
    var start = c._parent._currentSymbol._timeStart;
    var end = c._parent._currentSymbol._time;
    if (isNaN(source.get(start))) 
        start =  source.timeStart();
    // calculate mean value of x and y axes, and populate x axis from count.
    var mean_x = 0, mean_y = 0;
    var count = 0;
    var i = TimeIterator.forwardRangeIterator(c.getMasterTimeList(), start, end);
    do {
        if (!isNaN(source.get(i._d)) || source.get(i._d) <= 0.0) {
            count++;
            x.append(i._d, count);
            mean_x += count;
            mean_y += source.get(i._d);
        }
    } while(i.move());
    if (count !== 0) {
        mean_x /= count;
        mean_y /= count;
    }
    var a = 0, b = 0;
    if (count !== 0) {
        var sum_xx = MetaStudy.sumSquareValuesInSeries(c, x);
        var sum_xy = MetaStudy.sumValuesInSeries(c, MetaStudy.multiplySeries(c, x, source));
        var Sxy = sum_xy - (mean_x * mean_y * count);
        var Sxx = sum_xx-((mean_x * mean_x) * count);
        b = Sxy / Sxx;
        a = mean_y - (b * mean_x);
    }
    // apply regression to x values
    i = TimeIterator.forwardRangeIterator(c.getMasterTimeList(), start, end);
    do {
        out.append(i._d, (x.get(i._d) * b) + a);
    } while(i.move());
    return out;
}
/**
 * Calculate the bollinger bandwidth value across the series, given the period and number of std deviations (usually 2)
 * @param {Chart} c
 * @param {Series} source
 * @param {number} period
 * @param {number} dev
 */
MetaStudy.bollingerBandWidth = function(c, source, period, dev) {
    var out = new Series();
    var pos = 0, n = 0;
    var buffer = new Array(period);
    var start = c._parent._currentSymbol._timeStart;
    var end = c._parent._currentSymbol._time;
    if (isNaN(source.get(start))) 
        start = source.timeStart();
    var i = TimeIterator.forwardRangeIterator(c.getMasterTimeList(), start, end);
    var total = 0.0;
    for (; n < period; i.move(), n++) {
        buffer[n] = source.get(i._d);
        total += buffer[n];
    }
    var current, stddev;
    do {
        current = source.get(i._d);
        total -= buffer[pos];
        total += current;
        buffer[pos] = current;
        if (++pos === period)
            pos = 0;
        var av = total / period;
        stddev = 0.0;
        for (var j = 0; j < period; j++) {
            var diff = buffer[j] - av;
            stddev += diff * diff;
        }
        stddev = Math.sqrt(stddev / period) * dev;
        // multiply the stddev by 2 as that's what we're interested in
        out.append(i._d, stddev * 2);
    } while(i.move());
    return out;
}
/**
 * Return just the integer part of each value eg 2.3 -> 2, 2.7 -> 2
 * @param {Chart} c
 * @param {Series} s
 */
MetaStudy.integerPart = function(c, s) {
    var dest = new Series();
    dest.clear();
    var start = s.timeStart();
    var end = c._parent._currentSymbol._time;
    var i = TimeIterator.forwardRangeIterator(c.getMasterTimeList(), start, end);
    do {
        dest.append(i._d, parseInt(s.get(i._d), 10)); // typecasting always rounds down
    } while(i.move());
    return dest;
}
/**
 * Return the highest value from each series given, per time period.
 * @param {Chart} c
 * @param {DataSeries} s1
 * @param {DataSeries} s2
 */
MetaStudy.maximum = function(c, s1, s2) {
    var dest = new Series();
    dest.clear();
    var start = s1.timeStart();
    var end = c._parent._currentSymbol._time;
    var i = TimeIterator.forwardRangeIterator(c.getMasterTimeList(), start, end);
    do {
        if (!isNaN(s1.get(i._d)) && !isNaN(s2.get(i._d)))
            dest.append(i._d, Math.max(s1.get(i._d), s2.get(i._d)));		
    } while(i.move());
    return dest;
}
/**
 * Return the lowest value from each series given, per time period.
 * @param {Chart} c
 * @param {DataSeries} s1
 * @param {DataSeries} s2
 */
MetaStudy.minimum = function(c, s1, s2) {
    var dest = new Series();
    dest.clear();
    var start = s1.timeStart();
    var end = c._parent._currentSymbol._time;
    var i = TimeIterator.forwardRangeIterator(c.getMasterTimeList(), start, end);
    do {
        if (!isNaN(s1.get(i._d)) && !isNaN(s2.get(i._d)))
            dest.append(i._d, Math.min(s1.get(i._d), s2.get(i._d)));		
    } while(i.move());
    return dest;
}