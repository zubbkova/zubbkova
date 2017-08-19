/**
 * ------------------
 * PriceDataConstants
 * ------------------
 */
var PriceDataConstants = {};
PriceDataConstants.FREQUENCY_1 = 0;
PriceDataConstants.FREQUENCY_5 = 1;
PriceDataConstants.FREQUENCY_10 = 2;
PriceDataConstants.FREQUENCY_15 = 3;
PriceDataConstants.FREQUENCY_30 = 4;
PriceDataConstants.FREQUENCY_60 = 5;
PriceDataConstants.FREQUENCY_D = 6;
PriceDataConstants.FREQUENCY_W = 7;
PriceDataConstants.FREQUENCY_M = 8;
PriceDataConstants.FREQUENCY_Q = 9;
PriceDataConstants.FREQUENCY_Y = 10;
PriceDataConstants.NUM_FREQUENCIES = 11;
PriceDataConstants.PERIOD_INT = 0;
PriceDataConstants.PERIOD_1D = 1;
PriceDataConstants.PERIOD_2D = 2;
PriceDataConstants.PERIOD_3D = 3;
PriceDataConstants.PERIOD_5D = 4;
PriceDataConstants.PERIOD_1M = 5;
PriceDataConstants.PERIOD_2M = 6;
PriceDataConstants.PERIOD_3M = 7;
PriceDataConstants.PERIOD_6M = 8;
PriceDataConstants.PERIOD_1Y = 9;
PriceDataConstants.PERIOD_2Y = 10;
PriceDataConstants.PERIOD_3Y = 11;
PriceDataConstants.PERIOD_5Y = 12;
PriceDataConstants.PERIOD_YTD = 13;
PriceDataConstants.minutes = [1, 5, 10, 15, 30, 60];
PriceDataConstants.millis = [60000, 300000, 600000, 900000, 1800000, 3600000, 3600000 * 24, 3600000 * 24 * 5, 3600000 * 24 * 20, 3600000 * 24 * 60, 3600000 * 24 * 250];
PriceDataConstants.unitsPerHour = [60, 12, 6, 4, 2, 1];
PriceDataConstants.unitsPerDay = [60 * 24, 12 * 24, 6 * 24, 4 * 24, 2 * 24, 1 * 24];
PriceDataConstants.ONE_DAY = 24 * 60 * 60 * 1000;
PriceDataConstants.frequencyCodes = ["1", "5", "10", "15", "30", "60", "D", "W", "M", "Q", "Y"];
PriceDataConstants.months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
PriceDataConstants.days = ["", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];