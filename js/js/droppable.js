/* Copyright © 2017 Michael Seifert (mseifert.com) All Rights Reserved */
$ms.droppable = function(element, settings){
    return function(element, settings){ return new $msRoot.Droppable(element, settings)}(element, settings);
}

$msRoot.createNS("Droppable");
$msRoot.Droppable = (function (element, settings) {
    var instance = [];
    var instanceCounter = 0;
    var defaultSettings = {
	accept: "*",	    // selector, element, msElement - which elements can accept
	append: "",	    // elements dropped will be appended
	noPosition: false,  // on append - noPosition=true will clear top / left - useful for appending LI to UL or where position is based on order
	insert: "",	    // node type - inserts above or below with elements of the specified node type 
	// cancel: "input, textarea, button, select, option",	// selector
	classes: {active: "ms-highlight"},	    // object {classCategory: classNameString} e.g. {droppableHover: "highlight"}
	disabled: false,	    // T/F
	scope: "default",	    // string: group
	cbDragEnter: undefined,
	cbDragOver: undefined,
	cbDragLeave: undefined,
	cbDrop: undefined,
    };

    Droppable.getInstance = function(instanceId){
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
   
    function Droppable(element, settings) {
	instance.push(this);
	this.id = "droppable-" + instanceCounter++ + "-";
	this.settings = $ms.cloneSettings(defaultSettings, settings);
	this.element = element;
	this.droppable = element;
	
	if (!$ms.dragDropInstance){
	    $ms.dragDropInstance = new $msRoot.DragDrop();
	    // register the window object for dragStart and DragEnd
	    $ms.dragDropInstance.registerDragStart();
	    $ms.dragDropInstance.registerDragEnd();
	}
	if (!this.element.id){
	    this.element.id = this.id + "element";
	}
	this.settings.element = element;
	$ms.dragDropInstance.registerDroppable({element: this.element, settings: this.settings, item: this});
	
    }
    
    Droppable.prototype.init = function(){
    }
    
    Droppable.prototype.createForm = function(){
    }
    
 
    return Droppable;
})();
