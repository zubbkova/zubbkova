/**
 * -------
 * Session
 * -------
 * @constructor
 */
function Session() {
    Main.setSession(this);
    let cookie = this._readCookie();
    this._username = cookie["username"];
    this._sid = cookie["SID"];
    if (this._username === undefined || this._username.length === 0 || this._sid === undefined || this._sid.length === 0) {
        // login
        if (Main.isDebug) {
            let loc = document.location.pathname.substr(0, document.location.pathname.indexOf("index")) + "auth.html";
            window.location = loc;
        } else {
            window.location = htmlParams["advfn_url"].value + "common/account/login/";
        }
        return;
    }
    this._tz = cookie["AFNTZ"];
    if (this._tz === undefined) {
        this._tz = "GB-Eire";
    }
    this._cookie = "SID=" + this._sid + "; username=" + this._username + ";";
    // build params
    let params = new Map();
    params.set("user", this._username);
    params.set("sid", this._sid);
    params.set("tz", this._tz);
    params.set("language", htmlParams.language.value);
    params.set("view", htmlParams.view.value);
    params.set("page_key", parseInt(htmlParams["page_key"].value, 10));
    params.set("cw", parseInt(htmlParams["cw"].value, 10));
    params.set("ch", parseInt(htmlParams["ch"].value, 10));
    params.set("advfn_url", htmlParams["advfn_url"].value);
    params.set("websocket_url", htmlParams["websocket_url"].value);
    params.set("storagepath", htmlParams["storagepath"].value);
    if (htmlParams["w"])
        params.set("w", parseInt(htmlParams["w"].value, 10));
    if (htmlParams["h"]) 
        params.set("h", parseInt(htmlParams["h"].value, 10));
    if (htmlParams["memo"])
        params.set("memo", htmlParams["memo"].value);    
    if (htmlParams["debug_advfn_url"])
        params.set("debug_advfn_url", htmlParams["debug_advfn_url"].value);    
    else
        params.set("debug_advfn_url", htmlParams["advfn_url"].value);
    
    if (htmlParams["nofeed"])
        params.set("nofeed", htmlParams["nofeed"].value);
    if (htmlParams["noscale"])
        params.set("noscale", htmlParams["noscale"].value);
    if (htmlParams["objectColour"])
        params.set("objectColour", htmlParams["objectColour"].value);
    if (htmlParams["drawingThickness"])
        params.set("drawingThickness", htmlParams["drawingThickness"].value);
    if (htmlParams["yc"])
        params.set("yc", htmlParams["yc"].value);
    if (htmlParams["style"])
        params.set("style", htmlParams["style"].value);
    // symbols: ss0, ss1 .. ssN
//    for (let i = 0; i < 10; i++) {
//        if (htmlParams["ss" + i])
//            params.set("ss" + i, decodeURIComponent(htmlParams["ss" + i].value));
//        else
//            break;
//    }
    // take only one symbol from page
    params.set("ss0", "9," + JSCHARTS_PARAMS.symbol.feedSymbol + ",6");
    //
    
    // studies: s0, s1 ... sN
    for (let i = 0; i < 10; i++) {
        if (htmlParams["s" + i])
            params.set("s" + i, decodeURIComponent(htmlParams["s" + i].value));
        else
            break;
    }
    
    params.set("aa_text", htmlParams["aa_text"].value.toString().toLowerCase() === "true");
    params.set("aa_drawing", htmlParams["aa_drawing"].value.toString().toLowerCase() === "true");
    params.set("config_default", htmlParams["config_default"].value);
    params.set("clearAllDateStamp", parseInt(htmlParams["clearAllDateStamp"].value, 10));
    params.set("clearCacheDateStamp", parseInt(htmlParams["clearCacheDateStamp"].value, 10));
    
    
    Main.setParams(params);
    // init styles
    Style.start();
    // init root div
    this._root = new RootComponent("rootJSCharts"); // param id in index.html
    //
}
/** @private */
Session.prototype._readCookie = function() {
    let pos, c, cookie = {};
    let ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
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