/* Copyright © 2017 Michael Seifert (www.mseifert.com) All Rights Reserved */
$msRoot.createNS("EditableCombo");
$msRoot.EditableCombo = (function(options, settings){    
    var instanceCounter = 0;
    var instance = [];
    var defaultSettings = {
	containerId: undefined,
	width: "200px", 
	maxHeight: undefined,
	cbChange: undefined,
	observeSizeChanges: false,	// if the width or height of the combo can dynamically change, true will set an observer to resize the input (calling close() when control is unloaded will remove the observer)
	listenWindowClick: false	// true: will close combo select options with click to any window element (not captured by the combo)
    }
    
    var arrowImage = $ms.STATIC_IMG_COMMON + '/design-combo-arrow.gif'; // Regular arrow
    var arrowImageOver = $ms.STATIC_IMG_COMMON + '/design-combo-arrow-over.gif'; // Mouse over
    var arrowImageDown = $ms.STATIC_IMG_COMMON + '/design-combo-arrow-down.gif'; // Mouse down
    var nextComboId = 0;
    var currentlyOpenedOptionBox = false;
    var editableCombo_activeArrow = false;
    var selectedBackgroundColor = "rgb(0, 0, 197)"
    var selectedColor = "rgb(255, 255, 255)";
    
     function EditableCombo(options, settings) {
	this.id = "ms-editableCombo-" + (instanceCounter++) + "-";
	this.container;
	this.input;
	this.style = {display: ""}; // for compatibility with controls
	this.className = "";
	this.value = "";
	this.options = [];	    // options passed either array of strings or object {label: xxx, value: xxx}
	this.selectedOption;
	this.highlightedOption;
	this.settings = $ms.cloneSettings(defaultSettings, settings);
	this.optionCounter = 0;
	this.optiondiv;
	this.arrow;
	this.iframe;
	this.inputHeight;
	this.observer;
	
	this.createEditableCombo(options);
	
	if (this.settings.listenWindowClick){
	    this.closeOptionsFn = function(){this.closeOptions()}.bind(this);
	    window.addEventListener("click", this.closeOptionsFn);
	}
	if (this.settings.observeSizeChanges){
	    // an observer to automatically resize the input if the container is resized
	    var event = function(event){
		if (event.animationName == 'ms-onload') {
		    this.setObserver();
		}
	    }.bind(this);
	    $ms.setOnLoad(this.container, event);
	}
    }
    EditableCombo.prototype.setObserver = function() {
	var _this = this;
	this.observer = new $ms.MutationObserver();
	this.observer.observe("#" + this.container.id,
	    {observe: {attributes: true, attributeOldValue: true, attributeFilter: ['style']},
	    querySelectorAll:false,
	    cb: function(target, changes){  
		try {
		    _this.resize.call(_this);
		} catch (e){
		}
	    }.bind(this),
	    property: ["height", "width"],
	    }
	);
    }    
    EditableCombo.prototype.switchImageUrl = function() {
	if (this.src.indexOf(arrowImage) >= 0){
	    this.src = this.src.replace(arrowImage, arrowImageOver);
	} else{
	    this.src = this.src.replace(arrowImageOver, arrowImage);
	}
    }

    EditableCombo.prototype.showOptions = function(e, keepOpen) {
	e.stopPropagation();
	if (editableCombo_activeArrow && editableCombo_activeArrow != e.target){
	    editableCombo_activeArrow.src = arrowImage;
	}
	editableCombo_activeArrow = e.target;	
	var alreadyOpen = this.optionDiv.style.display == 'block';
	if (alreadyOpen && ! keepOpen){
	    this.optionDiv.style.display = 'none';
	    /*
	    if (navigator.userAgent.indexOf('MSIE') >= 0){
		this.iframe.style.display = 'none';
		e.target.src = arrowImageOver;
	    }
	    */
	} else{
	    // is scroll in effect for immediate divs? so that content is off page when add the options?
	    // test before and after
	    this.optionDiv.style.removeProperty("height");
	    this.optionDiv.style.top = this.inputHeight + "px";
	    this.optionDiv.style.display = 'block';	    
	    var optionDivHeight = $ms.getOffset(this.optionDiv).height;
	    if (this.settings.maxHeight > 0 && optionDivHeight > this.settings.maxHeight){
		optionDivHeight = this.settings.maxHeight;
		this.optionDiv.style.height = this.settings.maxHeight + "px";
	    }
	    
	    // test for parentNode overflow restricting
	    var overflowY = 0;
	    var nodeTop = 0;
	    var expandUp = false;
	    var node = this.container.parentNode
	    for (var i = 0; i < 5; i++){
		// go max 5 layers up		
		if (node && node.scrollHeight && node.clientHeight){
		    if (getComputedStyle(node).getPropertyValue("overflow-y") == "hidden"){
			var diff2;
			overflowY = node.scrollHeight - node.clientHeight;
			if (overflowY > 0){
			    // found scroll - test if combo contributed to any part of the scroll
			    this.optionDiv.style.display = 'none';
			    diff2 = node.scrollHeight - node.clientHeight;
			    if (diff2 < overflowY){
				nodeTop = $ms.getOffset(node).top;
				expandUp = true;
			    } else {
				overflowY = 0
			    }
			    this.optionDiv.style.display = 'block';
			}
			break;
		    }
		    node = node.parentNode;
		}
	    }	    
	    
	    var offset = $ms.getOffset(this.input);
	    
	    var scrollBarWidth = 0;
	    if ($ms.hasHorizontalScroll()){
		scrollBarWidth = $ms.getScrollBarSize();
	    }
	    var inputTop = offset.y - $ms.getScroll().y;
	    var comboToBottom = window.innerHeight - scrollBarWidth - (inputTop + this.inputHeight) - overflowY;
	    var topToCombo = inputTop;
	    
	    if (expandUp || optionDivHeight > comboToBottom){
		// options would be off page
		if (optionDivHeight < topToCombo) {
		    // expand up
		    this.optionDiv.style.top = -optionDivHeight + "px";
		} else {
		    // if the list too long for either, shorten it
		    var diffDown = optionDivHeight - comboToBottom;
		    var diffUp = optionDivHeight - topToCombo;
		    if (diffDown < diffUp){
			// down is a better fit
			this.optionDiv.style.height = Math.max(100, optionDivHeight - diffDown) + "px";
			this.optionDiv.style.top = this.inputHeight + "px";
		    } else if (overflowY > 0) {
			// expand up but limit height to the amount of room between parent node (with overflow: hidden) and the combo
			this.optionDiv.style.height = Math.max(100, Math.min(offset.top - nodeTop, optionDivHeight - diffUp)) + "px";
			this.optionDiv.style.top = -parseFloat(this.optionDiv.style.height) + "px";
		    } else {
			// expand up
			this.optionDiv.style.height = Math.max(100, optionDivHeight - diffUp) + "px";
			this.optionDiv.style.top = -parseFloat(this.optionDiv.style.height) + "px";
		    }
		}
	    }

	    /*
	    if (navigator.userAgent.indexOf('MSIE') >= 0)
		this.iframe.style.display = 'block';
		e.target.src = arrowImageDown;
	    */
	    if (currentlyOpenedOptionBox && currentlyOpenedOptionBox != this.optionDiv)
		currentlyOpenedOptionBox.style.display = 'none';
		currentlyOpenedOptionBox = this.optionDiv;
	}
	if (e.keyCode && (e.keyCode == 38 || e.keyCode == 40)){
	    if (this.optionDiv.childNodes.length == 0){
		return;
	    }
	    // if an arrow opened the options
	    if (!this.selectedOption){
		// select first one if none selected
		this.selectOption(this.options[0], {keepOpen: keepOpen, runCb: false});
		return;
	    } else {
		// find existing position
		var current = -1;
		for (var i = 0; i < this.optionDiv.childNodes.length; i++){
		    if (this.optionDiv.childNodes[i].id == this.selectedOption.div.id){
			current = i;
			break;
		    }
		}
		if (alreadyOpen){
		    // only change postion if options were already visible
		    switch(e.keyCode) {
			case 38:    // up
			    current--;
			    break;
			case 40:    // down
			    current++
			    break;
		    }
		}
		current = Math.min(current, this.optionDiv.childNodes.length -1);
		current = Math.max(current, 0);
		this.selectOption(this.options[current], {keepOpen: keepOpen, runCb: false});
		return;
	    }
	}	
    }

    EditableCombo.prototype.selectOption = function(option, settings) {
	this.input.value = option.value;
	this.value = option.value;
	var div = option.div;
	if (!settings){
	    settings = {};
	}
	
	this.unhighlightAll();
	this.highlightedOption = undefined;
	if (this.selectedOption && div.id !== this.selectedOption.div.id){
	    // unhighlight previous selected
	    this.selectedOption.div.style.backgroundColor = "";
	    this.selectedOption.div.style.color = "";
	}	
	this.selectedOption = option;
	$ms.addClass(this.selectedOption.div, "ms-editable-combo-selected");
	$ms.scrollIntoView(this.selectedOption.div);
	if (!settings.keepOpen){
	    this.closeOptions();
	}
	this.input.value = option.value
	if (this.settings.cbChange && settings.runCb){
	    this.settings.cbChange(this, true);	// true = selected
	}
    }
    
    EditableCombo.prototype.setMouseoverOption = function(div) {
	// highlight match
	this.mouseoverOption(div, "on");
	// scroll to it
	$ms.scrollIntoView(div);
    }

    EditableCombo.prototype.mouseoverOption = function(target, mode) {
	if (!this.highlightedOption){
	    // no previous mouseover
	} else {
	    // unhighlight previous highlighted
	    $ms.removeClass(this.highlightedOption.div, "ms-editable-combo-mouseover")
	    
	    if (this.selectedOption && this.selectedOption.div.id !== target.id &&	    // if the current div is not the selected
		this.selectedOption.div.id == this.highlightedOption.div.id){		    // and the mouseover div WAS the selected
	    // revert back to selected
	    $ms.addClass(this.highlightedOption.div, "ms-editable-combo-selected")
	    }
	}
	// if selected - temporarily remove
	$ms.removeClass(target, "ms-editable-combo-selected")
	$ms.addClass(target, "ms-editable-combo-mouseover")
	for (var i = 0; i < this.options.length; i++){
	    if (this.options[i].div.id == target.id){
		this.highlightedOption = this.options[i];
		break;
	    }
	}
    }

    EditableCombo.prototype.createEditableCombo = function(options){
	instance.push(this);
	
	// div to hold input
	this.container = document.createElement('DIV');
	this.container.style.styleFloat = 'left';
	if (this.settings.containerId){
	    this.container.id = this.settings.containerId;
	} else {
	    this.containerId = this.id + "-container";
	}
	this.container.className = 'ms-editable-combo-input-container';
	this.container.style.zIndex = 10000 + this.id;
	this.container.style.position = "relative";	    // relative prevents combo from overflowing a parent div with overflow:hidden

	// the input
	this.input = document.createElement('input');
	if (this.settings.inputId) {
	    this.input.id = this.settings.inputId;
	} else {
	    this.input.id = this.id + "-input";
	}
	// convert settings to a number if not alreaedy
	this.settings.width = parseInt("" + this.settings.width);
	this.input.style.width = (this.settings.width - 18) + "px";
	this.input.className = 'ms-editable-combo-input';
	this.input.addEventListener("keyup", function(e){this.keyup(e)}.bind(this) )

	this.container.style.width = this.settings.width + 'px';
	this.container.appendChild(this.input);
	this.inputHeight = $ms.elementSize(this.input).height;

	var img = document.createElement('IMG');
	img.src = arrowImage;
	img.className = 'ms-editable-combo-arrow';
	img.onmouseover = this.switchImageUrl;
	img.onmouseout = this.switchImageUrl;
	img.onclick = function(e){this.showOptions(e), this.input.focus()}.bind(this);
	img.id = this.id + "arrow";
	this.container.appendChild(img);
	this.arrow = img;

	var optionDiv = document.createElement('DIV');
	this.optionDiv = optionDiv;
	optionDiv.id = this.id + "comboOptions";
	optionDiv.className = 'ms-editable-combo-option-container';
	optionDiv.style.width = this.settings.width + 2 + 'px';
	optionDiv.addEventListener("keyup", function(e){this.keyup(e)}.bind(this) )
	
	this.container.appendChild(optionDiv);

	/*
	if (navigator.userAgent.indexOf('MSIE') >= 0){
	    var iframe = document.createElement('<IFRAME src="about:blank" frameborder=0>');
	    iframe.style.width = optionDiv.style.width;
	    iframe.style.height = optionDiv.offsetHeight + 'px';
	    iframe.style.display = 'none';
	    iframe.id = this.id + "ms-editable-combo-iframe";
	    this.container.appendChild(iframe);
	    this.iframe = iframe;
	}
	*/
	this.input.addEventListener("dblclick",  function(e){this.showOptions(e, true)});
	this.input.onclick = function(e){e.stopPropagation()};
	
	if (options && options.length > 0){
	    this.createOptions(options);
	    optionDiv.style.display = 'none';
	    optionDiv.style.visibility = 'visible';
	}
	
	// v(input.value);
    }
    EditableCombo.prototype.createOptions = function(options, reset){
	if (reset){
	    this.options.length = 0;
	    while (this.optionDiv.hasChildNodes()) {  
		this.optionDiv.removeChild(this.optionDiv.firstChild);
	    }
	}
	for (var i = 0; i < options.length; i++){
	    this.createOption(options[i]);
	}
    }   
    
    EditableCombo.prototype.createOption = function(option){
	var _this = this;
	if (typeof option === "string"){
	    option = {label: option, value: option};
	}	    
	// option can have any combination of 3 properties:	label, name, value
	// only label and value are used
	if (typeof option.label == "undefined" && typeof option.name !== "undefined") {
	    option.label = option.name;
	}
	if (typeof option.value == "undefined") {
	    option.value = option.label;
	} else if (typeof option.label == "undefined") {
	    option.label = option.value;
	}
	
	var div = document.createElement('div');
	div.id = this.id + 'option-' + (++this.optionCounter);
	div.innerHTML = option.label;
	div.className = 'ms-editable-combo-option';
	!function (div, option){
	    div.addEventListener('click', function(e){_this.selectOption(option, {keepOpen: false, runCb: true})}.bind(this),
	    false)
	}(div, option);

	div.style.width = (this.settings.width - 2) + 'px';
	div.onmouseover = function(e){this.setMouseoverOption(e.target, "on")}.bind(this);
	
	option.div = div;
	this.options.push(option);
	this.optionDiv.appendChild(div);
	return div;
    }
    
    // when close one combo, close them all
    EditableCombo.prototype.closeOptions = function(){
	for (var i = 0; i < instance.length; i++){
	    instance[i].optionDiv.style.display = 'none';
	    instance[i].arrow.src = arrowImage;
	    /*
	    if (navigator.userAgent.indexOf('MSIE') >= 0)
		this.iframe.style.display = 'none';
	    */
	}
    }

    EditableCombo.prototype.findOption = function(value, mode){
	var match;
	if (value.length == 0){
	    return false;
	}
	for (var i = 0; i < this.options; i++){
	    if (mode == "label"){
		match = this.options[i].label.toLowerCase() == value.toLowerCase();
	    } else if (mode == "value"){
		match = this.options[i].value.toLowerCase() == value.toLowerCase();
	    }
	    if (match){
		return this.options[i];
	    }
	}
	return false;
    }
    EditableCombo.prototype.findClosestMatch = function(value, mode){
	var match;
	if (value.length == 0){
	    return false;
	}
	for (var i = 0; i < this.options.length; i++){
	    if (mode == "label"){
		match = this.options[i].label.substr(0, value.length).toLowerCase() == value.toLowerCase();
	    } else if (mode == "value"){
		match = this.options[i].value.substr(0, value.length).toLowerCase() == value.toLowerCase();
	    }
	    if (match){
		return this.options[i];
	    }
	}
	return false;
    }

    EditableCombo.prototype.addOption = function(option){
	this.createOption(option);
    }
    
    EditableCombo.prototype.deleteOption = function(value){
	for (var i = 0; i < this.options.length; i++){
	    if (this.options[i].value == value){
		this.options[i].div.parentNode.removeChild(this.options[i].div);
		this.options.splice(i, 1);
		this.clear();
		break;
	    }
	}
    }
    EditableCombo.prototype.clear = function(){
	// unhighlight all and un select
	this.unhighlightAll();
	this.selectedOption = undefined;
	this.highlightedOption = undefined;
	this.updateValue();
    }    
    
    EditableCombo.prototype.unhighlightAll = function(){
	if (!this.optionDiv) return;
	for (var i = 0; i < this.optionDiv.childNodes.length; i++){
	    $ms.removeClass(this.optionDiv.childNodes[i], "ms-editable-combo-selected")
	    $ms.removeClass(this.optionDiv.childNodes[i], "ms-editable-combo-mouseover")
	}
    }
    
    EditableCombo.prototype.keyup = function(e){
	if (e.keyCode == '16') {
	    // shift
	} else if (e.keyCode == '17') {
	    // ctrl
	} else if (e.keyCode == '18') {
	}
	switch(e.keyCode) {
	    case 13:
		// enter
		if (this.optionDiv.style.display == 'block'){
		    var value, option;
		    if (this.selectedOption){
			option = this.selectedOption;
			value = this.selectedOption.div.innerHTML;
		    } else if (this.highlightedOption){
			option = this.highlightedOption;
			value = this.highlightedOption.div.innerHTML;
		    }
		    if (typeof value !== undefined){
			// select the option - options showing and one is selected
			this.selectOption(option, {keepOpen: false, runCb: true});
		    }
		} else {
		    // highlight nearest option
		    var option = this.findClosestMatch(this.input.value, "label");
		    if (option) {
			this.showOptions(e, true);
			this.selectOption(option, {keepOpen: true, runCb: false});
		    }
		}
		break;
	    case 27:
		// escape
		e.stopPropagation();
		this.closeOptions(this);
		break;
	    case 33:
		// page up
		break;
	    case 34:
		// page down
		break;
	    case 35:
		// end
		break;
	    case 36:
		// home
		break;
	    case 37:
		// left
		break;
	    case 39:
		// right
		break;
	    case 38:    // up
	    case 40:    // down
		// open the list
		this.showOptions(e, true);
		break;
	    // allow to handle backspace and delete
	    //case 8:    // backspace
	    //case 46:    // delete
		//break;
	    default:
		// auto complete key entry - doesn't select
		this.clear();
		var option = this.findClosestMatch(this.input.value, "label");
		if (option){
		    this.showOptions(e, true);
		    this.setMouseoverOption(option.div);
		    if (this.settings.cbChange){
			this.settings.cbChange(this, false);	// false = "highlight" not selected
		    }
		} else {
		    this.closeOptions();
		}
	}
    }
    EditableCombo.prototype.addEventListener = function(event, fn){
	this.input.addEventListener(event, fn);	
    }
    EditableCombo.prototype.getValue = function(){
	var option = this.findOption(this.input.value, "value");
	if (option === false){
	    return this.input.value
	}
	return option.value;	
    }
    
    EditableCombo.prototype.setAttribute = function(attribute, value){
	// for custom data- attributes
	this[attribute] = value;
	// not needed - since data, not visual
	// this.input.setAttribute(attribute, value);
    }
    
    EditableCombo.prototype.getAttribute = function(attribute){
	return this[attribute];
    }
    
    EditableCombo.prototype.setAttributes = function(){
	// process attribute not set with setAtribute
	//	className, style.display, title, value
	$ms.addClass(this.container, this.className);
	this.container.style.display = this.style.display;
	this.container.title = this.title;
	
	this.input.value = this.value;
	if (this.value.length > 0){
	    // find selected if exists
	    this.clear();
	    var option = this.findOption(this.value, "value");
	    if (option !== false) {
		// select the option if exists
		this.selectOption(option, {keepOpen: false, runCb: false});
	    }
	}
    }
    
    EditableCombo.prototype.setValue = function(value){
    	this.clear();
	this.input.value = value;
	this.updateValue();
    }

    EditableCombo.prototype.updateValue = function(){
	if (!this.selectedOption){
	    this.value = this.input.value;
	    // highlight the div if value matches an option
	    for (var i = 0; i < this.options.length; i++){
		if (this.value == this.options[i].value){
		    this.selectOption(this.options[i], {keepOpen: false, runCb: false});
		    break;
		}
	    }
	} else {
	    // find existing position
	    var current;
	    for (var i = 0; i < this.optionDiv.childNodes.length; i++){
		if (this.optionDiv.childNodes[i].id == this.selectedOption.div.id){
		    current = i;
		    break;
		}
	    }
	    if (typeof current !== "undefined"){
		this.value = this.options[i].value;
	    }
	}
    }
    
    EditableCombo.prototype.resize = function(){
	this.settings.width = parseInt(this.container.style.width);
	this.optionDiv.style.width = this.settings.width + "px";
	this.input.style.width = (this.settings.width - 18) + 'px';
	for (var i = 0; i < this.options.length; i++){
	    this.options[i].div.style.width = (this.settings.width + 2) + "px";
	}
    }
    EditableCombo.prototype.close = function(){
	if (this.observer){
	    this.observer.disconnect();
	}
	if (this.settings.listenWindowClick){
	    window.removeEventListener("click", this.closeOptionsFn);
	}
	
    }
    
    return EditableCombo;  
           
})();	
