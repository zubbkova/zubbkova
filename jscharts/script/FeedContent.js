/* global Utils */
/**
 * -----------
 * FeedContent
 * -----------
 * @constructor
 * @param {number} id
 * @param {string} contents
 * @param {number} flags
 */
function FeedContent(id, contents, flags) {
    this._id = id;
    this._flags = flags;
    this._contents = contents;
}
FeedContent.prototype.toString = function() {
    return "[" + this._id + "," + this._flags + "," + this._contents + "]";
}
/**
 * @param {string} s
 */
FeedContent.getInteger = function(s) {
    var stripped = [];
    var c;
    var l = s.length;
    var pos = 0;
    for (var i = 0; i < l; i++) {
        c = s[i];
        if (c !== ',') {
            stripped[pos++] = c;
        }
    }
    return Utils.parseInt(stripped, 0, pos);
}
/** @static */
FeedContent.FLAG_UPDATE_UP = 1;
/** @static */
FeedContent.FLAG_UPDATE_DOWN = 2;
/** @static */
FeedContent.FLAG_UPDATE_NO_CHANGE = 4;
/** @static */
FeedContent.FLAG_DELETED = 8;
/** @static */
FeedContent.FLAG_HIGHLIGHT = 16;
/** @static */
FeedContent.FLAG_PERIOD_UP = 32;
/** @static */
FeedContent.FLAG_PERIOD_DOWN = 64;
/** @static */
FeedContent.FLAG_PERIOD_NO_CHANGE = 128;
/** @static */
FeedContent.FLAG_LIST_INSERT = (1 << 29);
/** @static */
FeedContent.FLAG_LIST_DELETE = (1 << 30);
/** @static */
FeedContent.FLAG_INITIAL_VALUE = (1 << 31);
/** @static */
FeedContent.ID_ERROR = -1;
/** @static */
FeedContent.ID_LOAD_PERCENT = -2;
/** @static */
FeedContent.ID_LOAD_COMPLETE = -3;
/** @static */
FeedContent.ID_HAVE_RECONNECTED = -4;