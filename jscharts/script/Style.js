/* global Language, Font, Color */
/**
 * -----
 * Style
 * -----
 */
var Style = new Object();
Style._sansSerif = "sans-serif";
Style._fontStyleNames = ["normal", "bold"];
/**
 * @param {Component} c
 */
Style.initFor = function(c) {
    Style._component = c;
}
/**
 * @param {number} style
 */
Style.getBackground = function(style) {
    var bg = undefined;
    var myLang = Language.getLanguageID();
    if(myLang) {
        bg = Style._internationalBackground[myLang + style];
    }
    return (bg ? bg : Style._background[style]);
}
/**
 * @param {number} style
 */
Style.getForeground = function(style) {
    var fg = undefined;
    var myLang = Language.getLanguageID();
    if (myLang) {
        fg = Style._internationalForeground[myLang + style];
    }
    return (fg ? fg : Style._foreground[style]);
}
/**
 * @param {number} id
 */
Style.getImage = function(id) {
    return Style.imageFileNames[id];
}
/**
 * @param {number} sizeNum
 * @param {number} size
 */
Style.addFont = function(sizeNum, size) {
    var n = Style._numFonts++;
    Style._fontNum[Style.FONT_STYLE_PLAIN][sizeNum] = n;
    Style._font[n] = new Font(Style._sansSerif, Style.FONT_STYLE_PLAIN, size);
    n = Style._numFonts++;
    Style._fontNum[Style.FONT_STYLE_BOLD][sizeNum] = n;
    Style._font[n] = new Font(Style._sansSerif, Style.FONT_STYLE_BOLD, size);
}
/**
 * @param {number} fsize
 * @param {number} fstyle
 */
Style.getFont = function(fsize, fstyle) {
    return Style._font[Style._fontNum[fstyle][fsize]];
}
/**
 * @param {number} style
 */
Style.getFontByStyle = function(style) {
    var fsize = (   Style._fontSize[style] === -1) ? Style._fontSize[Style.DEFAULT] : Style._fontSize[style];
    var fstyle = (Style._fontStyle[style] === -1) ? Style._fontStyle[Style.DEFAULT] : Style._fontStyle[style];
    return Style._font[Style._fontNum[fstyle][fsize]];
}
/**
 * @param {number} f
 */
Style.getFontMetrics = function(f) {
    if (Style._fontMetric[f] === undefined) {
        Style._fontMetric[f] = Style._component.getFontMetrics(Style._font[f]);
    }
    return Style._fontMetric[f];
}
/**
 * @param {number} p
 */
Style.getPalette = function(p) {
    return Style._palette[p];
}
Style.getFontName = function() {
    return Style._sansSerif;
}
/**
 * @param {number} s
 */
Style.getFontSize = function(s) {
    return Style._fontSize[s];
}
/**
 * @param {number} s
 */
