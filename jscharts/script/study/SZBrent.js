/**
 * @constructor
 * @param {FunctionSN} func
 */
function SZBrent(func) {
    this._func = func;
}
/** @static */
SZBrent.ITMAX = 100;
/** @static */
SZBrent.EPS = 3.0e-8;
/**
 * @param {number} xmin
 * @param {number} xmax
 * @param {number} tol
 */
SZBrent.prototype.solve = function(xmin, xmax, tol) {
    var a = xmin, b = xmax, c = xmax, d = 0.0, e = 0.0;
    var fa = this._func.eval(a);
    var fb = this._func.eval(b);
    var p, q, r, s, tol1, xm;
    if ((fa > 0.0 && fb > 0.0) || (fa < 0.0) && fb < 0.0) {
        return NaN;
    }
    var fc = fb;
    for (var iter = 1; iter <= SZBrent.ITMAX; iter++) {
        if ((fb > 0.0 && fc > 0.0) || (fb < 0.0 && fc < 0)) {
            c = a;
            fc = fa;
            e = d = b - a;
        }
        if (Math.abs(fc) < Math.abs(fb)) {
            a = b;
            b = c;
            c = a;
            fa = fb;
            fb = fc;
            fc = fa;
        }
        tol1 = 2.0 * SZBrent.EPS * Math.abs(b) + 0.5 * tol;
        xm = 0.5 * (c - b);
        if (Math.abs(xm) <= tol1 || fb == 0.0)
            return b;
        if (Math.abs(xm) <= tol1 || fb == 0.0)
            return b;
        if (Math.abs(e) >= tol1 && Math.abs(fa) > Math.abs(fb)) {
            s = fb / fa;
            if (a === c) {
                p = 2.0 * xm * s;
                q = 1.0 - s;
            } else {
                q = fa / fc;
                r = fb / fc;
                p = s * (2.0) * xm * q * (q - r) - (b - a) * (r - 1.0);
                q = (q - 1.0) * (r - 1.0) * (s - 1.0);
            }
            if (p > 0.0)
                q = -q;
            p = Math.abs(p);
            var min1 = 3.0 * xm * q - Math.abs(tol1 * q);
            var min2 = Math.abs(e * q);
            if (2.0 * p < (min1 < min2 ? min1 : min2)) {
                e = d;
                d = p / q;
            } else {
                d = xm;
                e = d;
            }
        } else {
            d = xm;
            e = d;
        }
        a = b;
        fa = fb;
        if (Math.abs(d) > tol1) {
            b += d;
        } else {
            b += xm < 0 ? -tol1 : tol1;
        }
        fb = this._func.eval(b);
    }
    console.error("Exceeded max iterations");
}