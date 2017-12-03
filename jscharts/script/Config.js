/* global Main */
/**
 * ------
 * Config
 * ------
 * @constructor
 * @param {string} key
 */
function Config(key) {
    this._config = new Object();
    this._key = key;
    this._config['Default'] = new Object();
    this._defaultScheme = Main.getParams()['config_default'];
    // get from API
    var host = Main.getAdvfnURL();
    var self = this;
    $.ajax({
        type: "POST",
        url: host + "common/settings/configuration-store/get",
        data: "key=" + key,
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        success: function(responseData) {
            if (responseData["status"] === "fail") {
                console.warn("Config.read. Error:", responseData["error_code"], responseData["message"], "key =", responseData["key"]);
                return;
            }
            if (responseData["status"] === "success") {
                var json = JSON.parse(responseData["value"]);
                for (var i = 0; i < json.length; i++) {
                    var item = json[i];
                    if (item["default"] === "true") {
                        self._defaultScheme = item["scheme"];
                    }
                    self._config[item["scheme"]] = item["data"];
                }
                console.log(responseData["message"]);
            } else {
                console.warn("Config.read. Error");
            }
        },
        error: function(responseData, textStatus) {
            console.warn("Config.read. Error: " + textStatus);
        }
    });
}
/**
 * @param {string} scheme
 * @param {boolean=} setDefault
 */
Config.prototype.write = function(scheme, setDefault) {
    var def = false;
    if (arguments.length > 1) {
        def = setDefault;
    }
    if (def) {
        this._defaultScheme = scheme;
    }
    var allSchemes = new Array();
    for (var prop in this._config) {
        var item = new Object();
        item["scheme"] = prop;
        item["default"] = this._defaultScheme === prop ? "true" : "false";
        item["data"] = this._config[prop];
        allSchemes.push(item);
    }
    var p = JSON.stringify(allSchemes);
    var key = this._key;
    var host = Main.getAdvfnURL();
    $.ajax({
        type: "POST",
        url: host + "common/settings/configuration-store/put",
        data: "key=" + key + "&value=" + encodeURIComponent(p),
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        success: function(responseData) {
            if (responseData["status"] === "fail") {
                console.error("Config.write. Error:", responseData["error_code"], responseData["message"], "key =", responseData["key"]);
                return;
            }
            if (responseData["status"] === "success") {
                console.log(responseData["message"]);
            } else {
                console.warn("Config.write. Error");    
            }
        },
        error: function(responseData, textStatus) {
            console.warn("Config.write. Error: " + textStatus);
        }
    });
}
/**
 * @param {string} scheme
 */
Config.prototype.delete = function(scheme) {
    delete this._config[scheme];
    this.write(scheme);
}
/**
 * @param {string} scheme
 */
Config.prototype.setDefault = function(scheme) {
    this.write(scheme, true);
}
/**
 * @param {string} scheme
 */
Config.prototype.get = function(scheme) {
    return this._config[scheme];
}
/**
 * @param {string} scheme
 * @param {Array} items
 * @param {string=} value
 */
Config.prototype.set = function(scheme, items, value) {
    if (arguments.length === 2) {
        this._config[scheme] = items;
    } else {
        var tmp = this.get(scheme);
        tmp.set(items, value);
    }
}
/**
 * @param {string} scheme
 */
Config.prototype.hasScheme = function(scheme) {
    return this._config.hasOwnProperty(scheme) && this._config[scheme] !== undefined;
}
Config.prototype.getSchemes = function() {
    var result = [];
    for (var prop in this._config) {
        result.push(prop);
    }
    return result;
}
Config.prototype.destroy = function() {
    this._config = undefined;
}
/** @static */
Config.configs = new Object();
/**
 * @static
 * @param {string} key
 */
Config.getConfig = function(key) {
    if (Config.configs.hasOwnProperty(key) && Config.configs[key] !== undefined) {
        return Config.configs[key];
    }
    var c = new Config(key);
    Config.configs[key] = c;
    return c;
}