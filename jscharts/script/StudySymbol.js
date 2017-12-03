/* eslint no-unused-vars: "off" */
/* global Canvas, Color */
/**
 * -----------
 * StudySymbol
 * -----------
 * @abstract
 * @constructor
 */
function StudySymbol() {}
/** @static */
StudySymbol.DOT = new DOT();
/** @static */
StudySymbol.BUY = new BUY();
/** @static */
StudySymbol.SELL = new SELL();
/** @static */
StudySymbol.EXITBUY = new EXITBUY();
/** @static */
StudySymbol.EXITSELL = new EXITSELL();
/** @static */
StudySymbol.GIRELLA_ABOVE = new GIRELLA(-5);
/** @static */
StudySymbol.GIRELLA_BELOW = new GIRELLA(10);
/**
 * @abstract
 * @param {Object} gc
 * @param {number} x
 * @param {number} y
 * @param {Color=} colour
 */
StudySymbol.prototype.draw = function(gc, x, y, colour) {}
/**
 * ---
 * DOT
 * ---
 * @constructor
 * @extends {StudySymbol}
 */
function DOT() {}
/** @override */
DOT.prototype.draw = function(gc, x, y) {
    gc.fillOval(x - 1, y - 1, 3, 3);
}
/**
 * Inheriting
 */
DOT.prototype = Object.create(StudySymbol.prototype);
DOT.prototype.constructor = DOT;
/**
 * ---
 * BUY
 * ---
 * @constructor
 * @extends {StudySymbol}
 */
function BUY() {}
/** @override */
BUY.prototype.draw = function(gc, x, y) {
    var xs = new Array(6);
    var ys = new Array(6);
    xs[0] = x;
    ys[0] = y + 3;
    xs[1] = x + 5;
    ys[1] = y + 8;
    xs[2] = x + 3;
    ys[2] = y + 8;
    xs[3] = x;
    ys[3] = y + 5;
    xs[4] = x - 3;
    ys[4] = y + 8;
    xs[5] = x - 5;
    ys[5] = y + 8;
    gc.begin(Canvas.POLYGON);
    gc.vertex(xs[0], ys[0]);
    gc.vertex(xs[1], ys[1]);
    gc.vertex(xs[2], ys[2]);
    gc.vertex(xs[3], ys[3]);
    gc.vertex(xs[4], ys[4]);
    gc.vertex(xs[5], ys[5]);
    gc.setFillColor(Color.brightGreen);
    gc.setStrokeColor(Color.brightGreen);
    gc.end();
}
/**
 * Inheriting
 */
BUY.prototype = Object.create(StudySymbol.prototype);
BUY.prototype.constructor = BUY;
/**
 * ----
 * SELL
 * ----
 * @constructor
 * @extends {StudySymbol}
 */
function SELL() {}
/** @override */
SELL.prototype.draw = function(gc, x, y) {
    var xs = new Array(6);
    var ys = new Array(6);
    xs[0] = x;
    ys[0] = y - 3;
    xs[1] = x + 5;
    ys[1] = y - 8;
    xs[2] = x + 3;
    ys[2] = y - 8;
    xs[3] = x;
    ys[3] = y - 5;
    xs[4] = x - 3;
    ys[4] = y - 8;
    xs[5] = x - 5;
    ys[5] = y - 8;
    gc.begin(Canvas.POLYGON);
    gc.vertex(xs[0], ys[0]);
    gc.vertex(xs[1], ys[1]);
    gc.vertex(xs[2], ys[2]);
    gc.vertex(xs[3], ys[3]);
    gc.vertex(xs[4], ys[4]);
    gc.vertex(xs[5], ys[5]);
    gc.setFillColor(Color.red);
    gc.setStrokeColor(Color.red);
    gc.end();
}
/**
 * Inheriting
 */
SELL.prototype = Object.create(StudySymbol.prototype);
SELL.prototype.constructor = SELL;
/**
 * -------
 * EXITBUY
 * -------
 * @constructor
 * @extends {StudySymbol}
 */
