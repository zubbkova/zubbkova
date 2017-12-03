/* global Component, Style, AlertDialog, Main, Cursor */
/**
 * -------------
 * RootComponent
 * -------------
 * @constructor 
 * @extends {Component}
 * @param {string} id - ID of div
 */
function RootComponent(id) {
    Component.call(this, id);
    this._id = id;
    this._div = $("#" + this._id);
    this._div.css("position","relative");
    this._div.css("width","100%");
    this._div.css("height","100%");
    this._div.onselectstart = function () { return false; }
    this._div.css("margin", "auto")
    this._doCreate = false;
    this._font = Style.DEFAULT_FONT.getFontFamily();
    RootComponent._component = this;
    this.setRoundedCorners(7);
    this._windows = new Object();
    this._nextWindowID = 0;                               
    this._clientContainer = new Component("rootComponent_childContainer");
    this._clientContainer.setRoundedCorners(7);
    this.add(this._clientContainer);
    this._desktopWidth = 0;
    this._desktopHeight = 0;    
    this._nextPosition = 0;
    this._aaText = true;
    this._aaDrawing = true;
    this._isTouch = false;
}
/**
 * Inheriting
 */
RootComponent.prototype = Object.create(Component.prototype);
RootComponent.prototype.constructor = RootComponent;
/** @static */
RootComponent._mouseIn = new Object();
/** @static */
RootComponent._createList = [];
/** @static */
RootComponent._timestamp = new Date().getTime();
/** @static */
RootComponent._startTimestamp = new Date().getTime();
/** 
 * @static 
 * @param {Component} component
 */
RootComponent.enablePopup = function(component) {
	RootComponent._component._popup = component;
}
RootComponent.cancelPopup = function() {
	delete RootComponent._component._popup;
}
RootComponent.getTimestamp = function() {
    return RootComponent._timestamp;
}
RootComponent.getTimeSinceStart = function() {
    return RootComponent._timestamp - RootComponent._startTimestamp;
}
/** 
 * @static 
 * @param {Component} c
 */
RootComponent.captureMouse = function(c) {
    if (RootComponent._captureMouse === c)
        return;
    if (RootComponent._captureMouse) {
        RootComponent._captureMouse.onCaptureLost();
    }
    RootComponent._captureMouse = c;
    RootComponent._captureMouse.onCapture();
}
RootComponent.getCapture = function() {
    return RootComponent._captureMouse;
}
/** 
 * @static 
 * @param {Component} c
 */
RootComponent.releaseMouse = function(c) {
    if (c === RootComponent._captureMouse) {
        RootComponent._captureMouse.onCaptureLost();
        RootComponent._captureMouse = undefined;
    }
}
/** 
 * @static 
 * @param {number} cursor
 */
RootComponent.changeCursor = function(cursor) {
    if (RootComponent._component._cursor !== cursor) {
        RootComponent._component._cursor = cursor;
        RootComponent._component._drawCursor = true;
        RootComponent._component.draw(false);
    }
}
RootComponent.getCursor = function() {
	return RootComponent._component._cursor;
}
/**
 * @param {string} message
 */
RootComponent.prototype.showAlert = function(message) {
    if (this._alert)
        return;
    this._alert = new AlertDialog("alert", this, message);
    this.addWindow(this._alert);
    this.setSelected(this._alert);
    this.refresh();
}
/**
 * @param {Modal} modal
 */
