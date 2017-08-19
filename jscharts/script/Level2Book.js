/**
 * ----------
 * Level2Book
 * ----------
 * @constructor
 * @extends {Component}
 * @param {string} id
 * @param {Component=} delegate
 * @param {OrderBook=} ob
 * @param {boolean=} buy
 */
function Level2Book(id, delegate, ob, buy) {
    Component.call(this, id, delegate);
    this._reloadRow = [];
    this._reloadAll = false;
    this._scrollPosition = 0;
    this._visibleOrders = 0;
    this._visibleVolume = 0;
    this._minPrice = 0.0;
    this._maxPrice = 0.0;
    this._showPrices = false;
    this._curTime = 0;
    this._nextUpdate = 0;
    this._orderBook = ob;
    this._buy = buy;
    this._changes = true;
    this._visiblePC = Number.MAX_SAFE_INTEGER;
    Level2Book.numberFormat.setMinimumFractionDigits(4);
    this._numRows = 0;
    this._timeColumn = this._buy ? 0 : 3;
    this._codeColumn = this._buy ? 1 : 2;
    this._sizeColumn = this._buy ? 2 : 1;
    this._priceColumn = this._buy ? 3 : 0;
    this._orderBook.addListener(this, this._buy ? OrderBook.BUY : OrderBook.SELL);
    this._orders = [];
    this._prices = [];
    this._inset = new Inset();
    this._inset.set(3, 3, 3, 3);
    
    this._orderList = new Level2Book_List(this._id + "_list", this);
    this._setupList();
}
/**
 * Inheriting
 */
Level2Book.prototype = Object.create(Component.prototype);
Level2Book.prototype.constructor = Level2Book;
/** @override */
Level2Book.prototype.setBounds = function(x, y, w, h) {
    if (h !== this._height) {
        this._setNumRows(h / 19);
    }
    Component.prototype.setBounds.call(this, x, y, w, h);
    this._orderList.setBounds(this._inset._left, this._inset._top, w - (this._inset._left + this._inset._right), h - (this._inset._top + this._inset._bottom));
}
/** @override */
Level2Book.prototype.process = function(t) {
    this._curTime = t;
    if (t > this._nextUpdate) {
        this._nextUpdate = t + 1000/30;
        this._orderBook.process(t);
        this._updateAnimations(this._orders);
        this._updateAnimations(this._prices);
        if (this._changes) {
            this._loadOrders();
            return true;
        }
    }
    return false;
}
/**
 * @param {number} bookID
 * @param {number} side
 * @param {string} id
 * @param {number} price
 * @param {number} size
 * @param {string} code
 * @param {number} time
 * @param {number} ch
 */
Level2Book.prototype.orderBookAdd = function(bookID, side, id, price, size, code, time, ch) {
    var o = new Level2Book_Order();
    o._id = id;
    o._time = time;
    o._code = code;
    o._size = size;
    o._price = price;
    o._numOrders = 1;
    o._changes = ch;
    if (this._orderBook.isLoaded()) {
        o.setState(Level2Book_Order.STATE_INSERT, this._curTime + 2000);
    }
    var pos = (this._buy) ? this._findBuyPos(o) : this._findSellPos(o);
    this._orders.splice(pos, 0, o);
    if (pos < this._scrollPosition + this._numRows) {
        this._reloadAll = true;
    }
    this._updatePrice(o._price, o._size, 1, o._time);
    this._changes = true;
}
Level2Book.prototype.orderBookConnect = function() {
    this._orderClear();
}
/**
 * @param {string} id
 */
Level2Book.prototype.orderBookDelete = function(id) {
    let pos = this._findOrder(id);
    if (pos === -1) 
        return;
    var co = this._orders[pos];
    co.setState(Level2Book_Order.STATE_DELETE, this._curTime + 2000);
    this._doReloadRow(pos);
    this._updatePrice(co._price, -co._size, -1, co._time);
    this._changes = true;
}
/**
 * @param {number} bookID
 * @param {number} side
 * @param {string} id
 * @param {number} price
 * @param {number} size
 * @param {string} code
 * @param {number} time
 * @param {number} ch
 */
