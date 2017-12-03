/**
 * -----
 * Utils
 * -----
 */
var Utils = new Object();
Utils.init = function() {
    if (!Utils.decimal) {
        Utils.decimal = new Array(32);
        var v = 1;
        for (var i = 0; i < 32; i++) {
            Utils.decimal[i] = new Array(10);
            for (var j = 0; j < 10; j++) {
                Utils.decimal[i][j] = v * j;
            }
            v *= 10;
        }
    }
}
Utils.init();
Utils.getConstructorName = function(obj) {
    if (typeof obj.constructor.name !== "undefined") {
        return obj.constructor.name;
    }
    var name = obj.constructor.toString();
    var start = "function ".length;
    return name.substr(start, name.indexOf("(") - start);
}
/**
 * @param {string} str
 */
Utils.string2Bin = function(str) {
  var result = [];
  for (var i = 0; i < str.length; i++) {
      result.push(str.charCodeAt(i));
  }
  return result;
}
/**
 * @param {Array} newArray
 * @param {Array} oldArray
 */
Utils.setDifference = function(newArray, oldArray) {
    var result = [];
    for (var i = 0; i < newArray.length; i++) {
        if (!oldArray.includes(newArray[i]))
            result.push(newArray[i]);
    }
    return result;
}
/**
 * Quicker parseInt operates directly on character arrays.
 * @param {Array} c
 * @param {number} beg
 * @param {number} len
 */
Utils.parseInt = function(c, beg, len) {
    if (len === 0)
        return 0;
    if (len === 1)
        return c[beg] - '0';
    var num = 0, dec = 0;
    var d, pos;
    if (c[beg] === '-') {
        for (pos = beg + len - 1; pos > beg; pos--, dec++) {
            d = c[pos];
            d -= '0';
            if (d < 0 || d > 9) {
                return 0;
            }
            num += Utils.decimal[dec][d];
        }
        return -num;
    }
    for (pos = beg + len - 1; pos >= beg; pos--, dec++) {
        d = c[pos];
        d -= '0';
        if (d < 0 || d > 9) {
            return 0;
        }
        num += Utils.decimal[dec][d];
    }
    return num;
}
/**
 * @param {*} s
 */
Utils.parseDouble = function(s) {
    return parseFloat(s);
}
/**
 * @param {*} s
 */
Utils.parseLong = function(s) {
    return parseInt(s, 10);
}
/**
 * @param {Object} h
 * @param {string} sep
 * @param {string} sep2
 */
Utils.convertHashParamsWithoutDefaults = function(h, sep, sep2) {
    delete h["advfn_url"];
    delete h["user"];
    return Utils.convertHashParams(h, sep, sep2);
}
/**
 * @param {Object} h
 * @param {string} sep
 * @param {string} sep2
 */
Utils.convertHashParams = function(h, sep, sep2) {
    var s = '';
    var i = 0;
    if (h) {
        for (var prop in h) {
            if (h[prop] !== undefined) {
                var tmp = (i === 0 ? "" : sep) + prop + sep2 + h[prop];
                s += tmp;
            }
            i++;
        }
    }
    return s;
}
/**
 * @param {string} s
 * @param {string} sep
 * @param {string} sep2
 */
Utils.convertStringParams = function(s, sep, sep2) {
    var h = new Object();
    var arr = s.split(sep);
    for (var i = 0; i < arr.length; i++) {
        var arr2 = arr[i].split(sep2);
        var firstTok2 = arr2[0];
        if (arr2.length === 2 || "prefs" === firstTok2) {
            h[firstTok2] = Utils.stripDoubleSlashes(arr2[1]);
        }
    }
    return h;
}
/**
 * @param {string} s
 */
Utils.stripDoubleSlashes = function(s) {
    var sb = '';
    var slashCount = 0;
    for (var i = 0; i < s.length; i++) {
        var c = s.charAt(i);
        if (c === '\\') {
            if (++slashCount === 2) {
                sb += '\\';
                slashCount = 0;
            }
        } else {
            slashCount = 0;
            sb += c;
        }
    }
    return sb;
}
/**
 * @param {Array} t
 */
Utils.maxInArray = function(t) {
    var maximum = t[0];
    for (var i = 0; i < t.length; i++) {
        if (t[i] > maximum) 
            maximum = t[i];
    }
    return maximum;
}
/**
 * @param {Array} t
 */
Utils.minInArray = function(t) {
    var minimum = t[0];
    for (var i = 0; i < t.length; i++) {
        if (t[i] < minimum) 
            minimum = t[i];
    }
    return minimum;
}
/**
 * @param {Array} t
 */
Utils.sumArray = function(t) {
    var total = 0;
    for (var i = 0; i < t.length; i++) {
        total += t[i];
    }
    return total;
}
/**
 * @param {string} s
 */
Utils.stripCommas = function(s) {
    var sb = '';
    for (var i = 0; i < s.length; i++) {
        var c = s.charAt(i);
        if (c !== ',') {
            sb += c;
        }
    }
    return sb;
}
/**
 * @param {string} s
 * @param {string} delim
 */
Utils.join = function(s, delim) {
    var sb = '';
    var first = true;
    for (var i = 0; i < s.length; i++) {
        if (!first) {
            sb += delim;
        }
        sb += s[i];
        first = false;
    }
    return sb;
}
/**
 * @param {string} s
 * @param {string} delim
 */
Utils.split = function(s, delim) {
    delim = delim.replace("|", "\\|");
    delim = delim.replace("^", "\\^");
    var parts = s.split(delim);
    return parts;
}
/**
 * @param {string} s
 * @param {string} from
 * @param {string} to
 */
Utils.replace = function(s, from, to) {
    if (!s || !from || !to)
        return;
    var oldLength = from.length;
    if (oldLength === 0 || from === to) 
        return s;
    var sb = '';
    var i = 0, x = 0;
    while ((x = s.indexOf(from, i)) > -1) {
        sb += s.substring(i, x);
        sb += to;
        i = x + oldLength;
    }
    sb += s.substring(i)
    return sb;
}
/**
 * @param {Object} target
 * @param {Object} source
 * @param {boolean} overwrite
 */
Utils.mergeObjectsProperties = function(target, source, overwrite) {
    for (var prop in source) {
        if (overwrite || !target.hasOwnProperty(prop)) {
            target[prop] = source[prop];
        }
    }
}
/**
 * @param {string} s
 * @param {Array} c
 */
Utils.removeChar = function(s, c) {
    var r = "";
    var invalid;
    var il = s.length;
    var jl = c.length;
    for (var i = 0; i < il; i++) {
        invalid = false;
        for (var j = 0; j < jl; j++) {
            if (s.charAt(i) === c[j]) {
                invalid = true;
            }
        }
        if (!invalid) {
            r += s.charAt(i);
        }
    }
    return r;
}
/**
 * @param {Object} params
 * @param {string} feature
 */
Utils.hasFeature = function(params, feature) {
    if (!params.hasOwnProperty("features"))
        return false;
    var features = params["features"];
    if (features === undefined) 
        return false;
    var featureList = Utils.split(features, ",");
    for (var i = 0; i < featureList.length; i++) {
        if (featureList[i] === feature) {
            return true;
        }
    }
    return false;
}
Utils.randomString = function() {
    return Math.random().toString(36);
}
/**
 * @param {string} dataURI
 * @returns {Blob}
 */
Utils.dataURItoBlob = function(dataURI) {
    var byteString = atob(dataURI.split(',')[1]);
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) { ia[i] = byteString.charCodeAt(i); }
    return new Blob([ab], { type: 'image/gif' });
}