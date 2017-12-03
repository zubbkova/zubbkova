/**
 * ------
 * Savgol
 * ------
 */
var Savgol = new Object();
Savgol.TINY = 1.0e-20;
/**
 * @param {Array} a
 * @param {number} n
 * @param {Array} indx
 * @param {Array} b
 */
Savgol.lubksb = function(a, n, indx, b) {
    var ii = 0, ll = 0;
    var i, j, sum;
    for (i = 0; i < n; i++) {
        ll = indx[i];
        sum = b[ll];
        b[ll] = b[i];
        if (ii != -1) {
            for (j = ii; j <= i - 1; j++) {
                sum -= a[i][j] * b[j];
            }
        } else if (sum != 0) {
            ii = i;
        }
        b[i] = sum;
    }
    for (i = n - 1; i >= 0; i--) {
        sum = b[i];
        for (j = i + 1; j < n; j++) {
            sum -= a[i][j] * b[j];
        }
        b[i] = sum / a[i][i];
    }
}
/**
 * @param {Array} a
 * @param {number} n
 * @param {Array} indx
 */
Savgol.ludcmp = function(a, n, indx) {
    var d = 1.0;
    var vv = new Array(n);
    vv.fillArrayWithValue(0.0);
    var i, j, k, aamax, sum, dum;
    for (i = 0; i < n; i++) {
        aamax = 0.0;
        for (j = 0; j < n; j++) {
            if (Math.abs(a[i][j]) > aamax) {
                aamax = Math.abs(a[i][j]);
            }
        }
        if (aamax === 0.0) {
            console.error("Sigular Matrix in ludcmp");
            return;
        }
        vv[i] = 1.0 / aamax;
    }
    for (j = 0; j < n; j++) {
        for (i = 0; i < j; i++) {
            sum = a[i][j];
            for (k = 0; k < i; k++) {
                sum -= a[i][k] * a[k][j];
            }
            a[i][j] = sum;
        }
        aamax = 0.0;
        var imax = -1;
        for (i = j; i < n; i++) {
            sum = a[i][j];
            for (k = 0; k < j; k++) {
                sum -= a[i][k] * a[k][j];
            }
            a[i][j] = sum;
            dum = vv[i] * Math.abs(sum);
            if (dum >= aamax) {
                imax = i;
                aamax = dum;
            }
        }
        if (j != imax) {
            for (k = 0; k < n; k++) {
                dum = a[imax][k];
                a[imax][k] = a[j][k];
                a[j][k] = dum;
            }
            d = -d;
            vv[imax] = vv[j];
        }
        indx[j] = imax;
        if (a[j][j] === 0.0) {
            a[j][j] = Savgol.TINY;
        }
        if (j !== n) {
            dum = 1.0 / a[j][j];
            for (i = j + 1; i < n; i++) {
                a[i][j] = a[i][j] * dum;
            }
        }
    }
    return d;
}
/**
 * @param {number} np
 * @param {number} nl
 * @param {number} nr
 * @param {number} deriv
 * @param {number} order
 */
Savgol.savgol = function(np, nl, nr, deriv, order) {
    if (np < nl + nr + 1 || nr < 0 || nl < 0 || deriv > order || order > 6) {
        console.error("Bad Arguments for savgol: " + np + " " + nl + " " + nr + " " + deriv + " " + order);
        return;
    }
    var out = new Array(np);
    out.fillArrayWithValue(0.0);
    var nod = order + 1;
    var a = new Array(nod);
    var indx = new Array(nod);
    indx.fillArrayWithValue(0);
    for (var i = 0; i < nod; i++) {
        a[i] = new Array(nod);
        a[i].fillArrayWithValue(0.0);
    }
    var k, sum, mm;
    for (var ipj = 0; ipj <= 2 * order; ipj++) {
        sum = (ipj === 0) ? 1.0 : 0.0;
        var sgn = ipj % 2 === 0 ? 1.0 : -1.0;
        for (k = 1; k <= nr; k++) {
            sum += Math.pow(k, ipj);
        }
        if (ipj !== 0) {
            for (k = 1; k <= nl; k++) {
                sum += sgn * Math.pow(k, ipj);
            }
        } else {
            for (k = 1; k <= nl; k++) {
                sum += 1.0;
            }
        }
        mm = (ipj < 2 * order - ipj) ? ipj : 2 * order - ipj;
        for (var imj = -mm; imj <= mm; imj += 2) {
            a[(ipj + imj) / 2][(ipj - imj) / 2] = sum;
        }
    }
    Savgol.ludcmp(a, nod, indx);
    var b = new Array(nod);
    b.fillArrayWithValue(0.0);
    b[deriv] = 1.0;
    Savgol.lubksb(a, nod, indx, b);
    for (k = -nl; k <= nr; k++) {
        sum = b[0];
        var fac = 1.0;
        for (mm = 1; mm <= order; mm++) {
            fac = fac * k;
            sum += b[mm] * fac;
        }
        var kk = np - k;
        if (kk < 0) {
            kk += np;
        }
        if (kk >= np) {
            kk -= np;
        }
        out[kk] = sum;
    }
    return out;
}