/**
 * ------
 * Canvas
 * ------
 * @constructor 
 * @extends {Component}
 * @param {string} id - ID of div
 * @param {Component=} delegate
 */
function Canvas(id, delegate) {
    Component.call(this, id, delegate);
}
/**
 * Inheriting
 */
Canvas.prototype = Object.create(Component.prototype);
Canvas.prototype.constructor = Canvas;
/** @static */
Canvas.POINTS = 0;
/** @static */
Canvas.LINES = 1;
/** @static */
Canvas.LINE_STRIP = 2;
/** @static */
Canvas.LINE_LOOP = 3;
/** @static */
Canvas.POLYGON = 4;
/** @static */
Canvas.MODE_DRAW = 0;
/** @static */
Canvas.MODE_OBJECT = 1;
Canvas.prototype.create = function() {
    Component.prototype.create.call(this);
    var cid = this._id + "_canvas";
    this._div.append("<canvas id=\"" + cid + "\"></canvas>");
    this._canvas = $("#" + cid);
    
    this._canvas.bind('contextmenu', function(e){
        return false;
    }); 
    
    this._gc = this._canvas[0].getContext("2d");
    
    let dpr = window.devicePixelRatio || 1;
    let bsr = this._gc.webkitBackingStorePixelRatio ||
              this._gc.mozBackingStorePixelRatio ||
              this._gc.msBackingStorePixelRatio ||
              this._gc.oBackingStorePixelRatio ||
              this._gc.backingStorePixelRatio || 1;
    this._ratio = dpr / bsr;
    
    this._canvas.css("left", "0px");
    this._canvas.css("top", "0px");
    this._canvas.css("position", "absolute");
    this._drawCanvas = true;
    this._mode = Canvas.MODE_DRAW;
}
/**
 * @param {boolean} force
 */
Canvas.prototype.draw = function(force) {
    Component.prototype.draw.call(this, force);
    if (this._drawCanvas) {
        this._drawCanvas = false;
        this._canvas[0].width = this._width * this._ratio;
        this._canvas[0].height = this._height * this._ratio;
        this._canvas[0].style.width = this._width + "px";
        this._canvas[0].style.height = this._height + "px";
        this._gc.setTransform(this._ratio, 0, 0, this._ratio, 0, 0);
    }
    this._object = undefined;
}
/** @override */
Canvas.prototype.setBounds = function(x, y, w, h) {
    if (Component.prototype.setBounds.call(this, x, y, w, h)) {
        this._drawCanvas = true;
        return true;
    }
    return false;
}
/**
 * @param {Font} font
 */
Canvas.prototype.setFont = function(font) {
    this._font = font;
    this._gc.font = font.getSize() + "px " + font.getFontFamily();
}
Canvas.prototype.getFont = function() {
    return this._font;
}
/**
 * @param {Color|string} color
 */
Canvas.prototype.setStrokeColor = function(color) {
    this._strokeStyle = color.toString();
}
/**
 * @param {Color|string} color
 */
Canvas.prototype.setFillColor = function(color) {
    this._fillStyle = color.toString();
}
/**
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 */
Canvas.prototype.fillRect = function(x, y, w, h) {
    if (this._mode === Canvas.MODE_OBJECT) {
        
    } else {
        this._gc.fillStyle = this._fillStyle;
        this._gc.fillRect(x, y, w, h);    
    }
}
/**
 * @param {string} text
 * @param {number} x
 * @param {number} y
 */
Canvas.prototype.fillText = function(text, x, y) {
    this._gc.fillStyle = this._fillStyle;
    this._gc.fillText(text, x, y);
}
/**
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 */
Canvas.prototype.drawRect = function(x, y, w, h) {
    if (this._mode === Canvas.MODE_OBJECT) {
        
    } else {
        this._gc.lineWidth = this._lineWidth;
        this._gc.strokeStyle = this._strokeStyle;
        this._gc.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);       
    }
}
/**
 * @private
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {boolean} isFill
 */
