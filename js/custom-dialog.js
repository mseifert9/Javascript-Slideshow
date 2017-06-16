/* Copyright © 2017 Michael Seifert (www.mseifert.com) All Rights Reserved */
$msRoot.createNS("CustomDialog");
$msRoot.CustomDialog = (function (settings) {
    var instance = [];
    var instanceCounter = 0;
    var defaultSettings = {
	fontSize: 80,		// percent
	dialogTitle: "",
	text: "Confirm?",	// for multiple lines - an array is passed in - one line per element
	buttons: [{label: "Ok", title: "Okays the request", cb: undefined}, {label: "Cancel", title: "Cancels the request", cb: undefined}],
	buttonClass: "ms-gradient-button",
	position: "absolute",
	zIndex: 2000,
	backgroundColor: "rgb(230,230,230)",
	borderColor: "4px ridge rgb(200,200,200)",
	top: undefined,
	left: undefined,
	width: undefined,
	height: undefined,
	minWidth: 100,
	minHeight: 100,
	maxWidth: 500,
	maxHeight: 500,
	textAlign: "left",
	cbClose: undefined,
	buttonsOnTop: false,
	input: undefined,
	id: ""	    // id of calling object so can auto close when it closes
    };
    var openDialogs = [];	// track open dialogs and the program associated with so can auto close on program close
    CustomDialog.getInstance = function(instanceId){
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
    CustomDialog.closeDialogs = function(id){
	// close all dialogs registered with the passed id
	for (var i = 0; i < instance.length; i++){
	    if (instance[i].settings.id == id){
		instance[i].close();
	    }
	}	
    }
    
    function CustomDialog(settings){
	instance.push(this);
	this.id = "ms-dialog-" + instanceCounter++ + "-";;
	
	this.settings = $ms.cloneSettings(defaultSettings, settings);
	this.container = document.createElement("div");
	$ms.addClass(this.container, "visibility-hidden");
	document.body.appendChild(this.container);
	
	this.container.style.position = this.settings.position;
	this.container.id = this.id + "dialog-" + instance.length;
	this.container.style.zIndex = this.settings.zIndex;
	this.container.style.backgroundColor = this.settings.backgroundColor;
	this.container.style.textAlign = "center";
	this.container.style.border = this.settings.borderColor;
	this.container.style.fontSize = $ms.targetFontSize(this.settings.fontSize);
	
	var divTitle = document.createElement("div");
	divTitle.id = this.id + "title-bar";
	divTitle.style.minHeight = "20px";
	divTitle.className = "ms-title-bar";
	divTitle.innerHTML = this.settings.dialogTitle;
	var closeButton = $ms.createCloseButton(this.id, function(){
		this.close();
		if (this.settings.cbClose){
		    this.settings.cbClose();
		}
	}.bind(this));
	divTitle.appendChild(closeButton);
	this.container.appendChild(divTitle)
	
	$ms.draggable(this.container, 
	    {scope: "default", 
	    handle: this.id + "title-bar",
	    });	
	
	var divInner = document.createElement("div");
	divInner.style.width = "100%";
	divInner.style.height = "calc(100% - 20px)";
	// divInner.style.overflow = "auto";
	divInner.style.position = "relative";
	this.container.appendChild(divInner);

	var divContent = document.createElement("div");
	divContent.style.overflow = "auto";
	divContent.style.textAlign = this.settings.textAlign;
	divContent.style.height = "100%";
	divContent.style.margin = "0 10px";
	divInner.appendChild(divContent);	

	// for multiple lines - an array is passed in - one line per element
	if (!Array.isArray(this.settings.text)){
	    this.settings.text = [this.settings.text];
	}
	for (var i = 0; i < this.settings.text.length; i++){
	    var div = document.createElement("div");
	    div.innerHTML = this.settings.text[i];
	    divContent.appendChild(div);
	}
	
	if (this.settings.input){
	    var divInput = document.createElement("div");
	    divInput.style.margin = "5px 0";
	    var label = document.createElement("label");
	    label.innerText = this.settings.input.label;
	    label.style.display = "inline-block"
	    divInput.appendChild(label);
	    var input = document.createElement("input");
	    if (typeof this.settings.input.value !== "undefined"){
		input.value = this.settings.input.value;
	    }
	    if (typeof this.settings.input.width !== "undefined"){
		input.style.width = parseInt("" + this.settings.input.width) + "px";
	    }
	    input.style.display = "inline-block"
	    if (this.settings.input.onchange){
		input.onchange = this.settings.input.onchange;
	    }	    
	    if (this.settings.input.onkeydown){
		input.onkeydown = this.settings.input.onkeydown;
	    }	    
	    if (this.settings.input.onkeyup){
		input.onkeyup = this.settings.input.onkeyup;
	    }	    
	    divInput.appendChild(input);
	    divContent.appendChild(divInput);
	    
	    // save a reference to the input for the calling fn
	    this.settings.input.element = input;
	}
	
	var divButtons = document.createElement("div");	
	divButtons.style.margin = "10px 0";
	for (var i = 0; i < this.settings.buttons.length; i++){
	    var button = document.createElement("div");
	    button.innerHTML = this.settings.buttons[i].label;
	    button.className = this.settings.buttonClass;
	    button.style.display = "inline-block";
	    var marginLeft = i ==0 ? "0" : "5px";
	    button.style.margin = "5px 0 0 " + marginLeft;
	    button.title = this.settings.buttons[i].title;
	    // in order for a cb close this dialog - it had to have opened it
	    // creating var bind by binding close() to `this` allows it
	    // because of multiple buttons, cb needs to be passed into the function or else it has the value of the last button
	    var close = this.close.bind(this);
	    var cb = this.settings.buttons[i].cb;
	    var dialog = this;
	    button.addEventListener("click", 
		function(cb){
		    return function(){
			close();
			if (cb){
			    cb(dialog);
			}
		    };
		}(cb));	    
	    divButtons.appendChild(button);
	}
	this.keypressListenerFn = this.keypressListener.bind(this);
	document.body.addEventListener("keypress", this.keypressListenerFn, false);
	if (this.settings.buttonsOnTop){
	    divInner.insertBefore(divButtons, divContent);
	} else {
	    divInner.appendChild(divButtons);
	}
	
	// calculate size
	var size = $ms.elementSize(this.container);
	if (!this.settings.width){
	    this.settings.width = Math.min(this.settings.maxWidth, Math.max(this.settings.minWidth, size.width + 8)); 
	}
	this.container.style.width = parseInt("" + this.settings.width) + "px";
	
	var size = $ms.elementSize(this.container);
	if (!this.settings.height){
	    this.settings.height = Math.min(this.settings.maxHeight, Math.max(this.settings.minHeight, size.height + 8)); 
	}
	this.container.style.height = parseInt("" + this.settings.height) + "px";
	
	if (typeof this.settings.top == "undefined"){
	    this.settings.top = Math.max(0, (window.innerHeight - this.settings.height)) / 2 + "px";
	}
	if (typeof this.settings.left == "undefined"){
	    this.settings.left = Math.max(0, (window.innerWidth - this.settings.width)) / 2 + "px";
	}
	this.container.style.top = parseInt("" + this.settings.top) + "px";
	this.container.style.left = parseInt("" + this.settings.left) + "px";

	// after the dimensions of the dialog are set - readjust the content height to what is left after the buttons
	var buttonHeight = $ms.elementSize(divButtons).height + 20 - 1;
	divContent.style.height = "calc(100% - " + buttonHeight + "px)";

	$ms.removeClass(this.container, "visibility-hidden");
	if (this.settings.input && input){
	    input.focus();	    
	}
    }
    
    CustomDialog.prototype.keypressListener = function(e){
	if (e.stopPropagation) e.stopPropagation();
	switch(e.keyCode) {
	    case 13:
		// enter
		for (var i = 0; i < this.settings.buttons.length; i++){
		    if (this.settings.buttons[i].enterKey){
			this.close().bind(this);
			if (this.settings.buttons[i].cb){
			    this.settings.buttons[i].cb(dialog);
			}
			break;
		    }
		}
		break;
	    case 27:
		// escape with magnifier open, closes only magnifier
		for (var i = 0; i < this.settings.buttons.length; i++){
		    if (this.settings.buttons[i].cancelKey || this.settings.buttons[i].escapeKey){
			this.close().bind(this);
			if (this.settings.buttons[i].cb){
			    this.settings.buttons[i].cb(dialog);
			}
			break;
		    }
		}
		break;
	}
    }
    
    
    CustomDialog.prototype.close = function(){
	if (this.container.parentNode){
	    this.container.parentNode.removeChild(this.container);
	}
	for (var i=0; i < instance.length; i++){
	    if (instance[i].id == this.id){
		instance.splice(i, 1);
		break;
	    }
	}
	document.removeEventListener("keypress", this.keypressListenerFn)
    }
	
    return CustomDialog;
})();
	