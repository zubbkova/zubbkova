/* global ar_AE, de_CH, de_DE, en_US, en_GB, es_MX, es_ES, fr_FR, it_IT, ja_JP, pt_BR, ru_RU */
/* exported _ */
/**
 * --------
 * Language
 * --------
 */
var Language = new Object();
Language._firstOccurrance = new Object();
/**
 * @param {string} locale
 */
Language.setLocale = function(locale) {
	Language._locale = locale;
	var a = locale.split("_");
    Language.setLanguageID(a[0]);
	switch (a[0]) {
        case "ar":
            Language._lclass = ar_AE;
            break;
        case "de":
            if (a[1] === "CH")
                Language._lclass = de_CH;
            else 
                Language._lclass = de_DE;
            break;
        case "en":
            if (a[1] === "US")
                Language._lclass = en_US;
            else 
                Language._lclass = en_GB;
            break;
        case "es":
            if (a[1] === "MX")
                Language._lclass = es_MX;
            else 
                Language._lclass = es_ES;
            break;
        case "fr":
            Language._lclass = fr_FR;
            break;
        case "it":
            Language._lclass = it_IT;
            break;
        case "ja":
            Language._lclass = ja_JP;
            break;
        case "pt":
            Language._lclass = pt_BR;
            break;
        case "ru":
            Language._lclass = ru_RU;
            break;
        default:
            Language._lclass = en_GB;
            break;
	}
}
Language.getLocale = function() {
	return Language._locale;
}
/**
 * @param {string} key
 */
Language.getString = function(key) {
	var l = Language._lclass;
    if (l === undefined)
        return "";
	while(true) {	
		if (l.hasOwnProperty(key)) {
			return l[key];
		}
		if (l.hasOwnProperty("_fallback")) {
			l = l._fallback;
		} else {
			break;
		}
	}
	if (!Language._firstOccurrance.hasOwnProperty(key)) {
		Language._firstOccurrance[key] = 1;
		console.error("missing language: " + key);
	}
	return "*[" + key + "]*";
};
Language.getLanguageID = function() {
    if (Language._languageId === undefined) {
        return "gb";
    }
    return Language._languageId;
}
/**
 * @param {string} id
 */
Language.setLanguageID = function(id) {
    Language._languageId = id;
}
/**
 * @param {string} key
 */
function _(key) {
    return Language.getString(key);
}