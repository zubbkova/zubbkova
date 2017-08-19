/**
 * -----
 * Label
 * -----
 * @constructor 
 * @extends {Component}
 * @param {string} id - ID of div
 * @param {Component=} delegate
 */
function Label(id, delegate) {
    Component.call(this, id, delegate);
    this._align = Label.ALIGN_LEFT;
    this._verticalAlign = Label.VERTICAL_ALIGN_CENTER;
    this._leftMargin = 0;
    this._cursor = Cursor.TEXT_CURSOR;
    this._drawCursor = true;
}
/**
 * Inheriting
 */
Label.prototype = Object.create(Component.prototype);
Label.prototype.constructor = Label;
/** @static */
Label.ALIGN_LEFT = 0;
/** @static */
Label.ALIGN_RIGHT = 1;
/** @static */
Label.ALIGN_CENTER = 2;
/** @static */
Label.ROTATE_NONE = 0;
/** @static */
Label.ROTATE_90 = 1;
/** @static */
Label.ROTATE_180 = 2;
/** @static */
Label.ROTATE_270 = 3;
/** @static */
Label.VERTICAL_ALIGN_CENTER = 0;
/** @static */
Label.VERTICAL_ALIGN_TOP = 1;
/** @override */
Label.prototype.create = function() {
    Component.prototype.create.call(this);
    this._labelID = this._id + "_label";
    this._div.append("<span id=\"" + this._labelID + "\"></span>");
    this._label = $("#" + this._labelID); 
    this._label.css("overflow","hidden"); 
    this._label.css("white-space","pre-line"); 
    this._label.css('display', 'block'); 
    this._label.css('height', '100%'); 
    this._label.css('pointer-events', 'none'); 
    this._label.css('cursor', 'default'); 
    this._label.css('user-select', 'none'); 
    this._label.css('-o-user-select', 'none'); 
    this._label.css('-moz-user-select', 'none'); 
    this._label.css('-khtml-user-select', 'none'); 
    this._label.css('-webkit-user-select', 'none'); 
    this._drawText = true;
}
/**
 * @param {number} align
 */
Label.prototype.setVerticalAlign = function(align) {
    if (align !== this._verticalAlign) {
        this._verticalAlign = align;
        this._drawText = true;
    }
}
/**
 * @param {number} align
 */
Label.prototype.setAlign = function(align) {
    if (align !== this._align) {
        this._align = align;
        this._drawText = true;
    }
}
/**
 * @param {number} rotation
 */
Label.prototype.setRotation = function(rotation) {
    if (rotation !== this._rotation) {
        this._rotation = rotation;
        this._drawText = true;
    }
}
/**
 * @param {boolean} bold
 */
Label.prototype.setBold = function(bold) {
    if (bold !== this._bold) {
        this._bold = bold;
        this._drawText = true;
    }
}
/**
 * @param {number} leftMargin
 */
Label.prototype.setLeftMargin = function(leftMargin) {
    if (this._leftMargin !== leftMargin) {
        this._leftMargin = leftMargin;
        this._drawText = true;
    }
}
/** @override */
Label.prototype.setColor = function(color) {
    if(Component.prototype.setColor.call(this,color))
        this._drawText=true;
}
/** @override */
Label.prototype.setBounds = function(x, y, width, height) {
    if(Component.prototype.setBounds.call(this,x,y,width,height)) {      
        this._drawText=true;
        return true;
    }
    return false;
}
/** @override */
Label.prototype.draw = function(force) {
    Component.prototype.draw.call(this,force);
    
    if(this._drawText)
    {
        this._drawText=false;
        var a;
        switch(this._align)
        {
            case Label.ALIGN_LEFT:
                a="left";
                break;
            case Label.ALIGN_RIGHT:
                a="right";
                break;
            case Label.ALIGN_CENTER:
                a="center";
                break;
        }
        this._div.css("text-align",a);
        
        this._label.css("margin-left",this._leftMargin+"px");        
        this._label.css("color",this._color);       
        
        switch(this._rotation)
        {
            case Label.ROTATE_90:
                this._label.css("line-height",(this._width*1.0)+"px");
                this._div.css("height",this._width);
                this._div.css("width",this._height);
                this._div.css("transform","rotate(90deg)");
                this._div.css("transform-origin","0% 0%");
                this._div.css("left",this._x+this._width+"px");
                break;
            default:
                if (!this._autoWidth) {
                    this._div.css("width",this._width);
                }
                if (!this._autoHeight) {
                    if (this._verticalAlign === Label.VERTICAL_ALIGN_TOP) {
                        this._label.css("line-height", (this._fontSize * 1.3) + "px");
                    } else {
                        this._label.css("line-height",(this._height*1.0)+"px");
                    }
                }
                this._div.css("transform","");
                break;
        }
        
        this._label.html(this._text);

        if(this._bold)
            this._label.css("font-weight","bold");
        else
            this._label.css("font-weight","normal");
    }
}
/**
 * @param {string=} text
 */
Label.prototype.setText = function(text) {
    if (this._text !== text) {
        this._text = text;
        this._drawText = true;
    }
}
Label.prototype.getText = function() {
    return this._text;
}