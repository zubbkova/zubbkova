/* eslint no-unused-vars: "off" */
/* global Cursor, Color, Rectangle, FeedContent, RootComponent, Style */
/** 
 * ---------
 * Component
 * ---------
 * @constructor 
 * @param {string} id - ID of div
 * @param {Component=} delegate
 * @param {string=} tooltip
 */
function Component(id, delegate, tooltip) {
    this._delegate = delegate;
    this._x = 0;
    this._absoluteX = 0;
    this._y = 0;
    this._absoluteY = 0;
    this._z = 0;
    this._leftMargin = 0;
    this._topMargin = 0;
    this._rightMargin = 0;
    this._bottomMargin = 0;
    this._width = 0;
    this._height = 0;
    this._autoWidth = false;
    this._autoHeight = false;
    this._child = [];
    this._canvas = undefined;
    this._roundedCorners = 0;
    this._borderSize = 1;
    this._enabled = true;
    this._border = Component.BORDER_NONE;
    if (id)
        this._id = id;
    else
        this._id = "comp" + (Component._nextID++);
    if (tooltip)
        this._tooltip = tooltip;
    else 
        this._tooltip = "";
    this._borderColor = undefined;
    this._drawBounds = true;
    this._drawCreate = true;
    this._shown = true;
    this._cursor = Cursor.DEFAULT_CURSOR;
    this._minWidth = 0;
    this._minHeight = 0;
    this._shadowColor = new Color(0, 0, 0, 0.4);
    this._textDecoration = undefined;
    this._focusable = true;
    // from JmComponent
    this._index = 0;
    this._absoluteBounds = new Rectangle();
    this._autoPeriodStyle = false;
    this._eventTag = undefined;
    this._state = Component.STATE_DEFAULT;
    this._stateFlags = 0;
    this._newState = undefined;
    this._newStateFlags = 0;
    this._captureX = -1;
    this._captureY = -1;
    this._styleSlot = [0, 0, 0];
    this.setStyle(Component.STYLE_SLOT_DEFAULT, -1);
    this.setStyle(Component.STYLE_SLOT_HIGHLIGHT, -1);
    this.setStyle(Component.STYLE_SLOT_OVERRIDE, -1);
}
/** @static */
Component._nextID = 0;
/** @static */
Component.BORDER_NONE = 0;
/** @static */
Component.BORDER_SOLID = 1;
/** @static */
Component.BORDER_INSET = 2;
/** @static */
Component.BORDER_BEVEL = 3;
/** @static */
Component.BORDER_FLOAT = 4;
/** @static */
Component.BORDER_DISABLE = 5;
/** @static */
Component.STYLE_SLOT_DEFAULT = 0;
/** @static */
Component.STYLE_SLOT_HIGHLIGHT = 1;
/** @static */
Component.STYLE_SLOT_OVERRIDE = 2;
/** @static */
Component.STATE_DEFAULT = 0;
/** @static */
Component.STATE_HIGHLIGHTED = 1;
/** @static */
Component.STATE_NEW_CONTENT = 2;
/** @static */
Component.COMPONENT_X_GAP = 8;
/** @static */
Component.COMPONENT_Y_GAP = 4;
/** @static */
Component.TOOLBAR_BUTTON_SIZE = 20;
/** @static */
Component.textDecorations = ["blink", "line-through", "overline", "underline", "none", "inherit"];
/** @static */
Component.TEXT_DECORATION_BLINK = 0;
/** @static */
Component.TEXT_DECORATION_LINE_THROUGH = 1;
/** @static */
Component.TEXT_DECORATION_OVERLINE = 2;
/** @static */
Component.TEXT_DECORATION_UNDERLINE = 3;
/** @static */
Component.TEXT_DECORATION_NONE = 4;
/** @static */
Component.TEXT_DECORATION_INHERIT = 5;
/**
 * @param {number=} t - milliseconds
 * @param {boolean=} res - previous result
 * @returns {boolean}
 */