Level2Book.prototype.orderBookUpdate = function(bookID, side, id, price, size, code, time, ch) {
    let pos = this._findOrder(id);
    if (pos === -1) 
        return;
    let co = this._orders[pos];
    let originalSize = co.length;
    co._changes = ch;
    if ((co._changes & OrderBook.TIME) > 0) {
        co._time = time;
    }
    if ((co._changes & OrderBook.SIZE) > 0) {
        co._oldSize = co._size;
        co._size = size;
    }
    if ((co._changes & OrderBook.PRICE) > 0) {
        var p = co._price;
        co._price = price;
        co._time = new Date().getTime();
        this._removeOrder(co._id);
        if (this._buy) {
            this._orders.splice(this._findBuyPos(co), 0, co);
        } else {
            this._orders.splice(this._findSellPos(co), 0, co);
        }
        this._updatePrice(p, -originalSize, -1, co._time);
        this._updatePrice(co._price, co._size, 1, co._time);
    } else {
        this._updatePrice(co._price, co._size - originalSize, 0, co._time);
        co.highlightSize(Style.HIGHLIGHT_NO_CHANGE, Level2Book_Order.FIELD_SIZE, this._curTime);
    }
    this._doReloadRow(pos);
    this._changes = true;
}
/** @override */
Level2Book.prototype.onCustomEvent = function(e) {
    switch (e._event) {
        case ChartEvent.LIST_CLICK:
            this._listClick(e._param);
            return true;
    }
    return false;
}
Level2Book.prototype.getPrices = function() {
    return this._prices;
}
Level2Book.prototype.getOrders = function() {
    return this._orders;
}
/** @override */
Level2Book.prototype.setVisible = function(visible) {
    Component.prototype.setVisible.call(this, visible);
    if (visible) {
        this._changes = true;
        this._reloadAll = true;
    }
    return visible;
}
/**
 * @private
 * @param {number} rows
 */
