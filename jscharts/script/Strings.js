/**
 * -------
 * Strings
 * -------
 */
var Strings = {};
Strings.initialised = false;
Strings.init = function() {
    if (Strings.initialised) return;
    Strings.table = new Map();
    Strings.initialised = true;
    Strings.lse();
    Strings.nasdaq();
    Strings.nasdaq_otc();
    Strings.nasdaq_other_otc();
    Strings.nyse();
    Strings.amex();
    Strings.general();
    Strings.no_status();
    Strings.snews();
}
Strings.general = function() {
    Strings.put(100, "(no change)");	
    Strings.put(101, "(no trades)");	
    Strings.put(102, "MKT");
}
Strings.lse = function() {
    Strings.put(1000,"O");		
    Strings.put(1001,"B");		
    Strings.put(1002,"EU");		
    Strings.put(1003,"ER");
    Strings.put(1004,"K");		
    Strings.put(1005,"LC");		
    Strings.put(1006,"M");		
    Strings.put(1007,"N");
	Strings.put(1008,"NM");		
    Strings.put(1009,"NR");		
    Strings.put(1010,"P");		
    Strings.put(1011,"R");
    Strings.put(1012,"RO");		
    Strings.put(1013,"RT");		
    Strings.put(1014,"ST");		
    Strings.put(1015,"SW");
    Strings.put(1016,"UT");		
    Strings.put(1017,"X");		
    Strings.put(1018,"AT");		
    Strings.put(1019,"PA");
    Strings.put(1020,"PC");		
    Strings.put(1021,"T");		
    Strings.put(1022,"WN");		
    Strings.put(1023,"WT");
    Strings.put(1024,"CT");		
    Strings.put(1025,"AI");		
    Strings.put(1026,"PN");		
    Strings.put(1027,"VW");
    Strings.put(1028,"RC");         
    Strings.put(1029,"OK");         
    Strings.put(1030,"NT");         
    Strings.put(1031,"NK");
    Strings.put(1032,"OT");         
    Strings.put(1033,"TK");         
    Strings.put(1034,"BF");         
    Strings.put(1036,"SI");
    Strings.put(1037,"SK");         
    Strings.put(1038,"SC");         
    Strings.put(1039,"PT");
    Strings.put(1100,"B");		
    Strings.put(1101,"C");		
    Strings.put(1102,"L");		
    Strings.put(1103,"O");
    Strings.put(1200,"lse");
    Strings.put(1300,"A");		
    Strings.put(1301,"S");			
    Strings.put(1302,"XC");			
    Strings.put(1303,"XD");
    Strings.put(1304,"XL");		
    Strings.put(1305,"XO");		
    Strings.put(1306,"XR");		
    Strings.put(1307,"XP");	
    Strings.put(1308,"XS");		
    Strings.put(1309,"SU");		
    Strings.put(1310,"AU");
    Strings.put(1400,"ANNOUNCEMENT");
    Strings.put(1401,"STABALISATION");
    Strings.put(1402,"EX-CAPITALISATION");		
	Strings.put(1403,"EX-DIVIDEND");
    Strings.put(1404,"EX-LIQUIDATION-DISTRIBUTION");		
    Strings.put(1405,"EX-OTHER");		
	Strings.put(1406,"EX-RIGHTS");
	Strings.put(1407,"EX-REPAYMENT OF CAPITAL");	
	Strings.put(1408,"EX-STOCK DISTRIBUTION");
	Strings.put(1409,"SUSPENDED");
	Strings.put(1410,"AUCTION");
}
Strings.nasdaq = function() {
    Strings.put(2000,"");
    Strings.put(2001,"aq");
    Strings.put(2002,"bunched");
    Strings.put(2003,"cash");
    Strings.put(2004,"dist");
    Strings.put(2007,"bnch.sold");
    Strings.put(2011,"rule 155");
    Strings.put(2012,"sold last");
    Strings.put(2014,"nxt.day");
    Strings.put(2015,"opened");
    Strings.put(2016,"prior ref");
    Strings.put(2018,"seller");
    Strings.put(2019,"split");
    Strings.put(2020,"form t");
    Strings.put(2023,"average");
    Strings.put(2026,"seq");
    Strings.put(2027,"vol.only");
    // nasdaq exchanges
    Strings.put(2200,"nasd");
    Strings.put(2201,"amex");
    Strings.put(2202,"bost");
    Strings.put(2203,"cinc");
    Strings.put(2204,"chgo");
    Strings.put(2205,"nyse");
    Strings.put(2206,"pac");
    Strings.put(2207,"phil");
}
Strings.nyse = function() {
    Strings.put(3000,"");
    Strings.put(3001,"aq");
    Strings.put(3002,"average");
    Strings.put(3003,"cash");
    Strings.put(3004,"nxt.day.mkt");
    Strings.put(3005,"direct+");
    Strings.put(3006,"burst basket");
    Strings.put(3007,"open/reopen");
    Strings.put(3008,"intraday");
    Strings.put(3009,"basket idx");
    Strings.put(3010,"rule 127");
    Strings.put(3011,"rule 155");
    Strings.put(3012,"sold last");
    Strings.put(3014,"nxt.day");
    Strings.put(3015,"opened");
    Strings.put(3018,"seller");
    Strings.put(3019,"split");
    Strings.put(3020,"form t");
    Strings.put(3026,"seq");
    Strings.put(3027,"vol.only");
    // nyse exchanges
    Strings.put(3200,"nasd");
    Strings.put(3201,"amex");
    Strings.put(3202,"bost");
    Strings.put(3203,"cinc");
    Strings.put(3204,"chgo");
    Strings.put(3205,"nyse");
    Strings.put(3206,"pac");
    Strings.put(3207,"phil");
    Strings.put(3208,"nasdsc");
}
Strings.amex = function() {
    Strings.put(4000,"");
    Strings.put(4001,"aq");
    Strings.put(4002,"average");
    Strings.put(4003,"cash");
    Strings.put(4004,"nxt.day.mkt");
    Strings.put(4005,"direct+");
    Strings.put(4006,"burst basket");
    Strings.put(4007,"open/reopen");
    Strings.put(4008,"intraday");
    Strings.put(4009,"basket idx");
    Strings.put(4010,"rule 127");
    Strings.put(4011,"rule 155");
    Strings.put(4012,"sold last");
    Strings.put(4014,"nxt.day");
    Strings.put(4015,"opened");
    Strings.put(4018,"seller");
    Strings.put(4019,"split");
    Strings.put(4020,"form t");
    Strings.put(4026,"seq");
    Strings.put(4027,"vol.only");
    // amex exchanges
    Strings.put(4200,"nasd");
    Strings.put(4201,"amex");
    Strings.put(4202,"bost");
    Strings.put(4203,"cinc");
    Strings.put(4204,"chgo");
    Strings.put(4205,"nyse");
    Strings.put(4206,"pac");
    Strings.put(4207,"phil");
    Strings.put(4208,"nasdsc");
}
Strings.no_status = function() {
    Strings.put(5000,"");
    Strings.put(5200,"");
    // ftse
    Strings.put(6000,"");
    Strings.put(6200,"");

    // nasdaq indices
    Strings.put(7000,"");
    Strings.put(7200,"");

    // dow jones
    Strings.put(8000,"");
    Strings.put(8200,"");

    //  sp indices
    Strings.put(10000,"");
    Strings.put(10200,"");

    // nyse indices
    Strings.put(11000,"");
    Strings.put(11200,"");

    // liffe
    Strings.put(14000,"");
    Strings.put(14200,"");
}
Strings.nasdaq_otc = function() {
    Strings.put(12000,"");
    Strings.put(12001,"aq");
    Strings.put(12002,"bunched");
    Strings.put(12003,"cash");
    Strings.put(12004,"dist");
    Strings.put(12007,"bnch.sold");
    Strings.put(12011,"rule 155");
    Strings.put(12012,"sold last");
    Strings.put(12014,"nxt.day");
    Strings.put(12015,"opened");
    Strings.put(12016,"prior ref");
    Strings.put(12018,"seller");
    Strings.put(12019,"split");
    Strings.put(12020,"form t");
    Strings.put(12023,"average");
    Strings.put(12026,"seq");
    Strings.put(12027,"vol.only");
    // nasdaq otc exchanges
    Strings.put(12200,"nasd");
    Strings.put(12201,"amex");
    Strings.put(12202,"bost");
    Strings.put(12203,"cinc");
    Strings.put(12204,"chgo");
    Strings.put(12205,"nyse");
    Strings.put(12206,"pac");
    Strings.put(12207,"phil");
}
Strings.nasdaq_other_otc = function() {
    Strings.put(13000,"");
    Strings.put(13001,"aq");
    Strings.put(13002,"bunched");
    Strings.put(13003,"cash");
    Strings.put(13004,"dist");
    Strings.put(13007,"bnch.sold");
    Strings.put(13011,"rule 155");
    Strings.put(13012,"sold last");
    Strings.put(13014,"nxt.day");
    Strings.put(13015,"opened");
    Strings.put(13016,"prior ref");
    Strings.put(13018,"seller");
    Strings.put(13019,"split");
    Strings.put(13020,"form t");
    Strings.put(13023,"average");
    Strings.put(13026,"seq");
    Strings.put(13027,"vol.only");
    // nasdaq other otc exchanges
    Strings.put(13200,"nasd");
    Strings.put(13201,"amex");
    Strings.put(13202,"bost");
    Strings.put(13203,"cinc");
    Strings.put(13204,"chgo");
    Strings.put(13205,"nyse");
    Strings.put(13206,"pac");
    Strings.put(13207,"phil");
}
Strings.snews = function() {
    Strings.table.set("datetime", "Time");
    Strings.table.set("source", "Source");
    Strings.table.set("headline", "Headline");
    Strings.table.set("symbol", "Symbol");
    Strings.table.set("symbol_name", "Company");
}
/**
 * @param {number} i
 * @param {string} s
 */
Strings.put = function(i, s) {
    Strings.table.set(i, s);
}
/**
 * @param {number} i
 */
Strings.get = function(i) {
    return Strings.table.get(i);
}