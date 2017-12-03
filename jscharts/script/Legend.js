/* global DrawComponent, Font, Style, Color */
/**
 * ------
 * Legend
 * ------
 * @constructor
 * @extends {DrawComponent}
 * @param {Overlay} parent
 */
function Legend(parent) {
    DrawComponent.call(this, parent, parent._chartCanvas);
    this._legends = [];
    this._large = false;
    this._legendFont = new Font(Style._sansSerif, Style.FONT_STYLE_BOLD, 12);
    this._legendsVisible = 0;
    this._hasTriple = true;
    this._hasDouble = true;
    this.setBorder(DrawComponent.BORDER_EDGE);
    this.setBackgroundColor(Color.white);
}
/**
 * Inheriting
 */
Legend.prototype = Object.create(DrawComponent.prototype);
Legend.prototype.constructor = Legend;
/** @override */
Legend.prototype.draw = function() {
    this.resetLocation(false);
    if (!DrawComponent.prototype.draw.call(this))
        return;
    var cury = this._y + this._inset._top;
    for (var i = 0; i < this._legends.length; i++) {
        var curx = this._x + 2;
        var curLegend = this._legends[i];
        if (!curLegend._shown) continue;
        if (curLegend._triple) {
            this._chartCanvas.setFillColor(curLegend._colour1);
            this._chartCanvas.fillRect(curx, cury + 1, 14, 14);
            curx = curx + 15;
            this._chartCanvas.setFillColor(curLegend._colour2);
            this._chartCanvas.fillRect(curx, cury + 1, 14, 14);
            curx = curx + 15;
            this._chartCanvas.setFillColor(curLegend._colour3);
            this._chartCanvas.fillRect(curx, cury + 1, 14, 14);
        } else if (curLegend._couple) {
            this._chartCanvas.setFillColor(curLegend._colour1);
            this._chartCanvas.fillRect(curx, cury + 1, 14, 14);
            curx = curx + 15;
            this._chartCanvas.setFillColor(curLegend._colour2);
            this._chartCanvas.fillRect(curx, cury + 1, 14, 14);
        } else {
            this._chartCanvas.setFillColor(curLegend._colour);
            this._chartCanvas.fillRect(curx, cury + 1, 14, 14);
        }
        curx = curx + 18;
        this._chartCanvas.setFillColor(Color.black);
        if (curLegend._bold) {
            var font = this._chartCanvas.getFont();
            this._chartCanvas.setFont(this._legendFont);
            this._chartCanvas.fillText(curLegend._name, curx, cury + 12);
            this._chartCanvas.setFont(font);
        } else {
            this._chartCanvas.fillText(curLegend._name, curx, cury + 12);
        }
        cury += 15;
    }
}
/**
 * @param {boolean} force
 */
Legend.prototype.resetLocation = function(force) {
    if (this._x === 0 || this._y === 0 || force)
        this.setLocation(this._chart._drawX + 3, this._parent._y + 3);
}
Legend.prototype.calculateBounds = function() {
    if (!this._shown) {
        this.setSize(0, 0);
    } else {
        var extra_width = 0;
        if (this._hasTriple) {
            extra_width = 52;
        } else if (this._hasDouble) {
            extra_width = 30;
        }
        if (this._legendsVisible === 0) {
            this.setSize(0, 0);
        } else {
            var maxWidth = 0;
            for (var i = 0; i < this._legends.length; i++) {
                var textWidth = this._chartCanvas._gc.measureText(this._legends[i]._name).width;
                if (textWidth > maxWidth)
                    maxWidth = textWidth;
            }
            maxWidth += extra_width;
            maxWidth += (this._large ? 15 : 0);
            this.setSize(maxWidth, 4 + (this._legendsVisible * 15));
        }
    }
}
/**
 * @param {boolean} o
 */
Legend.prototype.setOpen = function(o) {
    if (this._shown === o) return;
    this.setVisible(o);
    this.calculateBounds();
}
/**
 * @param {boolean} l
 */