RootComponent.prototype.showModal = function(modal) {
    if (this._modal) {
        this.removeWindow(this._modal);
    }
    this._modal = modal;
    this.addWindow(modal);
    this.setSelected(modal);
    this.refresh();
}
RootComponent.prototype.start = function() {
    var self = this;
    $(document).mousemove(function(e) {
        self._eventMouseMove(e.pageX - self._absoluteX, e.pageY - self._absoluteY);
    });
    $(document).mousedown(function(e) {
        self._eventMouseDown(e.pageX - self._absoluteX, e.pageY - self._absoluteY, e["button"]);
    });
    $(document).mouseup(function(e) {
        self._eventMouseUp(e.pageX - self._absoluteX, e.pageY - self._absoluteY);
    });
    document.body.addEventListener("mousewheel",function(e) {
        self._eventMouseWheel(e.pageX - self._absoluteX, e.pageY - self._absoluteY, e.detail ? e.detail : -e.wheelDelta/120);
    }, false);
    document.body.addEventListener("touchstart",function(e) {
        if (!self._isTouch) {
            self._isTouch = true;
        }
        if (e.target.localName === 'td' || !e.target.id.startsWith('chartContainer'))
            return;
        if (e.targetTouches.length === 1) {
            var touch = e.targetTouches[0];
            self._eventMouseMove(touch.pageX - self._absoluteX, touch.pageY - self._absoluteY);
            self._eventMouseDown(touch.pageX - self._absoluteX, touch.pageY - self._absoluteY);
        }
    }, false);
    document.body.addEventListener("touchend",function(e) {
        if (e.target.localName === 'td' || !e.target.id.startsWith('chartContainer'))
            return;
        self._eventMouseUp(self._mouseX, self._mouseY);
        e.preventDefault();
    }, false);
    document.body.addEventListener('touchmove', function(e) {
        if (e.target.localName === 'td' || e.target.id.indexOf('canvas') === -1)
            return;
        if (e.targetTouches.length === 1) {
            var touch = e.targetTouches[0];
            self._eventMouseMove(touch.pageX - self._absoluteX, touch.pageY - self._absoluteY);
        }
        e.preventDefault();
    }, false); 
    $(document).keydown(function(e) {
        self._eventKeyDown(e.which);
    });
    $(document).keyup(function(e) {
        self._eventKeyUp(e.which);
    });
    this._portWidth = Main.getFrameWidth();
    this._portHeight = Main.getFrameHeight();
    window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    requestAnimationFrame(function() { self._refresh(); });
    this.setBounds(0, 0, this._portWidth, this._portHeight);
    this.run();
}
RootComponent.prototype.stop = function() {}
RootComponent.prototype.getWidth = function() {
    return $("#" + this._id).width();
}
RootComponent.prototype.getHeight = function() {
    return $("#" + this._id).height();
}
/** @override */
RootComponent.prototype.add = function(child) {
    child.setParent(this);
    this._child.push(child);
    child._flagCreate();
}
/**
 * @param {Component} c
 */
RootComponent.prototype.setKeyFocus = function(c) {
    this._keyFocus = c;    
}
/**
 * @param {Component} child
 */
RootComponent.prototype.addWindow = function(child) {
    this._clientContainer.add(child);
    child.setZ(this._clientContainer._child.length - 1);
    this._windows[child._id] = child;
}
/**
 * @param {Component} child
 */
RootComponent.prototype.removeWindow = function(child) {
    this._clientContainer.remove(child);
    delete this._windows[child._id];
    if (this._alert === child) {
        this._alert = undefined;
    }
    if (this._modal === child) {
        this._modal = undefined;
    }
}
RootComponent.prototype.getSelected = function() {
    return this._selected;
}
/**
 * @param {Component} window
 */
RootComponent.prototype.setDefaultLocation = function(window) {
	window.setLocation(0, 0);
}
/**
 * @param {Component} window
 */
RootComponent.prototype.setSelected = function(window) {
    if (this._selected !== window) {
        if (this._selected)
            this._selected.blur();
        this._selected = window;
        this.setKeyFocus(window);
        this.bringToFront(window);
        window.focus();
    }
}
/**
 * @param {Component} window
 */
RootComponent.prototype.bringToFront = function(window) {
    var i;
    for (i = 0; i < this._clientContainer._child.length; i++) {
        if (this._clientContainer._child[i] === window) {
            this._clientContainer._child.splice(i, 1);
            this._clientContainer._child.push(window);                
        }
    }
    for (i = 0; i < this._clientContainer._child.length; i++) {
        this._clientContainer._child[i].setZ(i);                
    }        
}
RootComponent.prototype.run = function() {
    var self = this;
    setTimeout(function(){
        RootComponent._timestamp = new Date().getTime();
        self._clientContainer.process(RootComponent._timestamp);
        self.run();
    }, 1000);
}
RootComponent.prototype.isAADrawing = function() {
    return this._aaDrawing;
}
/**
 * @param {string} aa
 */
RootComponent.prototype.setAAText = function(aa) {
    this._aaText = aa;
}
RootComponent.prototype.isAAText = function() {
    return this._aaText;
}
RootComponent.prototype.getRoot = function() {
    return this;
}
/**
 * @private
 * @param {number} w
 * @param {number} h
 */