Level2Book.prototype._setNumRows = function(rows) {
    if (rows === this._numRows) 
        return;
    this._numRows = rows;
    this._reloadRow = new Array(this._numRows);
    this._reloadAll = true;
    if (this._orderList) {
        this._orderList.clear();
        this._setupList();
        this._loadOrders();
    }
}
/** @private */
Level2Book.prototype._loadOrders = function() {
    if (!this._shown) 
        return;
    let v = this._showPrices ? this._prices : this._orders;
    let co = undefined; // Order
    let size = undefined; // IntegerLabel
    let price = undefined; // Label
    let time = undefined; // DateLabel
    let code = undefined; // Label
    var j = 0;
    if (this._changes) {
        this._changes = false;
        this._updateOrderColours();
        this._updatePriceColours();
        this._updateBestPrice();
    }
    for (let i = 0; i < this._numRows; i++) {
        if (!this._reloadAll && !this._reloadRow[i]) 
            continue;
        this._reloadRow[i] = false;
        var c = this._orderList.getRow(i);
        time = c[this._timeColumn];
        size = c[this._sizeColumn];
        price = c[this._priceColumn];
        code =  c[this._codeColumn];
        if (this._scrollPosition + i >= v.length) {
            for (j = 0; j < 4; j++) {
                c[j].setStyle(Component.STYLE_SLOT_DEFAULT, 0);
            }
            price.setStyle(Component.STYLE_SLOT_HIGHLIGHT, -1);
            time.setDate(0);
            size.unset();
            price.unset();
            code.unset();
        } else {
            co = v[i + this._scrollPosition];
            if (!co._visible) {
                for (j = 0; j < 4; j++) {
                    c[j].setStyle(Component.STYLE_SLOT_DEFAULT, 0);
                }   
                price.setStyle(Component.STYLE_SLOT_HIGHLIGHT, -1);
                time.setDate(0);
                size.unset();
                price.unset();
                code.unset();
                continue;
            }
            switch(co._state) {
                case Level2Book_Order.STATE_HIGHLIGHT_SIZE_1:
                    price.setStyle(Component.STYLE_SLOT_DEFAULT, co._style);
                    time.setStyle(Component.STYLE_SLOT_DEFAULT, co._style);
                    code.setStyle(Component.STYLE_SLOT_DEFAULT, co._style);
                    size.setStyle(Component.STYLE_SLOT_DEFAULT, co._style);
                    if ((co._highlightField & Level2Book_Order.FIELD_CODE) !== 0) {
                        code.setStyle(Component.STYLE_SLOT_DEFAULT, co._highlightStyle);
                        if (this._showPrices) {
                            code.setText(co._oldNumOrders.toString());
                        } else {
                            code.setText(co._oldCode);
                        }
                    } else {
                        code.setStyle(Component.STYLE_SLOT_DEFAULT, co._style);
                        if (this._showPrices) {
                            code.setText(co._numOrders.toString());
                        } else {
                            code.setText(co._code);
                        }
                    }
                    if ((co._highlightField & Level2Book_Order.FIELD_SIZE) !== 0) {
                        size.setStyle(Component.STYLE_SLOT_DEFAULT, co._highlightStyle);
                        size.setInteger(co._oldSize);  
                    } else {
                        size.setStyle(Component.STYLE_SLOT_DEFAULT, co._style);
                        size.setInteger(co._size);  
                    }
                    break;
                case Level2Book_Order.STATE_HIGHLIGHT_SIZE_2:
                    price.setStyle(Component.STYLE_SLOT_DEFAULT, co._style);
                    time.setStyle(Component.STYLE_SLOT_DEFAULT, co._style);
                    code.setStyle(Component.STYLE_SLOT_DEFAULT, co._style);
                    size.setStyle(Component.STYLE_SLOT_DEFAULT, co._style);
                    if ((co._highlightField & Level2Book_Order.FIELD_CODE) !== 0) {
                        code.setStyle(Component.STYLE_SLOT_DEFAULT, co._highlightStyle);
                    } else {
                        code.setStyle(Component.STYLE_SLOT_DEFAULT, co._style);
                    }
                    if (this._showPrices) {
                        code.setText(co._numOrders.toString());
                    } else {
                        code.setText(co._code);
                    }
                    if ((co._highlightField & Level2Book_Order.FIELD_SIZE) !== 0) {
                        size.setStyle(Component.STYLE_SLOT_DEFAULT, co._highlightStyle);
                    } else {
                        size.setStyle(Component.STYLE_SLOT_DEFAULT, co._style);
                    }
                    size.setInteger(co._size);
                    break;
                default:
                    price.setStyle(Component.STYLE_SLOT_DEFAULT, co._style);
                    time.setStyle(Component.STYLE_SLOT_DEFAULT, co._style);
                    code.setStyle(Component.STYLE_SLOT_DEFAULT, co._style);
                    size.setStyle(Component.STYLE_SLOT_DEFAULT, co._style);
                    if (this._showPrices) {
                        code.setText(co._numOrders.toString());
                    } else {
                        code.setText(co._code);
                    }
                    size.setInteger(co._size);   
                    break;
            }
            if (co._state !== Level2Book_Order.STATE_DELETE && co._state !== Level2Book_Order.STATE_INSERT) {
                if ((co._changes & OrderBook.PRICE_UP) !== 0) {
                    price.setStyle(Component.STYLE_SLOT_HIGHLIGHT, Style.PERIOD_UP);
                } else if ((co._changes & OrderBook.PRICE_DOWN) !== 0) {
                    price.setStyle(Component.STYLE_SLOT_HIGHLIGHT, Style.PERIOD_DOWN);
                } else {
                    price.setStyle(Component.STYLE_SLOT_HIGHLIGHT, -1);
                }
            } else {
                price.setStyle(Component.STYLE_SLOT_HIGHLIGHT, -1);
            }
            time.setDate(co._time);
            if ((co._price < Level2Book.ZERO_PRICE) && (co._size > 0)) {
                price.setText(Strings.get(102));
            } else {
                price.setText(Level2Book.numberFormat.format(co._price));
            }
        }
    }
    this._reloadAll = false;
}
/** @private */
Level2Book.prototype._updatePriceColours = function() {
    let s = 0;
    let pc = 0.0;
    let topPrice = 0.0;
    this._minPrice = 1000000000;
    this._maxPrice = 0;
    if (this._prices.length === 0) 
        return;
    for (let i = 0; i < this._prices.length; i++) {
        let co = this._prices[i];
        if (co._state === Level2Book_Order.STATE_DELETE) {
            co._style = Style.DELETED;
            co._visible = true;
            this._visibleOrders++;
            continue;
        }
        if (co._price < Level2Book.ZERO_PRICE) {
            s = Style.PRICE_MARKET;
            co._visible = true;
        } else {
            if (i >= 5) {
                s = ((i % 2) !== 0) ? Style.PRICE_ODD : Style.PRICE_EVEN;
            } else {
                s = Style.PRICE_1 + i;
            }
            if (topPrice < Level2Book.ZERO_PRICE) {
                topPrice = co._price;
            }
            if (topPrice < co._price) {
                pc = ((co._price - topPrice) * 100) / topPrice;
            } else {
                pc = ((topPrice - co._price) * 100) / topPrice;
            }
            if (pc <= this._visiblePC) {
                if (co._price < this._minPrice) {
                    this._minPrice = co._price;
                }
                if (co._price > this._maxPrice) {
                    this._maxPrice = co._price;
                }
                co._visible = true;
            } else {
                co._visible = false;
            }
        }
        if (co._state === Level2Book_Order.STATE_INSERT) {
            co._style = Style.HIGHLIGHT_INSERT;
        } else {
            co._style = s;
        }
    }
}
/** @private */
Level2Book.prototype._updateOrderColours = function() {
    let lastPrice = -1.0;
    let topPrice = 0.0;
    let pc = 0.0;
    let odd = false;
    let s = 0;
    let np = 0;
    this._visibleOrders = 0;
    this._visibleVolume = 0;
    for (let co of this._orders) {
        if (co._state === Level2Book_Order.STATE_DELETE) {
            co._style = Style.DELETED;
            co._visible = true;
            this._visibleOrders++;
            continue;
        }
        if (co._price !== lastPrice) {
            lastPrice = co._price;
            if (topPrice < Level2Book.ZERO_PRICE) {
                topPrice = co._price;
            }
            if (np >= 5) {
                odd = !odd;
                s = (odd) ? Style.PRICE_ODD : Style.PRICE_EVEN;
            } else {
                s = Style.PRICE_1 + np;
            }
            np++;
        }
        if (co._price < Level2Book.ZERO_PRICE) {
            pc = 0;
            s = Style.PRICE_MARKET;
            co._visible = true;
            this._visibleOrders++;
        } else {
            if (topPrice < co._price) {
                pc = ((co._price - topPrice) * 100) / topPrice;
            } else {
                pc = ((topPrice - co._price) * 100) / topPrice;
            }
        }
        if (pc <= this._visiblePC) {
            co._visible = true;
            this._visibleOrders++;
            this._visibleVolume += co._size;
        } else {
            co._visible = false;
        }
        if (co._state === Level2Book_Order.STATE_INSERT) {
            co._style = Style.HIGHLIGHT_INSERT;
        } else {
            co._style = s;
        }
    }
}
/**
 * @private
 * @param {Level2Book_Order} o
 */
