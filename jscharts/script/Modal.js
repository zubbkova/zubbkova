/* global Component, Color, ChartEvent, Main */
/**
 * -----
 * Modal
 * -----
 * @constructor
 * @extends {Component}
 * @param {string} id
 * @param {Component=} delegate
 */
function Modal(id, delegate) {
    Component.call(this, id, delegate);
    this._shown = false;
    this.setBackground(Color.white);
    this.setBorder(Component.BORDER_FLOAT);
}
/**
 * Inheriting
 */
Modal.prototype = Object.create(Component.prototype);
Modal.prototype.constructor = Modal;
/** @override */
Modal.prototype.onKeyUp = function(keyCode) {
    if (keyCode === 27) {
        this.setModal(false);
    }
}
/** @override */
Modal.prototype.onCustomEvent = function(e) {
    if (e._event === ChartEvent.BUTTON_CLICK) {
        if (e._source === this._okButton) {
            this.notify(new ChartEvent(ChartEvent.MODAL_OK));
            this.setModal(false);
        } else if (e._source === this._cancelButton) {
            this.setModal(false);
        }
    }
}
/**
 * @param {boolean} open
 */
Modal.prototype.setModal = function(open) {
    if (Main.getSession().getRootComponent()._modal && Main.getSession().getRootComponent()._modal.isPrototypeOf(Modal) && open)
        return;
    if (open !== this._shown) {
        this.setVisible(open);
        if (this._shown) {
            Main.getSession().getRootComponent().showModal(this);
        } else {
            Main.getSession().getRootComponent().removeWindow(this);
        }
    }
}