Component.prototype.process = function(t, res) {
    for (var i = this._child.length - 1; i >= 0; i--) {
        res = this._child[i].process(t, res);
    }
    return res;
}
/**
 * @param {boolean} e - enable or not
 */
Component.prototype.setEnabled = function(e) {
    this._enabled = e;
    this._drawAccess = true;
    for (var i = 0; i < this._child.length; i++) {
        this._child[i].setEnabled(e);
    }
}
Component.prototype.create = function() {
    if (this._parent === undefined)
        return;
    this._parent._div.append("<div id=\"" + this._id + "\" title=\"" + this._tooltip + "\"></div>");
    this._div = $("#" + this._id);
    this._div.css("position", "absolute");
    this._div.onselectstart = function() { return false; }
    this._div.unselectable = "on";
    this._div.css('cursor', 'inherit'); 
    this._div.css('box-sizing', 'border-box'); 
    this._div.css('user-select', 'none'); 
    this._div.css('-o-user-select', 'none'); 
    this._div.css('-moz-user-select', 'none'); 
    this._div.css('-khtml-user-select', 'none'); 
    this._div.css('-webkit-user-select', 'none'); 
}
/**
 * @param {boolean} force
 */
Component.prototype.draw = function(force) {
    if (this._drawCreate) {
        this.create();
        this._drawCreate = false;
    }
    if (this._drawCursor) {
        this._div.css("cursor", Cursor._cursorName[this._cursor]);        
        this._drawCursor = false;
    }
    if (this._drawAccess) {
        this._drawAccess = false;
        if (this._enabled) {
            this._div.css('pointer-events', 'auto'); 
        } else {
            this._div.css('pointer-events', 'none');
        }
    }
    if (this._drawBounds) {
        this._drawBounds = false;
        if (this._errorState) {
            this._div.css("left", this._x - 2 + "px");
            this._div.css("top", this._y - 2 + "px");
        } else {
            this._div.css("left", this._x + "px");
            this._div.css("top", this._y + "px");
        }
        if (this._autoWidth) {
            this._div.css("width", "auto");
        } else {
            if (this._errorState) {
                this._div.css("width", this._width + 4 + "px");
            }
            else {
                this._div.css("width", this._width + "px");
            }
        }
        if (this._autoHeight) {
            this._div.css("height", "auto");
        } else {
            if (this._errorState) {
                this._div.css("height", this._height + 4 + "px");
            } else {
                this._div.css("height", this._height + "px");
            }
        }
        this._div.css("z-index", this._z);
        this._div.css("display", this._shown ? "block" : "none");
        if (this._overflowAuto) {
            this._div.css("overflow", "auto");    
        } else
            this._div.css("overflow", this._clipping ? "hidden" : "visible");
    }
    if (this._drawColors) {
        this._drawColors = false;
        this._div.css("font-family", this._font);
        this._div.css("font-weight", this._fontWeight);
        this._div.css("font-size", this._fontSize+"px");
        this._div.css("color", this._color);            
        this._div.css('border-radius', this._roundedCorners + "px " + this._roundedCorners + "px");
        if (this._textDecoration) {
            this._div.css("text-decoration", Component.textDecorations[this._textDecoration]);
        }
        if (!this._gradientTop) {
            this._div.css("background", this._background);
        } else {
            this._div.css("background", "linear-gradient(to bottom,  " + this._gradientTop + " 0%," + this._gradientBottom + " 100%)");
        }
        switch (this._border) {
            case Component.BORDER_DISABLE:
                break;
            case Component.BORDER_BEVEL: 
                this._div.css("border-top","2px solid #fff");
                this._div.css('box-shadow', "0px 1px 2px #888");
                break;
            case Component.BORDER_INSET:
                this._div.css("border-bottom","1px solid #ccc");
                this._div.css('box-shadow', "0px -1px 2px #888");    
                break;
            case Component.BORDER_SOLID:
                this._div.css("border", this._borderSize + "px solid " + this._borderColor);
                break;
            case Component.BORDER_FLOAT:
                this._div.css('box-shadow', "0px 4px 20px " + this._shadowColor);
                break;
            case Component.BORDER_NONE:
                this._div.css('border', "");
                break;
        }
    }
}
Component.prototype.refresh = function() {
    this.draw(false);
    for (var i = 0; i < this._child.length; i++) {
        this._child[i].refresh();
    }
}
/**
 * @param {Component|Array} child
 */
