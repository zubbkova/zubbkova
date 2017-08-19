/**
 * -----
 * Utils
 * -----
 */
var Utils = {};
Utils.init = function() {
    if (!Utils.decimal) {
        Utils.decimal = new Array(32);
        let v = 1;
        for (let i = 0; i < 32; i++) {
            Utils.decimal[i] = new Array(10);
            for (let j = 0; j < 10; j++) {
                Utils.decimal[i][j] = v * j;
            }
            v *= 10;
        }
    }
}
Utils.init();
/**
 * @param {string} str
 */
Utils.string2Bin = function(str) {
  let result = [];
  for (let i = 0; i < str.length; i++) {
      result.push(str.charCodeAt(i));
  }
  return result;
}
/**
 * @param {Array} newArray
 * @param {Array} oldArray
 */
Utils.setDifference = function(newArray, oldArray) {
    let result = [];
    for (let i = 0; i < newArray.length; i++) {
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
    let num = 0, dec = 0;
    let d;
    if (c[beg] === '-') {
        for (let pos = beg + len - 1; pos > beg; pos--, dec++) {
            d = c[pos];
            d -= '0';
            if (d < 0 || d > 9) {
                return 0;
            }
            num += Utils.decimal[dec][d];
        }
        return -num;
    }
    for (let pos = beg + len - 1; pos >= beg; pos--, dec++) {
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
 * @param {number} milliseconds
 */
Utils.sleep = function(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
/**
 * @param {Map} h
 * @param {string} sep
 * @param {string} sep2
 */
Utils.convertHashParamsWithoutDefaults = function(h, sep, sep2) {
    h.delete("advfn_url");
    h.delete("user");
    return Utils.convertHashParams(h, sep, sep2);
}
/**
 * @param {Map} h
 * @param {string} sep
 * @param {string} sep2
 */
Utils.convertHashParams = function(h, sep, sep2) {
    let s = '';
    let i = 0;
    for (let key of h.keys()) {
        if (key[0]) {
            let tmp = (i === 0 ? "" : sep) + key[0] + sep2 + key[1];
            s += tmp;
        }
        i++;
    }
    return s;
}
/**
 * @param {string} s
 * @param {string} sep
 * @param {string} sep2
 */
Utils.convertStringParams = function(s, sep, sep2) {
    let h = new Map();
    let arr = s.split(sep);
    for (let i = 0; i < arr.length; i++) {
        let arr2 = arr[i].split(sep2);
        let firstTok2 = arr2[0];
        if (arr2.length === 2 || "prefs" === firstTok2) {
            h.set(firstTok2, Utils.stripDoubleSlashes(arr2[1]));
        }
    }
    return h;
}
/**
 * @param {string} s
 */
Utils.stripDoubleSlashes = function(s) {
    let sb = '';
    let slashCount = 0;
    for (let i = 0; i < s.length; i++) {
        let c = s.charAt(i);
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
    let maximum = t[0];
    for (let i = 0; i < t.length; i++) {
        if (t[i] > maximum) 
            maximum = t[i];
    }
    return maximum;
}
/**
 * @param {Array} t
 */
Utils.minInArray = function(t) {
    let minimum = t[0];
    for (let i = 0; i < t.length; i++) {
        if (t[i] < minimum) 
            minimum = t[i];
    }
    return minimum;
}
/**
 * @param {Array} t
 */
Utils.sumArray = function(t) {
    let total = 0;
    for (let i = 0; i < t.length; i++) {
        total += t[i];
    }
    return total;
}
/**
 * @param {string} s
 */
Utils.stripCommas = function(s) {
    let sb = '';
    for (let i = 0; i < s.length; i++) {
        c = s.charAt(i);
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
    let sb = '';
    let first = true;
    for (let i = 0; i < s.length; i++) {
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
    let parts = s.split(delim);
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
    let sLength = s.length;
    let oldLength = from.length;
    let newLength = to.length;
    if (oldLength === 0 || from === to) 
        return s;
    let sb = '';
    let i = 0, x = 0;
    while ((x = s.indexOf(from, i)) > -1) {
        sb += s.substring(i, x);
        sb += to;
        i = x + oldLength;
    }
    sb += s.substring(i)
    return sb;
}
/**
 * @param {Map} target
 * @param {Map} source
 * @param {boolean} overwrite
 */
Utils.mergeHashtables = function(target, source, overwrite) {
    for (let key in source.keys()) {
        if (overwrite || !target.has(key)) {
            target.set(key, source.get(key));
        }
    }
}
/**
 * @param {string} s
 * @param {Array} c
 */
Utils.removeChar = function(s, c) {
    let r = "";
    let invalid;
    let il = s.length;
    let jl = c.length;
    for (let i = 0; i < il; i++) {
        invalid = false;
        for (let j = 0; j < jl; j++) {
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
 * @param {Map} params
 * @param {string} feature
 */
Utils.hasFeature = function(params, feature) {
    if (!params.has("features")) return false;
    let features = params.get("features");
    if (features === undefined) return false;
    let featureList = Utils.split(features, ",");
    for (let i = 0; i < featureList.length; i++) {
        if (featureList[i] === feature) {
            return true;
        }
    }
    return false;
}
/**
 * @param {string} s
 * @param {string} prefix
 * @param {number} length
 */
Utils.padString = function(s, prefix, length) {
    let padChars = length - s.length;
    let buf = "";
    for (let i = 0; i < padChars; i++) {
        buf += prefix;
    }
    buf += s;
    return buf;
}
/**
 * @param {Map} h
 * @param {string} name
 */
Utils.getStringParam = function(h, name) {
    let s = h.get(name);
    return (s) ? s : "";
}
/**
 * @param {string} site
 * @param {Array} params
 * @param {boolean=} stripT
 */
Utils.getWebPageParams = function(site, params, stripT) {
    let stripTilde = true;
    if (arguments.length > 2) {
        stripTilde = stripT;
    }
    let page = site + "p.php";
    let pid;
    for (let i = 0; i < params.length; i++) {
        if (params[i].startsWith("pid=")) {
            pid = params[i];
            params.splice(i, 1);
            break;
        }
    }
    if (pid) {
        page += "?" + pid;
    }
    // Added to avoid cloudflare block
//    params.push("applet=1");
    // added parameter to force no caching on this page, so it fixes problems
    // with web requests getting into the cache (for US users)
    params.push("nocache=1");
    let paramList = params.join("&");
    // remove spurious characters that might break url
    if (stripTilde)
        paramList = Utils.removeChar(paramList, ['#', '~']);
    else 
        paramList = Utils.removeChar(paramList, ['#']);
    return {"page": page, "paramList": paramList};
}
/**
 * @param {string} site
 * @param {Array} params
 * @param {boolean=} stripT
 */
Utils.pushToWebPage = function(site, params, stripT) {
    let stripTilde = true;
    if (arguments.length > 2) {
        stripTilde = stripT;
    }
    let paramsResult = Utils.getWebPageParams(Main.getAdvfnURL(), params, stripTilde);
    let request = new XMLHttpRequest();
    request.open("POST", paramsResult.page);
    request.onreadystatechange = function(e) {
        if (e.readyState === 4) {
            if (e.status === 200) {
                console.log("Utils.pushToWebPage. Complete.");
            } else {
                console.log("Utils.pushToWebPage. Error: " + e.status + " " + e.statusText);
            }
        }
    }
    request.onerror = function (e) {
        console.log("Utils.pushToWebPage. Error: " + e.status + " " + e.statusText);
    }
    request.send(paramsResult.paramList);
}