Canvas.prototype._rectWithAdjust = function(x, y, w, h, isFill) {
    if (x + w <= this._topLineStartX || x >= this._topLineEndX ||
        y + h <= this._topLineY || y >= this._bottomLineY) {
        return;
    }
    if (x <= this._topLineStartX) {
        let newX = this._topLineStartX + 1;
        // width less
        w -= newX - x;
        x = newX;
    }
    if (y <= this._topLineY) {
        let newY = this._topLineY + 1;
        // height less
        h -= newY - y;
        y = newY;
    }
    if (x + w >= this._topLineEndX) {
        // width less
        w = this._topLineEndX - x - 1;
    }
    if (y + h >= this._bottomLineY) {
        // height less
        h = this._bottomLineY - y - 1;
    }
    if (isFill) {
        this.fillRect(x, y, w, h);
    } else {
        this.drawRect(x, y, w, h);
    }
}
/**
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 */
Canvas.prototype.fillRectWithAdjust = function(x, y, w, h) {
      this._rectWithAdjust(x, y, w, h, true);
}
/**
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 */
Canvas.prototype.drawRectWithAdjust = function(x, y, w, h) {
    this._rectWithAdjust(x, y, w, h, false);
}
/**
 * @param {number} type
 */
Canvas.prototype.begin = function(type) {
    this._pathType = type;
    this._path = [];
}
/**
 * @param {number} lineWidth
 */
Canvas.prototype.setLineWidth = function(lineWidth) {
    this._lineWidth = lineWidth;
}
/**
 * @param {number} x
 * @param {number} y
 */
Canvas.prototype.vertex = function(x, y) {
    this._path.push({ x: x, y: y } );
}
Canvas.prototype.end = function() {
    switch (this._pathType) {
        case Canvas.LINE_STRIP:
            this._drawLineStrip();
            break;
        case Canvas.LINE_LOOP:
            this._drawLineLoop();
            break;
        case Canvas.LINES:
            this._drawLines();
            break;
        case Canvas.POINTS:
            this._drawPoints();
            break;
        case Canvas.POLYGON:
            this._drawPolygon();
            break;
    }
}
/**
 * @param {Polygon} shape
 */
Canvas.prototype.fillPolygon = function(shape) {
    this.begin(Canvas.POLYGON);
    for (let i = 0; i < shape._npoints; i++) {
        this.vertex(shape._xpoints[i], shape._ypoints[i]);
    }
    this.end();
}
/**
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 */
Canvas.prototype.drawLine = function(x1, y1, x2, y2) {
    if (this._mode === Canvas.MODE_OBJECT) {
        
    } else {
        this._gc.beginPath();
        this._gc.moveTo(x1 + 0.5, y1 + 0.5);
        this._gc.lineTo(x2 + 0.5, y2 + 0.5);    
        this._gc.strokeStyle = this._strokeStyle;
        this._gc.lineWidth = this._lineWidth;
        this._gc.stroke();    
    }
}
/**
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 */
Canvas.prototype.drawLineWithAdjust = function(x1, y1, x2, y2) {
    if ((x1 <= this._topLineStartX && x2 <= this._topLineStartX) || (x1 >= this._topLineEndX && x2 >= this._topLineEndX))
        return;
    if (x1 <= this._topLineStartX) {
        let inter = this.checkLineIntersection(x1, y1, x2, y2, this._topLineStartX, this._topLineY, this._topLineStartX, this._bottomLineY);
        if (inter.onLine1 && inter.onLine2 && inter.x !== null && inter.y !== null) {
            // new points for line1
            x1 = inter.x;
            y1 = inter.y;
        }
    } else if (x1 >= this._topLineEndX) {
        let inter = this.checkLineIntersection(x1, y1, x2, y2, this._topLineEndX, this._topLineY, this._topLineEndX, this._bottomLineY);
        if (inter.onLine1 && inter.onLine2 && inter.x !== null && inter.y !== null) {
            x1 = inter.x;
            y1 = inter.y;
        }
    }
    if (x2 <= this._topLineStartX) {
        let inter = this.checkLineIntersection(x1, y1, x2, y2, this._topLineStartX, this._topLineY, this._topLineStartX, this._bottomLineY);
        if (inter.onLine1 && inter.onLine2 && inter.x !== null && inter.y !== null) {
            // new points for line1
            x2 = inter.x;
            y2 = inter.y;
        }
    } else if (x2 >= this._topLineEndX) {
        let inter = this.checkLineIntersection(x1, y1, x2, y2, this._topLineEndX, this._topLineY, this._topLineEndX, this._bottomLineY);
        if (inter.onLine1 && inter.onLine2 && inter.x !== null && inter.y !== null) {
            x2 = inter.x;
            y2 = inter.y;
        }
    }
    //--------------------
    // top start line
    if (y1 <= this._topLineY) {
        // find intersection with top horizontal
        let inter = this.checkLineIntersection(x1, y1, x2, y2, this._topLineStartX, this._topLineY, this._topLineEndX, this._topLineY);
        if (inter.onLine1 && inter.onLine2 && inter.x !== null && inter.y !== null) {
            // new points for line1
            this.drawLine(inter.x, inter.y, x2, y2);
        }
    } 
    // top end line
    else if (y2 <= this._topLineY) {
        // find intersection with top horizontal
        let inter = this.checkLineIntersection(x1, y1, x2, y2, this._topLineStartX, this._topLineY, this._topLineEndX, this._topLineY);
        if (inter.onLine2 && inter.x !== null && inter.y !== null) {
            // new points for line1
            this.drawLine(x1, y1, inter.x, inter.y);
        }
    }
    // bottom start line
    else if (y1 >= this._bottomLineY) {
        // find intersection with bottom horizontal
        let inter = this.checkLineIntersection(x1, y1, x2, y2, this._bottomLineStartX, this._bottomLineY, this._bottomLineEndX, this._bottomLineY);
        if (inter.onLine1 && inter.onLine2 && inter.x !== null && inter.y !== null) {
            // new points for line2
            this.drawLine(inter.x, inter.y, x2, y2);
        }
    } 
    // bottom end line
    else if (y2 >= this._bottomLineY) {
        // find intersection with bottom horizontal
        let inter = this.checkLineIntersection(x1, y1, x2, y2, this._bottomLineStartX, this._bottomLineY, this._bottomLineEndX, this._bottomLineY);
        if (inter.onLine2 && inter.x !== null && inter.y !== null) {
            // new points for line2
            this.drawLine(x1, y1, inter.x, inter.y);
        }
    } else {
        this.drawLine(x1, y1, x2, y2);    
    }
}
/**
 * @param {number} x
 * @param {number} y
 */
