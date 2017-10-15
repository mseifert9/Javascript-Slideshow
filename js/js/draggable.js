/* Copyright © 2017 Michael Seifert (mseifert.com) All Rights Reserved */
$ms.draggable = function(element, settings){
    return function(element, settings){ return new $msRoot.Draggable(element, settings)}(element, settings);
}

$msRoot.createNS("Draggable");
$msRoot.Draggable = (function (element, settings) {
    var instance = [];
    var instanceCounter = 0;
    var defaultSettings = {
	appendTo: "",	    // selector, element, string, msElement
	axis: "",	    // string: x or y	=> NOT USED
	classes: {},	    // object {classCategory: classNameString}
	containment: false, // selector, element, string, array [x1, y1, x2, y2]
	cursor: "auto",	    // cursor string
	disabled: false,    // T/F
	grid: false,	    // [x,y]
	handle: false,	    // selector
	scope: "default",   // string: group
	zIndex: false,	    // for helper
	revert: "",	    // valid options: "invalid" "valid"
	helper: "",	    // string => clone	    (does not support function returning a helper)
	cbDragstart: undefined,
	cbDragstop: undefined,
	cbDrop: undefined,
    };

    Draggable.getInstance = function(instanceId){
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
   
    function Draggable(element, settings) {
	instance.push(this);
	this.id = "draggable-" + instanceCounter++ + "-";
	this.settings = $ms.cloneSettings(defaultSettings, settings);
	this.element = element;
	
	if (!$ms.dragDropInstance){
	    $ms.dragDropInstance = new $msRoot.DragDrop();
	    // register the window object for dragStart
	    $ms.dragDropInstance.registerDragStart();
	    $ms.dragDropInstance.registerDragEnd();
	}
	if (!this.element.id){
	    this.element.id = this.id + "element";
	}
	if (this.settings.handle) {
	    if (typeof this.settings.handle == "string"){
		var handle;
		if ((handle = $ms.$(this.settings.handle))){
		    this.settings.handle = handle;
		} else {		    
		    console.log("Draggable Error - Couldn't find element: " + this.settings.handle);
		}
	    }
	}
	var draggableElement = element;
	if (this.settings.handle) {
	    if (!this.settings.handle.id){
		this.settings.handle.id = this.id + "handle";
	    }
	    this.settings.handle.draggable = "true";
	    draggableElement = this.settings.handle;
	} else {
	    this.element.draggable = "true";
	}
	this.settings.element = element;
	// NOTE: element can be the handle (or a clone) and different from settings.element
	$ms.dragDropInstance.registerDraggable({element: draggableElement, settings: this.settings, item: this});
	
	// ie9
	if ($ms.ie9OrBelow()){
	    if (this.settings.handle && getComputedStyle(this.settings.handle).getPropertyValue("filter")){
		// filter prevents click and drag events unless have a child element to receive the event
		var div = document.createElement("div");
		div.style.height = "100%";
		div.style.width = "100%";
		this.settings.handle.appendChild(div);
		this.settings.handle.setAttribute("draggable", "true");
	    }
	    draggableElement.addEventListener('selectstart', function(e) {
		this.dragDrop();
		return false;
	    }, false);	
	}
    }
    
    Draggable.prototype.cbDragStart = function(){
	if (this.settings.cbDragStart){
	    this.settings.cbDragStart();
	}
    }
    Draggable.prototype.cbDragStop = function(){
	if (this.settings.cbDragStop){
	    this.settings.cbDragStop();
	}
    }
    Draggable.prototype.cbDrop = function(){
	if (this.settings.cbDrop){
	    this.settings.cbDrop();
	}
    }
    
    Draggable.prototype.createForm = function(){
    }
    
 
    return Draggable;
})();