Level2Book.prototype._findMarketPos = function(o) {   
    let i = 0;
    for (i = 0; i < this._orders.length; i++) {
        var co = this._orders[i];                
        if ((co._price > Level2Book.ZERO_PRICE) || (o._time < co._time)) {
            break;
        }
    }
    return i;
}
/**
 * @private
 * @param {Level2Book_Order} o
 */
Level2Book.prototype._findBuyPos = function(o) {
    if (o._price < Level2Book.ZERO_PRICE) {
        return this._findMarketPos(o);
    }
    let i = 0;
    for (i = 0; i < this._orders.length; i++) {
        var co = this._orders[i];
        if ((co._price > Level2Book.ZERO_PRICE) || (co._size === 0.0)) {
            if (o._price > co._price) {
                break;
            }
            if ((o._price === co._price) && (o._time < co._time)) {
                break;
            }
        }
    }
    return i;
}
/**
 * @private
 * @param {Level2Book_Order} o
 */
Level2Book.prototype._findSellPos = function(o) {
    if (o._price < Level2Book.ZERO_PRICE) {
        return this._findMarketPos(o);
    }
    let i = 0;
    for (i = 0; i < this._orders.length; i++) {
        var co = this._orders[i];
        if ((co._price > Level2Book.ZERO_PRICE) || (co._size === 0.0)) {
            if (o._price < co._price) {
                break;
            }
            if ((o._price === co._price) && (o._time < co._time)) {
                break;
            }
        }
    }
    return i;
}
Level2Book.prototype._updateBestPrice = function() {
    for (let co of this._prices) {
        if (co === undefined) 
            break;
        if (co._price < Level2Book.ZERO_PRICE) 
            continue;
        let hasNonPlus = false;
        for (let co2 of this._orders) {
            if (co2 === undefined) 
                break;
            if (co2._price < Level2Book.ZERO_PRICE) 
                continue;
            if (co2._price !== co._price) 
                continue;
            if (!(co2._code && co2._code.length > 0 && co2._code.substring(0, 1) === '+')) {
                hasNonPlus = true;
            }
        }
        if (!hasNonPlus) 
            continue;
        break;
    }
}
/**
 * @private
 * @param {number} price
 * @param {number} size
 * @param {number} num
 * @param {number} time
 */