Canvas.prototype.drawPoint = function(x, y) {
    if (this._mode === Canvas.MODE_OBJECT) {
        
    } else {
        this._gc.fillStyle = this._strokeStyle;
        this._gc.fillRect(x, y, 1, 1);
    }
}
/**
 * @param {number} topLeftX
 * @param {number} topLeftY
 * @param {number} w
 * @param {number} h
 * @param {boolean} fill
 */
Canvas.prototype._drawOval = function(topLeftX, topLeftY, w, h, fill) {
    // translate to center point and radius
    let xr = w / 2;
    let yr = h / 2;
    let x = topLeftX + xr;
    let y = topLeftY + yr;
    //
    if ((x < this._topLineStartX && (x + w) < this._topLineStartX))
        return;
    if (this._mode === Canvas.MODE_OBJECT) {
        
    } else {
        this._gc.strokeStyle = this._strokeStyle;
        this._gc.lineWidth = this._lineWidth;
        this._gc.beginPath();
        this._gc.ellipse(x, y, xr, yr, 0, 0, 2 * Math.PI)
        this._gc.stroke();
        if (fill) {
            this._gc.fill();
        }
        this._gc.closePath();
    }
}
/**
 * @param {number} x - top left point
 * @param {number} y - top left point
 * @param {number} w
 * @param {number} h
 */
Canvas.prototype.drawOval = function(x, y, w, h) {
    this._drawOval(x, y, w, h, false);
}
/**
 * @param {number} x - top left point
 * @param {number} y - top left point
 * @param {number} w
 * @param {number} h
 */
Canvas.prototype.fillOval = function(x, y, w, h) {
    this._drawOval(x, y, w, h, true);
}
/**
 * @param {number} x
 * @param {number} y
 * @param {number} r - radius
 */
Canvas.prototype.drawCircle = function(x, y, r) {
    if (this._mode === Canvas.MODE_OBJECT) {
        
    } else {
        this._gc.strokeStyle = this._strokeStyle;
        this._gc.lineWidth = this._lineWidth;
        this._gc.beginPath();
        this._gc.arc(x, y, r, 0, 2 * Math.PI);
        this._gc.stroke();
    }
}
/**
 * @param {number} x
 * @param {number} y
 * @param {number} r - radius
 */
