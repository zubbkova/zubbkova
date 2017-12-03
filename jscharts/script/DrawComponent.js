/* eslint no-unused-vars: "off" */
/* global Inset, Style, Main, Cursor */
/**
 * -------------
 * DrawComponent
 * -------------
 * @constructor
 * @param {Component|Chart|Overlay|DrawComponent|ChartCanvas=} parent
 * @param {ChartCanvas=} chartCanvas
 */
function DrawComponent(parent, chartCanvas) {
    this._parent = parent;
    this._chartCanvas = chartCanvas;
    this._chart = chartCanvas._chart;
    this._drag = false;
    this._notDraggable = false;
    this._x = 0;
    this._y = 0;
    this._width = 0;
    this._height = 0;
    this._shown = true;
    this._border = DrawComponent.BORDER_NONE;
    this._inset = new Inset();
}
/** @static */
DrawComponent.BORDER_NONE = 0;
/** @static */
DrawComponent.BORDER_EDGE = 1;
/** @static */
DrawComponent.BORDER_BUTTON = 2;
/** @static */
DrawComponent.BORDER_INSET = 3;
/** @static */
DrawComponent.BORDER_LIGHT_INSET = 4;
/**
 * @param {string|Color} color
 */
DrawComponent.prototype.setBackgroundColor = function(color) {
    this._backgroundColor = color;
    this._drawBackground = true;
}
/**
 * @param {number} border
 */
DrawComponent.prototype.setBorder = function(border) {
    if (border !== DrawComponent.BORDER_NONE)
        this._inset.set(2, 2, 2, 2);
    this._border = border;
    this._drawBorder = true;
}
DrawComponent.prototype.draw = function() {
    if (this._width === 0 || this._height === 0) {
        return false;
    }
    this._chartCanvas.setFillColor(this._backgroundColor);
    this._chartCanvas.fillRect(this._x, this._y, this._width, this._height);
    switch (this._border) {
        case DrawComponent.BORDER_EDGE:
            this._chartCanvas.setLineWidth(1.0);
            this._chartCanvas.setStrokeColor(Style.getPalette(Style.BORDER));
            this._chartCanvas.drawRect(this._x, this._y, this._width, this._height);
            this._chartCanvas.setColor(this._backgroundColor);
            this._chartCanvas.fillRect(this._x + 1, this._y + 1, this._width - 2, this._height - 2);
            break;
        case DrawComponent.BORDER_BUTTON:
            break;
        case DrawComponent.BORDER_LIGHT_INSET:
            break;
        case DrawComponent.BORDER_INSET:
            break;
    }
    return true;
}
DrawComponent.prototype.getAbsoluteLocation = function() {
    this._absoluteX = this._x;
    this._absoluteY = this._y;
    var p = this._parent;
    while(p) {
        this._absoluteX += p._x;
        this._absoluteY += p._y;
        p = p._parent;
    }
    return { _x: this._absoluteX, 
             _y: this._absoluteY }
}
DrawComponent.prototype.refresh = function() {
    this.draw();
}
/**
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 */
DrawComponent.prototype.setBounds = function(x, y, w, h) {
    this._x = x;
    this._y = y;
    this._width = w;
    this._height = h;
}
/**
 * @param {number} w
 * @param {number} h
 */
DrawComponent.prototype.setSize = function(w, h) {
    this.setBounds(this._x, this._y, w, h);
}
/**
 * @param {number} x
 * @param {number} y
 */
DrawComponent.prototype.setLocation = function(x, y) {
    this.setBounds(x, y, this._width, this._height);
}
DrawComponent.prototype.show = function() {
    if (!this._shown) {
        this._shown = true;
        return true;    
    }
    return false;
}
DrawComponent.prototype.hide = function() {
    this._shown = false;
    this._drag = false;
}/**
 * @param {boolean} visible
 */
DrawComponent.prototype.setVisible = function(visible) {
    if (visible) {
        this.show();
    } else {
        this.hide();
    }
}
/**
 * @param {number} x
 * @param {number} y
 */
DrawComponent.prototype.onMouseDown = function(x, y) {
    if (!this._notDraggable) {
        this._dragX = x;
        this._dragY = y;
        this._drag = true;
    }
    return true;
}
/**
 * @param {number} x
 * @param {number} y
 */
DrawComponent.prototype.onMouseUp = function(x, y) {
    if (!this._notDraggable) {
        this._drag = false;
    }
    return true;
}
/**
 * @param {number} x
 * @param {number} y
 */
DrawComponent.prototype.onMouseMove = function(x, y) {
    if (!this._notDraggable) {
        Main.getSession().getRootComponent().setCursor(Cursor.HAND_CURSOR);
         if (this._drag) {
            return this.onMouseDrag(x, y);
        }
    }
    return true;
}
/**
 * @param {number} x
 * @param {number} y
 */
DrawComponent.prototype.onMouseDrag = function(x, y) {
    var deltaX = x - this._dragX;
    var deltaY = y - this._dragY;
    var newX = this._x + deltaX;
    var newY = this._y + deltaY;
    this._dragX = x;
    this._dragY = y;
    // adjust
    if (newY < this._chartCanvas._topLineY) {
        newY = this._chartCanvas._topLineY - 1;
    } else if (newY > this._chartCanvas._bottomLineY - this._height) {
        newY = this._chartCanvas._bottomLineY - this._height + 1;
    }
    if (newX < this._chartCanvas._topLineStartX) {
        newX = this._chartCanvas._topLineStartX - 1;
    } else if (newX > this._chartCanvas._topLineEndX - this._width) {
        newX = this._chartCanvas._topLineEndX - this._width + 1;
    }
    this.setLocation(newX, newY);
    return true;
}
DrawComponent.prototype.onMouseLeave = function() {
    this._drag = false;
}