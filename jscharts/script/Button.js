/* eslint no-unused-vars: "off" */
/* global Label, Component, Color, Cursor, Main, KeyEvent, ChartEvent */
/**
 * ------
 * Button
 * ------
 * @constructor 
 * @extends {Label}
 * @param {string} id - ID of div
 * @param {Component=} delegate
 */
function Button(id, delegate) {
    Label.call(this, id, delegate);
    this.setRoundedCorners(2);
    this.setAlign(Label.ALIGN_CENTER);
    this.setVerticalAlign(Label.VERTICAL_ALIGN_CENTER);
    this.setBorder(Component.BORDER_DISABLE);
    this._down = false;
    this._upTop = new Color("#f5f5f5");
    this._upBottom = new Color("#cccccc");
    this._downTop = new Color("#888888");
    this._downBottom = new Color("#dddddd");
    this._toggle = false;
    
    this._textColor = Color.black;
    this._visitedColor = Color.darkBlue;
    
    this._cursor = Cursor.HAND_CURSOR;
    this._drawCursor = true;

    this._disabledTop = new Color("#eaeaea");
    this._disabledBottom = new Color("#eaeaea");
    this._disabledTextColor = new Color("#aaaaaa");

    this._noBorder = false;
}
/*
 * Inheriting
 */
Button.prototype = Object.create(Label.prototype);
Button.prototype.constructor = Button;
/** @override */
Button.prototype.focus = function() {
    if (Component.prototype.focus.call(this)) {
        this._drawButton = true;
        Main.getSession().getRootComponent().setKeyFocus(this);
    }
}
/** @override */
Button.prototype.blur = function() {
    if (Component.prototype.blur.call(this))
        this._drawButton = true;
}
/**
 * @param {boolean} t - toggle
 */
Button.prototype.setToggle = function(t) {
    this._toggle = t;
}
/** @override */
Button.prototype.create = function() {
    Label.prototype.create.call(this);
    this._drawButton = true;
}
/** @override */
Button.prototype.draw = function(force) {
    Label.prototype.draw.call(this, force);
    if (this._drawButton) {
        this._drawButton = false;
        if (this._enabled) {
            if (this._down) {
                this.setGradient(this._downTop, this._downBottom);
                if (!this._noBorder) {
                    this._div.css("border", "1px solid #555");
                    this._div.css('box-shadow', "none");
                } else {
                    this._div.css("background", "white");
                }
            } else {
                if (this._focus) {
                    this._div.css("box-shadow", "0 0 5px rgba(107, 177, 238, 1)");
                    this._div.css("border", "1px solid rgba(107, 177, 238, 1)");
                } else {
                    if (!this._noBorder) {
                        this._div.css("border","1px solid #888");
                        this._div.css('box-shadow', "0px 1px 2px #ccc")
                    } else {
                        this._div.css("background", "white");
                    }
                }
                this.setGradient(this._upTop, this._upBottom);
            }
            this._label.css('text-shadow', "0px 1px 0px " + this._textShadow);
            if (this._visited && this._visited) {
                this.setColor(this._visitedColor);
            } else {
                this.setColor(this._textColor);
            }
        } else {
            if (!this._noBorder) {
                this._div.css("border","1px solid #aaa");
                this._div.css('box-shadow', "none");
            }
            this.setGradient(this._disabledTop,this._disabledBottom);
            this._label.css('text-shadow', "0px 1px 0px "+this._disabledTextShadow);
            this.setColor(this._disabledTextColor);                    
        }   
        this._div.css('box-sizing', "border-box");
        this._div.css('clip', "auto");
        this.refresh();
    }
}
/**
 * @param {boolean} d - down
 */
Button.prototype.setDown = function(d) {
    this._down = d;
    this._drawButton = true;
}
/**
 * @param {Color|string} upTop
 * @param {Color|string} upBottom
 * @param {Color|string} text
 * @param {Color|string} textShadow
 */
Button.prototype.setDisabledColors = function(upTop, upBottom, text, textShadow) {
    this._disabledTop = upTop;
    this._disabledBottom = upBottom;
    this._disabledTextColor = text;
    this._disabledTextShadow = textShadow;
    this._drawButton = true;    
}
/**
 * @param {Color|string} upTop
 * @param {Color|string} upBottom
 * @param {Color|string} downTop
 * @param {Color|string} downBottom
 * @param {Color|string} text
 * @param {Color|string} textShadow
 */
Button.prototype.setColors = function(upTop, upBottom, downTop, downBottom, text, textShadow) {
    this._downTop = downTop;
    this._downBottom = downBottom;
    this._upTop = upTop;
    this._upBottom = upBottom;
    this._textColor = text;
    this._textShadow = textShadow;
    this._drawButton = true;    
}
Button.prototype.setEnabled = function(e) {
    this._enabled = e;
    this._drawButton = true;
}
Button.prototype.isEnabled = function() {
	return this._enabled;
}
/**
 * @param {string} l - link
 */
Button.prototype.setLink = function(l) {
    if (l !== this._link) {
        this._visited = false;
        this._link = l;
        this._drawButton = true;
    }
}
/**
 * @param {boolean} n - no border
 */
Button.prototype.setNoBorder = function(n) {
    this._noBorder = n;
    this._drawButton = true;
}
/**
 * @param {Color|string} c
 */
Button.prototype.setVisitedColor = function(c) {
    this._visitedColor = c;
    this._drawButton = true;
}
/** @override */
Button.prototype.onKeyDown = function(keyCode) {
    if (!this._focus)
        return
    if (keyCode === KeyEvent.ENTER || keyCode === KeyEvent.SPACE) {
        return this.onMouseDown();
    }
}
/** @override */
Button.prototype.onKeyUp = function(keyCode) {
    if (!this._focus)
        return
    if (keyCode === KeyEvent.ENTER || keyCode === KeyEvent.SPACE) {
        return this.onMouseUp();
    }
    if (keyCode === KeyEvent.ESCAPE) {
          return this.onCaptureLost();
    }
}
/** @override */
Button.prototype.onMouseDown = function(x, y) {
	if (this._enabled && !this._toggle) {
        this._down = true;
        this._drawButton = true;
        this.refresh();
        return true;
	}
    return false;
}
/** @override */
Button.prototype.onMouseUp = function(x, y) {
    if (!this._enabled) return false;
    if (this._toggle) {
        this._down = !this._down;    
    } else {
        this._down = false;
    }
    this._drawButton = true;  
    this.refresh();
    this.onClick();
    return true;
}
/** @override */
Button.prototype.onMouseLeave = function() {
	if (this._enabled) {
        this._drawButton = true;    
        this.refresh();
	}
}
/** @override */
Button.prototype.onMouseMove = function(x, y) {
	return this._enabled;
}
Button.prototype.onClick = function() {
    if (this._link) {
        window.open(this._link);
        this._visited = true;
        this._drawButton = true;
        this.refresh();
        return;
    }
    this.notify(new ChartEvent(ChartEvent.BUTTON_CLICK));
}