Style.getFontStyle = function(s) {
    return Style._fontStyle[s];
}
Style.start = function() {
    Style._palette = new Array(10);
    Style._palette[Style.BUTTON_HIGH_1] = Color.gray1;
    Style._palette[Style.BUTTON_HIGH_2] = Color.white;
    Style._palette[Style.BUTTON_MID] = Color.gray2;
    Style._palette[Style.BUTTON_LOW_1] = Color.gray3;
    Style._palette[Style.BUTTON_LOW_2] = Color.black;
    Style._palette[Style.SCROLLBAR] = Color.gray1;
    Style._palette[Style.BORDER] = Color.black;
    Style._palette[Style.EDIT_SELECT] = Color.darkBlue;
    
    // init elements of styles
    Style._fontSize = new Array(Style.MAX_STYLES);
    Style._fontSize.fillArrayWithValue(-1);
    Style._fontStyle = new Array(Style.MAX_STYLES);
    Style._fontStyle.fillArrayWithValue(-1);
    Style._background = new Array(Style.MAX_STYLES);
    Style._foreground = new Array(Style.MAX_STYLES);
    
    Style._fontNum = new Array(Style._fontStyleNames.length);
    Style._fontNum[0] = new Array(10);
    Style._fontNum[1] = new Array(10);
    
    Style._fontMetric = new Array(100);
    Style._font = new Array(100);
    Style._numFonts = 0;
    Style.addFont(Style.FONT_SIZE_8, 8);
    Style.addFont(Style.FONT_SIZE_9, 9);
    Style.addFont(Style.FONT_SIZE_10, 10);
    Style.addFont(Style.FONT_SIZE_11, 11);
    Style.addFont(Style.FONT_SIZE_12, 12);
    Style.addFont(Style.FONT_SIZE_13, 13);
    Style.addFont(Style.FONT_SIZE_14, 14);
    Style.addFont(Style.FONT_SIZE_16, 16);
    Style.addFont(Style.FONT_SIZE_18, 18);
    Style.addFont(Style.FONT_SIZE_24, 24);
    
    Style._background[Style.DEFAULT] = Color.white;
    Style._background[Style.HIGHLIGHT_UP] = Color.darkBlue1;
    Style._background[Style.HIGHLIGHT_NO_CHANGE] = new Color("#ffdc00");
    Style._background[Style.HIGHLIGHT_DOWN] = Color.red;
    Style._background[Style.TABLE_HEADING] = Color.gray4;
    Style._background[Style.HIGHLIGHT_INSERT] = Color.green;
    Style._background[Style.HIGHLIGHT_DELETE] = Color.red;
    Style._background[Style.DELETED] = Color.red;
    Style._background[Style.PRICE_1] = new Color("#90c8ff");
    Style._background[Style.PRICE_2] = new Color("#cfffff");
    Style._background[Style.PRICE_3] = new Color("#e7ace0");
    Style._background[Style.PRICE_4] = new Color("#eaeaff");
    Style._background[Style.PRICE_5] = new Color("#cfcfcf");
    Style._background[Style.PRICE_MARKET] = Color.yellow;
    Style._background[Style.PRICE_EVEN] = new Color("#efefef");
    Style._background[Style.TRADE_EVEN] = Color.gray5;
    Style._background[Style.TRADE_OLD_ODD] = Color.white;
    Style._background[Style.TRADE_OLD_EVEN] = Color.gray5;
    Style._background[Style.TRADE_LARGE_ODD] = Color.beige;
    Style._background[Style.TRADE_LARGE_EVEN] = new Color("#c0c4f1");
    Style._background[Style.ORDERBOOK_LARGE_ODD] = Color.beige;
    Style._background[Style.ORDERBOOK_LARGE_EVEN] = new Color("#c0c4f1");
    Style._background[Style.TRADE_OLD_HEADER] = Color.gray4;
    Style._background[Style.MONITOR_ODD] = Color.beige;
    Style._background[Style.MONITOR_EVEN] = new Color("#E5E5F3");
    Style._background[Style.MONITOR_HEADER] = Color.gray4;
    Style._background[Style.MONITOR_SUB_HEADER] = new Color("#646492");
    Style._background[Style.HIGHLIGHT_SELECTED] = new Color("#0000ff");
    Style._background[Style.TOUCH] = Color.yellow;
    Style._background[Style.TOUCH_UP] = Style._background[Style.HIGHLIGHT_UP];
    Style._background[Style.TOUCH_NO_CHANGE] = Color.yellow;
    Style._background[Style.TOUCH_DOWN] = Style._background[Style.HIGHLIGHT_DOWN];
    Style._background[Style.TOOL_AREA] = Color.gray5;
    Style._background[Style.TABLE_ODD_ROW] = Color.gray5;
    Style._background[Style.TABLE_EVEN_ROW_HIGHLIGHT] = new Color("#fffbad");
    Style._background[Style.TABLE_ODD_ROW_HIGHLIGHT] = new Color("#e0dc98");
    
    Style._foreground[Style.DEFAULT] = Color.black;
    Style._foreground[Style.HIGHLIGHT_UP] = Color.white;
    Style._foreground[Style.HIGHLIGHT_DOWN] = Color.white;
    Style._foreground[Style.PERIOD_UP] = Color.darkBlue1;
    Style._foreground[Style.PERIOD_NO_CHANGE] = Color.green;
    Style._foreground[Style.PERIOD_DOWN] = Color.red;
    Style._foreground[Style.TABLE_HEADING] = Color.white;
    Style._foreground[Style.HIGHLIGHT_INSERT] = Color.white;
    Style._foreground[Style.HIGHLIGHT_DELETE] = Color.white;
    Style._foreground[Style.DELETED] = Color.white;
    Style._foreground[Style.HIGHLIGHT_SELECTED] = Color.white;
    Style._foreground[Style.TOUCH_UP] = Color.white;
    Style._foreground[Style.TOUCH_DOWN] = Color.white;
    Style._foreground[Style.MONITOR_HEADER] = Color.white;
    Style._foreground[Style.MONITOR_SUB_HEADER] = Color.gray5;
    
    Style._languages = ["gb", "fr", "jp", "de", "br", "it", "us"];
    Style._internationalForeground = new Object();
    Style._internationalBackground = new Object();
    for (var i = 0; i < Style._languages.length; i++) {
        var l = Style._languages[i];
        Style._internationalForeground[l + Style.DEFAULT] = Style._foreground[Style.DEFAULT];
        Style._internationalForeground[l + Style.HIGHLIGHT_UP] = Style._foreground[Style.HIGHLIGHT_UP];
        Style._internationalForeground[l + Style.HIGHLIGHT_DOWN] = Style._foreground[Style.HIGHLIGHT_DOWN];
        Style._internationalForeground[l + Style.PERIOD_UP] = Style._foreground[Style.PERIOD_UP];
        Style._internationalForeground[l + Style.PERIOD_NO_CHANGE] = Style._foreground[Style.PERIOD_NO_CHANGE];
        Style._internationalForeground[l + Style.PERIOD_DOWN] = Style._foreground[Style.PERIOD_DOWN];
        Style._internationalForeground[l + Style.TABLE_HEADING] = Style._foreground[Style.TABLE_HEADING];
        Style._internationalForeground[l + Style.HIGHLIGHT_INSERT] = Style._foreground[Style.HIGHLIGHT_INSERT];
        Style._internationalForeground[l + Style.HIGHLIGHT_DELETE] = Style._foreground[Style.HIGHLIGHT_DELETE];
        Style._internationalForeground[l + Style.DELETED] = Style._foreground[Style.DELETED];
        Style._internationalForeground[l + Style.HIGHLIGHT_SELECTED] = Style._foreground[Style.HIGHLIGHT_SELECTED];
        Style._internationalForeground[l + Style.TOUCH_UP] = Style._foreground[Style.TOUCH_UP];
        Style._internationalForeground[l + Style.TOUCH_DOWN] = Style._foreground[Style.TOUCH_DOWN];
        Style._internationalForeground[l + Style.MONITOR_HEADER] = Style._foreground[Style.MONITOR_HEADER];
        Style._internationalForeground[l + Style.MONITOR_SUB_HEADER] = Style._foreground[Style.MONITOR_SUB_HEADER];
        Style._internationalBackground[l + Style.DEFAULT] = Style._background[Style.DEFAULT];
        Style._internationalBackground[l + Style.HIGHLIGHT_UP] = Style._background[Style.HIGHLIGHT_UP];
        Style._internationalBackground[l + Style.HIGHLIGHT_NO_CHANGE] = Style._background[Style.HIGHLIGHT_NO_CHANGE];
        Style._internationalBackground[l + Style.HIGHLIGHT_DOWN] = Style._background[Style.HIGHLIGHT_DOWN];
        Style._internationalBackground[l + Style.TABLE_HEADING] = Style._background[Style.TABLE_HEADING];
        Style._internationalBackground[l + Style.HIGHLIGHT_INSERT] = Style._background[Style.HIGHLIGHT_INSERT];
        Style._internationalBackground[l + Style.HIGHLIGHT_DELETE] = Style._background[Style.HIGHLIGHT_DELETE];
        Style._internationalBackground[l + Style.DELETED] = Style._background[Style.DELETED];
        Style._internationalBackground[l + Style.PRICE_1] = Style._background[Style.PRICE_1];
        Style._internationalBackground[l + Style.PRICE_2] = Style._background[Style.PRICE_2];
        Style._internationalBackground[l + Style.PRICE_3] = Style._background[Style.PRICE_3];
        Style._internationalBackground[l + Style.PRICE_4] = Style._background[Style.PRICE_4];
        Style._internationalBackground[l + Style.PRICE_5] = Style._background[Style.PRICE_5];
        Style._internationalBackground[l + Style.PRICE_MARKET] = Style._background[Style.PRICE_MARKET];
        Style._internationalBackground[l + Style.PRICE_EVEN] = Style._background[Style.PRICE_EVEN];
        Style._internationalBackground[l + Style.TRADE_EVEN] = Style._background[Style.TRADE_EVEN];
        Style._internationalBackground[l + Style.TRADE_OLD_ODD] = Style._background[Style.TRADE_OLD_ODD];
        Style._internationalBackground[l + Style.TRADE_OLD_EVEN] = Style._background[Style.TRADE_OLD_EVEN];
        Style._internationalBackground[l + Style.TRADE_LARGE_ODD] = Style._background[Style.TRADE_LARGE_ODD];
        Style._internationalBackground[l + Style.TRADE_LARGE_EVEN] = Style._background[Style.TRADE_LARGE_EVEN];
        Style._internationalBackground[l + Style.ORDERBOOK_LARGE_ODD] = Style._background[Style.ORDERBOOK_LARGE_ODD];
        Style._internationalBackground[l + Style.ORDERBOOK_LARGE_EVEN] = Style._background[Style.ORDERBOOK_LARGE_EVEN];
        Style._internationalBackground[l + Style.TRADE_OLD_HEADER] = Style._background[Style.TRADE_OLD_HEADER];
        Style._internationalBackground[l + Style.MONITOR_ODD] = Style._background[Style.MONITOR_ODD];
        Style._internationalBackground[l + Style.MONITOR_EVEN] = Style._background[Style.MONITOR_EVEN];
        Style._internationalBackground[l + Style.MONITOR_HEADER] = Style._background[Style.MONITOR_HEADER];
        Style._internationalBackground[l + Style.MONITOR_SUB_HEADER] = Style._background[Style.MONITOR_SUB_HEADER];
        Style._internationalBackground[l + Style.HIGHLIGHT_SELECTED] = Style._background[Style.HIGHLIGHT_SELECTED];
        Style._internationalBackground[l + Style.TOUCH] = Style._background[Style.TOUCH];
        Style._internationalBackground[l + Style.TOUCH_UP] = Style._background[Style.TOUCH_UP];
        Style._internationalBackground[l + Style.TOUCH_NO_CHANGE] = Style._background[Style.TOUCH_NO_CHANGE];
        Style._internationalBackground[l + Style.TOUCH_DOWN] = Style._background[Style.TOUCH_DOWN];
        Style._internationalBackground[l + Style.TOOL_AREA] = Style._background[Style.TOOL_AREA];
        Style._internationalBackground[l + Style.TABLE_ODD_ROW] = Style._background[Style.TABLE_ODD_ROW];
        Style._internationalBackground[l + Style.TABLE_EVEN_ROW_HIGHLIGHT] =  Style._background[Style.TABLE_EVEN_ROW_HIGHLIGHT];
        Style._internationalBackground[l + Style.TABLE_ODD_ROW_HIGHLIGHT] =  Style._background[Style.TABLE_ODD_ROW_HIGHLIGHT];
    }
    Style._internationalForeground["jp" + Style.PERIOD_UP] = Color.red;
    Style._internationalForeground["jp" + Style.PERIOD_NO_CHANGE] = Color.darkBlue1;
    Style._internationalForeground["jp" + Style.PERIOD_DOWN] = Color.green;
    Style._internationalBackground["jp" + Style.HIGHLIGHT_UP] = Color.red;
    Style._internationalBackground["jp" + Style.HIGHLIGHT_DOWN] = Color.green;
    Style._internationalForeground["it" + Style.PERIOD_UP] = Color.green;
    Style._internationalForeground["it" + Style.PERIOD_NO_CHANGE] = Color.darkBlue1;
    Style._internationalForeground["it" + Style.PERIOD_DOWN] = Color.red;
    Style._internationalBackground["it" + Style.HIGHLIGHT_UP] = Color.green;
    Style._internationalBackground["it" + Style.HIGHLIGHT_DOWN] =  Color.red;
    Style._internationalForeground["fr" + Style.PERIOD_UP] = Color.green;
    Style._internationalForeground["fr" + Style.PERIOD_NO_CHANGE] =  Color.darkBlue1;
    Style._internationalForeground["fr" + Style.PERIOD_DOWN] = Color.red;
    Style._internationalBackground["fr" + Style.HIGHLIGHT_UP] = Color.green;
    Style._internationalBackground["fr" + Style.HIGHLIGHT_DOWN] =  Color.red;
    Style._internationalForeground["de" + Style.PERIOD_UP] = Color.green;
    Style._internationalForeground["de" + Style.PERIOD_NO_CHANGE] = Color.darkBlue1;
    Style._internationalForeground["de" + Style.PERIOD_DOWN] = Color.red;
    Style._internationalBackground["de" + Style.HIGHLIGHT_UP] = Color.green;
    Style._internationalBackground["de" + Style.HIGHLIGHT_DOWN] = Color.red;
    Style._internationalForeground["us" + Style.PERIOD_UP] = Color.green;
    Style._internationalForeground["us" + Style.PERIOD_NO_CHANGE] = Color.black;
    Style._internationalForeground["us" + Style.PERIOD_DOWN] = Color.red;
    Style._internationalBackground["us" + Style.HIGHLIGHT_UP] = Color.green;
    Style._internationalBackground["us" + Style.HIGHLIGHT_DOWN] = Color.red;
    
    Style._fontSize[Style.DEFAULT] = Style.FONT_SIZE_12;
    Style._fontSize[Style.OVERRIDE_SIZE_12] = Style.FONT_SIZE_12;
    Style._fontSize[Style.TOUCH] = Style.FONT_SIZE_16;
    Style._fontSize[Style.TOUCH_UP] = Style.FONT_SIZE_16;
    Style._fontSize[Style.TOUCH_NO_CHANGE] = Style.FONT_SIZE_16;
    Style._fontSize[Style.TOUCH_DOWN] = Style.FONT_SIZE_16;
    Style._fontSize[Style.STOCK_SYMBOL_FONT] = Style.FONT_SIZE_16;
    Style._fontSize[Style.TAB] = Style.FONT_SIZE_10;
    Style._fontSize[Style.CENTER_DATUM_FONT] = Style.FONT_SIZE_10;
    Style._fontSize[Style.MONITOR_HEADER] = Style.FONT_SIZE_13;
    Style._fontSize[Style.MONITOR_SUB_HEADER] = Style.FONT_SIZE_13;
    Style._fontSize[Style.MONITOR_ODD] = Style.FONT_SIZE_13;
    Style._fontSize[Style.MONITOR_EVEN] = Style.FONT_SIZE_13;
    Style._fontSize[Style.TRADE_OLD_ODD] = Style.FONT_SIZE_13;
    Style._fontSize[Style.TRADE_OLD_EVEN] = Style.FONT_SIZE_13;
    Style._fontSize[Style.TRADE_OLD_HEADER] = Style.FONT_SIZE_13;
    Style._fontSize[Style.TRADE_LARGE_ODD] = Style.FONT_SIZE_13;
    Style._fontSize[Style.TRADE_LARGE_EVEN] = Style.FONT_SIZE_13;
    Style._fontSize[Style.ORDERBOOK_LARGE] = Style.FONT_SIZE_13;
    Style._fontSize[Style.DRAW_TOOLS_FONT] = Style.FONT_SIZE_9;
    
    Style._fontStyle[Style.DEFAULT] = Style.FONT_STYLE_PLAIN;
    Style._fontStyle[Style.HIGHLIGHT_UP] = Style.FONT_STYLE_BOLD;
    Style._fontStyle[Style.HIGHLIGHT_DOWN] = Style.FONT_STYLE_BOLD;
    Style._fontStyle[Style.PERIOD_UP] = Style.FONT_STYLE_BOLD;
    Style._fontStyle[Style.PERIOD_NO_CHANGE] = Style.FONT_STYLE_BOLD;
    Style._fontStyle[Style.PERIOD_DOWN] = Style.FONT_STYLE_BOLD;
    Style._fontStyle[Style.TABLE_HEADING] = Style.FONT_STYLE_BOLD;
    Style._fontStyle[Style.HIGHLIGHT_INSERT] = Style.FONT_STYLE_BOLD;
    Style._fontStyle[Style.HIGHLIGHT_DELETE] = Style.FONT_STYLE_BOLD;
    Style._fontStyle[Style.DELETED] = Style.FONT_STYLE_BOLD;
    Style._fontStyle[Style.BOLD_PRICE] = Style.FONT_STYLE_BOLD;
    Style._fontStyle[Style.HIGHLIGHT_SELECTED] = Style.FONT_STYLE_BOLD;
    Style._fontStyle[Style.COMBO_ITEM] = Style.FONT_STYLE_BOLD;
    Style._fontStyle[Style.TOUCH] = Style.FONT_STYLE_BOLD;
    Style._fontStyle[Style.TOUCH_UP] = Style.FONT_STYLE_BOLD;
    Style._fontStyle[Style.TOUCH_NO_CHANGE] = Style.FONT_STYLE_BOLD;
    Style._fontStyle[Style.TOUCH_DOWN] = Style.FONT_STYLE_BOLD;
    Style._fontStyle[Style.TAB] = Style.FONT_STYLE_BOLD;
    Style._fontStyle[Style.TOOL_AREA] = Style.FONT_STYLE_BOLD;
    Style._fontStyle[Style.STOCK_SYMBOL_FONT] = Style.FONT_STYLE_BOLD;
    Style._fontStyle[Style.CENTER_DATUM_FONT] = Style.FONT_STYLE_BOLD;
    Style._fontStyle[Style.BOTTOM_DATUM_FONT] = Style.FONT_STYLE_BOLD;
    Style._fontStyle[Style.MONITOR_HEADER] = Style.FONT_STYLE_BOLD;
    Style._fontStyle[Style.MONITOR_SUB_HEADER] = Style.FONT_STYLE_BOLD;
    
    Style.DEFAULT_FONT = Style.getFont(Style.FONT_SIZE_12, Style.FONT_STYLE_PLAIN);
}
/*
 * Number of styles
 */
