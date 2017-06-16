/*
 * Copyright (c) 2007 John Dyer (http://johndyer.name) MIT style license
 * Copyright © 2017 Michael Seifert (www.mseifert.com) All Rights Reserved
*/

$msRoot.createNS("ColorPicker.ColorValuePicker");
$msRoot.ColorPicker.ColorValuePicker = (function (id) {
    function ColorValuePicker(id) {
	var _this = this;
	this.id = id;

	this.onValuesChanged = null;
	this.onOpacityValuesChanged = null;

	this.hueInput = $ms.$(this.id + 'hue-input');
	this.saturationInput = $ms.$(this.id + 'saturation-input');
	this.valueInput = $ms.$(this.id + 'brightness-input');

	this.redInput = $ms.$(this.id + 'red-input');
	this.greenInput = $ms.$(this.id + 'green-input');
	this.blueInput = $ms.$(this.id + 'blue-input');

	this.hexInput = $ms.$(this.id + 'hex-input');
	this.opacityInput = $ms.$(this.id + 'opacity-input');

	this.hue2Input = $ms.$(this.id + 'hue2-input');
	this.saturation2Input = $ms.$(this.id + 'saturation2-input');
	this.lightnessInput = $ms.$(this.id + 'lightness-input');
	this.colorNameInput = $ms.$(this.id + 'color-name');

	// assign events
	// HSB
	this.hueInput.addEventListener('keyup', function(e){this.hsvKeyup(e)}.bind(this));
	this.saturationInput.addEventListener('keyup', function(e){this.hsvKeyup(e)}.bind(this));
	this.valueInput.addEventListener('keyup', function(e){this.hsvKeyup(e)}.bind(this));
	this.hueInput.addEventListener('blur', function(e){this.hsvBlur(e)}.bind(this));
	this.saturationInput.addEventListener('blur', function(e){this.hsvBlur(e)}.bind(this));
	this.valueInput.addEventListener('blur', function(e){this.hsvBlur(e)}.bind(this));

	this.hueInput.addEventListener('keydown', function(e){this.keydown(e, 0, 360, this.hsvKeyup)}.bind(this));
	this.saturationInput.addEventListener('keydown', function(e){this.keydown(e, 0, 100, this.hsvKeyup)}.bind(this));
	this.valueInput.addEventListener('keydown', function(e){this.keydown(e, 0, 100, this.hsvKeyup)}.bind(this));
	
	// RGB
	this.redInput.addEventListener('keyup', function(e){this.rgbKeyup(e)}.bind(this));
	this.greenInput.addEventListener('keyup', function(e){this.rgbKeyup(e)}.bind(this));
	this.blueInput.addEventListener('keyup', function(e){this.rgbKeyup(e)}.bind(this));
	this.redInput.addEventListener('blur', function(e){this.rgbBlur(e)}.bind(this));
	this.greenInput.addEventListener('blur', function(e){this.rgbBlur(e)}.bind(this));
	this.blueInput.addEventListener('blur', function(e){this.rgbBlur(e)}.bind(this));

	this.redInput.addEventListener('keydown', function(e){this.keydown(e, 0, 255, this.rgbKeyup)}.bind(this));
	this.greenInput.addEventListener('keydown', function(e){this.keydown(e, 0, 255, this.rgbKeyup)}.bind(this));
	this.blueInput.addEventListener('keydown', function(e){this.keydown(e, 0, 255, this.rgbKeyup)}.bind(this));

	// HSL
	this.hue2Input.addEventListener('keyup', function(e){this.hslKeyup(e)}.bind(this));
	this.saturation2Input.addEventListener('keyup', function(e){this.hslKeyup(e)}.bind(this));
	this.lightnessInput.addEventListener('keyup', function(e){this.hslKeyup(e)}.bind(this));
	this.hue2Input.addEventListener('blur', function(e){this.hslBlur(e)}.bind(this));
	this.saturation2Input.addEventListener('blur', function(e){this.hslBlur(e)}.bind(this));
	this.lightnessInput.addEventListener('blur', function(e){this.hslBlur(e)}.bind(this));

	this.hue2Input.addEventListener('keydown', function(e){this.keydown(e, 0, 360, this.hslKeyup)}.bind(this));
	this.saturation2Input.addEventListener('keydown', function(e){this.keydown(e, 0, 100, this.hslKeyup)}.bind(this));
	this.lightnessInput.addEventListener('keydown', function(e){this.keydown(e, 0, 100, this.hslKeyup)}.bind(this));
	
	// HEX
	this.hexInput.addEventListener('keyup', function(e){this.hexKeyup(e)}.bind(this));
	this.hexInput.addEventListener('keydown', function(e){this.keydown(e, 0, 255, this.hexKeyup)}.bind(this));

	// opacity
	this.opacityInput.addEventListener('blur', function(e){this.opacityBlur(e)}.bind(this));
	this.opacityInput.addEventListener("keydown", function(e){this.keydown(e, 0, 100, this.opacityKeyup)}.bind(this));
	this.opacityInput.addEventListener("keyup", function(e){this.keydown(e, 0, 100, this.opacityKeyup)}.bind(this));

	// color name
	this.colorNameInput.addEventListener("keyup", function(e){this.setValuesFromName()}.bind(this));

	this.color = new $msRoot.ColorPicker.Color();

	// get an initial value
	if (this.hexInput.value != '')
	    this.color.setHex(this.hexInput.value);


	// set the others based on initial value
	this.hexInput.value = this.color.hex;

	this.redInput.value = this.color.r;
	this.greenInput.value = this.color.g;
	this.blueInput.value = this.color.b;

	this.hueInput.value = this.color.h;
	this.saturationInput.value = this.color.s;
	this.valueInput.value = this.color.v;

    }
    ColorValuePicker.prototype.hsvKeyup = function (e) {
	if (e.target.value == '')
	    return;
	this.validateHsv(e);
	this.setValuesFromHsv();
	if (this.onValuesChanged)
	    this.onValuesChanged();
    }
    ColorValuePicker.prototype.rgbKeyup = function (e) {
	if (e.target.value == '')
	    return;
	this.validateRgb(e);
	this.setValuesFromRgb();
	if (this.onValuesChanged)
	    this.onValuesChanged();
    }
    ColorValuePicker.prototype.hslKeyup = function (e) {
	if (e.target.value == '')
	    return;
	this.validateHsl(e);
	this.setValuesFromHsl();
	if (this.onValuesChanged)
	    this.onValuesChanged();
    }
    ColorValuePicker.prototype.hexKeyup = function (e) {
	if (e.target.value == '')
	    return;
	this.validateHex(e);
	this.setValuesFromHex();
	if (this.onValuesChanged)
	    this.onValuesChanged();
    }
    ColorValuePicker.prototype.opacityKeyup = function(e) {
	if (e.target.value == '')
	    return;
	this.opacityInputValueChanged(e.target);
    }
    ColorValuePicker.prototype.hsvBlur = function (e) {
	if (e.target.value == '')
	    this.setValuesFromRgb();
    }
    ColorValuePicker.prototype.hslBlur = function (e) {
	if (e.target.value == '')
	    this.setValuesFromHsl();
    }
    ColorValuePicker.prototype.rgbBlur = function (e) {
	if (e.target.value == '')
	    this.setValuesFromHsv();
    }
    ColorValuePicker.prototype.hexBlur = function (e) {
	if (e.target.value == '')
	    this.setValuesFromHsv();
    }
    ColorValuePicker.prototype.opacityKeyup = function(){
	var value = parseInt(this.opacityInput.value);
	if (value == 0 && value !== this.opacityInput.value){
	    // invalid entry - don't hide control
	    value = 100;
	}
	if (value < 0 || value > 100){
	    value = 100;
	}	
	this.opacityInput.value = value;
	if (this.onOpacityValuesChanged)
	    this.onOpacityValuesChanged();
    }
    ColorValuePicker.prototype.opacityBlur = function(e) {
	if (e.target.value == '')
	    this.opacityKeyup();
    }
    
    ColorValuePicker.prototype.keydown = function (e, min, max, cb){
	if (e.keyCode == 38) {
	    // up
	    if (typeof min == "undefined") return;
	    e.target.value = Math.min(parseInt(e.target.value) + 1, max);
	    // if (e.target.value == 360) e.target.value = 0;
	    if (cb){
		cb.call(this, e);
	    }
	    e.stopPropagation();
	} else if (e.keyCode == 40) {
	    // down
	    if (typeof min == "undefined") return;
	    e.target.value = Math.max(parseInt(e.target.value) - 1, min);
	    if (cb){
		cb.call(this, e);
	    }
	    e.stopPropagation();
	} else if (cb) {
	    cb.call(this, e);
	}
    }
    
    ColorValuePicker.prototype.validateRgb = function (e) {
	if (!this._keyNeedsValidation(e))
	    return e;
	this.redInput.value = this._setValueInRange(this.redInput.value, 0, 255);
	this.greenInput.value = this._setValueInRange(this.greenInput.value, 0, 255);
	this.blueInput.value = this._setValueInRange(this.blueInput.value, 0, 255);
    }
    ColorValuePicker.prototype.validateHsv = function (e) {
	if (!this._keyNeedsValidation(e))
	    return e;
	this.hueInput.value = this._setValueInRange(this.hueInput.value, 0, 359);
	this.saturationInput.value = this._setValueInRange(this.saturationInput.value, 0, 100);
	this.valueInput.value = this._setValueInRange(this.valueInput.value, 0, 100);
    }
    ColorValuePicker.prototype.validateHsl = function (e) {
	if (!this._keyNeedsValidation(e))
	    return e;
	this.hue2Input.value = this._setValueInRange(this.hue2Input.value, 0, 359);
	this.saturation2Input.value = this._setValueInRange(this.saturation2Input.value, 0, 100);
	this.lightnessInput.value = this._setValueInRange(this.lightnessInput.value, 0, 100);
    }
    ColorValuePicker.prototype.validateHex = function (e) {
	if (!this._keyNeedsValidation(e))
	    return e;
	var hex = new String(this.hexInput.value).toUpperCase();
	if (hex.substr(0,1) == "#"){
	    hex = hex.substr(1);
	}
	hex = hex.replace(/[^A-F0-9]/g, '0');
	if (hex.length > 6)
	    hex = hex.substring(0, 6);
	this.hexInput.value = "#" + hex;
    }
    ColorValuePicker.prototype._keyNeedsValidation = function (e) {

	if (e.keyCode == 9 || // TAB
		e.keyCode == 16 || // Shift
		e.keyCode == 38 || // Up arrow
		e.keyCode == 29 || // Right arrow
		e.keyCode == 40 || // Down arrow
		e.keyCode == 37    // Left arrow
		||
		(e.ctrlKey && (e.keyCode == 'c'.charCodeAt() || e.keyCode == 'v'.charCodeAt()))
		)
	    return false;

	return true;
    }
    ColorValuePicker.prototype._setValueInRange = function (value, min, max) {
	if (value == '' || isNaN(value))
	    return min;

	value = parseInt(value);
	if (value > max)
	    return max;
	if (value < min)
	    return min;

	return value;
    }
    ColorValuePicker.prototype.setValuesFromRgb = function () {
	this.color.setRgb(this.redInput.value, this.greenInput.value, this.blueInput.value, this.opacityInput.value);
	this.hexInput.value = this.color.hex;
	this.hueInput.value = this.color.h;
	this.saturationInput.value = this.color.s;
	this.valueInput.value = this.color.v;
	
	this.hue2Input.value = this.color.h2;
	this.saturation2Input.value = this.color.s2;
	this.lightnessInput.value = this.color.l;
    }
    ColorValuePicker.prototype.setValuesFromHsv = function () {
	this.color.setHsv(parseInt(this.hueInput.value), parseInt(this.saturationInput.value), parseInt(this.valueInput.value), this.opacityInput.value);
	this.hexInput.value = this.color.hex;
	this.redInput.value = this.color.r;
	this.greenInput.value = this.color.g;
	this.blueInput.value = this.color.b;
	
	this.hue2Input.value = this.color.h2;
	this.saturation2Input.value = this.color.s2;
	this.lightnessInput.value = this.color.l;
    }
    ColorValuePicker.prototype.setValuesFromHsl = function () {
	this.color.setHsl(parseInt(this.hue2Input.value), parseInt(this.saturation2Input.value), parseInt(this.lightnessInput.value), this.opacityInput.value);
	this.hexInput.value = this.color.hex;
	this.redInput.value = this.color.r;
	this.greenInput.value = this.color.g;
	this.blueInput.value = this.color.b;
	
	this.hueInput.value = this.color.h;
	this.saturationInput.value = this.color.s;
	this.valueInput.value = this.color.v;
    }
    ColorValuePicker.prototype.setValuesFromHex = function () {
	this.color.setHex(this.hexInput.value, this.opacityInput.value);

	this.redInput.value = this.color.r;
	this.greenInput.value = this.color.g;
	this.blueInput.value = this.color.b;

	this.hueInput.value = this.color.h;
	this.saturationInput.value = this.color.s;
	this.valueInput.value = this.color.v;
	
	this.hue2Input.value = this.color.h2;
	this.saturation2Input.value = this.color.s2;
	this.lightnessInput.value = this.color.l;
    },
    ColorValuePicker.prototype.setValuesFromOpacity = function () {
	this.color.setOpacity(this.opacityInput.value);
    },
    ColorValuePicker.prototype.setColorName = function () {
	// from hex to name
	var name = $msRoot.colorMethods.colorNameInfo(this.hexInput.value, "name");
	this.colorNameInput.value = name;
	this.validName = true;
    },
    ColorValuePicker.prototype.setValuesFromName = function () {
	// from entered name to hex
	if (this.colorNameInput.value.length == 0){
	    this.validName = "empty";
	} else {
	    this.validName = false;
	    var hex = $msRoot.colorMethods.colorNameInfo(this.colorNameInput.value, "hex");
	    if (hex.length > 0){
		this.validName = true;
		this.hexInput.value = hex;
		this.setValuesFromHex();
	    }
	}
	if (this.onValuesChanged){
	    this.onValuesChanged();
	}
    }
    
    return ColorValuePicker;
})();