function EXITBUY() {}
/** @override */
EXITBUY.prototype.draw = function(gc, x, y) {
    var xs = new Array(12);
    var ys = new Array(12);
    xs[0] = x - 5;
    ys[0] = y + 4;
    xs[1] = x - 2;
    ys[1] = y + 4;
    xs[2] = x;
    ys[2] = y + 6;
    xs[3] = x + 2;
    ys[3] = y + 4;
    xs[4] = x + 5;
    ys[4] = y + 4;
    xs[5] = x + 1;
    ys[5] = y + 8;
    xs[6] = x + 5;
    ys[6] = y + 12;
    xs[7] = x + 2;
    ys[7] = y + 12;
    xs[8] = x;
    ys[8] = y + 10;
    xs[9] = x - 2;
    ys[9] = y + 12;
    xs[10] = x - 5;
    ys[10] = y + 12;
    xs[11] = x - 1;
    ys[11] = y + 8;
    gc.begin(Canvas.POLYGON);
    gc.vertex(xs[0], ys[0]);
    gc.vertex(xs[1], ys[1]);
    gc.vertex(xs[2], ys[2]);
    gc.vertex(xs[3], ys[3]);
    gc.vertex(xs[4], ys[4]);
    gc.vertex(xs[5], ys[5]);
    gc.vertex(xs[6], ys[6]);
    gc.vertex(xs[7], ys[7]);
    gc.vertex(xs[8], ys[8]);
    gc.vertex(xs[9], ys[9]);
    gc.vertex(xs[10], ys[10]);
    gc.vertex(xs[11], ys[11]);
    gc.setFillColor(Color.blue);
    gc.setStrokeColor(Color.blue);
    gc.end();
}
/**
 * Inheriting
 */
EXITBUY.prototype = Object.create(StudySymbol.prototype);
EXITBUY.prototype.constructor = EXITBUY;
/**
 * --------
 * EXITSELL
 * --------
 * @constructor
 * @extends {StudySymbol}
 */
function EXITSELL() {}
/** @override */
EXITSELL.prototype.draw = function(gc, x, y) {
    var xs = new Array(12);
    var ys = new Array(12);
    xs[0] = x - 5;
    ys[0] = y - 4;
    xs[1] = x - 2;
    ys[1] = y - 4;
    xs[2] = x;
    ys[2] = y - 6;
    xs[3] = x + 2;
    ys[3] = y - 4;
    xs[4] = x + 5;
    ys[4] = y - 4;
    xs[5] = x + 1;
    ys[5] = y - 8;
    xs[6] = x + 5;
    ys[6] = y - 12;
    xs[7] = x + 2;
    ys[7] = y - 12;
    xs[8] = x;
    ys[8] = y - 10;
    xs[9] = x - 2;
    ys[9] = y - 12;
    xs[10] = x - 5;
    ys[10] = y - 12;
    xs[11] = x - 1;
    ys[11] = y - 8;
    gc.begin(Canvas.POLYGON);
    gc.vertex(xs[0], ys[0]);
    gc.vertex(xs[1], ys[1]);
    gc.vertex(xs[2], ys[2]);
    gc.vertex(xs[3], ys[3]);
    gc.vertex(xs[4], ys[4]);
    gc.vertex(xs[5], ys[5]);
    gc.vertex(xs[6], ys[6]);
    gc.vertex(xs[7], ys[7]);
    gc.vertex(xs[8], ys[8]);
    gc.vertex(xs[9], ys[9]);
    gc.vertex(xs[10], ys[10]);
    gc.vertex(xs[11], ys[11]);
    gc.setFillColor(Color.blue);
    gc.setStrokeColor(Color.blue);
    gc.end();
}
/**
 * Inheriting
 */
EXITSELL.prototype = Object.create(StudySymbol.prototype);
EXITSELL.prototype.constructor = EXITSELL;
/**
 * -------
 * GIRELLA
 * -------
 * @constructor
 * @extends {StudySymbol}
 * @param {number} [dOffset]
 */
function GIRELLA(dOffset) {
    this._drawOffset = dOffset;
}
/** @override */
GIRELLA.prototype.draw = function(gc, x, y, colour) {
    var xoffset = gc._gc.measureText("@").width;
    if (typeof colour !== "undefined") {
        gc.setFillColor(colour);
    }
    gc.fillText("@", x - (xoffset / 2), y + this._drawOffset);
}
/**
 * Inheriting
 */
GIRELLA.prototype = Object.create(StudySymbol.prototype);
GIRELLA.prototype.constructor = GIRELLA;