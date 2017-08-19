/**
 * -----
 * ChartEvent
 * -----
 * @constructor
 * @param {number=} e
 */
function ChartEvent(e) {
    this._event = e ? e : 0;
    this._destination = undefined;
    this._source = undefined;
    this._param = 0;
    this._tag = undefined;
    this._next = undefined;
    this._point = undefined;
    this._keyChar = undefined;
    this._keyCode = undefined;
    this._data = undefined;
}
/** @static */
ChartEvent.MOUSE_DOWN = 0;
/** @static */
ChartEvent.MOUSE_UP = 1;
/** @static */
ChartEvent.MOUSE_MOVE = 2;
/** @static */
ChartEvent.MOUSE_ENTER = 4;
/** @static */
ChartEvent.MOUSE_EXIT = 5;
/** @static */
ChartEvent.MOUSE_DRAG = 6;
/** @static */
ChartEvent.MOUSE_OVER = 7;
/** @static */
ChartEvent.MOUSE_WHEEL  = 8;
/** @static */
ChartEvent.KEY_UP = 10;
/** @static */
ChartEvent.KEY_DOWN = 11;
/** @static */
ChartEvent.KEY_FOCUS_LOST = 12;
/** @static */
ChartEvent.CAPTURE_CHANGE = 20;
/** @static */
ChartEvent.IMAGE_UPDATE = 21;
/** @static */
ChartEvent.BUTTON_UP = 30;
/** @static */
ChartEvent.BUTTON_DOWN = 31;
/** @static */
ChartEvent.BUTTON_CLICK = 32;
/** @static */
ChartEvent.LIST_CLICK = 40;
/** @static */
ChartEvent.LIST_NEW_ITEM = 41;
/** @static */
ChartEvent.COMBO_SELECT = 50;
/** @static */
ChartEvent.COMBO_DRAG_ON = 51;
/** @static */
ChartEvent.TAB_SELECT = 60;
/** @static */
ChartEvent.TAB_DESELECT = 61;
/** @static */
ChartEvent.EDIT_CHANGED = 70;
/** @static */
ChartEvent.EDIT_ENTER = 71;
/** @static */
ChartEvent.CHECKBOX_CHANGED = 80;
/** @static */
ChartEvent.RADIO_CHANGED = 81;
/** @static */
ChartEvent.POPUP_CANCEL = 90;
/** @static */
ChartEvent.MODAL_OK = 100;
/** @static */
ChartEvent.SYMBOL_SELECT = 110;
/** @static */
ChartEvent.SCROLL_CHANGED = 120;
/** @static */
ChartEvent.POINT_SELECTED = 130;
/** @static */
ChartEvent.SYMBOL_REQUEST = 140;
/** @static */
ChartEvent.ORDER_CLICK = 150;
/**
 * --------
 * KeyEvent
 * --------
 */
var KeyEvent = {};
/** @static */
KeyEvent.BACKSPACE = 8;
/** @static */
KeyEvent.DELETE = 46;
/** @static */
KeyEvent.LEFT = 37;
/** @static */
KeyEvent.RIGHT = 39;
/** @static */
KeyEvent.ESCAPE = 27;
/** @static */
KeyEvent.TAB = 9;
/** @static */
KeyEvent.ENTER = 13;
/** @static */
KeyEvent.SPACE = 32;
/** @static */
KeyEvent.UP = 38;
/** @static */
KeyEvent.DOWN = 40;