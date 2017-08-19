/**
 * ------
 * Config
 * ------
 * @constructor
 * @param {string} key
 * @param {Map=} items
 */
function Config(key, items) {
    this._config = new Map();
    this._defaultScheme = "";
    this._itemName = key;
    if (items) {
        this._config = items;
        this._config.set('Default', new Map());
        this._defaultScheme = Main.getParams().get('config_default');
        return;
    }
    this._config.set('Default', new Map());
    
    // get from web page
    let input = [];
    let p = [];
    p.push("pid=prefs");
    p.push("action=get");
    p.push("user=" + Main.getUserName());
    p.push("item=" + this._itemName);
    
    let paramsResult = Utils.getWebPageParams(Main.getAdvfnURL(), p, true);
    let request = new XMLHttpRequest();
    request.open("GET", paramsResult.page + "&" + paramsResult.paramList);
    request.onreadystatechange = function(e) {
        if (this.readyState === 4) {
            if (this.status === 200) {
                let strArray = request.response.split('\n');
                for (let item of strArray) {
                    input.push(item);
                }
                let c = 0;
                let numItems = parseInt(input[c++], 10);
                this._defaultScheme = input[c++];
                for (let i = 0; i < numItems; i++) {
                    let scheme = input[c++];
                    let data = input[c++];
                    if (scheme === undefined || scheme === 'Default') {
                        continue;
                    }
                    if (data === undefined) {
                        console.log(scheme + ' has no data')
                    }
                    let bits = Utils.convertStringParams(data, "|", "~");
                    this._config.set(scheme, bits);
                }
            } else {
                console.log("Config. Error: " + this.status + " " + this.statusText);
            }
        }
    }
    request.onerror = function () {
        console.log("Config. Error: " + this.status + " " + this.statusText);
    }
    request.send();
}
/**
 * @param {string} scheme
 * @param {boolean=} setDefault
 */
Config.prototype.write = function(scheme, setDefault) {
    let def = false;
    if (arguments.length > 1) {
        def = setDefault;
    }
    let action = def ? "putdef" : "put";
    let items = this._config.get(scheme);
    let data = Utils.convertHashParamsWithoutDefaults(items, "|", "~");
    let p = [];
    p.push("pid=prefs");
    p.push("action=" + action);
    p.push("user=" + Main.getUserName());
    p.push("item=" + this._itemName);
    p.push("scheme=" + scheme);
    p.push("data=" + data);
    Utils.pushToWebPage(Main.getAdvfnURL(), p, false);
    if (def) {
        this._defaultScheme = scheme;
    }
}
/**
 * @param {string} scheme
 */
Config.prototype.delete = function(scheme) {
    this._config.delete(scheme);
    let p = [];
    p.push("pid=prefs");
    p.push("action=del");
    p.push("user=" + Main.getUserName());
    p.push("item=" + this._itemName);
    p.push("scheme=" + scheme);
    Utils.pushToWebPage(Main.getAdvfnURL(), p, false);
}
/**
 * @param {string} scheme
 */
Config.prototype.setDefault = function(scheme) {
    let p = [];
    p.push("pid=prefs");
    p.push("action=setdef");
    p.push("user=" + Main.getUserName());
    p.push("item=" + this._itemName);
    p.push("scheme=" + scheme);
    Utils.pushToWebPage(Main.getAdvfnURL(), p, false);
    this._defaultScheme = scheme;
}
/**
 * @param {string} scheme
 */
Config.prototype.get = function(scheme) {
    return this._config.get(scheme);
}
/**
 * @param {string} scheme
 * @param {Array} items
 * @param {string=} value
 */
Config.prototype.set = function(scheme, items, value) {
    if (arguments.length === 2) {
        this._config.set(scheme, items);
    } else {
        let tmp = this.get(scheme);
        tmp.set(items, value);
    }
}
/**
 * @param {string} scheme
 */
Config.prototype.hasScheme = function(scheme) {
    return this._config.has(scheme);
}
Config.prototype.getSchemes = function() {
    return this._config.keys();
}
Config.prototype.destroy = function() {
    this._config = undefined;
}
/** @static */
Config.configs = new Map();
/**
 * @static
 * @param {string} key
 * @param {Map=} items
 */
Config.getConfig = function(key, items) {
    if (Config.configs.has(key)) {
        return Config.configs.get(key);
    }
    let c = new Config(key, items);
    Config.configs.set(key, c);
    return c;
}