Style.DEFAULT = 0;
Style.HIGHLIGHT_UP = 1;
Style.HIGHLIGHT_NO_CHANGE = 2;
Style.HIGHLIGHT_DOWN = 3;
Style.PERIOD_UP = 4;
Style.PERIOD_NO_CHANGE = 5;
Style.PERIOD_DOWN = 6;
Style.TABLE_HEADING = 7;
Style.HIGHLIGHT_INSERT = 8;
Style.HIGHLIGHT_DELETE = 9;
Style.DELETED = 10;
Style.BOLD_PRICE = 11;
Style.PRICE_1 = 12;
Style.PRICE_2 = 13;
Style.PRICE_3 = 14;
Style.PRICE_4 = 15;
Style.PRICE_5 = 16;
Style.PRICE_ODD = 17;
Style.PRICE_EVEN = 18;
Style.HIGHLIGHT_SELECTED = 19;
Style.COMBO_ITEM = 20;
Style.TOUCH = 21;
Style.TOUCH_UP = 22;
Style.TOUCH_NO_CHANGE = 23;
Style.TOUCH_DOWN = 24;
Style.TRADE_ODD = 25;
Style.TRADE_EVEN = 26;
Style.TAB = 27;
Style.TOOL_AREA = 28;
Style.PRICE_MARKET = 29;
Style.TABLE_SMALL = 30;
Style.TABLE_ODD_ROW = 31;
Style.TABLE_EVEN_ROW = 32;
Style.TABLE_ODD_ROW_HIGHLIGHT = 33;
Style.TABLE_EVEN_ROW_HIGHLIGHT = 34;
Style.STOCK_SYMBOL_FONT = 35;
Style.CENTER_DATUM_FONT = 36;
Style.BOTTOM_DATUM_FONT = 37;
Style.TRADE_OLD_ODD = 38;
Style.TRADE_OLD_EVEN = 39;
Style.TRADE_OLD_HEADER = 40;
Style.MONITOR_ODD = 41;
Style.MONITOR_EVEN = 42;
Style.MONITOR_HEADER = 43;
Style.MONITOR_SUB_HEADER = 44;
Style.OVERRIDE_SIZE_12 = 45;
Style.TRADE_LARGE_ODD = 46;
Style.TRADE_LARGE_EVEN = 47;
Style.ORDERBOOK_LARGE = 48;
Style.ORDERBOOK_LARGE_ODD = 49;
Style.ORDERBOOK_LARGE_EVEN = 50;
Style.DRAW_TOOLS_FONT = 51;
Style.MAX_STYLES = 52;

