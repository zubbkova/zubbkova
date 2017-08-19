/**
 * -----
 * Color
 * -----
 * @constructor 
 * @param {string|number} r
 * @param {number=} g
 * @param {number=} b
 * @param {number=} a
 */
function Color(r, g, b, a) {    
    if (arguments.length === 1) {
        if (typeof r === "number") {
            // Long
            this._b = Math.floor(r / 65536);
            this._g = Math.floor((r - this._b * 65536) / 256);
            this._r = Math.floor(r - this._b * 65536 - this._g * 256);
            this._a = 1.0;
            this._color = "rgba(" + this._r + "," + this._g + "," + this._b + "," + this._a + ")";
        } else if (r[0] !== "#") {
            // simply string
            this._color = r.toString();
        } else {
            // HEX
            var bigint = parseInt(r.substring(1), 16);
            this._r = (bigint >> 16) & 255;
            this._g = (bigint >> 8) & 255;
            this._b = bigint & 255;
            this._a = 1.0;
            this._color = "rgba(" + Math.floor(this._r) + "," + Math.floor(this._g) + "," + Math.floor(this._b) + "," + this._a + ")";
        }
        return;
    }
    if (arguments.length < 3) {
        console.error("Incorrect color");
        return;
    }
    if (r < 1)
        r = r*255+0.5;
    if (g < 1)
        g = g*255+0.5;
    if (b < 1)
        b = b*255+0.5;
    this._r = r;
    this._g = g;
    this._b = b;
    this._a = (a === undefined) ? 1.0 : a;
    this._color = "rgba(" + Math.floor(r) + "," + Math.floor(g) + "," + Math.floor(b) + "," + this._a + ")";
}
Color.prototype.getLong = function() {
    if (this._r === undefined) {
        console.error("Method is not supported");
        return;
    }
    let long = this._b * 65536 + this._g * 256 + this._r;
    return long;
}
Color.prototype.getHex = function() {
    if (this._r === undefined) {
        console.error("Method is not supported");
        return;
    }
    return "#" + (this._r << 16 | this._g << 8 | this._g).toString(16).toUpperCase();
}
Color.prototype.toString = function() {
    return this._color;
}
/**
 * @param {number} h
 * @param {number} s
 * @param {number} v
 */
Color.HSVtoRGB = function(h, s, v) {
    var r, g, b, i, f, p, q, t;
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return new Color(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255));
}
/** @static */
Color.white = new Color(255, 255, 255);
/** @static */
Color.black = new Color(0, 0, 0);
/** @static */
Color.gray1 = new Color("#dfdfdf");
/** @static */
Color.gray2 = new Color("#bfbfbf");
/** @static */
Color.gray3 = new Color("#7f7f7f");
/** @static */
Color.gray4 = new Color("#aaaad5");
/** @static */
Color.gray5 = new Color("#e0e0e0");
/** @static */
Color.darkBlue = new Color("#000080");
/** @static */
Color.darkBlue1 = new Color("#000090");
/** @static */
Color.green = new Color("#008000");
/** @static */
Color.beige = new Color("#F0F0E7");
/** @static */
Color.yellow = new Color(255, 255, 0);
/** @static */
Color.blue = new Color(0, 0, 255);
/** @static */
Color.cyan = new Color(0, 255, 255);
/** @static */
Color.darkGray = new Color(64, 64, 64);
/** @static */
Color.gray = new Color(128, 128, 128);
/** @static */
Color.brightGreen = new Color(0, 255, 0);
/** @static */
Color.lightGray = new Color(192, 192, 192);
/** @static */
Color.magenta = new Color(255, 0, 255);
/** @static */
Color.orange = new Color(255, 200, 0);
/** @static */
Color.pink = new Color(255, 175, 175);
/** @static */
Color.red = new Color(255, 0, 0);
/** @static */
Color.darkRed = new Color(185, 0, 0);