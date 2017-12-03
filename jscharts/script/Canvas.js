/* global Component, Cursor */
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
    
    this._canvas.bind('contextmenu', function() {
        return false;
    });
    
    this._gc = this._canvas[0].getContext("2d");
    var dpr = window.devicePixelRatio || 1;
    var reslutionRatio = Math.round(screen.width / screen.height);
    if (reslutionRatio > dpr) {
        dpr = reslutionRatio;
    }
    var bsr = this._gc.webkitBackingStorePixelRatio ||
              this._gc.mozBackingStorePixelRatio ||
              this._gc.msBackingStorePixelRatio ||
              this._gc.oBackingStorePixelRatio ||
              this._gc.backingStorePixelRatio || 1;
    this._ratio = dpr / bsr;
    console.log(this._ratio);
    
    this._canvas.css("left", "0px");
    this._canvas.css("top", "0px");
    this._canvas.css("position", "absolute");
    this._drawCanvas = true;
    this._mode = Canvas.MODE_DRAW;
    
    this._canvas[0].width = this._width * this._ratio;
    this._canvas[0].height = this._height * this._ratio;
    this._canvas[0].style.width = this._width + "px";
    this._canvas[0].style.height = this._height + "px";
    this._gc.scale(this._ratio, this._ratio);
}
/**
 * @param {boolean} force
 */
