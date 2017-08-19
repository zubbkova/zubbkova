/** 
 * -----------
 * ImageButton
 * -----------
 * @constructor
 * @extends {Component}
 * @param {string} id - ID of div
 * @param {Component=} delegate
 * @param {string=} tooltip
*/
function ImageButton(image, id, delegate, tooltip) {
    Component.call(this, id, delegate, tooltip);
    this._checkbox = false;
    this._toggle = false;
    this.setRoundedCorners(2);
    this._imageUrl = image;
    this._imageFrame = new Component(this._id + "_imageFrame", this, tooltip);
    this._image = new UIImage(Main.getImagesURL() + this._imageUrl,  this._imageFrame._id + "_image", this, tooltip);
    this.setDown(false);
    this.add(this._imageFrame);
    this._imageFrame.add(this._image);
    this._focus = false;
    this._over = false;
    this._cursor = Cursor.HAND_CURSOR;
    this._drawCursor = true;
    this._drawBorders = true;
}
/**
 * Inheriting
 */
ImageButton.prototype = Object.create(Component.prototype);
ImageButton.prototype.constructor = ImageButton;
/**
 * @param {string} image
 */
ImageButton.prototype.setImage = function(image) {
    if (this._imageUrl === image) return;
    this._imageUrl = image;
    this._image.setImageURL(Main.getImagesURL() + this._imageUrl);
}
/**
 * @param {boolean} c
 */
ImageButton.prototype.setCheckbox = function(c) {
    this._checkbox = c;
    this.setToggle(c);
    this._drawButton = true;
}
/** @override */
ImageButton.prototype.draw = function(force) {
    Component.prototype.draw.call(this, force);
    if (this._drawButton && this._drawBorders) {
        if (this._checkbox) {
            this._div.css("border-top","1px solid gray");
            this._div.css("border-left","1px solid gray");
            this._div.css("border-bottom","1px solid lightgray");
            this._div.css("border-right","1px solid lightgray");
            return;
        }
        if (this._down) {
            this._div.css("border-top","1px solid gray");
            this._div.css("border-left","1px solid gray");
            this._div.css("border-bottom","1px solid lightgray");
            this._div.css("border-right","1px solid lightgray");
        } else {
            this._div.css("border-top","1px solid lightgray");
            this._div.css("border-left","1px solid lightgray");
            this._div.css("border-bottom","1px solid black");
            this._div.css("border-right","1px solid black");
        }
    }
}
/** @override */
ImageButton.prototype.create = function() {
    Component.prototype.create.call(this);
}
/** @override */
ImageButton.prototype.setBounds = function(x, y, w, h) {
    Component.prototype.setBounds.call(this, x, y, w, h);
    this.setDown(this._down);
}
ImageButton.prototype.down = function() {
    this.setDown(true);
}
ImageButton.prototype.up = function() {
    this.setDown(false);
}
/**
 * @param {boolean} d - down
 */
ImageButton.prototype.setDown = function(d) {
    this._down = d;
    if (!this._drawBorders) {
        this._drawButton = true;
        return;
    }
    if (this._down || this._checkbox) {
        this.setBackground("black");
    } else {
        this.setBackground("white");
    }
    if (this._checkbox) {
        this._imageFrame.setBounds(1, 1, this.getWidth() - 3, this.getHeight() - 3);
        this._imageFrame.setBackground("white");
        this._image.setBounds(0, 0, this._imageFrame.getWidth() - 1, this._imageFrame.getHeight() - 1);
        if (this._down) { 
            this._image.show();
        } else {
            this._image.hide();
        }
    } else {
        if (this._down) {
            this._imageFrame.setBounds(1, 1, this.getWidth() - 3, this.getHeight() - 3);
            this._imageFrame.setBackground("lightgray");
            this._image.setBounds(1, 1, this._imageFrame.getWidth() - 1, this._imageFrame.getHeight() - 1);
        } else {
            this._imageFrame.setBackground("gray");
            this._imageFrame.setBounds(1, 1, this.getWidth() - 3, this.getHeight() - 3);
            this._image.setBounds(0, 0, this._imageFrame.getWidth() - 1, this._imageFrame.getHeight() - 1);
        }
    }
    this._drawButton = true;
}
ImageButton.prototype.getDown = function() {
    return this._down;
}
/**
 * @param {boolean} t - toggle
 */
ImageButton.prototype.setToggle = function(t) {
    this._toggle = t;
}
/** @override */
ImageButton.prototype.onMouseDown = function(x, y) {
    if (!this._toggle) { 
        this.setDown(true); 
    }
    this.refresh();
    return true;
}
/** @override */
ImageButton.prototype.onMouseUp = function(x, y) {
    if (this._toggle) {
        this.setDown(!this.getDown());
    } else {
        this.setDown(false);
    }
    this.refresh();
    this.onClick();
    return true;
}
/** @override */
ImageButton.prototype.onMouseLeave = function() {
    if (this._over) {
        this._over = false;
        this._drawButton = true;
        this.refresh();
    }
}
/** @override */
ImageButton.prototype.onMouseEnter = function() {
    if (!this._over) {
        this._over = true;
        this._drawButton = true;
        this.refresh();
    }
}
/** @override */
ImageButton.prototype.onMouseMove = function(x, y) {
    return true;
}
ImageButton.prototype.onClick = function() {
    this.notify(new ChartEvent(ChartEvent.BUTTON_CLICK));
}