Component.prototype.add = function(child) {
    if (Utils.getConstructorName(child) === "Array") {
        for (var i = 0; i < child.length; i++) {
            child[i].setParent(this);
            this._child.push(child[i]); 
        }
    } else {
        child.setParent(this);
        this._child.push(child);
    }
}
/**
 * @param {Component} child
 */
Component.prototype.remove = function(child) {
    for (var i = 0; i < this._child.length; i++) {
        if (this._child[i] === child) {
            if (child._div) {
                child._div.remove();
            }
            this._child.splice(i, 1);
            child.handleRemove();
            return;
        }
    }
}
Component.prototype.removeAll = function() {
    for (var i = 0; i < this._child.length; i++) {
        var child = this._child[i];
        if (child._div) {
            child._div.remove();
        }
        child.handleRemove();
    }
    this._child = [];
}
/**
 * @param {Component} parent
 */
Component.prototype.setParent = function(parent) {
    this._parent = parent;
    this.inheritProperties();
}
Component.prototype.inheritProperties = function() {
    if (this._font === undefined) {
        this._font=this._parent._font;
    }
    if (this._fontSize === undefined) {
        this._fontSize=this._parent._fontSize;
    }
    if (this._z === 0) {
        this._z=this._parent._z + 1;
    }
    for (var i = 0; i < this._child.length; i++) {
        this._child[i].inheritProperties();
    }
}
Component.prototype.blur = function() {
//    if (this._focus) {
        this._focus = false;
        return true;
//    }
}
Component.prototype.focus = function() {
    if (!this._focusable)
        return false;
//    if (!this._focus && ) {
        this._focus = true;
        return true;
//    }
}
Component.prototype.isHidden = function() {
    return (!this._shown);
}
Component.prototype.isShown = function() {
    return this._shown;
}
/**
 * @param {number} x
 * @param {number} y
 */
Component.prototype.isInside = function(x, y) {
	return (x >= this._x && y >= this._y && (x < this._x + this._width) && (y < this._y + this._height));
}
Component.prototype.hide = function() {
    if (this._shown) {
        this._shown = false;
        this._drawBounds = true;
    }
}
Component.prototype.show = function() {
    if (!this._shown) {
        this._shown = true;
        this._drawBounds = true;
    }
}
/**
 * @param {string} tooltip
 */
Component.prototype.setTooltip = function(tooltip) {
    this._div[0].title = tooltip;
}
/**
 * @param {boolean} visible
 * @returns {boolean}
 */
Component.prototype.setVisible = function(visible) {
    if (visible) {
        this.show();
    } else {
        this.hide();
    }
    return this._shown;
}
Component.prototype.loadContents = function() { 
    return false; 
}
/**
 * @param {FeedContent} fc
 */
Component.prototype.feedDelegate_feed = function(fc) {
    this.doUpdate(fc._flags);
}
/**
 * @param {number=} flags
 */
Component.prototype.doUpdate = function(flags) {
    if (this._autoPeriodStyle) {
        if ((flags & FeedContent.FLAG_UPDATE_UP) !== 0) {
            flags |= FeedContent.FLAG_PERIOD_UP;
        } else if ((flags & FeedContent.FLAG_UPDATE_DOWN) !== 0) {
            flags |= FeedContent.FLAG_PERIOD_DOWN;
        }
    }
    if ((flags & FeedContent.FLAG_INITIAL_VALUE) !== 0) {
        this._stateFlags = flags;
        this.loadContents();
        this.setState(Component.STATE_DEFAULT);
    } else {
        this._newStateFlags = flags;
        if ((flags & FeedContent.FLAG_LIST_INSERT) !== 0) {
            this.setState(Component.STATE_NEW_CONTENT);
        } else {
            this.setState((this._state === Component.STATE_DEFAULT) ? Component.STATE_HIGHLIGHTED : Component.STATE_NEW_CONTENT);
        }
    }
}
/**
 * @param {ChartEvent|Level2Book_OrderEvent} e
 * @param {Component=} d - destination
 */
