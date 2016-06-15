var JB = {};
(function(w) {
	"use strict";
	JB.GET = (function() {
		var url_vars = w.location.search.substr(1).split("&"),
			i = url_vars.length,
			url_var,
			GET = [];
		while(i--) {
			url_var = url_vars[i].split("=");
			GET[url_var[0]] = url_var[1]=="true" ? true : (url_var[1]=="false" ? false : url_var[1]);
		}
		return GET;
	}());

	JB.lang = (function(get_lang) {
		var wn = w.navigator;
		// README Google Closure Compiler does not know navigator.userLanguage as of today - 13.06.2013
		return get_lang ? get_lang : ((wn && wn["userLanguage"] ? wn["userLanguage"] : wn.language ).split("-")[0]);
	}(JB.GET.lang));
}(window));
