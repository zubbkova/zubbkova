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
/** @override */
DrawText.prototype.copy = function() {
    let other = DrawingObject.prototype.copy.call(this, new DrawText(this._parent, this._type));
    other._string = this._string;
    return other;
}
/** @override */
DrawText.prototype.onMouseDoubleClick = function(x, y) {
    let box = this.getRect(this._points[0], this._points[1]);
    if (box.contains(new Point(x, y))) {
        this.showEditDialog(new Point(x, y));
        return true;
    }
    return false;
}
/** @override */
DrawText.prototype.postCreate = function(id) {
    this._parent._objectSelected = id;
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
    if (!this._parent._canvas)
        return;
    this._parent._canvas.fillText(this._displayLines[line].toString(), box._x + 3, box._y + 3 + (line + 1) * this._lineHeight);
}
DrawText.prototype.recalcLines = function() {
    if (!this._string || !this._parent._canvas)
        return;
    for (let i = 0; i < DrawText.MAX_LINES; i++) {
        this._displayLines[i] = "";
    }
    let box = this.getRect(this._points[0], this._points[1]);
    let tok = this._string.split("\n");
    this._lineHeight = Math.round(this._parent._canvas._gc.measureText("W").width);
    this._maxLines = Math.min(Math.trunc(box._height / this._lineHeight), DrawText.MAX_LINES);
    this._textWidth = 0;
    let curLine = 0, curLineLength = 0;
    let maxWidth = box._width;
    for (let nextToken of tok) {
        let nextTokenLength = 0;
        nextTokenLength = Math.round(this._parent._canvas._gc.measureText(nextToken).width);
        if (nextTokenLength > maxWidth) {

            let newLinesCount = Math.trunc(nextTokenLength / maxWidth) + (nextTokenLength % maxWidth > 1 ? 1 : 0);
            let coeff = nextTokenLength / maxWidth;
            let temp = nextToken;
            let symCount = Math.trunc(maxWidth * nextToken.length / nextTokenLength);
            for (let i = 0; i < newLinesCount; i++) {
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
    if (!index)
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
    let d = new CalloutDialog("calloutmodal", this._parent);
    let pAbs = this._parent.getAbsoluteLocation();
    let cx = pAbs._x + p._x;
    let cy = pAbs._y - d._height - 10 + p._y;
    d.setLocation(cx, cy);
    d.setText(this._string);
    d.setModal(true);
}
/** @override */
DrawText.prototype.getStringForm = function() {
    return DrawingObject.prototype.getStringForm.call(this) + ":" + this._string.replace("\n", "\\n");
}
/** @override */
DrawText.prototype.initOtherParams = function(p, w) {
    this._string = p[4].replace("\\n", "\n");
    this.recalcLines();
}
/** @override */
DrawText.prototype.draw = function() {
    if (!this._parent._canvas)
        return;
    let box = this.getRect(this._points[0], this._points[1]);
    if (!this._string || this._string.length === 0) {
        this._parent._canvas.setStrokeColor(Color.lightGray);
        this._parent._canvas.drawRectWithAdjust(box._x, box._y, box._width, box._height);
    }
    this._parent._canvas.setFillColor(this._colour);
    this._parent._canvas.setFont(this._calloutFont);
    for (let i = 0; i < this._textLines; i++) {
        this.drawLine(i, box);
    }
    DrawingObject.prototype.draw.call(this);
}