Component.prototype.notify = function(e, d) {
    var destination;
    if (arguments.length === 1) {
        destination = this._delegate;
    } else {
        destination = d;
    }
    if (destination){
        e._source = this;
        e._destination = destination;
        e._tag = this._eventTag;
        this.sendEvent(e);
        return true;
    }
    return false;
}
/**
 * @param {ChartEvent|Level2Book_OrderEvent} e
 */
Component.prototype.sendEvent = function(e) {
    if (e._destination) {
        e._destination.onCustomEvent(e);
    }
}
Component.prototype.feedDelegate_connected = function() {}
Component.prototype.feedDelegate_disconnected = function() {}
Component.prototype.feedDelegate_loadingComplete = function() {}
/**
 * @param {Component} control - next control for focus
 */
Component.prototype.setNextControl = function(control) {
    this._nextControl = control;  
}
/**
 * @param {number} index - index of focus
 */
Component.prototype.setIndex = function(index) {
    this._index = index;
}
Component.prototype.getIndex = function() {
    return this._index;
}
/**
 * @param {number} d
 */
Component.prototype.setTextDecoration = function(d) {
    this._textDecoration = d;
    this._drawColors = true;
}
/**
 * @param {Color} color
 */
Component.prototype.setShadowColor = function(color) {
    this._shadowColor = color;
}
/**
 * @param {number} leftMargin
 * @param {number} topMargin
 * @param {number} rightMargin
 * @param {number} bottomMargin
 */
Component.prototype.setMargin = function(leftMargin, topMargin, rightMargin, bottomMargin) {
    if (leftMargin !== this._leftMargin || topMargin !== this._topMargin || rightMargin !== this._rightMargin || bottomMargin !== this._bottomMargin) {
        this._leftMargin = leftMargin;
        this._topMargin = topMargin;
        this._rightMargin = rightMargin;
        this._bottomMargin = bottomMargin;
    }
}
/**
 * @param {boolean} on
 */
Component.prototype.setErrorState = function(on) {
    if (this._errorState !== on) {
        this._errorState = on;
        return true;
    }
}
/**
 * @param {number} border
 */
Component.prototype.setBorder = function(border) {
    if (this._border !== border) {
        this._drawColors = true;
        this._border = border;
    }    
}
/**
 * @param {number} borderSize
 */
Component.prototype.setBorderSize = function(borderSize) {
    if (this._borderSize !== borderSize) {
        this._drawColors = true;
        this._borderSize = borderSize;
    }    
}
/**
 * @param {Color} color
 */
Component.prototype.setBorderColor = function(color) {
    if (this._borderColor !== color) {
        this._drawColors = true;
        this._borderColor = color;
    }    
}
/**
 * @param {Color} top
 * @param {Color} bottom
 */
Component.prototype.setGradient = function(top, bottom) {
    if (this._gradientTop !== top || this._gradientBottom !== bottom) {
        this._gradientTop = top;
        this._gradientBottom = bottom;
        this._drawColors = true;
    }
}
/**
 * @param {Font} font
 */
Component.prototype.setFont = function(font) {
    if (font !== this._font) {
        this._font = font;
        this._drawColors = true;
    }
}
Component.prototype.getFont = function() {
    return this._font;
}
/**
 * @param {number} w
 */
Component.prototype.setFontWeight = function(w) {
    if (w !== this._fontWeight) {
        this._fontWeight = w;
        this._drawColors = true;
    }
}
Component.prototype.getFontWeight = function() {
    return this._fontWeight;
}
/**
 * @param {number} size
 */