RootComponent.prototype._eventResize = function(w, h) {
    this._portWidth = w;
    this._portHeight = h;
    this._updateSize();
    return true;
}
/**
 * @private
 * @param {number} x
 * @param {number} y
 */
RootComponent.prototype._eventMouseMove = function(x, y) {
    this.getAbsoluteLocation();
    var oldMouseIn = RootComponent._mouseIn;
    RootComponent._mouseIn = new Object();
    var res = this.handleMouseMove(x,y);
    if (!res) {
        this.setCursor(Cursor.DEFAULT_CURSOR);
    }
    var cid, c;
    for (cid in RootComponent._mouseIn) {
        if (RootComponent._mouseIn.hasOwnProperty(cid)) {
            c = RootComponent._mouseIn[cid];
            if (!oldMouseIn.hasOwnProperty(cid))
                c.onMouseEnter(x, y);
        }
    }
    for (cid in oldMouseIn) {
        if (oldMouseIn.hasOwnProperty(cid)) {
            c = oldMouseIn[cid];
            if (!RootComponent._mouseIn.hasOwnProperty(cid))
                c.onMouseLeave(x, y);
        }
    }
    return res;
}
/**
 * @private
 * @param {number} keyCode
 */
RootComponent.prototype._eventKeyDown = function(keyCode) {
    if (this._keyFocus) {
        this._keyFocus.onKeyDown(keyCode);
    }
}
/**
 * @private
 * @param {number} keyCode
 */
RootComponent.prototype._eventKeyUp = function(keyCode) {
    if (this._keyFocus) {
        this._keyFocus.onKeyUp(keyCode);
    }
}
/**
 * @private
 * @param {number} x
 * @param {number} y
 * @param {number=} b
 */
RootComponent.prototype._eventMouseDown = function(x, y, b) {
//    if (RootComponent._captureMouse) {
//        var a = this._getOffset();
//        if (RootComponent._captureMouse.onMouseDown(x-a[0], y-a[1], b))
//            return RootComponent._captureMouse;
//    }
    return this.handleMouseDown(x, y, b);
}
/**
 * @private
 * @param {number} x
 * @param {number} y
 */
RootComponent.prototype._eventMouseUp = function(x, y) {
//    if (RootComponent._captureMouse) {
//        var a = this._getOffset();
//        if (RootComponent._captureMouse.onMouseUp(x-a[0], y-a[1]))
//            return RootComponent._captureMouse;
//    }
    return this.handleMouseUp(x, y);
}
/**
 * @private
 * @param {number} x
 * @param {number} y
 * @param {number} delta
 */