Level2Book.prototype._updatePrice = function(price, size, num, time) {
    let pos = 0;
    for (pos = 0; pos < this._prices.length; pos++) {
        let co = this._prices[pos];
        if (price === co._price) {
            if (this._orderBook.isLoaded()) {
                co._oldSize = co._size;
                co._oldNumOrders = co._numOrders;
                if (size > 0) {
                    if (num > 0) {
                        co.highlightSize(Style.HIGHLIGHT_UP, Level2Book_Order.FIELD_SIZE | Level2Book_Order.FIELD_CODE, this._curTime);
                    } else {
                        co.highlightSize(Style.HIGHLIGHT_UP, Level2Book_Order.FIELD_SIZE, this._curTime);
                    }
                } else if (size < 0) {
                    if (num < 0) {
                        co.highlightSize(Style.HIGHLIGHT_DOWN, Level2Book_Order.FIELD_SIZE | Level2Book_Order.FIELD_CODE, this._curTime);
                    } else {
                        co.highlightSize(Style.HIGHLIGHT_DOWN, Level2Book_Order.FIELD_SIZE, this._curTime);
                    }
                }
            }
            co._size += size;
            co._numOrders += num;
            if (time > co._time) {
                co._time = time;
            }
            if (co._size <= 0) {
                this._prices.splice(pos, 1);
            }
            return;
        }
        if (price < Level2Book.ZERO_PRICE) 
            break;
        if (price > co._price) {
            if ((this._buy) && (co._price > Level2Book.ZERO_PRICE)) 
                break;
        } else if (!this._buy) 
            break;
    }
    if (num < 0) return;
    if (size < 0) return;
    let co = new Level2Book_Order();
    co._price = price;
    co._size = size;
    co._numOrders = num;
    co._time = time;
    this._prices.splice(pos, 0, co);
    if (this._orderBook.isLoaded()) {
        co.setState(Level2Book_Order.STATE_INSERT, this._curTime + 2000);
    }
    if (pos < this._scrollPosition + this._numRows) {
        this._reloadAll = true;
    }
}
Level2Book.prototype._orderClear = function() {
    this._orders = [];
    this._prices = [];
    this._reloadAll = true;
}
/**
 * @private
 * @param {string} id
 */
Level2Book.prototype._findOrder = function(id) {
    for (let i = 0; i < this._orders.length; i++) {
        let co = this._orders[i];
        if (co._id === id) 
            return i;
    }
    return -1;
}
/**
 * @private
 * @param {string} id
 */
Level2Book.prototype._removeOrder = function(id) {
    let pos = this._findOrder(id);
    if (pos === -1) 
        return undefined;
    let co = this._orders[pos];
    this._orders.splice(pos, 1);
    if (pos < this._scrollPosition + this._numRows) {
        this._reloadAll = true;
    }
    return co;
}
/**
 * @private
 * @param {Array} olist
 */
Level2Book.prototype._updateAnimations = function(olist) {
    for (let i = 0; i < olist.length; i++) {
        let co = olist[i];
        if ((co._stateTime > 0) && (this._curTime > co._stateTime)) {
            switch (co._state) {
                case Level2Book_Order.STATE_DELETE:
                    this._removeOrder(co._id);
                    break;
                case Level2Book_Order.STATE_HIGHLIGHT_SIZE_1:
                    co.setState(Level2Book_Order.STATE_HIGHLIGHT_SIZE_2, this._curTime + 2000);
                    break;
                case Level2Book_Order.STATE_INSERT:
                case Level2Book_Order.STATE_HIGHLIGHT_SIZE_2:
                    co.setState(Level2Book_Order.STATE_DEFAULT, 0);
                    break;
                default:
                    continue;
            }
            this._doReloadRow(i);
            this._changes = true;
        }
    }
}
/**
 * @private
 * @param {number} pos
 */
