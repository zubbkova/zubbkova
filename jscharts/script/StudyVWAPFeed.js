/* global FeedRequest, Feed, PriceDataConstants */
/**
 * -------------
 * StudyVWAPFeed
 * -------------
 * A dedicated class to make and run a feed for the VWAP study
 * 
 * had to do it in this separate class because only JmComponent implements the tasker, which allows
 * us to process the incoming feed data properly.
 *
 * @constructor
 * @param {StudyVWAP} [p]
 */
function StudyVWAPFeed(p) {
    this._parent = p;
    this._initialiseFeed();
}
StudyVWAPFeed.prototype._initialiseFeed = function() {
    var fr = new FeedRequest("chart");
    fr.cmdSymbol("==="); // 0, time
    fr.cmdParam(FeedRequest.P_TIME);
    fr.cmdSymbol(this._parent._parent._chart._parent._currentSymbol.mainSymbol());
    fr.cmdParam(FeedRequest.P_LSE_REFERENCE_PRICE);
    this._feed = new Feed("Chart", fr.toString(), fr.size(), this);
    this._feed.start();
}
/**
 * @param {FeedContent} contents
 */
StudyVWAPFeed.prototype.feedDelegate_feed = function(contents) {
    var setTime, val;
    if (contents._id === 0) { // time
        var ts = parseInt(contents._contents, 10);
        // zero out the next candle with the close from the last one
        if (this._undelayedTime) {
            val = this._parent._close.get(this._undelayedTime);
            this._undelayedTime = this._parent._parent._chart._parent._symbolSets.get(0).getMasterTimeList().convertTimestamp(ts, PriceDataConstants.FREQUENCY_1);
            if(!isNaN(val)) {
                setTime = new Date(this._undelayedTime.getTime()); // we're ignoring delay for now, that may not be wise.  but it's one hell of a slog to get it.
                this._parent._open.set(setTime, val);
                this._parent._high.set(setTime, val);
                this._parent._low.set(setTime, val);
                this._parent._close.set(setTime, val);
                this._parent._parent._chart.repaint();
            }
        } else {
            this._undelayedTime = this._parent._parent._chart._parent._symbolSets.get(0).getMasterTimeList().convertTimestamp(ts, PriceDataConstants.FREQUENCY_1);
        }
    } else if (contents._id === 1) { // data
        setTime = new Date(this._undelayedTime.getTime()); // we're ignoring delay for now, that may not be wise.  but it's one hell of a slog to get it.
        val = parseFloat(contents._contents);
        // add it in in the series to generate OHLC for VWAP
        // use getNoInterpolate here to ensure we're checking that exact minute and not just any value previous to it.
        if (isNaN(this._parent._open.getNoInterpolate(setTime))) {
            this._parent._open.set(setTime, val);
        }
        if (isNaN(this._parent._high.getNoInterpolate(setTime))) {
            this._parent._high.set(setTime, val);
        } else {
            this._parent._high.set(setTime, Math.max(this._parent._high.getNoInterpolate(setTime), val));
        }
        if (isNaN(this._parent._low.getNoInterpolate(setTime))) {
            this._parent._low.set(setTime, val);
        } else {
            this._parent._low.set(setTime, Math.min(this._parent._low.getNoInterpolate(setTime), val));
        }
        this._parent._close.set(setTime, val);
        this._parent.update();
        this._parent._parent._chart.repaint();
    }
}
StudyVWAPFeed.prototype.feedDelegate_connected = function() {}
/**
 * @param {number} t
 */
StudyVWAPFeed.prototype.process = function(t) {
    return (this._feed && this._feed.process(t));
}
StudyVWAPFeed.prototype.stop = function() {
    if (this._feed) 
        this._feed.stop();
}