Style.BUTTON_HIGH_1 = 0;
Style.BUTTON_HIGH_2 = 1;
Style.BUTTON_MID = 2;
Style.BUTTON_LOW_1 = 3;
Style.BUTTON_LOW_2 = 4;
Style.SCROLLBAR = 5;
Style.BORDER = 6;
Style.EDIT_SELECT = 7;

/*
 * Fonts
 */
Style.FONT_SIZE_8 = 0;
Style.FONT_SIZE_9 = 1;
Style.FONT_SIZE_10 = 2;
Style.FONT_SIZE_11 = 3;
Style.FONT_SIZE_12 = 4;
Style.FONT_SIZE_13 = 5;
Style.FONT_SIZE_14 = 6;
Style.FONT_SIZE_16 = 7;
Style.FONT_SIZE_18 = 8;
Style.FONT_SIZE_24 = 9;
Style.FONT_STYLE_PLAIN = 0;
Style.FONT_STYLE_BOLD = 1;

Style.HTML_STYLES = "<style type='text/css'>BODY { font-family: sans-serif; } TABLE { font-size: 8pt; } TD { border-width: thin; padding: 1px; } TR { vertical-align: middle; } </style>";

/*
 * Images
 */
Style.IMAGE_TAB_0 = 0;
Style.IMAGE_TAB_1 = 1;
Style.IMAGE_TAB_2 = 2;
Style.IMAGE_TAB_3 = 3;
Style.IMAGE_TAB_4 = 4;
Style.IMAGE_TAB_5 = 5;
Style.IMAGE_TAB_6 = 6;
Style.IMAGE_TAB_7 = 7;
Style.IMAGE_BUTTON_UP = 8;
Style.IMAGE_BUTTON_DOWN = 9;
Style.IMAGE_LIGHT_RED_OFF = 10;
Style.IMAGE_LIGHT_RED_ON = 11;
Style.IMAGE_LIGHT_GREEN_OFF = 12;
Style.IMAGE_LIGHT_GREEN_ON = 13;
Style.IMAGE_LINK_OPEN = 14;
Style.IMAGE_LINK_CLOSED = 15;
Style.IMAGE_TICK = 16;
Style.IMAGE_BUTTON_LEFT = 17;
Style.IMAGE_BUTTON_RIGHT = 18;
Style.IMAGE_TICKER_PLAY = 19;
Style.IMAGE_TICKER_PAUSE = 20;
Style.IMAGE_TICKER_FFWD = 21;
Style.IMAGE_TICKER_RWD = 22;
Style.IMAGE_TICKER_SETUP = 23;
Style.IMAGE_DRAW_LINE = 24;
Style.IMAGE_DRAW_MIRROR_LINE = 25;
Style.IMAGE_DRAW_HORIZ_LINE = 26;
Style.IMAGE_DRAW_VERT_LINE = 27;
Style.IMAGE_DRAW_PARALLEL_LINE = 28;
Style.IMAGE_DRAW_BOX = 29;
Style.IMAGE_DRAW_CIRCLE = 30;
Style.IMAGE_DRAW_ARROW = 31;
Style.IMAGE_DRAW_TEXT = 32;
Style.IMAGE_DRAW_CALLOUT = 33;
Style.IMAGE_DRAW_FIB = 34;
Style.IMAGE_DRAW_CYCLE = 35;
Style.IMAGE_DRAW_SPEED = 36;
Style.IMAGE_DRAW_GANN = 37;
Style.IMAGE_DRAW_PITCHFORK = 38;
Style.IMAGE_DRAW_RAFF = 39;
Style.IMAGE_DRAW_C_RTR = 40;
Style.IMAGE_DRAW_NONE = 41;
Style.IMAGE_DRAW_LEGEND = 42;
Style.IMAGE_DRAW_TICKSCOPE = 43;
Style.IMAGE_DRAW_LEVEL2SCOPE = 44;
Style.IMAGE_SHOW_YC = 45;
Style.IMAGE_ZOOM_RESET = 46;
Style.IMAGE_ZOOM_IN = 47;
Style.IMAGE_ZOOM_OUT = 48;
Style.IMAGE_SNAP = 49;
Style.IMAGE_STYLE_LINE = 50;
Style.IMAGE_STYLE_LINE_SQ = 51;
Style.IMAGE_STYLE_CANDLE = 52;
Style.IMAGE_STYLE_BAR = 53;
Style.IMAGE_STYLE_CBAND = 54;
Style.IMAGE_STYLE_HEIKEN_ASHI = 55;
Style.IMAGE_STYLE_SHADED = 56;
Style.IMAGE_STYLE_GREEN_RED_BAR = 57;
Style.IMAGE_STYLE_NONE = 58;
Style.IMAGE_SYMBOLS_PREVIOUS = 59;
Style.IMAGE_SYMBOLS_NEXT = 60;
Style.IMAGE_SYMBOLS_FIRST = 61;
Style.IMAGE_SYMBOLS_LAST = 62;
Style.IMAGE_TAB_LEFT = 63;
Style.IMAGE_TAB_RIGHT = 64;
Style.IMAGE_CHANGE_ARROW_UP_BLACK = 65;
Style.IMAGE_CHANGE_ARROW_UP_BLUE = 66;
Style.IMAGE_CHANGE_ARROW_UP_GREEN = 67;
Style.IMAGE_CHANGE_ARROW_UP_RED = 68;
Style.IMAGE_CHANGE_ARROW_DOWN_BLACK = 69;
Style.IMAGE_CHANGE_ARROW_DOWN_BLUE = 70;
Style.IMAGE_CHANGE_ARROW_DOWN_GREEN = 71;
Style.IMAGE_CHANGE_ARROW_DOWN_RED = 72;
Style.IMAGE_CHANGE_ARROW_DOT_BLACK = 73;
Style.IMAGE_CHANGE_ARROW_DOT_BLUE = 74;
Style.IMAGE_CHANGE_ARROW_DOT_GREEN = 75;
Style.IMAGE_CHANGE_ARROW_DOT_RED = 76;
Style.IMAGE_PRINT = 77;
Style.IMAGE_MAGNIFY = 78;
Style.IMAGE_VSPLIT = 79;
Style.IMAGE_HSPLIT = 80;
Style.IMAGE_CLOSE = 81;
Style.IMAGE_COG = 82;
Style.IMAGE_SPANNER = 83;
Style.IMAGE_SYMBOL = 84;
Style.IMAGE_DESKTOP_LOGO = 85;
Style.IMAGE_DESKTOP_PIC = 86;
Style.IMAGE_CURSOR_HORIZONTAL = 87;
Style.IMAGE_CURSOR_HAND = 88;
Style.IMAGE_MONITORPOPUP = 89;
Style.IMAGE_SCREENSHOT = 90;
Style.IMAGE_DESKTOP_OPEN = 91;
Style.IMAGE_DESKTOP_SAVE = 92;
Style.IMAGE_DESKTOP_SAVEAS = 93;
Style.IMAGE_DESKTOP_FITWINDOW = 94;
Style.IMAGE_DRAW_TIME_FIB = 95;
Style.IMAGE_CSV_EXPORT_EQ_DEV = 96;
Style.IMAGE_SHOW_CHANGES = 97;
Style.IMAGE_CHECKBOX_ON = 98;
Style.IMAGE_CHECKBOX_OFF = 99;
Style.IMAGE_DRAW_LOAD = 100;
Style.IMAGE_DRAW_SAVE = 101;
Style.IMAGE_DRAW_CLR = 102;
Style.IMAGE_DRAW_LTOOL = 103;
Style.IMAGE_DRAW_FIB_EXT = 104;     
Style.IMAGE_BROKER_LOGO_9TRADE = 105;
Style.IMAGE_BROKER_BTN_BUY = 106;
Style.IMAGE_BROKER_BTN_SELL = 107;
Style.IMAGE_BROKER_CONNECT = 108;
Style.IMAGE_BROKER_BTN_CANCEL_ORDER = 109;
Style.IMAGE_BROKER_BTN_REFRESH = 110;
Style.IMAGE_BROKER_BTN_EDIT_ORDER = 111;
Style.IMAGE_BROKER_BTN_AMEND_BUY = 112;
Style.IMAGE_BROKER_BTN_AMEND_SELL = 113;
Style.IMAGE_BROKER_BTN_CANCEL_TICKET = 114;
Style.IMAGE_BROKER_BR_BTN_BUY = 115;
Style.IMAGE_BROKER_BR_BTN_SELL = 116;
Style.IMAGE_BROKER_BR_BTN_AMEND_BUY = 117;
Style.IMAGE_BROKER_BR_BTN_AMEND_SELL = 118;
Style.IMAGE_BROKER_BR_BTN_CANCEL_TICKET = 119;
Style.IMAGE_BROKER_BR_BTN_SEARCH = 120;
Style.IMAGE_BROKER_BR_BTN_LOGIN = 121;
Style.IMAGE_BROKER_BTN_ORDER_REFRESH = 122;
Style.MAX_IMAGES = 123;
Style.imageFileNames = ["tab0.gif", 
                        "tab1.gif", 
                        "tab2.gif", 
                        "tab3.gif", 
                        "tab4.gif", 
                        "tab5.gif", 
                        "tab6.gif", 
                        "tab7.gif", 
                        "buttonup.gif", 
                        "buttondown.gif", 
                        "lightr0.gif", 
                        "lightr1.gif", 
                        "lightg0.gif", 
                        "lightg1.gif", 
                        "link0.gif", 
                        "link1.gif", 
                        "tick_icon.gif", 
                        "buttonleft.gif", 
                        "buttonright.gif", 
                        "ticker_play.gif", 
                        "ticker_pause.gif", 
                        "ticker_ffwd.gif", 
                        "ticker_rwd.gif", 
                        "ticker_setup.gif", 
                        "ic_linetool.gif", 
                        "ic_line_mirror.gif", 
                        "ic_horizontal.gif", 
                        "ic_vertical.gif", 
                        "ic_parallel.gif", 
                        "ic_box.gif", 
                        "ic_circle.gif", 
                        "ic_arrow.gif", 
                        "ic_text.gif", 
                        "ic_callbox.gif", 
                        "ic_fibretrace.gif", 
                        "ic_cycle_line.gif", 
                        "ic_speedres.gif", 
                        "ic_ganfan.gif", 
                        "ic_apitchfrk.gif", 
                        "ic_raffre.gif", 
                        "ic_cretr.gif", 
                        "ic_default.gif", 
                        "ic_legend.gif", 
                        "ic_tickscope.gif", 
                        "ic_level2scope.gif", 
                        "ic_yc.gif", 
                        "ic_viewreset.gif", 
                        "ic_zoomin.gif", 
                        "ic_zoomout.gif", 
                        "ic_snap2chart.gif", 
                        "ic_line.gif",
                        "ic_squarelines.gif", 
                        "ic_candle.gif", 
                        "ic_bar.gif", 
                        "ic_cband.gif", 
                        "ic_heiken_ashi.gif", 
                        "ic_shaded.gif", 
                        "ic_green_red_bar.gif", 
                        "ic_none.gif", 
                        "ic_previouschart.gif", 
                        "ic_nextchart.gif", 
                        "ic_firstchart.gif", 
                        "ic_lastchart.gif", 
                        "tabarrow1.gif", 
                        "tabarrow2.gif",
                        "ch_up-black.gif", 
                        "ch_up-blue.gif", 
                        "ch_up-green.gif", 
                        "ch_up-red.gif",  
                        "ch_down-black.gif",
                        "ch_down-blue.gif", 
                        "ch_down-green.gif", 
                        "ch_down-red.gif", 
                        "ch_dot-black.gif", 
                        "ch_dot-blue.gif",
                        "ch_dot-green.gif",
                        "ch_dot-red.gif", 
                        "ic_print.gif",
                        "ic_magnify.gif", 
                        "ic_vsplit.gif",
                        "ic_hsplit.gif", 
                        "ic_close.gif", 
                        "ic_cog.gif", 
                        "ic_spanner.gif",
                        "ic_symbol.gif", 
                        "desktoplogo.gif", 
                        "desktoppic.gif",
                        "cursor-horizontal.gif", 
                        "cursor-hand.gif",  
                        "monitorpopup.gif", 
                        "ic_screenshot.gif", 
                        "desktop_open.gif", 
                        "desktop_save.gif", 
                        "desktop_save_as.gif", 
                        "desktop_fitwindow.gif",
                        "ic_fibvert.gif", 
                        "ic_excel.gif",
                        "ic_percent.gif",
                        "checkbox-on.gif", 
                        "checkbox-off.gif", 
                        "ic_load.gif", 
                        "ic_save.gif",
                        "ic_clr.gif", 
                        "ic_ltool.gif", 
                        "ic_fibretrace_ext.gif", 
                        "broker/9trade.png",
                        "broker/buy.png", 
                        "broker/sell.png",
                        "broker/connect.gif", 
                        "broker/closeicon.gif",
                        "broker/refresh.gif",
                        "broker/edit.gif", 
                        "broker/amendbuy.png", 
                        "broker/amendsell.png",
                        "broker/cancel.png", 
                        "broker/buy_br.gif",
                        "broker/sell_br.gif",
                        "broker/amendbuy_br.gif", 
                        "broker/amendsell_br.gif",
                        "broker/cancel_br.gif", 
                        "broker/search_br.gif",
                        "broker/login.gif", 
                        "broker/order_refresh_br.gif"];