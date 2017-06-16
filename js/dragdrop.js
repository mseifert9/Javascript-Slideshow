/* Copyright © 2017 Michael Seifert (www.mseifert.com) All Rights Reserved */
$msRoot.createNS("DragDrop");
$msRoot.DragDrop = (function(){
    
    var dependants = [
	{file: "draggable.min.js", ns: "Draggable"},
	{file: "droppable.min.js", ns: "Droppable"},
    ]
    $ms.sourceFiles.add(dependants);
    $ms.sourceFiles.load();
    
    // instances share the dragStart listener (and any other global listeners added )
    var instanceCounter = 0;
    var instance = [];
    var cloneLastDragOver = {element: undefined, target: "", className: "", dropEffect: "", effectAllowed: ""};
	
    function DragDrop(){
	this.id = "DragDrop-" + instanceCounter++;
	instance.push({id: this.id, instance: this});
	this.dragStartListeners = [];	
	this.dragEnterListeners = [];	
	this.dragOverListeners = [];	
	this.dragLeaveListeners = [];	
	this.dropListeners = [];
	this.dragEndListeners = [];
	//this.dropListenersCopy;	// since dragEnd can get called before drop, have access to a copy
	this.grid = {x:1, y:1};
	this.currentDraggable;		// the draggable object of the item being dragged
	this.dragElementId = "";	//  getData() may not return the elementId
	this.noListener = false;	// in default mode, there can be no droppable listener
	
	// list of registered draggable items
	this.draggable = [];
	this.droppable = [];
	
	this.startOffset = {x: 0, y: 0};    // if set to calling class' object will auto update class
	this.lastDragOver = Object.assign({}, cloneLastDragOver);
	 
	// allows classes to be unique for DragOver, etc by prefixing
	if (instance.length > 0){
	    for (var i = 0; i < instance.length; i++){
		if (instance[i].id == this.id){
		    // colorPicker already open
		    // return its instance
		    return instance[i].instance;
		}
	    }
	}
    };
    
    DragDrop.prototype.registerDraggable = function(item){
	// register draggable elements
	this.draggable.push(item);	
    }

    DragDrop.prototype.registerDroppable = function(item){
	// register draggable elements
	this.droppable.push(item);
    }
    
    // the dragStart listener is document wide
    DragDrop.prototype.registerDragStart = function(element){
	// target is the element for dragStart to fire on
	// default is the document
	if (typeof element == "undefined"){
	    element = document;
	}
	if (this.listenerSet(this.dragStartListeners, element)){
	    // listener already set
	    return;
	}
	
	var dragStart = function (e) {	    
	    // only the document object is listening for dragStart
	    var draggable = this.getElementItem(e.target, this.draggable, true);
	    if (!draggable) {
		e.preventDefault();
		e.stopPropagation();    // stops the browser from redirecting And from bubbline to BODY
		return;
	    }
	    // save the item being dragged so don't have to look up again
	    this.currentDraggable = draggable;
	    // required to set the id even if not using getData()
	    e.dataTransfer.setData('Text', draggable.element.id);
	    // reset
	    this.lastDragOver = Object.assign({}, cloneLastDragOver);
	    
	    // if no droppables defined and scope is default - allow to cruise through and be dropped
	    this.noListener = draggable.settings.scope == "default";
	    // save beginning position and parentNode - with a drop callback, calling fn can determine how far moved and if parent changed
	    // could also save sibling order...
	    var offset = $ms.getOffset(draggable.settings.element);
	    var parentNode = draggable.settings.element.parentNode ? draggable.settings.element.parentNode.id : undefined;
	    draggable.settings.startInfo = {x: offset.x, y: offset.y, 
		    left: draggable.settings.element.style.left, 
		    top: draggable.settings.element.style.top, 
		    parentNodeId: parentNode};
	    
	    if (draggable.settings.cbDragStart == "function"){
		// allow object to pass custom function to test for allowing dragStart
		if (! draggable.settings.cbDragStart(e.target, draggable)){
		    // allow draggable to abort drag drop operation
		    return;
		}
	    }
	    // get clicked position XY offset relative to the draggable top left
	    this.startOffset.x = parseInt(e.offsetX);
	    this.startOffset.y = parseInt(e.offsetY);
	    
	    // set all the listeners registered for this draggable
	    this.registerListeners(e, draggable);
	    
	    // get compatibility
	    var setDragImageOk = this.testSetDragImage();
	    
	    if (setDragImageOk){
		if (draggable.settings.handle){
		    // with handle - show the element to be moved
		    e.dataTransfer.setDragImage(draggable.settings.element, e.offsetX, e.offsetY);
		} else {
		    e.dataTransfer.setDragImage(draggable.element, e.offsetX, e.offsetY);
		}
	    }
	    e.dataTransfer.effectAllowed = 'move';
	}.bind(this)
	if (element.nodeName.toLowerCase() == "#document" || element.nodeName.toLowerCase() == "body"){
	    element.addEventListener('dragstart', dragStart, false);
	}
    }

    // register items which are allowed to receive drop
    DragDrop.prototype.registerDragEnter = function(element, cb, settings){
	if (this.listenerSet(this.dragEnterListeners, element)){
	    // listener already set
	    return;
	}
	var dragOverFn = function(e){this.dragOverFn(e)}.bind(this);
	if (element.nodeName.toLowerCase() == "#document" || element.nodeName.toLowerCase() == "body"){
	    element.addEventListener('dragenter', dragOverFn, false);
	}
	this.dragEnterListeners.push({element: element, cb: cb, listener: dragOverFn, settings: settings});
    }

    // register items which are allowed to receive drop
    DragDrop.prototype.registerDragOver = function(element, cb, settings){
	if (this.listenerSet(this.dragOverListeners, element)){
	    // listener already set
	    return;
	}
	var dragOverFn = function(e){this.dragOverFn(e)}.bind(this);
	
	if (element.nodeName.toLowerCase() == "#document" || element.nodeName.toLowerCase() == "body"){
	    element.addEventListener('dragover', dragOverFn, false);
	}
	this.dragOverListeners.push({element: element, cb: cb, listener: dragOverFn, settings: settings});
    }    
    
    DragDrop.prototype.dragOverFn = function(e){
	// prevent default to allow drop
	e.preventDefault();
	e.stopPropagation();    // stops the browser from redirecting And from bubbline to BODY
	
	var element = this.currentDraggable.element;	// either the element or the handle, if defined
	var allow = true;
	var under;
	// if moving a clone - update its position regardless of effects
	if (this.clone){
	    var pos = this.calcClonePosition(e);
	    this.clone.style.left = pos.x + "px";
	    this.clone.style.top = pos.y  + "px";
	}	
	var target = e.target;
	// listener is a droppable
	var listener = this.getListener(target, this.dropListeners);
	if (this.noListener) return;
	if (!listener || listener.element.id == element.id){
	    // go down the chain from the current target of listeners
	    while (under = this.getUnderTarget(e, target, this.dropListeners)){
		target = under.element;
		listener = under.listener;
		if (target.id !== element.id){
		    break;
		}
	    }
	    if (!under){
		if (e.target.nodeName.toLowerCase() !== "body"){
		    // $ms.v("dragover - could not find target: for element: ", element.id, " last target: ",  target.id);
		}
		allow = false;
	    }
	}
	if (e.target === this.lastDragOver.element) {
	    // quick evaluation if target has not changed
	    e.dataTransfer.dropEffect = this.lastDragOver.dropEffect;
	    e.dataTransfer.effectAllowed = this.lastDragOver.effectAllowed;
	    return;
	}
	// dragover target is different  remove previous highlight class
	if (this.lastDragOver.className){
	    $ms.removeClass(this.lastDragOver.target, this.lastDragOver.className);
	}	
	var className = "";
	if (allow){
	    // add class to style DragOver
	    e.dataTransfer.dropEffect = 'move';
	    e.dataTransfer.effectAllowed = 'all';		
	    if (!listener) {
		if (target.nodeName.toLowerCase() !== "body"){
		    console.log("dragOverFn - Couldn't find listener for " + target.id);
		}
	    } else if (element.id == target.id){
		// dragging over self - should not be here since looking above for what is under
		console.log("over self");
	    } else if ((listener.settings.classes.active && typeof e.target.classList) == "object"){
		className = listener.settings.classes.active;
		$ms.addClass(target, className);
	    }	    
	    if (typeof listener.settings.cbDragOver == "function"){
		// allow object to pass custom function
		listener.settings.cbDragOver(element, this.currentDraggable, listener);
	    }	
	} else {
	    e.dataTransfer.dropEffect = 'none';
	    e.dataTransfer.effectAllowed = 'none';
	}
	// save last element that triggered dragover (e.target - not target) 
	this.lastDragOver.element = e.target;
	this.lastDragOver.target = target;
	this.lastDragOver.dropEffect = e.dataTransfer.dropEffect;
	this.lastDragOver.effectAllowed = e.dataTransfer.effectAllowed;
	this.lastDragOver.className = className;
    }

    // register items which are allowed to receive dragLeave
    DragDrop.prototype.registerDragLeave = function(element, cb, settings){
	if (this.listenerSet(this.dragLeaveListeners, element)){
	    // listener already set
	    return;
	}
	var dragLeave = function(e) {
	    var listener = this.getListener(e.target, this.dragLeaveListeners);
	    if (listener && typeof listener.settings.cbDragLeave == "function"){
		listener.settings.cbDragLeave(e.target, listener.settings);
	    }
	    if (this.lastDragOver.className){
		// no need to remove classes of previous highlighted element - will be done automatically with next dragover
		//$ms.removeClass(this.lastDragOver.element, this.lastDragOver.className);
	    }
	}.bind(this);
	if (element.nodeName.toLowerCase() == "#document" || element.nodeName.toLowerCase() == "body"){
	    element.addEventListener('dragleave', dragLeave, false);
	}
	this.dragLeaveListeners.push({element: element, cb: cb, listener: dragLeave, settings: settings});
    }
    
    // register items which are allowed to receive drop
    DragDrop.prototype.registerDrop = function(element, cb, settings){
	// settings are droppable settings
	if (this.listenerSet(this.dropListeners, element)){
	    // listener already set
	    return;
	}
	var dropFn = function(e){this.dropFn(e)}.bind(this);
	
	if (element.nodeName.toLowerCase() == "#document" || element.nodeName.toLowerCase() == "body"){
	    element.addEventListener('drop', dropFn, false);
	}
    	this.dropListeners.push({element: element, cb: cb, listener: dropFn, settings: settings});
	//this.dropListenersCopy = this.dropListeners.slice();
    }

    DragDrop.prototype.dropFn = function (e){
	e.stopPropagation();    // stops the browser from redirecting
	e.preventDefault();
	// the dropped element
	var element = this.currentDraggable.element;
	var draggable = this.currentDraggable;

	var allow = true;
	var under;
	var target = e.target;
	if (this.lastDragOver.className){
	    $ms.removeClass(this.lastDragOver.element, this.lastDragOver.className);
	}

	// find the real targets => 
	//	    A) the top target listener which caught the event
	//	    B) the droppable which allows the drop
	var listener = this.getListener(target, this.dropListeners);
	if (!this.noListener && (!listener || listener.element.id == element.id)){
	    // go down the chain from the current target of listeners
	    while (under = this.getUnderTarget(e, target, this.dropListeners)){
		target = under.element;
		if (target.id !== element.id){
		    break;
		}
	    }
	    if (!under){
		// $ms.v("drop - could not find target: for element: ", element.id, " last target: ",  target.id);
		allow = false;
	    }
	}
	var droppable;
	if (this.noListener){
	    droppable = {settings: {}}
	} else if (allow){
	    droppable = this.getElementItem(target, this.droppable, false);
	    if (!droppable){
		// go down the chain from the current target of listeners
		// until the droppable is found
		while (under = this.getUnderTarget(e, target, this.dropListeners)){		    
		    target = under.element;
		    if (droppable = this.getElementItem(target, this.droppable, false)){
			break
		    }
		}
		if (!droppable){
		    console.log("drop - could not find droppable");
		    allow = false;
		}
	    }   
	}
	// realElement is the element to move - the draggable.element may be a handle
	var noPosition = droppable.settings.noPosition;
	var realElement = draggable.settings.element;
	if (this.noListener){
	    // allows move not append
	} else if (allow && draggable.settings.revert !== true){
	    // do append if requested
	    // check the append option
	    // target and droppable.element are the same
	    if (droppable.settings.append.length > 0 && realElement.matches(droppable.settings.append)) {
		target.appendChild(realElement);		
		
		if (target.style.display == "flex"){
		    var maxOrder = -1;
		    for (var i = 0; i < target.childNodes.length; i++){
			if (typeof target.childNodes[i].style == "undefined") continue;
			    if (target.childNodes[i].isSameNode(realElement)) continue;
			var order = parseInt(target.childNodes[i].style.order);
			if (!isNaN(order)){
			    maxOrder = Math.max(order, maxOrder);
			}
		    }
		    order = parseInt(realElement.style.order);
		    if (maxOrder > -1){
			// append to the end of ordered flex elements
			realElement.style.order = maxOrder + 1;
			realElement.style.top = "";
			realElement.style.left = "";
			noPosition = true;
		    } else if (!isNaN(order)){
			realElement.style.order = 0;
			realElement.style.top = "";
			realElement.style.left = "";
			noPosition = true;
		    }
		}
	    } else if (droppable.settings.insert.length > 0 && realElement.matches(droppable.settings.insert)) {
		// with insert - for LI elements, Flex elements
		target.parentNode.insertBefore(realElement, target);
		// insert implies that is positionless (top and left are not set)
		realElement.style.top = "";
		realElement.style.left = "";
		noPosition = true;
		
		if (target.parentNode.style.display == "flex" && target.style.order.length > 0){
		    var targetOrder = parseInt(target.style.order);
		    if (!isNaN(targetOrder)){
			for (var i = 0; i < target.parentNode.childNodes.length; i++){
			    if (typeof target.parentNode.childNodes[i].style == "undefined") continue;
			    var order = parseInt(target.parentNode.childNodes[i].style.order);
			    if (!isNaN(order) && order >= targetOrder){
				target.parentNode.childNodes[i].style.order = order + 1;
			    }
			}
			realElement.style.order = targetOrder;
		    }
		}
	    }
	}
	var position = getComputedStyle(realElement).getPropertyValue("position");
	var offset = $ms.getOffset(realElement.offsetParent);
	var offsetY = this.startOffset.y + offset.y;
	var offsetX = this.startOffset.x + offset.x;
	if (allow && draggable.settings.revert !== true){
	    if (!noPosition){
		if (this.containment){
		    if (position == 'absolute' || position == 'relative'){
			var rect = $ms.getOffset(this.containment);
			// clone relative to containment
			var cTop = rect.top;
			var cLeft = rect.left;
			// element relative to its parent
			var offset = $ms.getOffset(realElement.offsetParent);
			// use existing clone position
			var absTop = cTop + parseFloat(this.clone.style.top)
			var newTop = absTop - offset.y;
			var absLeft = cLeft + parseFloat(this.clone.style.left)
			var newLeft = absLeft - offset.x;
			// set the position here - not below
			realElement.style.top = (Math.round(newTop / this.grid.y) * this.grid.y) + 'px';
			realElement.style.left = (Math.round(newLeft / this.grid.x) * this.grid.x) + 'px';
		    }
		// get the final position
		} else if (position == 'absolute'){
		    realElement.style.top = (Math.round((e.pageY - offsetY) / this.grid.y) * this.grid.y) + 'px';
		    realElement.style.left = (Math.round((e.pageX - offsetX) / this.grid.x) * this.grid.x) + 'px';
		} else if (position == 'relative'){
		    realElement.style.top = (Math.round((e.pageY - offsetY) / this.grid.y) * this.grid.y) + 'px';
		    realElement.style.left = (Math.round((e.pageX - offsetX) / this.grid.x) * this.grid.x) + 'px';
		}
	    }	    
	    // before callback - remove clone
	    this.removeClone();
	    this.removeContainment();
	    realElement.style.visibility = "";		    

	    // fire listeners for both draggable and droppable - send both sets of settings
	    if (typeof droppable.settings.cbDrop == "function"){
		droppable.settings.cbDrop(realElement, droppable.settings.element, draggable.settings, droppable.settings);
	    }
	    if (typeof draggable.settings.cbDrop == "function"){
		draggable.settings.cbDrop(realElement, droppable.settings.element, draggable.settings, droppable.settings);
	    }
	} else if (draggable.settings.revert == "invalid" || draggable.settings.revert === true){
	    if (position == "absolute" || position == "relative"){
		var startPos = {x: (Math.round((e.pageX - offsetX) / this.grid.x) * this.grid.x), y: (Math.round((e.pageY - offsetY) / this.grid.y) * this.grid.y)};
		var rect = $ms.getOffset(realElement);
		var endPos = {x: rect.left, y: rect.top};
		this.revert(realElement, startPos, endPos);
	    }
	}
	return false;
    }
    
    DragDrop.prototype.testSetDragImage = function () {
	var testVar = window.DataTransfer || window.Clipboard;  // Clipboard is for Chrome
	if("setDragImage" in testVar.prototype) {
	    return true;
	} else {
	    return false;
	}
    }
    
    // the dragStart listener is document wide
    DragDrop.prototype.registerDragEnd = function(target, cb, settings){
	if (typeof target == "undefined"){
	    target = document;
	}
	var dragEndFn = function(e){this.dragEndFn(e, cb, settings)}.bind(this);
	if (target.nodeName.toLowerCase() == "#document" || target.nodeName.toLowerCase() == "body"){
	    target.addEventListener('dragend', dragEndFn, false);
	}
	this.dragEndListeners.push({element: target, cb: cb, listener: dragEndFn, settings: settings});
    }
    
    DragDrop.prototype.dragEndFn = function(e, cb, settings){
	setTimeout(function(){
	    // dragEnd can be called before drop - this will delay it until after drop processed
	    this.dragEndFn2(e, cb, settings);
	}.bind(this), 50);
    }
    DragDrop.prototype.dragEndFn2 = function(e, cb, settings){
	var listener = this.getListener(e.target, this.dragEndListeners);
	if (listener && typeof listener.settings.cbDragEnd == "function"){	    
	    listener.settings.cbDragEnd(e.target, listener.settings);
	}
	if (this.dragOverListeners.length ==0) return;
	// remove listeners
	this.removeListeners("dragenter", this.dragEnterListeners);
	this.removeListeners("dragover", this.dragOverListeners);
	this.removeListeners("dragleave", this.dragLeaveListeners);
	this.removeListeners("drop", this.dropListeners);
	this.removeListeners("dragend", this.dragEndListeners);
	// clone
	var draggable = this.getElementItem(e.target, this.draggable, true);
	this.removeClone();
	this.removeContainment();
	if (this.lastDragOver.className){
	    $ms.removeClass(this.lastDragOver.element, this.lastDragOver.className);
	}
	draggable.settings.element.style.visibility = "";		    
    }
    
    
    DragDrop.prototype.getUnderTarget = function(e, element, listeners){
	if (element.nodeName.toLowerCase() == "body") return false;
	try {
	    element.style.visibility = "hidden";
	} catch(e) {
	    return false;
	}
	
	var under, underTarget, listener;
	var hidden = [element];
	while (under = document.elementFromPoint(e.pageX, e.pageY)){
	    // select an element directly under
	    if (listener = this.getListener(under, listeners)){
		underTarget = under;
		break;
	    } else if (under.nodeName == "BODY"){
		break;
	    } else {
		hidden.push(under);
		under.style.visibility = "hidden";
	    }
	}
	for (var i = 0; i < hidden.length; i++){
	    hidden[i].style.visibility = "";
	}
	if (!underTarget) return false;
	return {element: underTarget, listener: listener}
    }    

    DragDrop.prototype.getListener = function(element, listeners){
	for (var i = 0; i < listeners.length; i++){
	    if (listeners[i].element.id && listeners[i].element.id == element.id){
		return listeners[i];
	    }
	}
	return false;
    }   
    
    // search draggable or droppable arrays
    DragDrop.prototype.getElementItem = function(element, list, isDraggable){
	if (isDraggable && (!element.getAttribute || !element.getAttribute("draggable"))){
	    // anchors and images drag by default - go up chain to find draggable
	    var parent = element.parentNode;
	    var isDraggable = false;
	    while (parent && parent.getAttribute){
		if (isDraggable = parent.getAttribute("draggable")){
		    element = parent;
		    break;
		}
		parent = parent.parentNode;
	    }
	    if (!isDraggable){
		return false;
	    }
	}
	for (var i = 0; i < list.length; i++){
	    if (list[i].element.id && list[i].element.id == element.id){
		return list[i];
	    }
	}
	return false;
    }   
    DragDrop.prototype.removeListeners = function(name, listeners){
	for (var i = 0; i < listeners.length; i++){
	    listeners[i].element.removeEventListener(name, listeners[i].listener, false);
	}
	listeners.length = 0;
    }   
    DragDrop.prototype.listenerSet = function(listeners, target){
	for (var i = 0; i < listeners.length; i++){
	    var listenerNodeName = false;
	    if (!listeners[i].element.id){
		if (listeners[i].element.nodeName.toLowerCase() == "body" || listeners[i].element.nodeName.toLowerCase() == "#document"){
		    listenerNodeName = listeners[i].element.nodeName.toLowerCase();
		} else {
		    continue;
		}
	    }
	    var targetNodeName = false;
	    if (!target.id){
		if (target.nodeName.toLowerCase() == "body" || target.nodeName.toLowerCase() == "#document"){
		    targetNodeName = target.nodeName.toLowerCase();
		} else {
		    continue;
		}
	    }
	    if (listenerNodeName && targetNodeName){
		if (listenerNodeName == targetNodeName){
		    // already set
		    return true;
		} else {
		    continue;
		}
	    }
	    if (target.id == listeners[i].element.id){
		// already set
		return true;
	    }
	}
	return false;
    }
    
    DragDrop.prototype.registerListeners = function(e, draggable){
	// set listeners to draggables		
	this.registerDrop(draggable.element, draggable.settings.cbDrop, draggable.settings);
	this.registerDragEnd(draggable.element, draggable.settings.cbDragEnd, draggable.settings);

	// allow dragging over self and dropping onto self - will attempt to move to an acceptable container below
	// this.registerDragOver(draggable.element, undefined, draggable.settings);

	// set listeners to droppables
	for (var j = 0; j < this.droppable.length; j++){
	    if (! (this.droppable[j].settings.accept == "*" ||
		    (draggable.settings.scope.length > 0 && draggable.settings.scope == this.droppable[j].settings.scope) ||
		    (this.droppable[j].settings.accept.length > 0 && draggable.element.matches(this.droppable[j].settings.accept)))) {
		continue;
	    }
	    this.registerDragEnter(this.droppable[j].element, this.droppable[j].settings.cbDragEnter, this.droppable[j].settings);
	    this.registerDragOver(this.droppable[j].element, this.droppable[j].settings.cbDragOver, this.droppable[j].settings);
	    this.registerDragLeave(this.droppable[j].element, this.droppable[j].settings.cbDragLeave, this.droppable[j].settings);
	    this.registerDrop(this.droppable[j].element, this.droppable[j].settings.cbDrop, this.droppable[j].settings);
	    this.registerDragEnd(this.droppable[j].element, this.droppable[j].settings.cbDragEnd, this.droppable[j].settings);
	}
	// allows for capturing over events for all elements on page
	this.registerDragEnter(document.body);
	this.registerDragOver(document.body);
	this.registerDragLeave(document.body);
	this.registerDrop(document.body);
	this.registerDragEnd(document);

	// cleanup in case
	this.removeClone();
	this.removeContainment();
	// clone
	if (draggable.settings.helper == "clone"){
	    this.createClone(e, draggable);
	}
	// constrain position
	if (draggable.settings.containment){
	    // selector, element, string, array [x1, y1, x2, y2]
	    this.containmentOffset = {x: 0, y: 0, top: 0, left: 0};
	    var boundingBox;
	    var type = typeof draggable.settings.containment;
	    var containment = draggable.settings.containment;
	    if (type == "string" && containment == "window"){
		boundingBox = [window.scrollX, window.scrollY, window.scrollX + window.innerWidth, window.scrollY + window.innerHeight];
	    } else if (type == "string" && containment == "document"){
		this.containment = document.body;
	    } else if (type == "string" && containment.substr(0, 1) == "#"){
		// id selector
		this.containment = $ms.$(containment.substr, 1);
	    } else if (type == "object" && containment instanceof HTMLElement){
		this.containment = containment;
	    } else if (type == "object" && Array.isArray(containment)){
		// bounding box from array
		boundingBox = {x1: containment[0], y1: containment[1], x2: containment[2], y2: containment[3]};
	    } else if (type == "object" && typeof containment.x1 !== "undefined"){
		// bounding box from object
		boundingBox = containment;
	    }
	    if (draggable.settings.helper !== "clone"){
		draggable.settings.helper == "clone"			
		this.createClone(e, draggable, this.containment);
	    }
	    if (boundingBox){
		this.addedContainment = true;
		this.containment = document.createElement("div");
		this.containment.style.height = containment.y2 - containment.y1;
		this.containment.style.width = containment.x2 - containment.x1;
		this.containment.style.top = containment.y1;
		this.containment.style.left = containment.x1;
		this.containment.style.position = "absolute";
		this.containment.appendChild(this.clone);

		var pos = this.calcClonePosition(e);
		this.clone.style.left = pos.x + "px";
		this.clone.style.top = pos.y  + "px";
		document.body.appendChild(this.containment);
	    } else {
		this.containment.appendChild(this.clone);
	    }
	    // calculate once up front
	    // if the containment is not absolute or relative, need to adjust for the difference
	    var containmentPosition = getComputedStyle(this.containment).getPropertyValue("position");
	    if (!(containmentPosition == "absolute" || containmentPosition == "relative")){
		var rect = $ms.getOffset(this.containment) 
		var rectOffsetParent = $ms.getOffset(this.containment.offsetParent);
		this.containmentOffset = {x: rect.x - rectOffsetParent.x, y: rect.y - rectOffsetParent.y};
	    }
	}
	return draggable;
    }    
    
    DragDrop.prototype.createClone = function(e, draggable, parentNode){
	this.clone = draggable.element.cloneNode(true);
	//this.clone.id = this.id + "temp-clone";
	this.clone.style.display = "none";
	this.clone.style.top = e.pageY  - this.startOffset.y + "px";
	this.clone.style.left = e.pageX  - this.startOffset.x  + "px";
	this.clone.style.position = "absolute";
	var rect = $ms.getOffset(draggable.element);
	this.clone.style.width = rect.width + "px";
	this.clone.style.height = rect.height + "px";
	document.body.appendChild(this.clone);
	draggable.settings.element.style.visibility = "hidden";
	this.clone.style.display = "block";
    }    

    DragDrop.prototype.removeClone = function(){
	if (this.clone){
	    if (this.clone.parentNode){
		this.clone.parentNode.removeChild(this.clone);
	    }
	    this.clone = undefined;
	}
    }
    
    DragDrop.prototype.calcClonePosition = function(e){
	// the mouse position adjusted for where clicked on the draggable
	var left = (e.pageX - this.startOffset.x);
	var top = (e.pageY  - this.startOffset.y);

	// relative to the containment
	if (this.containment){
	    var rect = $ms.getOffset(this.containment);
	    // the mouse position adjusted for being a child of the containment
	    // rect.width and rect.height are inclusive - to keep completely within bounds, adjust for width and height of clone
	    left = Math.max(this.containmentOffset.x, 
		    Math.min(rect.width - parseFloat(this.clone.style.width) + this.containmentOffset.x, left - rect.left + this.containmentOffset.x));
	    top = Math.max(this.containmentOffset.y, 
		    Math.min(rect.height - parseFloat(this.clone.style.height) + this.containmentOffset.y, top - rect.top + this.containmentOffset.y));
	}
// $ms.v(left, top, rect, this.containmentOffset);
	return {x: left, y: top}
    }    
    DragDrop.prototype.removeContainment = function(){
	if (this.containment){
	    if (this.addedContainment){
		this.addedContainment = false;
		if (this.containment.parentNode){
		    this.containment.parentNode.removeChild(this.containment);
		}
	    }
	    this.containment = undefined
	}
    }
    
    DragDrop.prototype.revert = function(element, begin, end){
	element.style.top = begin.y;
	element.style.left = begin.x;
	var diffX = end.x - begin.x;
	var diffY = end.y - begin.y;
	
	var transitionTime = 500;
	var stepX = (diffX / transitionTime) * 60;
	var stepY = (diffY / transitionTime) * 60;
	var directionX = (diffX > 0 ? 1 : -1) ;
	var directionY = (diffY > 0 ? 1 : -1) ;
	
	var stepTime = transitionTime / 60;
	var last;
	(function revertPos(now) {
	    if (!last)
		last = now;
	    var deltaT = now - last;
	    if (deltaT > stepTime) {
		var valY = parseFloat(element.style.top);
		var valX = parseFloat(element.style.left);
		if (directionY == 1){
		    var doneY = (valY += stepY) > end.y;
		} else {
		    var doneY = (valY += stepY) < end.y;
		}
		if (directionX == 1){
		    var doneX = (valX += stepX) > end.x;
		} else {
		    var doneX = (valX += stepX) < end.x;
		}
		if (doneY || doneX) {
		    element.style.top = end.y;
		    element.style.left = end.x;
		    return;
		} else {
		    element.style.top = valY;
		    element.style.left = valX;
		    requestAnimationFrame(function(){revertPos(Date.now())});
		}
		last = now;
	    }
	    requestAnimationFrame(function(){revertPos(Date.now())});
	})(Date.now());
    }
    
    return DragDrop;
    })()
