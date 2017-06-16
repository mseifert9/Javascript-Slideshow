/* Copyright © 2017 Michael Seifert - www.mseifert.com - All Rights Reserved */

$ms.resizable = function(element, settings){
    return function(element, settings){ return new $msRoot.Resize(element, settings)}(element, settings);
}
/*
 * 
 * Settings:
 *	handles	    - comma delimeted string or array of handle options - valid values n, s, e, w, ne, nw, se, sw
 *	hovers	    - comma delimeted string or array of hover options - valid values n, s, e, w
 *	cbResize    - callback on resize (mousemove) event
 *	cbStart    - callback on resize (mousemove) event
 *	boundingBoxContainer	- parentNode for bounding box
 *	alsoResize  -	array of linked elements to also resize to same dimensions
 *	handleColor -	allow to pass 'green' for the slideshow
 */

$msRoot.Resize = (function(element, settings){
    var instance = [];
    var instanceCounter = 0;
    
    var defaultSettings = {
	handles: ["se"],
	hovers: [],
	cbResize: undefined,
	cbStart: undefined,
	cbStop: undefined,
	boundingBoxContainer: undefined,	// for bounding box
	alsoResize: undefined,		// flag to resize linked elements
	cornerHandles: "triangle",	// options: triangle, box
	handleColor: "",		// allows for "green" or default grey 
	negativeSizeAllowed: false,	// true allows resizing above top or to left of left
	minWidth: undefined,		// Minimum pixel size of elements. - integer value
	minHeight: undefined,
	minTop: 0,			// bounds for Top / Left when resizing
	minLeft: 0,
	disabled: false,
	altMirrors: true
    }
    Resize.getInstance = function(instanceId, elementId){
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
		if (instance[i].element && instance[i].element.id == elementId){
		    return instance[i];
		}
	    } else {
		// with no parameters, return array of all instances
		return instance;
	    }
	}
    }
    function Resize(element, settings){
	this.element;
	this.allow = {top: false, left: false, bottom: false, right: false, width: false, height: false};
	this.settings = defaultSettings;
	this.resizeMousemoveListener;
	this.resizeMouseupListener;
	this.hoverMousemoveListener;
	this.hoverMousedownListener;
	this.handleMousedownListener;
	this.boundingBoxMousedownListener;
	this.resizing = false;		// true = actively resizing
	this.handleElements = [];	// array of handle elements created
	this.mousedownTarget;		// the handle that initiated the resize

	this.reset();
	
	this.id = "_resize" + instanceCounter++ + "-";
	if (instance.length > 0){
	    for (var i = 0; i < instance.length; i++){
		if (instance[i].id == this.id){
		    // slideshow already open
		    // return its instance
		    return instance[i]
		}
	    }
	}
	instance.push(this);	
	if (typeof settings !== "undefined"){
	    this.register(element, settings);	    
	}
    }
    
    Resize.prototype.reset = function(){
	this.resizing = false;
	this.lock = "";			// valid values are X or Y
	this.overBorder = "";
	
	this.startWidth = 0;
	this.startHeight = 0;
	this.startMouseX = 0;
	this.startMouseY = 0;
	this.diffX = 0;
	this.diffY = 0;
	
	// these are offset relative
	this.startTop = 0;
	this.startLeft = 0;
	// for undo - these are the property values
	this.startElementTop;
	this.startElementLeft;
	this.startElementWidth;
	this.startElementHeight;
	
	this.mirror = false;	    // state of mirroring
	this.rightIsZero = false;
	if (this.element) {
	    $ms.removeClass(this.element, "ms-cursor-resize-ew");
	    $ms.removeClass(this.element, "ms-cursor-resize-ns");
	    $ms.removeClass(this.element, "ms-cursor-resize-se");
	    $ms.removeClass(this.element, "ms-cursor-resize-sw");
	}
    }
    
    Resize.prototype.init = function(e){
	var pos;
	var borderLeft = 0, borderTop = 0;
	var paddingRight = 0, paddingBottom = 0;
	if (this.overBorder == "e" || this.overBorder == "w"){
	    this.lock = "x";
	} else if (this.overBorder == "n" || this.overBorder == "s") {
	    this.lock = "y";
	}
	if (typeof this.element !== "undefined" && typeof this.settings.boundingBoxContainer == "undefined"){
	    pos = $ms.getOffset(this.element.parentNode);
	    borderLeft = parseFloat(getComputedStyle(this.element.parentNode).getPropertyValue("border-left-width"));
	    borderTop = parseFloat(getComputedStyle(this.element.parentNode).getPropertyValue("border-top-width"));
	    paddingBottom = parseFloat(getComputedStyle(this.element).getPropertyValue("padding-bottom"));
	    paddingRight = parseFloat(getComputedStyle(this.element).getPropertyValue("padding-right"));
	} else {
	    if ($ms.$(this.id + "bounding-box")){
		this.element.parentNode.removeChild(this.element);
	    }
	    // create a bounding box
	    this.element = document.createElement('div');
	    this.element.id = this.id + "bounding-box";
	    this.element.style.border = "1px solid black";
	    this.element.style.position = "absolute";
	    if (typeof this.settings.boundingBoxContainer == "undefined"){
		this.settings.boundingBoxContainer = document.body;
	    }
	    this.settings.boundingBoxContainer.appendChild(this.element);
	    pos = $ms.getOffset(this.element.parentNode);
	    // set the new element's postion
	    this.element.style.left = (e.pageX - pos.x) + "px";
	    this.element.style.top = (e.pageY - pos.y) + "px";
	}
	// test for border-box
	var boxSizing = getComputedStyle(this.element).getPropertyValue("box-sizing");
	// var boxSizing = getComputedStyle(this.element);
	if (boxSizing == "border-box"){
	    // include border with size
	    this.startWidth = this.element.offsetWidth;
	    this.startHeight = this.element.offsetHeight;
	} else {
	    this.startWidth = parseInt(this.element.clientWidth - paddingRight);
	    this.startHeight = parseInt(this.element.clientHeight - paddingBottom);
	}
	// save beginning position of mouse
	this.startMouseX = e.pageX;
	this.startMouseY = e.pageY;
	var rect = this.element.getBoundingClientRect();
	this.startTop = parseInt(rect.top - pos.y - borderTop + window.pageYOffset);
	this.startLeft  = parseInt(rect.left - pos.x - borderLeft + window.pageXOffset);
	if (this.overBorder == "w" || this.overBorder == "nw" || this.overBorder == "sw"){
	    this.rightIsZero = $ms.getPropertyValue(this.element, "right") == "0px";
	}
	// for undo
	this.startElementTop = $ms.getPropertyValue(this.element, "top");
	this.startElementLeft = $ms.getPropertyValue(this.element, "left");
	this.startElementWidth = $ms.getPropertyValue(this.element,"width");
	this.startElementHeight = $ms.getPropertyValue(this.element, "height");
	
	if (!this.settings.negativeSizeAllowed){
	    if (typeof this.settings.minHeight == "undefined" ) this.settings.minHeight = 0;
	    if (typeof this.settings.minWidth == "undefined" ) this.settings.minWidth = 0;
	}

	
	
/*
$ms.v("posY: " + pos.y);
$ms.v("clientY: " + e.clientY);
$ms.v("rect.top: " + rect.top);
$ms.v("Border top: " + getComputedStyle(this.element.parentNode).getPropertyValue("border-top-width"));
$ms.v("start Top: " + this.startTop);
$ms.v("clientHeight: " + this.element.clientHeight);
$ms.v("Padding Bottom: " + getComputedStyle(this.element).getPropertyValue("padding-bottom"));
$ms.v(this.element.id, this.element.parentNode.id);
*/
/*
$ms.v("posX: " + pos.x);
$ms.v("pageX: " + e.pageX);
$ms.v("rect.left: " + rect.left);
$ms.v("Border left: " + getComputedStyle(this.element.parentNode).getPropertyValue("border-left-width"));
$ms.v(this.element.id, this.element.parentNode.id);
*/
	if (this.lock == "x"){
	    $ms.addClass(this.element, "ms-cursor-resize-ew");
	} else if (this.lock == "y"){
	    $ms.addClass(this.element, "ms-cursor-resize-ns");
	} else if (this.overBorder == "nw" || this.overBorder == "se") {
	    $ms.addClass(this.element, "ms-cursor-resize-se");
	} else if (this.overBorder == "ne" || this.overBorder == "sw") {
	    $ms.addClass(this.element, "ms-cursor-resize-sw");
	}
    }

    Resize.prototype.resizeElement = function(e) {
	// This continually offsets the dragged this.element by the difference between the
	// last recorded mouse position (mouseX/Y) and the current mouse position.
	// We always record the current mouse/touch position.
	if (!this.element) return;
	if (this.settings.disabled) return;
	if (!this.resizing) return;
	
	// Record the cumulative relative mouse movement since started resizing
	this.diffX = parseInt(e.pageX - this.startMouseX);
	this.diffY = parseInt(e.pageY - this.startMouseY);
	if (e.altKey){
	    // alt - expand mirror image on all sides
	    if (this.settings.altMirrors && ! this.settings.negativeSizeAllowed){
		this.mirror = true;
		// override allow:top and allow:left
		this.allow.top = true;
		this.allow.left = true;
	    }
	}
	if (e.shiftKey){
	    var max;
	    // shift - equal x and y - use maximum
	    if (Math.abs(this.diffX) > Math.abs(this.diffY)){
		max = this.diffX;
	    } else {
		max = this.diffY;
	    }
	    this.diffX = max;
	    this.diffY = max;
	} else if (e.ctrlKey){
	    // ctrl - x OR y change based on the larger value - mirror on both sides
	    if (this.lock.length == 0){
		// lock not set
		if (Math.abs(this.diffX) > Math.abs(this.diffY)){
		    this.lock = "x";
		} else {
		    this.lock = "y";
		}
	    }
	}
	if (this.lock == "x") {
	    // lock x
	    this.diffY = 0;
	} else if (this.lock == "y") {
	    // lock y
	    this.diffX = 0;
	}

	// Calc new height and width
	if (this.overBorder == "n" || this.overBorder == "nw" || this.overBorder == "ne") {
	    var newHeight = this.startHeight - this.diffY * (this.mirror ? 2 : 1);
	} else {
	    var newHeight = this.startHeight + this.diffY * (this.mirror ? 2 : 1);
	}
//$ms.v("startHeight, diffY, newheight: ", this.startHeight, this.diffY, newHeight);
	if (this.overBorder == "w" || this.overBorder == "nw" || this.overBorder == "sw") {
	    // dragging left border
	    var newWidth = this.startWidth - this.diffX * (this.mirror ? 2 : 1);
	} else {
	    var newWidth = this.startWidth + this.diffX * (this.mirror ? 2 : 1);
	}
//$ms.v("startWidth, diffX, newWidth: ", this.startWidth, this.diffX, newWidth);
	
	// Mirroring - calc new top / left
	// var rect = this.element.getBoundingClientRect();
	//var newTop = parseInt(rect.top);	// this.element.style.top;
	//var newLeft = parseInt(rect.left);	// this.element.style.left
	var newTop = this.startTop;
	var newLeft = this.startLeft;
//$ms.v("new left: ", newLeft);
//$ms.v("new top: ", newTop);
	if (this.overBorder == "w" || this.overBorder == "nw" || this.overBorder == "sw") {
	    // moving left border
	    newLeft = (this.startLeft + this.diffX);
	} else if (this.mirror) {
	    newLeft = this.startLeft - this.diffX;
	}
	if (this.overBorder == "n"  || this.overBorder == "nw" || this.overBorder == "ne") {
	    // moving top border
	    newTop = (this.startTop + this.diffY);
	} else if (this.mirror){
	    // mirroring - change top and left
	    newTop =  this.startTop - this.diffY;
	}
	if (this.settings.negativeSizeAllowed){
	    // if box allowed to be dragged over LEFT or TOP boundaries 
	    // - reverse box direction & calc new top / left
	    // minHeight and minWidth are ignored
	    if (newWidth <= 0){
		newLeft = (this.startLeft + this.diffX);
	    }
	    if (newHeight <= 0){
		newTop = (this.startTop + this.diffY);
	    }
	} else {
	    if (newHeight <= 0)	newHeight = 0;
	    if (newHeight <= this.settings.minHeight) {
		// keep within minimum height
		newHeight = this.settings.minHeight;
		if (this.overBorder == "n" || this.overBorder == "nw" || this.overBorder == "ne") {
		    // if moving the top border, don't allow to go beyond where min height would be
		    newTop = this.startHeight - this.settings.minHeight + this.startTop;
		}
	    }
	    
	    if (newWidth <= 0) newWidth = 0;
	    if (newWidth <= this.settings.minWidth) {
		// keep within minimum width
		newWidth = this.settings.minWidth;
		if (this.overBorder == "w" || this.overBorder == "nw" || this.overBorder == "sw") {
		    // if moving the left border, don't allow to go beyond where min width would be
		    newLeft = this.startWidth - this.settings.minWidth + this.startLeft;
		}
	    }
	}
	    
	if ((this.allow.top && newTop < this.settings.minTop) || (this.allow.left && newLeft < this.settings.minLeft)){
	    // don't allow to go beyond set limits for top and left
	    return;
	}
	// resize the element
	if (this.allow.left && !this.rightIsZero) {
	    this.element.style.left = newLeft + "px";
	}
	if (this.allow.top && (this.mirror || this.overBorder == "n" || this.overBorder == "nw" || this.overBorder == "ne" 
		|| this.element.id == "bounding-box")){
	    this.element.style.top = newTop  + "px";
	}
	// Assign to this.element, with minimum dimensions / grid align.
	if (this.lock !== "y" && this.allow.width){
	    this.element.style.width = Math.abs(newWidth) + 'px';
	}
	if (this.lock !== "x" && this.allow.height){
	    this.element.style.height = Math.abs(newHeight) + 'px';
	}
	
	if (this.settings.alsoResize){
	    this.alsoResizeLinked();
	}
	if (this.settings.cbResize){
	    if (this.settings.cbClass){
		this.settings.cbResize.call(this.settings.cbClass, this.element, this);
	    } else {
		this.settings.cbResize(this.element, this);
	    }
	}
    }

    Resize.prototype.alsoResizeLinked = function() {
	// resize child this.elements
	if (!this.settings.alsoResize) return;
	var width = getComputedStyle(this.element).getPropertyValue("width");
	var height = getComputedStyle(this.element).getPropertyValue("height");
	
	if (!Array.isArray(this.settings.alsoResize)) {
	    this.settings.alsoResize = new Array(this.settings.alsoResize)
	}
	
	if (Array.isArray(this.settings.alsoResize)) {
	    for (var i = 0; i < this.settings.alsoResize.length; i++){
		/*
		if (this.element.position == "flex"){
		    // skip flex items and children of flex containers
		    v("skipping flex", this.element.style.flex, this.element.position, this.settings.alsoResize[i].style.flex);
		    continue;
		}
		*/
		/*
		var allowResizeWidth = true;
		var allowResizeHeight = true;
		if ($ms.hasClass(this.element, "held")){
		    // when an item is held by its parent- width is fixed
		    allowResizeWidth = true;
		    allowResizeHeight = false;
		}
	       */
		var allowResizeWidth = this.allow.width && this.lock !== "y";
		var allowResizeHeight = this.allow.height && this.lock !== "x";
		
		var width100 = false;
		if ($ms.hasClass(this.settings.alsoResize[i], "width100") || this.settings.alsoResize[i].style.width == "100%" ||
			$ms.hasClass(this.settings.alsoResize[i], "width-auto") || this.settings.alsoResize[i].style.width == "auto"){
		    width100 = true;
		}
		
		var height100 = false;
		if ($ms.hasClass(this.settings.alsoResize[i], "height100") || this.settings.alsoResize[i].style.height == "100%" ||
			$ms.hasClass(this.settings.alsoResize[i], "height-auto") || this.settings.alsoResize[i].style.height == "auto"){
		    height100 = true;
		}
		
		if (this.settings.alsoResize[i].nodeName == "IMG"){
		    // image elements height and width are set to element not style
		    this.settings.alsoResize[i].width = parseFloat(width);
		    this.settings.alsoResize[i].height = parseFloat(height);		    
		} else {
		    if (allowResizeWidth && !width100){
			this.settings.alsoResize[i].style.width = width;
		    }
		    if (allowResizeHeight && !height100){
			this.settings.alsoResize[i].style.height = height;
		    }
		    // verify that child this.element was able to be shrunk
		    // if was unable to shrink child, rollback the main element
		    var linkedWidth = parseInt(getComputedStyle(this.settings.alsoResize[i]).getPropertyValue("width"));
		    var linkedHeight = parseInt(getComputedStyle(this.settings.alsoResize[i]).getPropertyValue("height"));
		    if (linkedHeight > parseInt(height) && allowResizeHeight) {
			this.element.style.height = linkedHeight + "px";
			this.settings.alsoResize[i].style.height = linkedHeight + "px";
		    }
		    if (linkedWidth > parseInt(width) && allowResizeWidth) {
			this.element.style.width = linkedWidth + "px";
			this.settings.alsoResize[i].style.width = linkedWidth + "px";
		    }
		}
	    }
	}
    }
    
    /*
     * When mirroring with altKey
     *	if alt key lifted while resizing
     *	undo mirroring
     */
    Resize.prototype.mirrorOff = function(){
	if (this.mirror){
	    this.diffY = this.startTop - parseInt(this.element.style.top);
	    this.diffX = this.startLeft - parseInt(this.element.style.left);
	    this.element.style.top = this.startTop + "px";
	    this.element.style.left = this.startLeft + "px";

	    this.element.style.width = parseInt(this.element.style.width) - this.diffX + "px";
	    this.element.style.height =  parseInt(this.element.style.height) - this.diffY + "px";
	    if (this.settings.alsoResize){
		this.alsoResizeLinked();
	    }
	}
    }
    
    Resize.prototype.deleteElement = function(){	
	// allow delete of element if resize object created it
	if (typeof this.element !== "undefined" && this.element.id == "bounding-box"){
	    if (typeof this.element.parentNode !== "undefined"){
		if (this.element.parentNode){
		    this.element.parentNode.removeChild(this.element);
		}
	    }
	}
    }

    Resize.prototype.hoverBorder = function(e){
	if (!this.element) {
	    return;
	}
	var size = $ms.innerSize(this.element);
	var overBorder = "";
	// give 6 pixels of border to respond to resize
	if (this.allow.right && parseInt(e.offsetX) >= parseInt(size.x - Math.max(6, size.ieBorder.x))) {
	    // over right border
	    $ms.addClass(this.element, "ms-cursor-col-resize");
	    $ms.removeClass(this.element, "ms-cursor-row-resize");
	    overBorder = "e"
	} else if (this.allow.bottom && parseInt(e.offsetY) >= parseInt(size.y - Math.max(6, size.ieBorder.y))){
	    // over bottom border
	    $ms.addClass(this.element, "ms-cursor-row-resize");
	    $ms.removeClass(this.element, "ms-cursor-col-resize");
	    overBorder = "s";
	} else if (this.allow.left && e.offsetX <= 6) {
	    // over left border
	    $ms.addClass(this.element, "ms-cursor-col-resize");
	    $ms.removeClass(this.element, "ms-cursor-row-resize");
	    overBorder = "w";
	} else if (this.allow.top && e.offsetY <= 6) {
	    // over top border
	    $ms.addClass(this.element, "ms-cursor-row-resize");
	    $ms.removeClass(this.element, "ms-cursor-col-resize");
	    overBorder = "n";
	} else {
	    $ms.removeClass(this.element, "ms-cursor-row-resize");
	    $ms.removeClass(this.element, "ms-cursor-col-resize");
	}
	return overBorder;
    }

    // set all settings
    Resize.prototype.setSettings = function(settings){
	if (typeof settings == "undefined") return;
	this.settings = defaultSettings;
	if (typeof settings !== "undefined"){
	    // only overwrite those settings which are set
	    for (var setting in settings){
		if (settings.hasOwnProperty(setting)){
		    this.settings[setting] = settings[setting];
		}
	    }
	}
    }
    
    // set a single setting
    Resize.prototype.settings = function(name, value){
	if (! this.settings.hasOwnProperty(name)) return;
	if (typeof value !== "undefined"){
	    this.settings[name] = value;
	}
	return this.settings[name];
    }

    // alias of register
    // quasi jquery syntax
    Resize.prototype.resizable = function(element, settings) {
	this.register(element, settings);
    }
    
    // register an element for resizing
    // set all settings - optional - they can be set independently
    // create handles and hovers - must be done after all settings are set
    Resize.prototype.register = function(element, settings) {
	this.element = element;
	this.setSettings(settings);
	this.createHandles();
	this.createHovers();
	if (this.settings.boundingBoxContainer) this.createBoundingBox();
    }
    
    Resize.prototype.destroy = function() {
	this.close();
    }
    
    Resize.prototype.close = function() {
	for (var i = 0; i < this.handleElements.length; i++){
	    this.handleElements[i].removeEventListener("mousedown", this.handleMousedownListener);
	    this.handleElements[i].parentNode.removeChild(this.handleElements[i]);
	}
	this.handleElements = [];
	if (this.hoverMousemoveListener){
	    this.element.removeEventListener('mousemove', this.hoverMousemoveListener);
	}
	if (this.hoverMousedownListener){
	    this.element.addEventListener('mousedown', this.hoverMousedownListener); 
	}
	if (this.boundingBoxMousedownListener){
	    this.settings.boundingBoxContainer.removeEventListener('mousedown', this.boundingBoxMousedownListener);
	}
    }
    
    Resize.prototype.enable = function() {
	this.settings.disabled = false;
	for (var i = 0; i < this.handleElements.length; i++){
	    $ms.removeClass(this.handleElements[i], "display-none");
	}
    }
	
    Resize.prototype.disable = function() {
	this.settings.disabled = true;
	for (var i = 0; i < this.handleElements.length; i++){
	    $ms.addClass(this.handleElements[i], "display-none");
	}
    }
    // create or remove resize handle
    Resize.prototype.createHandles = function() {
	if (this.settings.handles === "") return;
	if (!this.element) return;
	if (this.element.style.position == "static") return;    // no handles for static
		
	if (!Array.isArray(this.settings.handles)){
	    this.settings.handles = this.settings.handles.split(",");
	}
	var validHandles = ["n", "s", "e", "w", "se", "sw", "ne", "nw"];
	for (var i = 0; i < this.settings.handles.length; i++){
	    if (validHandles.indexOf(this.settings.handles[i]) !== -1){
		switch(this.settings.handles[i]) {
		    case "n":
			this.allow.top = true;
			this.allow.height = true;
			break;
		    case "s":
			this.allow.bottom = true;
			this.allow.height = true;
			break;
		    case "e":
			this.allow.right = true;
			this.allow.width = true;
			break;
		    case "w":
			this.allow.left = true;
			this.allow.width = true;
			break;
		    case "se":
			this.allow.bottom = true;
			this.allow.right = true;
			this.allow.height = true;
			this.allow.width = true;
			break;
		    case "sw":
			this.allow.bottom = true;
			this.allow.left = true;
			this.allow.height = true;
			this.allow.width = true;
			break;
		    case "ne":
			this.allow.top = true;
			this.allow.right = true;
			this.allow.height = true;
			this.allow.width = true;
			break;
		    case "nw":
			this.allow.top = true;
			this.allow.left = true;
			this.allow.height = true;
			this.allow.width = true;
			break;
		}
		
		var div = document.createElement('div');
		var className = "ms-handle ms-handle-" + this.settings.handles[i];
		if (this.settings.handles[i].length == 2){
		    // corners have the option of being triangle or box
		    className += (this.settings.cornerHandles == "box" ? "" : "-triangle");
		}
		if (this.settings.handleColor == "green"){
		    className += " " + className + "-green";
		}
		if (this.settings.disabled){
		    className += " display-none";
		}
		div.className = className;
		div.id = this.id + "handle-" + this.settings.handles[i];
		div.draggable = false;
		this.handleMousedownListener = function(e) {
			if ($ms.detectButton(e) !== "left") return;
			this.mousedownHandle(e);
		      }.bind(this);
		div.addEventListener('mousedown', this.handleMousedownListener, false); 
		this.element.appendChild(div);
		this.handleElements.push(div);
	    }
	}	
    }
    
    Resize.prototype.createHovers = function(){
	var listenerSet = false;
	if (this.settings.hovers === "") return;
	if (!this.element) return;
	if (!Array.isArray(this.settings.hovers)){
	    this.settings.hovers = this.settings.hovers.split(",");
	}
	var validHovers = ["n", "s", "e", "w"];
	for (var i = 0; i < this.settings.hovers.length; i++){
	    if (validHovers.indexOf(this.settings.hovers[i]) !== -1){
		switch(this.settings.handles[i]) {
		    case "n":
			this.allow.top = true;
			this.allow.height = true;
			break;
		    case "s":
			this.allow.bottom = true;
			this.allow.height = true;
			break;
		    case "e":
			this.allow.right = true;
			this.allow.width = true;
			break;
		    case "w":
			this.allow.left = true;
			this.allow.width = true;
			break;
		}
		if (!listenerSet){
		    // only set listener once
		    listenerSet = true;
		    this.hoverMousemoveListener = function(e) {
			    if (this.resizing) return;
			    if (this.settings.disabled) return;
			    e.stopPropagation();
			    this.hoverBorder(e);
			}.bind(this);
		    this.element.addEventListener('mousemove', this.hoverMousemoveListener, false); 
		    this.hoverMousedownListener = function(e) {
			    if (this.resizing) return;
			    if (this.settings.disabled) return;
			    if ($ms.detectButton(e) !== "left") return;
			    this.mousedownHover(e);
			}.bind(this);
		    this.element.addEventListener('mousedown', this.hoverMousedownListener, false); 
		}
	    }
	}
    }
    
    // mousedown on handle
    Resize.prototype.mousedownHandle = function(e){
	if (!e.target.classList.contains("ms-handle")) return;
	this.mousedownTarget = e.target;
	switch(e.target.id) {
	    case this.id + "handle-e":
		this.overBorder = "e";
		this.lock = "x";
		break;
	    case this.id + "handle-w":
		this.overBorder = "w";
		this.lock = "x";
		break;
	    case this.id + "handle-n":
		this.overBorder = "n";
		this.lock = "y";
		break;
	    case this.id + "handle-s":
		this.overBorder = "s";
		this.lock = "y";
		break;
	    case this.id + "handle-se":
		this.overBorder = "se";
		this.lock = "";
		break;
	    case this.id + "handle-ne":
		this.overBorder = "ne";
		this.lock = "";
		break;
	    case this.id + "handle-nw":
		this.overBorder = "nw";
		this.lock = "";
		break;
	    case this.id + "handle-sw":
		this.overBorder = "sw";
		this.lock = "";
		break;
	    default:
		return;
	}
	this.mousedown(e);
    }
    
    Resize.prototype.mousedownHover = function(e){
	this.overBorder = this.hoverBorder(e);
	switch(this.overBorder) {
	    case "e":
	    case "w":
		this.lock = "x";
		break;
	    case "n":
	    case "s":
		this.lock = "y";
		break;
	    default:
		return;
	}
	this.mousedown(e);
    }

    Resize.prototype.createBoundingBox = function(){
	if (!this.settings.boundingBoxContainer) return;
	this.allow = {top: true, left: true, bottom: true, right: true, width: true, height: true};
	this.boundingBoxMousedownListener = function(e) {
		if ($ms.detectButton(e) !== "left") return;
		this.mousedown(e);
	      }.bind(this);
	this.settings.boundingBoxContainer.addEventListener('mousedown', this.boundingBoxMousedownListener, false); 
    }
    
    // mousedown on parent for bounding box
    Resize.prototype.mousedownBoundingBox = function(e){
	this.mousedown(e);
    }
    
    
    Resize.prototype.mousedown = function(e){
	// prevent default drag behavior
	e.preventDefault();
	this.resizing = true;
	if (this.settings.cbStart){
	    if (this.settings.cbClass){
		this.settings.cbStart.call(this.settings.cbClass, this.element, this);
	    } else {
		this.settings.cbStart(this.element, this);
	    }
	}
	// RESIZE
	this.resizeMousemoveListener = function(e){this.resizeElement(e)}.bind(this);		
	window.addEventListener('mousemove', this.resizeMousemoveListener);	

	this.resizeMouseupListener = function(e) {this.mouseup(e)}.bind(this);
	window.addEventListener('mouseup', this.resizeMouseupListener);

	this.init(e);
    }
    
    Resize.prototype.mouseup = function(e){
	if (e.stopPropagation){e.stopPropagation()};
	if (this.settings.cbStop){
	    if (this.settings.cbClass){
		this.settings.cbStop.call(this.settings.cbClass, this.element, this);
	    } else {
		this.settings.cbStop(this.element, this);
	    }
	}
	this.reset();
	window.removeEventListener('mousemove', this.resizeMousemoveListener);
	window.removeEventListener('mouseup', this.resizeMouseupListener);
    }
    
    return Resize;
           
})();
