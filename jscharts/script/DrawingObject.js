/**
 * -------------
 * DrawingObject
 * -------------
 * @constructor
 * @param {Chart} p
 * @param {number} t - type
 */
function DrawingObject(p, t) {
    this._curPoint = 0;
    this._colour = Color.blue;
    this._thickness = 1;
    this._selected = false;
    this._finished = false;
    this._selectedPoint = -1;
    this._drawAcrossWindows = false;
    this._parent = p;
    this._type = t;
}
/**
 * @param {Array} p
 * @param {Overlay} w
 */
DrawingObject.prototype.initOtherParams = function(p, w) {}
/**
 * Initialises the object from its String representation.
 * @static
 * @param {string} sf
 * @param {Chart} p
 * @param {Overlay} w
 */
DrawingObject.parseStringForm = function(sf, p, w) {
    let items = sf.split(":");
    let obj = DrawingObject.getDrawingObject(p, parseInt(items[0], 10));
    // next one is colour
    let temp = items[1].split("@");
    obj._colour = new Color(parseInt(temp[0], 10), parseInt(temp[1], 10), parseInt(temp[2], 10));
    for (let i = 0; i < obj._points.length; i++) {
        obj._points[i] = new ChartPoint(items[i + 2], w);
    }
    obj.initOtherParams(items, w);
    return obj;
}
/**
 * Returns a String representation of the object.
 */
DrawingObject.prototype.getStringForm = function() {
    let buf = this._type.toString();
    buf += ":" + this._colour._r + "@" + this._colour._g + "@" + this._colour._b;
    for (let p of this._points) {
        buf += ":" + p.stringRep();
    }
    return buf;
}
/**
 * Translate the object by a number of pixels.
 * @param {number} dx
 * @param {number} dy
 */
DrawingObject.prototype.translate = function(dx, dy) {
    for (let p of this._points) {
        p.translate(dx, dy);
    }
}
/**
 * @param {Point} p
 * @param {Overlay} w
 * @param {number=} index
 */
DrawingObject.prototype.setPoint = function(p, w, index) {
    if (!index)
        index = this._curPoint;
    this._points[index].setPoint(p, w);
}
/**
 * Fix the value of a single ChartPoint object.  
 * @param {Point} p
 * @param {Overlay} w
 * @return  True if all required points have been added.
 */
DrawingObject.prototype.addPoint = function(p, w) {
    this.setPoint(p, w, this._curPoint);
    this._curPoint++;
    if (this._curPoint === this._points.length)
        return true;
    // Set the next point now so we don't get null values for it. 
    this.setPoint(p, w, this._curPoint);
    return false;
}
/**
 * Draws a single selection point box.
 * @param {Point} p
 */
DrawingObject.prototype.drawSelectionBox = function(p) {
    if (!this._parent._canvas)
        return;
    this._parent._canvas.setFillColor(Color.yellow);
    this._parent._canvas.fillRectWithAdjust(p._x - 3, p._y - 3, 6, 6);
    this._parent._canvas.setStrokeColor(Color.black);
    this._parent._canvas.drawRectWithAdjust(p._x - 3, p._y - 3, 6, 6);
}
/**
 * Draw selection point boxes.
 */
DrawingObject.prototype.drawSelectionPoints = function() {
    let selPoints = this.getSelectionPoints();
    for (let i = 0; i < selPoints.length; i++) {
        this.drawSelectionBox(selPoints[i]);
    } 
}
DrawingObject.prototype.draw = function() {
    if (this._selected)
        this.drawSelectionPoints();
}
/**
 * Creates a list of selection points for this object.
 */
DrawingObject.prototype.getSelectionPoints = function() {
    let selPoints = [];
    for (let i = 0; i < this._points.length; i++) {
        selPoints.push(this._points[i].getPoint());
    }
    return selPoints;
}
/**
 * Checks whether a point falls on any of the selection boxes.
 * @param {Point} p
 */