Component.prototype.setFontSize = function(size) {
    size = Math.floor(size);
    if (size !== this._fontSize) {
        this._fontSize = size;
        this._drawColors = true;
    }
}
Component.prototype.getFontSize = function() {
    return this._fontSize;
}
/**
 * @param {Color|string} color
 */
Component.prototype.setBackground = function(color) {
    if (this._background !== color) {
        this._drawColors = true;
        this._background = color;
        this._gradientTop = undefined;
    }
}
Component.prototype.getBackground = function() {
    return this._background;
}
/**
 * @param {Color} color
 */
Component.prototype.setForeground = function(color) {
    if (this._foreground !== color) {
        this._drawColors = true;
        this._foreground = color;
    }
}
Component.prototype.getForeground = function() {
    return this._foreground;
}
/**
 * @param {number} corners
 */
Component.prototype.setRoundedCorners = function(corners) {
    if (this._roundedCorners !== corners) {
        this._drawColors = true;
        this._roundedCorners = corners;
    }
}
/**
 * @param {Color} color
 */
Component.prototype.setColor = function(color) {
    if (this._color !== color) {
        this._drawColors = true;
        this._color = color;
        return true;
    }
    return false;
}
Component.prototype.getColor = function() {
    return this._color;
}
/**
 * @param {Component} c
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 */
Component.prototype.rightOf = function(c, x, y, width, height) {
    this.setBounds(c._x + c._width + x, c._y + y, width, height);
}
/**
 * @param {Component} c
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 */
Component.prototype.bottomOf = function(c, x, y, width, height) {
    this.setBounds(c._x + x, c._y + c._height + y, width, height);
}
/**
 * @param {number} w
 * @param {number} h
 */
Component.prototype.setMinSize = function(w, h) {
    this._minWidth = w;
    this._minHeight = h;
}
/**
 * @param {number} w
 * @param {number} h
 */
Component.prototype.setMaxSize = function(w, h) {
    this._maxWidth = w;
    this._maxHeight = h;
}
/**
 * @param {boolean} clipping
 */
Component.prototype.setClipping = function(clipping) {
	if (clipping !== this._clipping) {
		this._clipping = true;
		this._drawBounds = true;
	}
}
/**
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 */
Component.prototype.setBounds = function(x, y, width, height) {    
    x = Math.floor(x);
    y = Math.floor(y);
    width = Math.floor(width);
    height = Math.floor(height);
    if (width < this._minWidth) width = this._minWidth;
    if (height < this._minHeight) height = this._minHeight;
    if (this._maxWidth && width > this._maxWidth) width = this._maxWidth;
    if (this._maxHeight && height > this._maxHeight) height = this._maxHeight;
    if (x !== this._x || y !== this._y || width !== this._width || height !== this._height) {
        if (this._isPopup) {
            this._popupX = x;
            this._popupY = y;
        } else {
            this._x = x;
            this._y = y;
        }
        this._width = width;
        this._height = height;
        this._drawBounds = true;
        return true;
    }
    return false;
}
/**
 * @param {number} x
 * @param {number} y
 */
Component.prototype.setLocation = function(x, y) {
    this.setBounds(x, y, this._width, this._height);    
}
/**
 * @param {number} w
 * @param {number} h
 */
Component.prototype.setSize = function(w, h) {
    this.setBounds(this._x, this._y, w, h);
}
/**
 * @param {number} x
 */
Component.prototype.setX = function(x) {
    this.setBounds(x, this._y, this._width, this._height);
}
/**
 * @param {number} y
 */
Component.prototype.setY = function(y) {
    this.setBounds(this._x, y, this._width, this._height);
}
/**
 * @param {number} z
 */
Component.prototype.setZ = function(z) {
    if (this._z !== z) {
        this._z = z;
        this._drawBounds = true;
    }
}
Component.prototype.getZ = function() {
    return this._z;
}
/**
 * @param {number} width
 */
Component.prototype.setWidth = function(width) {
    this.setBounds(this._x, this._y, width, this._height);
}
/**
 * @param {number} height
 */
