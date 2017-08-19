/**
 * ----------------
 * DrawingUtilities
 * ----------------
 */
var DrawingUtilities = {};
/**
 * @param {Object} gc
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @param {number=} d - dash length
 * @param {number=} s - space length
 */
DrawingUtilities.drawDashedLine = function(gc, x1, y1, x2, y2, d, s) {
    let dashlength = 4;
    let spacelength = 8;
    if (arguments.length > 5) {
        dashlength = d;
        spacelength = s;
    }
    let linelength = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    let xincdashspace = (x2 - x1) / (linelength / (dashlength + spacelength));
    let yincdashspace = (y2 - y1) / (linelength / (dashlength + spacelength));
    let xincdash = (x2 - x1) / (linelength / (dashlength));
    let yincdash = (y2 - y1) / (linelength / (dashlength));
    let counter = 0;
    for (let i = 0; i < linelength - dashlength; i += dashlength + spacelength) {
        gc.drawLineWithAdjust((x1 + xincdashspace * counter), (y1 + yincdashspace * counter), (x1 + xincdashspace * counter + xincdash), (y1 + yincdashspace * counter + yincdash));
        counter++;
    }
    if ((dashlength + spacelength) * counter <= linelength) {
        gc.drawLineWithAdjust((x1 + xincdashspace * counter), (y1 + yincdashspace * counter), x2, y2);
    }
}