DrawingObject.prototype.hasGotSelectionPoint = function(p) {
    let selPoints = this.getSelectionPoints();
    for (let i = 0; i < selPoints.length; i++) {
        let selP = selPoints[i];
        if (p._x > selP._x - DrawingObject.MAX_SELECTION_DISTANCE && p._x < selP._x + DrawingObject.MAX_SELECTION_DISTANCE){
            if (p._y > selP._y - DrawingObject.MAX_SELECTION_DISTANCE && p._y < selP._y + DrawingObject.MAX_SELECTION_DISTANCE) {
                return i;
            }
        }
    }
    return -1;
}
/**
 * Returns a point halfway between two points.
 * @param {Point|ChartPoint} a
 * @param {Point|ChartPoint} b
 */
DrawingObject.prototype.getMidPoint = function(a, b) {
    if (a.constructor === ChartPoint)
        a = a.getPoint();
    if (b.constructor === ChartPoint)
        b = b.getPoint();
    let deltaX = a._x - b._x;
    let deltaY = a._y - b._y;
    return new Point(a._x - deltaX / 2, a._y - deltaY / 2);
}
/**
 * Returns a box with top-left and bottom-right corners defined by two ChartPoint objects.
 * @param {Point|ChartPoint} a
 * @param {Point|ChartPoint} b
 */
DrawingObject.prototype.getRect = function(a, b) {
    let aa = a.getPoint();
    let bb = b.getPoint();
    return new Rectangle(Math.min(aa._x, bb._x), Math.min(aa._y, bb._y), Math.abs(aa._x - bb._x), Math.abs(aa._y - bb._y));
}
/**
 * Determines whether a point is on a line defined by two ChartPoint objects.
 * @param {Point} p - point
 * @param {Point|ChartPoint} s - start
 * @param {Point|ChartPoint} e - end
 */
DrawingObject.prototype.onLine = function(p, s, e) {
    let start = s;
    let end = e;
    if (start.constructor === ChartPoint)
        start = start.getPoint();
    if (end.constructor === ChartPoint)
        end = end.getPoint();
    let mag = this.magnitude(start, end);
    let u = ((p._x - start._x) * (end._x - start._x) + (p._y - start._y) * (end._y - start._y)) / (mag * mag);
    if (u < 0.0 || u > 1.0)
        return false;
    let i = new Point(parseInt(start._x + u * (end._x - start._x), 10), parseInt(start._y + u * (end._y - start._y), 10));
    return this.magnitude(i, p) <= DrawingObject.MAX_SELECTION_DISTANCE;
}
/**
 * Extend a line to the left and right side of the screen.
 * @param {Point} a
 * @param {Point} b
 */
DrawingObject.prototype.extendLine = function(a, b) {
    let offsets = [b._x - a._x, b._y - a._y];
    let ends = new Array(2);
    if (offsets[0] === 0) {
        ends[0] = new Point(a._x, this._parent._drawY);
        ends[1] = new Point(a._x, this._parent._drawY + this._parent._drawHeight);
    } else {
        let yFac = offsets[1] / offsets[0];
        let dy = (a._x - this._parent._drawX) * yFac;
        ends[0] = new Point(this._parent._drawX, a._y - parseInt(dy, 10));
        dy = (this._parent._drawX + this._parent._drawWidth - b._x) * yFac;
        ends[1] = new Point(this._parent._drawX + this._parent._drawWidth, b._y + parseInt(dy, 10));
    }
    return ends;
}
/**
 * Given two points a and b work out the x- and y-offsets from a to b.
 * @param {Point} a
 * @param {Point} b
 */
DrawingObject.prototype.offset = function(a, b) {
    let offsets = [b._x - a._x, b._y - a._y];
    return offsets;
}
/**
 * Return the angle between two points.
 * @param {Point} a
 * @param {Point} b
 */