Level2Book.prototype._listClick = function(pos) {
    if (pos < 0 || pos >= this._orders.length) 
        return;
    var e = new Level2Book_OrderEvent();
    var o = this._showPrices ? this._prices[pos] : this._orders[pos];
    e._source = this;
    e._event = ChartEvent.ORDER_CLICK;
    e._buy = this._buy;
    e._price = o._price;
    e._size = o._size;
    this.notify(e);
}
/**
 * @private
 * @param {number} pos
 */
Level2Book.prototype._doReloadRow = function(pos) {
    var p = pos - this._scrollPosition;
    if ((p >= 0) && (p < this._numRows)) {
        this._reloadRow[p] = true;
    }
}
/** @private */
Level2Book.prototype._setupList = function() {
    this._orderList.setRowHeight(19);
    this._orderList.setNumColumns(4);
    this._orderList.setColumnWidth(this._timeColumn, 40);
    this._orderList.setColumnWidth(this._codeColumn, 40);
    this._orderList.setColumnWidth(this._sizeColumn, 60);
    this._orderList.setColumnWidth(this._priceColumn, 60);
    
    for (let i = 0; i < this._numRows; i++) {
        let c = new Array(4);
        
        let d = new DateLabel(this._orderList._id + "_time", this._orderList);
        d.setFormat("*s");
        c[this._timeColumn] = d;
        
        let l = new DateLabel(this._orderList._id + "_code", this._orderList);
        c[this._codeColumn] = l;
        
        let ji = new IntegerLabel(this._orderList._id + "_size", this._orderList);
        ji.setAlign(Label.ALIGN_RIGHT);
        c[this._sizeColumn] = ji;
        
        l = new DateLabel(this._orderList._id + "_price", this._orderList);
        l.setAlign(this._buy ? Label.ALIGN_RIGHT : Label.ALIGN_LEFT);
        l.setStyle(Component.STYLE_SLOT_OVERRIDE, Style.BOLD_PRICE);
        c[this._priceColumn] = l;
        
        this._orderList.add(c);
    }
    this._orderList.layout();
    this._orderList.updateView();
}
/**
 * @param {number} bookID
 * @param {number} side
 * @param {number} action
 * @param {number} period
 * @param {number} value
 * @param {number} ch
 */
Level2Book.prototype.orderFlow = function(bookID, side, action, period, value, ch) {}
/**
 * @param {number} bookID
 */
Level2Book.prototype.orderBookLoad = function(bookID) {}
/** @static */
Level2Book.numberFormat = NumberFormat.getInstance();
/** @static */
Level2Book.ZERO_PRICE = 0.00000001;
/**
 * ----------------
 * Level2Book_List
 * ----------------
 * @constructor
 * @extends {List}
 * @param {string} id
 * @param {Component=} delegate
 */
function Level2Book_List(id, delegate) {
    List.call(this, id, delegate);
    this._rowHeight = 19;
    this._rowTotalHeight = 21;
    this._numRows = 0;
    this._numColumns = 0;
    this._columnWidths = new Array(128);
    this._columnPos = new Array(128);
    this._columnSkip = 0;
    this._rowSkip = 1;
}
/**
 * Inheriting
 */
Level2Book_List.prototype = Object.create(List.prototype);
Level2Book_List.prototype.constructor = Level2Book_List;
/**
 * @param {number} h
 */
Level2Book_List.prototype.setRowHeight = function(h) {
    this._rowHeight = h;
}
/**
 * @param {number} nc
 */
Level2Book_List.prototype.setNumColumns = function(nc) {
    this._numColumns = nc;
}
/**
 * @param {number} c
 * @param {number} w
 */