Canvas.prototype.draw = function(force) {
    Component.prototype.draw.call(this, force);
    if (this._drawCanvas) {
        this._drawCanvas = false;
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
    if (this._mode !== Canvas.MODE_OBJECT) {
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
    if (this._mode !== Canvas.MODE_OBJECT) {
        this._gc.lineWidth = this._lineWidth;
        this._gc.strokeStyle = this._strokeStyle;
        this._gc.strokeRect(x, y, w, h);
    }
}
/**
 * @private
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {boolean} isFill
 * @param {number=} topY
 * @param {number=} bottomY
 */
Canvas.prototype._rectWithAdjust = function(x, y, w, h, isFill, topY, bottomY) {
    var topLineY = (typeof topY == 'undefined') ? this._topLineY : topY;
    var bottomLineY = (typeof bottomY == 'undefined') ? this._bottomLineY : bottomY;
    
    if (x + w <= this._topLineStartX || x >= this._topLineEndX ||
        y + h <= topLineY || y >= bottomLineY || h <= 0 || w <= 0) {
        return;
    }
    if (!isFill) {
        if (x <= this._topLineStartX) {
            w -= this._topLineStartX - x;
            x = this._topLineStartX;
            if (x + w >= this._topLineEndX) {
                w = this._topLineEndX - x;
                this.drawLine(x, y, x + w, y);
                this.drawLine(x, y + h, x + w, y + h);
                return;
            }
            if (y <= topLineY) {
                h -= topLineY - y;
                y = topLineY;
                this.drawLine(x + w, y, x + w, y + h);
                this.drawLine(x + w, y + h, x, y + h);
                return;
            }
            if (y + h >= bottomLineY) {
                h = bottomLineY - y;
                this.drawLine(x, y, x + w, y);
                this.drawLine(x + w, y, x + w, y + h);
                return;
            }
            this.drawLine(x, y, x + w, y);
            this.drawLine(x + w, y, x + w, y + h);
            this.drawLine(x + w, y + h, x, y + h);
            return;
        }
        if (x + w >= this._topLineEndX) {
            w = this._topLineEndX - x;
            if (y <= topLineY) {
                y = topLineY;
                this.drawLine(x, y, x, y + h);
                this.drawLine(x, y + h, x + w, y + h);
                return;
            }
            if (y + h >= bottomLineY) {
                h = bottomLineY - y;
                this.drawLine(x, y, x + w, y);
                this.drawLine(x, y, x, y + h);
                return;
            }
            this.drawLine(x, y, x + w, y);
            this.drawLine(x, y, x, y + h);
            this.drawLine(x, y + h, x + w, y + h);
            return;
        }
        if (y <= topLineY) {
            h -= topLineY - y;
            y = topLineY;
            if (y + h >= bottomLineY) {
                h = bottomLineY - y;
                this.drawLine(x, y, x, y + h);
                this.drawLine(x + w, y + h, x + w, y);
                return;
            }
            this.drawLine(x, y, x, y + h);
            this.drawLine(x, y + h, x + w, y + h);
            this.drawLine(x + w, y + h, x + w, y);
            return;
        }
        if (y + h >= bottomLineY) {
            h = bottomLineY - y;
            this.drawLine(x, y, x, y + h);
            this.drawLine(x, y, x + w, y);
            this.drawLine(x + w, y, x + w, y + h);
            return;
        }
        this.drawRect(x, y, w, h);
        return;
    }
    
    if (x <= this._topLineStartX) {
        var newX = this._topLineStartX + 1;
        // width less
        w -= newX - x;
        x = newX;
    }
    if (y <= topLineY) {
        var newY = topLineY + 1;
        // height less
        h -= newY - y;
        y = newY;
    }
    if (x + w >= this._topLineEndX) {
        // width less
        w = this._topLineEndX - x - 1;
    }
    if (y + h >= bottomLineY) {
        // height less
        h = bottomLineY - y - 1;
    }
    this.fillRect(x, y, w, h);
}
/**
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {number=} topY
 * @param {number=} bottomY
 */
Canvas.prototype.fillRectWithAdjust = function(x, y, w, h, topY, bottomY) {
      this._rectWithAdjust(x, y, w, h, true, topY, bottomY);
}
/**
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {number=} topY
 * @param {number=} bottomY
 */
Canvas.prototype.drawRectWithAdjust = function(x, y, w, h, topY, bottomY) {
    this._rectWithAdjust(x, y, w, h, false, topY, bottomY);
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
/**
 * @param {number=} topY
 * @param {number=} bottomY
 */
Canvas.prototype.end = function(topY, bottomY) {
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
            this._drawPolygon(topY, bottomY);
            break;
    }
}
/**
 * @param {Polygon} shape
 * @param {number=} topY
 * @param {number=} bottomY
 */
Canvas.prototype.fillPolygon = function(shape, topY, bottomY) {
    this.begin(Canvas.POLYGON);
    for (var i = 0; i < shape._npoints; i++) {
        this.vertex(shape._xpoints[i], shape._ypoints[i]);
    }
    this.end(topY, bottomY);
}
/**
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 */
Canvas.prototype.drawLine = function(x1, y1, x2, y2) {
    if (this._mode !== Canvas.MODE_OBJECT) {
        this._gc.beginPath();
        if (x1 === x2 && y1 === y2) {
            this._gc.fillStyle = this._strokeStyle;
            this._gc.fillRect(x1+this._lineWidth/2, y1+this._lineWidth/2, this._lineWidth/2, this._lineWidth/2);
        } else {
            this._gc.moveTo(x1, y1);
            this._gc.lineTo(x2, y2);
        }
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
 * @param {number=} topY
 * @param {number=} bottomY
 */
Canvas.prototype.drawLineWithAdjust = function(x1, y1, x2, y2, topY, bottomY) {
    var topLineY = (typeof topY == 'undefined') ? this._topLineY : topY;
    var bottomLineY = (typeof bottomY == 'undefined') ? this._bottomLineY : bottomY;
    
    if ((x1 <= this._topLineStartX && x2 <= this._topLineStartX) || (x1 >= this._topLineEndX && x2 >= this._topLineEndX))
        return;
    var inter;
    if (x1 <= this._topLineStartX) {
        inter = this.checkLineIntersection(x1, y1, x2, y2, this._topLineStartX, topLineY, this._topLineStartX, bottomLineY);
        if (inter.onLine1 && inter.onLine2 && inter.x !== null && inter.y !== null) {
            // new points for line1
            x1 = inter.x;
            y1 = inter.y;
        }
    } else if (x1 >= this._topLineEndX) {
        inter = this.checkLineIntersection(x1, y1, x2, y2, this._topLineEndX, topLineY, this._topLineEndX, bottomLineY);
        if (inter.onLine1 && inter.onLine2 && inter.x !== null && inter.y !== null) {
            x1 = inter.x;
            y1 = inter.y;
        }
    }
    if (x2 <= this._topLineStartX) {
        inter = this.checkLineIntersection(x1, y1, x2, y2, this._topLineStartX, topLineY, this._topLineStartX, bottomLineY);
        if (inter.onLine1 && inter.onLine2 && inter.x !== null && inter.y !== null) {
            // new points for line1
            x2 = inter.x;
            y2 = inter.y;
        }
    } else if (x2 >= this._topLineEndX) {
        inter = this.checkLineIntersection(x1, y1, x2, y2, this._topLineEndX, topLineY, this._topLineEndX, bottomLineY);
        if (inter.onLine1 && inter.onLine2 && inter.x !== null && inter.y !== null) {
            x2 = inter.x;
            y2 = inter.y;
        }
    }
    //--------------------
    // top start line
    if (y1 <= topLineY) {
        // find intersection with top horizontal
        inter = this.checkLineIntersection(x1, y1, x2, y2, this._topLineStartX, topLineY, this._topLineEndX, topLineY);
        if (inter.onLine1 && inter.onLine2 && inter.x !== null && inter.y !== null) {
            // new points for line1
            this.drawLine(inter.x, inter.y, x2, y2);
        }
    } 
    // top end line
    else if (y2 <= topLineY) {
        // find intersection with top horizontal
        inter = this.checkLineIntersection(x1, y1, x2, y2, this._topLineStartX, topLineY, this._topLineEndX, topLineY);
        if (inter.onLine2 && inter.x !== null && inter.y !== null) {
            // new points for line1
            this.drawLine(x1, y1, inter.x, inter.y);
        }
    }
    // bottom start line
    else if (y1 >= bottomLineY) {
        // find intersection with bottom horizontal
        inter = this.checkLineIntersection(x1, y1, x2, y2, this._bottomLineStartX, bottomLineY, this._bottomLineEndX, bottomLineY);
        if (inter.onLine1 && inter.onLine2 && inter.x !== null && inter.y !== null) {
            // new points for line2
            this.drawLine(inter.x, inter.y, x2, y2);
        }
    } 
    // bottom end line
    else if (y2 >= bottomLineY) {
        // find intersection with bottom horizontal
        inter = this.checkLineIntersection(x1, y1, x2, y2, this._bottomLineStartX, bottomLineY, this._bottomLineEndX, bottomLineY);
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
    if (this._mode !== Canvas.MODE_OBJECT) {
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
    var xr = w / 2;
    var yr = h / 2;
    var x = topLeftX + xr;
    var y = topLeftY + yr;
    //
    if ((x < this._topLineStartX && (x + w) < this._topLineStartX))
        return;
    if (this._mode !== Canvas.MODE_OBJECT) {
        this._gc.strokeStyle = this._strokeStyle;
        this._gc.lineWidth = this._lineWidth;
        this.ellipse(topLeftX, topLeftY, w, h);
        if (fill) {
            this._gc.fillStyle = this._fillStyle;
            this._gc.fill();
        }
        this._gc.closePath();
    }
}
Canvas.prototype.ellipse = function(x, y, w, h){
    var kappa = .5522848,
      ox = (w / 2) * kappa, // control point offset horizontal
      oy = (h / 2) * kappa, // control point offset vertical
      xe = x + w,           // x-end
      ye = y + h,           // y-end
      xm = x + w / 2,       // x-middle
      ym = y + h / 2;       // y-middle
  this._gc.beginPath();
  this._gc.moveTo(x, ym);
  this._gc.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
  this._gc.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
  this._gc.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
  this._gc.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
  this._gc.stroke();
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
    if (this._mode !== Canvas.MODE_OBJECT) {
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
/** 
 * @private 
 * @param {number=} topY
 * @param {number=} bottomY
 */
Canvas.prototype._drawPolygon = function(topY, bottomY) {
    if (this._path.length === 0)
        return;
    var topLineY = (typeof topY == 'undefined') ? this._topLineY : topY;
    var bottomLineY = (typeof bottomY == 'undefined') ? this._bottomLineY : bottomY;
    
    if (this._mode !== Canvas.MODE_OBJECT) {
        this._gc.strokeStyle = this._strokeStyle;
        this._gc.lineWidth = this._lineWidth;
        this._gc.beginPath();
        var curX, curY, prevX, prevY, i;
        /////
        var leftLineInterPoints = [];
        var prevIndex = 0;
        var curIndex;
        var inter, p;
        for (i = 1; i <= this._path.length; i++) {
            if (i === this._path.length) {
                curIndex = 0;
            } else {
                curIndex = i;    
            }
            curX = this._path[curIndex].x;
            curY = this._path[curIndex].y;
            prevX = this._path[prevIndex].x;
            prevY = this._path[prevIndex].y;
            inter = this.checkLineIntersection(curX, curY, prevX, prevY, this._topLineStartX, topLineY, this._topLineStartX, bottomLineY);
            if (inter.onLine1 && inter.onLine2 && inter.x !== null && inter.y !== null) {
                if (curX <= this._topLineStartX)
                    leftLineInterPoints.push({p: curIndex, x: inter.x + 1, y: inter.y + 1});
                else
                    leftLineInterPoints.push({p: prevIndex, x: inter.x + 1, y: inter.y + 1});
            }
            prevIndex = curIndex;
        }
        for (i = 0; i < leftLineInterPoints.length; i++) {
            p = leftLineInterPoints[i];
            this._path[p.p].x = p.x;
            this._path[p.p].y = p.y;
        }
        /////
        var topLineInterPoints = [];
        prevIndex = 0;
        for (i = 1; i <= this._path.length; i++) {
            if (i === this._path.length) {
                curIndex = 0;
            } else {
                curIndex = i;
            }
            curX = this._path[curIndex].x;
            curY = this._path[curIndex].y;
            prevX = this._path[prevIndex].x;
            prevY = this._path[prevIndex].y;
            inter = this.checkLineIntersection(curX, curY, prevX, prevY, this._topLineStartX, topLineY, this._topLineEndX, topLineY);
            if (inter.onLine1 && inter.onLine2 && inter.x !== null && inter.y !== null) {
                if (curY <= topLineY)
                    topLineInterPoints.push({p: curIndex, x: inter.x, y: inter.y});
                else
                    topLineInterPoints.push({p: prevIndex, x: inter.x, y: inter.y});
            } else {
                // line out of bounds
                if (curY <= topLineY && prevY <= topLineY) {
                    topLineInterPoints.push({p: prevIndex, x: NaN, y: NaN});
                }
            }
            prevIndex = curIndex;
        }
        var set = new Array();
        for (i = 0; i < topLineInterPoints.length; i++) {
            p = topLineInterPoints[i];
            // if has
            if (set.indexOf(p.p) !== -1) {
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
                set.push(p.p);
            }
        }
        /////
        var bottomLineInterPoints = [];
        prevIndex = 0;
        for (i = 1; i <= this._path.length; i++) {
            if (i === this._path.length) {
                curIndex = 0;
            } else {
                curIndex = i;    
            }
            curX = this._path[curIndex].x;
            curY = this._path[curIndex].y;
            prevX = this._path[prevIndex].x;
            prevY = this._path[prevIndex].y;
            inter = this.checkLineIntersection(curX, curY, prevX, prevY, this._bottomLineStartX, bottomLineY, this._bottomLineEndX, bottomLineY);
            if (inter.onLine1 && inter.onLine2 && inter.x !== null && inter.y !== null) {
                if (curY >= bottomLineY)
                    bottomLineInterPoints.push({p: curIndex, x: inter.x, y: inter.y});
                else
                    bottomLineInterPoints.push({p: prevIndex, x: inter.x, y: inter.y});
            } else {
                // line out of bounds
                if (curY >= bottomLineY && prevY >= bottomLineY) {
                    bottomLineInterPoints.push({p: prevIndex, x: NaN, y: NaN});
                }
            }
            prevIndex = curIndex;
        }
        set = new Array();
        for (i = 0; i < bottomLineInterPoints.length; i++) {
            p = bottomLineInterPoints[i];
            // if has
            if (set.indexOf(p.p) !== -1) {
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
                set.push(p.p);
            }
        }
        /////
        var initX, initY;
        for (i = 0; i < this._path.length; i++) {
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
    result.x = parseInt(line1StartX + (a * (line1EndX - line1StartX)), 10);
    result.y = parseInt(line1StartY + (a * (line1EndY - line1StartY)), 10);
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
    if (this._mode !== Canvas.MODE_OBJECT) {
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
    if (this._mode !== Canvas.MODE_OBJECT) {
        this._gc.fillStyle = this._strokeStyle;
        for (var i = 0; i < this._path.length; i++) {
            var p = this._path[i];
            this._gc.fillRect(p.x - 0.5, p.y - 0.5, 1, 1);
        }
    }
}
/** @private */
Canvas.prototype._drawLineStrip = function() {
    if (this._path.length === 0)
        return;
    var i;
    if (this._mode === Canvas.MODE_OBJECT) {
       if (this._object) {
            var sx = this._path[0].x;
            var sy = this._path[0].y;
            var ex, ey, d;
            for (i = 1; i < this._path.length; i++) {
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
        for (i = 0; i < this._path.length; i++) {
            var p = this._path[i];
            this._gc.lineTo(p.x, p.y);
        }
        this._gc.stroke();    
    }
}
/** @private */
Canvas.prototype._drawLineLoop = function() {
    if (this._path.length === 0)
        return;
    if (this._mode !== Canvas.MODE_OBJECT) {
        this._gc.strokeStyle = this._strokeStyle;
        this._gc.lineWidth = this._lineWidth;
        this._gc.beginPath();
        this._gc.moveTo(this._path[0].x, this._path[0].y);
        for (var i = 0; i < this._path.length; i++) {
            var p = this._path[i];
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