Canvas.prototype.fillCircle = function(x, y, r) {
    if (this._mode === Canvas.MODE_OBJECT) {
        if (this._object) {
            var d = Math.sqrt(this._distanceSquared(this._objectX, this._objectY, x, y));
            if(!isNaN(d) && (d < r * 1.5) && (this._bestObjectDistance === undefined || d < this._bestObjectDistance)) {
                this._bestObjectDistance = d;
                this._bestObject = this._object;
            }
        }
    } else {
        this._gc.fillStyle = this._fillStyle;
        this._gc.beginPath();
        this._gc.arc(x, y, r, 0, 2 * Math.PI);
        this._gc.fill();
    }
}
/**
 * @param {Object} object
 */
Canvas.prototype.setObject = function(object) {
    this._object = object;
}
Canvas.prototype.clearObject = function() {
    this._object = undefined;
}
Canvas.prototype.getObject = function() {
    return this._bestObject;
}
/** @override */
Canvas.prototype.onMouseMove = function(x, y) {
    this._objectX = x;
    this._objectY = y;    
    
    this._mode = Canvas.MODE_OBJECT;
    this._objectX = x;
    this._objectY = y;
    this._bestObject = undefined;
    this._bestObjectDistance = 0;

    this.draw(true);    

    if (this._bestObjectDistance > 5)
        this._bestObject = undefined;
    
    if (this._bestObject === undefined) {
        this.setCursor(Cursor.DEFAULT_CURSOR);
    } else {
        this.setCursor(Cursor.HAND_CURSOR);
    }
    this._mode = Canvas.MODE_DRAW;
}
Canvas.prototype.onMouseLeave = function() {
    this._objectX = undefined;
    this._objectY = undefined;    
}
/**
 * @param {number} transparency
 */
