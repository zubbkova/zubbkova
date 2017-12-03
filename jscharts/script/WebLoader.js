/* global PriceDataLoader, Main, ErrorCodes */
/**
 * ---------
 * WebLoader
 * ---------
 * @constructor
 * @param {PriceDataLoader} [parent]
 * @param {Array} [gets]
 */
function WebLoader(parent, gets) {
    this._gets = gets;
    this._parent = parent;
}
WebLoader.prototype.start = function() {
    this._parent.WebLoader_GetInfoDelegate_loadStateChanged(PriceDataLoader.CONNECTING);
    var p = ["pid=pricehistory"];
    for (var i = 0; i < this._gets.length; i++) {
        var cur = this._gets[i];
        if (cur._from <= cur._to) {
            p.push("sym" + i + "=" + encodeURIComponent(cur._symbol));
            p.push("freq" + i + "=" + cur._frequency);
            p.push("fr" + i + "=" + cur._from);
            p.push("to" + i + "=" + cur._to);
            console.log("WebLoader. symbol = " + cur._symbol, new Date(cur._from*1000), new Date(cur._to*1000));
        } else {
            // nothing to load
            this._parent.WebLoader_GetInfoDelegate_loadStateChanged(PriceDataLoader.NOT_LOADING);
        }
    }
    if (p.length === 1) {
        // we didn't get any
        this._parent.WebLoaderDelegate_doneWebLoad([], this._gets);
        return;
    }
    var self = this;
    var paramsResult = this.getWebPage(Main.getAdvfnURL(), p);
    var page = paramsResult.page;
    var paramList = paramsResult.paramList;
    var request = new XMLHttpRequest();
    request.open("GET", page + "&" + paramList);
    request.responseType = "arraybuffer";
    request.onreadystatechange = function() {
        if (this.readyState === 4) {
            if (this.status === 200) {
                self.parseResponse(request.response);
            } else {
                self._parent.WebLoaderDelegate_onError(this.status + " " + this.statusText);
            }
        }
    }
    request.onerror = function () {
        self._parent.WebLoaderDelegate_onError(ErrorCodes.ERR_ERROR);
    }
    request.send();
    console.log("WebLoader. start");
}
/**
 * @param response
 */
WebLoader.prototype.parseResponse = function(response) {
    var counts = new Array(this._gets.length);
    if (response === undefined || response.length === 0) {
        console.warn("WebLoader. Wargning: response bytes is empty");
        this._parent.WebLoaderDelegate_doneWebLoad(counts, this._gets);
        return;
    }
    var rowDate = new Date();
    var cur = this._gets[0];
    this._byteArray = new Uint8Array(response);
    console.log("WebLoader. " + parseInt(this._byteArray.length/1024, 10) + " KB received");
    this._i = 0;
    var recordsLeft = 0;
    var curSymbol = 0;
    var cell0, cell1, cell2, cell3, cell4, cell5, cell6, cell7, cell8, cell9;
    while (true) {
        var s = this.readLine();
        if (s === null) {
            console.log("WebLoader. end data");
            break;
        }
        var line = this.readLine();
        if (line === null) {
            console.log("WebLoader. end data");
            break;
        }
        
        var ff = parseInt(line, 10);
        if (s !== cur._symbol || ff !== cur._frequency) {
            if (++curSymbol === this._gets.length)
                break;
            cur = this._gets[curSymbol];
        }
        var count = 0;
        this._parent.WebLoader_GetInfoDelegate_loadStateChanged(0);
        counts[curSymbol] = recordsLeft = this.readInt();
        console.log("WebLoader. recordsLeft: " + recordsLeft, ",", cur._symbol);
        
        var total_vol, buy_vol, sell_vol, rowTime, percentage;
        for (; recordsLeft > 0; recordsLeft--) {
            rowTime = this.readInt();
            if (rowTime === -1) {
                // event row
                var type = this.readInt();
                var tmp = this.readInt();
                var year = parseInt(tmp / 10000, 10);
                var month = parseInt((tmp % 10000) / 100 - 1, 10);
                var day = parseInt(tmp % 100, 10);
                var data = {year: year, month: month, day: day, symbol: cur._symbol, frequency: cur._frequency, type: type};
                if (type === 0) {
                    var num = this.readInt();
                    var denom = this.readInt();
                    data.num = num;
                    data.denom = denom;
                }
                this._parent.WebLoaderDelegate_onEventRow(data);
                count++;
            } else if (rowTime > 0) {
                // data row
                cell0 = this.unpackPrice(this.readInt());
                cell1 = this.unpackPrice(this.readInt());
                cell2 = this.unpackPrice(this.readInt());
                cell3 = this.unpackPrice(this.readInt());
                cell4 = this.unpackPrice(this.readInt());
                cell5 = this.unpackPrice(this.readInt());
                
                total_vol = this.readInt() * (2 << 32) + this.readInt();
                buy_vol = Math.round(this.readByte() * total_vol / 100.0);
                sell_vol = Math.round(this.readByte() * total_vol / 100.0);
                
                cell6 = buy_vol;
                cell7 = sell_vol;
                cell8 = total_vol - buy_vol - sell_vol; // unknown volume
                cell9 = total_vol;
                rowDate = rowTime * 1000;
                
//                var dd = new Date(rowDate);
//                console.log(dd);
                
                percentage = parseInt(100.0 * count / counts[curSymbol], 10);
                this._parent.WebLoaderDelegate_onDataRow(cur._symbol, cur._frequency, rowDate, cell0, cell1, cell2, cell3, cell4, cell5, cell6, cell7, cell8, cell9, percentage);
                count++;
            } else {
                // Blank row.
                this.skip(34);
            }
        }
    }
    if (cur._from < parseInt(rowDate / 1000, 10)) {
        this._parent.WebLoaderDelegate_onSetMinDataRange(cur._symbol, cur._frequency);
    }
    this._parent.WebLoader_GetInfoDelegate_loadStateChanged(PriceDataLoader.NOT_LOADING);
    this._parent.WebLoaderDelegate_doneWebLoad(counts, this._gets);
}
/**
 * @param {number} count
 */
