/**
 * ----------------
 * DrawingUtilities
 * ----------------
 */
var DrawingUtilities = new Object();
/**
 * @param {Object} gc
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @param {number=} d - dash length
 * @param {number=} s - space length
 * @param {number=} topY
 * @param {number=} bottomY
 */
DrawingUtilities.drawDashedLine = function(gc, x1, y1, x2, y2, d, s, topY, bottomY) {
    var dashlength = 4;
    var spacelength = 8;
    if (arguments.length > 5) {
        dashlength = d;
        spacelength = s;
    }
    var linelength = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    var xincdashspace = (x2 - x1) / (linelength / (dashlength + spacelength));
    var yincdashspace = (y2 - y1) / (linelength / (dashlength + spacelength));
    var xincdash = (x2 - x1) / (linelength / (dashlength));
    var yincdash = (y2 - y1) / (linelength / (dashlength));
    var counter = 0;
    for (var i = 0; i < linelength - dashlength; i += dashlength + spacelength) {
        gc.drawLineWithAdjust((x1 + xincdashspace * counter), (y1 + yincdashspace * counter), (x1 + xincdashspace * counter + xincdash), (y1 + yincdashspace * counter + yincdash), topY, bottomY);
        counter++;
    }
    if ((dashlength + spacelength) * counter <= linelength) {
        gc.drawLineWithAdjust((x1 + xincdashspace * counter), (y1 + yincdashspace * counter), x2, y2, topY, bottomY);
    }
}