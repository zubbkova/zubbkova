/* exported WebQuery_Table */
/**
 * --------------
 * WebQuery_Table
 * --------------
 * @constructor
 * @param {number} [cols] num of columns
 * @param {number} [rows] num of rows
 */
function WebQuery_Table(cols, rows) {
    this._dataSize = 1024 * 1024;
    this._binaryData = undefined;
    this._numRows = rows;
    this._numColumns = cols;
    this._columnName = new Array(cols);
    this._contents = [[]];
}