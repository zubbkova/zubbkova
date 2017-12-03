/* global DrawingObject, Font, Style, ChartPoint, Point, CalloutDialog, Main, Color */
/**
 * --------
 * DrawText
 * --------
 * Freeform text object.
 * @constructor
 * @extends {DrawingObject}
 * @param {Chart} p
 * @param {number} t - type
 */
function DrawText(p, t) {
    this._maxLines = 1;
    this._truncate = false;
    this._textWidth = 0;
    this._textLines = 0;
    this._lineHeight = 0;
    DrawingObject.call(this, p, t);
    this._calloutFont = new Font("Sans Serif", Style.FONT_STYLE_PLAIN, 12);
    this._points = new Array(2);
    this._points[0] = new ChartPoint();
    this._points[1] = new ChartPoint();
    this._displayLines = new Array(DrawText.MAX_LINES);
}
/**
 * Inheriting
 */
DrawText.prototype = Object.create(DrawingObject.prototype);
DrawText.prototype.constructor = DrawText;
/** @static */
DrawText.MAX_LINES = 10;
/** @static */
DrawText.MIN_SIZE = 10;
/** @override */
DrawText.prototype.copy = function() {
    var other = DrawingObject.prototype.copy.call(this, new DrawText(this._parent, this._type));
    other._string = this._string;
    return other;
}
/** @override */
DrawText.prototype.onMouseDoubleClick = function(x, y) {
    var box = this.getRect(this._points[0], this._points[1]);
    if (box.contains(new Point(x, y))) {
        this.showEditDialog(new Point(x, y));
        return true;
    }
    return false;
}
/** @override */
DrawText.prototype.postCreate = function(id) {
    DrawingObject.prototype.postCreate.call(this, id);
    this.showEditDialog(this._points[0].getPoint());
}
/**
 * @param {Point} p
 */
DrawText.prototype.hasSelected = function(p) {
    return this.getRect(this._points[0], this._points[1]).contains(p);
}
/**
 * @param {number} line
 * @param {Point} box
 */
DrawText.prototype.drawLine = function(line, box) {
    if (!this.getParentCanvas())
        return;
    if (line >= 0 && line < this._displayLines.length)
        this.getParentCanvas().fillText(this._displayLines[line].toString(), box._x + 3, box._y + 3 + (line + 1) * this._lineHeight);
}
DrawText.prototype.recalcLines = function() {
    if (!this._string || !this.getParentCanvas())
        return;
    var i;
    for (i = 0; i < DrawText.MAX_LINES; i++) {
        this._displayLines[i] = "";
    }
    var box = this.getRect(this._points[0], this._points[1]);
    var tok = this._string.split("\n");
    this._lineHeight = Math.round(this.getParentCanvas()._gc.measureText("W").width);
    this._maxLines = Math.min(parseInt(box._height / this._lineHeight, 10), DrawText.MAX_LINES);
    this._textWidth = 0;
    var curLine = 0;
    var maxWidth = box._width;
    for (i = 0; i < tok.length; i++) {
        var nextToken = tok[i];
        var nextTokenLength = 0;
        nextTokenLength = Math.round(this.getParentCanvas()._gc.measureText(nextToken).width);
        if (nextTokenLength > maxWidth) {

            var newLinesCount = parseInt(nextTokenLength / maxWidth, 10) + (nextTokenLength % maxWidth > 1 ? 1 : 0);
            var temp = nextToken;
            var symCount = parseInt(maxWidth * nextToken.length / nextTokenLength, 10);
            for (var j = 0; j < newLinesCount; j++) {
                temp = nextToken.substring(0, symCount);
                this._displayLines[curLine] = temp;
                curLine++;
                nextToken = nextToken.substring(symCount);
            }
            nextTokenLength = maxWidth;
        } else {
            this._displayLines[curLine] += nextToken;
            curLine++;
        }
        this._textWidth = Math.max(this._textWidth, nextTokenLength);
    }
    if (this._string.length > 0 && this._string[this._string.length - 1] === ' ') {
        this._displayLines[curLine] += ' ';
    }
    this._textLines = curLine + 1;
}
/** @override */
DrawText.prototype.setPoint = function(p, w, index) {
    if (index === undefined)
        index = this._curPoint;
    DrawingObject.prototype.setPoint.call(this, p, w, index);
    if (this._curPoint > 0) {
        if (index === 0 || index === 1) {
            this.recalcLines();
        }
    }
}
/**
 * @param {string} s
 */
DrawText.prototype.setText = function(s) {
    this._string = s;
    this.recalcLines();
    this._parent.repaint();
    this._parent.process();
}
/**
 * @param {Point} p
 */
DrawText.prototype.showEditDialog = function(p) {
    var d = new CalloutDialog("calloutmodal", this._parent);
    var pAbs = this._parent.getAbsoluteLocation();
    var cx = pAbs._x + p._x;
    var cy = pAbs._y - d._height - 10 + p._y;
    d.setLocation(cx, cy);
    d.setText(this._string);
    d.setModal(true);
}
/** @override */
DrawText.prototype.getStringForm = function() {
    return DrawingObject.prototype.getStringForm.call(this) + ":" + this._string.replace("\n", "\\n");
}
/** @override */
DrawText.prototype.initOtherParams = function(p) {
    this._string = p[4].replace("\\n", "\n");
    this.recalcLines();
}
/** @override */
DrawText.prototype.draw = function() {
    if (!this.getParentCanvas())
        return;
    var box = this.getRect(this._points[0], this._points[1]);
    if ((this._curPoint == 1 && !Main.isTouchClient()) || this._curPoint > 1) {
        if (!this._string || this._string.length === 0) {
            this.getParentCanvas().setStrokeColor(Color.lightGray);
            this.getParentCanvas().drawRectWithAdjust(box._x, box._y, box._width, box._height, this._topLineY, this._bottomLineY);
        }
    }
    if (this._curPoint == 1 || this._waitDrag)
        this.drawSelectionBox(this._points[this._curPoint-1].getPoint(), this._waitDrag);
    this.getParentCanvas().setFillColor(this._colour);
    this.getParentCanvas().setFont(this._calloutFont);
    for (var i = 0; i < this._textLines; i++) {
        this.drawLine(i, box);
    }
    DrawingObject.prototype.draw.call(this);
}
/** @override */
DrawText.prototype.getRect = function(a, b) {
    var box = DrawingObject.prototype.getRect.call(this, a, b);
    if (box._width < DrawText.MIN_SIZE)
        box._width = DrawText.MIN_SIZE;
    if (box._height < DrawText.MIN_SIZE)
        box._height = DrawText.MIN_SIZE;
    return box;
}