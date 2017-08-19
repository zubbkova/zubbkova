/**
 * -----
 * START
 * -----
 */
function runJSCharts() {
    new Session().start();
}
/**
 * -----------
 * Main params
 * -----------
 */
let htmlParams = $('#rootJSCharts')[0].children;
/**
 * ----
 * Main
 * ----
 */
var Main = {};
Main.isDebug = htmlParams.debug.value === "true";
if (Main.isDebug) {
    console.warn("Debug mode is activated");
}
Main._minChartHeight = 200;
Main._minChartWidth = 324;
Main._minToolbarHeight = 154;
Main._minToolbarWidth = 730;
Main._minDrawbarHeight = 424;
Main._minMiscbarHeight = 20;
Main._proToolbarHeight = 24;
Main._proToolbarWidth = 648;
Main._drawBarWidth = Component.TOOLBAR_BUTTON_SIZE * 2;
Main.getParams = function() {
    return Main._params;
}
/**
 * @param {Map} p
 */
Main.setParams = function(p) {
    Main._params = p;
    if (p.get("language") === undefined) {
        Language.setLocale("en_GB");
    } else {
        Language.setLocale(p.get("language"));
    }
    if (Language.getLanguageID() === "ja_JP") {
        Main._fontWidthMultiplier = 1.5;
    } else {
        Main._fontWidthMultiplier = 1.0;
    }
    Main.formatSizes(p.get("cw"), p.get("ch"));
}
/**
 * @param {number} cw
 * @param {number} ch
 */
Main.formatSizes = function(cw, ch) {
    Main._chartWidth = Math.max(cw, Main._minChartWidth);
    Main._chartHeight = Math.max(ch, Main._minChartHeight);
//    Main._frameWidth = p.get("w");
    let contentWidth = Component.COMPONENT_X_GAP * 2 + Main._drawBarWidth + Math.max(Main._chartWidth, Main._minToolbarWidth);
    Main._frameWidth = contentWidth;
//    Main._frameHeight = Math.max(p.get("h"), 394);
    let vertical = Main._chartHeight >= Main._minDrawbarHeight;
    let contentHeight = Main._minToolbarHeight + Main._chartHeight + Main._minMiscbarHeight + (vertical ? 0 : Component.COMPONENT_Y_GAP * 2 + Main._drawBarWidth);
    if (Main._params.has("nofeed")) {
        contentHeight += Main._proToolbarHeight;
    }
//    if (p.has("notoolbar")) {
//        contentHeight -= Main._minToolbarHeight;
//    }
    Main._frameHeight = contentHeight + 3;
}
Main.getChartWidth = function() {
    return Main._chartWidth;
}
Main.getChartHeight = function() {
    return Main._chartHeight;
}
/**
 * @param {string} k
 * @param {string} v
 */
Main.setParamsKeyValue = function(k, v) {
    Main._params.set(k, v);
}
Main._resourcePath = JSCHARTS_PARAMS.paths.resources;
Main._scriptPath = JSCHARTS_PARAMS.paths.script;
Main.getImagesURL= function()
{
    return Main._resourcePath;
};
Main.getFrameWidth = function() {
    return Main._frameWidth;
}
Main.getFrameHeight = function() {
    return Main._frameHeight;
}
Main.getWebSocketURL = function() {
    return Main._params.get("websocket_url");
}
Main.getAdvfnURL = function()
{
    var advfnURL = Main._params.get("advfn_url");
    if (Main.isDebug)
    {
        advfnURL = Main._params.get("debug_advfn_url");
    }
    return advfnURL + '/';
}
Main.getCookie = function() {
    return Main._session._cookie;
}
Main.getSID = function() {
    return Main._session._sid;
}
Main.getUserName = function() {
    return Main._session._username;
}
Main.getTimeZone = function() {
    return Main._session._tz;
}
Main.getSession = function() {
    return Main._session;
}
/**
 * @param {Session} session
 */
Main.setSession = function(session) {
    Main._session = session;
}