Canvas.prototype.setTransparency = function(transparency) {
    this._transparency = transparency;
}
/** @private */
Canvas.prototype._drawPolygon = function() {
    if (this._path.length === 0)
        return;
    
    if (this._mode === Canvas.MODE_OBJECT) {
        
    } else {
        this._gc.strokeStyle = this._strokeStyle;
        this._gc.lineWidth = this._lineWidth;
        this._gc.beginPath();
        let points, curX, curY, prevX, prevY;
        /////
        let leftLineInterPoints = [];
        let prevIndex = 0;
        let curIndex;
        for (let i = 1; i <= this._path.length; i++) {
            if (i === this._path.length) {
                curIndex = 0;
            } else {
                curIndex = i;    
            }
            curX = this._path[curIndex].x;
            curY = this._path[curIndex].y;
            prevX = this._path[prevIndex].x;
            prevY = this._path[prevIndex].y;
            let inter = this.checkLineIntersection(curX, curY, prevX, prevY, this._topLineStartX, this._topLineY, this._topLineStartX, this._bottomLineY);
            if (inter.onLine1 && inter.onLine2 && inter.x !== null && inter.y !== null) {
                if (curX <= this._topLineStartX)
                    leftLineInterPoints.push({p: curIndex, x: inter.x + 1, y: inter.y + 1});
                else
                    leftLineInterPoints.push({p: prevIndex, x: inter.x + 1, y: inter.y + 1});
            }
            prevIndex = curIndex;
        }
        for (let p of leftLineInterPoints) {
            this._path[p.p].x = p.x;
            this._path[p.p].y = p.y;
        }
        /////
        let topLineInterPoints = [];
        prevIndex = 0;
        for (let i = 1; i <= this._path.length; i++) {
            if (i === this._path.length) {
                curIndex = 0;
            } else {
                curIndex = i;
            }
            curX = this._path[curIndex].x;
            curY = this._path[curIndex].y;
            prevX = this._path[prevIndex].x;
            prevY = this._path[prevIndex].y;
            let inter = this.checkLineIntersection(curX, curY, prevX, prevY, this._topLineStartX, this._topLineY, this._topLineEndX, this._topLineY);
            if (inter.onLine1 && inter.onLine2 && inter.x !== null && inter.y !== null) {
                if (curY <= this._topLineY)
                    topLineInterPoints.push({p: curIndex, x: inter.x, y: inter.y});
                else
                    topLineInterPoints.push({p: prevIndex, x: inter.x, y: inter.y});
            } else {
                // line out of bounds
                if (curY <= this._topLineY && prevY <= this._topLineY) {
                    topLineInterPoints.push({p: prevIndex, x: NaN, y: NaN});
                }
            }
            prevIndex = curIndex;
        }
        let set = new Set();
        for (let p of topLineInterPoints) {
            if (set.has(p.p)) {
                // insert point
                if (!isNaN(p.x) && !isNaN(p.y)) {
                    if (p.p === 0 || p.p + 1 >= this._path.length) {
                        this._path.push({x: p.x, y: p.y})
                    } else
                        this._path.splice(p.p + 1, 0, {x: p.x, y: p.y});
                }
            } else {
                this._path[p.p].x = p.x;
                this._path[p.p].y = p.y;    
                set.add(p.p);
            }
        }
        /////
        let bottomLineInterPoints = [];
        prevIndex = 0;
        for (let i = 1; i <= this._path.length; i++) {
            if (i === this._path.length) {
                curIndex = 0;
            } else {
                curIndex = i;    
            }
            curX = this._path[curIndex].x;
            curY = this._path[curIndex].y;
            prevX = this._path[prevIndex].x;
            prevY = this._path[prevIndex].y;
            let inter = this.checkLineIntersection(curX, curY, prevX, prevY, this._bottomLineStartX, this._bottomLineY, this._bottomLineEndX, this._bottomLineY);
            if (inter.onLine1 && inter.onLine2 && inter.x !== null && inter.y !== null) {
                if (curY >= this._bottomLineY)
                    bottomLineInterPoints.push({p: curIndex, x: inter.x, y: inter.y});
                else
                    bottomLineInterPoints.push({p: prevIndex, x: inter.x, y: inter.y});
            } else {
                // line out of bounds
                if (curY >= this._bottomLineY && prevY >= this._bottomLineY) {
                    bottomLineInterPoints.push({p: prevIndex, x: NaN, y: NaN});
                }
            }
            prevIndex = curIndex;
        }
        set = new Set();
        for (let p of bottomLineInterPoints) {
            if (set.has(p.p)) {
                // insert point
                if (!isNaN(p.x) && !isNaN(p.y)) {
                    if (p.p === 0 || p.p + 1 >= this._path.length) {
                        this._path.push({x: p.x, y: p.y})
                    } else
                        this._path.splice(p.p + 1, 0, {x: p.x, y: p.y});
                }
            } else {
                this._path[p.p].x = p.x;
                this._path[p.p].y = p.y;    
                set.add(p.p);
            }
        }
        /////
        let initX, initY;
        for (let i = 0; i < this._path.length; i++) {
            curX = this._path[i].x;
            curY = this._path[i].y;
            if (!isNaN(curX) && !isNaN(curY)) {
                if (!initX && !initY) {
                    initX = curX;
                    initY = curY;
                    this._gc.moveTo(initX, initY);
                } else {
                    this._gc.lineTo(curX, curY);
                }
            }
        }
        this._gc.lineTo(initX, initY);
        this._gc.fillStyle = this._fillStyle;
        this._gc.fill();
    }
}
/**
 * @param {number} line1StartX
 * @param {number} line1StartY
 * @param {number} line1EndX
 * @param {number} line1EndY
 * @param {number} line2StartX
 * @param {number} line2StartY
 * @param {number} line2EndX
 * @param {number} line2EndY
 */
