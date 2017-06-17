/* Copyright © 2017 Michael Seifert (www.mseifert.com) All Rights Reserved */

/*  
 * Array.last()
 * returns the last element in an array
 */
Array.prototype.last = function () {
    return this[this.length - 1];
}
// polyfill for the element.matches(querySelector) method
(function() {
    "use strict";

    if (Element && !Element.prototype.matches) {
        var proto = Element.prototype;
        proto.matches = proto.matchesSelector ||
            proto.mozMatchesSelector || proto.msMatchesSelector ||
            proto.oMatchesSelector || proto.webkitMatchesSelector;
    }
}());

// polyfill for Object.assign (cloning an object)
if (typeof Object.assign != 'function') {
  Object.assign = function(target, varArgs) { // .length of function is 2
    'use strict';
    if (target == null) { // TypeError if undefined or null
      throw new TypeError('Cannot convert undefined or null to object');
    }

    var to = Object(target);

    for (var index = 1; index < arguments.length; index++) {
      var nextSource = arguments[index];

      if (nextSource != null) { // Skip over if undefined or null
        for (var nextKey in nextSource) {
          // Avoid bugs when hasOwnProperty is shadowed
          if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
    }
    return to;
  };
}

// polyfill for requestAnimationFrame
// https://github.com/darius/requestAnimationFrame/blob/master/requestAnimationFrame.js
if (!Date.now)
    Date.now = function() { return new Date().getTime(); };

(function() {
    'use strict';
    
    var vendors = ['webkit', 'moz'];
    for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
        var vp = vendors[i];
        window.requestAnimationFrame = window[vp+'RequestAnimationFrame'];
        window.cancelAnimationFrame = (window[vp+'CancelAnimationFrame']
                                   || window[vp+'CancelRequestAnimationFrame']);
    }
    if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) // iOS6 is buggy
        || !window.requestAnimationFrame || !window.cancelAnimationFrame) {
        var lastTime = 0;
        window.requestAnimationFrame = function(callback) {
            var now = Date.now();
            var nextTime = Math.max(lastTime + 16, now);
            return setTimeout(function() { callback(lastTime = nextTime); },
                              nextTime - now);
        };
        window.cancelAnimationFrame = clearTimeout;
    }
}());

// polyfill for array.find
// https://tc39.github.io/ecma262/#sec-array.prototype.find
if (!Array.prototype.find) {
  Object.defineProperty(Array.prototype, 'find', {
    value: function(predicate) {
     // 1. Let O be ? ToObject(this value).
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      var o = Object(this);

      // 2. Let len be ? ToLength(? Get(O, "length")).
      var len = o.length >>> 0;

      // 3. If IsCallable(predicate) is false, throw a TypeError exception.
      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }

      // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
      var thisArg = arguments[1];

      // 5. Let k be 0.
      var k = 0;

      // 6. Repeat, while k < len
      while (k < len) {
        // a. Let Pk be ! ToString(k).
        // b. Let kValue be ? Get(O, Pk).
        // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
        // d. If testResult is true, return kValue.
        var kValue = o[k];
        if (predicate.call(thisArg, kValue, k, o)) {
          return kValue;
        }
        // e. Increase k by 1.
        k++;
      }

      // 7. Return undefined.
      return undefined;
    }
  });
}

/*
 * 
 * put all classes in com.mseifert space
 * two alias in the public space are used:
 *	$msRoot => com.mseifert
 *	$ms	=> com.mseifert.common
 */
var com = com || {};
$msRoot = com.mseifert = function () {
    var topLevelDomain = "com";
    var namespace = "mseifert";
    
    function createNS(newSpace) {
	var parts = newSpace.split('.'),
		parent = this;
	if (parts.length >= 2 && parts[0] == topLevelDomain && parts[1] == namespace) {
	    // passed as com.mseifert....
	    parts = parts.slice(2);
	}
	for (var i = 0, length = parts.length; i < length; i++) {
	    parent[parts[i]] = parent[parts[i]] || {};
	    parent = parent[parts[i]];
	}
	return parent;
    }
    function getChildClasses(obj, className) {
	// combine an existing class with a newly created one
	// used when a parent class has child classes which get created before the parent
	if (typeof className == "undefined"){
	    var ns;
	    if (typeof $msRoot !== "undefined"){
		ns = $msRoot;
	    }
	} else {
	    ns = $msRoot[className];
	}
	if (ns) {
	    for (var prop in ns) {
		if (ns.hasOwnProperty(prop)) {
		    // add child class to the obj
		    obj[prop] = ns[prop];
		}
	    }
	}
    }

    var msRoot =  {
	    createNS: createNS,
	    getChildClasses: getChildClasses
	}
    getChildClasses(msRoot);
    return msRoot;    
}();

