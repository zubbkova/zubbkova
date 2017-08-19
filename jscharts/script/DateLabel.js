/**
 * ---------
 * DateLabel
 * ---------
 * @constructor
 * @extends {Label}
 * @param {string} id - ID of div
 * @param {Component=} delegate
 */
function DateLabel(id, delegate) {
    Label.call(this, id, delegate);
    this._format = undefined;
    this._time = 0;
    this._newTime = 0;
    this._closed = false;
}
/**
 * Inheriting
 */
DateLabel.prototype = Object.create(Label.prototype);
DateLabel.prototype.constructor = DateLabel;
/** @override */
DateLabel.prototype.loadContents = function() {
    this._time = this._newTime;
    if (this._closed) {
        this.setText(_("Closed"));
    } else if (this._time === 0) {
        this.setText("");
    } else {
        let formatter, s;
        if (this._format === "*s") {
            let t2 = RootComponent._timestamp - this._newTime;
            if (Language) {
                if ("jp" === Language.getLanguageID()) {
                    formatter = (t2 > 12 * 3600000) ? DateLabel.mmddFormatter : DateLabel.kkmmFormatter;
                } else {
                    formatter = (t2 > 12 * 3600000) ? DateLabel.ddmmFormatter : DateLabel.kkmmFormatter;
                }
            } else {
                formatter = (t2 > 12 * 3600000) ? DateLabel.ddmmFormatter : DateLabel.kkmmFormatter;
            }
        } else {
            formatter = new SimpleDateFormat(this._format);
        }
        s = formatter.format(this.getDate());
        this.setText(s);
        this._newTime = 0;
    }
}
/** @override */
DateLabel.prototype.feedDelegate_feed = function(fc) {
    if (fc === undefined) 
        return;
    if (fc._contents === undefined) {
        this._closed = true;
    } else if (fc._contents === " ") {
        this._newTime = 0;
        this._closed = false;
    } else {
        this._newTime = Utils.parseLong(fc._contents) * 1000;
    }
    if (this._autoHighlight) {
        fc._flags |= FeedContent.FLAG_HIGHLIGHT;
    }
    this.doUpdate(fc._flags);
}
/**
 * @param {number} t
 */
DateLabel.prototype.setDate = function(t) {
    this._newTime = t;
    this.loadContents();
}
DateLabel.prototype.getTime = function() {
    return this._time;
}
DateLabel.prototype.getDate = function() {
    return this._time === 0 ? undefined : new Date(this._time);
}
/**
 * @param {string} f
 */
DateLabel.prototype.setFormat = function(f) {
    this._format = f;
}
/** @static */
DateLabel.ddmmFormatter = new SimpleDateFormat("dd/MM");
/** @static */
DateLabel.mmddFormatter = new SimpleDateFormat("MM/dd");
/** @static */
DateLabel.kkmmFormatter = new SimpleDateFormat("HH:mm");