RootComponent.prototype._eventMouseWheel = function(x, y, delta) {
    if (RootComponent._captureMouse) {
        var a = this._getOffset();
        if (RootComponent._captureMouse.onMouseWheel(x-a[0], y-a[1], delta))
            return RootComponent._captureMouse;
    }
    return this.handleMouseWheel(x, y, delta);
}
/** @override */
RootComponent.prototype.handleMouseMove = function(x, y) {
    var xx = x - this._clientContainer._x;
    var yy = y - this._clientContainer._y;
    var c;
    if (this._popup) {
		var rx = 0;
		var ry = 0;
		c = this._popup;
		while (c) {
			rx += c._x;
			ry += c._y;
			c = c._parent;
		}
		if (xx >= rx && xx < rx + this._popup._width && yy >= ry && yy < ry + this._popup._height) {
			return this._popup.onMouseMove(xx - rx, yy - ry);
		}
		return;
    }
    if (xx < 0 || yy < 0 || (xx > this._clientContainer._width) || (yy > this._clientContainer._height)) {
        return Component.prototype.handleMouseMove.call(this, x, y);
    }
    this._mouseX = xx;
    this._mouseY = yy;
    for (var i = this._clientContainer._child.length - 1; i >= 0; i--) {
        c = this._clientContainer._child[i];
        if (xx >= c._x && yy >= c._y && xx< c._x + c._width && yy < c._y + c._height) {
            if (c.handleMouseMove(xx, yy)) return true;
        }                
    }
    return false;
}
/** @override */
RootComponent.prototype.handleMouseDown = function(x, y, b) {
    var xx = x - this._clientContainer._x;
    var yy = y - this._clientContainer._y;
    this._mouseX = xx;
    this._mouseY = yy;
    var c;
	if (this._popup) {
		var rx = 0;
		var ry = 0;
		c = this._popup;
		while (c) {
			rx += c._x;
			ry += c._y;
			c = c._parent;
		}
		if (xx >= rx && xx < rx + this._popup._width && yy >= ry && yy < ry + this._popup._height) {
			this._popup.onMouseDown(xx - rx, yy - ry, b);
		} else {
			this._popup.onLostFocus();
			delete this._popup;
		}
		return;
	}
    if (xx < 0 || yy < 0 || (xx > this._clientContainer._width) || (yy > this._clientContainer._height)) {
        return Component.prototype.handleMouseDown.call(this, x, y, b);
    }
    for (var i = this._clientContainer._child.length - 1; i >= 0; i--) {
        c = this._clientContainer._child[i];
        if (xx >= c._x && yy >= c._y && xx < c._x + c._width && yy < c._y + c._height) {
            c.handleMouseDown(xx, yy, b);
            return;
        }                
    }
	if (this._popup) {
		this._popup.onLostFocus();
		delete this._popup;
	}
    return false;
}
/** @override */
RootComponent.prototype.handleMouseUp = function(x, y) {
    var xx = x - this._clientContainer._x;
    var yy = y - this._clientContainer._y;
    if (xx < 0 || yy < 0 || (xx > this._clientContainer._width) || (y > this._clientContainer._height)) {
        return Component.prototype.handleMouseUp.call(this, x, y);
    }
    if (this._popup)
        return this._popup.handleMouseUp(xx, yy);
    for (var i = this._clientContainer._child.length - 1; i >= 0; i--) {
        var c = this._clientContainer._child[i];
        if (xx >= c._x && yy >= c._y && xx < c._x + c._width && yy < c._y + c._height) {
            if (c.handleMouseUp(xx, yy)) return true;
        }                
    }
    return false;
}
/** @override */
RootComponent.prototype.handleMouseWheel = function(x, y, delta) {
    var xx = x - this._clientContainer._x;
    var yy = y - this._clientContainer._y;
    if (xx < 0 || yy < 0 || (xx > this._clientContainer._width) || (y > this._clientContainer._height)) {
        return Component.prototype.handleMouseWheel.call(this, x, y, delta);
    }
    for (var i = this._clientContainer._child.length - 1; i >= 0; i--) {
        var c = this._clientContainer._child[i];
        if (xx >= c._x && yy >= c._y && xx < c._x + c._width && yy < c._y + c._height) {
            if (c.handleMouseWheel(xx, yy, delta)) return true;
            break;
        }                
    }
    return false;
}
/** @private */
RootComponent.prototype._updateSize = function() {
    var ww = (this._desktopWidth > this._portWidth) ? this._desktopWidth : this._portWidth;
    var hh = (this._desktopHeight > this._portHeight) ? this._desktopHeight : this._portHeight;
    this.setBounds(0, 0, ww, hh);
}
/** @private */
RootComponent.prototype._refresh = function() {
    RootComponent._timestamp = new Date().getTime();
    var newList = [];
    var w = Main.getFrameWidth();
    var h = Main.getFrameHeight();
    if (w !== this._portWidth || h !== this._portHeight) {
        this._eventResize(w, h);
    }
    for (var i = 0; i < RootComponent._createList.length; i++) {
        var c = RootComponent._createList[i];
        if (c._parent._div === undefined) {
            newList.push(c);
        } else {
            c.create();
        }
    }
    RootComponent._createList = newList;
}
/** @private */
RootComponent.prototype._getOffset = function() {
    var xOffset = 0, yOffset = 0;
    var nc = RootComponent._captureMouse;
    while (nc) {
        xOffset += nc._x;
        yOffset += nc._y;
        nc = nc._parent;
    }
    return [xOffset, yOffset];
}
RootComponent.prototype.isInConfigure = function() {
    return false;
}
/** @private */
RootComponent.prototype._layout = function() {    
	this._clientContainer.setBounds(0, 0, this._width, this._height);
}
/** @override */
RootComponent.prototype.setBounds = function(x, y, w, h) {
    if (Component.prototype.setBounds.call(this, x, y, w, h)) {
        this._layout();
    }
}
RootComponent.prototype.getMouseX = function() {
    return this._mouseX;
}
RootComponent.prototype.getMouseY = function() {
    return this._mouseY;
}
RootComponent.prototype.isTouch = function() {
    return this._isTouch;
}