$ms = $msRoot.common = function () {
    var $ = function (id) {
	return document.getElementById(id);
    }
    // closes divs with id from g0 to g499
    // if javascript is disabled, divs remain open
    function closeAllDivs(cmd) {
	// if cmd is not blank, clicked on button to expand all or collapse all
	var i;
	try {
	    cmd = typeof cmd !== 'undefined' ? cmd : '';
	    var divs = document.getElementsByTagName('div');
	    for (i = 0; i < divs.length; i++) {
		// var cookieVal=getCookie('g' + i);
		//alert ('cookie g' + i + ' = ' + cookieVal);
		if (divs[i].id.substr(0, 2) == 's-') {
		    //hideable shoh divs start with 's-'
		    if (cmd !== '') {
			// force expand (show) or collapse
			shoh(divs[i].id, cmd);
		    } else if (getCookie(divs[i].id) !== "show" && divs[i].getAttribute("data-show") !== "show") {				//window.location.pathname + ':' + 
			// hide div - called on load of page
			if (divs[i].id.substr(0, 7) !== 's-show-') {
			    // test to see if default state is show - if not hide
			    shoh(divs[i].id, 'hide');
			}
		    }
		}
	    }
	} catch (err) {
	    alert("closeAllDivs()" + err.message);
	}
    }

    //this switches expand collapse icons - used by shos() function
    function setShohArrow(imagename, objectsrc) {
	var div = $(imagename);
	if (!div) return;
	// if (document.images){
	// open (less icon)
	if (objectsrc == "imgmore") {
	    // small = \u25b8 OR &#9656;
	    // large = \u25ba OR &#9658 ►
	    div.innerHTML = "\u25ba";  // ►
	} else {
	    // small = \u25bf OR &#9663;
	    // large = \u25bd OR &#9661
	    // large = \u25bc ▼
	    div.innerHTML = "\u25bc";  // ▼
	}
	//	}
    }

    //toggle state of div - show OR hide - default is hidden
    function shoh(id, cmd, nocookie) {
	// if cmd is not blank, clicked on button to expand all or collapse all
	//	if (id == 's-g454'){
	//		alert(id + ": " + cmd);
	//	}
	if (typeof nocookie == "undefined") {
	    nocookie = false;
	}

	try {
	    cmd = typeof cmd !== 'undefined' ? cmd : '';
	    var element = $(id);
	    if (element) {
		if ((element.style.display == "none" || hasClass(element, "display-none") || cmd == 'show') && cmd !== 'hide') {
		    //show
		    if (hasClass(element, "display-none") || hasClass(element, "display-none-off")) {
			removeClass(element, "display-none");
			addClass(element, "display-none-off");
		    } else {
			$(id).style.display = 'block';
		    }
		    setShohArrow(("img" + id), 'imgless');
		    if (!nocookie) {
			setCookie(id, "show", 15)			//default 15 minutes , in php =86400   window.location.pathname + ":" + 
		    }
		    //alert('show: '+id);
		} else {
		    //hide
		    if (hasClass(element, "display-none-off") || hasClass(element, "display-none")) {
			removeClass(element, "display-none-off");
			addClass(element, "display-none");
		    } else {
			$(id).style.display = 'none';
		    }
		    setShohArrow(("img" + id), 'imgmore');
		    //alert('hide0: '+id);
		    if (!nocookie) {
			deleteCookie(id);			//window.location.pathname + ":" +
		    }
		}
	    }
	} catch (err) {
	    //alert("err: "  + err.message.indexOf("images"));
	    if (err.message.indexOf("images") == -1) {
		//alert ("shoh(): " + err.message );
	    } else {
		// missing images error - ignore
		//alert ("shoh() images error: " + err.message );
	    }
	}
    }

    // scrolls down the page to specified Y position
    function scrollPage(scroll) {
	if (scroll >= 0) {
	    document.body.style.visibility = "hidden";
	    window.scrollTo(0, scroll);
	    document.body.style.visibility = "visible";
	}
	//after body tag set hidden - is made visible once onload event fired
	//removes IE page jerk when page displayed
    }

    // takes a scroll position after the #
    // and adds it to the href as a get parameter
    function setScrollURL(element) {
	var pos = element.href.indexOf("#");
	if (pos > 0) {
	    element.href = element.href.substring(0, pos);
	}
	element.href += "&scroll=" + document.documentElement.scrollTop;
    }

    // takes a scroll position after the #
    // and adds it to the form action url as a get parameter
    function setScrollAction(formid) {
	var element = $(formid);
	var pos = element.action.indexOf("#");
	if (pos > 0) {
	    element.action = element.action.substring(0, pos);
	}
	element.action += "&scroll=" + document.documentElement.scrollTop;
    }


    // download a file after page load
    // this function is run at startup
    // if an element.id exists: inputLinkId (default: "downloadlink")
    //	then dynamically creates an iframe with passed url: inputLinkId
    //  Parameters:
    //	settings.inputLinkId (default: "datadiv") = an input whose value is the url
    //	settings.divId = a div to append the iframe to
    //	settings.cookieKey (default: gemdownload) = the cooke id to remove - if it isn't removed, php will handle the download
    //	settings.iframeId  = the id of the iframe to create
    function downloadfile(settings) {
	if (typeof settings == "undefined") 
	    settings = {};
	if (typeof settings.inputLinkId == "undefined")
	    settings.inputLinkId = "downloadlink";
	if (typeof settings.divId == "undefined")
	    settings.divId = "datadiv";
	if (typeof settings.cookieKey == "undefined")
	    settings.cookieKey = "gemdownload";
	if (typeof settings.iframeId == "undefined")
	    settings.iframeId = "iframe";

	if ($(settings.inputLinkId)) {
	    var div = $(settings.divId);
	    var url = hdx($(settings.inputLinkId).value);
	    var ifrm = document.createElement("iframe");
	    ifrm.src = url;
	    ifrm.id = settings.iframeId;
	    ifrm.height = 0;
	    ifrm.width = 0;
	    ifrm.hidden = true;
	    div.appendChild(ifrm);
	    // remove cookie that is a flag
	    setCookie(settings.cookieKey, "true", -1);
	}
    }

    function setCookie(name, value, minutes) {
	minutes = typeof minutes !== 'undefined' ? minutes : 60;
	var date = new Date();
	if (minutes < 0) {
	    expires = "Thu, 01 Jan 1970 00:00:01 GMT";
	} else {
	    date.setTime(date.getTime() + (minutes * 60 * 1000));
	    expires = date.toUTCString();
	}

	var value = escape(value) + "; expires=" + expires;

	document.cookie = name + "=" + value + ";domain=" + $ms.DOMAIN + ";path=/";
    }

    // The first indexOf() method will return the position where the cookie is found. 
    //   The " " + and +"=" is added so that the method don't find names or values containing the name.
    // If the method returns -1, the cookie may still exist at the very beginning of the cookie string.
    //   To eliminate this, another search is added, this time without the " " +.
    function getCookie(name) {
	var value = document.cookie;
	var start = value.indexOf(" " + name + "=");
	if (start == -1) {
	    start = value.indexOf(name + "=");
	}
	if (start == -1) {
	    value = null;
	} else {
	    start = value.indexOf("=", start) + 1;
	    var end = value.indexOf(";", start);
	    if (end == -1) {
		end = value.length;
	    }
	    value = unescape(value.substring(start, end));
	}
	return value;
    }

    function deleteCookie(name) {
	setCookie(name, null, -1);
    }

    // developer tool for quick typing of an extended console.log function
    // dump contents of variable to console and optionally alert
    function v() {
	var out = '', showalert = false;
	for (var i = 0; i < arguments.length; i++) {
	    if ((arguments[i] == "alert" || arguments[i] == "a") && i == (arguments.length - 1)) {
		showalert = true;
	    } else if (typeof arguments[i] == "object") {
		for (var j in arguments[i]) {
		    if (!arguments[i].hasOwnProperty(j)) continue;
		    if (typeof arguments[i][j] == "object") {
			for (var k in arguments[i][j]) {
			    out += j + "=> " + k + ": " + arguments[i][j][k] + "\n";
			}
		    } else {
			out += j + ": " + arguments[i][j] + "\n";
		    }
		}
	    } else {
		out += arguments[i] + "\n";
	    }
	}
	if (showalert) {
	    alert(out);
	} else {
	    console.log(out);
	}
	return out;
    }

    // dynamically creqate and submit a form via get or post
    // will load the new url
    function post_to_url(path, params, method) {
	method = method || "get"; // Set method to get by default if not specified.
	var form = document.createElement("form");
	form.method = method;
	form.action = path;

	if (method == 'get') {
	    if (Object.prototype.toString.call(params) !== '[object Object]') {
		// initialize empty object if none passed
		params = {};
	    }
	    var arr = path.split('?')
	    if (arr.length > 1) {
		// params exist
		var arr2 = arr[1].split("&");
		for (var i = 0; i < arr2.length; i++) {
		    var arr3 = arr2[i].split("=");
		    if (arr3.length == 2) {
			params[arr3[0]] = arr3[1];
		    }
		}
	    }
	}

	for (var key in params) {
	    if (params.hasOwnProperty(key)) {
		var hiddenField = document.createElement("input");
		hiddenField.setAttribute("type", "hidden");
		hiddenField.setAttribute("name", key);
		hiddenField.setAttribute("value", params[key]);
		form.appendChild(hiddenField);
	    }
	}
	document.body.appendChild(form);
	form.submit();
    }

    // dynamically submit a form via get or post via iframe
    // will stay on the existing page
    function postToIframe(path, params, method, div) {
	if (typeof div == "undefined") {
	    div = document.body;
	} else if (typeof div == "string") {
	    div = $(div);
	}

	method = method || "get"; // Set method to get by default if not specified.
	var form = document.createElement("form");
	form.method = method;
	form.action = path;
	form.id = "post-form";

	if (method == 'get') {
	    if (Object.prototype.toString.call(params) !== '[object Object]') {
		// initialize empty object if none passed
		params = {};
	    }
	    var arr = path.split('?')
	    if (arr.length > 1) {
		// params exist
		var arr2 = arr[1].split("&");
		for (var i = 0; i < arr2.length; i++) {
		    var arr3 = arr2[i].split("=");
		    if (arr3.length == 2) {
			params[arr3[0]] = arr3[1];
		    }
		}
	    }
	}

	for (var key in params) {
	    var value;
	    if (params.hasOwnProperty(key)) {
		var hiddenField = document.createElement("input");
		hiddenField.setAttribute("type", "hidden");
		hiddenField.setAttribute("name", key);
		if (typeof params[key] == "object") {
		    value = JSON.stringify(params[key]);
		} else {
		    value = params[key];
		}
		hiddenField.setAttribute("value", value);
		form.appendChild(hiddenField);
	    }
	}
	var iframe = document.createElement("iframe");
	iframe.id = "post-iframe";
	iframe.name = "post-iframe";
	iframe.height = 1000;
	iframe.width = 1000;
	iframe.hidden = true;
	form.target = "post-iframe";
	div.appendChild(form);
	div.appendChild(iframe);
	form.submit();
    }

    function htmlspecialchars(string, quote_style, charset, double_encode) {
	//       discuss at: http://phpjs.org/functions/htmlspecialchars/
	var optTemp = 0,
		i = 0,
		noquotes = false;
	if (typeof quote_style === 'undefined' || quote_style === null) {
	    quote_style = 2;
	}
	string = string.toString();
	if (double_encode !== false) { // Put this first to avoid double-encoding
	    string = string.replace(/&/g, '&amp;');
	}
	string = string.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');

	var OPTS = {
	    'ENT_NOQUOTES': 0,
	    'ENT_HTML_QUOTE_SINGLE': 1,
	    'ENT_HTML_QUOTE_DOUBLE': 2,
	    'ENT_COMPAT': 2,
	    'ENT_QUOTES': 3,
	    'ENT_IGNORE': 4
	};
	if (quote_style === 0) {
	    noquotes = true;
	}
	if (typeof quote_style !== 'number') { // Allow for a single string or an array of string flags
	    quote_style = [].concat(quote_style);
	    for (i = 0; i < quote_style.length; i++) {
		// Resolve string input to bitwise e.g. 'ENT_IGNORE' becomes 4
		if (OPTS[quote_style[i]] === 0) {
		    noquotes = true;
		} else if (OPTS[quote_style[i]]) {
		    optTemp = optTemp | OPTS[quote_style[i]];
		}
	    }
	    quote_style = optTemp;
	}
	if (quote_style & OPTS.ENT_HTML_QUOTE_SINGLE) {
	    string = string.replace(/'/g, '&#039;');
	}
	if (!noquotes) {
	    string = string.replace(/"/g, '&quot;');
	}

	return string;
    }

    function htmlspecialchars_decode(string, quote_style) {
	//       discuss at: http://phpjs.org/functions/htmlspecialchars_decode/
	var optTemp = 0,
		i = 0,
		noquotes = false;
	if (typeof quote_style === 'undefined') {
	    quote_style = 2;
	}
	string = string.toString().replace(/&lt;/g, '<').replace(/&gt;/g, '>');
	var OPTS = {
	    'ENT_NOQUOTES': 0,
	    'ENT_HTML_QUOTE_SINGLE': 1,
	    'ENT_HTML_QUOTE_DOUBLE': 2,
	    'ENT_COMPAT': 2,
	    'ENT_QUOTES': 3,
	    'ENT_IGNORE': 4
	};
	if (quote_style === 0) {
	    noquotes = true;
	}
	if (typeof quote_style !== 'number') { // Allow for a single string or an array of string flags
	    quote_style = [].concat(quote_style);
	    for (i = 0; i < quote_style.length; i++) {
		// Resolve string input to bitwise e.g. 'PATHINFO_EXTENSION' becomes 4
		if (OPTS[quote_style[i]] === 0) {
		    noquotes = true;
		} else if (OPTS[quote_style[i]]) {
		    optTemp = optTemp | OPTS[quote_style[i]];
		}
	    }
	    quote_style = optTemp;
	}
	if (quote_style & OPTS.ENT_HTML_QUOTE_SINGLE) {
	    string = string.replace(/&#039;/g, "'");
	}
	if (!noquotes) {
	    string = string.replace(/&quot;/g, '"');
	}
	// Put this in last place to avoid escape being double-decoded
	string = string.replace(/&amp;/g, '&');

	return string;
    }

    // encodes output
    // hx notation is a shortcut for htmlspecialchars() with all options set
    function hx(string, flags, charsetEncoding, double_encode) {
	if (typeof flags == "undefined") {
	    flags = 0;
	}
	if (typeof charsetEncoding == "undefined") {
	    charsetEncoding = "UTF-8";
	}
	if (typeof double_encode == "undefined") {
	    double_encode = true;
	}

	// constants not valid until php v 5.4
	var ENT_HTML401 = 0;
	var ENT_HTML5 = (16 | 32);
	var ENT_COMPAT = 2;
	if (flags == 0) {
	    flags = ENT_COMPAT | ENT_HTML401;
	}
	string = htmlspecialchars(string, flags, charsetEncoding, double_encode);
	return  string;
    }

    // decodes output of hx() / htmlspecialchars() - shortcut notation for htmlspecialchars_decode()
    function hdx(string) {
	return htmlspecialchars_decode(string);
    }

    function base64_encode(data) {
	//  discuss at: http://phpjs.org/functions/base64_encode/
	var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
	var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
		ac = 0,
		enc = '',
		tmp_arr = [];

	if (!data) {
	    return data;
	}

	do { // pack three octets into four hexets
	    o1 = data.charCodeAt(i++);
	    o2 = data.charCodeAt(i++);
	    o3 = data.charCodeAt(i++);

	    bits = o1 << 16 | o2 << 8 | o3;

	    h1 = bits >> 18 & 0x3f;
	    h2 = bits >> 12 & 0x3f;
	    h3 = bits >> 6 & 0x3f;
	    h4 = bits & 0x3f;

	    // use hexets to index into b64, and append result to encoded string
	    tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
	} while (i < data.length);

	enc = tmp_arr.join('');

	var r = data.length % 3;

	return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);
    }

    function base64_decode(data) {
	//  discuss at: http://phpjs.org/functions/base64_decode/
	var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
	var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
		ac = 0,
		dec = '',
		tmp_arr = [];

	if (!data) {
	    return data;
	}

	data += '';

	do { // unpack four hexets into three octets using index points in b64
	    h1 = b64.indexOf(data.charAt(i++));
	    h2 = b64.indexOf(data.charAt(i++));
	    h3 = b64.indexOf(data.charAt(i++));
	    h4 = b64.indexOf(data.charAt(i++));

	    bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;

	    o1 = bits >> 16 & 0xff;
	    o2 = bits >> 8 & 0xff;
	    o3 = bits & 0xff;

	    if (h3 == 64) {
		tmp_arr[ac++] = String.fromCharCode(o1);
	    } else if (h4 == 64) {
		tmp_arr[ac++] = String.fromCharCode(o1, o2);
	    } else {
		tmp_arr[ac++] = String.fromCharCode(o1, o2, o3);
	    }
	} while (i < data.length);

	dec = tmp_arr.join('');

	return dec.replace(/\0+$/, '');
    }

    function urlencode(str) {
	//       discuss at: http://phpjs.org/functions/urlencode/
	str = (str + '').toString();

	// Tilde should be allowed unescaped in future versions of PHP (as reflected below), but if you want to reflect current
	// PHP behavior, you would need to add ".replace(/~/g, '%7E');" to the following.
	return encodeURIComponent(str)
		.replace(/!/g, '%21')
		.replace(/'/g, '%27')
		.replace(/\(/g, '%28')
		.replace(/\)/g, '%29')
		.replace(/\*/g, '%2A')
		.replace(/%20/g, '+');
    }

    function urldecode(str) {
	//       discuss at: http://phpjs.org/functions/urldecode/
	return decodeURIComponent((str + '')
		.replace(/%(?![\da-f]{2})/gi, function () {
		    // PHP tolerates poorly formed escape sequences
		    return '%25';
		})
		.replace(/\+/g, '%20'));
    }

    // jumbles so not readily apprent what the string is - but not safe encoding
    // used for url where characters would conflict (e.g. passing key pairs)
    function encodestr(str) {
	return urlencode(base64_encode(str));
    }

    function hasClass(e, name) {
	if (e && typeof e.className !== "undefined") {
	    return (' ' + e.className + ' ').indexOf(' ' + name + ' ') > -1;
	    // regex is 10 times slower!
	    // return new RegExp('(\\s|^)'+name+'(\\s|$)').test(e.className);
	}
	return false;
    }

    function addClass(e, name) {
	if (e && typeof e.classList !== "undefined" && name.length > 0) {
	    e.classList.add(name)
	} else if (!hasClass(e, name)) {
	    // ie 9 and below
	    e.setAttribute('class', e.getAttribute('class') + ' ' + name);
	}
    }

    function removeClass(e, name) {
	if (e && typeof e.classList !== "undefined") {
	    e.classList.remove(name);
	} else if (hasClass(e, name)) {
	    // ie 9 and below
	    e.setAttribute('class', e.getAttribute('class').replace(name, ' '));
	}
    }

    function parseJSON(jsonString, jsonreplacer) {
	try {
	    var o = JSON.parse(jsonString, jsonreplacer);

	    // Handle non-exception-throwing cases:
	    // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
	    // but... JSON.parse(null) returns 'null', and typeof null === "object", 
	    // so we must check for that, too.
	    if (typeof o === "object") {
		return o;
	    }
	} catch (e) {
	}

	return false;
    }

    function round(number, precision) {
	precision = precision ? +precision : 0;

	var sNumber = number + '',
		periodIndex = sNumber.indexOf('.'),
		factor = Math.pow(10, precision);

	if (periodIndex === -1 || precision < 0) {
	    return Math.round(number * factor) / factor;
	}

	number = +number;

	// sNumber[periodIndex + precision + 1] is the last digit
	if (sNumber[periodIndex + precision + 1] >= 5) {
	    // Correcting float error
	    // factor * 10 to use one decimal place beyond the precision
	    number += (number < 0 ? -1 : 1) / (factor * 10);
	}

	return +number.toFixed(precision);
    }

    // generate random integer between 2 numbers inclusive
    function randomNumber(min, max) {
	if (typeof min == "undefined")
	    min = 0;
	if (typeof max == "undefined")
	    max = 1000000;
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function printDiv(id) {
	var data = $(id).innerHTML;
	var myWindow = window.open('', '', 'height=400,width=600');
	myWindow.document.write('<html><head><title>Print</title>');
	/*optional stylesheet*/ //myWindow.document.write('<link rel="stylesheet" href="main.css" type="text/css" />');
	myWindow.document.write('</head><body>');
	myWindow.document.write(data);
	myWindow.document.write('</body></html>');
	myWindow.document.close(); // necessary for IE >= 10

	myWindow.onload = function () { // necessary if the div contain images

	    myWindow.focus(); // necessary for IE >= 10
	    myWindow.print();
	    myWindow.close();
	};
    }

    function requestFullScreen(element) {
	// Goes into full screen mode
	var requestMethod = element.requestFullScreen ||
		element.webkitRequestFullScreen || element.mozRequestFullScreen || element.msRequestFullScreen;

	if (requestMethod) {
	    requestMethod.call(element);
	} else if (typeof window.ActiveXObject !== "undefined") { // Older IE.
	    var wscript = new ActiveXObject("WScript.Shell");
	    if (wscript !== null) {
		wscript.SendKeys("{F11}");
	    }
	}
    }

    function cancelFullScreen() {
	var requestMethod = document.cancelFullScreen || document.webkitCancelFullScreen || document.mozCancelFullScreen ||
		document.exitFullscreen || document.webkitExitFullScreen || document.mozCancelFullScreen;
	if (requestMethod) {
	    requestMethod.call(document);
	} else if (typeof window.ActiveXObject !== "undefined") { // Older IE.
	    var wscript = new ActiveXObject("WScript.Shell");
	    if (wscript !== null) {
		wscript.SendKeys("{F11}");
	    }
	}
    }

    function isTouchDevice() {
	return (('ontouchstart' in window)
		|| (navigator.maxTouchPoints > 0)
		|| (navigator.msMaxTouchPoints > 0));	//IE	
    }

    // set a fade transition - fade element in or out
    function fade(element, begin, end, transitionTime, display, callbackwhendone) {
	var direction;
	if (typeof begin == "undefined")
	    begin = 0;
	if (typeof end == "undefined")
	    end = 1;
	if (typeof transitionTime == "undefined")
	    transitionTime = 2000; // milli seconds for transition
	if (begin == end) {
	    // no transition
	    return;
	}

	element.style.opacity = begin;
	if (begin > end) {
	    // fading out
	    direction = -1;
	} else {
	    // fading in - default
	    direction = 1;
	    element.style.display = display || "block";
	}
	var steps = Math.abs((begin - end) / .1)
	var stepTime = transitionTime / steps
	var last;
	(function fade2(now) {
	    if (!last)
		last = now;
	    var deltaT = now - last;
	    if (deltaT > stepTime) {
		var val = parseFloat(element.style.opacity);
		if (direction == 1) {
		    // fade in
		    if (!((val += .1) > 1)) {
			element.style.opacity = val;
			requestAnimationFrame(fade2);
		    } else {
			return;
		    }
		} else {
		    // fade out
		    if ((element.style.opacity -= .1) < 0) {
			element.style.display = "none";
			return;
		    } else {
			requestAnimationFrame(fade2);
		    }
		}
		last = now
	    }
	    // loop until cancelled
	    requestAnimationFrame(fade2);
	})();
    }

    // set a scale transition - scale element in or out
    function scale(element, begin, end, time, othertransform) {
	var direction;
	if (typeof othertransform == "undefined") {
	    othertransform = "";
	}
	if (typeof begin == "undefined") {
	    begin = 1;
	}
	if (typeof end == "undefined") {
	    end = 1;
	}
	if (typeof time == "undefined") {
	    // milli seconds for each loop
	    time = 10;
	}
	var setting = begin;   // initial opacity
	if (begin == end) {
	    // no transition
	    direction = 0;
	} else if (begin > end) {
	    // scaling out (making smaller)
	    direction = -1;
	} else {
	    direction = 1;
	}

	element.style.display = 'block';
	var done = false;
	var timer = setInterval(function () {
	    // makes sure if begin and end are same that loop runs once so is set
	    var set = false;
	    if ((direction == 1 && setting >= end) ||
		    (direction == -1 && setting <= end) ||
		    (set && direction == 0)) {
		clearInterval(timer);
		// make sure end exactly where we want
		setting = end;
	    }
	    set = true;
	    // othertransform allows multiple transforms to be done at once. 
	    // They can't be done separately as one overrides the other
	    othertransform = " " + othertransform;
	    othertransform = othertransform.trim();
	    var transform = 'scale(' + setting + ')' + othertransform;
	    element.style.transform = transform;
	    element.style['-o-transform'] = transform;
	    element.style['-webkit-transform'] = transform;
	    element.style['-moz-transform'] = transform;
	    setting += setting * 0.1;
	}, time);
    }

    // manage dynamic loading of source files (js, css, img) and js functions
    var sourceFiles = {
	queued: [],
	loading: [],
	source: [],
	fileInfo: [],
	versionCheck: [],	// array of version check requests
	versionCheckPaths: [],	    // list of paths checked with version checking
	doVersionChecking: function(path){
	    // set function sourceFiles.versionChecking as a dependency
	    // file times will be retrieved from server before any dependent js files
	    // each js file will have file time added to the name to mangage file versions
	    // .htaccess removes the file version from the file name	    
	    var dependencies = [
		// all functions must have a unique name - create one on the fly
		{file: new Function("return function versionChecking" + sourceFiles.versionCheck.length + "(){$ms.sourceFiles.versionChecking(" + JSON.stringify(path) + ")}")()}
	    ];
	    sourceFiles.add(dependencies);
	    sourceFiles.load();
	},
	add: function(source){
	    if (!Array.isArray(source)){
		source = [source];
	    }
	    for (var i = 0; i < source.length; i++){
		// passed properties of source:
		// baseDir	base directory flag
		//		js = common js directory
		//		css = common css directory
		//		img = common img directory
		//		root = root server directory
		//		site = root site directory
		//		empty = use extension to determine common directory
		// subDir	directory under the base directory
		// file		file name without path and with optional passed parameters - full path will be added to the property
		//		OR function
		// dependencies	object containing source files - has same properties as source and will add recursively
		
		// additional propterties set internally
		// baseFile	file name stripped of passed parameters (calculated from file)
		//		OR function name
		// type		type of file (js, css, img)
		// loaded	flag that file has been loaded
		
		// test if namespace specified and if already exists
		if (sourceFiles.alreadyLoadedNs(source[i].ns)) continue;
		
		if (typeof source[i].file == "function"){
		    var funcName = sourceFiles.functionName(source[i].file);
		    source[i].baseFile = funcName;
		    source[i].loaded = false;
		    source[i].type = "function";
		    if (funcName == "onload"){
			if (document.readyState === "complete" || document.readyState === "interactive"){
			    // condition already satisfied
			    sourceFiles.onload({target: {src: sourceFiles.source[i].baseFile}});
			} else {
			    window.addEventListener("load", sourceFiles.load);
			}
		    }
		} else {
		    source[i].baseFile = source[i].file.split("?")[0];
		    var ext = source[i].baseFile.substr(source[i].baseFile.lastIndexOf(".") + 1);
		    if (ext == "js"){
			source[i].type = "js";
		    } else if (ext == "css"){
			source[i].type = "css";
		    } else if (ext == "php"){
			if (source[i].baseFile.indexOf("css.php") !== -1){
			    // css files which are being processed via php (so can pass variables)
			    source[i].type = "css";
			} else {
			    source[i].type = "unknown";
			    console.log("Don't know what to do with source file type `php`: " + source[i].file);
			}
		    } else if (["jpg", "png", "gif"].indexOf(ext) !== -1){
			source[i].type = "img";
		    } else {
			source[i].type = "unknown";
			console.log("Source File unknown type for: " + source[i].file);
		    }
		    var dir = sourceFiles.buildUrlPath(source[i].baseDir, source[i].type);		    
		    var subDir = "";
		    if (typeof source[i].subDir !== "undefined"){
			// add preceeding forward slash if not already there
			subDir = (source[i].subDir.indexOf("/") !== 0 ? "/" : "") + source[i].subDir;
		    }
		    // add the full path to the file
		    source[i].file = dir + subDir + "/" + source[i].file;
		    source[i].loaded = false;
		}
		// test if file already added to load queue
		if (sourceFiles.queued.indexOf(source[i].baseFile) !== -1) continue;
		
		if (source[i].dependencies){
		    for (var j = 0; j < source[i].dependencies.length; j++){
			// recursively add the dependencies
			sourceFiles.add(source[i].dependencies[j]);
		    }
		} else {
		    source[i].dependencies = [];
		}
		// add to queue to be loaded
		// flag file is queued for loading
		sourceFiles.queued.push(source[i].baseFile);
		    
		sourceFiles.source.push(source[i]);
	    }
	},
	onloadTest: function onload(){
	    // when file is minimized, any anonymous fn's will lose their name
	    // for the onload test, must have a real function to equate to
	    // onload will allow document.readyState === "interactive" which seems to work for all but ie9
	},
	load: function(){
	    var versionCheckLength = sourceFiles.versionCheck.length;
	    for (var i = 0; i < sourceFiles.versionCheck.length; i++){
		if (sourceFiles.versionCheck[i].timeStamp > 0 && !sourceFiles.versionCheck[i].complete){
		    // if the response from the server not yet received - set interval to wait for it
		    if (typeof sourceFiles.versionCheck[i].interval !== "undefined"){
			// interval already running
			return;
		    }
		    sourceFiles.versionCheck[i].interval = setInterval(function(){
			if (sourceFiles.versionCheck[i].complete || Date.now() - sourceFiles.versionCheck[i].timeStamp >= sourceFiles.versionCheckingTimeout){
			    clearInterval(sourceFiles.versionCheck[i].interval);
			    if (!sourceFiles.versionCheck[i].complete){
				console.log("Timeout checking js version (" + i + ")");
			    }
			    sourceFiles.versionCheck[i].complete = true;
			    sourceFiles.load();
			}
		    }, 10);
		    return;
		}
	    }
	    for (var i = 0; i < sourceFiles.source.length; i++){
		if (versionCheckLength !== sourceFiles.versionCheck.length){
		    // if version checking has been added - start over
		    sourceFiles.load();
		    return;
		}
		// remove dependencies that are already loaded
		sourceFiles.removeDependencies(sourceFiles.source[i]);
		// load all files with no dependencies
		if (sourceFiles.source[i].dependencies.length == 0){
		    if (sourceFiles.source[i].loaded) {
			// file already loaded
			continue;
		    } else if (typeof sourceFiles.source[i].file == "function"){
			// function - execute the function
			var funcName = sourceFiles.functionName(sourceFiles.source[i].file);
			if (funcName == "onload"){
			    // special function that has no body
			    var result = (document.readyState === "complete" || document.readyState === "interactive");
			} else {
			    var result = sourceFiles.source[i].file();
			}
			if (result !== false){
			    sourceFiles.source[i].loaded = true;
			    sourceFiles.onload({target: {src: sourceFiles.source[i].baseFile}});
			}
			continue;
		    }
		    // test if namespace specified and if already exists
		    if (sourceFiles.alreadyLoadedNs(sourceFiles.source[i].ns)) continue;
		    if (sourceFiles.loading.indexOf(sourceFiles.source[i].baseFile) !== -1) continue;
		    
		    var version = "";
		    if (sourceFiles.fileInfo.find(function(fileInfo){
			if (fileInfo.baseFile == sourceFiles.source[i].baseFile){
			    version = '.' + fileInfo.time + '.';
			    return true;
			}
			})) {
			// keep baseFile the same - change the full filename with version
			// replaces my.file.js with my.file.123456.js where 123456 is the file timestamp
			sourceFiles.source[i].file = sourceFiles.source[i].file.replace(/\.(?!.*?\.)/, version);
		    }
		    // flag loading file
		    sourceFiles.loading.push(sourceFiles.source[i].baseFile);

		    // file - load the source file
		    loadSourceFile(sourceFiles.source[i].file, sourceFiles.source[i].type, sourceFiles.onload)
		}
	    }
	},
	alreadyLoadedNs: function(ns){
	    // test if namespace specified and if already exists
	    if (typeof ns == "undefined") return false;
	    var exists = true;
	    var path = ns.split(".");
	    for (var j = 0; j < path.length; j++){
		if (typeof $msRoot[path[j]] == "undefined"){
		    // namespace not yet created
		    return false;
		}
	    }
	    // namespace exists
	    return true;
	},
	onload: function(e){
	    // flag file as loaded
	    var baseFile = e.target.src.substr(e.target.src.lastIndexOf("/") + 1);
	    var split = baseFile.split("?");
	    baseFile = split[0];
	    // remove the version timestamp from the filename
	    baseFile = baseFile.replace(/(.+)\.([0-9])+\.(js|css|php|jpg|gif|png)$/, "$1.$3");
	    for (var i = 0; i < sourceFiles.source.length; i++){
		if (sourceFiles.source[i].baseFile == baseFile){
		    sourceFiles.source[i].loaded = true;
		    if (sourceFiles.source[i].onload){
			// custom onLoad
			sourceFiles.source[i].onload();
		    }
		    break;
		}
	    }
	    sourceFiles.load();
	},
	removeDependencies: function(source){
	    if (!source.loaded){
		for (var j = source.dependencies.length - 1; j >=0; j--){
		    // test if namespace specified and if already exists
		    if (typeof source.dependencies[j].ns !== "undefined" && sourceFiles.alreadyLoadedNs(source.dependencies[j].ns)){
			// loaded - remove the dependencey
			source.dependencies.splice(j, 1);
			continue;
		    }
		    for (var k = 0; k < sourceFiles.source.length; k++){
			var source2 = sourceFiles.source[k];
			if (source2.baseFile == source.dependencies[j].baseFile){
			    // found the dependency
			    if (source2.loaded){
				// loaded - remove the dependencey
				source.dependencies.splice(j, 1);
			    }
			    break;
			}
		    }
		}
	    }
	},
	versionChecking: function(path){
	    // poll server for file times for specified directories
	    if (!Array.isArray(path)){
		path = [path];
	    }
	    sourceFiles.versionCheck.push({});	    
	    var versionCheck = sourceFiles.versionCheck[sourceFiles.versionCheck.length - 1]	    
	    versionCheck.id = sourceFiles.versionCheck.length;
	    versionCheck.timeStamp = Date.now();
	    versionCheck.complete = false
	    versionCheck.path = path;
	    var url = sourceFiles.buildUrlPath("site") + "/moddate.php";
	    var data = {path: path};
	    data = JSON.stringify(data);
	    var http = new XMLHttpRequest();
	    var params = "id=moddate-js&url=" + url + "&otherData=" + data;
	    http.open("POST", url, true);

	    //Send the proper header information along with the request
	    http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

	    http.onreadystatechange = function() {//Call a function when the state changes.
		if(http.readyState == 4 && http.status == 200) {
		    var response = http.responseText;
		    var data = JSON.parse(response);
		    var error = false;
		    if (typeof data !== "object" || !data.status){
			console.log("Invalid version checking response: " + response);
			error = true;
		    } else if (data.status.toLowerCase().indexOf("error") !== -1){
			console.log(data.status);
			error = true;
		    } else if (data.status.toLowerCase().indexOf("success") == -1){
			console.log("Unknown response (missing success): " + response);
			error = true;
		    }
		    if (!error){
			console.log("Version information loaded");
			sourceFiles.fileInfo = sourceFiles.fileInfo.concat(data.result);
		    }
		    // if there was an error, will load files without version info
		    versionCheck.complete = true;
		    sourceFiles.load();
		}
	    }
	    http.send(params);
	},
	functionName: function(func){
	    // ^function	starts with the function keyword
	    // \s+		any number of spaces
	    // (?:bound\s*)	non capturing group - optionally match the word bound with any number of trailing spaces
	    // ([^\(\s]+)	capture one or more character not in the set => left parenthesis, white space
	    //			anoymous functions will return null
	    //			bound functions will return the function name without the keyword bound
	    //			an anonymous bound function will return the function name `bound`
	    if (typeof func == "function"){
		func = func.toString();
	    }
	    var result = /^function\s+(?:bound\s*)?([^\(\s]+)/.exec(func);
	    return result ? result[1] : "";
	},
	buildUrlPath: function(baseDir, type){
	    baseDir = baseDir || type || "";
	    var urlDir = function(_baseDir){
		if (_baseDir.indexOf("/") !== -1){
		    // specified path - relative to current path
		    // to use relative to different path, use one of the flags below
		    return _baseDir;
		} else if (_baseDir.indexOf("js") !== -1){
		    return "STATIC_JS_COMMON";
		} else if (_baseDir.indexOf("css") !== -1){
		    return "STATIC_CSS_COMMON";
		} else if (_baseDir.indexOf("img") !== -1){
		    return "STATIC_IMG_COMMON";
		} else if (_baseDir.indexOf("static-site") !== -1){
		    // cookieless domain
		    return "STATIC_SITE_ROOT";
		} else if (_baseDir.indexOf("site") !== -1){
		    // cookied domain
		    return "LINK_SITE_ROOT";
		} else if (_baseDir.indexOf("root") !== -1 || _baseDir == ""){
		    // root of server at top of domain tree
		    return "STATIC_TOP_ROOT";
		} else {
		    // invalid - unless new namespace property added to match
		    return _baseDir;
		}
	    }(baseDir);
	    
	    if (typeof $ms[urlDir] !== "undefined"){
		// standard diredctory stored in namespace variable
		if ($ms[urlDir] == ""){
		    // default url is empty - use the current directory
		    return sourceFiles.currentDir();
		}
		// return defined directory
		return $ms[urlDir];
	    } else {
		// return current directlry plus whatever was passed 
		return sourceFiles.currentDir() + urlDir;
	    }
	},
	currentDir: function(){
	    var root = window.location.origin ? window.location.origin : window.location.protocol + '//' + window.location.host;
	    var pathname = window.location.pathname;
	    var path = pathname.substring(0, pathname.lastIndexOf('/'))
	    return root + path;
	}
    }

    // dynamically load a js or css file
    function loadSourceFile(filename, filetype, onloadFn, id) {
	if (typeof filetype == "undefined") {
	    filetype = filename.substr(filename.lastIndexOf('.') + 1)
	}
	if (filetype == "js") {
	    // load js file
	    var item = document.createElement('script');
	    item.type = "text/javascript";
	    item.src = filename;
	} else if (filetype == "css") {
	    //load CSS file
	    var item = document.createElement("link");
	    item.rel = "stylesheet";
	    item.type = "text/css";
	    item.href = filename;
	} else if (filetype == "img") {
	    // preloading images
	    var item = document.createElement("img");
	    item.style.display = "none";
	    item.src = filename;
	}
	if (typeof onloadFn !== "undefined") {
	    item.onload = onloadFn;
	}
	if (typeof id !== "undefined") {
	    item.id = id;
	}	
	if (typeof item != "undefined") {
	    if (filetype == "img"){
		try {
		    document.body.appendChild(item);
		} catch (e){
		    console.log("Error loading Image file: " + filename);
		}
	    } else {
		document.head.appendChild(item);
	    }
	} 
    }

    // dynamically remove a js or css file
    function removeSourceFile(filename, filetype) {
	var tag = (filetype == "js") ? "script" : (filetype == "css") ? "link" : "none";
	var attr = (filetype == "js") ? "src" : (filetype == "css") ? "href" : "none";
	var elements = document.getElementsByTagName(tag);
	for (var i = elements.length; i >= 0; i--) {
	    // when removing, go backwards
	    if (elements[i] && elements[i].getAttribute(attr) !== null && elements[i].getAttribute(attr).indexOf(filename) != -1) {
		elements[i].parentNode.removeChild(elements[i]);
	    }
	}
    }

    function detectButton(e) {
	var button;
	e = e || window.event;
	if (e.which == null) {
	    button = (e.button < 2) ? 'left' :
		    ((e.button == 4) ? 'middle' : 'right');
	} else {
	    button = (e.which < 2) ? 'left' :
		    ((e.which == 2) ? 'middle' : 'right');
	}
	return button;
    }

    // case insensitve array search for value
    function arraySearch(value, array, property) {
	var str = value.toString().toLowerCase().trim();
	for (var i = 0; i < array.length; i++) {
	    if (typeof property !== "undefined") {
		if (array[i][property].toString().toLowerCase().trim() == str) {
		    // object array with properties
		    return i;
		}
	    } else if (array[i].toString().toLowerCase().trim() == str) {
		// simple string array
		return i;
	    }
	}
	return false;
    }

    function toTitleCase(str) {
	return str.replace(/\w\S*/g, function (txt) {
	    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
	});
    }

    /*
     * 
     * getOffset()
     * get cumulative offest of element
     * offsetParent is the container - so will recurse
     * clientLeft & clientTop => width of the border (5)
     * scrollLeft & scrollTop => # pixels that an element's content is scrolled to the left = 0
     * offsetLeft & offsetTop => # pixels left / top corner is offset within the Parent 
     * 
     * This calculates the postion of the element (CONTAINER) TOP & LEFT relative to ALL parents
     * including accounting for its own border (top & left after borders added)
     */
    function getOffset(element) {
	// get cumulative offset
	/*
	 var posX = 0, posY = 0;
	 while (element) {
	 if (element.offsetLeft || element.offsetLeft === 0){
	 posX += element.offsetLeft - element.scrollLeft;
	 posY += element.offsetTop - element.scrollTop;
	 }
	 element = element.offsetParent;
	 }
	 */
	//rectangle's (top, left, bottom, and right) change their values every time the scrolling position changes 
	//(because their values are relative to the viewport and not absolute). 
	//If you need the bounding rectangle relative to the top-left corner of the document, 
	//just add the current scrolling position to the top and left properties 
	//(these can be obtained using window.scrollX and window.scrollY) 
	var rect = element.getBoundingClientRect();
	var posX = rect.left + window.pageXOffset;	    // window.scrollX;
	var posY = rect.top + window.pageYOffset;	    //window.scrollY;	

	return {x: posX, y: posY, left: posX, top: posY, width: rect.width, height: rect.height};
    }

    /*
     * see Magnifier.prototype.getPosition for how to use this
     function gettranslate(target){
     var xTranslate = 0;
     var yTranslate = 0;
     var computedStyle = window.getComputedStyle(target, null); // "null" means this is not a pesudo style.
     var matrixString = computedStyle.getPropertyValue('transform')
     || computedStyle.getPropertyValue('-moz-transform')
     || computedStyle.getPropertyValue('-webkit-transform')
     || computedStyle.getPropertyValue('-ms-transform')
     || computedStyle.getPropertyValue('-o-transform');
     try{
     if (typeof matrixString !== "undefined" && matrixString !== "none" ){
     var matrix = matrixString
     .split('(')[1]
     .split(')')[0]
     .split(',')
     .map(parseFloat);
     
     if (matrix.length >= 6){
     xTranslate = matrix[4];
     yTranslate = matrix[5];
     }
     }
     } catch(err){
     console.log("Matrix invalid: " + matrixString);
     }
     return ({ x: xTranslate, y: yTranslate });
     }
     */
    // returns a property of an element - even if style not set
    // only useful for positioning and dimension properties
    function getPropertyValue(element, property, options) {
	//var value1 = element.style[property];
	//var value2 = outerHeight(element);
	//    v("getComputedStyle: " + value, "style: " + value1, "outerHeight: " + value2);

	var value;
	if (typeof options == "undefined") {
	    // computedStyle => forces getting of computed style
	    // e.g. style.height and style.width may be set to a value smaller than actual height / width
	    // getComputedStyle will return the actual
	    options = {};
	}
	if (!options.getComputedStyle) {
	    value = element.style[property];
	}
	if (isNaN(parseFloat(value))) {
	    var value = getComputedStyle(element).getPropertyValue(property);
	}

	if (isNaN(parseFloat(value)) && (property == "left" || property == "top")) {
	    // when property is set to auto - get left/top position from nearest parent
	    var e2 = element;
	    while (isNaN(parseFloat(value))) {
		if (e2.offsetParent.nodeName !== "TD") {
		    // offsetParent is the closest positioned containing element
		    // If the element is non-positioned, the nearest table cell or root element is used - ignore TD element and go up to the table

		    // the Left or Top of an element is equal to the offsetParent LEFT + offsetLeft (the offset of the element from the offsetParent)
		    var parentLeft = parseFloat(getPropertyValue(e2.offsetParent, property));
		    // v("getPropertyValue", e2.id, e2.offsetParent.id, "parentLeft: " + parentLeft,  "offsetLeft: " + e2.offsetLeft);
		    value = parentLeft + e2.offsetLeft;
		}
		e2 = e2.parentNode;
	    }
	}

	// if cannot calculate based on styles - use getBoundingClientRect
	// Top and Left will be relative to viewport
	if (isNaN(parseFloat(value))) {
	    // get values relative to the viewport
	    // use (+ window.scrollX) to get relative to the document 
	    var rect = element.getBoundingClientRect();
	    if (typeof rect.property !== "undefined") {
		value = rect[property] + "px";
	    }
	}
	return value;
    }

    function cloneSettings(defaultSettings, passedSettings) {
	// classes have a defaultSettings object and are passed a settings object
	// merge the two with passedSettings overwritting the default
	var thisSettings = {};
	for (var setting in defaultSettings) {
	    if (defaultSettings.hasOwnProperty(setting))
		thisSettings[setting] = defaultSettings[setting];
	}
	if (typeof passedSettings !== "undefined") {
	    // only overwrite those settings which are set
	    for (var setting in passedSettings) {
		if (passedSettings.hasOwnProperty(setting)) {
		    thisSettings[setting] = passedSettings[setting];
		}
	    }
	}
	return thisSettings;
    }

    /* font scaling
     *	    adjust a container div's font-size based on the current body size
     *	    targetPercent is the what the tool div would be set to if body font-size was set to 100%
     *	    At body {font-size: 100%} the following should generate a div that is 511 px wide
     *	    Return the percent the div needs to be set to match the target percent
     */
    function targetFontSize(targetPercent, node) {
	var _100PercentWidthPx = 511;
	var test = document.createElement("div");
	test.style.visibility = "hidden";
	test.style.position = "absolute";
	test.style.height = "auto";
	test.style.width = "auto";
	test.style.whiteSpace = "nowrap";
	test.innerHTML = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
	if (!node){
	    node = document.body
	} else {
	    var hidden = hasClass(node, "visibility-hidden");
	    addClass(node, "visibility-hidden");
	    addClass(node, "display-block");
	}
	node.appendChild(test);
	// document.body.appendChild(test);
	var height = (test.clientHeight + 1);
	var width = (test.clientWidth + 1);

	if (width == 0) {
	    console.log("Testing Font: width = 0");
	    return;
	}
	var targetWidthPx = (targetPercent / 100) * _100PercentWidthPx;
	var adjustPercent = targetWidthPx / width;
	//v("font-size orig: Height: " + height, "Width: " + width, "Adjust: " + adjustPercent);

	var fontSize = parseInt((adjustPercent * 100)) + "%"
	test.style.fontSize = fontSize;
	var height = (test.clientHeight + 1);
	var width = (test.clientWidth + 1);

	node.removeChild(test);
	removeClass(node, "display-block");
	if (!hidden){
	    removeClass(node, "visibility-hidden");
	}
	return (fontSize);
    }
    function copyToClipboard(text) {
	if (window.clipboardData && window.clipboardData.setData) {
	    // IE specific code path to prevent textarea being shown while dialog is visible.
	    return clipboardData.setData("Text", text);

	} else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
	    var textarea = document.createElement("textarea");
	    textarea.textContent = text;
	    textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in MS Edge.
	    document.body.appendChild(textarea);
	    textarea.select();
	    try {
		return document.execCommand("copy");  // Security exception may be thrown by some browsers.
	    } catch (ex) {
		console.warn("Copy to clipboard failed.", ex);
		return false;
	    } finally {
		document.body.removeChild(textarea);
	    }
	}
    }
    // gets the inner dimensions of an element minus padding and border
    function innerSize(element) {
	var rect = element.getBoundingClientRect();
	var width = parseInt(rect.width);
	var height = parseInt(rect.height);
	var style = getComputedStyle(element);
	var borderWidth = parseInt(style.borderLeftWidth) + parseInt(style.borderRightWidth);
	var borderHeight = parseInt(style.borderTopWidth) + parseInt(style.borderBottomWidth);
	var paddingLeft = parseInt(style.paddingLeft) || 0;
	var paddingRight = parseInt(style.paddingLeft) || 0;
	var paddingTop = parseInt(style.paddingTop) || 0;
	var paddingBottom = parseInt(style.paddingBottom) || 0;

	if (getIEVersion() > 0) {
	    // IE: width = width of content + border + padding
	    var innerWidth = width;
	    var innerHeight = height;
	    var ieBorderWidth = borderWidth;
	    var ieBorderHeight = borderHeight;
	    var ffBorderWidth = 0;
	    var ffBorderHeight = 0;
	} else {
	    // FF, Chrome, etc.
	    var innerWidth = width - paddingRight - paddingLeft - borderWidth;
	    var innerHeight = height - paddingTop - paddingBottom - borderHeight;
	    var ieBorderWidth = 0;
	    var ieBorderHeight = 0;
	    var ffBorderWidth = borderWidth;
	    var ffBorderHeight = borderHeight;
	    var ffPaddingWidth = paddingRight - paddingLeft;
	    var ffPaddingHeight = paddingTop - paddingBottom;
	}
	return {x: innerWidth, y: innerHeight,
	    width: innerWidth, height: innerHeight,
	    ieBorder: {x: ieBorderWidth, y: ieBorderHeight},
	    ffBorder: {x: ffBorderWidth, y: ffBorderHeight},
	    ffPadding: {x: ffPaddingWidth, y: ffPaddingHeight}};
    }
    function getIEVersion() {
	var sAgent = window.navigator.userAgent;
	var Idx = sAgent.indexOf("MSIE");

	// If IE, return version number.
	if (Idx > 0)
	    return parseInt(sAgent.substring(Idx + 5, sAgent.indexOf(".", Idx)));

	// If IE 11 then look for Updated user agent string.
	else if (!!navigator.userAgent.match(/Trident\/7\./))
	    return 11;

	else
	    return 0; //It is not IE
    }
    function scrollIntoView(element) {
	var parent = element.parentNode;
	var scrollbarHeight = 0;
	while (parent instanceof HTMLElement) {
	    if ($ms.hasVerticalScroll(parent)){
		break
	    }
	    parent = parent.parentNode;
	}
	if (!parent){
	    return
	}
	if ($ms.hasHorizontalScroll(parent)){
	    scrollbarHeight = $ms.getScrollBarSize();
	}

	// bottom most position needed for viewing
	var borderHeight = (parent.offsetHeight - parent.clientHeight) / 2
	var bottom = (parent.scrollTop + (parent.offsetHeight - borderHeight - scrollbarHeight) - element.offsetHeight);
	// top most position needed for viewing
	var top = parent.scrollTop + borderHeight ;
	if (element.offsetTop <= top){
	    // move to top position if above it
	    // use algebra to subtract fudge from both sides to solve for parent.scrollTop
	    parent.scrollTop = element.offsetTop - borderHeight;
	} else if (element.offsetTop >= bottom) {
	    // move to bottom position if below it
	    // use algebra to subtract ((parent.offsetHeight - fudge) - element.offsetHeight) from both sides to solve for parent.scrollTop
	    parent.scrollTop = element.offsetTop - ((parent.offsetHeight - borderHeight - scrollbarHeight) - element.offsetHeight) ;
	}
    }
    function getScrollBarSize () {
      var inner = document.createElement('p');
      inner.style.width = "100%";
      inner.style.height = "200px";

      var outer = document.createElement('div');
      outer.style.position = "absolute";
      outer.style.top = "0px";
      outer.style.left = "0px";
      outer.style.visibility = "hidden";
      outer.style.width = "200px";
      outer.style.height = "150px";
      outer.style.overflow = "hidden";
      outer.appendChild (inner);

      document.body.appendChild (outer);
      var w1 = inner.offsetWidth;
      outer.style.overflow = 'scroll';
      var w2 = inner.offsetWidth;
      if (w1 == w2) w2 = outer.clientWidth;

      document.body.removeChild (outer);
      return (w1 - w2);
    };    
    function vendorPrefix() {
      var styles = window.getComputedStyle(document.documentElement, ''),
	pre = (Array.prototype.slice
	  .call(styles)
	  .join('') 
	  .match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
	)[1],
	dom = ('WebKit|Moz|MS|O').match(new RegExp('(' + pre + ')', 'i'))[1];
      return {
	dom: dom,
	lowercase: pre,
	css: '-' + pre + '-',
	js: pre[0].toUpperCase() + pre.substr(1)
      };
    }
   // usage: var linearGradientName = vendorFunctionName("background", "linear-gradient", "(to top, black, white)");
    function vendorFunctionPrefix(property, name, argStringNoPrefix, argStringPrefix) {
	var prefixes = ["", "-webkit-", "-moz-", "-ms-", "-o-"];
	var tempDiv = document.createElement("div");
	var value;
	if (typeof argStringPrefix == "undefined"){
	    argStringPrefix = argStringNoPrefix;
	}
	if (typeof name == "string"){
	    for (var i = 0; i < prefixes.length; ++i) {
		if (i == 0) {
		    // if the argument string differs with and without the prefix, test first the NoPrefix
		    value = prefixes[i] + name + argStringNoPrefix;
		} else {
		    value = prefixes[i] + name + argStringPrefix;
		}
		tempDiv.style[property] = value;
		if (tempDiv.style[property] != "")
		    return prefixes[i];
	    }
	} else {
	    // if name of the fn is not consistent across vendors
	    for (var i = 0; i < name.length; ++i) {
		if (i == 0) {
		    value = name[i] + argStringNoPrefix;
		} else {
		    value = name[i] + argStringPrefix;
		}
		tempDiv.style[property] = value;
		if (tempDiv.style[property] != "")
		    return name[i];
	    }
	}
	return null;
    }
    function ie9OrBelow(){
	var div = document.createElement("div");
	div.innerHTML = "<!--[if lte IE 9]><i></i><![endif]-->";
	var isIe9orBelow = (div.getElementsByTagName("i").length == 1);
	return isIe9orBelow;
    }
    function ie8OrBelow(){
	var div = document.createElement("div");
	div.innerHTML = "<!--[if lte IE 8]><i></i><![endif]-->";
	var isIe8orBelow = (div.getElementsByTagName("i").length == 1);
	return isIe8orBelow;
    }
    // ie 10+
    function setOnLoad(element, listener){
	if (!element) return;
	if (animationSupported()){
	    element.addEventListener('animationstart', listener, false);
	    element.addEventListener('MSAnimationStart', listener, false);
	    element.addEventListener('webkitAnimationStart', listener, false);
	    $ms.addClass(element, "ms-onload");
	} else {
	    // ie 9 - test for element loaded via setInterval
	    if (element.id.length == 0){
		// must have an id
		element.id = element.nodeName + randomNumber(10000, 99999);
	    }
	    var interval = setInterval(function(){
		if ($ms.$(element.id)){
		    // added to the DOM, it is loaded
		    clearInterval(interval);
		    listener({animationName: "ms-onload"});
		}
	    }, 100);
	}
    }
    function removeOnLoad(element, listener){
	if (!element) return;
	element.removeEventListener('animationstart', listener, false);
	element.removeEventListener('MSAnimationStart', listener, false);
	element.removeEventListener('webkitAnimationStart', listener, false);
	$ms.removeClass(element, "ms-onload");
    }
    function animationSupported(){
	var animation = false,
	    animationstring = 'animation',
	    keyframeprefix = '',
	    domPrefixes = 'Webkit Moz O ms Khtml'.split(' '),
	    pfx  = '',
	    elm = document.createElement('div');

	if( elm.style.animationName !== undefined ) { animation = true; }    

	if( animation === false ) {
	  for( var i = 0; i < domPrefixes.length; i++ ) {
	    if( elm.style[ domPrefixes[i] + 'AnimationName' ] !== undefined ) {
	      pfx = domPrefixes[ i ];
	      animationstring = pfx + 'Animation';
	      keyframeprefix = '-' + pfx.toLowerCase() + '-';
	      animation = true;
	      break;
	    }
	  }
	}	
    }

    
    /* create combobox - a "select" object with options
     * options		=> list of options to be displayed in the combo
     * settings		=> all the user settings:
     *	select		=> existing select element 
     *	cbOptions	=> a callback fn to populate the options after created
     *	inputId		=> the select input id - required with the callback fn so can populate
     *	propName	=> optional - if "font-family" will show the options in corresponding font face
     *	onchange
     *	defaultValue
    */
    function createCombo(options, settings){
	var select;
	if (typeof settings !== "undefined"){
	    if (typeof settings.select !== "undefined"){
		// existing select element passed
		select = settings.select;
	    } else {
		select = document.createElement("select");
	    }
	    if (typeof settings.onchange !== "undefined"){
		select.onchange = settings.onchange;
	    }
	    if (typeof settings.defaultValue !== "undefined" && settings.defaultValue < options.length){
		select.selectedIndex = settings.defaultValue;
	    }
	}
	if (typeof select == "undefined"){
	    select = document.createElement("select");
	}
	if (typeof options == "undefined"){
	    options = [];
	    if (typeof settings !== "undefined" && typeof settings.cbOptions !== "undefined"){
		// options can be loaded after the fact from query callback
		// passing the inputId to the callback will populate the input with the options
		if (typeof settings.inputId == "undefined") settings.inputId = undefined;
		options = settings.cbOptions(settings.inputId);
		if (typeof options !== "object"){
		    options = [];
		}
	    }
	}
	for (var i = 0; i < options.length; i++){
	    var option = document.createElement("option");
	    if (typeof options[i].value == "undefined") {
		if (typeof options[i].label !== "undefined") {
		    options[i].value = options[i].label;
		} else if (typeof options[i].text !== "undefined") {
		    options[i].value = options[i].text;
		}
	    }	
	    option.value = options[i].value;

	    // allow passing options text property as either "text" or "label"
	    if (typeof settings !== "undefined" && typeof settings.propName !== "undefined") {
		// when displaying a list of fonts, show the fonts in their own fontface
		if (settings.propName.indexOf("font-family") !== -1){
		    option.innerHTML = "<span style='font-family:" + options[i].label + "'>" + options[i].label + "</>";
		} else if (typeof options[i].label !== "undefined") {
		    option.text = options[i].label;
		} else if (typeof options[i].name !== "undefined") {
		    option.text = options[i].name;
		}	    
	    } else if (typeof options[i].label !== "undefined") {
		option.text = options[i].label;
	    } else if (typeof options[i].text !== "undefined") {
		option.text = options[i].text;
	    } else {
		option.text = options[i].value;
	    }
	    if (options[i].hasOwnProperty("tooltip")){
		option.title = options[i].tooltip;
	    }
	    select.appendChild(option);
	}
	return select;
     }

    // create combobox - select object with options
    function createListboxCombo(_this, options, prop){
	var lbCombo = new listboxCombo(prop.inputId, prop.listComboSettings);
	lbCombo.type = "combo";
	lbCombo.options = options;
	lbCombo.prop = prop;
	lbCombo.columns = prop.columns;
	lbCombo.columnWidth = prop.columnWidth;
	lbCombo.columnType = prop.columnType;
	lbCombo.columnGap = prop.columnGap;
	if(prop.parentClass){
	    lbCombo.parentClass = prop.parentClass;
	}
	if (typeof prop.listComboSettings !== "undefined"){
	    lbCombo.settings = prop.listComboSettings;
	}
	lbCombo.init();
	return lbCombo;
     }

    // create combobox - select object with options
    function createEditableCombo(options, settings){
	var combo = new $msRoot.EditableCombo(options, settings);
	return combo;
     }


    // create slider 
    function createSliderInput (_this, prop, element){
	var min = 0;
	var max = 100;
	var snapX = 1;
	var defaultUnit = "px"
	var units;

	if (typeof prop.slider.min !== "undefined"){
	    min = prop.slider.min;
	}
	if (typeof prop.slider.max !== "undefined"){
	    max = prop.slider.max;
	}
	if (typeof prop.slider.snapX !== "undefined"){
	    snapX = prop.slider.snapX;
	}
	max = max * snapX;
	min = min * snapX;

	if (typeof prop.slider.units !== "undefined"){
	    // default units if element not set
	    defaultUnit = prop.slider.units;
	}
	// there are 5px between bar slider and input
	var input = document.createElement('input');
	input.style.width = prop.inputWidth + "px";
	prop.scale = 1;
	if (prop.units){
	    // get the current unit from the property of the element - default to px
	    units = splitUnit(element.style[prop.name]).unit || defaultUnit;
	    prop.scale = _this.propUnitsScale(units);
	    var unitCombo = createCombo(_this, prop.units);
	    unitCombo.id = prop.inputId + "-units";
	    unitCombo.className = "ms-slider-units";
	    unitCombo.onchange = function(){
		var oldUnit = splitUnit(element.style[prop.name]).unit || defaultUnit;
		var convert = convertUnits(input.value + oldUnit, unitCombo.value);
		input.value = convert.numeric;
		prop.scale = _this.propUnitsScale(unitCombo.value);
		// fire event for slider to recalc
		input.onchange();
		// fire event to update the source
		pslider.onValuesChanged();
	    };
	}

	// next line
	var sliderContainer = document.createElement('div')
	sliderContainer.className = "ms-slider-bar-container";
	var bar = document.createElement('div')
	bar.id = "ms-slider-bar-" + ++_this.itemCounter;
	bar.className = "ms-slider-bar";
	bar.style.width = prop.slider.sliderWidth + "px";
	sliderContainer.appendChild(bar);

	// attach color slider
	// target is the control to hold the color values
	var pslider = new $msRoot.Slider(bar, {xMinValue: 1, xMaxValue: max, yMinValue: 1, yMaxValue: 1, arrowImage: $ms.STATIC_IMG_COMMON + '/slider.gif', 
	    container: sliderContainer, direction: "horizontal", target: prop.inputId, snapX: snapX, parentClass: _this});

	pslider.onValuesChanged = function () {
	    var text = input;	
	    text.value = Math.round((Math.round(pslider.xValue / pslider.settings.snapX) * pslider.settings.snapX) / pslider.settings.snapX);
	    text.value = text.value / prop.scale;
	    if (typeof prop.units == "undefined" && typeof prop.slider.units !== "undefined"){
		// if there is not a separate units combobox
		// and the units are defined with the slider	    
		text.value += prop.slider.units;
	    }
	    _this.updateSource(element, prop, input);
	};

	input.onchange = function(){
	    if (input.value == ""){
		// will unset property
		pslider.xValue = 0;
		pslider.setArrowPositionFromValues();
	    } else {
		var value = (input.value * 1) || 0;
		value = value * prop.scale;
		// adjust xValue with snapX setting
		// pslider.settings.xMaxValue = pslider.settings.xMaxValue / prop.scale;	    
		pslider.xValue = Math.round((value * prop.slider.slider.settings.snapX) / prop.slider.slider.settings.snapX) * prop.slider.slider.settings.snapX;
		pslider.setArrowPositionFromValues();
	    }
	};

	return {input: input, sliderContainer: sliderContainer, slider: pslider, units: unitCombo};
     }

    function createLabel(settings){
	var label = document.createElement('label')
	if (typeof settings.id !== "undefined"){
	    label.id = settings.id;
	}
	if (typeof settings.inputId !== "undefined"){
	    label.htmlFor = settings.inputId;
	}
	if (typeof settings.className !== "undefined"){
	    label.className = settings.className;
	}
	if (typeof settings.labelText == "undefined"){
	    settings.labelText = "";
	}
	label.appendChild(document.createTextNode(settings.labelText));
	return label;
    }

    function createCheckbox(settings){
	var input = document.createElement('input');
	input.type = "checkbox";
	input.id = settings.id;
	input.style.verticalAlign = "middle";
	input.className = "ms-checkbox";

	// space between checkbox and label    
	if (typeof settings.labelposition == "undefined"){
	    settings.labelposition = "right";
	}
	if (settings.labelposition == "left"){
	    input.style.marginLeft = "3px";
	} else {
	    input.style.marginRight = "3px";
	}
	if (typeof settings.className !== "undefined"){
	    input.className = settings.className;
	}
	if (typeof settings.value !== "undefined"){
	    input.value = settings.value;
	}
	if (typeof settings.checked !== "undefined"){
	    input.checked = settings.checked;
	}

	if (typeof settings.label == "undefined"){
	    settings.label = document.createElement("label");
	    if (typeof settings.labelText !== "undefined"){
		settings.label.innerText = settings.labelText;
	    }
	}
	settings.label.style.display = "inline-block";
	if (settings.labelposition == "right"){
	    // add the input first
	    // save the text:
	    var labeltext = settings.label.innerText;
	    settings.label.innerText = "";
	    settings.label.appendChild(input);
	    settings.label.appendChild(document.createTextNode(labeltext));
	} else {
	    // add the label first - already is 1st from createLabel
	    settings.label.appendChild(input);
	}   

	return input;
    }

    function createRadio(settings){		    
	var div = document.createElement('div');
	div.id = settings.id + "-radio";
	if (settings.includeLabel){
	    if (typeof settings.label == "undefined"){
		// label for the option group
		div.appendChild(settings.label);
	    } else if (settings.labelText !== "undefined"){
		settings.label = document.createElement("label");
		settings.label.innerText = settings.labelText;
		div.appendChild(settings.label);
	    }
	}    
	for (var i = 0; i < settings.options.length; i++){
	    var input = document.createElement('input');
	    input.type = "radio";
	    input.name = settings.id;
	    input.id = settings.id + "-" + i;
	    input.style.verticalAlign = "middle";
	    input.className = "d-item d-radio";
	    settings.options[i].input = input;

	    // settings which apply to all buttons
	    // space between radio button and label    
	    if (typeof settings.labelposition == "undefined"){
		settings.labelposition = "right";
	    }
	    if (settings.labelposition == "left"){
		input.style.marginLeft = "3px";
	    } else {
		input.style.marginRight = "3px";
	    }
	    if (typeof settings.className !== "undefined"){
		input.className = settings.className;
	    }

	    // settings which apply to individiual radio buttons
	    var label = document.createElement("label");
	    label.innerText = settings.options[i].label;
	    // each button has own line
	    label.style.display = "block";

	    if (!settings.options[i].hasOwnProperty("value")){
		settings.options[i].value = settings.options[i].label;
	    }	
	    if (typeof settings.defaultValue !== "undefined"){
		// the current value determines which radio button is checked
		if (settings.defaultValue == settings.options[i].value){
		    input.checked = true;
		}
	    }

	    // settings.label.htmlFor = input.id;
	    if (settings.labelposition == "right"){
		// add the input first
		// save the text:
		var labeltext = label.innerText;
		label.innerText = "";
		label.appendChild(input);
		label.appendChild(document.createTextNode(labeltext));
	    } else {
		// add the label first - already is 1st from createLabel
		label.appendChild(input);
	    }
	    div.appendChild(label);
	}
	return div;
    }

    function createTable(settings){
	var table = document.createElement('table');
	table.id = settings.id;
	table.className = "d-item d-table target";
	if (typeof settings.border !== "undefined"){
	    if (settings.border.length > 0){
		// if empty string set for border, don't set border
		table.style.border = "1px solid black";
	    }
	} else {
	    table.style.border = "1px solid black";
	}
	table.style.margin = "0";
	var rows = 1, cols = 3;
	if (typeof settings.rows !== "undefined"){
	    rows = settings.rows;
	}
	if (typeof settings.cols !== "undefined"){
	    cols = settings.cols;
	}

	// column settings use colgroup
	var colgroup = document.createElement('colgroup');
	table.appendChild(colgroup);
	for (var i=0; i< cols; i++){
	    var col = document.createElement('col');
	    col.id = "d-child-col-" + (++settings.counter);
	    col.className = "d-child d-col"
	    colgroup.appendChild(col);
	}

	for (var row = 0; row < rows; row++){
	    var tr = document.createElement('tr');
	    tr.id = "d-child-tr-" + (++settings.counter);
	    tr.className = "d-child d-tr target";
	    table.appendChild(tr);
	    for (var col = 0; col < cols; col++){
		var td = document.createElement('td');
		td.id = "d-child-td-" + (++settings.counter);
		td.className = "d-child d-td target resizable";
		td.style.border = "1px solid green";
		var div = document.createElement('div');
		div.id = "design-item-child-container-panel-div-" + (++settings.counter);
		div.className = "d-child d-table-cell-div target";
		if (settings.listener){
		    // add listener to the div for dropping items onto div
		    settings.listener.call(settings._this, div);
		}	    
		if (settings.sampletext){
		    div.innerHTML = "row: " + row + " column: " + col;
		}
		td.appendChild(div);
		tr.appendChild(td);
	    }
	}
	table.setAttribute("data-rows", rows);
	table.setAttribute("data-cols", cols);
	return table;
    }
    // get object with units
    function convertUnits (value, returnUnit, container){
	var baseline = 100;  // any number serves 
	var item;  // generic iterator

	var map = {  // list of all units and their identifying string
	    pixel : "px",
	    percent : "%",
	    inch : "in",
	    cm : "cm",
	    mm : "mm",
	    point : "pt",
	    pica : "pc",
	    em : "em",
	    ex : "ex"
	};

	var factors = {};  // holds ratios
	var units = {};  // holds calculated values

	var split = splitUnit(value);
	if (split == false){
	    return "";
	}
	var numeric = split.numeric;
	var unit = split.unit;

	var activeMap;  // a reference to the map key for the existing unit
	for(item in map){
	    if(map[item] == unit){
		activeMap = item;
		break;
	    }
	}
	if(!activeMap) { // if existing unit isn't in the map, throw an error
	    throw "Unit not found in map";
	}

	var singleUnit = false;  // return object (all units) or string (one unit)?
	if(returnUnit && (typeof returnUnit == "string")) {  // if user wants only one unit returned, delete other maps
	    for(item in map){
		if(map[item] == returnUnit){
		    singleUnit = item;
		    continue;
		} else if (item == activeMap) {
		    continue;
		}

		delete map[item];
	    }
	}

	var temp = document.createElement("div");  // create temporary element
	temp.style.overflow = "hidden";  // in case baseline is set too low
	temp.style.visibility = "hidden";  // no need to show it

	if (!container){
	    container = document.body;
	}
	container.appendChild(temp);    // insert it into the parent for em and ex  

	// baseline based on 1 px - since offsetWidth is in pixels
	for(item in map){  // set the style for each unit, then calculate it's relative value against the baseline
	    temp.style.width = baseline + map[item];
	    factors[item] = baseline / temp.offsetWidth;
	}

	for(item in map){  // use the ratios figured in the above loop to determine converted values
	    // round to 3 decimals
	    units[item] = {numeric: Math.round((numeric * (factors[item] / factors[activeMap])) * 1000) / 1000, units:map[item]};
	}

	container.removeChild(temp);  // clean up

	if(singleUnit !== false){  // if they just want one unit back
	    return units[singleUnit];
	}

	return units;  // returns the object with converted unit values...
    }
    /*
     * Split css value to number and unit
     * [0-9]+(\.[0-9]{1,2})?
     *
     * [0-9]+          # Must have one or more numbers.
     * (               # Begin optional group.
     *     \.          # The decimal point, . must be escaped, 
     *	               # or it is treated as "any character".
     *    [0-9]{1,2}   # One or two numbers.
     * )?              # End group, signify it's optional with ?
    */    
    function splitUnit (value){
	var numeric = value.match(/[0-9]+(\.[0-9]{1,2})?/);  // get the numeric component for integer => /\d+/
	if(numeric === null) {  // if match returns null, throw error...  use === so 0 values are accepted
	    return false;
	}
	numeric = numeric[0];  // get the string

	var unit = value.match(/\D+$/);  // get the existing unit
	unit = (unit == null) ? "px" : unit[0]; // if its not set, assume px - otherwise grab string
	return {numeric: numeric, unit: unit};
    }

    function getAbsoluteHeight (el) {
      // Get the DOM Node if you pass in a string
      el = (typeof el === 'string') ? document.querySelector(el) : el; 

      var styles = window.getComputedStyle(el);
      var margin = parseFloat(styles['marginTop']) +
		   parseFloat(styles['marginBottom']);

      return Math.ceil(el.offsetHeight + margin);
    }

    // get scroll bar dimensions
    function getScroll (){
	var doc = document.documentElement;
	var x = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
	var y = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);
	return {x: x, y: y};
    }

    function insertIntoTextarea (element, text) {
	var scrollPos = element.scrollTop;
	var caretPos = element.selectionStart;

	var front = (element.value).substring(0, caretPos);
	var back = (element.value).substring(element.selectionEnd, element.value.length);
	element.value = front + text + back;
	caretPos = caretPos + text.length;
	element.selectionStart = caretPos;
	element.selectionEnd = caretPos;
	element.focus();
	element.scrollTop = scrollPos;
    }

    function hasVerticalScroll(element){
	if (typeof element == "undefined" || element.nodeName == "#document"){
	    element = document.body;
	}
	var hasVScroll = element.scrollHeight > element.clientHeight;

	// Get the computed style of the body element
	var cStyle = element.currentStyle || window.getComputedStyle(element, "");

	// Check the overflow and overflowY properties for "auto" and "visible" values
	hasVScroll = cStyle.overflow == "scroll" 
	    || cStyle.overflowY == "scroll"
	    || (hasVScroll && cStyle.overflow == "visible" && element.nodeName == "BODY")
	    || (hasVScroll && cStyle.overflowY == "visible" && element.nodeName == "BODY")
	    || (hasVScroll && cStyle.overflow == "auto")
	    || (hasVScroll && cStyle.overflowY == "auto");     
	 return hasVScroll;
    }

    function hasHorizontalScroll(element){
	if (typeof element == "undefined" || element.nodeName == "#document"){
	    element = document.body;
	}
	var hasHScroll = element.scrollWidth > element.clientWidth;

	// Get the computed style of the body element
	var cStyle = element.currentStyle || window.getComputedStyle(element);

	// Check the overflow and overflowY properties for "auto" and "visible" values
	hasHScroll = cStyle.overflow == "scroll" 
	    || cStyle.overflowX == "scroll"
	    || (hasHScroll && cStyle.overflow == "visible" && element.nodeName == "BODY")
	    || (hasHScroll && cStyle.overflowX == "visible" && element.nodeName == "BODY")
	    || (hasHScroll && cStyle.overflow == "auto")
	    || (hasHScroll && cStyle.overflowX == "auto");

	 return hasHScroll;
    }
    function hoverBorder(e, element, settings){
	if (!element) {
	    return;
	}
	var size = $ms.innerSize(element);
	var overBorder = "";
	if (typeof settings == "undefined"){
	    settings = {allow: {right: true, bottom: true, left: false, top:false}};
	}
	if (typeof settings.allow.right == "undefined"){
	    settings.allow.right = true;
	}
	if (typeof settings.allow.bottom == "undefined"){
	    settings.allow.bottom = true;
	}
	// give 6 pixels of border to respond to resize
	if (settings.allow.right && parseInt(e.offsetX) >= parseInt(size.x - Math.max(6, size.ieBorder.x))) {
	    // over right border
	    addClass(element, "cursor-col-resize");
	    removeClass(element, "cursor-row-resize");
	    overBorder = "right"
	} else if (settings.allow.bottom && parseInt(e.offsetY) >= parseInt(size.y - Math.max(6, size.ieBorder.y))){
	    // over bottom border
	    addClass(element, "cursor-row-resize");
	    removeClass(element, "cursor-col-resize");
	    overBorder = "bottom";
	} else if (settings.allow.left && e.offsetX <= 6) {
	    // over left border
	    addClass(element, "cursor-col-resize");
	    removeClass(element, "cursor-row-resize");
	    overBorder = "left";
	} else if (settings.allow.top && e.offsetY <= 6) {
	    // over top border
	    addClass(element, "cursor-row-resize");
	    removeClass(element, "cursor-col-resize");
	    overBorder = "top";
	} else {
	    removeClass(element, "cursor-row-resize");
	    removeClass(element, "cursor-col-resize");
	}
	return overBorder;
    }

    function elementSize(element) {
	var style = getComputedStyle(element);	
	var paddingY = 0;
	var paddingX = 0;
	// content-box => width of an element does not include padding or borders
	// border-box => width of an element includes padding and borders
	/*
	if (style.getPropertyValue("box-sizing") == "content-box"){
	    paddingY = parseFloat(style.getPropertyValue('padding-top')) + parseFloat(style.getPropertyValue('padding-bottom'));
	    paddingX = parseFloat(style.getPropertyValue('padding-left')) + parseFloat(style.getPropertyValue('padding-right'));
	}
	*/
	var height = parseFloat(style.height) - paddingY;
	var width = parseFloat(style.width) - paddingX;
	if (isNaN(height) || isNaN(width)) {
	    var rect = element.getBoundingClientRect();
	    height = rect.height;
	    width = rect.width;
	    if (isNaN(height) || isNaN(width)) {
		// remove display-none 
		if (style.getPropertyValue("display") == "none") {
		    var hidden = hasClass(element, "visibility-hidden");
		    addClass(element, "visibility-hidden");
		    addClass(element, "display-block");
		    var left = element.style.left;
		    var top = element.style.top;
		    element.style.left = "-10000px";
		    element.style.top = "-10000px";
		    rect = element.getBoundingClientRect();
		    height = rect.height;
		    width = rect.width;
		    // restore
		    element.style.left = left;
		    element.style.top = top;
		    if (!hidden) {
			removeClass(element, "visibility-hidden");
		    }
		    removeClass(element, "display-block");
		}
	    } else if (height == 0 || width == 0) {
		if (height == 0) {
		    height = style.getPropertyValue("line-height");
		}
		if (width == 0) {
		}
	    }
	}
	return {height: height, width: width};
    }

    function setOrientation (orientation){
	var links = document.getElementsByTagName("link");
	if (orientation == "portrait"){
	    //document.getElementById('portrait-stylesheet').removeAttribute('disabled');
	    //document.getElementById('landscape-stylesheet').addAttribute('disabled');
	    document.getElementById('portrait-stylesheet').disabled == false;
	    document.getElementById('landscape-stylesheet').disabled == true;
	} else {
	    //document.getElementById('portrait-stylesheet').addAttribute('disabled');
	    //document.getElementById('landscape-stylesheet').removeAttribute('disabled');
	    document.getElementById('portrait-stylesheet').disabled == true;
	    document.getElementById('landscape-stylesheet').disabled == false;
	}
    }

    /*
     * Moves array element to the new index
     * Shifts all elements up before inserting
     * arraymove([0,1,2,3,4,5], 1, 4);   // 0,2,3,4,1,5
     */
    function arrayMove (array, oldIndex, newIndex) {
	if (newIndex >= array.length) {
	    var k = newIndex - array.length;
	    while ((k--) + 1) {
		this.push(undefined);
	    }
	}
	array.splice(newIndex, 0, array.splice(oldIndex, 1)[0]);
	return array;
    }

    /*
     * Moves array element to the new index
     * Inserts new element before the newIndex
     * arrayInsertBefore([0,1,2,3,4,5], 1, 4);   // 0,2,3,1,4,5
     * arrayInsertBefore([0,1,2,3,4,5], 1, 6);   // 0,2,3,4,5,1
     */
    function arrayInsertBefore (array, fromIndex, beforeIndex) {
	if (fromIndex < beforeIndex){
	    // will delete fromIndex first and shift down all above it
	    // then beforeIndex needs to shift down as well to insert before it
	    array.splice(beforeIndex - 1, 0, array.splice(fromIndex, 1)[0]);
	} else {
	    array.splice(beforeIndex, 0, array.splice(fromIndex, 1)[0]);
	}
	return array;
    }

    // hide or show element
    function display (element, show){
	if (typeof show == "undefined"){
	    show = true;
	}
	if (show) {
	    removeClass(element, "display-none");
	    addClass(element, "display-none-off")    
	} else {
	    removeClass(element, "display-none-off")    
	    addClass(element, "display-none");
	}
    }

    function formatDate (milliseconds, format){
	var time = new Date(milliseconds);
	// time.setSeconds(milliseconds);    
	var year = time.getFullYear();
	var month= ("0" + (time.getMonth()+1)).slice(-2);
	var date = ("0" + time.getDate()).slice(-2);
	var hours = ("0" + time.getHours()).slice(-2);
	var minutes = ("0" + time.getMinutes()).slice(-2);
	var seconds = ("0" + time.getSeconds()).slice(-2);
	var day = time.getDay();
	var months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
	var dates = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
	var converted_date = "";

	switch(format){
	case "YYYY-MMM-DD DDD":
	    converted_date = year + "-" + months[parseInt(month)-1] + "-" + date + " " + dates[parseInt(day)];
	    break;
	case "YYYY-MM-DD":
	default:
	    converted_date = year + "-" + month + "-" + date;
	    break;
      }

      return converted_date;
    }

    function getColgroup (table){
	for (var i = 0; i < table.childNodes.length; i++){
	    if (table.childNodes[i].nodeName == "COLGROUP"){
		return table.childNodes[i];
	    }
	}
    }

    function getTbody (table){
	for (var i = 0; i < table.childNodes.length; i++){
	    if (table.childNodes[i].nodeName == "TBODY"){
		return table.childNodes[i];
	    }
	}
    }

    function createCloseButton  (idPrefix, callback){
	var div = document.createElement('div');
	div.id = idPrefix + "close-button";
	div.className = "ms-close-button";
	div.addEventListener("click", callback);
	return div;
    }
    function windowSize  (){
	var w = window,
	    d = document,
	    e = d.documentElement,
	    g = d.getElementsByTagName('body')[0],
	    x = w.innerWidth || e.clientWidth || g.clientWidth,
	    y = w.innerHeight|| e.clientHeight|| g.clientHeight;
	return {x: x, y: y};
    }
    // scale for units
    function propUnitsScale(units){
       switch(units) {
	   case "%":
	   case "pt":
	   case "px":
	       return 1;
	       break;
	   case "in":
	       return 100;
	       break;
	   case "pc":
	   case "em":
	       return 10;
	       break;
	   default:
	       return 1;
       }
    }
    function createColorPickerInput(passedSettings){
	var defaultSettings = {
	    colorPicker: undefined,	// reference to the created tool
	    gradient: undefined,	// reference to the created tool
	    startColor: "",		// for colorpicker
	    startGradient: "",		// for gradient
	    parentNode: document.body,
	    divClassName: "",
	    input: undefined,
	    inputClassName: "",
	    inputWidth: "100px",
	    inputHeight: undefined,
	    cbClose: undefined,
	    cbChange: undefined,
	    cbCreate: undefined,
	    target: undefined,
	    source: undefined,
	    elementProperty: undefined,
	    openGradient: false,		// open gradient by default instead of colorpicker
	    tool: []			// the open tool(s) (colorpicker and / or gradient)
	}
	var settings = $ms.cloneSettings(defaultSettings, passedSettings);
	// display colorpicker with a button press
	var div = document.createElement("div");
	div.className = settings.divClassName;
	if (settings.input){
	    input = settings.input;
	} else {
	    var input = document.createElement('input');
	    // button is set to 16px in css .ms-button-tool
	    if (settings.inputWidth){
		input.style.width = parseInt(settings.inputWidth) - 16 + "px";
	    }
	    if (settings.inputHeight){
		input.style.height = parseInt(settings.inputHeight) + "px";
	    }
	}
	if (input.className){
	    input.className = settings.inputClassName;
	}
	div.appendChild(input);    
	if (!settings.parentNode){
	    settings.parentNode = document.body;  
	}
	settings.parentNode.appendChild(div);

	var buttonHeight = $ms.elementSize(input).height;
	var button = document.createElement("div");
	button.className = "ms-gradient-button ms-button-tool";
	button.style.height = buttonHeight + "px";
	button.style.lineHeight = buttonHeight + "px";
	button.innerHTML = "►";   // &#9658	
	button.style.verticalAlign = "top";

	div.appendChild(button);    
	settings.source = input;

	if (!settings.target){
	    settings.target = [];
	}
	// auto update the underlying element if any
	if (settings.element && settings.elementProperty) {
	    settings.target.push({element: settings.element, property: settings.elementProperty});
	}
	// auto update the input with selected color / gradient
	if (settings.gradient){
	    settings.target.push({element: input, property: "background", valueAttribute: "value", textColor: "contrast"})
	} else {
	    settings.target.push({element: input, property: "backgroundColor", valueAttribute: "value", textColor: "contrast"})
	}
	var onCreate = function(tool){
	    settings.tool.push(tool);
	};
	var onClose = function(tool){
	    for (var i = 0; i < settings.tool.length; i++){
		if (settings.tool[i].id == tool.id){
		    settings.tool.splice(i, 1);
		    break;
		}
	    }
	};
	if (settings.cbCreate){
	    settings.cbCreate = [settings.cbCreate, onCreate]
	} else {
	    settings.cbCreate = onCreate;
	}
	if (settings.cbClose){
	    settings.cbClose = [settings.cbClose, onClose]
	} else {
	    settings.cbClose = onClose;
	}
	var onButtonClick = function(){
	    if (settings.tool.length > 0){
		// one of the tools is already open
		return;
	    }
	    var openGradient = false;
	    if ((settings.openGradient && input.style.background.length == 0) || input.style.background.indexOf("gradient") !== -1 || input.style.backgroundImage.indexOf("gradient") !== -1){
		openGradient = true;
	    }
	    if (input.style.backgroundImage.indexOf("gradient") !== -1){
		settings.startColor = input.style.backgroundImage;
	    } else if (input.style.backgroundColor !== -1){
		settings.startColor = input.style.backgroundColor;
	    } else {
		settings.startColor = input.style.background;
	    }
	    // open tool below and offset half way to the right of the input
	    var rect = $ms.getOffset(input);
	    settings.startPos = {top: rect.top + rect.height, left: rect.left + 20};
	    /*
	     * Create the colorpicker or gradient generator
	     */
	    if (openGradient){
		new $msRoot.Gradient(settings);
	    } else {
		new $msRoot.ColorPicker(settings);
	    }
	};
	button.addEventListener("click", onButtonClick);
	var colorKeyup = function(){
	    // if entered value get color from user keyboard input
	    var color, remove = false, invalid = false;
	    if (input.value.trim().length == 0){
		remove = true;
	    } else if (input.value.trim().substr(0, 1) == "#"){
		var hex = "#" + $msRoot.colorMethods.validateHex(input.value.substr(1));
		if (hex.length < 4){
		    remove = true;
		} else {
		    input.style.background = input.value;
		    color = $msRoot.colorMethods.hexToRgb(input.value);
		    input.style.color = $msRoot.colorMethods.highlightcolor(color.r, color.g, color.b);			
		}
	    } else if (input.value.trim().substr(0, 3) == "rgb"){
		color = $msRoot.colorMethods.colorInfo(input.value);
		if (color.rgbString.length == 0){
		    remove = true;
		} else {
		    input.style.background = color.rgbString;
		    input.style.color = $msRoot.colorMethods.highlightcolor(color.r, color.g, color.b);
		}		    
	    } else if (input.value.indexOf("gradient") !== -1){
		// set to background so wipes out all other background properties
		color = {};
		color.gradient = input.value;
		input.style.background = input.value;
	    } else {
		// support using color names (e.g. red, blue...
		color = $msRoot.colorMethods.colorNameInfo(input.value, "hex");
		if (!color){
		    remove = true;
		    invalid = true;
		} else {
		    input.style.background = color;
		    color = $msRoot.colorMethods.hexToRgb(color);
		    input.style.color = $msRoot.colorMethods.highlightcolor(color.r, color.g, color.b);
		}
	    }
	    if (remove){
		input.style.removeProperty("background-color"); 
		input.style.removeProperty("background-image"); 			
		input.style.removeProperty("color"); 		    
		if (settings.element){
		    settings.element.style.removeProperty("background-color"); 
		    settings.element.style.removeProperty("background-image"); 			
		    settings.element.style.removeProperty("color");
		}
	    }
	    
	    // determine which tool is open
	    var tool;
	    for (var i = 0; i < settings.tool.length; i++){
		// test for visible is offsetParent === null
		if (settings.tool[i].offsetParent !== null){
		    tool = settings.tool[i];
		    break;
		}
	    }
	    if (!tool) {
		return;
	    }
	    
	    if (settings.cbChange) {
		settings.cbChange(tool);
	    }
	    if (!remove){
		// only update the colorpicker / gradient if value is valid and if appended to document
		if (tool.container.parentNode){
		    if (settings.tool.indexOf("colorpicker")){
			// colorpicker tool
			settings.tool.setColor(color)
		    } else {
			// gradient tool
			if (color.gradient){
			    settings.gradient.setColor(color.gradient);
			} else {
			    settings.gradient.setColor(color.rgbString);
			}
		    }
		} else if (!invalid) {
		    var setColor = "";
		    if (color.gradient){
			settings.startColor = color.gradient;
			setColor = color.gradient;
		    } else {
			settings.startColor = color.rgbString;
			setColor = color.rgbString;
		    }
		    for (var i = 0; i < settings.target.length; i++){
			settings.target[i].element.style[settings.target[i].property] = setColor;
		    }
		}
	    }
	}
	input.addEventListener('keyup', function(e){colorKeyup()});
	return {div: div, button: button, input: input, settings: settings};
    }
    function timerTest(func, iterations) {

	if (typeof iterations == "undefined") {
	    iterations = 1;
	}
	var start = performance.now();
	var args = Array.prototype.slice.call(arguments, 2);
	for (var i = 0; i < iterations; i++) {
	    //Get parameters from arguments
	    func.apply(this, args);
	}

	var funcName = /function ([^\(]+)?/.exec(func.toString())[0];
	console.log("Time to run " + funcName + " for " + iterations + " time(s): " + (performance.now() - start));
	return performance.now() - start;
    }
    
var common =  {
	$: $,

	// functions for auto collapse of hidden divs
	closeAllDivs: closeAllDivs,
	shoh: shoh,
	setShohArrow: setShohArrow,
	
	scrollPage: scrollPage,
	setScrollURL: setScrollURL,
	setScrollAction: setScrollAction,
	downloadfile: downloadfile,
	setCookie: setCookie,
	getCookie: getCookie,
	deleteCookie: deleteCookie,
	v: v,
	post_to_url: post_to_url,
	postToIframe: postToIframe,
	htmlspecialchars: htmlspecialchars,
	htmlspecialchars_decode: htmlspecialchars_decode,
	hx: hx,
	hdx: hdx,
	base64_encode: base64_encode,
	base64_decode: base64_decode,
	urlencode: urlencode,
	urldecode: urldecode,
	encodestr: encodestr,
	hasClass: hasClass,
	addClass: addClass,
	removeClass: removeClass,
	parseJSON: parseJSON,
	round: round,
	randomNumber: randomNumber,
	printDiv: printDiv,
	requestFullScreen: requestFullScreen,
	cancelFullScreen: cancelFullScreen,
	isTouchDevice: isTouchDevice,
	fade: fade,
	scale: scale,
	loadSourceFile: loadSourceFile,
	removeSourceFile: removeSourceFile,
	detectButton: detectButton,
	arraySearch: arraySearch,
	toTitleCase: toTitleCase,
	getOffset: getOffset,
	getPropertyValue: getPropertyValue,
	cloneSettings: cloneSettings,
	targetFontSize: targetFontSize,
	copyToClipboard: copyToClipboard,
	innerSize: innerSize,
	scrollIntoView: scrollIntoView,
	getScrollBarSize: getScrollBarSize,
	vendorFunctionPrefix: vendorFunctionPrefix,
	setOnLoad: setOnLoad,
	removeOnLoad: removeOnLoad,
	sourceFiles: sourceFiles,
	
	// functions to support custom controls
	createCombo: createCombo,
	createListboxCombo:  createListboxCombo,
	createEditableCombo:  createEditableCombo,
	createSliderInput:  createSliderInput,
	createLabel:  createLabel,
	createCheckbox:  createCheckbox,
	createRadio:  createRadio,
	createTable:  createTable,
	convertUnits:  convertUnits,
	splitUnit:  splitUnit,
	
	getAbsoluteHeight:  getAbsoluteHeight,
	getScroll:  getScroll,
	insertIntoTextarea:  insertIntoTextarea,
	hasVerticalScroll:  hasVerticalScroll,
	hasHorizontalScroll:  hasHorizontalScroll,
	hoverBorder:  hoverBorder,
	elementSize: elementSize,
	setOrientation:  setOrientation,
	arrayMove:  arrayMove,
	arrayInsertBefore:  arrayInsertBefore,
	display:  display,
	formatDate:  formatDate,
	getColgroup:  getColgroup,
	getTbody:  getTbody,
	createCloseButton:  createCloseButton,
	windowSize:  windowSize,
	propUnitsScale: propUnitsScale,
	createColorPickerInput: createColorPickerInput,
	timerTest: timerTest, 
	ie9OrBelow: ie9OrBelow,
	ie8OrBelow: ie8OrBelow
    }
    $msRoot.getChildClasses(common, "common");
    return common;

}();

// mutation record
/*
    type the type of mutation observed, either attribute, characterData or childList.
    target the node affected by the mutation.
    addedNodes a NodeList of elements, attributes, and text nodes added to the tree.
    removedNodes a NodeList of elements, attributes, and text nodes removed from the tree.
    previousSibling returns the previous sibling node, or null if there is no previous sibling.
    nextSibling returns the next sibling node, or null if there is no next sibling.
    attributeName The name of the attribute or attributes changed. If attributeFilter option was set, it will only return the filtered node.
    oldValue the pre-mutation value in the case of attribute or characterData mutations, and null for childList mutations.

    attributeFilter
    Set to an array of attribute local names (without namespace) to only monitor changes to specific attributes (attributes must also be true). Example: { attributes: true, attributeFilter: ["id", "dir"] }
*/
// childList: true, characterData: true, subtree: true 
$ms.MutationObserver = (function(){    
    var defaultSettings = {
	observe: {attributes: true, attributeOldValue: true, attributeFilter: ['style']},
	querySelectorAll:false,
	cb: undefined,
	property: ["height", "width"],
    }
    function MutationObserver(){
	var _this = this;
	this.observerList = [];	
	
	this.MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
	if (!this.MutationObserver){
	    return;
	}
	this.cb = function(mutationRecords, observer){
	    // mutationRecords.forEach(attrModified);
	    mutationRecords.map( 
		function(mutationRecord){
		    //console.log( mr );
		    _this.attrModified.call(_this, mutationRecord, observer)
		});
	}	
	this.observer = new this.MutationObserver(this.cb)
    }
    MutationObserver.prototype.observe = function(selector, passedSettings){
	if (!this.MutationObserver)
	    return;

	var list;
	this.settings = $ms.cloneSettings(defaultSettings, passedSettings);
	if (this.settings.querySelectAll){
	    list = document.querySelectorAll(selector);
	} else {
	    list = document.querySelector(selector);
	}
	if (!list) {
	    console.log("MutationObserver - No matches for: " + selector);
	    return;
	} else if (!Array.isArray(list)){
	    list = [list];
	}
	this.observerList = list;
	for (var i = 0; i < list.length; i++){
	    this.observer.observe( list[i], this.settings.observe);
	}
    }
	
    MutationObserver.prototype.attrModified = function(mutation, observer) {
	var name = mutation.attributeName;
	if (name) {
	    if (name == "style"){
		if (mutation.oldValue == null){
		    return;
		}
		var mutationOldValue = mutation.oldValue.split(";");
		var changes = [];
		var match = false;
		var property, oldValue, newValue, split;
		for (var i =0; i < mutationOldValue.length; i++){
		    split = mutationOldValue[i].split(":");
		    property = split[0];
		    if (!property) continue;
		    property = property.trim();
		    if (split.length > 1){
			oldValue = split[1].trim();
		    }
		    newValue = mutation.target.style[property];
		    changes.push({property: property, oldValue: oldValue, newValue: newValue});
		    if (this.settings.property.indexOf(changes.property !== -1)){
			match = true;
		    }		
		}
		if (!match){
		    console.log("Mutation - Different property changed: " + oldValue);
		    return;
		}
		if (this.settings.cb){
		    this.settings.cb(mutation.target, changes);
		}
	    } else if (this.settings.cb){
		var newValue = mutation.target.getAttribute(name);
		var oldValue = mutation.oldValue;
		this.settings.cb(mutation.target, name, newValue);
	    } else {
		console.log("Mutation - No callback for attribute: " + name);
		console.log(mutation);
	    }
	}
    }
    MutationObserver.prototype.disconnect = function(){
	if (this.MutationObserver)
	    this.observer.disconnect();
    }
    return MutationObserver;
})();