Component.prototype.setHeight = function(height) {
    this.setBounds(this._x, this._y, this._width, height);
}
/**
 * @param {boolean} a
 */
Component.prototype.setAutoWidth = function(a) {
    this._autoWidth = a;
    this._drawBounds = true;
}
/**
 * @param {boolean} a
 */
Component.prototype.setAutoHeight = function(a) {
    this._autoHeight = a;
    this._drawBounds = true;
}
Component.prototype.getX = function() {
    return this._x;
}
Component.prototype.getY = function() {
    return this._y;
}
Component.prototype.getWidth = function() {
    return this._width;
}
Component.prototype.getHeight = function() {
    return this._height;
}
Component.prototype.getCursor = function() {
    RootComponent.getCursor();
}
/**
 * @param {number} cursor
 */
Component.prototype.setCursor = function(cursor) {
    RootComponent.changeCursor(cursor);
}
/**
 * @param {Object} object
 */
Component.prototype.setObject = function(object) {
    this._object = object;
}
Component.prototype.getObject = function() {
    return this._object;
}
Component.prototype.getAutoPeriodStyle = function() {
    return this._autoPeriodStyle;
}
/**
 * @param {boolean} a
 */
Component.prototype.setAutoPeriodStyle = function(a) {
    this._autoPeriodStyle = a;
}
Component.prototype.getState = function() {
    return this._state;
}
/**
 * @param {number} s
 */
Component.prototype.setState = function(s) {
    this._state = s;
    switch (this._state) {
        case Component.STATE_HIGHLIGHTED:
            this._stateFlags = this._newStateFlags;
            this._newState = Component.STATE_NEW_CONTENT;
            break;
        case Component.STATE_NEW_CONTENT:
            this._stateFlags = this._newStateFlags;
            this.loadContents();
            this._newState = Component.STATE_DEFAULT;
            break;
        case Component.STATE_DEFAULT:
            this._stateFlags &= ~(FeedContent.FLAG_HIGHLIGHT | FeedContent.FLAG_UPDATE_UP | FeedContent.FLAG_UPDATE_DOWN | FeedContent.FLAG_UPDATE_NO_CHANGE | FeedContent.FLAG_LIST_INSERT);
            break;
    }
    if ((this._stateFlags & FeedContent.FLAG_LIST_INSERT) !== 0) {
        this.setStyle(Component.STYLE_SLOT_HIGHLIGHT, Style.HIGHLIGHT_INSERT);
    } else if ((this._stateFlags & FeedContent.FLAG_LIST_DELETE) !== 0) {
        this.setStyle(Component.STYLE_SLOT_HIGHLIGHT, Style.HIGHLIGHT_DELETE);
    } else if ((this._stateFlags & FeedContent.FLAG_HIGHLIGHT) !== 0) {
        this.setStyle(Component.STYLE_SLOT_HIGHLIGHT, Style.HIGHLIGHT_NO_CHANGE);
    } else if ((this._stateFlags & FeedContent.FLAG_UPDATE_UP) !== 0) {
        this.setStyle(Component.STYLE_SLOT_HIGHLIGHT, Style.HIGHLIGHT_UP);
    } else if ((this._stateFlags & FeedContent.FLAG_UPDATE_DOWN) !== 0) {
        this.setStyle(Component.STYLE_SLOT_HIGHLIGHT, Style.HIGHLIGHT_DOWN);
    } else if ((this._stateFlags & FeedContent.FLAG_UPDATE_NO_CHANGE) !== 0) {
        this.setStyle(Component.STYLE_SLOT_HIGHLIGHT, Style.HIGHLIGHT_NO_CHANGE);
    } else if ((this._stateFlags & FeedContent.FLAG_PERIOD_UP) !== 0) {
        this.setStyle(Component.STYLE_SLOT_HIGHLIGHT, Style.PERIOD_UP);
    } else if ((this._stateFlags & FeedContent.FLAG_PERIOD_DOWN) !== 0) {
        this.setStyle(Component.STYLE_SLOT_HIGHLIGHT, Style.PERIOD_DOWN);
    } else if ((this._stateFlags & FeedContent.FLAG_PERIOD_NO_CHANGE) !== 0) {
        this.setStyle(Component.STYLE_SLOT_HIGHLIGHT, Style.PERIOD_NO_CHANGE);
    } else {
        this.setStyle(Component.STYLE_SLOT_HIGHLIGHT, -1);
    }
}
Component.prototype.getEventTag = function() {
    return this._eventTag;
}
/**
 * @param {string} t
 */
