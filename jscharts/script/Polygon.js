/* global Integer, Rectangle, Point */
/**
 * -------
 * Polygon
 * -------
 * @constructor
 */
function Polygon() {
    this._xpoints = new Array(Polygon.MIN_LENGTH);
    this._ypoints = new Array(Polygon.MIN_LENGTH);
    this._npoints = 0;
}
/** @static */
Polygon.MIN_LENGTH = 4;
/**
 * @param {number} x
 * @param {number} y
 */
Polygon.prototype.addPoint = function(x, y) {
    if (this._npoints >= this._xpoints.length || this._npoints >= this._ypoints.length) {
        var newLength = this._npoints * 2;
        // Make sure that newLength will be greater than MIN_LENGTH and
        // aligned to the power of 2
        if (newLength < Polygon.MIN_LENGTH) {
            newLength = Polygon.MIN_LENGTH;
        } else if ((newLength & (newLength - 1)) != 0) {
            newLength = Integer.highestOneBit(newLength);
        }
        this._xpoints = this._xpoints.slice(0, newLength);
        this._ypoints = this._ypoints.slice(0, newLength)
    }
    this._xpoints[this._npoints] = x;
    this._ypoints[this._npoints] = y;
    this._npoints++;
}
/**
 * @param {Point} p
 */
Polygon.prototype.contains = function(p) {
    return this.inside(p._x, p._y);
}
/**
 * @param {Array} xps
 * @param {Array} yps
 * @param {number} nps
 */
Polygon.prototype.calculateBounds = function(xps, yps, nps) {
    var boundsMinX = Number.MAX_SAFE_INTEGER;
    var boundsMinY = Number.MAX_SAFE_INTEGER;
    var boundsMaxX = Number.MIN_SAFE_INTEGER;
    var boundsMaxY = Number.MIN_SAFE_INTEGER;
    for (var i = 0; i < nps; i++) {
        var x = xps[i];
        boundsMinX = Math.min(boundsMinX, x);
        boundsMaxX = Math.max(boundsMaxX, x);
        var y = yps[i];
        boundsMinY = Math.min(boundsMinY, y);
        boundsMaxY = Math.max(boundsMaxY, y);
    }
    this._bounds = new Rectangle(boundsMinX, boundsMinY, boundsMaxX - boundsMinX, boundsMaxY - boundsMinY);
}
Polygon.prototype.getBounds = function() {
    return this.getBoundingBox();
}
Polygon.prototype.getBoundingBox = function() {
    if (this._npoints === 0) {
        return new Rectangle();
    }
    if (this._bounds === undefined) {
        this.calculateBounds(this._xpoints, this._ypoints, this._npoints);
    }
    return this._bounds.getBounds();
}
/**
 * @param {number} x
 * @param {number} y
 */
Polygon.prototype.inside = function(x, y) {
    if (this._npoints <= 2 || !this.getBoundingBox().contains(new Point(x, y))) {
        return false;
    }
    var hits = 0;
    var lastx = this._xpoints[this._npoints - 1];
    var lasty = this._ypoints[this._npoints - 1];
    var curx, cury;

    // Walk the edges of the polygon
    for (var i = 0; i < this._npoints; lastx = curx, lasty = cury, i++) {
        curx = this._xpoints[i];
        cury = this._ypoints[i];
        if (cury === lasty) {
            continue;
        }
        var leftx;
        if (curx < lastx) {
            if (x >= lastx) {
                continue;
            }
            leftx = curx;
        } else {
            if (x >= curx) {
                continue;
            }
            leftx = lastx;
        }
        var test1, test2;
        if (cury < lasty) {
            if (y < cury || y >= lasty) {
                continue;
            }
            if (x < leftx) {
                hits++;
                continue;
            }
            test1 = x - curx;
            test2 = y - cury;
        } else {
            if (y < lasty || y >= cury) {
                continue;
            }
            if (x < leftx) {
                hits++;
                continue;
            }
            test1 = x - lastx;
            test2 = y - lasty;
        }

        if (test1 < (test2 / (lasty - cury) * (lastx - curx))) {
            hits++;
        }
    }

    return ((hits & 1) != 0);
}