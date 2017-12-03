/**
 * ---------
 * Exchanges
 * ---------
 */
var Exchanges = new Object();
/** @static */
Exchanges.ONE_HOUR = 60 * 60 * 1000;
/** @static */
Exchanges.NUM_COUNTRIES = 31;
/**
 * @static
 * @param {string} market
 */
Exchanges.convertMarketToCountry = function(market) {
    for (var i = 0; i < Exchanges.NUM_COUNTRIES; i++) {
        var markets = Exchanges.conversions[i];
        for (var j = 0; j < markets.length; j++) {
            if (market === markets[j]) 
                return i;
        }
    }
    return 0;
}
/**
 * @static
 * @param {string} market
 */
Exchanges.getTimeZone = function(market) {
    return Exchanges.zones[Exchanges.convertMarketToCountry(market)]; // returns string of Time Zone
}
/** @static */
Exchanges.zones = ['Europe/London', 'America/New_York', 'Europe/Paris', 'Europe/Berlin', 'Europe/Moscow', 'Europe/Athens', 'Europe/Helsinki', 'Europe/Copenhagen', 'UTC', 'Europe/Dublin', 'Europe/Zurich', 'America/Winnipeg', 'Africa/Johannesburg', 'Europe/Stockholm', 'Europe/Warsaw', 'Asia/Singapore', 'America/Mexico_City', 'America/Santiago', 'Australia/Melbourne', 'Asia/Shanghai', 'Asia/Calcutta', 'America/Toronto', 'America/Montreal', 'Asia/Tokyo', 'Asia/Jakarta', 'Asia/Bangkok', 'Europe/Milan', 'America/Sao_Paulo', 'Asia/Hong_Kong', 'Asia/Manila', 'GMT'];
/** @static */
Exchanges.conversions = [];
Exchanges.conversions.push(['L', 'FT', 'SG', 'OF', 'NF', 'LI', 'MF', 'NEX', 'BATSI']); // London
Exchanges.conversions.push(['N', 'NI', 'NB', 'NO', 'NY', 'NYI', 'A', 'DJI', 'SPI', 'NYM', 'COM', 'CME', 'AR', 'KBT', 'ONE', 'CBT', 'OPRA', 'PINK', 'NGI' , 'CNSX']); // New York
Exchanges.conversions.push(['E', 'EU', 'MFE', 'MFF', 'ELEQ', 'ELCM', 'ELIN']); // Paris
Exchanges.conversions.push(['DBI', 'XE', 'DJSI', 'FWB']); // Berlin
Exchanges.conversions.push(['RU']); // Moscow
Exchanges.conversions.push(['AS', 'ASI', 'WSE']); // Athens
Exchanges.conversions.push(['HEX']); // Helsinki
Exchanges.conversions.push(['C', 'OMX']); // Copenhagen
Exchanges.conversions.push(['FX', 'FX2', 'PM', 'CASE', 'TDWL']); // UTC
Exchanges.conversions.push(['I', 'ISI']); // Dublin
Exchanges.conversions.push(['SWI']); // Zurich
Exchanges.conversions.push(['W']); // Winnipeg
Exchanges.conversions.push(['J', 'JI', 'JSE']); // Johannesburg
Exchanges.conversions.push(['S']); // Stockholm
Exchanges.conversions.push(['WSE', 'WSI']); // Warsaw
Exchanges.conversions.push(['SGX', 'SST']); // Singapore
Exchanges.conversions.push(['BMV','BMVR']); // Mexico City
Exchanges.conversions.push(['SSX']); // Santiago
Exchanges.conversions.push(['ASX']); // Melbourne
Exchanges.conversions.push(['SZX','SHX','SSI']); // Shanghai
Exchanges.conversions.push(['NSE', 'BSE' , 'NSEI']); // Calcutta
Exchanges.conversions.push(['T', 'TX']); // Toronto
Exchanges.conversions.push(['MD', 'MO']); // Montreal
Exchanges.conversions.push(['JSX', 'SAP', 'FKK', 'NIK', 'TOCOM', 'TOCOMN', 'TGE', 'TGEN','CHIXJ']); // Tokyo
Exchanges.conversions.push(['JKX']); // Jakarta
Exchanges.conversions.push(['SET']); // Bangkok
Exchanges.conversions.push(['BIT', 'MOT', 'BITA', 'BITI', 'BITDER']); // Milan
Exchanges.conversions.push(['BCB', 'BMF', 'BOV']); // San paulo
Exchanges.conversions.push(['HKX', 'HKF']); // Hongkong
Exchanges.conversions.push(['PSE']); // Manila
Exchanges.conversions.push(['BTC']); // Bitcoin