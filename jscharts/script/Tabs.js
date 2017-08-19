/**
 * ----
 * Tabs
 * ----
 * @constructor 
 * @extends {Component} 
 * @param {string} id - ID of div
 * @param {Component=} delegate
 */
function Tabs(id, delegate) {
    Component.call(this, id, delegate);
    this._tabs = [];
    this._tabsData = [];
    this._tableID = this._id + "_table";
    this._drawTable = true;
    this._drawButtons = true;
    this.setBackground("none");
    this._selected = undefined;
}
/**
 * Inheriting
 */
Tabs.prototype = Object.create(Component.prototype);
Tabs.prototype.constructor = Tabs;
/** @static */
Tabs.TAB_HEIGHT = 19;
/**
 * @param {number} id
 */
Tabs.prototype.getTab = function(id) {
    if (id < this._tabs.length) {
        return this._tabs[id];
    }
}
Tabs.prototype.create = function() {
    Component.prototype.create.call(this); 
}
/** @override */
Tabs.prototype.draw = function(force) {
    Component.prototype.draw.call(this, force);
    
    if (this._drawTable) {
        this._drawTable = false;
        let str = "<div id=\"" + this._tableID + "\" align=\"left\">";
        let pc = Math.floor(100 / this._tabs.length);
        for (let i = 0; i < this._tabs.length; i++) {
            let t = this._tabs[i];
            str += "<div style=\"text-align:center;display:inline-block\" id=\"" + this._id + "_t" + i + "\">" + t._text + "</div>";
        }
        str += "</div>";
        this._div.html(str);
        let te = $("#" + this._tableID);
        te.css("margin", "2px");
        te.css("margin-left", "0px");
        te.css("margin-top", "0px");
        te.css("height", "100%");
        te.css('cursor', 'pointer'); 
        te.css('clip', "auto");
        te.css('user-select', 'none');
        te.css('-o-user-select', 'none');
        te.css('-moz-user-select', 'none');
        te.css('-khtml-user-select', 'none');
        te.css('-webkit-user-select', 'none');
        this._div.css('clip', "auto");
    }
    if (this._drawButtons) {
        this._drawButtons = false;
        let self = this;
        let borderColor = "#999";
        for (let i = 0; i < this._tabs.length; i++) {
            let e = $("#" + this._id + "_t" + i);
            e.css('border-top', '1px solid ' + borderColor);
            e.css('height', Tabs.TAB_HEIGHT + 'px');
            e.css('line-height', Tabs.TAB_HEIGHT + 'px');
            if (i === 0) {
                e.css('border-top-left-radius', "2px 2px");
                e.css('border-bottom-left-radius', "2px 2px");
            } else if (i === this._tabs.length - 1) {
                e.css('border-top-right-radius', "2px 2px");
                e.css('border-bottom-right-radius', "2px 2px");
                e.css('border-right', '1px solid ' + borderColor);
            }
            e.css('border-left', '1px solid ' + borderColor);
            if (i === this._selected) {
                e.css("background", "linear-gradient(to bottom,  #444 0%,#888 100%)");
                e.css('text-shadow', "0px 1px 0px #444");
                e.css("color", "white");
                e.css('border-bottom', '1px solid #555');
            } else {
                e.css("background", "linear-gradient(to bottom,  #f5f5f5 0%,#ccccbc 100%)");
                e.css('text-shadow', "0px 1px 0px #ddd");
                e.css("color", "black");
                e.css('border-bottom', '1px solid ' + borderColor);
            }
            e.css('box-sizing', "border-box");
            e.css('box-shadow', "0px 1px 2px #ccc");
            e.css('padding-left', "8px");
            e.css('padding-right', "8px");
            e.off("mousedown");            
            e.on("mousedown", undefined, i, function(e) { self._handleClick(e); });
            
//            this._tabsData[i].setBounds(0, Tabs.TAB_HEIGHT + 2, this._width, this._height - Tabs.TAB_HEIGHT - 2);
            if (this._selected === i) {
                this._tabsData[i].show();
            } else {
                this._tabsData[i].hide();
            }
        }
    }
}
/** @override */
Tabs.prototype.setBounds = function(x, y, w, h) {
    Component.prototype.setBounds.call(this, x, y, w, h);
    for (let i = 0; i < this._tabs.length; i++) {
        this._tabsData[i].setBounds(0, Tabs.TAB_HEIGHT + 2, this._width, this._height - Tabs.TAB_HEIGHT - 2);
    }
}
/**
 * @param {string} id
 * @param {string} text
 */
Tabs.prototype.addTab = function(id, text) {
    let a = new Tabs_tab(id, text);
    this._tabs.push(a);
    
    this._tabsData.push(new Tabs_data(id + "_data", this._delegate));
    this.add(this._tabsData[this._tabsData.length - 1]);
    
    this._drawButtons = true;
    this._drawTable = true;
}
/**
 * @param {number} id
 */
Tabs.prototype.setSelected = function(id) {
    this._selected = id;
    this._drawButtons = true;
}
Tabs.prototype.getSelected = function() {
    return this._selected;
}
Tabs.prototype.size = function() {
    return this._tabs.length;
}
/**
 * @param {number} id
 * @param {Component} c
 */
Tabs.prototype.setDataControl = function(id, c) {
    if (id < this._tabsData.length) {
        this.remove(this._tabsData[id]);
        this._tabsData[id] = c;
        this.add(this._tabsData[id]);
        this._drawButtons = true;
    }
}
/**
 * @param {number} id
 */
Tabs.prototype.getDataControl = function(id) {
    if (id < this._tabsData.length) {
        return this._tabsData[id];
    }
}
/**
 * @param {Tabs_tab} tab
 */
Tabs.prototype.onClick = function(tab) {
    let e = new ChartEvent(ChartEvent.TAB_SELECT);
    e._data = tab;
    this.notify(e);
}
/**
 * @private
 * @param {jQuery.event=} event
 */
Tabs.prototype._handleClick = function(event) {
    this._selected = parseInt(event.data, 10);
    this.onClick(this._tabs[this._selected]._id);
    this._drawButtons = true;
    this.refresh();
}
/**
 * --------
 * Tabs_tab
 * --------
 * @constructor 
 * @param {string} id
 * @param {string} text
 */
function Tabs_tab(id, text) {
    this._id = id;
    this._text = text;
}
/**
 * @constructor 
 * @extends {Component}
 * @param {string} id
 * @param {Component=} delegate
 */
function Tabs_data(id, delegate) {
    Component.call(this, id, delegate);
    this.setBackground(Color.white);
    this.setBorderSize(1);
    this.setBorderColor(Color.black);
    this.setBorder(Component.BORDER_SOLID);
}
/**
 * Inheriting
 */
Tabs_data.prototype = Object.create(Component.prototype);
Tabs_data.prototype.constructor = Tabs_data;