Level2Book_List.prototype.setColumnWidth = function(c, w) {
    this._columnWidths[c] = w;
}
/** @override */
Level2Book_List.prototype.add = function(columns) {
    this._rows.push(columns);
}
Level2Book_List.prototype.clear = function() {
    List.prototype.clear.call(this);
    this._numRows = 0;
}
Level2Book_List.prototype.updateView = function() {
    let yy = 0;
    for (let n = 0; n < this._rows.length; n++) {
        let ca = this._rows[n];
        for (let i = 0; i < this._numColumns; i++) {
            ca[i].setBounds(this._columnPos[i], yy, this._columnWidths[i], this._rowHeight);
        }
        yy += this._rowTotalHeight;
    }
}
Level2Book_List.prototype.layout = function() {
    let pos = 0;
    for (let i = 0; i < this._numColumns; i++) {
        this._columnPos[i] = pos;
        pos += this._columnWidths[i] + this._columnSkip;
    }
    this._prefWidth = pos;
}
/** @override */
Level2Book_List.prototype.draw = function(force) {
    Component.prototype.draw.call(this, force);
    let tds;
    let self = this;
    let r, er;
    if (!this._drawTable) {
        return;
    }
    this._drawTable = false;
    let tid = this._id + "_table";
    let str = "<table id=\"" + tid + "\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"width:100%;height:100%\" \>";
    let rid;
    for (let i = 0; i < this._rows.length; i++) {
        r = this._rows[i];
        rid = tid + "_r" + i;
        str += "<tr rownum=\"" + i + "\" id=\"" + rid + "\" ";
        er = r._enabled === undefined || r._enabled;
        str += "enabled=\"" + (er ? "true" : "false") + "\">";

        for (let j = 0; j < r.length; j++) {
            str += "<td style=\"";
            if (this._columnAligns[j]) {
                str += "align:" + List._alignments[j] + ";";
            }
            if (this._columnWidths) {
                str += "width:" + this._columnWidths[j] + "px;";
            }
            str += "color:" + (er ? List._textColor : List._disableColor) + ";";
            str += "cursor:" + (er ? "pointer" : "default") + ";";
            str += "white-space:nowrap;\">" + r[j] + "</td>";
        }
        str += "</tr>\n";
    }
    str += "</table>";
    this._div.html(str);

    tds=$("#"+tid+" td");
    tds.css("padding-left", this._paddingLeft+"px");
    tds.css("padding-right", this._paddingRight+"px");
    tds.css("padding-top", this._paddingTop+"px");
    tds.css("padding-bottom", this._paddingBottom+"px");

    tds = $("#" + tid);

    tds.css("padding-left", this._leftMargin+"px");
    tds.css("padding-right", this._rightMargin+"px");
    tds.css("padding-top", this._topMargin+"px");
    tds.css("padding-bottom", this._bottomMargin+"px");
}
/**
 * ----------------
 * Level2Book_Order
 * ----------------
 * @constructor
 */
function Level2Book_Order() {
    this._state = 0;
    this._stateTime = 0;
    this._highlightField = 0;
    this._highlightStyle = -1;
    this._id = 0;
    this._numOrders = 0;
    this._oldNumOrders = 0;
    this._price = 0.0;
    this._size = 0;
    this._oldSize = 0;
    this._style = -1;
    this._changes = 0;
    this._code = undefined;
    this._oldCode = undefined;
    this._time = 0;
    this._visible = false;
}
/**
 * @param {number} style
 * @param {number} fields
 * @param {number} t
 */
Level2Book_Order.prototype.highlightSize = function(style, fields, t) {
    this._highlightField = fields;
    switch (this._state) {
        case Level2Book_Order.STATE_DELETE:
        case Level2Book_Order.STATE_INSERT:
            break;
        case Level2Book_Order.STATE_HIGHLIGHT_SIZE_2:
            this._highlightStyle = style;
            this.setState(Level2Book_Order.STATE_HIGHLIGHT_SIZE_2, t + 1000);
            break;
        default:
            this._highlightStyle = style;
            this.setState(Level2Book_Order.STATE_HIGHLIGHT_SIZE_1, t + 1000);
            break;
    }
}
/**
 * @param {number} s
 * @param {number} t
 */
Level2Book_Order.prototype.setState = function(s, t) {
    this._state = s;
    this._stateTime = t;
}
/** @static */
Level2Book_Order.STATE_DEFAULT = 0;
/** @static */
Level2Book_Order.STATE_DELETE = 1;
/** @static */
Level2Book_Order.STATE_INSERT = 2;
/** @static */
Level2Book_Order.STATE_HIGHLIGHT_SIZE_1 = 3;
/** @static */
Level2Book_Order.STATE_HIGHLIGHT_SIZE_2 = 4;
/** @static */
Level2Book_Order.FIELD_SIZE = 1;
/** @static */
Level2Book_Order.FIELD_CODE = 2;
/**
 * @constructor
 * @extends {ChartEvent}
 */
function Level2Book_OrderEvent() {
    this._buy = false;
    this._price = 0.0;
    this._size = 0;
}
/**
 * Inheriting
 */
Level2Book_OrderEvent.prototype = Object.create(ChartEvent.prototype);
Level2Book_OrderEvent.prototype.constructor = Level2Book_OrderEvent;