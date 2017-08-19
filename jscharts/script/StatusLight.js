/**
 * -----------
 * StatusLight
 * -----------
 * @constructor
 * @extends {Component}
 * @param {string} id
 * @param {Component} delegate
 * @param {number} w
 * @param {number} h
 */
function StatusLight(id, delegate, w, h) {
    Component.call(this, id, delegate);
    if (w < StatusLight.WIDTH) 
        w = StatusLight.WIDTH;
    this.setBounds(0, 0, w, h);
    this._side = 0;
    this._status = StatusLight.SL_NODATA;
    this._lastChanged = 0;
    this._light = [Style.IMAGE_LIGHT_RED_OFF, Style.IMAGE_LIGHT_RED_OFF];
    this._control = new Component(this._id + "_control");
    this._control.setBounds(0, 5, StatusLight.WIDTH, StatusLight.HEIGHT);
    this.add(this._control);
    this._light0 = new UIImage(Main.getImagesURL() + Style.getImage(this._light[0]), this._control._id + "_light0");
    this._light0.setBounds(0, 0, StatusLight.HEIGHT, StatusLight.HEIGHT);
    this._control.add(this._light0);
    this._light1 = new UIImage(Main.getImagesURL() + Style.getImage(this._light[1]), this._control._id + "_light1");
    this._light1.rightOf(this._light0, 2, 0, StatusLight.HEIGHT, StatusLight.HEIGHT);
    this._control.add(this._light1);
}
/**
 * Inheriting
 */
StatusLight.prototype = Object.create(Component.prototype);
StatusLight.prototype.constructor = StatusLight;
/** @static */
StatusLight.SL_NODATA = 0;
/** @static */
StatusLight.SL_CONN = 1;
/** @static */
StatusLight.SL_DATA = 2;
/** @static */
StatusLight.WIDTH = 18;
/** @static */
StatusLight.HEIGHT = 8;
/** @override */
StatusLight.prototype.process = function(t) {
    Component.prototype.process.call(this, t);
    let cur = new Date().getTime();
    let delta = cur - this._lastChanged;
    if (delta >= 4000 && this._status === StatusLight.SL_CONN) {
        this.changeStatus(StatusLight.SL_NODATA);
    } else if (delta >= 500 && this._status === StatusLight.SL_DATA) {
        this.changeStatus(StatusLight.SL_CONN);
    }
    return false;
}
/**
 * @param {number} s
 */
StatusLight.prototype.changeStatus = function(s) {
    let cur = new Date().getTime();
    let delta = cur - this._lastChanged;
    if (s === StatusLight.SL_DATA && delta < 500)
        return;
    this._status = s;
    this._lastChanged = cur;
    this._setLights();
}
/** @private */
StatusLight.prototype._setLights = function() {
    let nl = new Array(2);
    nl[0] = this._light[0];
    nl[1] = this._light[1];
    switch (this._status) {
        case StatusLight.SL_NODATA:
            nl[0] = Style.IMAGE_LIGHT_RED_OFF;
            nl[1] = Style.IMAGE_LIGHT_RED_OFF;
            break;
        case StatusLight.SL_CONN:
            nl[this._side] = Style.IMAGE_LIGHT_GREEN_ON;
            nl[1 - this._side] = Style.IMAGE_LIGHT_RED_ON;
            this._side = 1 - this._side;
            break;
        case StatusLight.SL_DATA:
            nl[this._side] = Style.IMAGE_LIGHT_GREEN_OFF;
            nl[1 - this._side] = Style.IMAGE_LIGHT_GREEN_ON;
            this._side = 1 - this._side;
            break;
    }
    if (nl[0] !== this._light[0] || nl[1] !== this._light[1]) {
        this._light[0] = nl[0];
        this._light[1] = nl[1];
        this._light0.setImageURL(Main.getImagesURL() + Style.getImage(this._light[0]));
        this._light1.setImageURL(Main.getImagesURL() + Style.getImage(this._light[1]));
        this.refresh();
    }
}