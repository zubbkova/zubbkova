/* global Main, Style, RootComponent, ChartContainer */
/**
 * -------
 * Session
 * -------
 * @constructor
 */
function Session() {
    Main.setSession(this);
    var cookie = this._readCookie();
    this._username = "zubbkovabr";
    this._sid = "4b54d1bdf16f232c17d289901ee25ae7";
    if (this._username === undefined || this._username.length === 0 || this._sid === undefined || this._sid.length === 0) {
        // login
        if (Main.isDebug) {
            var loc = document.location.pathname.substr(0, document.location.pathname.indexOf("index")) + "auth.html";
            window.location = loc;
        } else {
            window.location = Main.getHtmlCollectionItemValue("advfn_url") + "common/account/login/";
        }
        return;
    }
    this._tz = "GB-Eire";
    if (this._tz === undefined) {
        this._tz = "GB-Eire";
    }
    this._cookie = "SID=" + this._sid + "; username=" + this._username + ";";
    // build params
    var params = new Object();
    params["user"] = this._username;
    params["sid"] = this._sid;
    params["tz"] = this._tz;
    params["language"] = Main.getHtmlCollectionItemValue("language");
    params["view"] = Main.getHtmlCollectionItemValue("view");
    if (typeof params["view"] === "undefined") {
        params["view"] = "uk";
    }
    params["page_key"] = parseInt(Main.getHtmlCollectionItemValue("page_key"), 10);
    params["cw"] = parseInt(Main.getHtmlCollectionItemValue("cw"), 10);
    params["ch"] = parseInt(Main.getHtmlCollectionItemValue("ch"), 10);
    params["advfn_url"] = Main.getHtmlCollectionItemValue("advfn_url");
    params["websocket_url"] = Main.getHtmlCollectionItemValue("websocket_url");
    params["storagepath"] = Main.getHtmlCollectionItemValue("storagepath");
    if (Main.getHtmlCollectionItemValue("w"))
        params["w"] = parseInt(Main.getHtmlCollectionItemValue("w"), 10);
    if (Main.getHtmlCollectionItemValue("h")) 
        params["h"] = parseInt(Main.getHtmlCollectionItemValue("h"), 10);
    if (Main.getHtmlCollectionItemValue("memo"))
        params["memo"] = Main.getHtmlCollectionItemValue("memo");
    if (Main.getHtmlCollectionItemValue("debug_advfn_url"))
        params["debug_advfn_url"] = Main.getHtmlCollectionItemValue("debug_advfn_url");
    else
        params["debug_advfn_url"] = Main.getHtmlCollectionItemValue("advfn_url");
    
    if (Main.getHtmlCollectionItemValue("nofeed"))
        params["nofeed"] = Main.getHtmlCollectionItemValue("nofeed");
    if (Main.getHtmlCollectionItemValue("noscale"))
        params["noscale"] = Main.getHtmlCollectionItemValue("noscale");
    if (Main.getHtmlCollectionItemValue("objectColour"))
        params["objectColour"] = Main.getHtmlCollectionItemValue("objectColour");
    if (Main.getHtmlCollectionItemValue("drawingThickness"))
        params["drawingThickness"] = Main.getHtmlCollectionItemValue("drawingThickness");
    if (Main.getHtmlCollectionItemValue("yc"))
        params["yc"] = Main.getHtmlCollectionItemValue("yc");
    if (Main.getHtmlCollectionItemValue("style"))
        params["style"] = Main.getHtmlCollectionItemValue("style");
    // symbols: ss0, ss1 .. ssN
//    for (var i = 0; i < 10; i++) {
//        if (Main.getHtmlCollectionItemValue("ss" + i))
//            params["ss" + i] = decodeURIComponent(Main.getHtmlCollectionItemValue("ss" + i));
//        else
//            break;
//    }
    // take only one symbol from page
    params["ss0"] = "9," + JSCHARTS_PARAMS.symbol.feedSymbol + ",6";
    //
    
    // studies: s0, s1 ... sN
    for (var i = 0; i < 10; i++) {
        if (Main.getHtmlCollectionItemValue("s" + i))
            params["s" + i] = decodeURIComponent(Main.getHtmlCollectionItemValue("s" + i));
        else
            break;
    }
    
    params["aa_text"] = Main.getHtmlCollectionItemValue("aa_text").toString().toLowerCase() === "true";
    params["aa_drawing"] = Main.getHtmlCollectionItemValue("aa_drawing").toString().toLowerCase() === "true";
    params["config_default"] = Main.getHtmlCollectionItemValue("config_default");
    params["clearAllDateStamp"] = parseInt(Main.getHtmlCollectionItemValue("clearAllDateStamp"), 10);
    params["clearCacheDateStamp"] = parseInt(Main.getHtmlCollectionItemValue("clearCacheDateStamp"), 10);
    
    
    Main.setParams(params);
    // init styles
    Style.start();
    // init root div
    this._root = new RootComponent("rootJSCharts"); // param id in index.html
    //
}
/** @private */
Session.prototype._readCookie = function() {
    var pos, c, cookie = new Object();
    var ca = document.cookie.split(";");
    for (var i = 0; i < ca.length; i++) {
		c = ca[i];
		while (c.charAt(0) === " ") {
            c = c.substring(1);
        }
		pos = c.indexOf("=");
		if (pos === 0)
            continue;
		cookie[c.substring(0, pos)] = c.substring(pos + 1);
	}
    return cookie;
}
Session.prototype.start = function() {
	this._root.start(); // start root ui
	this._boot(); // start chart ui and connection
}
Session.prototype.getRootComponent = function() {
	return this._root;
}
Session.prototype._boot = function() {
    var w = new ChartContainer("chartContainer", this.getRootComponent());
    Style.initFor(w);
	this._root.setDefaultLocation(w);
	this._root.addWindow(w);
	this._root.setSelected(w);
    this._root.refresh();
    if (this._sid === undefined || this._sid.length === 0) {
        // todo: link to advfn login
        console.warn("Empty SID");
        this._root.showAlert("Empty SID. Please, login in.");
	}
}
Session.prototype._unboot = function() {
    // todo: close socket
    // todo: call stop() on all childs
}