Component.prototype.setEventTag = function(t) {
    this._eventTag = t;
}
Component.prototype.getDelegate = function() {
    return this._delegate;
}
/**
 * @param {Component} c
 */
Component.prototype.setDelegate = function(c) {
    this._delegate = c;
}
Component.prototype.getStyleSlot = function() {
    return this._styleSlot;
}
/**
 * @param {number} slot
 * @param {number} style
 */
Component.prototype.setStyle = function(slot, style) {
    if (this._styleSlot[slot] === style) return false;
    this._styleSlot[slot] = style;
    
    this.setBackground(Style.getBackground(Style.DEFAULT));
    this.setForeground(Style.getForeground(Style.DEFAULT));
    var fontSize = Style.getFontSize(Style.DEFAULT);
    var fontStyle = Style.getFontStyle(Style.DEFAULT);
    
    var nfg, nbg, fs, fst;
    for (var i = 0; i < 3; i++) {
        if (this._styleSlot[i] === -1) 
            continue;
        nfg = Style.getForeground(this._styleSlot[i]);
        if (nfg) {
            this.setForeground(nfg);  
        }
        nbg = Style.getBackground(this._styleSlot[i]);
        if (nbg) {
            this.setBackground(nbg);
        }
        fs = Style.getFontSize(this._styleSlot[i]);
        if (fs !== -1) {
            fontSize = fs;
        }
        fst = Style.getFontStyle(this._styleSlot[i]);
        if (fst !== -1) {
            fontStyle = fst;
        }
        if (fontSize !== -1 && fontStyle !== -1) {
            var font = Style.getFont(fontSize, fontStyle);
            this.setFontSize(font.getSize());
            this.setFontWeight(font.getStyle());
        } 
    }
    return true;
}
Component.prototype.getAbsoluteLocation = function() {
    var top = 0, left = 0;
    var element = $("#" + this._id)[0];
    do {
        top += element.offsetTop  || 0;
        left += element.offsetLeft || 0;
        if (element && element.id === "chartContainer")
            break;
        element = element.offsetParent;
    } while(element);
    this._absoluteX = left;
    this._absoluteY = top;
    return {
        _y: top,
        _x: left
    }
}
Component.prototype.getAbsoluteBounds = function() {
    var p = this.getAbsoluteLocation();
    this._absoluteBounds._x = p._x;
    this._absoluteBounds._y = p._y;
    this._absoluteBounds._width = this._width;
    this._absoluteBounds._height = this._height;
    return {_x: p._x, _y: p._y, _width: this._width, _height: this._height}
}
/**
 * @param {number=} x
 * @param {number=} y
 * @param {number=} b
 */
Component.prototype.onMouseDown = function(x, y, b) {
    return false;
}
/**
 * @param {number=} x
 * @param {number=} y
 */
Component.prototype.onMouseUp = function(x, y) {
    this.setDrag(false);
    return false;
}
/**
 * @param {boolean} drag
 */
Component.prototype.setDrag = function(drag) {
    for (var i = this._child.length - 1; i >= 0; i--) {
        var c = this._child[i];
        if (typeof c != 'undefined') {
            c.setDrag(drag);
        }                
    }
    this._drag = drag;
}
/**
 * @param {number} x
 * @param {number} y
 */
Component.prototype.onMouseMove = function(x, y) {
    return false;
}
/**
 * @param {number} x
 * @param {number} y
 * @param {number} delta
 */