Legend.prototype.setLarge = function(l) {
    this._large = l;
    this.calculateBounds();
}
/**
 * @param {number} id
 */
Legend.prototype.getItem = function(id) {
    for (var i = 0; i < this._legends.length; i++) {
        if (this._legends[i]._id === id) 
            return this._legends[i];
    }
}
Legend.prototype.clear = function() {
    this._legends = [];
    this._legendsVisible = 0;
    this.calculateBounds();
}
/**
 * @param {string} name
 * @param {Color} c
 * @param {boolean=} b
 */
Legend.prototype.addItem = function(name, c, b) {
    var colour = c;
    var bold = b === undefined ? false : b;
    if (this._legends.length === Legend.MAX_LEGENDS) {
        return -1;
    }
    if (colour === undefined) {
        colour = Legend.getNextColour();
    }
    var newLegend = new Legend_LegendItem(name, colour);
    newLegend._bold = bold;
    this._legends.push(newLegend);
    this._legendsVisible++;
    this.calculateBounds();
    return newLegend._id;
}
/**
 * @param {number} id
 */
Legend.prototype.removeItem = function(id) {
    var legend = this.getItem(id);
    if (legend) {
        this._legends.splice(this._legends.indexOf(legend), 1);
        this._legendsVisible--;
        this.calculateBounds();
    }
}
/**
 * @param {number} id
 * @param {boolean} show
 */
Legend.prototype.showItem = function(id, show) {
    var legend = this.getItem(id);
    if (legend && legend._shown !== show) {
        legend._shown = show;
        this._legendsVisible += (show ? 1 : -1);
        this.calculateBounds();
        this.refresh();
    }
}
/**
 * @param {number} id
 * @param {string} name
 */
Legend.prototype.renameItemNoRepaint = function(id, name) {
    var legend = this.getItem(id);
    if (legend) {
        legend._name = name;
        legend._bold = false;
    }
}
/**
 * @param {number} id
 */
Legend.prototype.makeDouble = function(id) {
    var legend = this.getItem(id);
    if (legend) {
        legend._couple = true;
        legend._colour  = new Color(39,64,139);
        legend._colour1  = new Color(39,64,139);
        legend._colour2 = new Color(165,42,42);
        this._hasDouble = true;
        this.refresh();
    }
}
/**
 * @param {number} id
 */
Legend.prototype.makeTriple = function(id) {
    var legend = this.getItem(id);
    if (legend) {
        legend._triple = true;
        legend._colour  = Color.blue;
        legend._colour1  = Color.blue;
        legend._colour2 = Color.red;
        legend._colour3 = Color.green;
        this._hasTriple = true;
        this.refresh();
    }
}
/**
 * @param {number} id
 * @param {string} name
 * @param {boolean} bold
 */
Legend.prototype.renameItem = function(id, name, bold) {
    var legend = this.getItem(id);
    if (legend) {
        legend._name = name;
        legend._bold = bold === undefined ? false : bold;
        this.calculateBounds();
    }
}
/** @static */
Legend.MAX_LEGENDS = 10;
/** @static */
Legend.curLegendId = 0;
/** @static */
Legend.legendDefault = [new Color(0, 0, 255), new Color(0, 196, 0), new Color(255, 0, 0), new Color(0, 200, 200), new Color(200, 200, 0), new Color(200, 0, 200), new Color(128, 128, 128), new Color(0, 0, 128), new Color(0, 128, 0), new Color(128, 0, 0)];
/** @static */
Legend.staticCurColour = 0;
/** @static */
Legend.getNextColour = function() {
    var c = Legend.legendDefault[Legend.staticCurColour++];
    if (Legend.staticCurColour === 10)
        Legend.staticCurColour = 0;
    return c;
}
/**
 * @constructor
 * @param {string} name
 * @param {Color} colour
 */
function Legend_LegendItem(name, colour) {
    this._name = name;
    this._colour = colour;
    this._shown = true;
    this._id = Legend.curLegendId++;
    this._bold = false;
    this._triple = false;
    this._couple = false;
}