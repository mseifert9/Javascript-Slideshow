/*
 Copyright (c) 2007 John Dyer (http://johndyer.name) MIT style license
 Copyright © 2017 Michael Seifert (www.mseifert.com) All Rights Reserved
*/
$msRoot.createNS("ColorPicker.Color");
$msRoot.ColorPicker.Color = function (init) {
    var color = {
	r: 0,
	g: 0,
	b: 0,
	h: 0,
	s: 0,
	v: 0,
	h2: 0,
	s2: 0,
	l: 0,
	hex: '',
	rgb: [0,0,0,1],
	alpha: 1,
	rgbString: "",
	setRgb: function (r, g, b, alpha) {
	    this.alpha = $ms.round(alpha / 100, 2);
	    this.r = r;
	    this.g = g;
	    this.b = b;
	    this.rgb = [this.r, this.g, this.b, this.alpha];
	    this.rgbString = $msRoot.colorMethods.rgbString(this.rgb);

	    var newHsv = $msRoot.colorMethods.rgbToHsv(this);
	    this.h = newHsv.h;
	    this.s = newHsv.s;
	    this.v = newHsv.v;

	    var newHsl = $msRoot.colorMethods.rgbToHsl(this);
	    this.h2 = newHsl.h;
	    this.s2 = newHsl.s;
	    this.l = newHsl.l;

	    this.hex = $msRoot.colorMethods.rgbToHex(this);
	},
	setHsv: function (h, s, v, alpha) {
	    this.alpha = $ms.round(alpha / 100, 2);
	    this.h = h;
	    this.s = s;
	    this.v = v;

	    var newRgb = $msRoot.colorMethods.hsvToRgb(this);
	    this.r = newRgb.r;
	    this.g = newRgb.g;
	    this.b = newRgb.b;
	    this.rgb = [this.r, this.g, this.b, this.alpha];
	    this.rgbString = newRgb.rgbString;
	    
	    var newHsl = $msRoot.colorMethods.hsvToHsl(this);
	    this.h2 = h;	// 
	    this.s2 = newHsl.s;
	    this.l = newHsl.l;

	    this.hex = $msRoot.colorMethods.rgbToHex(newRgb);
	},
	setHsl: function (h, s, l, alpha) {
	    this.alpha = $ms.round(alpha / 100, 2);
	    this.h2 = h;
	    this.s2 = s;
	    this.l = l;

	    var newRgb = $msRoot.colorMethods.hslToRgb({h: this.h2, s: this.s2, l: this.l, alpha: this.alpha});
	    this.r = newRgb.r;
	    this.g = newRgb.g;
	    this.b = newRgb.b;
	    this.rgb = [this.r, this.g, this.b, this.alpha];
	    this.rgbString = newRgb.rgbString;
	    
	    var newHsv = $msRoot.colorMethods.hslToHsv({h: this.h2, s: this.s2, l: this.l, alpha: this.alpha});
	    this.h = newHsv.h;
	    this.s = newHsv.s;
	    this.v = newHsv.v;

	    this.hex = $msRoot.colorMethods.rgbToHex(newRgb);
	},
	setHex: function (hex, alpha) {
	    this.alpha = $ms.round(alpha / 100, 2);
	    this.hex = hex;
	    var newRgb = $msRoot.colorMethods.hexToRgb(this.hex, this.alpha);
	    this.r = newRgb.r;
	    this.g = newRgb.g;
	    this.b = newRgb.b;
	    this.rgb = [this.r, this.g, this.b, this.alpha];
	    this.rgbString = newRgb.rgbString;

	    var newHsv = $msRoot.colorMethods.rgbToHsv(newRgb);
	    this.h = newHsv.h;
	    this.s = newHsv.s;
	    this.v = newHsv.v;
	    
	    var newHsl = $msRoot.colorMethods.rgbToHsl(this);
	    this.h2 = newHsv.h;
	    this.s2 = newHsl.s;
	    this.l = newHsl.l;
	},
	setOpacity: function (alpha) {
	    this.alpha = $ms.round(alpha / 100, 2);
	    this.rgb = [this.r, this.g, this.b, this.alpha];
	    this.rgbString = $msRoot.colorMethods.rgbString(this.rgb);
	}
    };

    if (init) {
	if (init.hex)
	    color.setHex(init.hex);
	else if (init.r)
	    color.setRgb(init.r, init.g, init.b);
	else if (typeof init.h !== "undefined")
	    color.setHsv(init.h, init.s, init.v);
	else if (typeof init.h2 !== "undefined")
	    color.setHsl(init.h2, init.s2, init.l);
    }

    return color;
};


