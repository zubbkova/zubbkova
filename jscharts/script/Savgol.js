/**
 * ------
 * Savgol
 * ------
 */
let Savgol = {};
Savgol.TINY = 1.0e-20;
/**
 * @param {Array} a
 * @param {number} n
 * @param {Array} indx
 * @param {Array} b
 */
Savgol.lubksb = function(a, n, indx, b) {
    let ii = 0, ll = 0;
    for (let i = 0; i < n; i++) {
        ll = indx[i];
        let sum = b[ll];
        b[ll] = b[i];
        if (ii != -1) {
            for (let j = ii; j <= i - 1; j++) {
                sum -= a[i][j] * b[j];
            }
        } else if (sum != 0) {
            ii = i;
        }
        b[i] = sum;
    }
    for (let i = n - 1; i >= 0; i--) {
        let sum = b[i];
        for (let j = i + 1; j < n; j++) {
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
    let d = 1.0;
    let vv = new Array(n);
    vv.fill(0.0);
    for (let i = 0; i < n; i++) {
        let aamax = 0.0;
        for (let j = 0; j < n; j++) {
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
    for (let j = 0; j < n; j++) {
        for (let i = 0; i < j; i++) {
            let sum = a[i][j];
            for (let k = 0; k < i; k++) {
                sum -= a[i][k] * a[k][j];
            }
            a[i][j] = sum;
        }
        let aamax = 0.0;
        let imax = -1;
        for (let i = j; i < n; i++) {
            let sum = a[i][j];
            for (let k = 0; k < j; k++) {
                sum -= a[i][k] * a[k][j];
            }
            a[i][j] = sum;
            let dum = vv[i] * Math.abs(sum);
            if (dum >= aamax) {
                imax = i;
                aamax = dum;
            }
        }
        if (j != imax) {
            for (let k = 0; k < n; k++) {
                let dum = a[imax][k];
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
            let dum = 1.0 / a[j][j];
            for (let i = j + 1; i < n; i++) {
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
    let out = new Array(np);
    out.fill(0.0);
    let nod = order + 1;
    let a = new Array(nod);
    let indx = new Array(nod);
    indx.fill(0);
    for (let i = 0; i < nod; i++) {
        a[i] = new Array(nod);
        a[i].fill(0.0);
    }
    for (let ipj = 0; ipj <= 2 * order; ipj++) {
        let sum = (ipj === 0) ? 1.0 : 0.0;
        let sgn = ipj % 2 === 0 ? 1.0 : -1.0;
        for (let k = 1; k <= nr; k++) {
            sum += Math.pow(k, ipj);
        }
        if (ipj !== 0) {
            for (let k = 1; k <= nl; k++) {
                sum += sgn * Math.pow(k, ipj);
            }
        } else {
            for (let k = 1; k <= nl; k++) {
                sum += 1.0;
            }
        }
        let mm = (ipj < 2 * order - ipj) ? ipj : 2 * order - ipj;
        for (let imj = -mm; imj <= mm; imj += 2) {
            a[(ipj + imj) / 2][(ipj - imj) / 2] = sum;
        }
    }
    Savgol.ludcmp(a, nod, indx);
    let b = new Array(nod);
    b.fill(0.0);
    b[deriv] = 1.0;
    Savgol.lubksb(a, nod, indx, b);
    for (let k = -nl; k <= nr; k++) {
        let sum = b[0];
        let fac = 1.0;
        for (let mm = 1; mm <= order; mm++) {
            fac = fac * k;
            sum += b[mm] * fac;
        }
        let kk = np - k;
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