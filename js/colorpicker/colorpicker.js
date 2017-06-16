/*
 * Copyright (c) 2007 John Dyer (http://johndyer.name)
 * MIT style license
 * 
 * This colorPicker has been re-written in pure js with a lot of additions
 * Copyright © 2017 Michael Seifert (www.mseifert.com) All Rights Reserved
*/

// target object contains: 
//	    element - the element to act upon
//	    property - sets the element's property with selected color
//	    valueAttribute - shows the rgb text using the element attribute (e.g. value, innerHTML) 
//	    textColor = sets color of text (if valueAttribute is set) 
//		    Valid values:
//		    "color" (or undefined) = sets property in selected rgb value
//		    "contrast" = sets property in contrasting color

$msRoot.createNS("ColorPicker");
$msRoot.ColorPicker = (function (settings) {
    var instance = [];
    var instanceCounter = 0;
    var defaultSettings = {
	imgPath: $ms.STATIC_JS_COMMON + "/colorpicker/img",
	startMode: 'h',
	startColor: '',
	startPos: undefined,
	target: undefined,	// an array of elements to update when values change
	fontSize: 75,		// percent
	zIndex: 1000,
	container: undefined,
	cbClose: undefined,
	cbChange: undefined,
	cbCreate: undefined,
	// for gradient
	pin: false,		// whether to show the pin to allow pinning to the gradient
	startPinned: false,
	allowGradient: true,
	gradient: undefined,
	fromGradient: false,
	minimal: false
    };
    
    var dependants = [
	{file: "localdata.min.js", ns: "LocalData"},
	{file: "localfile.min.js", ns: "LocalFile"},
	{file: "editable-combo.min.js", ns: "EditableCombo"},
	{file: "custom-dialog.min.js", ns: "CustomDialog"},
	{file: "dragdrop.min.js", ns: "DragDrop"},
	{file: "slider.min.js", ns: "Slider"},
	{file: "colorlibrary.min.js", ns: "ColorPicker.ColorLibrary", subDir: "colorpicker"},
	{file: "colormethods.min.js", ns: "ColorPicker.Color", subDir: "colorpicker"},
	{file: "colorvaluepicker.min.js", ns: "ColorPicker.ColorValuePicker", subDir: "colorpicker"},
	// {file: "gradient.min.js", ns: "Gradient", subDir: "colorpicker"},
	// preload default map
	// onloadTest equates to the function "onload" which has special logic
	{file: "map-hue.png", baseDir: "js", subDir: "colorpicker/img", id: "cp-map-hue-png", dependencies: [{file: $ms.sourceFiles.onloadTest}]}
    ]
    $ms.sourceFiles.add(dependants);
    $ms.sourceFiles.load();
  
    ColorPicker.getInstance = function(instanceId){
	if (typeof instanceId !== "undefined"){
	    for (var i = 0; i < instance.length; i++){
		if (instance[i].id == instanceId){
		    // search by instanceId
		    return instance[i];
		}
	    }
	} else {
	    // with no parameters, return array of all instances
	    return instance;
	}
    }
    function ColorPicker(settings) {
	var _this = this;
	
	this.keyupFn = function(e){this.keyup(e)}.bind(this);
	
	instance.push(this);
	this.id = "ms-colorpicker-" + instanceCounter++ + "-";;
	this.colorMap;
	this.colorBar;
	this.opacitySlider;
	this.cpLibrary;
	this.previewOrigSet = false;	
	this.isPinned = false;
	
	this.settings = $ms.cloneSettings(defaultSettings, settings);
	if (this.settings.imgPath.length > 0 && this.settings.imgPath.substr(-1) !== "/") { 
	    this.settings.imgPath += "/";
	}
	if (!this.settings.container){
	    this.settings.container = document.body;
	}
	// create the color library form with the controls
	var settings = {
	    cbSetColor: function(color){this.setColor(color)}.bind(this),
	    saveLabel: "Save Color",
	    libSuffix: "cp",
	    valueToSet: "rgbString",
	    cbResize: function(mode){
		if (mode == "open"){
		    $ms.addClass($ms.$(this + "name-label"), "display-none");
		} else {
		    $ms.removeClass($ms.$(this + "name-label"), "display-none");
		}
	    }.bind(this)
	}
	this.cpLibrary = new $msRoot.ColorPicker.ColorLibrary(settings);
	
	// create the form
	this.container = this.createForm();
	$ms.draggable(this.container, 
	    {scope: "default", 
	    handle: this.id + "title-bar",
	    cbDrop: this.drop.bind(this)
	});

	if (this.settings.startPinned && this.settings.gradient){
	    // gradient is open - will set position with show
	    this.pinToGradient();
	} else if (this.settings.startPos){
	    this.settings.startPos.top = this.settings.startPos.top + "px";
	    this.settings.startPos.left = this.settings.startPos.left + "px";
	} else if (this.settings.source){
	    // source - the input or button which initiated the call to colorpicker
	    // open the colorpicker just below and 20px to the right of the the source's left
	    var rect = $ms.getOffset(this.settings.source);
	    var scroll = $ms.getScroll();
	    this.settings.startPos = {};
	    this.settings.startPos.top = rect["top"] + rect["height"] + scroll.y + "px";
	    this.settings.startPos.left = rect["left"] + (20 + instance.length) + scroll.x + "px";
	} else {
	    this.settings.startPos = {top: 100 + (20 * instance.length) + "px", left: 100 + (20 * instance.length) + "px"};
	}

	var wSize = $ms.windowSize();
	var containerWidth = parseInt($ms.getPropertyValue(this.container, "width"));
	var containerHeight = parseInt($ms.getPropertyValue(this.container, "height"));
	this.container.style.top = Math.max(0, Math.min(wSize.y - containerHeight, parseInt(this.settings.startPos.top))) + "px";
	this.container.style.left = Math.max(0, Math.min(wSize.x - containerWidth, parseInt(this.settings.startPos.left))) + "px";
	
	// attach radio & check boxes
	this.hueRadio = $ms.$(this.id + 'hue-radio');
	this.saturationRadio = $ms.$(this.id + 'saturation-radio');
	this.valueRadio = $ms.$(this.id + 'brightness-radio');

	this.redRadio = $ms.$(this.id + 'red-radio');
	this.greenRadio = $ms.$(this.id + 'green-radio');
	this.blueRadio = $ms.$(this.id + 'blue-radio');
	this.notSetCheck = $ms.$(this.id + 'not-set-check');
	this.opacityInput = $ms.$(this.id + 'opacity-input');
	
	this.hue2Radio = $ms.$(this.id + 'hue2-radio');
	this.saturation2Radio = $ms.$(this.id + 'saturation2-radio');
	this.lightnessRadio = $ms.$(this.id + 'lightness-radio');
	this.colorNameInput = $ms.$(this.id + "color-name");
	//this._webSafeCheck = $ms.$(this.id + '_WebSafeCheck');

	this.hueRadio.value = 'h';
	this.saturationRadio.value = 's';
	this.valueRadio.value = 'v';

	this.redRadio.value = 'r';
	this.greenRadio.value = 'g';
	this.blueRadio.value = 'b';

	this.hue2Radio.value = 'h2';
	this.saturation2Radio.value = 's2';
	this.lightnessRadio.value = 'l';
	
	// attach events to radio & checks

	this.hueRadio.addEventListener('click', function(e){this.radioClicked(e)}.bind(this));
	this.saturationRadio.addEventListener('click', function(e){this.radioClicked(e)}.bind(this));
	this.valueRadio.addEventListener('click', function(e){this.radioClicked(e)}.bind(this));

	this.redRadio.addEventListener('click', function(e){this.radioClicked(e)}.bind(this));
	this.greenRadio.addEventListener('click', function(e){this.radioClicked(e)}.bind(this));
	this.blueRadio.addEventListener('click', function(e){this.radioClicked(e)}.bind(this));
	this.blueRadio.addEventListener('click', function(e){this.radioClicked(e)}.bind(this));

	this.hue2Radio.addEventListener('click', function(e){this.radioClicked(e)}.bind(this));
	this.saturation2Radio.addEventListener('click', function(e){this.radioClicked(e)}.bind(this));
	this.lightnessRadio.addEventListener('click', function(e){this.radioClicked(e)}.bind(this));

	this.notSetCheck.addEventListener('click', function(e){this.notSetCheckClicked(e)}.bind(this));
	
	window.addEventListener('keyup', _this.keyupFn);
	
	//this._event_webSafeClicked = this._onWebSafeClicked.bindAsEventListener(this);
	//Event.observe( this._webSafeCheck, 'click', this._event_webSafeClicked);

	// attach simple properties
	this.preview = $ms.$(this.id + "preview");
	this.previewOrig = $ms.$(this.id + "preview-orig");
	this.cssText = $ms.$(this.id + "css-text");

	// load default library
	this.cpLibrary.libraryNameCombo.setValue("Default");
	this.cpLibrary.libraryNameCombo.settings.cbChange({value: "Default"}, true);
	
	// MAP
	this.mapBase = this.colorMap;
	this.mapBase.style.width = '256px';
	this.mapBase.style.height = '256px';
	this.mapBase.style.padding = 0;
	this.mapBase.style.margin = 0;
	this.mapBase.style.border = 'solid 1px #000';

	this.mapL1 = document.createElement('img');
	this.mapL1.src = this.settings.imgPath + 'blank.gif';
	this.mapL1.width = 256;
	this.mapL1.height = 256;
	this.mapL1.style.margin = '0px';
	this.mapL1.className = "ms-no-select";
	this.mapBase.appendChild(this.mapL1);

	// this map is needed for hsl so there is a layer between two other maps
	this.mapL1b = document.createElement('img');
	this.mapL1b.src = this.settings.imgPath + 'blank.gif';
	this.mapL1b.width = 256;
	this.mapL1b.height = 256;
	this.mapBase.appendChild(this.mapL1b);
	this.mapL1b.style.clear = 'both';
	this.mapL1b.style.margin = '-256px 0px 0px 0px';
	this.mapL1b.style.opacity = "0";
	this.mapL1b.className = "ms-no-select";

	this.mapL2 = document.createElement('img');
	this.mapL2.src = this.settings.imgPath + 'blank.gif';
	this.mapL2.width = 256;
	this.mapL2.height = 256;
	this.mapBase.appendChild(this.mapL2);
	this.mapL2.style.clear = 'both';
	this.mapL2.style.margin = '-256px 0px 0px 0px';
	this.mapL2.style.opacity = ".5";
	this.mapL2.className = "ms-no-select";

	// BAR
	this._bar = this.colorBar;
	this._bar.style.width = '20px';
	this._bar.style.height = '256px';
	this._bar.style.padding = 0;
	this._bar.style.margin = '0px 10px';
	this._bar.style.border = 'solid 1px #000';
	this._bar.className = "ms-no-select";

	this._barL1 = document.createElement('img')
	this._barL1.src = this.settings.imgPath + 'blank.gif';
	this._barL1.width = 20;
	this._barL1.height = 256;
	this._barL1.style.margin = '0px';
	this._bar.appendChild(this._barL1);

	this._barL2 = document.createElement('img')
	this._barL2.src = this.settings.imgPath + 'blank.gif';
	this._barL2.width = 20;
	this._barL2.height = 256;
	this._barL2.style.margin = '-256px 0px 0px 0px';
	this._bar.appendChild(this._barL2);

	this._barL3 = document.createElement('img')
	this._barL3.src = this.settings.imgPath + 'blank.gif';
	this._barL3.width = 20;
	this._barL3.height = 256;
	this._barL3.style.margin = '-256px 0px 0px 0px';
	this._barL3.style.backgroundColor = '#ff0000';
	this._bar.appendChild(this._barL3);

	// this._barL4 needs an id - it will receive mousemove events where we need to confirm the source id
	this._barL4 = document.createElement('img')
	this._barL4.id = this.id + "color-bar-img";
	this._barL4.src = this.settings.imgPath + 'blank.gif';
	this._barL4.width = 20;
	this._barL4.height = 256;
	this._barL4.style.margin = '-256px 0px 0px 0px';
	this._bar.appendChild(this._barL4);
	
	// attach color values
	this.cvp = new $msRoot.ColorPicker.ColorValuePicker(this.id);

	// attach map slider
	var target = [this.cvp.hexInput, this.cvp.hueInput, this.cvp.saturationInput, 
	    this.cvp.valueInput, this.cvp.redInput, this.cvp.greenInput, this.cvp.blueInput,
	    this.hueRadio, this.saturationRadio, this.valueRadio, this.redRadio, this.greenRadio, this.blueRadio];
	this.map = new $msRoot.Slider(this.mapL2, {xMinValue: 0, xMaxValue: 255, yMinValue: 0, yMaxValue: 255, 
	    arrowImage: 'mappoint.gif', 
	    imgPath: this.settings.imgPath,
	    container: this.mapBase, direction: "both", 
	    parentNode: this.container, target: target,
	    cbSliderMouseup: function(){this.sliderMouseup()}.bind(this),
	    hideCursor: true,	    // hide the cursor with mousedown
	    throttle: 30	    // update the color values every x ms (requestAnimationFrame() will do approx every 16mx)
	});

	// attach color slider
	this.slider = new $msRoot.Slider(this._barL4, {xMinValue: 1, xMaxValue: 1, yMinValue: 0, yMaxValue: 255,
	    arrowImage: 'rangearrows.gif', 
	    imgPath: this.settings.imgPath,
	    container: this.colorBar, direction:"vertical", 
	    bar2: this._bar,
	    cbSliderMouseup: function(){this.sliderMouseup()}.bind(this)
	});

	// link up events
	this.slider.onValuesChanged = function (){this.sliderValueChanged()}.bind(this);
	this.map.onValuesChanged = function (){this.mapValueChanged()}.bind(this);
	this.cvp.onValuesChanged = function (){this.textValuesChanged()}.bind(this);
	this.cvp.onOpacityValuesChanged = function (){this.opacityValuesChanged()}.bind(this);
	
	// browser!
	this.isLessThanIE7 = false;
	var version = parseFloat(navigator.appVersion.split("MSIE")[1]);
	if ((version < 7) && (document.body.filters))
	    this.isLessThanIE7 = true;

	
	var startColor;
	if (this.settings.allowGradient && this.settings.startColor.indexOf("gradient") !== -1 && !this.settings.fromGradientStartColor){
	    // If startColor is a gradient will auto open the gradient interface and hide colorpicker
	    // open gradient - will hide colorpicker
	    this.openGradient(this.settings.startColor, true);
	    return;
	}

	if (this.settings.fromGradientStartColor) {
	    startColor = this.settings.fromGradientStartColor
	} else {
	    startColor = this.settings.startColor;
	}
	if (startColor.indexOf("transparent") !== -1){
	    startColor = "rgba(255,255,255,0)";
	}
	startColor = startColor.trim();
	if (startColor.length > 0 && 
		startColor.substr(0, 1) !== "#" && 
		startColor.substr(0, 3) !== "rgb") {
	    // if color is a name - convert to rgb value
	    // temp object
	    var div = document.createElement("div");
	    div.style.color = startColor;
	    startColor = getComputedStyle(div).getPropertyValue("color");
	}
	// simple color mode
	var startColorInfo = $msRoot.colorMethods.colorInfo(startColor);
	this.cvp.hexInput.value = startColorInfo.hex;
	this.opacityInput.value = parseInt(startColorInfo.alpha * 100);
	if (this.opacityInput.value == 0){
	    this.opacityInput.style.color = "red";
	} else {
	    this.opacityInput.style.color = "black";
	}
	if (startColorInfo.hex == ""){
	    this.notSetCheck.checked = true;
	}
	this.cvp.setValuesFromHex();
	this.setColorMode(this.settings.startMode);
	this.positionArrows();
	this.positionOpacityArrows();
	this.updateVisuals();
	if (this.settings.cbCreate){
	    if (Array.isArray(this.settings.cbCreate)){
		for (var i = 0; i < this.settings.cbCreate.length; i++){
		    this.settings.cbCreate[i](this);		    
		}
	    } else {
		this.settings.cbCreate(this);
	    }
	}
    }
    
    // called ONLY from gradient - will set zIndex and unhide
    ColorPicker.prototype.show = function (zIndex) {
	this.container.style.zIndex = zIndex;	
	// must remove display-none first
	$ms.removeClass(this.container, "display-none");
	this.drop(true);
    }

    ColorPicker.prototype.hide = function () {
	$ms.addClass(this.container, "display-none");
    }
    ColorPicker.prototype.radioClicked = function (e) {
	this.setColorMode(e.target.value);
    }
    ColorPicker.prototype._onWebSafeClicked = function (e) {
	// reset
	this.setColorMode(this.ColorMode);
    }
    ColorPicker.prototype.textValuesChanged = function () {
	if (this.cvp.validName === "empty") {
	    this.cssText.innerHTML = this.getCss();
	    this.cssText.title = this.cssText.innerHTML.replace(/<[^>]+>/g, "  ");
	    this.cvp.validName = null;
	    return;
	} else if (this.cvp.validName === false) {
	    this.cssText.innerHTML = "<span style='color:red'>Color name not found.</span>";
	    this.cssText.title = "";
	    this.cvp.validName = null;
	    return;
	}
	this.cvp.setColorName();
	this.positionArrows();
	this.updateVisuals();
	this.updateGradientFromInput();
    }
    ColorPicker.prototype.opacityValuesChanged = function () {
	this.cvp.setValuesFromOpacity();
	this.positionOpacityArrows();
	this.updateVisuals();
	this.updateGradientFromInput();
    }
    ColorPicker.prototype.notSetCheckClicked = function(){
	if (this.notSetCheck.checked) {
	    // checking NOT SET
	    this.previousValue = Object.assign({}, this.cvp.color)
	    this.previousValue.rgb = this.previousValue.rgb.slice(0);
	    this.previousValue.alpha = this.opacityInput.value / 100;
	    this.cvp.hexInput.value = "";
	    this.opacityInput.value = 100;
	} else {
	    // unchecking NOT SET
	    if (!this.previousValue){
		this.previousValue = $msRoot.colorMethods.colorInfo(this.settings.startColor);
	    }
	    this.cvp.hexInput.value = this.previousValue.hex;
	    this.opacityInput.value = this.previousValue.alpha * 100;
	}
	this.cvp.setValuesFromHex();
	this.positionArrows();
	this.positionOpacityArrows();
	this.updateVisuals();
	this.updateGradientFromInput();
    }
    ColorPicker.prototype.setColorMode = function(colorMode) {
	var _this = this;
	this.color = this.cvp.color;

	// reset all images		
	function resetImage(cp, img) {
	    cp.setAlpha(img, 100);
	    img.style.backgroundColor = '';
	    img.src = cp.settings.imgPath + 'blank.gif';
	    img.style.filter = '';
	}
	resetImage(this, this.mapL1);
	resetImage(this, this.mapL1b);
	resetImage(this, this.mapL2);
	resetImage(this, this._barL1);
	resetImage(this, this._barL2);
	resetImage(this, this._barL3);
	resetImage(this, this._barL4);

	this.hueRadio.checked = false;
	this.saturationRadio.checked = false;
	this.valueRadio.checked = false;
	this.redRadio.checked = false;
	this.greenRadio.checked = false;
	this.blueRadio.checked = false;
	this.hue2Radio.checked = false;
	this.saturation2Radio.checked = false;
	this.lightnessRadio.checked = false;

	switch (colorMode) {
	    case 'h':
		this.hueRadio.checked = true;

		// MAP
		// put a color layer on the bottom
		this.mapL1.style.backgroundColor = this.color.hex;

		// add a hue map on the top
		this.mapL2.style.backgroundColor = 'transparent';
		this.setImg(this.mapL2, this.settings.imgPath + 'map-hue.png');
		this.setAlpha(this.mapL2, 100);

		// SLIDER
		// simple hue map
		this.setImg(this._barL4, this.settings.imgPath + 'bar-hue.png');

		this.map.settings.xMaxValue = 100;
		this.map.settings.yMaxValue = 100;
		this.slider.settings.yMaxValue = 360;

		break;

	    case 's':
		this.saturationRadio.checked = true;

		// MAP
		// bottom has saturation map
		this.setImg(this.mapL1, this.settings.imgPath + 'map-saturation.png');

		// top has overlay
		this.setImg(this.mapL2, this.settings.imgPath + 'map-saturation-overlay.png');
		this.setAlpha(this.mapL2, 0);

		// SLIDER
		// bottom: color
		this.setBG(this._barL3, this.color.hex);

		// top: graduated overlay
		this.setImg(this._barL4, this.settings.imgPath + 'bar-saturation.png');


		this.map.settings.xMaxValue = 360;
		this.map.settings.yMaxValue = 100;
		this.slider.settings.yMaxValue = 100;

		break;

	    case 'v':
		this.valueRadio.checked = true;

		// MAP
		// bottom: nothing

		// top
		this.setBG(this.mapL1, '000');
		this.setImg(this.mapL2, this.settings.imgPath + 'map-brightness.png');

		// SLIDER
		// bottom
		this._barL3.style.backgroundColor = this.color.hex;

		// top				
		this.setImg(this._barL4, this.settings.imgPath + 'bar-brightness.png');


		this.map.settings.xMaxValue = 360;
		this.map.settings.yMaxValue = 100;
		this.slider.settings.yMaxValue = 100;
		break;

	    case 'r':
		this.redRadio.checked = true;
		this.setImg(this.mapL2, this.settings.imgPath + 'map-red-max.png');
		this.setImg(this.mapL1, this.settings.imgPath + 'map-red-min.png');

		this.setImg(this._barL4, this.settings.imgPath + 'bar-red-tl.png');
		this.setImg(this._barL3, this.settings.imgPath + 'bar-red-tr.png');
		this.setImg(this._barL2, this.settings.imgPath + 'bar-red-br.png');
		this.setImg(this._barL1, this.settings.imgPath + 'bar-red-bl.png');

		break;

	    case 'g':
		this.greenRadio.checked = true;
		this.setImg(this.mapL2, this.settings.imgPath + 'map-green-max.png');
		this.setImg(this.mapL1, this.settings.imgPath + 'map-green-min.png');

		this.setImg(this._barL4, this.settings.imgPath + 'bar-green-tl.png');
		this.setImg(this._barL3, this.settings.imgPath + 'bar-green-tr.png');
		this.setImg(this._barL2, this.settings.imgPath + 'bar-green-br.png');
		this.setImg(this._barL1, this.settings.imgPath + 'bar-green-bl.png');

		break;

	    case 'b':
		this.blueRadio.checked = true;
		this.setImg(this.mapL2, this.settings.imgPath + 'map-blue-max.png');
		this.setImg(this.mapL1, this.settings.imgPath + 'map-blue-min.png');

		this.setImg(this._barL4, this.settings.imgPath + 'bar-blue-tl.png');
		this.setImg(this._barL3, this.settings.imgPath + 'bar-blue-tr.png');
		this.setImg(this._barL2, this.settings.imgPath + 'bar-blue-br.png');
		this.setImg(this._barL1, this.settings.imgPath + 'bar-blue-bl.png');

		//this.setImg(this._barL4, this.settings.imgPath + 'bar-hue.png');			
		break;

	    case 'h2':
		this.hue2Radio.checked = true;

		// MAP
		// put a color layer on the bottom
		this.mapL1.style.backgroundColor = this.color.hex;

		// add a hue map on the top
		this.mapL2.style.backgroundColor = 'transparent';
		this.setImg(this.mapL2, this.settings.imgPath + 'map-hsl-hue.png');
		this.setAlpha(this.mapL2, 100);

		// SLIDER
		// simple hue map
		this.setImg(this._barL4, this.settings.imgPath + 'bar-hue.png');

		this.map.settings.xMaxValue = 100;
		this.map.settings.yMaxValue = 100;
		this.slider.settings.yMaxValue = 360;

		break;

	    case 's2':
		this.saturation2Radio.checked = true;

		// MAP
		// bottom has saturation map
		this.setImg(this.mapL1, this.settings.imgPath + 'map-hsl-saturation.png');
		this.setAlpha(this.mapL2, 99);

		// middle has a lay of gray that fades when saturation increases
		this.setBG(this.map1b, "rgb(128,128,128)");
		this.setAlpha(this.mapL1b, 0);

		// top has overlay
		this.setImg(this.mapL2, this.settings.imgPath + 'map-hsl-saturation-overlay.png');

		// SLIDER
		// bottom: color
		this.setBG(this._barL3, this.color.hex);

		// top: graduated overlay
		this.setImg(this._barL4, this.settings.imgPath + 'bar-saturation.png');


		this.map.settings.xMaxValue = 360;
		this.map.settings.yMaxValue = 100;
		this.slider.settings.yMaxValue = 100;

		break;

	    case 'l':
		this.lightnessRadio.checked = true;

		// MAP
		// bottom: 
		this.setImg(this.mapL1, this.settings.imgPath + 'map-hsl-lightness.png');

		// top
		this.setBG(this.mapL2, "rgb(255,255,255)");
		this.setAlpha(this.mapL2, 0);

		// SLIDER
		// bottom
		this._barL3.style.backgroundColor = this.color.hex;

		// top				
		this.setImg(this._barL4, this.settings.imgPath + 'bar-brightness.png');


		this.map.settings.xMaxValue = 360;
		this.map.settings.yMaxValue = 100;
		this.slider.settings.yMaxValue = 100;
		break;

	    default:
		alert('invalid mode');
		break;
	}

	switch (colorMode) {
	    case 'h':
	    case 's':
	    case 'v':

		this.map.settings.xMinValue = 0;
		this.map.settings.yMinValue = 0;
		this.slider.settings.yMinValue = 0;
		break;

	    case 'r':
	    case 'g':
	    case 'b':

		this.map.settings.xMinValue = 0;
		this.map.settings.yMinValue = 0;
		this.slider.settings.yMinValue = 0;

		this.map.settings.xMaxValue = 255;
		this.map.settings.yMaxValue = 255;
		this.slider.settings.yMaxValue = 255;
		break;

	    case 'h2':
	    case 's2':
	    case 'l':
		this.map.settings.xMinValue = 0;
		this.map.settings.yMinValue = 0;
		this.slider.settings.yMinValue = 0;
		break;
	}

	this.ColorMode = colorMode;

	this.positionArrows();
	this.updateMapVisuals();
	this.updateSliderVisuals();
    }
    ColorPicker.prototype.mapValueChanged = function() {
	// update values

	switch (this.ColorMode) {
	    case 'h':
		this.cvp.saturationInput.value = $ms.round(this.map.xValue);
		this.cvp.valueInput.value = $ms.round(100 - this.map.yValue);
		break;

	    case 's':
		this.cvp.hueInput.value = $ms.round(this.map.xValue);
		this.cvp.valueInput.value = $ms.round(100 - this.map.yValue);
		break;

	    case 'v':
		this.cvp.hueInput.value = $ms.round(this.map.xValue);
		this.cvp.saturationInput.value = $ms.round(100 - this.map.yValue);
		break;

	    case 'r':
		this.cvp.blueInput.value = $ms.round(this.map.xValue);
		this.cvp.greenInput.value = $ms.round(256 - this.map.yValue);
		break;

	    case 'g':
		this.cvp.blueInput.value = $ms.round(this.map.xValue);
		this.cvp.redInput.value = $ms.round(256 - this.map.yValue);
		break;

	    case 'b':
		this.cvp.redInput.value = $ms.round(this.map.xValue);
		this.cvp.greenInput.value = $ms.round(256 - this.map.yValue);
		break;

	    case 'h2':
		this.cvp.saturation2Input.value = $ms.round(this.map.xValue);
		this.cvp.lightnessInput.value = $ms.round(100 - this.map.yValue);
		break;

	    case 's2':
		this.cvp.hue2Input.value = $ms.round(this.map.xValue);
		this.cvp.lightnessInput.value = $ms.round(100 - this.map.yValue);
		break;

	    case 'l':
		this.cvp.hue2Input.value = $ms.round(this.map.xValue);
		this.cvp.saturation2Input.value = $ms.round(100 - this.map.yValue);
		break;

	}
	switch (this.ColorMode) {
	    case 'h':
	    case 's':
	    case 'v':
		this.cvp.setValuesFromHsv();
		break;

	    case 'r':
	    case 'g':
	    case 'b':
		this.cvp.setValuesFromRgb();
		
		break;
		
	    case 'h2':
	    case 's2':
	    case 'l':
		this.cvp.setValuesFromHsl();
		break;
	}
	this.updateVisuals();
	this.updateGradientFromInput();
    }
    ColorPicker.prototype.sliderValueChanged = function() {
	switch (this.ColorMode) {
	    case 'h':
		this.cvp.hueInput.value = Math.round(360 - this.slider.yValue);
		if (this.cvp.hueInput.value == 360) this.cvp.hueInput.value = 0;
		break;
	    case 's':
		this.cvp.saturationInput.value = Math.round(100 - this.slider.yValue);
		break;
	    case 'v':
		this.cvp.valueInput.value = Math.round(100 - this.slider.yValue);
		break;

	    case 'r':
		this.cvp.redInput.value = Math.round(255 - this.slider.yValue);
		break;
	    case 'g':
		this.cvp.greenInput.value = Math.round(255 - this.slider.yValue);
		break;
	    case 'b':
		this.cvp.blueInput.value = Math.round(255 - this.slider.yValue);
		break;
		
	    case 'h2':
		this.cvp.hue2Input.value = Math.round(360 - this.slider.yValue);
		if (this.cvp.hue2Input.value == 360) this.cvp.hue2Input.value = 0;
		break;
	    case 's2':
		this.cvp.saturation2Input.value = Math.round(100 - this.slider.yValue);
		break;
	    case 'l':
		this.cvp.lightnessInput.value = Math.round(100 - this.slider.yValue);
		break;

	}

	switch (this.ColorMode) {
	    case 'h':
	    case 's':
	    case 'v':
		this.cvp.setValuesFromHsv();
		break;

	    case 'r':
	    case 'g':
	    case 'b':
		this.cvp.setValuesFromRgb();
		break;
		
	    case 'h2':
	    case 's2':
	    case 'l':
		this.cvp.setValuesFromHsl();
		break;
	}
	this.updateVisuals();
	this.updateGradientFromInput();
    }
    
    ColorPicker.prototype.opacitySliderValueChanged = function() {
	this.opacityInput.value = parseInt(this.opacitySlider.xValue);
	this.cvp.setValuesFromOpacity();
	this.updateVisuals();
	this.updateGradientFromInput();
    }
    
    // map, slider, and opacity arrows
    ColorPicker.prototype.positionArrows = function () {
	this.color = this.cvp.color;

	// Slider
	var sliderValue = 0;
	switch (this.ColorMode) {
	    case 'h':
		sliderValue = 360 - this.color.h;
		break;

	    case 's':
		sliderValue = 100 - this.color.s;
		break;

	    case 'v':
		sliderValue = 100 - this.color.v;
		break;

	    case 'r':
		sliderValue = 255 - this.color.r;
		break;

	    case 'g':
		sliderValue = 255 - this.color.g;
		break;

	    case 'b':
		sliderValue = 255 - this.color.b;
		break;
		
	    case 'h2':
		sliderValue = 360 - this.color.h2;
		break;

	    case 's2':
		sliderValue = 100 - this.color.s2;
		break;

	    case 'l':
		sliderValue = 100 - this.color.l;
		break;

	}

	this.slider.yValue = sliderValue;
	this.slider.setArrowPositionFromValues();

	// color map
	var mapXValue = 0;
	var mapYValue = 0;
	switch (this.ColorMode) {
	    case 'h':
		mapXValue = this.color.s;
		mapYValue = 100 - this.color.v;
		break;

	    case 's':
		mapXValue = this.color.h;
		mapYValue = 100 - this.color.v;
		break;

	    case 'v':
		mapXValue = this.color.h;
		mapYValue = 100 - this.color.s;
		break;

	    case 'r':
		mapXValue = this.color.b;
		mapYValue = 256 - this.color.g;
		break;

	    case 'g':
		mapXValue = this.color.b;
		mapYValue = 256 - this.color.r;
		break;

	    case 'b':
		mapXValue = this.color.r;
		mapYValue = 256 - this.color.g;
		break;

	    case 'h2':
		mapXValue = this.color.s2;
		mapYValue = 100 - this.color.l;
		break;

	    case 's2':
		mapXValue = this.color.h2;
		mapYValue = 100 - this.color.l;
		break;

	    case 'l':
		mapXValue = this.color.h2;
		mapYValue = 100 - this.color.s2;
		break;

	}
	this.map.xValue = mapXValue;
	this.map.yValue = mapYValue;
	this.map.setArrowPositionFromValues();
    }
    
    ColorPicker.prototype.positionOpacityArrows = function(){	
	this.opacitySlider.xValue = parseInt(this.opacityInput.value);
	this.opacitySlider.setArrowPositionFromValues();
    }
    
    ColorPicker.prototype.updateVisuals = function(fromGradient) {
	this.updatePreview();
	this.updateMapVisuals();
	this.updateSliderVisuals();
	this.updateTarget();
	this.cpLibrary.color = this.cvp.color;
	
	this.cssText.innerHTML = this.getCss();	
	this.cssText.title = this.cssText.innerHTML.replace(/<[^>]+>/g, "  ");
	
	if (fromGradient) return;
	if (this.settings.gradient){
	    this.settings.gradient.updateVisuals();
	}
    }
    
    // updates the target(s) with values / colors
    // target object contains: 
    //	    element - the element to act upon
    //	    property - sets the element's property with selected color
    //	    valueAttribute - shows the rgb text using the element attribute (e.g. value, innerHTML) 
    //	    textColor = sets color of text (if valueAttribute is set) 
    //		    Valid values:
    //		    "color" (or undefined) = sets property in selected rgb value
    //		    "contrast" = sets property in contrasting color
    ColorPicker.prototype.updateTarget = function(cancel){
	// update the source element(s)
	if (!this.settings.target) return;
	if (this.settings.gradient) return;
	try {
	    for (var i=0; i< this.settings.target.length; i++){
		var target = this.settings.target[i];
		if (typeof target.property == "undefined") continue;
		if (target.property){
		    // display the element's property in the chosen color
		    var property;
		    if (target.property == "backgroundImage"){
			property = "background";
		    } else {
			property = target.property;
		    }
		    target.element.style[property] = this.cvp.color.rgbString;
		}
		if (target.valueAttribute){
		    // display text version of color
		    target.element[target.valueAttribute] = this.cvp.color.rgbString;
		    var color;
		    if (target.textColor == "contrast") {
			color = $msRoot.colorMethods.highlightcolor(this.cvp.redInput.value, this.cvp.greenInput.value, this.cvp.blueInput.value);
		    } else {
			color = this.cvp.color.rgbString;
		    }
		    target.element.style.color = color;
		}
	    }
	    if (typeof this.settings.cbChange !== "undefined"){
		// if a callback function with change
		this.settings.cbChange(this, this.cvp.color);
	    }
	} catch(e) {
	    console.log("ColorPicker.updateTarget: " + e.message);
	}
    }

    ColorPicker.prototype.updatePreview = function () {
	try {
	    if (this.cvp.color.hex.length == 0){
		this.notSetCheck.checked = true;
		this.preview.style.removeProperty("background-color");
	    } else {
		this.notSetCheck.checked = false;
		this.preview.style.backgroundColor = this.cvp.color.rgbString;
	    }	    
	    if (!this.previewOrigSet){
		this.previewOrigSet = true;
		this.previewOrig.style.backgroundColor = this.preview.style.backgroundColor;
	    }
	    if (this.opacityInput.value == 0){
		this.opacityInput.style.color = "red";
	    } else {
		this.opacityInput.style.color = "black";
	    }
	} catch (e) {
	}
    }
    ColorPicker.prototype.updateMapVisuals = function () {

	this.color = this.cvp.color;

	switch (this.ColorMode) {
	    case 'h':
		// fake color with only hue
		var color = new $msRoot.ColorPicker.Color({h: this.color.h, s: 100, v: 100});
		this.setBG(this.mapL1, color.hex);
		break;

	    case 's':
		this.setAlpha(this.mapL2, 100 - this.color.s);
		break;

	    case 'v':
		this.setAlpha(this.mapL2, this.color.v);
		break;

	    case 'r':
		this.setAlpha(this.mapL2, this.color.r / 256 * 100);
		break;

	    case 'g':
		this.setAlpha(this.mapL2, this.color.g / 256 * 100);
		break;

	    case 'b':
		this.setAlpha(this.mapL2, this.color.b / 256 * 100);
		break;
		
	    case 'h2':
		// fake color with only hue
		var color = new $msRoot.ColorPicker.Color({h2: this.color.h2, s2: 100, l: 50});
		this.setBG(this.mapL1, color.hex);
		break;

	    case 's2':
		this.setBG(this.mapL1b, "rgb(128,128,128)");
		this.setAlpha(this.mapL1b,  Math.min(99, 100 - this.color.s2));
		break;

	    case 'l':
		// at L = 50% - opacity is 0
		// at L = 0% - opacity is 100
		// at L = 50% - opacity is 0
		// at L = 0 - 50 - color is black
		// at L = 0 - 100 - color is white
		if (this.color.l > 50){
		    this.setBG(this.mapL2, "white");
		} else {
		    this.setBG(this.mapL2, "black");
		}
		// if set to alpha of 1, it no longer shows (probably due to zindex)
		this.setAlpha(this.mapL2, Math.min(99, Math.abs(this.color.l - 50) * 2));
		break;
	}
    }
    ColorPicker.prototype.updateSliderVisuals = function () {

	this.color = this.cvp.color;

	switch (this.ColorMode) {
	    case 'h':
		break;

	    case 's':
		var saturatedColor = new $msRoot.ColorPicker.Color({h: this.color.h, s: 100, v: this.color.v});
		this.setBG(this._barL3, saturatedColor.hex);
		break;

	    case 'v':
		var valueColor = new $msRoot.ColorPicker.Color({h: this.color.h, s: this.color.s, v: 100});
		this.setBG(this._barL3, valueColor.hex);
		break;
	    case 'r':
	    case 'g':
	    case 'b':

		var hValue = 0;
		var vValue = 0;

		if (this.ColorMode == 'r') {
		    hValue = this.cvp.blueInput.value;
		    vValue = this.cvp.greenInput.value;
		} else if (this.ColorMode == 'g') {
		    hValue = this.cvp.blueInput.value;
		    vValue = this.cvp.redInput.value;
		} else if (this.ColorMode == 'b') {
		    hValue = this.cvp.redInput.value;
		    vValue = this.cvp.greenInput.value;
		}

		var horzPer = (hValue / 256) * 100;
		var vertPer = (vValue / 256) * 100;

		var horzPerRev = ((256 - hValue) / 256) * 100;
		var vertPerRev = ((256 - vValue) / 256) * 100;

		this.setAlpha(this._barL4, (vertPer > horzPerRev) ? horzPerRev : vertPer);
		this.setAlpha(this._barL3, (vertPer > horzPer) ? horzPer : vertPer);
		this.setAlpha(this._barL2, (vertPerRev > horzPer) ? horzPer : vertPerRev);
		this.setAlpha(this._barL1, (vertPerRev > horzPerRev) ? horzPerRev : vertPerRev);

		break;
	    case 'h2':
		break;

	    case 's2':
		// show the color on the bar
		var saturatedColor = new $msRoot.ColorPicker.Color({h: this.color.h2, s: 100, v: this.color.l});
		this.setBG(this._barL3, saturatedColor.hex);
		break;

	    case 'l':
		// show the hue on the bar
		var valueColor = new $msRoot.ColorPicker.Color({h2: this.color.h2, s2: this.color.s2, l: 50});
		this.setBG(this._barL3, valueColor.hex);
		break;
	}
    }
    ColorPicker.prototype.setBG = function (el, c) {
	try {
	    el.style.backgroundColor = c;
	} catch (e) {
	}
    }
    ColorPicker.prototype.setImg = function (img, src) {

	if (src.indexOf('png') && this.isLessThanIE7) {
	    img.pngSrc = src;
	    img.src = this.settings.imgPath + 'blank.gif';
	    img.style.filter = 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src=\'' + src + '\');';

	} else {
	    img.src = src;
	}
    }
    ColorPicker.prototype.setAlpha = function (obj, alpha) {
	if (this.isLessThanIE7) {
	    var src = obj.pngSrc;
	    // exception for the hue map
	    if (src != null && src.indexOf('map-hue') == -1 && src.indexOf('map-hsl-hue') == -1)
		obj.style.filter = 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src=\'' + src + '\') progid:DXImageTransform.Microsoft.Alpha(opacity=' + alpha + ')';
	} else {
	    obj.style.opacity = (alpha / 100);
	}
    }
    
    ColorPicker.prototype.save = function(){
	if (this.settings.gradient) {
	    this.hide();
	} else {	
	    this.close();
	}
    }

    ColorPicker.prototype.cancel = function(e){
	// revert value
	if (this.settings.allowGradient && this.settings.startColor.indexOf("gradient") !== -1) {
	    this.openGradient()
	} else {
	    this.setColor(this.settings.startColor);
	}
	if (this.settings.gradient) {
	    this.hide();
	} else {
	    this.close();
	}
    }

    ColorPicker.prototype.close = function(){
	window.removeEventListener('keyup', this.keyupFn);
	if (this.container.parentNode){
	    this.container.parentNode.removeChild(this.container);
	}
	for (var i=0; i < instance.length; i++){
	    if (instance[i].id == this.id){
		instance.splice(i, 1);
		break;
	    }
	}
	this.map.close();
	this.slider.close();
	this.opacitySlider.close();
	this.cpLibrary.close();
	$msRoot.CustomDialog.closeDialogs(this.id);
	if (this.settings.cbClose){
	    if (Array.isArray(this.settings.cbClose)){
		for (var i = 0; i < this.settings.cbClose.length; i++){
		    this.settings.cbClose[i](this);		    
		}
	    } else {
		this.settings.cbClose(this);
	    }
	}
    }
    
    ColorPicker.prototype.bringToFront = function(){
	var max = 0;
	if (!$msRoot.Gradient) 
	    return;
	for (var i = 0; i < instance.length; i++){
	    if (instance.id !== this.id){
		max = Math.max(max, parseInt(instance[i].container.style.zIndex));
	    }
	}
	var gradient = $msRoot.Gradient.getInstance();
	for (var i = 0; i < gradient.length; i++){
	    max = Math.max(max, parseInt(gradient[i].container.style.zIndex));
	}
	this.container.style.zIndex = Math.max( parseInt(this.container.style.zIndex), max + 1);
    }
    
    ColorPicker.prototype.createForm = function(){
	var _this = this;
	var tr, td, div, input, label;

	var cpdiv = document.createElement("div");
	cpdiv.id = this.id + "container";
	cpdiv.className = "ms-colorpicker draggable";
	cpdiv.style.zIndex = this.settings.zIndex + instance.length;
	
	var divTitleBar = document.createElement("div");
	divTitleBar.id = this.id + "title-bar";
	divTitleBar.className = "ms-title-bar";
	divTitleBar.style.height = "20px";
	// centers text vertically
	divTitleBar.style.lineHeight = "20px";
	// centers text horizontally
	divTitleBar.style.textAlign = "center";	
	divTitleBar.addEventListener("mousedown", function(){this.bringToFront()}.bind(this));
	cpdiv.appendChild(divTitleBar);

	// localstorage will override settings
	var data = new $msRoot.LocalData();
	var lsPinned = data.getProperty("colorpicker", "pin");
	if (this.settings.pin || lsPinned){
	    // pinned gradient ties it to the colorpicker
	    var div = document.createElement('div');
	    div.id = this.id + "pin-button";
	    if ((this.settings.startPinned || lsPinned) && this.settings.gradient){
		this.isPinned = true;
		div.className = "ms-pinned-button";
	    } else {
		div.className = "ms-unpinned-button";
	    }
	    div.addEventListener("click", function(){this.pin()}.bind(this));
	    divTitleBar.appendChild(div);
	}	

	var div = $ms.createCloseButton(this.id, function(){
	    if (this.settings.gradient){
		this.hide();
	    } else {
		this.close();
	    }
	}.bind(this));
	divTitleBar.appendChild(div);
	
	if (this.settings.pin){
	    var div = document.createElement('div');
	    div.id = this.id + "pin-button";
	    div.className = "ms-pin-button display-none";
	    div.addEventListener("click", function(){this.pin(true)}.bind(this));
	    divTitleBar.appendChild(div);

	    var div = document.createElement('div');
	    div.id = this.id + "unpin-button";
	    div.className = "ms-unpin-button";
	    div.addEventListener("click", function(){this.pin()}.bind(this));
	    divTitleBar.appendChild(div);
	}
	var table1 = document.createElement("table");
	table1.style.display = "inline-block";
	table1.style.verticalAlign = "top";
	var colWidths = [45, 200];
	var colgroup = document.createElement('colgroup');
	table1.appendChild(colgroup);
	for (var i=0; i< colWidths.length; i++){
	    var col = document.createElement('col');
	    colgroup.appendChild(col);
	    col.style.width = colWidths[i] + "px";
	}	
	var tr1 = document.createElement("tr");
	var td = document.createElement("td");
	td.colSpan = "2";
	td.style.verticalAlign="top";
	tr1.appendChild(td);

	// color map
	this.colorMap = document.createElement("div");
	td.appendChild(this.colorMap);
	
	// color bar
	td = document.createElement("td");
	td.style.verticalAlign = "top";
	tr1.appendChild(td);
	table1.appendChild(tr1);

	// the div containing the image bar img
	this.colorBar = document.createElement("div");
	td.appendChild(this.colorBar);

	// 'not set'
	tr = document.createElement("tr");
	td = document.createElement("td");
	td.colSpan = "2";
	input = document.createElement("input");
	input.type="checkbox";
	input.style.verticalAlign = "middle"
	input.id=this.id + "not-set-check";
	td.appendChild(input);

	label = document.createElement("label");
	label.htmlFor=this.id + "not-set-check";
	label.innerText = "Not Set";
	label.style.marginLeft = "5px";
	td.appendChild(label);
	tr.appendChild(td);
	table1.appendChild(tr);
	
	// opacity
	tr = document.createElement("tr");
	td = document.createElement("td");
	label = document.createElement("label");
	label.htmlFor=this.id + "opacity";
	label.className = "ms-cp-label";
	td.appendChild(label);
	td.innerHTML = "Opacity";
	tr.appendChild(td);
	
	td = document.createElement("td");
	var settings = {
	    //cbUpdateSource: function(){_this.updateSource.call(_this, element, input, prop)},
	    min: 0,
	    max: 100,
	    snapX: 1,
	    sliderWidth: 145, 
	    inputWidth: 35, 
	    inputId: this.id + "opacity-input",
	    textAfterInput: " %",
	    sliderInput: true,
	    parentNode: td,
	    imgPath: this.settings.imgPath
	}
	this.opacitySlider = new $msRoot.Slider(undefined, settings);	
	this.opacitySlider.onValuesChanged = function () {
	    _this.opacitySliderValueChanged();
	};
	tr.appendChild(td);
	table1.appendChild(tr);

	// shows the CSS value of the current color
	tr = document.createElement("tr");
	td = document.createElement("td");
	td.colSpan = "3";
	var divCss = document.createElement("div");
	divCss.className = "ms-cp-css";	
	td.appendChild(divCss);
	tr.appendChild(td);	
	table1.appendChild(tr);
	
	var divCssText = document.createElement("div");
	divCssText.id = this.id + "css-text";
	divCssText.className = "ms-cp-css-text";
	divCss.appendChild(divCssText);

	var buttonCopyCss = document.createElement("div");
	buttonCopyCss.innerHTML = "Copy";
	buttonCopyCss.className = "ms-gradient-button ms-cp-copy-button";
	buttonCopyCss.addEventListener('click', function(e){
	    var text = divCssText.innerHTML.replace(/<[^>]+>/g, "\n").replace(/\n\s*\n/g, '\n');	    
	    $ms.copyToClipboard(text);
	    $ms.removeClass($ms.$(this.id + "copy-status"), "display-none");
	    setTimeout(function(){$ms.addClass($ms.$(this.id + "copy-status"), "display-none")}.bind(this), 1000);
	    }.bind(this));
	divCss.appendChild(buttonCopyCss);
	
	var divCssCopyStatus = document.createElement("div");
	divCssCopyStatus.id = this.id + "copy-status";
	divCssCopyStatus.className = "ms-gradient-copy-status display-none";
	divCssCopyStatus.innerHTML = "Copied to Clipboard"
	divCss.appendChild(divCssCopyStatus);
	
	// inputs and preview
	var table2 = document.createElement("table");
	table2.style.display = "inline-block";	
	table2.style.verticalAlign = "top";
	var colWidths = [20, 12, 45];
	var colgroup = document.createElement('colgroup');
	table2.appendChild(colgroup);
	for (var i=0; i< colWidths.length; i++){
	    var col = document.createElement('col');
	    colgroup.appendChild(col);
	    col.style.width = colWidths[i] + "px";
	}
	
	// Preview - New and Original
	tr = document.createElement("tr");
	td = document.createElement("td");
	td.colSpan="3";
	div = document.createElement("div");
	div.style.width = "80px";
	div.style.marginTop = "5px";
	div.style.textAlign = "center";
	div.innerHTML = "New";
	td.appendChild(div);

	// preview
	var divOuter = document.createElement("div");
	divOuter.style.width = "80px";
	divOuter.style.height = "32px";
	divOuter.style.borderTop = "solid 1px #000";
	divOuter.style.borderRight = "solid 1px #000";
	divOuter.style.borderLeft = "solid 1px #000";
	divOuter.className = "ms-cp-transparent-grid";
	td.appendChild(divOuter);
	
	div = document.createElement("div");
	div.id = this.id + "preview";
	div.style.width = "100%";
	div.style.height = "100%";
	divOuter.appendChild(div);

	// preview orig
	var divOuter = document.createElement("div");
	divOuter.style.width = "80px";
	divOuter.style.height = "32px";
	divOuter.style.borderBottom = "solid 1px #000";
	divOuter.style.borderRight = "solid 1px #000";
	divOuter.style.borderLeft = "solid 1px #000";
	divOuter.className = "ms-cp-transparent-grid";
	divOuter.addEventListener("click",  function(){ 
	    this.cvp.hexInput.value = $msRoot.colorMethods.colorInfo(this.settings.startColor).hex;
	    this.opacityInput.value = parseInt($msRoot.colorMethods.colorInfo(this.settings.startColor).alpha * 100);
	    this.cvp.setValuesFromHex();
	    this.positionArrows();
	    this.updateVisuals();
	}.bind(this));
	td.appendChild(divOuter);

	div = document.createElement("div");
	div.id = this.id + "preview-orig";
	div.style.width = "100%";
	div.style.height = "100%";
	divOuter.appendChild(div);

	// original label
	div = document.createElement("div");
	div.style.width = "80px";
	div.style.textAlign = "center";
	div.style.marginBottom = "5px";
	div.innerHTML = "Original";
	td.appendChild(div);
	tr.appendChild(td);
	table2.appendChild(tr);

	// hue
	tr = document.createElement("tr");
	td = document.createElement("td");
	input = document.createElement("input");
	input.type="radio";
	input.id=this.id + "hue-radio";
	input.value="h";
	td.appendChild(input);
	tr.appendChild(td);

	td = document.createElement("td");
	label = document.createElement("label");
	label.htmlFor=this.id + "hue-radio";
	label.innerText = "H:";
	td.appendChild(label);
	tr.appendChild(td);

	td = document.createElement("td");
	input = document.createElement("input");
	input.type="text";
	input.id=this.id + "hue-input";
	input.value="0";
	input.style.width = "40px";
	td.appendChild(input);
	td.appendChild(document.createTextNode(" \xB0"));    //&deg;
	td.style.whiteSpace = "nowrap";
	tr.appendChild(td);
	table2.appendChild(tr);

	// saturation
	tr = document.createElement("tr");
	td = document.createElement("td");
	input = document.createElement("input");
	input.type="radio";
	input.id=this.id + "saturation-radio";
	input.value="s";
	td.appendChild(input);
	tr.appendChild(td);

	td = document.createElement("td");
	label = document.createElement("label");
	label.htmlFor=this.id + "saturation-radio";
	label.innerText = "S:";
	td.appendChild(label);
	tr.appendChild(td);

	td = document.createElement("td");
	input = document.createElement("input");
	input.type="text";
	input.id=this.id + "saturation-input";
	input.value="100";
	input.style.width = "40px";
	td.appendChild(input);
	td.appendChild(document.createTextNode(" %"));
	td.style.whiteSpace = "nowrap";
	tr.appendChild(td);
	table2.appendChild(tr);

	// brightness - value
	tr = document.createElement("tr");
	td = document.createElement("td");
	input = document.createElement("input");
	input.type="radio";
	input.id=this.id + "brightness-radio";
	input.value="v";
	td.appendChild(input);
	tr.appendChild(td);

	td = document.createElement("td");
	label = document.createElement("label");
	label.htmlFor=this.id + "brightness-radio";
	label.innerText = "B:";
	td.appendChild(label);
	tr.appendChild(td);

	td = document.createElement("td");
	input = document.createElement("input");
	input.type="text";
	input.id=this.id + "brightness-input";
	input.value="100";
	input.style.width = "40px";
	td.appendChild(input);
	td.appendChild(document.createTextNode(" %"));
	td.style.whiteSpace = "nowrap";
	tr.appendChild(td);
	table2.appendChild(tr);

	tr = document.createElement("tr");
	td = document.createElement("td");
	td.colSpan="3";
	td.style.height = "5px";
	tr.appendChild(td)
	table2.appendChild(tr);

	//red
	tr = document.createElement("tr");
	td = document.createElement("td");
	input = document.createElement("input");
	input.type="radio";
	input.id=this.id + "red-radio";
	input.value="r";
	td.appendChild(input);
	tr.appendChild(td);
	table2.appendChild(tr);

	td = document.createElement("td");
	label = document.createElement("label");
	label.htmlFor=this.id + "red-radio";
	td.appendChild(label);
	td.innerHTML = "R:";
	tr.appendChild(td);

	td = document.createElement("td");
	input = document.createElement("input");
	input.type="text";
	input.id=this.id + "red-input";
	input.value="255";
	input.style.width = "40px";
	td.appendChild(input);
	tr.appendChild(td);
	table2.appendChild(tr);

	// green
	tr = document.createElement("tr");
	td = document.createElement("td");
	input = document.createElement("input");
	input.type="radio";
	input.id=this.id + "green-radio";
	input.value="g";
	td.appendChild(input);
	tr.appendChild(td);

	td = document.createElement("td");
	label = document.createElement("label");
	label.htmlFor=this.id + "green-radio";
	td.appendChild(label);
	td.innerHTML = "G:";
	tr.appendChild(td);

	td = document.createElement("td");
	input = document.createElement("input");
	input.type="text";
	input.id=this.id + "green-input";
	input.value="0";
	input.style.width = "40px";
	td.appendChild(input);
	tr.appendChild(td);
	table2.appendChild(tr);

	// blue
	tr = document.createElement("tr");
	td = document.createElement("td");
	input = document.createElement("input");
	input.type="radio";
	input.id=this.id + "blue-radio";
	input.value="b";
	td.appendChild(input);
	tr.appendChild(td);

	td = document.createElement("td");
	label = document.createElement("label");
	label.htmlFor=this.id + "blue-radio"
	td.appendChild(label);
	td.innerHTML = "B:";
	tr.appendChild(td);

	td = document.createElement("td");
	input = document.createElement("input");
	input.type="text";
	input.id=this.id + "blue-input";
	input.value="0";
	input.style.width = "40px";
	td.appendChild(input);
	tr.appendChild(td);
	table2.appendChild(tr);

	tr = document.createElement("tr");
	td = document.createElement("td");
	td.colSpan="3";
	td.style.height = "5px";
	tr.appendChild(td)
	table2.appendChild(tr);

	// HSL
	// hue2
	tr = document.createElement("tr");
	td = document.createElement("td");
	input = document.createElement("input");
	input.type="radio";
	input.id=this.id + "hue2-radio";
	input.value="h2";
	td.appendChild(input);
	tr.appendChild(td);

	td = document.createElement("td");
	label = document.createElement("label");
	label.htmlFor=this.id + "hue2-radio";
	label.innerText = "H:";
	td.appendChild(label);
	tr.appendChild(td);

	td = document.createElement("td");
	input = document.createElement("input");
	input.type="text";
	input.id=this.id + "hue2-input";
	input.value="0";
	input.style.width = "40px";
	td.appendChild(input);
	td.appendChild(document.createTextNode(" \xB0"));    //&deg;
	td.style.whiteSpace = "nowrap";
	tr.appendChild(td);
	table2.appendChild(tr);

	// saturation
	tr = document.createElement("tr");
	td = document.createElement("td");
	input = document.createElement("input");
	input.type="radio";
	input.id=this.id + "saturation2-radio";
	input.value="s";
	td.appendChild(input);
	tr.appendChild(td);

	td = document.createElement("td");
	label = document.createElement("label");
	label.htmlFor=this.id + "saturation2-radio";
	label.innerText = "S:";
	td.appendChild(label);
	tr.appendChild(td);

	td = document.createElement("td");
	input = document.createElement("input");
	input.type="text";
	input.id=this.id + "saturation2-input";
	input.value="100";
	input.style.width = "40px";
	td.appendChild(input);
	td.appendChild(document.createTextNode(" %"));
	td.style.whiteSpace = "nowrap";
	tr.appendChild(td);
	table2.appendChild(tr);

	// brightness
	tr = document.createElement("tr");
	td = document.createElement("td");
	input = document.createElement("input");
	input.type="radio";
	input.id=this.id + "lightness-radio";
	input.value="l";
	td.appendChild(input);
	tr.appendChild(td);

	td = document.createElement("td");
	label = document.createElement("label");
	label.htmlFor=this.id + "lightness-radio";
	label.innerText = "L:";
	td.appendChild(label);
	tr.appendChild(td);

	td = document.createElement("td");
	input = document.createElement("input");
	input.type="text";
	input.id=this.id + "lightness-input";
	input.value="100";
	input.style.width = "40px";
	td.appendChild(input);
	td.appendChild(document.createTextNode(" %"));
	td.style.whiteSpace = "nowrap";
	tr.appendChild(td);
	table2.appendChild(tr);

	// hex
	tr = document.createElement("tr");
	td = document.createElement("td");
	td.innerHTML ="Hex:";
	tr.appendChild(td);

	td = document.createElement("td");
	td.colSpan="2";
	input = document.createElement("input");
	input.type="text";
	input.id=this.id + "hex-input"
	input.value="";
	input.style.width = "65px";
	td.appendChild(input);
	tr.appendChild(td);
	table2.appendChild(tr);

	// name
	tr = document.createElement("tr");
	td = document.createElement("td");
	label = document.createElement("label");
	label.innerText ="Name:";
	label.id = this + "name-label";
	label.style.marginLeft = "-12px";
	td.appendChild(label);
	tr.appendChild(td);

	td = document.createElement("td");
	td.colSpan="2";
	input = document.createElement("input");
	input.type="text";
	input.id=this.id + "color-name";
	input.value="";
	input.title = "Enter the name of a color (e.g. blue)"
	input.style.width = "65px";
	td.appendChild(input);
	tr.appendChild(td);
	table2.appendChild(tr);
	
	cpdiv.appendChild(table1);
	cpdiv.appendChild(table2);
	
	/* 
	 * buttons
	 */
	var buttonDivOuter = document.createElement("div");
	buttonDivOuter.className = "ms-cp-right-outer";
	cpdiv.appendChild(buttonDivOuter);
	
	var buttonDivInner = document.createElement("div");
	buttonDivInner.style.height = "110px";
	buttonDivOuter.appendChild(buttonDivInner);
	
	var button = document.createElement("div");
	button.innerHTML = "Ok"
	button.className = "ms-gradient-button ms-cp-button";
	button.style.display = "block";
	button.style.width = "115px";
	button.addEventListener("click", function(e){this.save()}.bind(this));
	buttonDivInner.appendChild(button);
	
	var button = document.createElement("div");
	button.innerHTML = "Cancel"
	button.className = "ms-gradient-button ms-cp-button";
	button.style.display = "block";
	button.style.width = "115px";
	button.addEventListener("click", function(e){this.cancel()}.bind(this));
	buttonDivInner.appendChild(button);

	if (this.settings.allowGradient && !this.settings.gradient){	    
	    var button = document.createElement("div");
	    button.type = "button";
	    button.id = this.id + "add-gradient";
	    button.innerHTML = "Add Gradient"
	    button.className = "ms-gradient-button ms-cp-button";
	    button.title = "Click to create a gradient";
	    button.style.display = "block";
	    button.style.width = "115px";
	    button.addEventListener('click', function(){this.openGradient(undefined, true)}.bind(this));
	    buttonDivInner.appendChild(button);
	}

	/*
	 * color Library form appended to buttonDivOuter
	 */
	buttonDivOuter.appendChild(this.cpLibrary.createForm());
		
	// preloads images
	var div = document.createElement("div");
	div.style.display = "none";
	div.id = this.id + "cpimages";
	var img = document.createElement("img");
	img.src= this.settings.imgPath + "rangearrows.gif";
	div.appendChild(img);
	img = document.createElement("img");
	img.src= this.settings.imgPath + "mappoint.gif";
	div.appendChild(img);

	img = document.createElement("img");
	img.src= this.settings.imgPath + "bar-saturation.png";
	img = document.createElement("img");
	img.src= this.settings.imgPath + "bar-brightness.png";
	div.appendChild(img);

	img = document.createElement("img");
	img.src= this.settings.imgPath + "bar-blue-tl.png";
	div.appendChild(img);

	img = document.createElement("img");
	img.src= this.settings.imgPath + "bar-blue-tr.png";
	div.appendChild(img);

	img = document.createElement("img");
	img.src= this.settings.imgPath + "bar-blue-bl.png";
	div.appendChild(img);

	img = document.createElement("img");
	img.src= this.settings.imgPath + "bar-blue-br.png";
	div.appendChild(img);

	img = document.createElement("img");
	img.src= this.settings.imgPath + "bar-red-tl.png";
	div.appendChild(img);

	img = document.createElement("img");
	img.src= this.settings.imgPath + "bar-red-tr.png";
	div.appendChild(img);

	img = document.createElement("img");
	img.src= this.settings.imgPath + "bar-red-bl.png";
	div.appendChild(img);

	img = document.createElement("img");
	img.src= this.settings.imgPath + "bar-red-br.png";
	div.appendChild(img);

	img = document.createElement("img");
	img.src= this.settings.imgPath + "bar-green-tl.png";
	div.appendChild(img);

	img = document.createElement("img");
	img.src= this.settings.imgPath + "bar-green-tr.png";
	div.appendChild(img);

	img = document.createElement("img");
	img.src= this.settings.imgPath + "bar-green-bl.png";
	div.appendChild(img);

	img = document.createElement("img");
	img.src= this.settings.imgPath + "bar-green-br.png";
	div.appendChild(img);

	img = document.createElement("img");
	img.src= this.settings.imgPath + "map-red-max.png";
	div.appendChild(img);

	img = document.createElement("img");
	img.src= this.settings.imgPath + "map-red-min.png";
	div.appendChild(img);

	img = document.createElement("img");
	img.src= this.settings.imgPath + "map-green-max.png";
	div.appendChild(img);

	img = document.createElement("img");
	img.src= this.settings.imgPath + "map-green-min.png";
	div.appendChild(img);

	img = document.createElement("img");
	img.src= this.settings.imgPath + "map-blue-max.png";
	div.appendChild(img);

	img = document.createElement("img");
	img.src= this.settings.imgPath + "map-blue-min.png";
	div.appendChild(img);

	img = document.createElement("img");
	img.src= this.settings.imgPath + "map-saturation.png";
	div.appendChild(img);

	img = document.createElement("img");
	img.src= this.settings.imgPath + "map-saturation-overlay.png";
	div.appendChild(img);

	img = document.createElement("img");
	img.src= this.settings.imgPath + "map-brightness.png";
	div.appendChild(img);

	if (!$ms.$("cp-map-hue-png")){
	    // map should be PRELOADED with load of class file
	    img = document.createElement("img");
	    img.src= this.settings.imgPath + "map-hue.png";
	    img.id = "cp-map-hue-png";
	    div.appendChild(img);
	    cpdiv.appendChild(div);
	}
       
	img = document.createElement("img");
	img.src= this.settings.imgPath + "map-hsl-hue.png";
	div.appendChild(img);
	cpdiv.appendChild(div);
	this.settings.container.appendChild(cpdiv);
	
	img = document.createElement("img");
	img.src= this.settings.imgPath + "map-hsl-saturation.png";
	div.appendChild(img);
	cpdiv.appendChild(div);
	this.settings.container.appendChild(cpdiv);
	
	img = document.createElement("img");
	img.src= this.settings.imgPath + "map-hsl-saturation-overlay.png";
	div.appendChild(img);
	cpdiv.appendChild(div);
	this.settings.container.appendChild(cpdiv);
	
	img = document.createElement("img");
	img.src= this.settings.imgPath + "map-hsl-lightness.png";
	div.appendChild(img);
	cpdiv.appendChild(div);
	
	this.settings.container.appendChild(cpdiv);
		// set font size in percent
	cpdiv.style.fontSize = $ms.targetFontSize(this.settings.fontSize, cpdiv);
	// return reference to container
	return cpdiv;
    }
    
    ColorPicker.prototype.pin = function(){
	var data = new $msRoot.LocalData();
	if (this.isPinned){
	    // unpin - separate from colorpicker
	    this.isPinned = false;
	    if (isNaN(parseInt(this.container.style.top))) return;
	    
	    // shift up 4px
	    this.container.style.top = (Math.max(0, parseInt(this.container.style.top) - 4)) + "px";
	    $ms.removeClass($ms.$(this.id + "pin-button"), "ms-pinned-button");
	    $ms.addClass($ms.$(this.id + "pin-button"), "ms-unpinned-button");
	    data.setProperty("colorpicker", "pin", false)
	} else if (this.settings.gradient) {
	    // pin to gradient
	    this.isPinned = true;
	    this.pinToGradient();
	    data.setProperty("colorpicker", "pin", true)
	}
    }
    ColorPicker.prototype.pinToGradient = function(){
	if (!this.settings.gradient) return;
	this.isPinned = true;
	var rectGradient = $ms.getOffset(this.settings.gradient.container);
	var rect = $ms.getOffset(this.container);
	var top = (rectGradient.top - rect.height) + "px";
	var left = rectGradient.left + "px";	
	if (parseInt(top) < 0){
	    // if the colorpicker would be off screen, move the gradient down
	    this.settings.gradient.container.style.top = rectGradient.top + Math.abs(parseFloat(top)) + "px";
	    top = "0px";
	}
	this.container.style.top = top;
	this.container.style.left = left;
	$ms.addClass($ms.$(this.id + "pin-button"), "ms-pinned-button");
	$ms.removeClass($ms.$(this.id + "pin-button"), "ms-unpinned-button");
    }    
    ColorPicker.prototype.pinGradient = function(){
	if (!this.settings.gradient) return;
	var rect = $ms.getOffset(this.container);
	var top = (rect.top + rect.height) + "px";
	var left = rect.left + "px";	
	this.settings.gradient.container.style.top = top;
	this.settings.gradient.container.style.left = left;
	this.settings.gradient.drop(true);
    }    
      
    /*
     * For drag and drop
     * with drop, recalibrate the positions of sliders
     */
    ColorPicker.prototype.drop = function (fromGradient) {
	// with cb from drag drop, will be passing the dropped element plus settings
	if ($ms.hasClass(this.container, "display-none")) return;
	this.map.setPositioningVariables();
	this.slider.setPositioningVariables();
	this.opacitySlider.setPositioningVariables();
	if (typeof fromGradient == "boolean" && fromGradient){
	    if (this.isPinned){
		// move colorpicker
		this.pinToGradient();
	    }
	} else if (this.isPinned){
	    // move gradient
	    this.pinGradient();
	}
    }
    
    // allow to disable opacity when called as part of gradient
    ColorPicker.prototype.disableOpacity = function(mode) {
	this.opacitySlider.disable();
	this.opacityInput.disable = "disabled";
	$ms.addClass(this.opacityInput, "ms-disabled");
    }
    ColorPicker.prototype.enableOpacity = function(mode) {
	this.opacitySlider.enable();
	this.opacityInput.removeAttribute("disabled");
	$ms.removeClass(this.opacityInput, "ms-disabled");
    }
    
    ColorPicker.prototype.keyup = function (e) {
	if (e.keyCode == 27) {
	    this.close();
	    e.stopPropagation();
	}
    }
 
    ColorPicker.prototype.sliderMouseup = function(color){
	// match color against color names
	this.cvp.setColorName();
    }   

    ColorPicker.prototype.getCss = function(){
	if (this.notSetCheck.checked) {
	    return "<span style='color:red'>Color is not set.</span>";
	} else {
	    var rgb = "<span style='margin-right:5px'>" + this.cvp.color.rgbString + "</span>";
	    if (this.opacityInput.value == 100 || this.opacityInput.value == 0){
		var hsl = "hsl(" + this.cvp.color.h2 + "," + this.cvp.color.s2 + "," +this.cvp.color.l + ")"
	    } else {
		var hsl = "hsla(" + this.cvp.color.h2 + "," + this.cvp.color.s2 + "," +this.cvp.color.l + "," + $ms.round(this.opacityInput.value / 100, 2) + ")"
	    }
	    hsl = "<span style='margin-right:5px'>" + hsl + "</span>";
	    var hsv = "<span>"+ "hsv(" + this.cvp.color.h + "," + this.cvp.color.s + "," +this.cvp.color.v + ")" + "</span>";
	    return rgb + hsl + hsv;
	}
    }    
    
    // change of value from external source (gradient, library, input, etc.)
    // or set from cpLibrary
    // reflect the changes in colorPicker
    ColorPicker.prototype.setColor = function(setColor){
	var color;
	if (typeof setColor == "undefined") {
	    return;
	} else if (typeof setColor == "string"){
	    color = $msRoot.colorMethods.colorInfo(setColor);
	    if (setColor.length > 0 && color.rgbString.length == 0){
		// invalid color from user input
		// don't don't do anything - user could be typing input
		return;
	    }
	} else {
	    color = setColor;
	    if (typeof color.alpha == "undefined"){
		color.alpha = 1;
	    }
	}
	if (this.settings.allowGradient && typeof color.gradient !== "undefined"){
	    this.openGradient(color.gradient, true);
	    return;
	}
	this.cvp.hexInput.value = color.hex;
	this.opacityInput.value = parseInt(color.alpha * 100);
	this.cvp.setValuesFromHex();
	this.cpLibrary.colorDeselect();
	
	this.positionArrows();
	this.updateVisuals();
	this.updateGradientFromInput();
    }
    
    /* 
     * Gradient Support Functions 
     *
     */
    ColorPicker.prototype.openGradient = function(colorString, transfer, close){
	var alpha = "1";
	var rgba;
	if (typeof colorString == "undefined"){
	    if (this.opacityInput.value.length > 0){
		alpha = $ms.round(parseFloat(this.opacityInput.value / 100), 2);
	    }
	    if (this.notSetCheck.checked || this.cvp.hexInput.value == ""){
		colorString = $msRoot.colorMethods.rgbToRgba([255,255,255], alpha);
	    } else {
		// use current color to start
		colorString = this.cvp.color.rgbString;
	    }
	}
	if (!this.settings.gradient){
	    // load in the same top left as the colorpicker
	    var rect = $ms.getOffset(this.container);
	    var settings = {
		startColor: this.settings.startColor,    // the value for gradient to rever to - can be a color or gradient
		imgPath: this.settings.imgPath,
		target: this.settings.target,		    // pass along the elements to be updated with changes
		cbChange: this.settings.cbChange,	    // pass along the callback with changes
		cbCreate: this.settings.cbCreate,
		cbClose: this.settings.cbClose,
		top: (rect.top + window.pageYOffset) + "px",
		left: rect.left + window.pageXOffset + "px", 
		zIndex: this.settings.zIndex,
		cbUpdateColorPicker: this.cbUpdateColorPicker.bind(this),
		container: this.container.parentNode,	    // append the gradient to the same parentNode as the colorpicker
		colorPicker: transfer ? undefined : this
	    }
	    this.settings.gradient = new $msRoot.Gradient(settings);
	}
	this.settings.gradient.showGradient(colorString);
	if (transfer) {
	    this.settings.gradient.cbUpdateColorPicker = undefined;
	    this.settings.gradient = undefined;
	    this.close();
	    if (close) {
		// with cancel - using gradient to reset to original value
		this.settings.gradient.close();
	    }
	} else {
	    this.cbUpdateColorPicker(colorString);
	    this.hide();
	}
    }
    
    // gradient colorstop selected - update the color values
    ColorPicker.prototype.cbUpdateColorPicker = function(color){
	if ($ms.hasClass(this.container, "display-none")) return;
	this.setColor(color);
    }
    
    // color values or opacity changed - update the gradient
    ColorPicker.prototype.updateGradientFromInput = function(){
	if (!this.settings.gradient) return;
	if (!this.settings.cbUpdateGradientFromColor) return;
	if (isNaN(this.opacityInput.value)) this.opacityInput.value = 100;
	var alpha = $ms.round(this.opacityInput.value / 100, 2);	
	this.settings.cbUpdateGradientFromColor(this.cvp.color);
    }
    
    $msRoot.getChildClasses(ColorPicker, "ColorPicker")
    return ColorPicker;
})();