Canvas.prototype.checkLineIntersection = function(line1StartX, line1StartY, line1EndX, line1EndY, line2StartX, line2StartY, line2EndX, line2EndY) {
    // if the lines intersect, the result contains the x and y of the intersection (treating the lines as infinite) and booleans for whether line segment 1 or line segment 2 contain the point
    var denominator, a, b, numerator1, numerator2, result = {
        x: null,
        y: null,
        onLine1: false,
        onLine2: false
    }
    denominator = ((line2EndY - line2StartY) * (line1EndX - line1StartX)) - ((line2EndX - line2StartX) * (line1EndY - line1StartY));
    if (denominator == 0) {
        return result;
    }
    a = line1StartY - line2StartY;
    b = line1StartX - line2StartX;
    numerator1 = ((line2EndX - line2StartX) * a) - ((line2EndY - line2StartY) * b);
    numerator2 = ((line1EndX - line1StartX) * a) - ((line1EndY - line1StartY) * b);
    a = numerator1 / denominator;
    b = numerator2 / denominator;

    // if we cast these lines infinitely in both directions, they intersect here:
    result.x = Math.trunc(line1StartX + (a * (line1EndX - line1StartX)));
    result.y = Math.trunc(line1StartY + (a * (line1EndY - line1StartY)));
/*
        // it is worth noting that this should be the same as:
        x = line2StartX + (b * (line2EndX - line2StartX));
        y = line2StartX + (b * (line2EndY - line2StartY));
        */
    // if line1 is a segment and line2 is infinite, they intersect if:
    if (a > 0 && a < 1) {
        result.onLine1 = true;
    }
    // if line2 is a segment and line1 is infinite, they intersect if:
    if (b > 0 && b < 1) {
        result.onLine2 = true;
    }
    // if line1 and line2 are segments, they intersect if both of the above are true
    return result;
}
/** @private */
Canvas.prototype._drawLines = function() {
    if (this._mode === Canvas.MODE_OBJECT) {
        
    } else {
        this._gc.strokeStyle = this._strokeStyle;
        this._gc.lineWidth = this._lineWidth;
        var i = 0;
        while(i < this._path.length) {
            this._gc.beginPath();
            this._gc.moveTo(this._path[i].x, this._path[i].y);
            i++;
            this._gc.lineTo(this._path[i].x, this._path[i].y);
            i++;
            this._gc.stroke();    
        }
    }
}
/** @private */
Canvas.prototype._drawPoints = function() {
    if (this._path.length === 0)
        return;

    if (this._mode === Canvas.MODE_OBJECT) {

    } else {
        this._gc.fillStyle = this._strokeStyle;
        for (let p of this._path) {
            this._gc.fillRect(p.x - 0.5, p.y - 0.5, 1, 1);
        }
    }
}
/** @private */
Canvas.prototype._drawLineStrip = function() {
    if (this._path.length === 0)
        return;
    
    if (this._mode === Canvas.MODE_OBJECT) {
       if (this._object) {
            let sx = this._path[0].x;
            let sy = this._path[0].y;
            let ex, ey, d;
            for (let i = 1; i < this._path.length; i++) {
                ex = this._path[i].x;
                ey = this._path[i].y;
                d = this._distanceToSegment(this._objectX, this._objectY, sx,sy, ex,ey);
                if(!isNaN(d) && (this._bestObjectDistance === undefined || d < this._bestObjectDistance)) {
                    this._bestObject = this._object;
                    this._bestObjectDistance = d;
                }
                sx = ex;
                sy = ey;
            }
        }
    } else {
        this._gc.strokeStyle = this._strokeStyle;
        this._gc.lineWidth = this._lineWidth;
        this._gc.beginPath();
        this._gc.moveTo(this._path[0].x, this._path[0].y);
        for (let p of this._path) {
            this._gc.lineTo(p.x, p.y);
        }
        this._gc.stroke();    
    }
}
/** @private */
Canvas.prototype._drawLineLoop = function() {
    if (this._path.length === 0)
        return;

    if (this._mode === Canvas.MODE_OBJECT) {

    } else {
        this._gc.strokeStyle = this._strokeStyle;
        this._gc.lineWidth = this._lineWidth;
        this._gc.beginPath();
        this._gc.moveTo(this._path[0].x, this._path[0].y);
        for (let p of this._path) {
            this._gc.lineTo(p.x, p.y);
        }
        this._gc.lineTo(this._path[0].x, this._path[0].y);
        this._gc.stroke();    
    }
}
/**
 * @private
 * @param {number} vx
 * @param {number} vy
 * @param {number} wx
 * @param {number} wy
 */
Canvas.prototype._distanceSquared = function(vx, vy, wx, wy) {
    return ((vx - wx) * (vx - wx)) + ((vy - wy) * (vy - wy));
}
/**
 * @private
 * @param {number} px
 * @param {number} py
 * @param {number} vx
 * @param {number} vy
 * @param {number} wx
 * @param {number} wy
 */
Canvas.prototype._distanceToSegment = function(px, py, vx, vy, wx, wy) {
    var l2 = this._distanceSquared(vx, vy, wx, wy);
    if (l2 === 0) 
        return Math.sqrt(this._distanceSquared(px, py, vx, vy));
    var t = ((px - vx) * (wx - vx) + (py - vy) * (wy - vy)) / l2;
    if (t < 0) 
        return Math.sqrt(this._distanceSquared(px, py, vx, vy));
    if (t > 1) 
        return Math.sqrt(this._distanceSquared(px, py, wx, wy));
    return Math.sqrt(this._distanceSquared(px,py, vx + t * (wx - vx), vy + t * (wy - vy)));
}