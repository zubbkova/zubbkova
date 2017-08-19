/**
 * ------------
 * TradeSignals
 * ------------
 * @constructor
 * @param {Chart} [c]
 */
function TradeSignals(c) {
    this._chart = c;
    this._dateSignals = new Map();
}
/**
 * @param {Overlay} overlay
 */
TradeSignals.prototype.draw = function(overlay) {
    if (!this._dateSignals || !overlay) 
        return;
    let chart = this._chart;
    this._dateSignals.forEach(function(value, key, map) {
        if (!value) 
            return;
        let d = new Date(key);
        let type = value;
        let x = overlay.getX(d);
        if (x < 2) 
            return;
        let ser = chart.getSeries(TradeSignals.seriesMap[type]);
        if (!ser) 
            return;
        let price = ser.get(d);
        if (price <= 0.0) {
            price = chart.getSeries(Chart.S_CUR_CLOSE).get(d);
        }
        let s = TradeSignals.symbolMap[type];
        s.draw(chart._canvas, x, overlay.getY(price));
    });
}
/**
 * @param {Date} date
 */
TradeSignals.prototype.addSellExit = function(date) {
    this._dateSignals.set(date.getTime(), TradeSignals.IEXITSELL);
}
/**
 * @param {Date} date
 */
TradeSignals.prototype.addBuyExit = function(date) {
    this._dateSignals.set(date.getTime(), TradeSignals.IEXITBUY);
}
/**
 * @param {Date} date
 */
TradeSignals.prototype.addSell = function(date) {
    this._dateSignals.set(date.getTime(), TradeSignals.ISELL);
}
/**
 * @param {Date} date
 */
TradeSignals.prototype.addBuy = function(date) {
    this._dateSignals.set(date.getTime(), TradeSignals.IBUY);
}
TradeSignals.prototype.clear = function() {
    this._dateSignals.clear();
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