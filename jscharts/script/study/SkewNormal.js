/**
 * @constructor
 */
function SkewNormal() {}
/** @static */
SkewNormal.roottwopi = Math.sqrt(2.0 * Math.PI);
/** @static */
SkewNormal.totmp = Math.pow(2.0 / (Math.PI - 2.0), 1.5);
/** @static */
SkewNormal.p10 = 2.4266795523053175e+02;
/** @static */
SkewNormal.p11 = 2.1979261618294152e+01;
/** @static */
SkewNormal.p12 = 6.9963834886191355e+00;
/** @static */
SkewNormal.p13 = -3.5609843701815385e-02;
/** @static */
SkewNormal.q10 = 2.1505887586986120e+02;
/** @static */
SkewNormal.q11 = 9.1164905404514901e+01;
/** @static */
SkewNormal.q12 = 1.5082797630407787e+01;
/** @static */
SkewNormal.q13 = 1.0000000000000000e+00;
/** @static */
SkewNormal.p20 = 3.004592610201616005e+02;
/** @static */
SkewNormal.p21 = 4.519189537118729422e+02,
/** @static */
SkewNormal.p22 = 3.393208167343436870e+02;
/** @static */
SkewNormal.p23 = 1.529892850469404039e+02;
/** @static */
SkewNormal.p24 = 4.316222722205673530e+01;
/** @static */
SkewNormal.p25 = 7.211758250883093659e+00;
/** @static */
SkewNormal.p26 = 5.641955174789739711e-01;
/** @static */
SkewNormal.p27 = -1.368648573827167067e-07;
/** @static */
SkewNormal.q20 = 3.004592609569832933e+02;
/** @static */
SkewNormal.q21 = 7.909509253278980272e+02;
/** @static */
SkewNormal.q22 = 9.313540948506096211e+02;
/** @static */
SkewNormal.q23 = 6.389802644656311665e+02;
/** @static */
SkewNormal.q24 = 2.775854447439876434e+02;
/** @static */
SkewNormal.q25 = 7.700015293522947295e+01;
/** @static */
SkewNormal.q26 = 1.278272731962942351e+01;
/** @static */
SkewNormal.q27 = 1.000000000000000000e+00;
/** @static */
SkewNormal.p30 = -2.99610707703542174e-03,
/** @static */
SkewNormal.p31 = -4.94730910623250734e-02;
/** @static */
SkewNormal.p32 = -2.26956593539686930e-01;
/** @static */
SkewNormal.p33 = -2.78661308609647788e-01;
/** @static */
SkewNormal.p34 = -2.23192459734184686e-02;
/** @static */
SkewNormal.q30 = 1.06209230528467918e-02;
/** @static */
SkewNormal.q31 = 1.91308926107829841e-01;
/** @static */
SkewNormal.q32 = 1.05167510706793207e+00;
/** @static */
SkewNormal.q33 = 1.98733201817135256e+00;
/** @static */
SkewNormal.q34 = 1.00000000000000000e+00;
/** @static */
SkewNormal.c0 = 0.56418958354775628695;
/**
 * @param {number} x
 * @param {number} center
 * @param {number} scale
 * @param {number} lambda
 */
SkewNormal.prototype.sn = function(x, center, scale, lambda) {
    var y = (x - center) / scale;
    return 2.0 / scale * this.dnorm(y) * this.pnorm(lambda * y);
}
/**
 * @param {number} x
 */
SkewNormal.prototype.dnorm = function(x) {
    var q = Math.exp(-x * x / 2.0);
    return q / SkewNormal.roottwopi;
}
/**
 * @param {number} x
 */
SkewNormal.prototype.pnorm = function(x) {
    var c = .70710678118654752440;
    if (x >= 0)
        return 0.5 * (1 + this.erf(c * x));
    else
        return 0.5 * this.erfc(-c * x);
}
/**
 * @param {number} x
 */
SkewNormal.prototype.erf = function(x) {
    if (x <= 0)
        return 1.0;
    if (x > 0.5) {
        return 1.0 - this.erfc(x);
    }
    var y = x * x;
    var num = SkewNormal.p10 + y * (SkewNormal.p11 + y * (SkewNormal.p12 + y * SkewNormal.p13));
    var den = SkewNormal.q10 + y * (SkewNormal.q11 + y * (SkewNormal.q12 + y * SkewNormal.q13));
    return x * num / den;
}
SkewNormal.prototype.erfc = function(x) {
    if (x <= 0.5) {
        return 1.0 - this.erf(x);
    }
    var y, num, den;
    if (x <= 4.0) {
        num = SkewNormal.p20 + x * (SkewNormal.p21 + x * (SkewNormal.p22 + x * (SkewNormal.p23 + x * (SkewNormal.p24 + x * (SkewNormal.p25 + x * (SkewNormal.p26 + x * SkewNormal.p27))))));
        den = SkewNormal.q20 + x * (SkewNormal.q21 + x * (SkewNormal.q22 + x * (SkewNormal.q23 + x * (SkewNormal.q24 + x * (SkewNormal.q25 + x * (SkewNormal.q26 + x * SkewNormal.q27))))));
        return Math.exp(-x * x) * num / den;
    }
    y = 1 / (x * x);
    num = SkewNormal.p30 + y * (SkewNormal.p31 + y * (SkewNormal.p32 + y * (SkewNormal.p33 + y * SkewNormal.p34)));
    den = SkewNormal.q30 + y * (SkewNormal.q31 + y * (SkewNormal.q32 + y * (SkewNormal.q33 + y * SkewNormal.q34)));
    return (Math.exp(-x * x) / x) * (SkewNormal.c0 + (num / den) * y);
}