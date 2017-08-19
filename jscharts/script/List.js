/**
 * ----
 * List
 * ----
 * @constructor
 * @extends {Component}
 * @param {string} id - ID of div
 * @param {Component=} delegate
 */
function List(id, delegate) {
    Component.call(this, id, delegate);
    this._paddingLeft = 4;
    this._paddingRight = 4;
    this._paddingTop = 2;
    this._paddingBottom = 2;
    this._highlightColor = new Color("#EEEEEE");
    this.setCursor(Cursor.HAND_CURSOR);
    this.setClipping(true);
    this._rows = [];
    this._columnAligns = [];
    this._drawTable = true;
    this._index = -1;
}
/**
 * Inheriting
 */
List.prototype = Object.create(Component.prototype);
List.prototype.constructor = List;
/** @static */
List._alignments = ["center", "left", "right"];
/** @static */
List._textColor = "black";
/** @static */
List._disableColor = "gray";
List.prototype.clear = function() {
    this._rows = [];
    this._drawTable = true;
}
List.prototype.getNumRows = function() {
	return this._rows.length;
}
/**
 * @param {number} index
 */
List.prototype.setIndex = function(index) {
    this._index = index;
    this._drawTable = true;
}
/**
 * @param {Array} row
 */
List.prototype.addRow = function(row) {
    this._rows.push(row);
    this._drawTable = true;
    return this._rows.length - 1;
}
/**
 * @param {number} row
 */
List.prototype.removeRow = function(row) {
    this._rows.splice(row, 1);
    this._drawTable = true;
}
/**
 * @param {number} row
 * @param {number} column
 * @param {string} value
 */
List.prototype.updateRow = function(row, column, value) {
    this._rows[row][column] = value;
    this._drawTable = true;
}
/**
 * @param {number} row
 */
List.prototype.getRow = function(row) {
    return this._rows[row];
}
/**
 * @param {Array} widths
 */
List.prototype.setColumnWidths = function(widths) {
    this._columnWidths = widths;
    this._drawTable = true;
}
/**
 * @param {number} column
 * @param {number} align
 */
List.prototype.setColumnAlign = function(column, align) {
    this._columnAligns[column] = align;
    this._drawTable = true;
}
/**
 * @param {Array} aligns
 */
List.prototype.setColumnAligns = function(aligns) {
    this._columnAligns = aligns;
    this._drawTable = true;
}
/**
 * @param {number} left
 * @param {number} right
 * @param {number} top
 * @param {number} bottom
 */
List.prototype.setPadding = function(left, right, top, bottom) {
    this._paddingLeft=left;
    this._paddingRight=right;
    this._paddingTop=top;
    this._paddingBottom=bottom;
}
/** @override */
List.prototype.setBounds = function(x, y, width, height) {
    if (Component.prototype.setBounds.call(this, x, y, width, height)) {
        this._drawTable = true;
    }
}
/** @override */
List.prototype.draw = function(force) {
    Component.prototype.draw.call(this,force);

    let tds;
    let self = this;
    let r;
    let er;

    if (this._drawTable) {
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
                if (i === this._index) {
                    str += "background:" + this._highlightColor + ";";
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
                
        $("#" + tid + " tr").hover(
            function() {
                if ($(this).attr("enabled") === "true") {
                    $(this).css("background", self._highlightColor.toString());
                    self._curRow = $(this).attr("rownum");
                }
            }, 
            function() { 
                $(this).css("background", self._background.toString()); 
            }
        );
    }
}
/** @override */
List.prototype.onMouseUp = function(x, y) {
	return this.onClick(this._curRow);
}