$msRoot.createNS("colorMethods");
$msRoot.colorMethods = {
    hexToRgb: function (hex, alpha) {
	// the only convsion function without object passed containing properties
	if (hex.length == 0){
	    return {r: 0, g: 0, b: 0, alpha: 1, rgb: [], rgbString: ""};
	}
	hex = this.validateHex(hex.substr(1));
	if (typeof alpha == "undefined"){
	    alpha = 1;
	}
	var r = '00', g = '00', b = '00';
	if (hex.length == 3) {
	    hex = hex.substr(0, 1) + hex.substr(0, 1) + hex.substr(1, 1) + hex.substr(1, 1) + hex.substr(2, 1) +  hex.substr(2, 1);
	}
	if (hex.length == 6) {
	    r = hex.substring(0, 2);
	    g = hex.substring(2, 4);
	    b = hex.substring(4, 6);
	} else {
	    if (hex.length > 4) {
		r = hex.substring(4, hex.length);
		hex = hex.substring(0, 4);
	    }
	    if (hex.length > 2) {
		g = hex.substring(2, hex.length);
		hex = hex.substring(0, 2);
	    }
	    if (hex.length > 0) {
		b = hex.substring(0, hex.length);
	    }
	}
	r = this.hexToInt(r);
	g = this.hexToInt(g);
	b = this.hexToInt(b);
	return {r: r, g: g, b: b, alpha: alpha, hex: "#" + hex, rgb: [r, g ,b, alpha], rgbString: this.rgbString([r, g ,b, alpha])};
    },
    validateHex: function (hex) {
	hex = new String(hex).toUpperCase();
	hex = hex.replace(/[^A-F0-9]/g, '0');
	if (hex.length > 6)
	    hex = hex.substring(0, 6);
	return hex;
    },
    webSafeDec: function (dec) {
	dec = Math.round(dec / 51);
	dec *= 51;
	return dec;
    },
    hexToWebSafe: function (hex) {
	var r, g, b;

	if (hex.length == 3) {
	    r = hex.substring(0, 1);
	    g = hex.substring(1, 1);
	    b = hex.substring(2, 1);
	} else {
	    r = hex.substring(0, 2);
	    g = hex.substring(2, 4);
	    b = hex.substring(4, 6);
	}
	return intToHex(this.webSafeDec(this.hexToInt(r))) + this.intToHex(this.webSafeDec(this.hexToInt(g))) + this.intToHex(this.webSafeDec(this.hexToInt(b)));
    },
    rgbToWebSafe: function (rgb) {
	return {r: this.webSafeDec(rgb.r), g: this.webSafeDec(rgb.g), b: this.webSafeDec(rgb.b)};
    },
    rgbToHex: function (rgb) {
	if (typeof rgb == "string"){
	    return $msRoot.colorMethods.colorInfo(rgb).hex;
	} else if (Array.isArray(rgb)) {
	    return "#" + this.intToHex(rgb[0]) + this.intToHex(rgb[1]) + this.intToHex(rgb[2]);
	} else {
	    return "#" + this.intToHex(rgb.r) + this.intToHex(rgb.g) + this.intToHex(rgb.b);
	}
    },
    intToHex: function (dec) {
	var result = (parseInt(dec).toString(16));
	if (result.length == 1)
	    result = ("0" + result);
	return result.toUpperCase();
    },
    hexToInt: function (hex) {
	return(parseInt(hex, 16));
    },
    rgbToHsv: function (rgb) {
	if (Array.isArray(rgb)){
	    var r = rgb[0] / 255;
	    var g = rgb[1] / 255;
	    var b = rgb[2] / 255;
	} else {
	    var r = rgb.r / 255;
	    var g = rgb.g / 255;
	    var b = rgb.b / 255;
	}	
	var hsv = {h: 0, s: 0, v: 0};

	var min = Math.min(r,g,b);
	var max = Math.max(r,g,b);;

	hsv.v = max;
	hsv.s = (max) ? ((max - min) / max) : 0;

	if (!hsv.s) {
	    hsv.h = 0;
	} else {
	    var delta = max - min;
	    if (r == max) {
		hsv.h = (g - b) / delta;
	    } else if (g == max) {
		hsv.h = 2 + (b - r) / delta;
	    } else {
		hsv.h = 4 + (r - g) / delta;
	    }

	    hsv.h = $ms.round(hsv.h * 60);
	    if (hsv.h < 0) {
		hsv.h += 360;
	    }
	}

	hsv.s = $ms.round(hsv.s * 100);
	hsv.v = $ms.round(hsv.v * 100);
	return hsv;
    },
    hsvToRgb: function (hsv) {
	var rgb = {r: 0, g: 0, b: 0};

	var h = hsv.h;
	var s = hsv.s;
	var v = hsv.v;

	if (s == 0) {
	    if (v == 0) {
		rgb.r = rgb.g = rgb.b = 0;
	    } else {
		rgb.r = rgb.g = rgb.b = Math.round(v * 255 / 100);
	    }
	} else {
	    if (h == 360) {
		h = 0;
	    }
	    h /= 60;

	    // 100 scale
	    s = s / 100;
	    v = v / 100;

	    var i = parseInt(h);
	    var f = h - i;
	    var p = v * (1 - s);
	    var q = v * (1 - (s * f));
	    var t = v * (1 - (s * (1 - f)));
	    switch (i) {
		case 0:
		    rgb.r = v;
		    rgb.g = t;
		    rgb.b = p;
		    break;
		case 1:
		    rgb.r = q;
		    rgb.g = v;
		    rgb.b = p;
		    break;
		case 2:
		    rgb.r = p;
		    rgb.g = v;
		    rgb.b = t;
		    break;
		case 3:
		    rgb.r = p;
		    rgb.g = q;
		    rgb.b = v;
		    break;
		case 4:
		    rgb.r = t;
		    rgb.g = p;
		    rgb.b = v;
		    break;
		case 5:
		    rgb.r = v;
		    rgb.g = p;
		    rgb.b = q;
		    break;
	    }
	    rgb.r = Math.round(rgb.r * 255);
	    rgb.g = Math.round(rgb.g * 255);
	    rgb.b = Math.round(rgb.b * 255);
	}
	rgb.alpha = hsv.alpha;		
	rgb.rgb = [rgb.r, rgb.g, rgb.b, rgb.alpha];
	rgb.rgbString = this.rgbString(rgb.rgb);
	return rgb;
    }, 
    rgbToHsl: function(rgb){
	// hsl
	// Saturation = (from left) Gray50%(#808080, RGB128,128,128) → Transparent
	// Lightness = (from bottom) Black → Transparent → White
	var alpha = 1;
	if (Array.isArray(rgb)){
	    var r = rgb[0];
	    var g = rgb[1];
	    var b = rgb[2];
	    if (rgb.length > 3){
		alpha = rgb[3]
	    }
	} else {
	    var r = rgb.r;
	    var g = rgb.g;
	    var b = rgb.b;
	    if (typeof rgb.alpha !== "undefined"){
		alpha = rgb.alpha;
	    }
	}	
	var hsl = {l: 0, s: 0, h: 0, alpha: 1};
	var max = Math.max(r, g, b);
	var min = Math.min(r, g, b);
	var diff = (max - min);

	// lightness
	var L = (max + min)/510
	hsl.l = Math.round(L * 100);
	
	var s = 0;
	if (L !== 1 && L !== 0) {
	    // dividing diff by 255 puts it into range of 0-1
	    s = (diff / 255) / (1 - Math.abs(2 * L - 1 ));
	}
	hsl.s = Math.round(s * 100);
	
	var h = 0;
	if (diff > 0) {
	    if (r == max){
		h = (g - b) / diff * 60;
		if (h < 0) h += 360;
	    } else if (g == max){
		h = (b - r) / diff * 60 + 120;
	    } else {
		h = (r - g) / diff * 60 + 240;
	    }
	}
	hsl.h = Math.round(h);
	hsl.alpha = alpha;
	
	if (hsl.alpha == 1){
	    hsl.hslString = "hsl(" + hsl.h + "," + hsl.s + "%," + hsl.l + "%)";
	} else {
	    hsl.hslString = "hsla(" + hsl.h + "," + hsl.s + "%," + hsl.l + "%," + hsl.alpha + ")";
	}
	return hsl;
    },
    hslToRgb: function(hsl){
	var rgb = {r: 0, g: 0, b: 0, alpha: 1};
	var h = hsl.h;
	var s = hsl.s / 100;
	var L = hsl.l / 100;
	var r, g, b;

	var diff = 255 * s * (1 - Math.abs(2 * L - 1));
	var min = 255 * L - diff/2;
	var x = diff * (1 - Math.abs( (h/60) % 2 - 1));

	if (h <60) {
	    // 0 ≤ h < 60
	    r = diff + min;
	    g = x + min;
	    b = min;
	} else if (h < 120) {
	    // 60 ≤ h < 120
	    r = x + min;
	    g = diff + min;
	    b = min;
	} else if (h < 180) {
	    // 120 ≤ h < 180
	    r = min;
	    g = diff + min;
	    b = x + min;
	} else if (h < 240) {
	    // 180 ≤ h < 240
	    r = min;
	    g = x + min;
	    b = diff + min;
	} else if (h < 300) {
	    // 240 ≤ h < 300
	    r = x + min;
	    g = min;
	    b = diff + min;
	} else {
	    // 300 ≤ h < 360
	    r = diff + min;
	    g = min;
	    b = x + min;
	}
	r = Math.round(r);
	g = Math.round(g);
	b = Math.round(b);
	var rgb = {r: r, g: g, b: b};
	if (typeof hsl.alpha !== "undefined"){
	    rgb.alpha = hsl.alpha;
	}
	rgb.rgb = [rgb.r, rgb.g, rgb.b, rgb.alpha];
	rgb.rgbString = this.rgbString(rgb.rgb);
	return rgb;
    },
    
    hsvToHsl: function(hsv){
	var s = hsv.s / 100;
	var v = hsv.v / 100;
	var h2, s2, L;
        h2 = hsv.h;   //Hue stays the same
	L = (2 - s) * v / 2;
	s2 = 0;
	if (L !== 1 && L !== 0) {
	    s2 = (s * v) / (1 - Math.abs(2 * L - 1));
	}
	s2 = Math.round(s2 * 100);	
	L = Math.round(L * 100);
	var hsl = {h: h2, s: s2, l: L};
	return hsl;
    },
    hslToHsv: function(hsl){
	var s2 = hsl.s / 100;
	var L = hsl.l / 100;
	var h, s, v;
	h = hsl.h;	//Hue stays the same
	v = ((2 * L) + s2 * (1 - Math.abs(2 * L - 1))) / 2;
	s = 0;
	if (v !== 0){
	    s = 2 * (v - L) / v;
	}
	s = Math.round(s * 100);
	v = Math.round(v * 100);	
	var hsv = {h: h, s: s, v: v};
	return hsv
    },    
    rgbString: function (rgbArray){
	if (rgbArray.length < 4 || rgbArray[3] == 1){
	    return "rgb(" + rgbArray[0] + "," + rgbArray[1] + "," + rgbArray[2] + ")";
	} else {
	    return "rgba(" + rgbArray.join() + ")";
	}
    },
    colorInfo: function (color, alpha){
	// take color of either rgb or hex
	if (typeof alpha == "undefined") {
	    // only used if color is not rgba
	    alpha = "1";
	}
	if (color.length == 0){
	    // r: g: b: are undefined
	    return {rgbString: "", hex: "", alpha: alpha, rgb: []};
	}
	if (color.indexOf("gradient") !== -1){ 
	    // r: g: b: are undefined
	    return {rgbString: "", gradient: color, hex: "", alpha: 1, rgb: []};
	}
	if (Array.isArray(color)){
	    // rgb passed as an array
	    if (color.length == 3){
		color.push(alpha);
	    } else if (color.length == 4){
		// update with new value since we are changing the original array
		color[3] = alpha;
	    }
	    var rgb = ((color[2] | color[1] << 8 | color[0] << 16) | 1 << 24).toString(16).slice(1);
	    return {r: color[0], g: color[1], b: color[2], rgbString: this.rgbString(color), hex: '#' + rgb.toString(16), alpha: alpha, rgb: color}
	}
	if (color.substr(0, 1) === '#') {
	    // hex format
	    return this.hexToRgb(color);
	}
	if (color.substr(0, 3) === 'hsl'){
	    /*
	     *Full match	0-19	`hsl(0,0%,100%,1)`
	     *Group 1.	5-8	`0`
	     *Group 2.	9-12	`0`
	     *Group 3.	13-16	`100`
	     *Group 4.	16-18	`1`
	     */
	    var digits = /hsl(?:a)*\(([0-9]{1,3}),([0-9]{1,3})(?:%),([0-9]{1,3})(?:%)(?:,)?(?:(\d*\.?\d+))?\)/.exec(color.replace(/\s+/g,''));

	    if(!digits || digits.length < 4) {
		console.log('Color (' + color + ') not a valid hsl or hsla color');
		return {rgbString: "", hex: "", alpha: 1, rgb: [], hsl: []};
	    }
	    var h = parseInt(digits[1]);
	    var s = parseInt(digits[2]);
	    var l = parseInt(digits[3]);
	    if (digits.length == 5 && typeof digits[4] !== "undefined"){
		alpha = digits[4];
		if(alpha.substr(0,1) === '.') {
		    alpha = parseFloat('0' + alpha);
		}
		// round alpha value to 2 digits
		alpha = parseFloat(Math.round(alpha * 100), 10) / 100;
		if(alpha > 1) {
		    alpha = 1;
		}
	    }
	    var rgb = $msRoot.colorMethods.hslToRgb({h: h, s: s, l: l, alpha: alpha});
	    var hex = $msRoot.colorMethods.rgbToHex(rgb);
	    return {r: rgb.r, g: rgb.g, b: rgb.b, rgbString: rgb.rgbString, hex: hex, alpha: alpha, rgb: rgb.rgb, hsl: [h, s, l, alpha], h: h, s: s, l: l};
	}
	// rgb
	/*
	 *Full match	0-19	`rgba(255,255,255,1)`
	 *Group 1.	5-8	`255`
	 *Group 2.	9-12	`255`
	 *Group 3.	13-16	`255`
	 *Group 4.	16-18	`,1`
	 */
	var digits = /rgb(?:a)*\((?:([0-9]{1,3}),)(?:([0-9]{1,3}),)([0-9]{1,3})(?:,)?(?:(\d*\.?\d+))?\)/.exec(color.replace(/\s+/g,''));
	if(!digits || digits.length < 4) {
	    // test for color name
	    colorInfo = $msRoot.colorMethods.colorNameInfo(color, "hex");
	    if (!colorInfo){
		// test for transparent keyword
		if (color == "transparent"){
		    return({rgbString: "rgba(255,255,255,0)", hex: "FFF", alpha: 0, rgb: [255,255,255,0]});
		}
		console.log('Color (' + color + ') not a valid rgb or rgba color');
		return {rgbString: "", hex: "", alpha: 1, rgb: []};
	    } else {
		return this.hexToRgb(colorInfo);
	    }
	}
	var r = parseInt(digits[1]);
	var g = parseInt(digits[2]);
	var b = parseInt(digits[3]);
	var hex = ((b | g << 8 | r << 16) | 1 << 24).toString(16).slice(1);

	if (digits.length == 5 && typeof digits[4] !== "undefined"){
	    alpha = digits[4];
	    if(alpha.substr(0,1) === '.') {
		alpha = parseFloat('0' + alpha);
	    }
	    // round alpha value to 2 digits
	    alpha = parseFloat(Math.round(alpha * 100), 10) / 100;
	    if(alpha > 1) {
		alpha = 1;
	    }
	}
	return {r: r, g: g, b: b, rgbString: this.rgbString([r, g, b, alpha]), hex: '#' + hex, alpha: alpha, rgb: [r, g, b, alpha]}
    },
    rgbToRgba: function (rgb, alpha){
	var rgbArray;
	if (typeof rgb == "string"){
	    rgb.replace("rgb(", "");
	    rgb.replace(")", "");
	    rgbArray = rgb.split(",");
	} else {
	    rgbArray = rgb;
	}
	if (rgbArray.length == 3){
	    rgbArray.push(alpha);
	} else if (rgbArray.length == 4){
	    // update with new value since we are changing the original array
	    rgbArray[3] = alpha;
	}
	return 'rgba(' + rgbArray.join() + ')';
    },
    highlightcolor: function (r, g, b){
	// using average of rgb
	//var luma = (parseInt(r)+parseInt(g)+parseInt(b));
	//if (luma > 127*3){
	// ITU-R Recommendation BT. 709 - https://en.wikipedia.org/wiki/Luma_%28video%29
	var luma = (0.2126 * r) + (0.7152 * g) + (0.0722 * b)	
	if (luma > 165){
	    // black
	    return "#000000";
	} else {
	    // white
	    return "#FFFFFF";
	}
    },
    /*
     * Usage:
     * colorNameInfo("yellow");	    ==> {name: yellow, hex: #ffff00, rgb: rgb(255,255,0)}
     * colorNameInfo("yellow", "rgb");  ==>	rgb(255,255,0)
     * colorNameInfo("#9acd32");	    ==>	{name: yellowgreen, hex: #9acd32, rgb: rgb(154,205,50)}
     * colorNameInfo("rgb(128,128,128)", "name"); gray
     */

    colorNameInfo: function (value, returnProperty){
	var colors = [{name: "aliceblue", hex: "#f0f8ff", rgbString: "rgb(240,248,255)"},
	    {name: "antiquewhite", hex: "#faebd7", rgbString: "rgb(250,235,215)"},
	    {name: "aqua", hex: "#00ffff", rgbString: "rgb(0,255,255)"},
	    {name: "aquamarine", hex: "#7fffd4", rgbString: "rgb(127,255,212)"},
	    {name: "azure", hex: "#f0ffff", rgbString: "rgb(240,255,255)"},
	    {name: "beige", hex: "#f5f5dc", rgbString: "rgb(245,245,220)"},
	    {name: "bisque", hex: "#ffe4c4", rgbString: "rgb(255,228,196)"},
	    {name: "black", hex: "#000000", rgbString: "rgb(0,0,0)"},
	    {name: "blanchedalmond", hex: "#ffebcd", rgbString: "rgb(255,235,205)"},
	    {name: "blue", hex: "#0000ff", rgbString: "rgb(0,0,255)"},
	    {name: "blueviolet", hex: "#8a2be2", rgbString: "rgb(138,43,226)"},
	    {name: "brown", hex: "#a52a2a", rgbString: "rgb(165,42,42)"},
	    {name: "burlywood", hex: "#deb887", rgbString: "rgb(222,184,135)"},
	    {name: "cadetblue", hex: "#5f9ea0", rgbString: "rgb(95,158,160)"},
	    {name: "chartreuse", hex: "#7fff00", rgbString: "rgb(127,255,0)"},
	    {name: "chocolate", hex: "#d2691e", rgbString: "rgb(210,105,30)"},
	    {name: "coral", hex: "#ff7f50", rgbString: "rgb(255,127,80)"},
	    {name: "cornflowerblue", hex: "#6495ed", rgbString: "rgb(100,149,237)"},
	    {name: "cornsilk", hex: "#fff8dc", rgbString: "rgb(255,248,220)"},
	    {name: "crimson", hex: "#dc143c", rgbString: "rgb(220,20,60)"},
	    {name: "cyan", hex: "#00ffff", rgbString: "rgb(0,255,255)"},
	    {name: "darkblue", hex: "#00008b", rgbString: "rgb(0,0,139)"},
	    {name: "darkcyan", hex: "#008b8b", rgbString: "rgb(0,139,139)"},
	    {name: "darkgoldenrod", hex: "#b8860b", rgbString: "rgb(184,134,11)"},
	    {name: "darkgray", hex: "#a9a9a9", rgbString: "rgb(169,169,169)"},
	    {name: "darkgreen", hex: "#006400", rgbString: "rgb(0,100,0)"},
	    {name: "darkkhaki", hex: "#bdb76b", rgbString: "rgb(189,183,107)"},
	    {name: "darkmagenta", hex: "#8b008b", rgbString: "rgb(139,0,139)"},
	    {name: "darkolivegreen", hex: "#556b2f", rgbString: "rgb(85,107,47)"},
	    {name: "darkorange", hex: "#ff8c00", rgbString: "rgb(255,140,0)"},
	    {name: "darkorchid", hex: "#9932cc", rgbString: "rgb(153,50,204)"},
	    {name: "darkred", hex: "#8b0000", rgbString: "rgb(139,0,0)"},
	    {name: "darksalmon", hex: "#e9967a", rgbString: "rgb(233,150,122)"},
	    {name: "darkseagreen", hex: "#8fbc8f", rgbString: "rgb(143,188,143)"},
	    {name: "darkslateblue", hex: "#483d8b", rgbString: "rgb(72,61,139)"},
	    {name: "darkslategray", hex: "#2f4f4f", rgbString: "rgb(47,79,79)"},
	    {name: "darkturquoise", hex: "#00ced1", rgbString: "rgb(0,206,209)"},
	    {name: "darkviolet", hex: "#9400d3", rgbString: "rgb(148,0,211)"},
	    {name: "deeppink", hex: "#ff1493", rgbString: "rgb(255,20,147)"},
	    {name: "deepskyblue", hex: "#00bfff", rgbString: "rgb(0,191,255)"},
	    {name: "dimgray", hex: "#696969", rgbString: "rgb(105,105,105)"},
	    {name: "dodgerblue", hex: "#1e90ff", rgbString: "rgb(30,144,255)"},
	    {name: "firebrick", hex: "#b22222", rgbString: "rgb(178,34,34)"},
	    {name: "floralwhite", hex: "#fffaf0", rgbString: "rgb(255,250,240)"},
	    {name: "forestgreen", hex: "#228b22", rgbString: "rgb(34,139,34)"},
	    {name: "fuchsia", hex: "#ff00ff", rgbString: "rgb(255,0,255)"},
	    {name: "gainsboro", hex: "#dcdcdc", rgbString: "rgb(220,220,220)"},
	    {name: "ghostwhite", hex: "#f8f8ff", rgbString: "rgb(248,248,255)"},
	    {name: "gold", hex: "#ffd700", rgbString: "rgb(255,215,0)"},
	    {name: "goldenrod", hex: "#daa520", rgbString: "rgb(218,165,32)"},
	    {name: "gray", hex: "#808080", rgbString: "rgb(128,128,128)"},
	    {name: "green", hex: "#008000", rgbString: "rgb(0,128,0)"},
	    {name: "greenyellow", hex: "#adff2f", rgbString: "rgb(173,255,47)"},
	    {name: "honeydew", hex: "#f0fff0", rgbString: "rgb(240,255,240)"},
	    {name: "hotpink", hex: "#ff69b4", rgbString: "rgb(255,105,180)"},
	    {name: "indianred ", hex: "#cd5c5c", rgbString: "rgb(205,92,92)"},
	    {name: "indigo", hex: "#4b0082", rgbString: "rgb(75,0,130)"},
	    {name: "ivory", hex: "#fffff0", rgbString: "rgb(255,255,240)"},
	    {name: "khaki", hex: "#f0e68c", rgbString: "rgb(240,230,140)"},
	    {name: "lavender", hex: "#e6e6fa", rgbString: "rgb(230,230,250)"},
	    {name: "lavenderblush", hex: "#fff0f5", rgbString: "rgb(255,240,245)"},
	    {name: "lawngreen", hex: "#7cfc00", rgbString: "rgb(124,252,0)"},
	    {name: "lemonchiffon", hex: "#fffacd", rgbString: "rgb(255,250,205)"},
	    {name: "lightblue", hex: "#add8e6", rgbString: "rgb(173,216,230)"},
	    {name: "lightcoral", hex: "#f08080", rgbString: "rgb(240,128,128)"},
	    {name: "lightcyan", hex: "#e0ffff", rgbString: "rgb(224,255,255)"},
	    {name: "lightgoldenrodyellow", hex: "#fafad2", rgbString: "rgb(250,250,210)"},
	    {name: "lightgrey", hex: "#d3d3d3", rgbString: "rgb(211,211,211)"},
	    {name: "lightgreen", hex: "#90ee90", rgbString: "rgb(144,238,144)"},
	    {name: "lightpink", hex: "#ffb6c1", rgbString: "rgb(255,182,193)"},
	    {name: "lightsalmon", hex: "#ffa07a", rgbString: "rgb(255,160,122)"},
	    {name: "lightseagreen", hex: "#20b2aa", rgbString: "rgb(32,178,170)"},
	    {name: "lightskyblue", hex: "#87cefa", rgbString: "rgb(135,206,250)"},
	    {name: "lightslategray", hex: "#778899", rgbString: "rgb(119,136,153)"},
	    {name: "lightsteelblue", hex: "#b0c4de", rgbString: "rgb(176,196,222)"},
	    {name: "lightyellow", hex: "#ffffe0", rgbString: "rgb(255,255,224)"},
	    {name: "lime", hex: "#00ff00", rgbString: "rgb(0,255,0)"},
	    {name: "limegreen", hex: "#32cd32", rgbString: "rgb(50,205,50)"},
	    {name: "linen", hex: "#faf0e6", rgbString: "rgb(250,240,230)"},
	    {name: "magenta", hex: "#ff00ff", rgbString: "rgb(255,0,255)"},
	    {name: "maroon", hex: "#800000", rgbString: "rgb(128,0,0)"},
	    {name: "mediumaquamarine", hex: "#66cdaa", rgbString: "rgb(102,205,170)"},
	    {name: "mediumblue", hex: "#0000cd", rgbString: "rgb(0,0,205)"},
	    {name: "mediumorchid", hex: "#ba55d3", rgbString: "rgb(186,85,211)"},
	    {name: "mediumpurple", hex: "#9370d8", rgbString: "rgb(147,112,216)"},
	    {name: "mediumseagreen", hex: "#3cb371", rgbString: "rgb(60,179,113)"},
	    {name: "mediumslateblue", hex: "#7b68ee", rgbString: "rgb(123,104,238)"},
	    {name: "mediumspringgreen", hex: "#00fa9a", rgbString: "rgb(0,250,154)"},
	    {name: "mediumturquoise", hex: "#48d1cc", rgbString: "rgb(72,209,204)"},
	    {name: "mediumvioletred", hex: "#c71585", rgbString: "rgb(199,21,133)"},
	    {name: "midnightblue", hex: "#191970", rgbString: "rgb(25,25,112)"},
	    {name: "mintcream", hex: "#f5fffa", rgbString: "rgb(245,255,250)"},
	    {name: "mistyrose", hex: "#ffe4e1", rgbString: "rgb(255,228,225)"},
	    {name: "moccasin", hex: "#ffe4b5", rgbString: "rgb(255,228,181)"},
	    {name: "navajowhite", hex: "#ffdead", rgbString: "rgb(255,222,173)"},
	    {name: "navy", hex: "#000080", rgbString: "rgb(0,0,128)"},
	    {name: "oldlace", hex: "#fdf5e6", rgbString: "rgb(253,245,230)"},
	    {name: "olive", hex: "#808000", rgbString: "rgb(128,128,0)"},
	    {name: "olivedrab", hex: "#6b8e23", rgbString: "rgb(107,142,35)"},
	    {name: "orange", hex: "#ffa500", rgbString: "rgb(255,165,0)"},
	    {name: "orangered", hex: "#ff4500", rgbString: "rgb(255,69,0)"},
	    {name: "orchid", hex: "#da70d6", rgbString: "rgb(218,112,214)"},
	    {name: "palegoldenrod", hex: "#eee8aa", rgbString: "rgb(238,232,170)"},
	    {name: "palegreen", hex: "#98fb98", rgbString: "rgb(152,251,152)"},
	    {name: "paleturquoise", hex: "#afeeee", rgbString: "rgb(175,238,238)"},
	    {name: "palevioletred", hex: "#d87093", rgbString: "rgb(216,112,147)"},
	    {name: "papayawhip", hex: "#ffefd5", rgbString: "rgb(255,239,213)"},
	    {name: "peachpuff", hex: "#ffdab9", rgbString: "rgb(255,218,185)"},
	    {name: "peru", hex: "#cd853f", rgbString: "rgb(205,133,63)"},
	    {name: "pink", hex: "#ffc0cb", rgbString: "rgb(255,192,203)"},
	    {name: "plum", hex: "#dda0dd", rgbString: "rgb(221,160,221)"},
	    {name: "powderblue", hex: "#b0e0e6", rgbString: "rgb(176,224,230)"},
	    {name: "purple", hex: "#800080", rgbString: "rgb(128,0,128)"},
	    {name: "rebeccapurple", hex: "#663399", rgbString: "rgb(102,51,153)"},
	    {name: "red", hex: "#ff0000", rgbString: "rgb(255,0,0)"},
	    {name: "rosybrown", hex: "#bc8f8f", rgbString: "rgb(188,143,143)"},
	    {name: "royalblue", hex: "#4169e1", rgbString: "rgb(65,105,225)"},
	    {name: "saddlebrown", hex: "#8b4513", rgbString: "rgb(139,69,19)"},
	    {name: "salmon", hex: "#fa8072", rgbString: "rgb(250,128,114)"},
	    {name: "sandybrown", hex: "#f4a460", rgbString: "rgb(244,164,96)"},
	    {name: "seagreen", hex: "#2e8b57", rgbString: "rgb(46,139,87)"},
	    {name: "seashell", hex: "#fff5ee", rgbString: "rgb(255,245,238)"},
	    {name: "sienna", hex: "#a0522d", rgbString: "rgb(160,82,45)"},
	    {name: "silver", hex: "#c0c0c0", rgbString: "rgb(192,192,192)"},
	    {name: "skyblue", hex: "#87ceeb", rgbString: "rgb(135,206,235)"},
	    {name: "slateblue", hex: "#6a5acd", rgbString: "rgb(106,90,205)"},
	    {name: "slategray", hex: "#708090", rgbString: "rgb(112,128,144)"},
	    {name: "snow", hex: "#fffafa", rgbString: "rgb(255,250,250)"},
	    {name: "springgreen", hex: "#00ff7f", rgbString: "rgb(0,255,127)"},
	    {name: "steelblue", hex: "#4682b4", rgbString: "rgb(70,130,180)"},
	    {name: "tan", hex: "#d2b48c", rgbString: "rgb(210,180,140)"},
	    {name: "teal", hex: "#008080", rgbString: "rgb(0,128,128)"},
	    {name: "thistle", hex: "#d8bfd8", rgbString: "rgb(216,191,216)"},
	    {name: "tomato", hex: "#ff6347", rgbString: "rgb(255,99,71)"},
	    {name: "turquoise", hex: "#40e0d0", rgbString: "rgb(64,224,208)"},
	    {name: "violet", hex: "#ee82ee", rgbString: "rgb(238,130,238)"},
	    {name: "wheat", hex: "#f5deb3", rgbString: "rgb(245,222,179)"},
	    {name: "white", hex: "#ffffff", rgbString: "rgb(255,255,255)"},
	    {name: "whitesmoke", hex: "#f5f5f5", rgbString: "rgb(245,245,245)"},
	    {name: "yellow", hex: "#ffff00", rgbString: "rgb(255,255,0)"},
	    {name: "yellowgreen", hex: "#9acd32", rgbString: "rgb(154,205,50)"}];
	var property;
	if (typeof value == "undefined"){
	    return colors;
	}
	if (value.substr(0, 1) == "#"){
	    property = "hex";
	} else if (value.substr(0, 3) == "rgb"){ 
	    property = "rgb";
	} else {
	    property = "name";
	}

	var color = colors.find(function(x){ return x[property] === value});
	// var color = colors.find(x => x[property] === value);
	if (!color) {
	    if (returnProperty){
		// if expecting a string
		return "";
	    } else {
		// expecing an object
		return false;
	    }
	} else if (!returnProperty || ["name", "hex", "rgb"].indexOf(returnProperty) == -1){
	    return color
	} else {
	    return color[returnProperty];
	}
    }
}
    