DrawingObject.prototype.angle = function(a, b) {
    let opp = Math.abs(b._y - a._y);
    let adj = Math.abs(b._x - a._x);
    let theta;
    if (adj === 0.0) {
        theta = b._y > a._y ? (3.0 * Math.PI / 2.0) : (Math.PI / 2.0);
    } else {
        theta = Math.atan(opp / adj);
    }
    return theta;
}
/**
 * Returns the distance between two points. 
 * @param {Point} a
 * @param {Point} b
 */
DrawingObject.prototype.magnitude = function(a, b) {
    let m = new Point(b._x - a._x, b._y - a._y);
    return Math.sqrt(m._x * m._x + m._y * m._y);
}
/**
 * Hook for handling results of associated dialog boxes.
 */
DrawingObject.prototype.handleDialogResult = function(o) {}
/**
 * Hook called after the drawing object has been drawn and has been added to the chart.
 * @param {number} id
 */
DrawingObject.prototype.postCreate = function(id) {
    this._finished = true;
}
/**
 * Event handler for mouse double click events occuring after drawing the object.
 * @param {number} x
 * @param {number} y
 */
DrawingObject.prototype.onMouseDoubleClick = function(x, y) {
    return false;
}
/**
 * Event handler for mouse down events occuring after drawing the object.
 * @param {number} x
 * @param {number} y
 */
DrawingObject.prototype.onMouseDown = function(x, y) {
    this._selected = true;
    this._parent.repaint();
    this._parent.process();
    return true;
}
/**
 * Event handler for mouse down events occuring whilst drawing the object.
 * @param {number} x
 * @param {number} y
 */
DrawingObject.prototype.onMouseDownPre = function(x, y) {
    if (!this._parent._canvas)
        return;
    return this.addPoint(new Point(x, y), this._parent._canvas._overlays[this._parent._mouseArea]);
}
/**
 * Event handler for mouse move events; these occur whilst drawing the object.
 * @param {number} x
 * @param {number} y
 */
DrawingObject.prototype.onMouseMove = function(x, y) {
    if (!this._parent._canvas)
        return;
    this.setPoint(new Point(x, y), this._parent._canvas._overlays[this._parent._mouseArea]);
    return true;
}
/**
 * Event handler for mouse drag events; these occur whilst editing the object.
 * @param {number} x
 * @param {number} y
 */
DrawingObject.prototype.onMouseDrag = function(x, y) {
    if (!this._parent._canvas)
        return;
    if (this._selectedPoint !== -1) {
        this.setPoint(new Point(x, y), this._parent._canvas._overlays[this._parent._mouseArea], this._selectedPoint);
    } else {
        this.translate(x - this._parent._mouseOldX, y - this._parent._mouseOldY);
    }
    return true;
}
/**
 * Copy the state of this object into another object to create a duplicate.
 * @param {DrawingObject} other
 */
DrawingObject.prototype.copy = function(other) {
    for (let i = 0; i < this._points.length; i++) {
        other._points[i] = this._points[i].copy();
    }
    other._colour = this._colour;
    other._thickness = this._thickness;
    other._curPoint = this._curPoint;
    return other;
}
/**
 * Returns a new drawing object corresponding to a given ID. 
 * @static
 */
