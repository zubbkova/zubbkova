/**
 * ----
 * Feed
 * ----
 * @constructor
 * @param {string} name
 * @param {string} dataBlock
 * @param {number} blockSize
 * @param {ChartContainer|HotTicker|SimpleOrderBook|SimpleTradeList|StudyVWAPFeed} delegate
 */
function Feed(name, dataBlock, blockSize, delegate) {
    this.register(name, dataBlock, blockSize, delegate);
    this._feedItems = [];
}
/**
 * @param {string} name
 * @param {string} dataBlock
 * @param {number} blockSize
 * @param {ChartContainer|HotTicker|SimpleOrderBook|SimpleTradeList|StudyVWAPFeed} delegate
 */
Feed.prototype.register = function(name, dataBlock, blockSize, delegate) {
    this._delegate = delegate;
    this._loading = true;
    this._dataBlock = dataBlock;
    this._name = name;
}
/**
 * @param {number=} t
 */
Feed.prototype.process = function(t) {
//    console.log("feed process", this._name, this._feedItems.length);
    if (this._feedItems.length === 0) 
        return false;
    let processItems = this._feedItems;
    this._feedItems = [];
    
    for (let item of processItems) {
        if (!item)
            continue;
        if (item._id < 0) {
            if (this._delegate) {
                this._delegate.feedDelegate_feed(item);
            }
            if (item._id === FeedContent.ID_LOAD_COMPLETE) {
                this._loading = false;
                this._delegate.feedDelegate_loadingComplete();
            }
        } else {
            if (this._loading) {
                item._flags = item._flags | FeedContent.FLAG_INITIAL_VALUE;
            }
            this._delegate.feedDelegate_feed(item);
        }
    }
    return true;
}
/**
 * @param {Array} items
 */
Feed.prototype.add = function(items) {
    if (!this._feedItems)
        this._feedItems = [];
    Array.prototype.push.apply(this._feedItems, items);
}
/**
 * @param {number} err
 */
Feed.prototype.error = function(err) {
    if (this._delegate) {
        this._delegate.feedDelegate_feed(new FeedContent(FeedContent.ID_ERROR, "", err));
    }
}
Feed.prototype.start = function() {
    this._error = -1;
    IPC.register(this);
    IPC.userName = Main.getUserName();
    IPC.sid = Main.getSID();
}
/**
 * @param {number} error
 */
Feed.prototype.onError = function(error) {
    let message = "Feed for " + this._name + " stopped. Error: ";
    switch (error) {
        case 0:
            message += _("STREAM_ERR_TIMEOUT");
            break;
        case 1:
            message += _("STREAM_ERR_WINDOW_LIMIT");
            break;
        case 2:
            message += _("STREAM_ERR_DUPLICATE_PAGE");
            break;
        case 3:
            message += _("STREAM_ERR_CLIENT_VERSION");
            break;
        case 4:
            message += _("STREAM_ERR_INVALID_SID");
            break;
        case 5:
            message += _("STREAM_ERR_NOT_AVAILABLE");
            break;
        case 6:
            message += _("STREAM_ERR_NOT_AUTHENTICATED");
            break;
        default:
            message += error;
            break;
    }
    Main.getSession()._root.showAlert(message);
    this._erorr = error;
    this.stop();
}
/**
 * @param {string=} dataBlock
 */
Feed.prototype.stop = function(dataBlock) {
    this._feedItems = [];
    if (this._name === "Chart")
        Main.getSession()._root._statusLights.changeStatus(StatusLight.SL_NODATA);
    let data = dataBlock ? dataBlock : this._dataBlock;
    IPC.unregister(this._name, data);
}
Feed.prototype.handleConnect = function() {
    this._delegate.feedDelegate_connected();
}
Feed.prototype.handleDisconnect = function() {
    this._delegate.feedDelegate_disconnected();
}