/* global Chart, StudySymbol */
/**
 * ------------
 * TradeSignals
 * ------------
 * @constructor
 * @param {Chart} [c]
 */
function TradeSignals(c) {
    this._chart = c;
    this._dateSignals = new Object();
}
/**
 * @param {Overlay} overlay
 */
TradeSignals.prototype.draw = function(overlay) {
    if (!this._dateSignals || !overlay) 
        return;
    var chart = this._chart;
    for (var prop in this._dateSignals) {
        if (!this._dateSignals[prop]) 
            return;
        var d = new Date(parseInt(prop, 10));
        var type = this._dateSignals[prop];
        var x = overlay.getX(d);
        if (x < 2) 
            continue;
        var ser = chart.getSeries(TradeSignals.seriesMap[type]);
        if (!ser) 
            return;
        var price = ser.get(d);
        if (price <= 0.0) {
            price = chart.getSeries(Chart.S_CUR_CLOSE).get(d);
        }
        var s = TradeSignals.symbolMap[type];
        s.draw(chart._canvas, x, overlay.getY(price));
    }
}
/**
 * @param {Date} date
 */
TradeSignals.prototype.addSellExit = function(date) {
    this._dateSignals[date.getTime()] = TradeSignals.IEXITSELL;
}
/**
 * @param {Date} date
 */
TradeSignals.prototype.addBuyExit = function(date) {
    this._dateSignals[date.getTime()] = TradeSignals.IEXITBUY;
}
/**
 * @param {Date} date
 */
TradeSignals.prototype.addSell = function(date) {
    this._dateSignals[date.getTime()] = TradeSignals.ISELL;
}
/**
 * @param {Date} date
 */
TradeSignals.prototype.addBuy = function(date) {
    this._dateSignals[date.getTime()] = TradeSignals.IBUY;
}
TradeSignals.prototype.clear = function() {
    this._dateSignals = new Object();
}
/** @static */
TradeSignals.BUY = 1;
/** @static */
TradeSignals.EXITBUY = 2;
/** @static */
TradeSignals.SELL = 3;
/** @static */
TradeSignals.EXITSELL = 4;
/** @static */
TradeSignals.IBUY = new Number(TradeSignals.BUY);
/** @static */
TradeSignals.ISELL = new Number(TradeSignals.SELL);
/** @static */
TradeSignals.IEXITBUY = new Number(TradeSignals.EXITBUY);
/** @static */
TradeSignals.IEXITSELL = new Number(TradeSignals.EXITSELL);
/** @static */
TradeSignals.symbolMap = [StudySymbol.DOT, StudySymbol.BUY, StudySymbol.EXITBUY, StudySymbol.SELL, StudySymbol.EXITSELL];
/** @static */
TradeSignals.seriesMap = [0, Chart.S_CUR_LOW, Chart.S_CUR_LOW, Chart.S_CUR_HIGH, Chart.S_CUR_HIGH];