DrawingObject.getDrawingObject = function(p, type) {
    switch (type) {
        case DrawingObject.LINE:
            return new ChartLine(p, type);
        case DrawingObject.MIRROR_LINE:
            return new ChartLineMirror(p, type);
        case DrawingObject.HORIZ_LINE:
            return new HorizontalLine(p, type);
        case DrawingObject.VERT_LINE:
            return new VerticalLine(p, type);
        case DrawingObject.PARALLEL_LINES:
            return new ParallelLines(p, type);
        case DrawingObject.BOX:
            return new Box(p, type);
        case DrawingObject.CIRCLE:
            return new Circle(p, type);
        case DrawingObject.ARROW:
            return new Arrow(p, type);
        case DrawingObject.TEXT:
            return new DrawText(p, type);
        case DrawingObject.CALLOUT:
            return new Callout(p, type);
        case DrawingObject.FIB_RETRACEMENT:
            return new FibRetracement(p, type);
        case DrawingObject.FIB_RETRACEMENT_EXTENDED:
            return new FibRetracementExtended(p, type);
        case DrawingObject.CYCLE_LINES:
            return new CycleLines(p, type);
        case DrawingObject.SPEED_RESISTANCE:
            return new SpeedResistance(p, type);
        case DrawingObject.GANN_FAN:
            return new GannFan(p, type);
        case DrawingObject.PITCHFORK:
            return new AndrewsPitchfork(p, type);
        case DrawingObject.RAFF_REGRESSION:
            return new RaffRegression(p, type);
        case DrawingObject.C_RETRACEMENT:
            return new CRetracement(p, type);
        case DrawingObject.TIME_FIB_RETRACEMENT:
            return new TimeFibRetracement(p, type);
        case DrawingObject.LSHAPELINES:
            return new LShapeLines(p, type);
    }
}
/** @static */
DrawingObject.loadDescriptions = function() {
    DrawingObject.descriptions = new Array(DrawingObject.NUM_TOOLS);
    for (let i = 0; i < DrawingObject.NUM_TOOLS; i++) {
        DrawingObject.descriptions[i] = Language.getString("drawingtools_description" + i);
    }
}
/** @static */
DrawingObject.LINE = 0;
/** @static */
DrawingObject.MIRROR_LINE = 1;
/** @static */
DrawingObject.HORIZ_LINE = 2;
/** @static */
DrawingObject.VERT_LINE = 3;
/** @static */
DrawingObject.PARALLEL_LINES = 4;
/** @static */
DrawingObject.BOX = 5;
/** @static */
DrawingObject.CIRCLE = 6;
/** @static */
DrawingObject.ARROW = 7;
/** @static */
DrawingObject.TEXT = 8;
/** @static */
DrawingObject.CALLOUT = 9;
/** @static */
DrawingObject.FIB_RETRACEMENT = 10;
/** @static */
DrawingObject.CYCLE_LINES = 11;
/** @static */
DrawingObject.SPEED_RESISTANCE = 12;
/** @static */
DrawingObject.GANN_FAN = 13;
/** @static */
DrawingObject.PITCHFORK = 14;
/** @static */
DrawingObject.RAFF_REGRESSION = 15;
/** @static */
DrawingObject.C_RETRACEMENT = 16;
/** @static */
DrawingObject.TIME_FIB_RETRACEMENT = 17;
/** @static */
DrawingObject.LSHAPELINES = 18;
/** @static */
DrawingObject.NUM_TOOLS = 19;
/** @static */
DrawingObject.FIB_RETRACEMENT_EXTENDED = 26;
/** @static */
DrawingObject.MAX_SELECTION_DISTANCE = 4;
/** @static */
DrawingObject.icons = [Style.IMAGE_DRAW_LINE, Style.IMAGE_DRAW_MIRROR_LINE, Style.IMAGE_DRAW_HORIZ_LINE, Style.IMAGE_DRAW_VERT_LINE, Style.IMAGE_DRAW_PARALLEL_LINE, Style.IMAGE_DRAW_BOX, Style.IMAGE_DRAW_CIRCLE, Style.IMAGE_DRAW_ARROW, Style.IMAGE_DRAW_TEXT, Style.IMAGE_DRAW_CALLOUT, Style.IMAGE_DRAW_FIB, Style.IMAGE_DRAW_CYCLE, Style.IMAGE_DRAW_SPEED, Style.IMAGE_DRAW_GANN, Style.IMAGE_DRAW_PITCHFORK, Style.IMAGE_DRAW_RAFF, Style.IMAGE_DRAW_C_RTR, Style.IMAGE_DRAW_TIME_FIB, Style.IMAGE_DRAW_LTOOL];
/** @static */
DrawingObject.MAX_SELECTION_DISTANCE = 4;