WebLoader.prototype.skip = function(count) {
    while (count > 0) {
        if (this._byteArray[this._i] === -1)
            break;
        count--;
        this._i++;
    }
}
/**
 * @param {number} length
 */
WebLoader.prototype.read = function(length) {
    var buffer = 0;
    for (var j = 0; j < length; j++, this._i++) {
        buffer += this._byteArray[this._i];
        if (j < length - 1) {
            buffer = buffer << 8;
        }
    }
    return buffer;
}
WebLoader.prototype.readByte = function() {
    return this.read(1);
}
WebLoader.prototype.readInt = function() {
    return this.read(4);
}
WebLoader.prototype.readLine = function() {
    var stringBuffer = "";
    for (; this._i < this._byteArray.byteLength; this._i++) {
        var c = this._byteArray[this._i];
        if (c === -1) {
            return null;
        }
        if (c === WebLoader.CR || c === WebLoader.NL) {
            this._i++;
            return stringBuffer;
        }
        stringBuffer += String.fromCharCode(c);
    }
    return null;
}
/**
 * @param {string} site
 * @param {Array} params
 */
WebLoader.prototype.getWebPage = function(site, params) {
    var page = site + "p.php";
    var pid;
    for (var k = 0; k < params.length; k++) {
        if (params[k].startsWith("pid=")) {
            pid = params[k];
            params.splice(k, 1);
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
    var paramList = params.join("&");
    return {page: page, paramList: paramList};
}
/**
 * @param {boolean} packed
 */
WebLoader.prototype.unpackPrice = function(packed) {
    var price = 0.0;
    if ((packed & WebLoader.IS_PACKED) !== 0) {
        var mantissa = packed & 0x07ffffff;
        var exponent = ((packed >> 27) & 0x7);
        price = mantissa * WebLoader.pfloat_shift_array[exponent];
    } else {
        price = parseInt(packed / 1000.0, 10);
    }
    return price;
}
/** @static */
WebLoader.CR = 32;
/** @static */
WebLoader.NL = 10;
/** @static */
WebLoader.IS_PACKED = 1 << 31;
/** @static */
WebLoader.pfloat_shift_array = [0.0000001, 0.000001, 0.00001, 0.0001, 0.001, 0.01, 0.1, 1];