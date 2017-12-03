/**
 * @constructor
 * @param {FunctionSNmax} func
 */
function Brent(func) {
    this._func = func;
    this._xmin = 0;
    this._minValue = 0;
}
/** @static */
Brent.CGOLD = (3.0 - Math.sqrt(5)) / 2.0;
/** @static */
Brent.ZEPS = 1.0e-10;
/** @static */
Brent.INTMAX = 100;
/**
 * @param {number} ax
 * @param {number} bx
 * @param {number} cx
 * @param {number} tol
 */
Brent.prototype.minimise = function(ax, bx, cx, tol) {
    var a, b;
    if (ax > cx) {
        a = cx;
        b = ax;
    } else {
        a = ax;
        b = cx;
    }
    var v = bx, w = bx, x = bx, e = 0.0, fx = this._func.eval(bx);
    var fv = fx, fw = fx;
    for (var iter = 0; iter < Brent.INTMAX; iter++) {
        var xm = 0.5 * (a + b);
        var tol1 = tol * Math.abs(x) + Brent.ZEPS;
        var tol2 = 2.0 * tol1;
        var d = 0, u = x;
        if (Math.abs(x - xm) <= tol2 - 0.5 * (b - a)) {
            this._xmin = x;
            return this._minValue = fx;
        }
        var useGolden = true;
        if (Math.abs(e) > tol1) { // Parabolic fit
            var r = (x - w) * (fx - fv);
            var q = (x - v) * (fx - fw);
            var p = (x - v) * q - (x - w) * r;
            q = 2.0 * (q - r);
            if (q > 0.0) {
                p = -p;
            }
            q = Math.abs(q);
            var etemp = e;
            e = d;
            useGolden = (Math.abs(p) >= Math.abs(0.5 * q * etemp) || p <= q * (a - x) || p >= q * (b - x));
            d = p / q;
        }
        if (useGolden) {
            e = x >= xm ? a - x : b - x;
            d = Brent.CGOLD * e;
        }
        if (Math.abs(d) > tol1) {
            u = x + d;
        } else {
            if (d < 0) {
                u = x - tol1;
            } else {
                u = x + tol1;
            }
        }
        var fu = this._func.eval(u);
        if (fu < fx) {
            if (u > x) {
                a = x;
            } else {
                b = x;
            }
            v = w;
            fv = fw;
            w = x;
            fw = fx;
            x = u;
            fx = fu;
        } else {
            if (u < x) {
                a = u;
            } else {
                b = u;
            }
            if (fu < fw || x === e) {
                v = w;
                fv = fw;
                w = u;
                fw = fu;
            } else if (fu < fv || v === x || v === w) {
                v = u;
                fv = fu;
            }
        }
    }
    console.error("Brent Minimisation exceeded 100 iterations");
}