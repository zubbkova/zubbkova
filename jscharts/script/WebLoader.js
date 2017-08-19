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
    let p = ["pid=pricehistory"];
    for (let i = 0; i < this._gets.length; i++) {
        let cur = this._gets[i];
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
    let self = this;
    let paramsResult = this.getWebPage(Main.getAdvfnURL(), p);
    let page = paramsResult.page;
    let paramList = paramsResult.paramList;
    let request = new XMLHttpRequest();
    request.responseType = "arraybuffer";
    request.open("GET", page + "&" + paramList);
    request.onreadystatechange = function(e) {
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
    let counts = new Array(this._gets.length);
    if (response === undefined || response.length === 0) {
        console.warn("WebLoader. Wargning: response bytes is empty");
        this._parent.WebLoaderDelegate_doneWebLoad(counts, this._gets);
        return;
    }
    let rowDate = new Date();
    let cur = this._gets[0];
    this._byteArray = new Uint8Array(response);
    console.log("WebLoader. " + parseInt(this._byteArray.length/1024, 10) + " KB received");
    this._i = 0;
    let recordsLeft = 0;
    let curSymbol = 0;
    let resultEventArray = [];
    let cell0, cell1, cell2, cell3, cell4, cell5, cell6, cell7, cell8, cell9;
    while (true) {
        let s = this.readLine();
        if (s === null) {
            console.log("WebLoader. end data");
            break;
        }
        let line = this.readLine();
        if (line === null) {
            console.log("WebLoader. end data");
            break;
        }
        
        let ff = parseInt(line, 10);
        if (s !== cur._symbol || ff !== cur._frequency) {
            if (++curSymbol === this._gets.length)
                break;
            cur = this._gets[curSymbol];
        }
        let count = 0;
        this._parent.WebLoader_GetInfoDelegate_loadStateChanged(0);
        counts[curSymbol] = recordsLeft = this.readInt();
        console.log("WebLoader. recordsLeft: " + recordsLeft, ",", cur._symbol);
        
        let total_vol, buy_vol, sell_vol, rowTime, j, percentage, decPct;
        for (; recordsLeft > 0; recordsLeft--) {
            rowTime = this.readInt();
            if (rowTime === -1) {
                // event row
                let type = this.readInt();
                let tmp = this.readInt();
                let year = Math.trunc(tmp / 10000);
                let month = Math.trunc((tmp % 10000) / 100 - 1);
                let day = Math.trunc(tmp % 100);
                let data = {year: year, month: month, day: day, symbol: cur._symbol, frequency: cur._frequency, type: type};
                if (type === 0) {
                    let num = this.readInt();
                    let denom = this.readInt();
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
                let dd = new Date(rowDate);
//                console.log(cur._symbol, dd.getDate() + "." + dd.getMonth() + "."+dd.getFullYear(), cell9);
                rowDate = rowTime * 1000;
                percentage = Math.trunc(100.0 * count / counts[curSymbol]);
                this._parent.WebLoaderDelegate_onDataRow(cur._symbol, cur._frequency, rowDate, cell0, cell1, cell2, cell3, cell4, cell5, cell6, cell7, cell8, cell9, percentage);
                count++;
            } else {
                // Blank row.
                this.skip(34);
            }
        }
    }
    if (cur._from < Math.trunc(rowDate / 1000)) {
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
    let buffer = 0;
    for (let j = 0; j < length; j++, this._i++) {
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
    let stringBuffer = "";
    for (; this._i < this._byteArray.byteLength; this._i++) {
        let c = this._byteArray[this._i];
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
 * @param {boolean=} stripT
 */
WebLoader.prototype.getWebPage = function(site, params, stripT) {
    let stripTilde = true;
    if (arguments.length > 2) {
        stripTilde = stripT;
    }
    let page = site + "p.php";
    let pid;
    for (let k = 0; k < params.length; k++) {
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
    let paramList = params.join("&");
    // remove spurious characters that might break url
//    if (stripTilde)
//        paramList = Utils.removeChar(paramList, ['#', '~']);
//    else 
//        paramList = Utils.removeChar(paramList, ['#']);
    return {page: page, paramList: paramList};
}
/**
 * @param {boolean} packed
 */
WebLoader.prototype.unpackPrice = function(packed) {
    let price = 0.0;
    if ((packed & WebLoader.IS_PACKED) !== 0) {
        let mantissa = packed & 0x07ffffff;
        let exponent = ((packed >> 27) & 0x7);
        price = mantissa * WebLoader.pfloat_shift_array[exponent];
    } else {
        price = Math.trunc(packed / 1000.0);
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