Component.prototype.onMouseWheel = function(x, y, delta){
    return false;
}
Component.prototype.onCaptureLost = function() {
    this.blur();
    this.refresh();
    return false;
}
Component.prototype.onCapture = function() {
    this.focus();
    this.refresh();
    this._captureX = this._x;
    this._captureY = this._y;
}
Component.prototype.onMouseEnter = function() {
    return false;
}
Component.prototype.onMouseLeave = function() {
    return false;
}
/**
 * @param {number} key
 */
Component.prototype.onKeyDown = function(key) {
    return false;
}
/**
 * @param {number} key
 */
Component.prototype.onKeyUp = function(key) {
    return false;
}
/**
 * @param {number} w
 * @param {number} h
 */
Component.prototype.onResize = function(w, h) {
    return false;
}
Component.prototype.onRemove = function() {}
/**
 * @param {ChartEvent|Level2Book_OrderEvent} e
 */
Component.prototype.onCustomEvent = function(e) {
    return false;
}
/**
 * @param {number} x
 * @param {number} y
 */
Component.prototype.handleMouseMove = function(x, y) {
    if (!this._shown) 
        return false;
    x -= this._x;
    y -= this._y;
    RootComponent._mouseIn[this._id] = this;
    for (var i = this._child.length - 1; i >= 0; i--) {
        var c = this._child[i];
        if (x >= c._x && y >= c._y &&  x < c._x + c._width && y < c._y + c._height) {
            if (c.handleMouseMove(x, y)) 
                return true;
        }                
    }
    return this.onMouseMove(x, y);
}
/**
 * @param {number} w
 * @param {number} h
 */
Component.prototype.handleResize = function(w, h) {
    for (var i = this._child.length - 1; i >= 0; i--) {
        var c = this._child[i];
        if (c.handleResize(w, h)) 
            return true;
    }
    return this.onResize(w, h);
}
Component.prototype.handleRemove = function() {
    for (var i = this._child.length - 1; i >= 0; i--) {
        this._child[i].handleRemove();
    }
    this.onRemove();
}
/**
 * @param {number} x
 * @param {number} y
 * @param {number=} b
 */
Component.prototype.handleMouseDown = function(x, y, b) {
	if (!this._shown) 
        return false;
    if (this._focusable)
        RootComponent.captureMouse(this);
    x -= this._x;
    y -= this._y;
    for (var i = this._child.length - 1; i >= 0; i--) {
        var c = this._child[i];
        if(x >= c._x && y >= c._y && x < c._x + c._width && y < c._y + c._height) {
            if (c.handleMouseDown(x, y, b)) 
                return true;
        }                
    }
    return this.onMouseDown(x, y, b);
}
/**
 * @param {number} x
 * @param {number} y
 */
Component.prototype.handleMouseUp = function(x, y) {
	if (!this._shown) 
        return false;
	x -= this._x;
    y -= this._y;
    for (var i = this._child.length - 1; i >= 0; i--) {
        var c = this._child[i];
        if (x >= c._x && y >= c._y && x < c._x + c._width && y < c._y + c._height) {
            if (c.handleMouseUp(x, y)) 
                return true;
        }                
    }
    return this.onMouseUp(x,y);
}
/**
 * @param {number} x
 * @param {number} y
 * @param {number} delta
 */
Component.prototype.handleMouseWheel = function(x, y, delta) {
	if (!this._shown) 
        return false;
	x -= this._x;
    y -= this._y;
    for (var i = this._child.length - 1; i >= 0; i--) {
        var c = this._child[i];
        if (x >= c._x && y >= c._y && x < c._x + c._width && y < c._y + c._height) {
            if (c.handleMouseWheel(x, y, delta)) 
                return true;
        }                
    }
    return this.onMouseWheel(x, y, delta);
}
Component.prototype._flagCreate = function() {
    this._drawBounds = true;
    this._drawColors = true;
    RootComponent._createList.push(this);
    for (var i = 0; i < this._child.length; i++) {
        var c = this._child[i];
        c._flagCreate();
    }
}