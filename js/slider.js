/*
 * Copyright (c) 2007 John Dyer (http://johndyer.name) MIT style license
 * Copyright © 2017 Michael Seifert (www.mseifert.com) All Rights Reserved
*/

$msRoot.createNS("Slider");
$msRoot.Slider = (function(bar, settings) {
    var instance = [];
    var instanceCounter = 0;
    var isMousedown = false;
    var mousedownTarget;	// id of instance
    var documentListenerSet = false;
    var windowScrollListenerSet = false;
    var scrollListeners = [];
    var scrollLocked = false;
    var defaultSettings = {
	xMinValue: 0,
	xMaxValue: 100,
	yMinValue: 0,
	yMaxValue: 100,
	imgPath: "",
	arrowImage: 'slider.gif',
	container: "",
	direction: "horizontal",
	snapY: 1,
	snapX: 1,
	scale: 1,
	bar2: {id: ""},
	cbSliderArrowMousedown: undefined,
	cbSliderBarMousedown: undefined,
	cbSliderMouseup: undefined,
	cbSliderArrowDblclick: undefined,
	ignoreBarMousedown: false,
	target: undefined,		// an input which holds the value of the slider - used for disable()
	sliderInput: false,		// true will create an input for the slider to display the value (may also create a units combo)
	parentNode: undefined,		// used to recalibrate on scroll - with sliderInput, gives the parent to appendChild
	hideCursor: false,		// hide cursor on mousedown (fixes percieved lag - only the arrow moves - no cursor to show arrow is behind)
	throttle: 0			// number of milliseconds to wait until fire onValuesChanged with each mousemove event
					// requestAnimationFrame() will fire about every 16ms so any value larger will reduce the load at the expense of possible choppiness
    }
       
    Slider.getInstance = function(instanceId, elementId){
	for (var i = 0; i < instance.length; i++){
	    if (typeof instanceId !== "undefined"){
		if (instance[i].id == instanceId){
		    // search by instanceId
		    return instance[i];
		}
	    } else if (typeof elementId !== "undefined"){
		// search by elementId
		if (typeof elementId == "object" && elementId !== null){
		    // if passed the element
		    elementId = elementId.id;
		}
		if (instance[i]._bar.id && instance[i]._bar.id == elementId){
		    return instance[i];
		}
	    } else {
		// with no parameters, return array of all instances
		return instance;
	    }
	}
    }
    
    Slider.addScrollListener = function(element, instance){
	// with scroll of a parent will need to recalculate postions
	for (var i = 0; i < scrollListeners; i++){
	    // if listener already set for an element, don't add it again
	    if (scrollListeners[i].element.id == element.id){
		for (var j = i; j < scrollListeners[i].instances.length; j++){
		    if (scrollListeners[i].instances[j].id == instance.id){
			// element already registered for this instance
			return;
		    }
		}
		// register this instance with this element (listener already set - don't add again
		scrollListeners[i].instances.push(this);
		return;
	    }
	}
	// set a new listener
	element.addEventListener("scroll", Slider.drop);
	// register this instance with this element
	scrollListeners.push({element: element, instances: new Array(instance)});
    }

    // remove all listeners set for an instnce
    Slider.removeScrollListeners = function(instance){
	for (var i = 0; i < scrollListeners; i++){
	    for (var j = i; j < scrollListeners[i].instances.length; j++){
		if (scrollListeners[i].instances[j].id == instance.id){
		    // found this instance for an element
		    if (scrollListeners[i].instances.length == 1){
			// remove the listener if no more instances registered for this eleemnt
			scrollListeners[i].instances[j].element.removeEventListener("scroll", Slider.drop);
			scrollListeners.splice(i, 1);
		    } else {
			// just remove from the registered list of instances for this element
			scrollListeners[i].instances.splice(j, 1);
		    }
		}
	    }
	}
    }    
    
    Slider.drop = function(){
	if (scrollLocked) return;
	scrollLocked = true;
    	for (var i = 0; i < instance.length; i++){
	    instance[i].setPositioningVariables();
	}
	scrollLocked = false;
    }
    
    if (!windowScrollListenerSet){
	windowScrollListenerSet = true;
	window.addEventListener("scroll", Slider.drop);
    }
    
    // static class function
    function mousemove(e){
	if (this.disabled) return;
	if (!isMousedown) return;
	
	var _this = Slider.getInstance(mousedownTarget);
	if (!_this){
	    mousedownTarget = undefined;
	    isMousedown = false;
	    console.log("Can't find slider instance for slider mousemove");
	    return;
	}
	// call the correct instance
	_this.mouseMove.call(_this, e);
	//_this.setValuesFromMousePosition.call(_this, e);
    }	

    function mouseup(e){
	if (this.disabled) return;
	if (!isMousedown) return;
	
	var _this = Slider.getInstance(mousedownTarget);
	if (!_this){
	    console.log("Can't find slider instance for slider mouseup");
	    return;
	}
	// call the correct instance
	_this.mouseup.call(_this, e);
    }
    
    function Slider(bar, settings) {
	this.xValue = 0;
	this.yValue = 0;
	
	instance.push(this);
	this.id = "ms-slider-" + instanceCounter++;
	this.settings = $ms.cloneSettings(defaultSettings, settings);
	if (this.settings.imgPath.length > 0 && this.settings.imgPath.substr(-1) !== "/") { 
	    this.settings.imgPath += "/";
	}
	
	// this.input;  //  will be defined
	if (this.settings.sliderInput){
	    this.createSliderInput();	    
	} else {	
	    // hook up controls
	    this.bar = bar;    // bar is the div which slider slides along
	    this.container = settings.container;
	}
	// build controls
	if (typeof this.settings.arrowImage !== "undefined"){
	    this.arrow = document.createElement('img');
	    
	} else {
	    // arrow is a div with background image
	    this.arrow = document.createElement('div');
	}
	var className = this.settings.sliderArrowClass ? this.settings.sliderArrowClass : "ms-slider-arrow";
	if (className.length > 0){
	    $ms.addClass(this.arrow, className);
	}
	    
	this.arrow.id = this.id + "-slider-arrow";
	this.arrow.border = 0;
	this.arrow.src = this.settings.imgPath + this.settings.arrowImage;
	// refresh arrow position once image loaded
	this.arrow.addEventListener('load', function sliderImageLoaded(){this.setArrowPositionFromValues()}.bind(this), false)	
	
	this.arrow.margin = 0;
	this.arrow.padding = 0;
	this.arrow.style.position = 'absolute';
	this.arrow.style.top = '0px';
	this.arrow.style.left = '0px';
	if (this.container.style.position !== "relative" && this.container.style.position !== "absolute"){
	    this.container.style.position = "relative";
	}
	this.container.appendChild(this.arrow);
	this.setPositioningVariables();

	if (!this.settings.ignoreBarMousedown){
	    this.bar.addEventListener('mousedown', function(e){this.barMousedown(e)}.bind(this));
	}
	this.bar.addEventListener('mouseup', function(e){this.mouseup(e)}.bind(this));
	this.bar.addEventListener('mousemove', function(e){mousemove(e)});
	    
	this.arrow.addEventListener('mousedown', function(e){this.arrowMousedown(e)}.bind(this));
	this.arrow.addEventListener('mouseup', function(e){this.mouseup(e)}.bind(this));
	this.arrow.addEventListener('mousemove', function(e){mousemove(e)});
	if (this.settings.cbSliderArrowDblclick){
	    // only set listener on dblclick if custom fn
	    this.arrow.addEventListener('dblclick', function(e){this.settings.cbSliderArrowDblclick(e, this)}.bind(this));
	}
	if (!documentListenerSet){
	    documentListenerSet = true;
	    document.body.addEventListener('mousemove', function(e){mousemove(e)});
	    document.body.addEventListener('mouseup', function(e){mouseup(e)});	    
	}
	// track the possible mousemove recipients with the
	if (this.settings.bar2.id) {
	    // if the bar is wider than the image (arrow is on outside of bar)
	    this.settings.bar2.addEventListener('mousemove', function(e){mousemove(e)}.bind(this));
	}

	// attach scroll listener to all parents that can scroll
	if (this.settings.parentNode){
	    var parent = this.settings.parentNode;
	    while (parent){
		var overflowY = getComputedStyle(parent).getPropertyValue("overflow-y");
		var overflowX = getComputedStyle(parent).getPropertyValue("overflow-y");
		if (overflowY == "auto"  || overflowY == "scroll" || overflowX == "auto"  || overflowX == "scroll" || overflowX == "visible"){
		    Slider.addScrollListener(parent, this);
		}
		if (parent.nodeName.toLowerCase() == "body"){
		    break;
		}
		parent = parent.parentNode;
	    }
	}
	
	// set initial position
	this.setArrowPositionFromValues();
	// fire events
	if (this.onValuesChanged)
	    this.onValuesChanged(this);
    }
    

    // remove the current instance from the instance list
    Slider.prototype.close = function(){
	// remove scroll listeners set for all elements for this instance
	Slider.removeScrollListeners(this);
	if (this.arrow.parentNode){
	    this.arrow.parentNode.removeChild(this.arrow);
	}
	
	for (var i=0; i < instance.length; i++){
	    if (instance[i].id == this.id){
		instance.splice(i, 1);
		break;
	    }
	}
	if (this.cbClose){
	    this.cbClose();
	}
    }
    
    Slider.prototype.setPositioningVariables = function() {
	// calculate sizes and ranges
	// BAR
	var barStyle = getComputedStyle(this.bar);
	this.barBorderWidth = parseFloat(barStyle.getPropertyValue("border-left-width")) + parseFloat(barStyle.getPropertyValue("border-right-width"));
	this.barBorderHeight = parseFloat(barStyle.getPropertyValue("border-top-width")) + parseFloat(barStyle.getPropertyValue("border-bottom-width"));
	this.barWidth = parseFloat(barStyle.getPropertyValue("width"));
	this.barHeight = parseFloat(barStyle.getPropertyValue("height"));
	var pos = $ms.getOffset(this.bar);
	this.barTop = pos.y;
	this.barLeft = pos.x;

	this.barBottom = this.barTop + this.barHeight;
	this.barRight = this.barLeft + this.barWidth;
	// ARROW
	var rect = $ms.getOffset(this.arrow);
	this.arrowWidth = parseFloat(getComputedStyle(this.arrow).getPropertyValue("width")) || 0;
	this.arrowHeight = parseFloat(getComputedStyle(this.arrow).getPropertyValue("height")) || 0;
    }
    
    Slider.prototype.setArrowPositionFromValues = function() {
	var _this = this;
	this.setPositioningVariables();
	// sets the arrow position from XValue and YValue properties - used when loading

	var arrowOffsetX = 0;
	var arrowOffsetY = 0;
	// X Value/Position
	if (this.settings.direction !== "horizontal" && this.settings.direction !== "both"){
	    // not moving horizontally - not setting position from value
	} else if (this.settings.xMinValue != this.settings.xMaxValue) {

	    if (this.xValue == this.settings.xMinValue) {
		arrowOffsetX = 0;
	    } else if (this.xValue == this.settings.xMaxValue) {
		arrowOffsetX = this.barWidth - 1;
	    } else {
		var xMax = this.settings.xMaxValue;
		if (this.settings.xMinValue < 1) {
		    xMax = xMax + Math.abs(this.settings.xMinValue) + 1;
		}
		var xValue = this.xValue;
		if (this.xValue < 1)
		    xValue = xValue + 1;
		arrowOffsetX = xValue / xMax * this.barWidth;
		if (parseFloat(arrowOffsetX) == (xMax - 1))
		    arrowOffsetX = xMax;
		else
		    arrowOffsetX = parseFloat(arrowOffsetX);
		// shift back to normal values
		if (this.settings.xMinValue < 1) {
		    arrowOffsetX = arrowOffsetX - Math.abs(this.settings.xMinValue) - 1;
		}
	    }
	}

	// Y Value/Position
	if (this.settings.direction !== "vertical" &&  this.settings.direction !== "both"){
	    // not moving vertically - not setting position from value
	} else if (this.settings.yMinValue != this.settings.yMaxValue) {

	    if (this.yValue == this.settings.yMinValue) {
		arrowOffsetY = 0;
	    } else if (this.yValue == this.settings.yMaxValue) {
		arrowOffsetY = this.barHeight - 1;
	    } else {

		var yMax = this.settings.yMaxValue;
		if (this.settings.yMinValue < 1) {
		    yMax = yMax + Math.abs(this.settings.yMinValue) + 1;
		}
		var yValue = this.yValue;
		if (this.yValue < 1)
		    yValue = yValue + 1;
		var arrowOffsetY = yValue / yMax * this.barHeight;
		if (parseFloat(arrowOffsetY) == (yMax - 1))
		    arrowOffsetY = yMax;
		else
		    arrowOffsetY = parseFloat(arrowOffsetY);
		if (this.settings.yMinValue < 1) {
		    arrowOffsetY = arrowOffsetY - Math.abs(this.settings.yMinValue) - 1;
		}
	    }
	}
	this.setArrowPosition(arrowOffsetX, arrowOffsetY);
    }
    Slider.prototype.setArrowPosition = function(offsetX, offsetY) {
	// validate
	if (offsetX < 0)
	    offsetX = 0
	if (offsetX > this.barWidth)
	    offsetX = this.barWidth;
	if (offsetY < 0)
	    offsetY = 0
	if (offsetY > this.barHeight)
	    offsetY = this.barHeight;
	if (this.settings.direction !== "horizontal" && this.settings.direction !== "both"){
	    offsetX = 0;
	}
	if (this.settings.direction !== "vertical" &&  this.settings.direction !== "both"){
	    offsetY = 0;
	}

	// bar is the slider image
	// offsetX and offsetY are the mouse position relative to the bar
	// start off at the top / left of the bar plus mouse position	
	var posX = offsetX;
	var posY = offsetY;

	// The arrows are absolute position and children of the container div
	// arrow must be adjusted by its and container's hight / width to center

	// check if the arrow is bigger than the bar area
	if (this.settings.direction == "horizontal" || this.settings.direction == "both"){
	    // bar is sliding horizontally, move left to center it
	    posX -= parseFloat(this.arrowWidth / 2);
	    posX = Math.round(posX / this.settings.snapX) * this.settings.snapX;
	} else {
	    // bar is NOT sliding horizontally - center horizontally around or in the bar
	    posX += ((this.barWidth + this.barBorderWidth) - this.arrowWidth) / 2;
	}
	if (this.settings.direction == "vertical" || this.settings.direction == "both"){
	    // if bar is sliding up / down, then move down to center it
	    posY -= parseFloat(this.arrowHeight / 2);
	    posY = Math.round(posY / this.settings.snapY) * this.settings.snapY;
	} else {
	    // bar is NOT sliding vertically - center it around or in the bar
	    posY += ((this.barHeight + this.barBorderHeight) - this.arrowHeight) / 2;
	}

	this.arrow.style.left = posX + 'px';
	this.arrow.style.top = posY + 'px';
    }
    
    Slider.prototype.barMousedown = function(e) {
	if (this.disabled) {
	    e.preventDefault();
	    return;
	}
	this.setPositioningVariables();
	if (this.settings.cbSliderBarMousedown){
	    // flag mousedown on bar - default action is to slide to the point of click
	    if (!this.settings.cbSliderBarMousedown(e, this)){
		// if return false from callback
		// overrides the default action
		return;
	    }
	}
	this.mousedown(e);
	// force update
	this.deltaT = this.settings.throttle + 1;
	// set values and update with callback
	this.setValuesFromMousePosition(e);
	this.update();
    }
    Slider.prototype.arrowMousedown = function(e) {
	if (this.disabled) {
	    e.preventDefault();
	    return;
	}
	this.setPositioningVariables();
	if (this.settings.cbSliderArrowMousedown){
	    // flag mousedown on slider arrow - default to start sliding
	    if (!this.settings.cbSliderArrowMousedown(e, this)){
		// if return false from callback
		// overrides the default action
		return;
	    }
	}
	// with click on arrow, select but don't adjust position
	// this will prevent moving of the slider when not intended
	this.mousedown(e);
	this.update();
    }
    Slider.prototype.mousedown = function(e) {
	e.preventDefault();	// required or mouseup won't be recognized
	isMousedown = true;		// flag mouse is pressed
	mousedownTarget = this.id;
	if (this.settings.hideCursor){
	    $ms.addClass(this.arrow, "ms-nocursor");
	    $ms.addClass(this.bar, "ms-nocursor");
	}
    }
    Slider.prototype.mouseMove = function(e){
	// save the event positions
	this.mouseMoveEvent = e;
    }    
    
    Slider.prototype.update = function() {
	var _this = this;
	var last;
	(function update(now){
	    if (!last) 
		last = now;
	    _this.deltaT = now - last;
	    if (isMousedown){
		requestAnimationFrame(function() {update(Date.now())});
		if (_this.mouseMoveEvent){
		    _this.setValuesFromMousePosition(_this.mouseMoveEvent);
		}
	    }
	    if (_this.deltaT > _this.settings.throttle){
		last = now
	    }
	})(Date.now());
    }
    Slider.prototype.mouseup = function(e) {
	if (this.disabled) {
	    e.preventDefault();
	    return;
	}
	isMousedown = false;
	this.mouseMoveEvent = null;
	if (this.settings.cbSliderMouseup){
	    // flag done sliding
	    this.settings.cbSliderMouseup(e, this);
	}
	if (this.settings.hideCursor){
	    $ms.removeClass(this.arrow, "ms-nocursor");
	    $ms.removeClass(this.bar, "ms-nocursor");
	}
    }
    
    Slider.prototype.getValuesFromMousePosition = function(e) {
	// passing true will only get the values and not set them
	return this.setValuesFromMousePosition(e, true);
    }
    
    Slider.prototype.setValuesFromMousePosition = function(e, getValueOnly) {
	//this.setPositioningVariables();
	var mouse = {x: e.pageX, y: e.pageY};	// clientX??
	var relativeX = 0;
	var relativeY = 0;
	// mouse relative to object's top left
	if (mouse.x < this.barLeft){
	    relativeX = 0;
	} else if (mouse.x > this.barRight) {
	    relativeX = this.barWidth;
	} else {
	    relativeX = mouse.x - this.barLeft + 1;
	}
	
	if (mouse.y < this.barTop){
	    relativeY = 0;
	} else if (mouse.y > this.barBottom){
	    relativeY = this.barHeight;
	} else {
	    relativeY = mouse.y - this.barTop + 1;
	}
	
	// added to match setArrowPositionFromValues in how deal with min value < 1
	var xMax = this.settings.xMaxValue;
	if (this.settings.xMinValue < 1) {
	    xMax = xMax + Math.abs(this.settings.xMinValue) + 1;
	}		
	var yMax = this.settings.yMaxValue;
	if (this.settings.yMinValue < 1) {
	    yMax = yMax + Math.abs(this.settings.yMinValue) + 1;
	}		
	
	var newXValue = parseFloat(relativeX / this.barWidth * xMax);
	newXValue = Math.min(newXValue, this.settings.xMaxValue);
	newXValue = Math.max(newXValue, this.settings.xMinValue);
	var newYValue = parseFloat(relativeY / this.barHeight * yMax);
	newYValue = Math.min(newYValue, this.settings.yMaxValue);
	newYValue = Math.max(newYValue, this.settings.yMinValue);

	// with click on bar, sometimes just want the value (e.g. gradients)
	if (getValueOnly) return {x: newXValue, y: newYValue}
	
	// set values
	this.xValue = newXValue;
	this.yValue = newYValue;
	// position arrow
	if (this.settings.xMaxValue == this.settings.xMinValue)
	    relativeX = 0;
	if (this.settings.yMaxValue == this.settings.yMinValue)
	    relativeY = 0;
	this.setArrowPosition(relativeX, relativeY);

	// fire events
	if (this.onValuesChanged && this.deltaT > this.settings.throttle)
	    this.onValuesChanged(this);
    }

    Slider.prototype.disable = function() {
	var target = this.settings.target;

	this.disabled = true;
	$ms.addClass(this.bar, "ms-disabled")
	if (target){
	    if (!Array.isArray(target)){
		target = [];
		target.push(this.settings.target);
	    }
	    for (var i = 0; i < target.length; i++){
		$ms.addClass(target[i], "ms-disabled")
		target[i].disabled = "disabled";
	    }
	}
    }
    Slider.prototype.enable = function() {
	var target = this.settings.target;
	this.disabled = false;
	$ms.removeClass(this.bar, "ms-disabled")
	if (target){
	    if (!Array.isArray(target)){
		target = [];
		target.push(this.settings.target);
	    }
	    for (var i = 0; i < target.length; i++){
		$ms.removeClass(target[i], "ms-disabled")
		target[i].removeAttribute("disabled");
	    }
	}
    }
    
    // create slider 
    Slider.prototype.createSliderInput = function(){
	var min = 1, max = 100;
	var snapX = 4;
	var defaultUnit = "px"
	var units;
	var inputId = this.id + "slider-input";

	if (typeof this.settings.min !== "undefined" && typeof this.settings.max !== "undefined") {
	    if (this.settings.direction == "horizontal"){
		this.settings.xMinValue = this.settings.min;
		this.settings.xMaxValue = this.settings.max;
		this.settings.yMinValue = 1;
		this.settings.yMaxValue = 1;
	    } else {
		this.settings.yMinValue = this.settings.min;
		this.settings.yMaxValue = this.settings.max;
		this.settings.xMinValue = 1;
		this.settings.xMaxValue = 1;
	    }
	}
	if (typeof this.settings.inputId !== "undefined") inputId = this.settings.inputId;
	max = max * snapX;
	min = min * snapX;

	// there are 5px between bar slider and input
	this.input = document.createElement('input');
	this.input.id = inputId;
	this.input.className = "ms-slider-input";
	if (this.settings.inputWidth){
	    this.input.style.width = this.settings.inputWidth + "px";
	}
	if (this.settings.unitOptions){
	    // for slider that controls value of an element property (e.g. width) 
	    // create a combo box for the units
	    this.scale = 1;
	    // get the current unit from the property of the element - default to px
	    if (!this.settings.element || !this.settings.propName || typeof this.settings.units == "undefined") {
		units = "px";
	    } else {
		units = $ms.splitUnit(this.settings.element.style[this.settings.propName]).unit || defaultUnit;
	    }
	    this.scale = $ms.propUnitsScale(units);
	    this.unitCombo = $ms.createCombo(this.settings.unitOptions);
	    this.unitCombo.id = inputId + "-units";
	    this.unitCombo.className = "ms-slider-units";
	    this.unitCombo.onchange = new function(){
		// function class so can remember the last units using static
		var oldUnit;
		return function(){
		    if (typeof oldUnit == "undefined"){ 
			oldUnit = units;
		    }
		    var convert = $ms.convertUnits(this.input.value + oldUnit, this.unitCombo.value);
		    this.input.value = convert.numeric;
		    this.scale = $ms.propUnitsScale(this.unitCombo.value);
		    // save static variable
		    oldUnit = this.unitCombo.value;
		    // fire event for slider to recalc
		    this.input.onchange();
		    // fire event to update the source
		    this.onValuesChanged();
		}.bind(this);
	    }.bind(this);	    
	}

	// next line
	this.container = document.createElement('div')
	this.container.className = "ms-slider-bar-container";
	this.bar = document.createElement('div')	
	this.bar.className = "ms-slider-bar";
	this.bar.style.width = (this.settings.sliderWidth || 100) + "px";
	this.container.appendChild(this.bar);

	if (this.settings.parentNode){
	    // append to DOM, so slider can add scroll listeners to container
	    this.settings.parentNode.appendChild(this.input);
	    if (this.settings.units){
		// the combo with unit choices
		this.settings.parentNode.appendChild(this.unitCombo);
	    }
	    if (this.settings.button){
		this.settings.buttonHeight = this.settings.buttonHeight ? this.settings.buttonHeight : "12px";
		// when slider is displayed with a button press
		// wrap it in a second container that is styled so it visually stands out
		// since it will be positioned absolutely and on top of other controls
		var sliderContainer2 = document.createElement('div')
		var buttonHeight = $ms.elementSize(this.input).height;
		var button = document.createElement("div");
		button.className = "ms-gradient-button ms-button-tool";
		button.style.height = buttonHeight + "px";
		button.style.lineHeight = buttonHeight + "px";
		button.innerHTML = "►";   // &#9658	
		
		var parent = this.settings.parentNode;
		while (parent && parent.style){
		    if (parent.style.position == "relative" || parent.style.position == "absolute"){
			sliderContainer2.style.position = "absolute";
			break;
		    }
		    parent = parent.parentNode;
		}
		if (sliderContainer2.style.position !== "absolute"){
		    // no positioned parent - default back to simple insert with no wrapper div around slider
		    sliderContainer2 = sliderContainer
		} else {
		    sliderContainer2.appendChild(sliderContainer);	    
		}
		sliderContainer2.className = "display-none";

		this.sliderButtonClick = function(){
		    if (this.disabled) return;
		    if (! $ms.hasClass(sliderContainer2, "display-none")){
			// toggle hide / show
			$ms.addClass(sliderContainer2, "display-none");
			return;
		    }
		    // fallback values if can't set absolute position
		    if (sliderContainer2.style.position == "absolute"){
			// need to not have display: none to get the height
			sliderContainer2.style.padding = "3px 10px";
			sliderContainer2.style.border = "2px solid rgb(155,155,155)";
			sliderContainer2.style.borderRadius = "5px";
			sliderContainer2.style.visibility = "hidden";
			$ms.removeClass(sliderContainer2, "display-none");		    
			var adjustY = (parseInt(button.style.height) - parseInt(sliderContainer2.offsetHeight)) / 2;
			var rect = $ms.getOffset(button);
			var parentRect = $ms.getOffset(parent);
			sliderContainer2.style.top = (rect.top - parentRect.top + adjustY) + "px";
			sliderContainer2.style.left = (rect.left - parentRect.left + rect.width + 2) + "px";
			sliderContainer2.style.backgroundColor = "rgb(218,218,218)";
		    }
		    this.setPositioningVariables();		
		    this.setArrowPositionFromValues();
		    sliderContainer2.style.visibility = "visible";
		    $ms.removeClass(sliderContainer2, "display-none")
		};
		button.onclick = this.sliderButtonClick;
		this.settings.parentNode.appendChild(button);
	    }
	    if (this.settings.textAfterInput) {
		this.settings.parentNode.appendChild(document.createTextNode(this.settings.textAfterInput));
	    }
	    if (this.settings.button){
		this.settings.parentNode.appendChild(sliderContainer2);
	    } else {
		this.settings.parentNode.appendChild(this.container);
	    }

	}
	this.onValuesChanged = function() {
	    this.input.value = Math.round((Math.round(this.xValue / this.settings.snapX) * this.settings.snapX) / this.settings.snapX);
	    this.input.value = this.input.value / this.scale;
	    if (typeof this.settings.unitOptions == "undefined" && typeof this.settings.units !== "undefined"){
		// if there is not a separate units combobox
		// and the units are defined with the slider	    
		this.input.value += this.settings.units;
	    }
	    if (this.settings.cbUpdateSource){
		this.settings.cbUpdateSource();	    //element, prop, input
	    }
	}.bind(this);

	this.input.onchange = function(){
	    if (this.input.value == ""){
		// will unset property
		this.xValue = 0;
		this.setArrowPositionFromValues();
	    } else {
		var value = (this.input.value * 1) || 0;
		value = value * this.scale;
		// adjust xValue with snapX setting
		this.xValue = Math.round((value * snapX) / snapX) * snapX;
		this.setArrowPositionFromValues();
	    }
	}.bind(this);
    }    
    return Slider;
})();
