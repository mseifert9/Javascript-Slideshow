/* Copyright © 2017 Michael Seifert (www.mseifert.com) All Rights Reserved */
$msRoot.createNS("Slideshow");
$msRoot.Slideshow = (function(settings){
    var instance = [];
    var instanceCounter = 0;
    var WINDOW_SCROLLBAR_HEIGHT;	// the scrollbar on the body
    var WINDOW_SCROLLBAR_WIDTH;
    var ABSOLUTE_MIN_SLIDESHOW_WIDTH;    // need an absolute minimum of 410 pixels to display a slideshow
    var ABSOLUTE_MIN_SLIDESHOW_HEIGHT;
    var FILMSTRIP_RATIO = 1.5;
    var FILMSTRIP_DIVHEIGHT;		// thumbnails are 90px + (2px each top and bottom margin) + 1px extra to make 95px total for divthumb
					//  + 8px for filmstrip-content (unknown why) + 3px border + 14px for scroll bar  = 120px
    var IMAGE_MAXHEIGHT;		// Max (without zoom) height in pixels to display the current image
    var IMAGE_MINHEIGHT = 75;		// minimum height regardless of div size
    var TEXTHEIGHT;			// contains two lines of text
    var BUTTON_DIV_HEIGHT;		// buttons are 32px high + (1px each for top and bottom border) + 3px each for top and bottom margin
    var BUTTON_WIDTH = 44;		// width of standard buttons

    var SLIDESHOW_WIDTH;		// Max width of div containing images and filmstrip
    var SLIDESHOW_HEIGHT;
    var ssTransitionEffects = ["none", "fade", "h-move", "h-move-fade", "size", "size-fade"];


    var defaultSettings = {
	slideshowHeight: undefined,	    // needed for document.body - otherwise resizes existing container
	slideshowWidth: undefined,
	slideshowTop: undefined,	    // positioning for existing container
	slideshowLeft: undefined,
	slideshowCenter: false,		    // true = center in window
	slideshowInterval: 4000,	    // the interval when slideshow is in auto mode - default to 4 seconds = (3 second pause + 1 second move transition)
	slideshowWrap: false,		    // go back to the beginning when reached the end of the images
	ssTransitionSeconds: 1,		    // seconds for move slide transition
	ssTransitionEffect: 1,		    // index into ["none", "fade", "h-move", "h-move-fade"] or string (e.g. fade)
	ssPaddingTop: 5,		    // minimum padding between image and top of container
	container: undefined,		    // if set, will use to host slide show. if not set, will use document.body
	resizeWithWindow: false,	    // true = slideshow & image will resize with window.resize (will override container)
	playOnEnter: false,		    // true = will start slideshow when loads
	showFilmstrip: true,		    // false = hide filmstrip
	showFilmstripToggle: false,	    // true = auto show button that allows hide of filmstrip
	showButtons: true,		    // false = hide button bar
	showExitButton: true,		    // show an exit button on the button bar
	showZoomButtons: true,		    // false = hide the zoom in out reset buttons
	showPlayPauseButton: true,		    // false = hide play / pause button, true = show play / pause button
	showFullScreenButton: true,	    // show fullscreen button
	showDownloadButton: false,	    // requires a link
	showPrintButton: false,		    // requires a link
	showOtherButton: false,		    // requires a link - custom use: e.g. Purchase, Feedback, ...
	showLocateButton: false,	    // requires a link
	showFirstLastButtons: true,	    // false = hide first and last buttons
	showText: true,			    // false = hide text
	linesOfText: 2,			    // number of lines of text to display for each image
	resizable: false,		    // true = shows a resizable triangle at bottom right and right and bottom edges are hot targets for resizing
	draggable: false,		    // true = show a handle bar at top which allows dragging
	escapeKeyCloses: false,		    // true = escape key closes slideshow
	arrowKeysNavigate: false,	    // true = left and right arrow keys will navigate previous and next slide
	zoomMode: "zoom",		    // valid values: "zoom", "magnifier"
	initMagZoom: 4,			    // initial zoom level 4 = 200%	
	magnifierSize: {height: 200, width: 200}, // dimensions of magnifier window
	divExternalMagnifier: undefined,    // div to hold imgCopy if magnifier for external viewing
	//magnifierStyles: {top: "0", left: "500px", width: "600px", height: "600px", border: "1px solid black"},
	magnifierStyles: {top: undefined, left: undefined, width: undefined, height: undefined, border: undefined},
	cbCreate: undefined,		    // callback when slideshow is created
	cbClose: undefined,		    // callback when slideshow closes
	wrapperBackground: "rgb(70,70,70)", // background of wrapper
	wrapperBorder: "1px solid grey",    // rgb(128,128,128)
	opaquePosition: "absolute",	    // fixed = cover entire screen; absolute = only cover container
	opaqueBackground: "rgb(70,70,70,1)",	    // background of opque layer
	opaqueEdge: 0,			    // distance around the opaque layer
	imageBorder: "2px solid white",		    // border of the large slideshow image
	filmstripBackground: "rgb(170,170,170)",    // background of filmstrip (#AAA)
	filmstripImageBorder: "2px solid white",    // border of the filmstrip images
	filmstripImageHeight: 90,
	waitAnimation: 0		    // wait animation to play when load
    };
    var dependants = [
	{file: "dragdrop.min.js", ns: "DragDrop"},
	{file: "resizable.min.js", ns: "Resize"},
    ]
    $ms.sourceFiles.add(dependants);
    $ms.sourceFiles.load();
    
    Slideshow.getDefaultSettings = function(){
	return defaultSettings;
    }
    
    if (CSSRule.KEYFRAMES_RULE) {
	var prefix = ""
    } else if (CSSRule.WEBKIT_KEYFRAMES_RULE) {
	var prefix = "-webkit-"
    }
    Slideshow.getInstance = function(instanceId){
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
    
    function Slideshow(settings){
	this.id;
	this.divWrapper;
	this.divTop;
	this.divMiddle;
	this.divLarge = [];	// holds full sized image
	this.divSpanButtons;		// holds buttons
	this.divButtons;
	this.divFilmstrip;
	this.divSettings;
	this.imgNextLarge;
	this.imgPrevLarge;
	this.imgCloseLarge;
	this.objMagnifier;		// the zoom object
	this.keypressListener;		// for unloading event
	this.wheelListener;	// the listener for wheel scrolling
	this.mouseupListener;	// for zoom
	this.slide = -1;	// the current page - index into files() array 
	this.oldSlide = -1;	// the slide will be fading out
	this.files = [];	// The array holding image file names + full path
	this.img = [];		// array of img elements
	this.exif = [];		// array of exif info jpeg
	this.anchor = [];	// array of a elements
	this.thumbSize = [];	// holds dimensions of files
	this.largeSize = [];	// holds dimensions of files
	this.thumbLoaded = [];	// holds flags for when images are loaded
	this.largeLoaded = [];	// holds flags for when images are loaded
	this.count;		// number of images in directory
	this.buttonDivHeight;	// height of button div
	this.orien = 'both';    // orientation of the filmstrip thumbnails
	this.ssDivWidth = 0;    // width of the slideshow filmstrip divs so all pics/divs take up the same width
	this.allLoaded = false;	// prevents running code for preload
	this.preloadCount = 3;	// max number to preload
	this.slideShowRunning = false;
	this.ssRafId;		// the requestAnimationFrame id for the slideshow
	this.transitionRafId;	// the requestAnimationFrame id for the transition
	this.animations = [];
	this.position = {top: 0, left: 0};
	this.isFullScreen = false;
	this.isTouch = $ms.isTouchDevice();
	this.touch;		// the MSTouch object which will determine if pinch zooming		
	this.filmstripState = "visible";
	this.$resizable;
	this.filmstripImageBorderWidth = 0;
	
	this.settings = $ms.cloneSettings(defaultSettings, settings);
	// conversion to integer in case pass text
	this.settings.filmstripImageHeight = parseInt(this.settings.filmstripImageHeight)

	this.magZoom = this.settings.initMagZoom;   // percent zoom 2 = 200%
	this.zoom = 1;	    // percent zoom 1 = 100%

	this.id = "ms-ss" + instanceCounter++ + "-";
	instance.push(this);
	if (this.settings.cbCreate){
	    this.settings.cbCreate(this);
	}
    }
    
    Slideshow.prototype.resize = function(){
	WINDOW_SCROLLBAR_HEIGHT = 5;	   // fudge
	WINDOW_SCROLLBAR_WIDTH = 0;
	var resizeHandleHeight = this.settings.resizable ? 6 : 0;

	// when zoomed on phone, the innerHeight / innerWidth gets very small, but clientWidth / clientHeight stays relatively normal
	var windowHeight = Math.max(window.innerHeight, document.documentElement.clientHeight) - WINDOW_SCROLLBAR_HEIGHT;
	var windowWidth = Math.max(window.innerWidth, document.documentElement.clientWidth) - WINDOW_SCROLLBAR_WIDTH;
	var titleBarHeight = 0;
	var titleBar = $ms.$(this.id + "title-bar");
	if (titleBar){
	    titleBarHeight = parseInt(titleBar.style.height);
	}

/* For cell phones, a way to show some debug info
    $ms.$(this.id + 'ss-title-line1').innerHTML = "A: " + window.innerHeight  + 
	" C: "+ window.innerWidth + 
	" B: " +  document.documentElement.clientHeight + 
	" D" + document.documentElement.clientWidth;
*/
	FILMSTRIP_DIVHEIGHT = this.settings.filmstripImageHeight + this.filmstripImageBorderWidth + 23;	// 90px (thumb) + (4px top & bottom margin) + 1px extra == 95px (divThumb) + 4 (margin) + 3 (?) + 17 (scroll) = 119 + 4 (border) = 123
	if (!this.settings.showFilmstrip || this.filmstripState == "hidden"){
	    FILMSTRIP_DIVHEIGHT = 0;
	}

	TEXTHEIGHT = this.settings.linesOfText * 25;
	if (!this.settings.showText){
	    TEXTHEIGHT = 0;
	}
	
	ABSOLUTE_MIN_SLIDESHOW_WIDTH = 200;    // arbitrary minimum
	BUTTON_DIV_HEIGHT = 41;		// buttons are 32px high + (1px each for top and bottom border) + 3px each for top and bottom margin
	if (!this.settings.showButtons){
	    BUTTON_DIV_HEIGHT = 0;
	}

	// without filmstrip buttons, text, padding, 
	// minimum dimensions are 300 x 300
	ABSOLUTE_MIN_SLIDESHOW_HEIGHT = 100 + TEXTHEIGHT + BUTTON_DIV_HEIGHT + FILMSTRIP_DIVHEIGHT + titleBarHeight + resizeHandleHeight;
	if (this.isFullScreen || this.settings.resizeWithWindow) {
	    SLIDESHOW_WIDTH = windowWidth;
	    SLIDESHOW_HEIGHT = windowHeight;
	    if (this.$resizable && this.$resizable.resizing){
		// resizing changes settings
		SLIDESHOW_WIDTH = parseInt(this.settings.container.style.width);
		SLIDESHOW_HEIGHT = parseInt(this.settings.container.style.height);
	    } else if (!this.isFullScreen && (!this.$resizable || !this.$resizable.resizing)) {
		this.settings.container.style.width = SLIDESHOW_WIDTH + "px";
		this.settings.container.style.height = SLIDESHOW_HEIGHT + "px";
	    }
	} else if (this.settings.container !== document.body){
	    // Warning: these change passed container
	    if (this.$resizable && this.$resizable.resizing){
		// resizing changes settings
		this.settings.slideshowHeight = parseInt(this.settings.container.style.height);
		this.settings.slideshowWidth = parseInt(this.settings.container.style.width);
	    } else if (this.settings.slideshowHeight){
		this.settings.container.style.height = this.settings.slideshowHeight + "px";
	    }
	    if (this.settings.slideshowWidth){
		this.settings.container.style.width = this.settings.slideshowWidth + "px";
	    }
	    if (this.settings.slideshowCenter){
		var style = getComputedStyle(this.settings.container);
		this.settings.container.style.position = "absolute";
		this.settings.container.style.top = "0";
		this.settings.container.style.bottom = "0";
		this.settings.container.style.left = "0";
		this.settings.container.style.right = "0";
		this.settings.container.style.margin = "auto";
	    } else {
		if (typeof this.settings.slideshowLeft !== "undefined" &&
			this.settings.slideshowLeft !== "" &&
			!isNaN(this.settings.slideshowTop)){
		    this.settings.container.style.top = this.settings.slideshowTop + "px";
		}
		if (!isNaN(this.settings.slideshowLeft)){
		    // Warning: changing passed container
		    this.settings.container.style.left = this.settings.slideshowLeft + "px";
		}
	    }
			
	    var rect = this.settings.container.getBoundingClientRect();
	    SLIDESHOW_WIDTH = Math.max(rect.width, ABSOLUTE_MIN_SLIDESHOW_WIDTH);
	    SLIDESHOW_HEIGHT = Math.max(rect.height, ABSOLUTE_MIN_SLIDESHOW_HEIGHT);

	    if (rect.height < ABSOLUTE_MIN_SLIDESHOW_HEIGHT){
		this.settings.container.style.height = ABSOLUTE_MIN_SLIDESHOW_HEIGHT + "px";
	    }
	    if (rect.width < ABSOLUTE_MIN_SLIDESHOW_WIDTH){
		this.settings.container.style.width = ABSOLUTE_MIN_SLIDESHOW_WIDTH + "px";
	    }
	    if (this.settings.container.style.position !== "relative" && this.settings.container.style.position !== "absolute"){
		this.settings.container.style.position = "relative";
	    }
	} else {
	    // container is document.body
	    if (this.settings.slideshowWidth){
		SLIDESHOW_WIDTH = this.settings.slideshowWidth;
	    } else {
		SLIDESHOW_WIDTH = windowWidth;
	    }

	    if (this.settings.slideshowHeight){
		SLIDESHOW_HEIGHT = Math.max(this.settings.slideshowHeight, ABSOLUTE_MIN_SLIDESHOW_HEIGHT);
	    } else {
		// default with nothing set = height of window + 50 (text) + 40 (buttons) + 122 (filmstrip) = ~962 + 15 (padding)  = 977
		SLIDESHOW_HEIGHT = windowHeight;
	    }
	}
	IMAGE_MAXHEIGHT = SLIDESHOW_HEIGHT - (TEXTHEIGHT + BUTTON_DIV_HEIGHT + FILMSTRIP_DIVHEIGHT + titleBarHeight + resizeHandleHeight + WINDOW_SCROLLBAR_HEIGHT + 4);
	IMAGE_MAXHEIGHT = Math.max(IMAGE_MAXHEIGHT, IMAGE_MINHEIGHT);
	
	// resize the major containers
	this.divWrapper.style.width = SLIDESHOW_WIDTH + "px"
	//$ms.$(this.id + 'opaque').style.width = this.divWrapper.style.width;
	
	this.divMiddle.style.height = parseInt(IMAGE_MAXHEIGHT + TEXTHEIGHT) + "px";
    }
    
    /*
     * starts the sessioninfo object and the dbcontroller and checks if user is logged in
     * */
    Slideshow.prototype.init = function(files, slide) {
	// array of files
	// starting file (page)
	if (typeof files == "undefined"){
	    alert("No file variable passed to slideshow");
	    return;
	} else if (files.length == 0){
	    alert("No files passed to slideshow");
	    return;
	}
	if (typeof slide == "undefined"){
	    slide = 0;
	} else {
	    slide = parseInt(slide);
	}
	for (var i = 0; i < files.length; i++){
	    this.files.push(new this.emptyFile);	    
	    // assign settings which are set
	    for (var property in files[i]){
		if (files[i].hasOwnProperty(property)){
		    this.files[this.files.length - 1][property] = files[i][property];
		}
	    }
	}
	if (this.settings.container == document.body || typeof this.settings.container == "undefined"){
	    this.settings.wrapperBorder = "none";
	}

	// calc the filmstrip border from the setting before any images load
	this.filmstripImageBorderWidth = this.borderWidth(this.settings.filmstripImageBorder);
	this.imageBorderWidth = this.borderWidth(this.settings.imageBorder);
	
	this.createForm(slide);
	this.ssshow();
	this.position = {top: window.pageYOffset, left: window.pageXOffset};	
	window.scrollTo(0, 0);	
    },
    
    Slideshow.prototype.borderWidth = function(borderStyle){
	var tempImg = document.createElement("img");	
	tempImg.style.border = borderStyle;
	var borderWidth = parseFloat(getComputedStyle(tempImg).getPropertyValue("border-top-width"));
	if (isNaN(borderWidth)) {
	    borderWidth = 0;
	} else {
	    borderWidth = ($ms.round(borderWidth, 0)) * 2 ;
	}
	return borderWidth;
    }
    Slideshow.prototype.emptyFile = function(){
	return {
	    filename: undefined,
	    thumb: undefined,		    // if same file, it is optional to define
	    downloadLink: undefined,	    // a url to start a download - will take place in the background in an iframe
	    locateLink: undefined,	    // a url to go to where the image would be in context
	    otherLink: undefined,	    // a custom url - purchase, feedback, etc... (would require your own image file to replace slideshow-feedback-sprite.png
	    logPrintFn: undefined	    // a custom function to run after printing (e.g. log activity when a user prints an image)
	}	
    },
    
    Slideshow.prototype.createForm = function(slide){
	// outer most divs for slideshow
	if (typeof this.settings.container == "undefined"){
	    this.settings.container = document.body;
	} else if (typeof this.settings.container == "string"){
	    this.settings.container = $ms.$(this.settings.container);
	} else {
	    this.settings.container = this.settings.container;
	}
	var opaque = $ms.$(this.id + 'opaque');
	if (opaque){
	    // error condition - close to allow starting over
	    opaque.parentNode.removeChild(opaque);
	}
	
	// opaque layer dims the rest of the screen
	opaque = document.createElement('div');
	opaque.id = this.id + 'opaque';
	opaque.className = "ss-opaque";
	opaque.style.background = this.settings.opaqueBackground;
	opaque.style.position = this.settings.opaquePosition;
	if (this.settings.opaqueEdge > 0){
	    opaque.style.top = this.settings.opaqueEdge + "px";
	    opaque.style.left = this.settings.opaqueEdge + "px";
	    opaque.style.bottom = this.settings.opaqueEdge + "px";
	    opaque.style.right = this.settings.opaqueEdge + "px";
	    opaque.style.border = Math.max(1, Math.min(5, this.settings.opaqueEdge)) + "px inset " + this.settings.opaqueBackground;
	}
	this.settings.container.appendChild(opaque);

	this.divWrapper = document.createElement('div');
	this.divWrapper.className = 'ss-wrapper';
	this.divWrapper.id = this.id + 'ss-wrapper';
	this.divWrapper.style.background = this.settings.wrapperBackground;
	this.divWrapper.style.border = this.settings.wrapperBorder;
	this.divWrapper.onclick = function(e){e.stopPropagation();return false;};
	
	// append to body  - opaque is transparent and if appended to opaque, would inherit transparent
	this.settings.container.appendChild(this.divWrapper);

	if (this.settings.draggable && this.settings.container !== document.body){
	    var divTitleBar = document.createElement("div");
	    divTitleBar.id = this.id + "title-bar";
	    divTitleBar.className = "ms-title-bar ss-titlebar";
	    divTitleBar.style.height = "20px";
	    // centers text vertically
	    divTitleBar.style.lineHeight = "20px";
	    // centers text horizontally
	    divTitleBar.style.textAlign = "center";
	    this.divWrapper.appendChild(divTitleBar);
	    
	    var div = $ms.createCloseButton(this.id, function(){
		this.close();
	    }.bind(this));
	    divTitleBar.appendChild(div);
	    
	    if (this.settings.container.id.length == 0){
		this.settings.container.id = this.id + "container";
	    }
	    $ms.draggable(this.settings.container, 
		{scope: "default", 
		handle: this.id + "title-bar",
		cbDrop: function(){
		    // if was centered, allow to be moved without interfence
		    this.settings.container.style.removeProperty("bottom");
		    this.settings.container.style.removeProperty("right");
		    this.settings.container.style.removeProperty("margin");
		}.bind(this)
	    });	    
	}
	
	// resize filmstrip to fit
	this.resizeWindowListener = function(e){this.resizeWindow()}.bind(this);
	window.addEventListener('resize', this.resizeWindowListener);	
	window.addEventListener("orientationchange", this.resizeWindowListener);
	if (this.settings.resizable && this.settings.container !== document.body){
	    // only allow resize when there is a container (not full window)
	    this.$resizable = $ms.resizable(this.settings.container, {handles: ["se"], hovers:["s", "e"], handleColor: 'green', cbResize: this.resizeWindow.bind(this)});
	}
	if (this.settings.zoomMode == "zoom"){
	    // capture mousewheel event to zoom in or out
	    this.capturemousewheel(true);
	}
	
	// allow escape key to exit
	this.keypressListener = function(e){this.keypress(e)}.bind(this);
	document.body.addEventListener("keypress", this.keypressListener, false);

	//******************************************
	// main & top box containing Middle Div (Main Image + title) PLUS Nav Buttons
	// it must have maximum image height plus 50 pixels for blank space between the buttons and the ss filmstrip
	// it should be adjusted for the jped editing when this is implemented
	//******************************************	
	this.divTop = document.createElement('div');
	this.divTop.className = 'ss-top';
	this.divTop.id = this.id + 'ss-top';
	this.divWrapper.appendChild(this.divTop);
	
	//******************************************
	// Middle box containing Image and Title
	// it must have maximum image height plus 50 pixels for text
	// if the image is not full height, it must have top padding of 1/2 the difference to max to push the inner most div down and center vertically
	//******************************************
	this.divMiddle = document.createElement('div');
	this.divMiddle.className = 'ss-middle';
	this.divMiddle.id = this.id + 'ss-middle';
	
	this.divTop.appendChild(this.divMiddle);
	
	// shortcut notation
	this.count = this.files.length;
	
	var divFilmstripOuter = document.createElement("div");
	divFilmstripOuter.style.position = "relative";

	// create button to show / hide the filmstrip
	var divShohFilmstrip = document.createElement("div");
	// id must start with img
	divShohFilmstrip.id = "img" + this.id + "filmstrip";
	divShohFilmstrip.innerHTML = "&#9660";
	divShohFilmstrip.className = "ss-filmstrip-shoh ss-shoh ss-shoh-less";
	divShohFilmstrip.title = "Hide the filmstrip thumbnail images";
	if (this.settings.showFilmstripToggle){
	    divShohFilmstrip.addEventListener("click", function(){
		var cmd;
		if ($ms.hasClass(divShohFilmstrip, "ss-shoh-less")){
		    cmd =  "hide";
		    $ms.removeClass(divShohFilmstrip, "ss-shoh-less");
		    $ms.addClass(divShohFilmstrip, "ss-shoh-more");
		    this.filmstripState = "hidden";
		    divShohFilmstrip.title = "Show the filmstrip thumbnail images";
		} else {
		    cmd = "show";
		    $ms.removeClass(divShohFilmstrip, "ss-shoh-more");
		    $ms.addClass(divShohFilmstrip, "ss-shoh-less");
		    this.filmstripState = "visible";
		    divShohFilmstrip.title = "Hide the filmstrip thumbnail images";
		}
		$ms.shoh(this.id + "filmstrip", cmd, true);
		this.resizeWindow();
	    }.bind(this));
	} else {
	    divShohFilmstrip.style.display = "none";
	}
	divFilmstripOuter.appendChild(divShohFilmstrip);

	// populate thumbnail divs in the filmstrip
	this.divFilmstrip = document.createElement("div");
	this.divFilmstrip.className = "ss-filmstrip";
	this.divFilmstrip.id = this.id + "filmstrip";
	// temporary so won't jump around
	$ms.addClass(this.divFilmstrip, "display-none");
	this.divFilmstrip.style.background = this.settings.filmstripBackground;
	divFilmstripOuter.appendChild(this.divFilmstrip);

	var divFilmstripContent = document.createElement("div");
	divFilmstripContent.className = "ss-filmstrip-content";
	divFilmstripContent.id = this.id + "filmstrip-content";
	this.divFilmstrip.appendChild(divFilmstripContent);
	
	this.divWrapper.appendChild(divFilmstripOuter);

	// populate the images
	this.filmstrip();

	//******************************************
	// Inner box containing Image Only
	// it must have only the image height plus 50 pixels for the text
	// if the image is not full height, it must have bottom margin of 1/2 the difference to max size to keep the buttons from rising up
	//******************************************
	for (var i = 0; i < this.count; i++){
	    this.divLarge[i] = document.createElement('div');
	    this.divLarge[i].className = 'printme ss-large ms-no-select';
	    this.divLarge[i].id = this.id + 'ss-large-' + i;
	    $ms.addClass(this.divLarge[i], "display-none");
	    this.divMiddle.appendChild(this.divLarge[i]);
	    // will close slideshow if click outside of image
	    // USED??
	    this.divMiddle.onmouseenter = function(e){e.stopPropagation(); this.showNavButtons("show")}.bind(this);
	    this.divMiddle.onmouseleave = function(e){e.stopPropagation(); this.showNavButtons("hide")}.bind(this);
	    var _this = this;
	    !function (div, i){
		div.addEventListener('click', function (e){
		    this.zoomImage(e)
		}.bind(_this), false);
		div.addEventListener('mousedown', function (e){		    
		    this.mousedown(e, div, i)
		}.bind(_this), false);
	    }(this.divLarge[i], i)
	}
	// create span to hold nav buttons
	this.divSpanButtons = document.createElement('span');
	this.divSpanButtons.id = this.id + 'buttons-large';
	this.divSpanButtons.className = 'ss-buttons-large';

	// prevent dblclick from highlighting buttons
	this.divSpanButtons.ondblclick = function(e){
		if (window.getSelection)
		    window.getSelection().removeAllRanges();
		else if (document.selection)
		    document.selection.empty();
	    };
	this.divMiddle.appendChild(this.divSpanButtons);

	// add buttons
	this.buttons(slide);
	this.divTop.appendChild(this.divButtons);
	if (!this.settings.showButtons){
	    $ms.addClass(this.divButtons, "display-none");
	}	
	
	// create initial array
	for (var i= 0; i < this.files.length; i++){
	    this.largeLoaded[i] = false;
	}
	
	// div contains 2 lines of text
	var divTitle = document.createElement('div');
	divTitle.className = 'ss-title';
	divTitle.id = this.id + 'title';
	divTitle.style.height = TEXTHEIGHT + "px";
	divTitle.style.minHeight = TEXTHEIGHT + "px";
	
	var divTitleLine1 = document.createElement('div');
	divTitleLine1.className = 'ss-title-line1';
	divTitleLine1.id = this.id + 'title-line1';
	divTitle.appendChild(divTitleLine1);
	
	var divTitleLine1Span = document.createElement('span');
	divTitleLine1Span.id = this.id + 'title-line1-span';
	divTitleLine1.appendChild(divTitleLine1Span);
	
	var divTitleLine2 = document.createElement('div');
	divTitleLine2.className = 'ss-title-line2';
	divTitleLine2.id = this.id + 'title-line2';
	divTitle.appendChild(divTitleLine2);
	
	var divTitleLine2Span = document.createElement('span');
	divTitleLine2Span.id = this.id + 'title-line2-span';
	divTitleLine2.appendChild(divTitleLine2Span);	
	
	divTitleLine2.style.display = parseInt(this.settings.linesOfText) < 2 ? "none" : "";
	divTitleLine1.style.display = parseInt(this.settings.linesOfText) < 1 ? "none" : "";
	if (!this.settings.showText){
	    $ms.addClass(divTitle, "display-none");
	}
	
	this.divMiddle.appendChild(divTitle);
	
	// load the first image into this.divLarge plus any preloads
	this.loadslide(slide, "init");
	
	if (this.isTouch){
	    this.touch = new $msRoot.MSTouch({logElement: $ms.$(this.id + 'ss-title-line1')});
	}

	this.resizeWindow(true);
	if (this.settings.showFilmstrip){
	    $ms.removeClass(this.divFilmstrip, "display-none");
	}
    }
    
    Slideshow.prototype.ssshow = function(){
	this.divWrapper.style.visibility = "visible";
	var opaque = $ms.$(this.id + 'opaque');
	opaque.style.display='block';
	$ms.addClass(opaque, "ss-fade-in-opaque");
	// $ms.scale(this.divWrapper, 0.3, 1, 10);
    }

    Slideshow.prototype.close = function(e) {
	if (typeof e !== "undefined" && e.stopPropagation) e.stopPropagation();
	
	if (typeof e !== "undefined" && (((e.shiftKey || e.altKey) && e.ctrlKey) || (e.shiftKey && e.altKey))){
	    // Ctrl + Shift on close button toggle wait screen on / off
	    // Ctrl + Alt forwards the animation to the next variation 
	    // Ctrl + Shift + Alt  - will do same as above
	    // Alt + Shift - pauses the animation only
	    var waitAnimation = this.settings.waitAnimation;
	    if (e.altKey && e.ctrlKey) {
		waitAnimation++;
		if (waitAnimation > 2){
		    waitAnimation = 0;
		}
	    }
	    if ($ms.$(this.id + "waitStyleSheet") && $ms.$(this.id + "wait") && $ms.$(this.id + "line1") && !$ms.hasClass($ms.$(this.id + "line1"), "ss-wait-animation-paused")){
		// will pause with either ctrl+shift or alt+shift
		// with alt+shift - will continue to display on the screen
		// with ctrl+shift+alt, will advance the animation to the next one
		if (e.altKey && e.ctrlKey) {
		    // advance
		    this.wait(waitAnimation);
		    return;
		}
		this.stopWait(e.altKey);
	    } else {
		if (e.shiftKey && e.ctrlKey) {
		    if ($ms.$(this.id + "wait-gif")){
			// toggle off - remove loading gif
			$ms.$(this.id + "wait-gif").parentNode.removeChild($ms.$(this.id + "wait-gif"));
		    } else {
			// will toggle on
			this.settings.waitAnimation = -1
		    }
		}
		this.wait(waitAnimation);	    
	    }
	    return;
	}

	//  close magnifier if open
	this.closeMagnifier();
	
	if (this.slideShowRunning) this.stopSlideshow();
	
	// get out of fullscreen mode before exiting slideshow
	if (this.isFullScreen) this.fullScreen();
	
	var opaque = $ms.$(this.id + "opaque");
	if (opaque){
	    opaque.parentNode.removeChild(opaque);
	}
	this.divWrapper.parentNode.removeChild(this.divWrapper);
	
	window.removeEventListener('resize', this.resizeWindowListener);
	window.removeEventListener("orientationchange", this.resizeWindowListener);
	if (!(typeof this.wheelListener == "undefined" || this.wheelListener == null)){
	    if (window.addEventListener){
		window.removeEventListener('DOMMouseScroll', this.wheelListener);
	    }
	}
	// stop listening for escape key
	document.body.removeEventListener("keypress", this.keypressListener);	
	window.scrollTo(this.position.left, this.position.top);	
	
	if (this.$resizable) this.$resizable.close();
	
	for (var i=0; i < instance.length; i++){
	    if (instance[i].id == this.id){
		instance.splice(i, 1);
		break;
	    }
	}
	if (this.settings.cbClose){
	    this.settings.cbClose(this);
	}
	return false;
    }

    Slideshow.prototype.filmstrip = function() {
	//div for the filmstrip
	var thumb;
	// Calc the slideshow filmstrip div width
	if (this.orien == 'both') {
	    // use landscape for starters
	    this.ssDivWidth = FILMSTRIP_DIVHEIGHT * FILMSTRIP_RATIO;
	} else if (this.orien == 'portrait') {
	    this.ssDivWidth = FILMSTRIP_DIVHEIGHT / FILMSTRIP_RATIO;
	} else {
	    this.ssDivWidth = FILMSTRIP_DIVHEIGHT * FILMSTRIP_RATIO;
	}
	
	for (var i = 0; i < this.files.length; i++) {
	    var full = this.files[i].filename;
	    var shortfile = this.shortFilename(this.files[i].filename);
	    if (typeof this.files[i].thumb !== "undefined"){
		thumb = this.files[i].thumb;
	    } else {
		thumb = this.files[i].filename;
	    }	
	    
	    //*********************************
	    //Build divs for slideshow pictures and title
	    //*********************************
	    // arrays to save state and size of elements
	    this.thumbLoaded[i] = false;
	    this.thumbSize[i] = {};
	    
	    var divImage = document.createElement("div");
	    divImage.className="ss-filmstrip-thumb display-none";
	    divImage.id = this.id + "thumb-" + i;
	    divImage.style.height = this.settings.filmstripImageHeight + this.filmstripImageBorderWidth + "px";
	    var a = document.createElement("a");		    
	    var _this = this;
	    !function (i, img){
		a.addEventListener('click', function (e){
		    // reset zoom
		    this.magZoom = this.settings.initMagZoom;
		    this.zoom = 1;
		    this.loadslide(i, "filmstrip-click")
		}.bind(_this), false)
	    }(i)

	    var img = document.createElement("img");
	    img.id = this.id + "imgthumb-" + i;
	    img.alt = this.alt(shortfile);
	    img.title = this.title(shortfile);
	    img.height = this.settings.filmstripImageHeight;
	    img.style.border = this.settings.filmstripImageBorder;

	    // clicking on picture will do nothing)
	    // img.onclick = "return false";
	    // need outer and inner fns because we're in loop and img and i need to be fixed
	    // the bang ! makes sure the outer is executed immediately
	    !function outer(img, i, divImage){
		img.addEventListener('load', function inner(e){
		    this.imgloaded(i, "thumb", img, divImage)
		}.bind(_this), false)
	    }(img, i, divImage)
	    // set src after listener
	    img.src = thumb;

	    a.appendChild(img);
	    divImage.appendChild(a);
	    $ms.$(this.id + 'filmstrip-content').appendChild(divImage);
	}
    }
    
    Slideshow.prototype.shohFilmStrip = function(){
	// toggle show / hide of filmstrip
	if (hasClass($ms.$("shoh-filmstrip")), "shoh"){
	    
	}
    }

    // create alt name from the shortfile filename
    Slideshow.prototype.alt = function(shortfile) {
	if (typeof shortfile == "undefined"){
	    return "";
	}
	return shortfile.replace(/-/g, " ").replace(/_/g, " ");
    }
    
    // create title from the shortfile filename
    Slideshow.prototype.title = function(shortfile) {
	return shortfile.replace(/-/g, " ").replace("-thumb", "").replace(/_/g, " ");
    }
    
    // sets image loaded flag
    Slideshow.prototype.imgloaded = function(i, type, img, divImage){
	// verify instance still loaded (images can finish loading after close)
	if (! $msRoot.Slideshow.getInstance(this.id)) {
	    return;
	}
	// when all thumbnails are loaded, adjust the slideshow
	//console.log(type + " " + i + " image loaded");
	if (type == "thumb"){
	    this.sizethumbimage(i, img, divImage);
	} else if (type == "large"){
	    this.sizelargeimage(i, img);
	    this.stopWait();
	}
    }
    
    Slideshow.prototype.sizethumbimage = function(i, img, divImage){
	if (! this.thumbLoaded[i]){
	    this.thumbLoaded[i] = true;
	    // calc image size to display
	    this.thumbSize[i].naturalWidth = img.naturalWidth;
	    this.thumbSize[i].naturalHeight = img.naturalHeight;
	    this.thumbSize[i].displayWidth  = Math.max(this.thumbSize[i].naturalWidth, 1);
	    this.thumbSize[i].displayHeight  = Math.max(this.thumbSize[i].naturalHeight, 1);
	    var ratio = $ms.round(this.thumbSize[i].displayWidth / this.thumbSize[i].displayHeight, 2);

	    this.thumbSize[i].displayHeight = parseInt(Math.min(this.settings.filmstripImageHeight, this.thumbSize[i].displayHeight));
	    this.thumbSize[i].displayWidth = parseInt(this.thumbSize[i].displayHeight * ratio);
	    // if filmstrip width is larger than div width, scale it down
	    if ((this.thumbSize[i].displayWidth) > this.ssDivWidth) {
		this.thumbSize[i].displayWidth = parseInt(this.ssDivWidth);
		this.thumbSize[i].displayHeight = parseInt(this.ssDivWidth / ratio);
	    }
	    if ((this.thumbSize[i].displayHeight) > this.settings.filmstripImageHeight) {
		this.thumbSize[i].displayHeight = this.settings.filmstripImageHeight;
		this.thumbSize[i].displayWidth = parseInt(this.thumbSize[i].displayHeight * ratio);
	    }    
	    var imgpadding = Math.max(this.settings.filmstripImageHeight - this.thumbSize[i].displayHeight, 0);

	    img.style.height = this.thumbSize[i].displayHeight + "px";
	    img.style.width = this.thumbSize[i].displayWidth + "px"; 
	    img.style.paddingTop = imgpadding + "px";
	    // once image has loaded, allow to be shown
	    // this filters out missing images
	    $ms.removeClass(divImage, "display-none");
	    this.adjustImageSizeForBorder(img);
	}
	// with the load of each film strip image, resize the strip
	// we don't know when the last image is loaded, so need to do it every time
	var totalwidth = 0;
	var margin = 4;
	var border = 2;
	for (var j = 0; j < this.count; j++){
	    if (typeof this.thumbSize[j] !== "undefined" && typeof this.thumbSize[j].displayWidth !== "undefined"){
		totalwidth += parseInt(this.thumbSize[j].displayWidth) + margin + border * 2;
	    }
	    // since margins get collapsed, we have only one that has two margins
	    totalwidth += margin;
	}
	$ms.$(this.id + 'filmstrip-content').style.width = parseInt(Math.max(totalwidth, parseInt(this.divFilmstrip.offsetWidth))) + "px";
	
	// likewise we need to scroll the thumbnails to match the loaded image with each one
	if (this.slide >=0){
	    var divThumb = $ms.$(this.id + 'thumb-' + this.slide);
	    if (typeof divThumb !== "undefined"){
		this.scrolldiv(divThumb);
	    }
	}	    
    }
    
    Slideshow.prototype.sizelargeimage = function(i, img){
	if (!this.largeLoaded[i]){
	    // should always be here - but just in case... don't load 2x
	    this.largeLoaded[i] = true;
	    // set values for new loaded image
	    //use max(1... to avoid division by 0
	    this.largeSize[i].naturalWidth = img.naturalWidth;
	    this.largeSize[i].naturalHeight = img.naturalHeight;
	}
	
	if (i == this.slide){
	    // center the anchor / image in the div
	    this.centerImage(i);
	    
	    // fade out and in old and new slides
	    this.transitionSlides();
	    
	    this.showNavButtons("show");
	}
    }
    
    Slideshow.prototype.transitionSlides = function(){
	var effect = 0;
	if (typeof this.settings.ssTransitionEffect == "string"){
	    effect = ssTransitionEffects.indexOf(this.settings.ssTransitionEffect);
	} else if (typeof this.settings.ssTransitionEffect == "number") {
	    effect = this.settings.ssTransitionEffect;
	}
	// ["none", "fade", "move-horizontal"],
	switch (effect) {
	    case -1:
	    case 0:
		// none
		this.transitionSlidesNone();
		break;
	    case 1:
		// "fade"
		this.transitionSlidesFade();
		break;
	    case 2:
		// "h-move"],
		this.transitionSlidesMoveHorizontal(false);
		break;
	    case 3:
		// "h-move-fade"],
		this.transitionSlidesMoveHorizontal(true);
		break;
	    case 4:
		// "size"],
		this.transitionSlidesSize(false);
		break;
	    case 5:
		// "size-fade"],
		this.transitionSlidesSize(true);
		break;
	    default:
		// none
		this.transitionSlidesNone();
		break;
	}	
    }
    
    // transition between slides - no fading / moving / etc
    Slideshow.prototype.transitionSlidesNone = function(){
	var margin = this.calcMarginX(this.largeSize[this.slide]);
	this.divLarge[this.slide].style.left = margin;	
	if (this.oldSlide >= 0){
	    $ms.addClass(this.divLarge[this.oldSlide], "display-none");
	}
	$ms.removeClass(this.divLarge[this.slide], "display-none");
    }
    
    // transition between slides - fading new one in and old one out
    Slideshow.prototype.transitionSlidesFade = function(){
	var margin = this.calcMarginX(this.largeSize[this.slide]);
	this.divLarge[this.slide].style.left = margin;

	var style = this.resetStyleSheet();
	if (!this.findCSSRule(style.sheet, "ss-fade-slide", "keyframes")){
	    var ruleFadeSlide = "@" + prefix + "keyframes ss-fade-slide {" +
		"0% {opacity: 0;}" + 
		"100% {opacity: 1;}" + 
	    "}";
	    style.sheet.insertRule(ruleFadeSlide, 0);
	}
	if (this.oldSlide >= 0){
	    this.divLarge[this.oldSlide].style[prefix + "animation"] = "";
	    void this.divLarge[this.oldSlide].offsetWidth; // causes reflow - needed for restart of animation
	    this.divLarge[this.oldSlide].style[prefix + "animation"] = "ss-fade-slide " + this.settings.ssTransitionSeconds + "s forwards linear reverse"
	    this.divLarge[this.oldSlide].style.zIndex = "0";
	    // set to local var so can't change before called in setInterval
	    var oldSlide = this.oldSlide;
	    var interval = setInterval(function(){
		clearInterval(interval);
		$ms.addClass(this.divLarge[oldSlide], "display-none");
	    }.bind(this), this.settings.ssTransitionSeconds * 1000);
	}
	this.divLarge[this.slide].style[prefix + "animation"] = "";
	void this.divLarge[this.slide].offsetWidth;	// causes reflow - needed for restart of animation
	this.divLarge[this.slide].style[prefix + "animation"] = "ss-fade-slide " + this.settings.ssTransitionSeconds + "s forwards linear normal"
	$ms.removeClass(this.divLarge[this.slide], "display-none");
	this.divLarge[this.slide].style.zIndex = "10";
	
    }

    // transition between slides - fading new one in and old one out as move right to left or reverse
    Slideshow.prototype.transitionSlidesMoveHorizontal = function(doFade){
	// if not the first one loaded, will do transition
	var direction, begin, end, beginOld, endOld;
	if (this.slide > this.oldSlide){
	    direction = 1;
	} else {
	    direction = -1;
	}
	var style = this.resetStyleSheet();
	
	// slide can have one of 2 possible settings and classes must be set/removed for both old and new slide
	//  Sliding In: (move next - L to R) or (move prev - R to L)
	var moveNextOld = "move-next-old-" + this.oldSlide;
	var movePrevOld = "move-prev-old-" + this.oldSlide;	
	var moveNext = "move-next-" + this.slide;
	var movePrev = "move-prev-" + this.slide;
	
	// remove all previous animations and keyframes for both the old and current slide
	// the keyframe uses the name in the array 
	// the animation style is a class of the same prefixed with a period
	var rulesOld = ["move-next-old-" + this.oldSlide, 
			"move-prev-old-" + this.oldSlide, 
			"move-next-" + this.oldSlide, 
			"move-prev-" + this.oldSlide];
	var rules = ["move-next-old-" + this.slide, 
			"move-prev-old-" + this.slide, 
			"move-next-" + this.slide, 
			"move-prev-" + this.slide];
	this.removeCSSRules(style.sheet, rulesOld, "keyframes");
	this.removeCSSRules(style.sheet, rules, "keyframes");
	this.removeCSSRules(style.sheet, rulesOld, "style", ".");
	this.removeCSSRules(style.sheet, rules, "style", ".");	
	
	if (this.oldSlide >= 0){ 
	    $ms.removeClass(this.divLarge[this.oldSlide], moveNextOld);
	    $ms.removeClass(this.divLarge[this.oldSlide], movePrevOld);

	    var oldMargin = this.calcMarginX(this.largeSize[this.oldSlide]);
	    this.divLarge[this.oldSlide].style.left = oldMargin + "px";
	    beginOld = 0;
	    var moveOld;
	    if (direction == 1){
		// next - move existing slide from left to right
		moveOld = moveNextOld;
		// endOld = amount old slide moves to get off screen = old slide's width plus the old margin
		endOld = (parseInt(this.largeSize[this.oldSlide].displayWidth) + oldMargin);
	    } else {
		// prev
		// move existing slide from right to left
		moveOld = movePrevOld;
		// endOld = amount old slide moves to get off screen = old slide's width plus the old margin  (it is NEGATIVE since moving left)
		endOld = -(parseInt(this.largeSize[this.oldSlide].displayWidth) + oldMargin);
	    }
	    var ruleTransformOld = "@" + prefix + "keyframes " + moveOld +" {" +
		    "0% {" + prefix + "transform: translate3d(" + beginOld + "px, 0, 0); }" + 
		    "100% {" + prefix + "transform: translate3d(" + endOld + "px, 0, 0); }" + 
		"}";
	    style.sheet.insertRule(ruleTransformOld, 0);
	} 
	$ms.removeClass(this.divLarge[this.slide], moveNext);
	$ms.removeClass(this.divLarge[this.slide], movePrev);
	var margin = this.calcMarginX(this.largeSize[this.slide]);
	// slides always will be positioned where they start, so animation will always start at 0
	begin = 0;	
	var move;
	if (this.oldSlide == -1){
	    // first slide - don't move
	    this.divLarge[this.slide].style.left = margin;
	    move = moveNext;
	    end = 0;
	} else if (direction == 1){
	    // next - move new slide from left to right
	    move = moveNext;
	    // set starting LEFT position of new slide = old Slide Left (margin) minus new slide width (which puts it off screen)
	    this.divLarge[this.slide].style.left = (oldMargin - parseInt(this.largeSize[this.slide].displayWidth)) + "px";
	    // end = amount new slide moves to new position = slide's width plus the new margin
	    end = (-oldMargin + parseInt(this.largeSize[this.slide].displayWidth) + margin);
	} else {
	    // prev - move new slide from right to left
	    move = movePrev;
	    // set starting LEFT position of new slide = old Slide Left (margin) plus old slide width
	    this.divLarge[this.slide].style.left = (oldMargin + parseInt(this.largeSize[this.oldSlide].displayWidth)) + "px";
	    // end = amount new slide moves to new position = slide's width plus the new margin (it is NEGATIVE since moving left)
	    end = oldMargin - (parseInt(this.largeSize[this.slide].displayWidth) + margin);
	}
	// translate3d pushes CSS animations into hardware acceleration
	var ruleTransform = "@" + prefix + "keyframes " + move + " {" +
		"0% {" + prefix + "transform: translate3d(" + begin + "px, 0, 0); }" + 
		"100% {" + prefix + "transform: translate3d(" + end + "px, 0, 0); }" + 
	    "}";
	style.sheet.insertRule(ruleTransform, 0);
	
	if (doFade && !this.findCSSRule(style.sheet, "ss-fade-slide", "keyframes")){
	    var ruleFadeSlide = "@" + prefix + "keyframes ss-fade-slide {" +
		"0% {opacity: 0;}" + 
		"100% {opacity: 1;}" + 
	    "}";
	    style.sheet.insertRule(ruleFadeSlide, 0);
	}
	
	var ratio = 1;
	var ratioOld;
	var time = this.settings.ssTransitionSeconds;
	var timeOld = this.settings.ssTransitionSeconds;;
	// if the two slides are of different widths, will go at a different speed
	// adjust the seconds of the smaller slide to finish sooner
	if (this.oldSlide > -1){ 
	    ratioOld = Math.abs(endOld - beginOld) / Math.abs(end - begin);
	    if (ratioOld > 0)
		// new slide will be slowed down
		time  = time / ratioOld;
	    else {
		// new slide will be slowed down
		timeOld  = time * ratioOld;
	    }
	    var ruleAnimateOld =  
		prefix + "animation-name: " + moveOld + (doFade ? ", ss-fade-slide; " : "; ") +
		prefix + "animation-duration: " + timeOld + "s" + (doFade ? "," + timeOld + "s; " : "; ") +
		prefix + "animation-timing-function: linear" + (doFade ? ",linear; " : "; ") +
		prefix + "animation-fill-mode: forwards"  + (doFade ? ",forwards; " : "; ") +
		prefix + "animation-direction: normal" + (doFade ? ",reverse; " : "; ");
	    ruleAnimateOld = "." + moveOld + "{" + ruleAnimateOld + "}";
	        
	    void this.divLarge[this.slide].offsetWidth; // causes reflow - needed for restart of animation
	    style.sheet.insertRule(ruleAnimateOld, 0);
	    $ms.addClass(this.divLarge[this.oldSlide], moveOld);
	}
	var ruleAnimate =  
	    prefix + "animation-name: " + move + (doFade ? ", ss-fade-slide; " : "; ") +
	    prefix + "animation-duration: " + time + "s" + (doFade ? "," + time + "s; " : "; ") +
	    prefix + "animation-timing-function: linear" + (doFade ? ",linear; " : "; ") +
	    prefix + "animation-fill-mode: forwards"  + (doFade ? ",forwards; " : "; ") +
	    prefix + "animation-direction: normal" + (doFade ? ",normal; " : "; ");
	ruleAnimate = "." + move + "{" + ruleAnimate + "}";
	
	void this.divLarge[this.slide].offsetWidth; // causes reflow - needed for restart of animation
	style.sheet.insertRule(ruleAnimate, 0);	
	$ms.addClass(this.divLarge[this.slide], move);
	
	// cancel all previous animations and intervals
	this.cancelAnimationIntervals();
	
	// add timer to hide old slide when done with animation
	// animationendListener event is not reliable
	// set to local var so can't change before called in setInterval
	var slide = this.slide;
	var oldSlide = this.oldSlide;
	var interval = setInterval(function(){
	    clearInterval(interval);
	    this.endListener(slide, oldSlide);
	}.bind(this), time * 1000);
	$ms.removeClass(this.divLarge[this.slide], "display-none");
	this.animations.push({slide: slide, oldSlide: oldSlide, interval: interval});
    }

    // transition between slides - fading new one in and old one out as move right to left or reverse
    Slideshow.prototype.transitionSlidesSize = function(doFade){
	// if not the first one loaded, will do transition
	var direction, newX, newY, oldX, oldY;
	var oldHeight, oldWidth, newHeight, newWidth;
	if (this.slide > this.oldSlide){
	    direction = 1;
	} else {
	    direction = -1;
	}
	
	var style = this.resetImage(this.oldSlide);
	
	// slide can have one of 2 possible settings and classes must be set/removed for both old and new slide
	//  Sliding In: (move next - L to R) or (move prev - R to L)
	var moveNextOld = "move-next-old-" + this.oldSlide;
	var movePrevOld = "move-prev-old-" + this.oldSlide;	
	var moveNext = "move-next-" + this.slide;
	var movePrev = "move-prev-" + this.slide;
	
	// remove all previous animations and keyframes for both the old and current slide
	// the keyframe uses the name in the array 
	// the animation style is a class of the same prefixed with a period
	var rulesOld = ["move-next-old-" + this.oldSlide, 
			"move-prev-old-" + this.oldSlide, 
			"move-next-" + this.oldSlide, 
			"move-prev-" + this.oldSlide,
			"ss-size-move-next-old-" + this.oldSlide, 
			"ss-size-move-prev-old-" + this.oldSlide, 
			"ss-size-move-next-" + this.oldSlide, 
			"ss-size-move-prev-" + this.oldSlide
		    ];
	var rules = ["move-next-old-" + this.slide, 
			"move-prev-old-" + this.slide, 
			"move-next-" + this.slide, 
			"move-prev-" + this.slide,
			"ss-size-move-next-old-" + this.slide, 
			"ss-size-move-prev-old-" + this.slide, 
			"ss-size-move-next-" + this.slide, 
			"ss-size-move-prev-" + this.slide
		    ];
	
	this.removeCSSRules(style.sheet, rulesOld, "keyframes");
	this.removeCSSRules(style.sheet, rules, "keyframes");
	this.removeCSSRules(style.sheet, rulesOld, "style", ".");
	this.removeCSSRules(style.sheet, rules, "style", ".");	
	
	// OLD SLIDE	
	if (this.oldSlide >= 0){ 
	    $ms.removeClass(this.divLarge[this.oldSlide], moveNextOld);
	    $ms.removeClass(this.divLarge[this.oldSlide], movePrevOld);

	    var moveOld;
	    if (direction == 1){
		// next - move existing slide to the NEXT slide's position
		moveOld = moveNextOld;
	    } else {
		// prev
		// move existing slide to the PREV slide's position
		moveOld = movePrevOld;
	    }
	} 
	$ms.removeClass(this.divLarge[this.slide], moveNext);
	$ms.removeClass(this.divLarge[this.slide], movePrev);
	// ending LEFT and TOP
	newX = this.calcMarginX(this.largeSize[this.slide]);
	newY = this.calcMarginY(this.largeSize[this.slide]);
	newHeight = parseInt(this.divLarge[this.slide].style.height);
	newWidth = parseInt(this.divLarge[this.slide].style.width);
	if (this.oldSlide > -1){ 
	    // if NOT first slide first time through
	    // Starting LEFT and TOP
	    oldX = this.calcMarginX(this.largeSize[this.oldSlide]);
	    oldY = this.calcMarginY(this.largeSize[this.oldSlide]);
	    oldHeight = parseFloat(this.divLarge[this.oldSlide].style.height);
	    oldWidth = parseFloat(this.divLarge[this.oldSlide].style.width);
	    
	    // keep image centered in div with resize
	    $ms.addClass(this.img[this.oldSlide], "ss-center-image");
	    
	    // set image to grow with the div if necessary
	    
	    var diffWidth = newWidth - oldWidth;
	    var diffHeight = newHeight - oldHeight;
	    var diffWidthGreater = (diffWidth - diffHeight) > 0
	    if (diffWidth > 0 && diffWidthGreater){
		// new slide wider - old slide needs to grow as expand
		this.img[this.oldSlide].style.width = "100%";
		this.img[this.oldSlide].style.height =  "auto";
	    } else if (diffHeight < 0){
		// new slide higher - old slide needs to grow
		this.img[this.oldSlide].style.height = "100%";
		this.img[this.oldSlide].style.width =  "auto";
	    }	    

	    if (diffWidth < 0 && !diffWidthGreater){
		// old slide wider - new slide needs to grow for the beginning
		this.img[this.slide].style.width = "100%";
		this.img[this.slide].style.height = "auto";
	    } else if (diffHeight < 0){
		// old slide higher - new slide needs to grow
		this.img[this.slide].style.height = "100%";
		this.img[this.slide].style.width = "auto";
	    }	    
	    
	    // the NEW slide starts centered in the OLD slide
	    this.divLarge[this.slide].style.left = oldX + "px";
	    this.divLarge[this.slide].style.top = oldY + "px";
	    this.divLarge[this.slide].style.width = oldWidth + "px";
	    this.divLarge[this.slide].style.height = oldHeight + "px";
	} else {
	    // first slide - initial size and position
	    oldX = newX;
	    oldY = newY;
	    oldWidth = newWidth;
	    oldHeight = newHeight;
	}
	// keep image centered in div with resize
	$ms.addClass(this.img[this.slide], "ss-center-image");
	var moveNew;
	if (direction == 1){
	    // next - move new slide to its new position
	    moveNew = moveNext;
	} else {
	    // prev - move new slide from right to left
	    moveNew = movePrev;
	}
	// ending with the new slides position and size
	var tX = newX - oldX;
	var tY = newY - oldY;
	
	// ********************************************
	// Set Fade Rule (both old and new)
	// ********************************************
	if (doFade && !this.findCSSRule(style.sheet, "ss-fade-slide", "keyframes")){
	    var ruleFadeSlide = "@" + prefix + "keyframes ss-fade-slide {" +
		"0% {opacity: 0;}" + 
		"100% {opacity: 1;}" + 
	    "}";
	    style.sheet.insertRule(ruleFadeSlide, 0);
	}
	
	var time = this.settings.ssTransitionSeconds;
	if (this.oldSlide > -1){
	    // ********************************************
	    // Set OLD slide transform
	    // ********************************************
	    var ruleTransformOld = "@" + prefix + "keyframes " + moveOld +" {" +
		    "0% {" + prefix + "transform: translate3d(0, 0, 0); }" + 
		    "100% {" + prefix + "transform: translate3d(" + tX + "px, " + tY + "px, 0); }" + 
		"}";
	    style.sheet.insertRule(ruleTransformOld, 0);
	    var ruleSizeOld = "@" + prefix + "keyframes ss-size-" + moveOld + " {" +
		    "0% {width:" + oldWidth + "px;height:" + oldHeight + "px; }" + 
		    "100% {width:" + newWidth + "px;height:" + newHeight + "px; }" + 
		"}";
	    style.sheet.insertRule(ruleSizeOld, 0);	

	    // if the two slides are of different widths, will go at a different speed
	    // adjust the seconds of the smaller slide to finish sooner
	    var ruleAnimateOld =  
		prefix + "animation-name: " + moveOld + ", ss-size-" + moveOld + (doFade ? ", ss-fade-slide; " : "; ") +
		prefix + "animation-duration: " + time + "s," + time + "s" + (doFade ? "," + time + "s; " : "; ") +
		prefix + "animation-timing-function: linear, linear" + (doFade ? ",linear; " : "; ") +
		prefix + "animation-fill-mode: forwards, forwards"  + (doFade ? ",forwards; " : "; ") +
		prefix + "animation-direction: normal, normal" + (doFade ? ",reverse; " : "; ");
	    ruleAnimateOld = "." + moveOld + "{" + ruleAnimateOld + "}";

	    void this.divLarge[this.oldSlide].offsetWidth; // causes reflow - needed for restart of animation
	    style.sheet.insertRule(ruleAnimateOld, 0);
	    $ms.addClass(this.divLarge[this.oldSlide], moveOld);
	}
	// ********************************************
	// Set NEW slide transform
	// translate3d pushes CSS animations into hardware acceleration
	// ********************************************
	var ruleTransformNew = "@" + prefix + "keyframes " + moveNew + " {" +
		"0% {" + prefix + "transform: translate3d(0, 0, 0); }" + 
		"100% {" + prefix + "transform: translate3d(" + tX + "px, " + tY + "px, 0); }" + 
	    "}";
	style.sheet.insertRule(ruleTransformNew, 0);
	
	var ruleSizeNew = "@" + prefix + "keyframes ss-size-" + moveNew + " {" +
		"0% {width:" + oldWidth + "px;height:" + oldHeight + "px; }" + 
		"100% {width:" + newWidth + "px;height:" + newHeight  + "px; }" + 
	    "}";
	style.sheet.insertRule(ruleSizeNew, 0);
	
	var ruleAnimateNew =  
	    prefix + "animation-name: " + moveNew + ", ss-size-" + moveNew + (doFade ? ", ss-fade-slide; " : "; ") +
	    prefix + "animation-duration: " + time + "s," + time + "s" + (doFade ? "," + time + "s; " : "; ") +
	    prefix + "animation-timing-function: linear, linear" + (doFade ? ",linear; " : "; ") +
	    prefix + "animation-fill-mode: forwards, forwards"  + (doFade ? ",forwards; " : "; ") +
	    prefix + "animation-direction: normal, normal" + (doFade ? ",normal; " : "; ");
	ruleAnimateNew = "." + moveNew + "{" + ruleAnimateNew + "}";
	
	void this.divLarge[this.slide].offsetWidth; // causes reflow - needed for restart of animation
	style.sheet.insertRule(ruleAnimateNew, 0);	
	$ms.addClass(this.divLarge[this.slide], moveNew);

	// cancel all previous animations and intervals
	this.cancelAnimationIntervals();
	
	// make sure starting position is accurate
	this.divLarge[this.slide].style.left = oldX + "px";
	this.divLarge[this.slide].style.top = oldY + "px";
	// add timer to hide old slide when done with animation
	// animationendListener event is not reliable
	// set to local var so can't change before called in setInterval
	var slide = this.slide;
	var oldSlide = this.oldSlide;
	var interval = setInterval(function(){
	    clearInterval(interval);
	    this.endListener(slide, oldSlide);
	}.bind(this), time * 1000);
	$ms.removeClass(this.divLarge[this.slide], "display-none");
	this.animations.push({slide: slide, oldSlide: oldSlide, interval: interval});
    }

    Slideshow.prototype.endListener = function(slide, oldSlide){
	// there is only ever 1 set of animations active at a time
	this.animations.length = 0;
	if (oldSlide > -1){
	    $ms.addClass(this.divLarge[oldSlide], "display-none");
	    this.resetImage(oldSlide);
	}
	$ms.removeClass(this.divLarge[slide], "display-none");
	this.resetImage(slide);
    }

    Slideshow.prototype.cancelAnimationIntervals = function(){
	// cancel all previous animations and intervals
	if (this.animations.length > 0){
	    for (var i = 0; i < this.animations.length; i++){
		clearInterval(this.animations[i].interval);
		this.resetImage(this.animations[i].oldSlide);
		$ms.addClass(this.divLarge[this.animations[i].oldSlide], "display-none");
		$ms.addClass(this.divLarge[this.animations[i].slide], "display-none");
	    }
	    this.animations.length = 0;
	}
    }

    Slideshow.prototype.resetImage = function(slide){
	if (slide > -1){
	    $ms.addClass(this.divLarge[slide], "visibility-hidden");
	    $ms.removeClass(this.img[slide], "ss-center-image");
	    
	    this.img[slide].style.height = parseInt(this.largeSize[slide].displayHeight - this.imageBorderWidth) + "px";
	    this.img[slide].style.width = parseInt(this.largeSize[slide].displayWidth - this.imageBorderWidth) + "px";
	    this.img[slide].style.top = "0";
	    this.img[slide].style.left = "0";
	    
	    this.divLarge[slide].style.height = parseInt(this.largeSize[slide].displayHeight) + "px";
	    this.divLarge[slide].style.width = parseInt(this.largeSize[slide].displayWidth) + "px";
	    this.divLarge[slide].style.left = this.calcMarginX(this.largeSize[slide]) + "px";
	    this.divLarge[slide].style.top = this.calcMarginY(this.largeSize[slide]) + "px";
	    var style = this.resetStyleSheet();
	    $ms.removeClass(this.divLarge[slide], "visibility-hidden");
	} else {
	    var style = this.resetStyleSheet();
	}
	return style;
    }
    
    Slideshow.prototype.resetStyleSheet = function(){
	var style = $ms.$(this.id + "tempStyleSheet");
	if (this.animations.length == 0 && style){
	    // no active animations - delete previous stylesheets
	    style.parentNode.removeChild(style);
	    style = undefined;
	}
	if (! style){
	    var style = document.createElement("style");
	    style.id = this.id + "tempStyleSheet";
	    // WebKit hack
	    style.appendChild(document.createTextNode(""));
	    document.head.appendChild(style);
	}
	return style;
    }

    Slideshow.prototype.removeCSSRules = function(sheet, rules, type, classPrefix){
	if (typeof classPrefix == "undefined") classPrefix = "";
	for (var i = 0; i < rules.length; i++){
	    var removed = this.removeCSSRule(sheet, classPrefix + rules[i], type);
	}
    }	    
    
    Slideshow.prototype.removeCSSRule = function(sheet, rule, type){
	var correctType;
	 // all browsers, except IE before version 9
	if (sheet.cssRules) {
	    for (var i=0; i < sheet.cssRules.length; i++) {
		if (type == "style") {
		    if ((sheet.cssRules[i].type === window.CSSRule.STYLE_RULE || 
			    sheet.cssRules[i].type === window.CSSRule.WEBKIT_STYLE_RULE) && 
			    sheet.cssRules[i].selectorText === rule) {
			    // $ms.v("Deleting Rule:", sheet.cssRules[i]);
			sheet.deleteRule (i);
			return true;
		    }
		} else if (type == "keyframes") {
		    if ((sheet.cssRules[i].type === window.CSSRule.KEYFRAMES_RULE || 
			    sheet.cssRules[i].type === window.CSSRule.WEBKIT_KEYFRAMES_RULE) &&
			    sheet.cssRules[i].name === rule) {
			    // $ms.v("Deleting Rule 2:", sheet.cssRules[i]);
			sheet.deleteRule (i);
			return true;
		    }
		}
	    }
	}
    }
    
    Slideshow.prototype.findCSSRule = function(sheet, rule, type){
	 // all browsers, except IE before version 9
	if (sheet.cssRules) {
	    for (var i=0; i < sheet.cssRules.length; i++) {
		if (typeof type == "style") {
		    if (sheet.cssRules[i].selectorText === rule) {
			return i;
		    }
		} else if (type == "keyframes") {
		    if ((sheet.cssRules[i].type === window.CSSRule.KEYFRAMES_RULE || 
			    sheet.cssRules[i].type === window.CSSRule.WEBKIT_KEYFRAMES_RULE) &&
			    sheet.cssRules[i].name === rule) {
			return i;
		    }
		}
	    }  
	}
	return false;
    }
    
    // when new slide is loaded, adjust the middle and large divs to center vertically and horizontally
    // since different images have different heights
    Slideshow.prototype.centerImage = function(i){
	//******************************************
	// Large Image box containing (Anchor +) Image Only
	// size image container (this.divLarge) the same size as image. this.divLarge uses left 50% and transform to keep it centered
	//******************************************
	this.largeSize[i].displayWidth = parseInt(Math.max(1, this.largeSize[i].naturalWidth));
	this.largeSize[i].displayHeight = parseInt(Math.max(1, this.largeSize[i].naturalHeight));

	var ratioScreen = SLIDESHOW_WIDTH / IMAGE_MAXHEIGHT;
	var ratioImage = this.largeSize[i].displayWidth / this.largeSize[i].displayHeight;
	
	// make sure image fills space allowed, but fits within it
	if (ratioImage > ratioScreen){
	    // use image width
	    this.largeSize[i].displayWidth = SLIDESHOW_WIDTH;
	    this.largeSize[i].displayHeight = parseInt(this.largeSize[i].displayWidth / ratioImage);
	} else {
	    // when using max height - adjust for minimum top padding
	    this.largeSize[i].displayHeight = IMAGE_MAXHEIGHT - this.settings.ssPaddingTop;
	    this.largeSize[i].displayWidth = parseInt(this.largeSize[i].displayHeight * ratioImage);
	}

	// set image and div size
	this.resetImage(i);
	
	// top  & bottom margin
	var margin = IMAGE_MAXHEIGHT - parseInt(this.largeSize[i].displayHeight);
	this.divLarge[this.slide].style.top = margin  / 2 + "px";
	
	var margin = this.calcMarginX(this.largeSize[this.slide]);
	this.divLarge[this.slide].style.left = margin + "px";
    }
    
    /*
     * return the current image for the slideshow (this is the LARGE image - not the thumbnails)
     * */

    Slideshow.prototype.loadslide = function(i, mode) {
	var alt, title;
	if (i < 0){
	    if (this.settings.slideshowWrap){
		i = this.count -1;
	    } else {
		return;
	    }
	} else if (i >= this.count) {
	    if (this.settings.slideshowWrap){
		i = 0;
	    } else {
		return;
	    }
	}
	if (i !== this.slide){
	    // loading new slide
	    // verify slide is visible and if not progress to next one
	    var divThumb = $ms.$(this.id + 'thumb-' + i);
	    if ($ms.hasClass(divThumb, "display-none") && mode !== "init"){
		// not visible
		// determine direction
		// not accurate when wrapping beginning or end
		// only an issue if missing thumbnails and first or last image is missing)
		var found = false;
		if (this.slide < i){
		    // going forwards
		    for (var j = i + 1; j < this.count; j++){
			divThumb = $ms.$(this.id + 'thumb-' + (j));
			if (! $ms.hasClass(divThumb, "display-none")){
			    i = j;
			    found = true;
			    break;
			}
		    }
		} else {
		    // going backwards
		    for (var j = i - 1; j >= 0; j--){
			divThumb = $ms.$(this.id + 'thumb-' + (j));
			if (! $ms.hasClass(divThumb, "display-none")){
			    i = j;
			    found = true;
			    break;
			}
		    }		    
		}
		if (! found){
		    // no more slides
		    return;
		}
	    }
	    // if slideshow running, reset the timer
	    if (this.slideShowRunning && mode.indexOf("click") !== -1 || this.slideShowRunning && mode.indexOf("keypress") !== -1){
		this.playPause("reset");
	    }	    
	    
	    // set current page
	    if (this.slide >=  0){
		// set old slice to transition out
		this.oldSlide = this.slide;
	    }
	    this.slide = i;
	    // reset zoom
	    this.magZoom = this.settings.initMagZoom;
	    this.zoom = 1;
	    
	    // determine if has been already loaded	    
	    if (typeof this.anchor[i] == "undefined"){
		this.wait(mode == "init" ? this.settings.waitAnimation : undefined);
		// create the image divs and populate src
		//image will be sized and transitioned in when fully loaded
		this.createImage(i);
	    } else {
		//this.stopWait();
		// already loaded
		// reset in case of zoom
		this.resetZoom(this.divLarge[i], this.img[i]);
		// center image vertically
		this.centerImage(i);

		// transition
		this.transitionSlides();
	    }
	    
	    // update button state
	    this.buttons(i);
	    this.fitButtons();
	    
	    // load text
	    $ms.$(this.id + 'title-line1-span').innerHTML = this.slidePositionText(i) + "&nbsp;&nbsp;" + this.line1Text(i);
	    $ms.$(this.id + 'title-line2-span').innerHTML = this.line2Text(i);
	
	    // show the thumb is selected
	    var imgthumb = $ms.$(this.id + "imgthumb-" + i)
	    $ms.addClass(imgthumb, "selected");
	    // remove selected highlight from previous one
	    if (this.oldSlide >= 0){
		imgthumb = $ms.$(this.id + "imgthumb-" + this.oldSlide)
		$ms.removeClass(imgthumb, "selected");
	    }
	    // with a new slide hide the magnifier
	    this.closeMagnifier();
	    
	    // preload other images
	    this.preloadImages(i);
	    
	    // hide large nav buttons if not in range - from click on nav buttons
	    this.showNavButtons("show");

	    if (this.settings.showDownloadButton){
		// set the download link
		this.downloadLinkdata();
	    }
	}
	var div = $ms.$(this.id + 'thumb-' + i);
	this.scrolldiv(div);
    };

    Slideshow.prototype.preloadImages = function(i){
	// will preload up to preloadCount images
	var preloaded = 0;
	if (this.allLoaded || this.preloadCount == 0){
	    return;
	}
	// first preference will be next image
	if (i < this.count - 1){
	    // not already at end
	    if (typeof this.anchor[i+1] == "undefined"){
		this.createImage(i+1);
		preloaded++;
		if (preloaded >= this.preloadCount){
		    return;
		}
	    }
	}

	// second preference will be previous image
	if (i > 0){
	    // not already at beginning
	    if (typeof this.anchor[i-1] == "undefined"){
		this.createImage(i-1);
		preloaded++;
		if (preloaded >= this.preloadCount){
		    return;
		}
	    }
	}

	// third preference will be first image
	if (typeof this.anchor[0] == "undefined"){
	    this.createImage(0);
	    preloaded++;
	    if (preloaded >= this.preloadCount){
		return;
	    }
	}
	
	// fourth preference will be last image
	if (typeof this.anchor[this.count-1] == "undefined"){
	    this.createImage(this.count-1);
	    preloaded++;
	    if (preloaded >= this.preloadCount){
		return;
	    }
	}
	
	// fifth preference will be to start where we are and go to the end
	for (var j = i+1; j < this.count-1; j++){
	    if (typeof this.anchor[j] == "undefined"){
		this.createImage(j);
		preloaded++;
		if (preloaded >= this.preloadCount){
		    return;
		}
	    }
	}
	
	// sixth preference will be to start at first slide and go to where we are
	for (var j = 0; j < i; j++){
	    if (typeof this.anchor[j] == "undefined"){
		this.createImage(j);
		preloaded++;
		if (preloaded >= this.preloadCount){
		    return;
		}
	    }
	}
	// if got here, all were already loaded
	this.allLoaded = true;
    }

    
    // create all elements for image and set source to load
    Slideshow.prototype.createImage = function(i){
	// first time to load image - create new elements
	// arrays to save state and size of elements
	this.largeLoaded[i] = false;
	this.largeSize[i] = {};

	var shortfile = this.shortFilename(this.files[i].filename)

	var a = document.createElement("a");

	var img = document.createElement("img");
	img.alt = this.alt(shortfile);
	img.id = this.id + "imglarge-" + i;
	img.title = this.title(shortfile);
	// Load the image
	img.src = this.files[i].filename;
	img.style.position = "absolute";
	// img.style.border = this.settings.imageBorder;
	// position needed so have initial value for large images
	img.style.top = "0px";
	img.style.left = "0px";
	img.addEventListener('load', function(){this.imgloaded(i, "large", img)}.bind(this));

	a.appendChild(img);

	// add new anchor/image to the containing div
	this.divLarge[i].appendChild(a);
	this.divLarge[i].style.border = this.settings.imageBorder;

	// save the anchor/image in array if slides
	this.anchor[i] = a;
	this.img[i] = img;
    }

    // create div (on first call) and set download link for current image
    Slideshow.prototype.downloadLinkdata = function(){
	var input = $ms.$(this.id + 'download-link');
	if (! input) {
	    // firt time creating the downloaddatadiv
	    var divDownload = document.createElement("div");
	    //divDownload.style.position = "absolute";
	    divDownload.style.display = "none";		//left = 0;
	    //divDownload.style.top = 0;
	    divDownload.id = this.id + "download";
	    var input = document.createElement("input");		
	    input.type = 'hidden';
	    input.id = this.id + "download-link";
	    divDownload.appendChild(input);
	    this.divWrapper.appendChild(divDownload);
	}
	// set the download link value for the current displayed image
	input.value = this.files[this.slide].downloadLink;
    }
    
    Slideshow.prototype.showNavButtons = function(mode) {
	// don't show buttons with magnifier
	if ($ms.$(this.id + "magnifier")) return;
	
	// Load Large Nav Buttons
	if (! this.imgNextLarge) {
	    var nextLarge = this.nextLinklarge();
	    this.imgNextLarge = nextLarge.img;
	    $ms.addClass(this.imgNextLarge, "visibility-hidden");
	    this.divSpanButtons.appendChild(nextLarge.a);
	    
	    var prevLarge = this.prevlinklarge();
	    this.imgPrevLarge = prevLarge.img;
	    $ms.addClass(this.imgPrevLarge, "visibility-hidden");
	    this.divSpanButtons.appendChild(prevLarge.a);
	    
	    var closeLarge = this.closeLinklarge();
	    this.imgCloseLarge = closeLarge.img;
	    $ms.addClass(this.imgCloseLarge, "visibility-hidden");
	    this.divSpanButtons.appendChild(closeLarge.a);
	}	
	
	
	if (mode == "show"){
	    // only show next if not at end
	    if (this.slide < this.count -1){
		$ms.removeClass(this.imgNextLarge, "visibility-hidden");
	    } else {
		$ms.addClass(this.imgNextLarge, "visibility-hidden");
	    }
	    // only show prev if not at begin
	    if (this.slide > 0){
		$ms.removeClass(this.imgPrevLarge, "visibility-hidden");
	    } else {
		$ms.addClass(this.imgPrevLarge, "visibility-hidden");
	    }
	    $ms.removeClass(this.imgCloseLarge, "visibility-hidden");
	} else if (mode == "test") {
	    // while still hovered image, if click button, may be out of range
	    // with load of image, pass test to see if need to hide without mouseleave
	    // only show next if not at end
	    if (this.slide >= this.count -1){
		$ms.addClass(this.imgNextLarge, "visibility-hidden");
	    }
	    // only show prev if not at begin
	    if (this.slide <= 0){
		$ms.addClass(this.imgPrevLarge, "visibility-hidden");
	    }
	} else {
	    // mode = hide
	    // when hiding prev and next buttons - set visibility:hidden to the image so that button still exists
	    // this prevents repeated clicking on the image and zooming by accident when button image is hidden
	    $ms.addClass(this.imgNextLarge, "visibility-hidden");
	    $ms.addClass(this.imgPrevLarge, "visibility-hidden");
	    $ms.addClass(this.imgCloseLarge, "visibility-hidden");
	}
    }    
    
    /*
     * return links for previous, next, close, magnifier (under the big current picture)
     * */

    Slideshow.prototype.buttons = function(slide){
	//******************************************
	// Main image navigation
	//******************************************
	var init = false;
	if (typeof this.divButtons == "undefined"){
	    this.divButtons = document.createElement("div");
	    this.divButtons.className = 'ss-buttons';
	    this.divButtons.id = this.id + 'ss-buttons';
	    init = true;
	}

	// wrapper div for zoom & full screen buttons to the right of nav buttons
	var divLeft = this.nestedButtonsDiv("buttons-outer-left", "buttons-inner-left");
	if (init){this.divButtons.appendChild(divLeft.outer)};
	
	if (this.settings.showPrintButton){
	    var a = this.printLink(slide);
	    if (init){divLeft.inner.appendChild(a)};
	}

	if (this.settings.showDownloadButton){
	    var a = this.downloadLink(slide);
	    if (init){divLeft.inner.appendChild(a)};
	}
	
	// feedback button
	if (this.settings.showOtherButton) {
	    var a = this.otherLink(slide);
	    if (init){divLeft.inner.appendChild(a)};
	}

	// locate button
	if (this.settings.showLocateButton) {
	    var a = this.locateLink(slide);
	    if (init){divLeft.inner.appendChild(a)};
	}

	// some space
	var a = this.createSpace(10, 0);
	if (init){this.divButtons.appendChild(a)};
	
	if (this.settings.showFirstLastButtons){
	    var a = this.firstLink();
	    if (init){this.divButtons.appendChild(a)};
	}
	
	var a = this.previousLink();
	if (init){this.divButtons.appendChild(a)};

	if (this.settings.showPlayPauseButton){
	    var a = this.playPauseLink();
	    if (init){this.divButtons.appendChild(a)};
	}

	var a = this.nextLink();
	if (init){this.divButtons.appendChild(a)};

	if (this.settings.showFirstLastButtons){
	    var a = this.lastLink();
	    if (init){this.divButtons.appendChild(a)};
	}

	// some space
	var a = this.createSpace(10, 1);
	if (init){this.divButtons.appendChild(a)};
	
	// navigation buttons
	if (this.settings.showExitButton){
	    var a = this.closeLink();
	    if (init){this.divButtons.appendChild(a)};
	}

	// wrapper div for zoom & full screen buttons to the right of nav buttons
	var divRight = this.nestedButtonsDiv("buttons-outer-right", "buttons-inner-right");
	if (init){this.divButtons.appendChild(divRight.outer)};
	
	if (this.settings.showZoomButtons){
	    // Magnifier / Zoom In button
	    var a = this.magnifierLink();
	    if (init){divRight.inner.appendChild(a)};

	    if (this.settings.zoomMode == "zoom"){
		// Zoom Out Button
		var a = this.zoomOutLink();
		if (init){divRight.inner.appendChild(a)};

		// Zoom Reset Button
		var a = this.zoomResetLink();
		if (init){divRight.inner.appendChild(a)};
	    }
	}	
	// Settings Button
	//var a = this.settingsLink();
	//if (init){this.divButtons.appendChild(a)};

	if (!this.isTouch){
	    // full screen button only on larger screens
	    var a = this.fullScreenLink();
	    if (init){divRight.inner.appendChild(a)};
	}
	
	return this.divButtons;
    }
    
    Slideshow.prototype.fitButtons = function(){
	var divRightOuter = $ms.$(this.id + "buttons-outer-right");
	var divRightInner = $ms.$(this.id + "buttons-inner-right");
	var divLeftOuter = $ms.$(this.id + "buttons-outer-left");
	var divLeftInner = $ms.$(this.id + "buttons-inner-left");
	// reset classes for width calc
	$ms.removeClass(divLeftOuter, "buttons-outer");
	$ms.removeClass(divLeftInner, "buttons-inner");
	$ms.removeClass(divLeftInner, "buttons-inner-2-buttons");
	$ms.removeClass(divLeftInner, "buttons-inner-3-buttons");
	$ms.removeClass(divLeftInner, "buttons-inner-4-buttons");
	$ms.addClass(divLeftInner, "buttons-inner-initial");

	$ms.removeClass(divRightOuter, "buttons-outer");
	$ms.removeClass(divRightInner, "buttons-inner");
	$ms.removeClass(divRightInner, "buttons-inner-3-buttons");
	$ms.removeClass(divRightInner, "buttons-inner-4-buttons");
	$ms.addClass(divRightInner, "buttons-inner-initial");

	var width = 0;
	for (var i = 0; i < this.divButtons.childNodes.length; i++){
	    if (this.divButtons.childNodes[i].nodeName.toLowerCase() == "a"){
		var a = this.divButtons.childNodes[i];
		for (var j=  0; j < a.childNodes.length; j++){
		    if (a.childNodes[j].nodeName.toLowerCase() == "img"){
			width += parseFloat(getComputedStyle(a.childNodes[j]).width);
		    }
		}
	    } else if (this.divButtons.childNodes[i].nodeName.toLowerCase() == "div"){
		width += parseFloat(this.divButtons.childNodes[i].getBoundingClientRect().width);
	    }
	}
	if (isNaN(width)) {
	    return;
	}
	// make sure the show / hide triangle does not overlap with icons
	var shohWidth = parseFloat(getComputedStyle($ms.$("img" + this.id + "filmstrip")).right) + parseFloat(getComputedStyle($ms.$("img" + this.id + "filmstrip")).width);
	width += shohWidth * 2;
	var divMiddleWidth = this.divMiddle.getBoundingClientRect().width ;
	// combine 3 zoom buttons if they exist and need space
	if (this.settings.zoomMode == "zoom" && $ms.$(this.id + "buttons-inner-right")){
	    if (width > divMiddleWidth){
		$ms.addClass($ms.$(this.id + "buttons-outer-right"), "buttons-outer");
		$ms.addClass($ms.$(this.id + "buttons-inner-right"), "buttons-inner");
		if ($ms.$(this.id + "a-full")){
		    $ms.addClass($ms.$(this.id + "buttons-inner-right"), "buttons-inner-4-buttons");
		    width -= (3 * BUTTON_WIDTH);
		} else {
		    $ms.addClass($ms.$(this.id + "buttons-inner-right"), "buttons-inner-3-buttons");
		    width -= (2 * BUTTON_WIDTH);
		}
		$ms.removeClass(this.id + "buttons-inner-right", "buttons-inner-initial");
	    }
	}
        // combine print, download, locate, feedback buttons if exist
	var numberOfButtonsToHide = Math.ceil((width - divMiddleWidth) / 32);
	var leftButtons = 0;
	if (this.settings.showPrintButton) leftButtons++;
	if (this.settings.showDownloadButton) leftButtons++;
	if (this.settings.showOtherButton) leftButtons++;
	if (this.settings.showLocateButton) leftButtons++;
	
	if (leftButtons > 1){
	    if (numberOfButtonsToHide > 0){
		$ms.addClass($ms.$(this.id + "buttons-outer-left"), "buttons-outer");
		$ms.addClass($ms.$(this.id + "buttons-inner-left"), "buttons-inner");	
	        $ms.addClass($ms.$(this.id + "buttons-inner-left"), "buttons-inner-4-buttons");
		width -= ((leftButtons - 1) * BUTTON_WIDTH);
		$ms.removeClass(this.id + "buttons-inner-left", "buttons-inner-initial");
	    }
	}
	numberOfButtonsToHide = Math.ceil((width - divMiddleWidth) / 32);

	// last resort, hide the first / last / pause buttons
	if (numberOfButtonsToHide > 0){	
	    // windowWidth - WINDOW_SCROLLBAR_WIDTH < SMALL_WIDTH_THRESHHOLD
	    if ($ms.$(this.id + "a-first")) $ms.$(this.id + "a-first").style.display = "none";
	    if ($ms.$(this.id + "a-playpause")) $ms.$(this.id + "a-playpause").style.display = "none";
	    if ($ms.$(this.id + "a-last")) $ms.$(this.id + "a-last").style.display = "none";
	} else {
	    if ($ms.$(this.id + "a-first")) $ms.$(this.id + "a-first").style.display = "inline-block";
	    if ($ms.$(this.id + "a-playpause")) $ms.$(this.id + "a-playpause").style.display = "inline-block";
	    if ($ms.$(this.id + "a-last")) $ms.$(this.id + "a-last").style.display = "inline-block";
	}	
    }
    
    Slideshow.prototype.nestedButtonsDiv = function(idOuter, idInner) {
	var divOuter = $ms.$(this.id + idOuter);
	var divInner = $ms.$(this.id + idInner);
	if (!divOuter){	
	    divOuter = document.createElement("div");
	    divOuter.id = this.id + idOuter;
	    divInner = document.createElement("div");
	    divInner.id = this.id + idInner;
	    divOuter.appendChild(divInner);
	}
	return {outer: divOuter, inner: divInner};
    }    

    Slideshow.prototype.firstLink = function() {
	var a = $ms.$(this.id + "a-first");
	var img = $ms.$(this.id + "img-first");	    
	if (!img){
	    // new = load control
	    var a = document.createElement("a");
	    var img = document.createElement("img");	    
	    a.id = this.id + "a-first";
	    img.id = this.id + "img-first";
	    a.appendChild(img);
	}
	if (this.slide == 0) {
	    // disable button
	    img.className = 'ss-first-disabled sprite-32';
	    img.src = $ms.STATIC_IMG_COMMON + '/blank.gif';
	    img.alt = 'First Disabled';
	    a.onclick = function(){return false};
	    a.removeAttribute('onclick');
	} else {
	    a.title='First Image';
	    a.onclick = function(e){e.stopPropagation();this.loadslide(0, "button-first-click")}.bind(this);
	    img.className = 'ss-first sprite-32';
	    img.src = $ms.STATIC_IMG_COMMON + '/blank.gif';
	    img.alt = 'First';
	}
	return a;
    }

    Slideshow.prototype.previousLink = function() {
	var a = $ms.$(this.id + "a-prev");
	var img = $ms.$(this.id + "img-prev");	    
	if (!img){
	    // new = load control
	    var a = document.createElement("a");
	    var img = document.createElement("img");	    
	    a.id = this.id + "a-prev";
	    img.id = this.id + "img-prev";
	    a.appendChild(img);
	}
	if (this.slide == 0 && !this.settings.slideshowWrap) {
	    // disable button
	    img.className = 'ss-prev-disabled sprite-32';
	    img.src = $ms.STATIC_IMG_COMMON + '/blank.gif';
	    img.alt = 'Goto Previous Disabled';
	    a.onclick = function(){return false};
	    a.removeAttribute('onclick');
	} else {
	    a.onclick = function(e){e.stopPropagation();this.loadslide(this.slide - 1, "button-previous-click")}.bind(this);
	    a.title='Previous Image';
	    img.className = 'ss-prev sprite-32';
	    img.src = $ms.STATIC_IMG_COMMON + '/blank.gif';
	    img.alt = 'Previous';
	}
	return a;
    }

    /*
     * return a link which allows users to start a slideshow
     * */

    Slideshow.prototype.playPauseLink = function() {
	var a = $ms.$(this.id + "a-playpause");
	var img = $ms.$(this.id + "img-playpause");	    
	if (!img){
	    // new = load control
	    var a = document.createElement("a");
	    var img = document.createElement("img");	    
	    a.id = this.id + "a-playpause";
	    if (this.settings.playOnEnter){
		this.playPause("play", "init", a, img)
	    } else {
		this.playPause("pause", "init", a, img)
	    }
	    img.id = this.id + "img-playpause";
	    img.src = $ms.STATIC_IMG_COMMON + '/blank.gif';
	    a.appendChild(img);
	}
	return a;
    }

    Slideshow.prototype.playPause = function(mode, click, a, img){
	if (typeof a == "undefined"){
	    a = $ms.$(this.id + "a-playpause");
	    img = $ms.$(this.id + "img-playpause");	    
	}
	if (mode == "play"){
	    // play button pressed
	    a.title = "Pause Slideshow";
	    a.onclick = function(e){e.stopPropagation(); this.playPause("pause", "click")}.bind(this);
	    img.className = 'ss-pause sprite-32';
	    img.alt = 'Pause';
	    if (click == "click"){
		// change slide immediately
		var newSlide = 0;
		if (this.slide < this.count - 1 || this.settings.slideshowWrap){
		    newSlide = this.slide + 1;
		}
		this.loadslide(newSlide, "button-playpause-click");
	    }
	    // set timer
	    this.startSlideshow()
	} else if (mode == "pause") {
	    // pause button pressed or init without playOnEnter or zoom (which cancels)
	    a.title = "Play Slideshow";
	    a.onclick = function(e){e.stopPropagation(); this.playPause("play", "click")}.bind(this);
	    img.className = 'ss-play sprite-32';
	    img.alt = 'Play';
	    if (click == "click"){
		this.stopSlideshow();
	    }
	} else if (mode == "reset"){
	    // restart the timer
	    this.stopSlideshow();		
	    this.startSlideshow()
	}
    }

    Slideshow.prototype.nextLink = function() {
	var a = $ms.$(this.id + "a-next");
	var img = $ms.$(this.id + "img-next");	    
	if (!img){
	    // new = load control
	    var a = document.createElement("a");
	    var img = document.createElement("img");	    
	    a.id = this.id + "a-next";
	    img.id = this.id + "img-next";
	    a.appendChild(img);
	}
	if (this.slide >= this.count - 1 && !this.settings.slideshowWrap) {
	    // disable button
	    img.className = 'ss-next-disabled sprite-32';
	    img.src = $ms.STATIC_IMG_COMMON + '/blank.gif';
	    img.alt = 'Next Disabled';
	    a.onclick = function(){return false};
	    a.removeAttribute('onclick');
	} else {
	    //if clicking on previous page would take the page out of gallery view, scroll the gallery
	    a.title='Next Image';
	    a.onclick = function(e){e.stopPropagation();this.loadslide(this.slide + 1, "button-next-click")}.bind(this);
	    img.className = 'ss-next sprite-32';
	    img.src = $ms.STATIC_IMG_COMMON + '/blank.gif';
	    img.alt = 'Next';
	}
	return a;
    }

    Slideshow.prototype.lastLink = function() {
	var a = $ms.$(this.id + "a-last");
	var img = $ms.$(this.id + "img-last");	    
	if (!img){
	    // new = load control
	    var a = document.createElement("a");
	    var img = document.createElement("img");	    
	    a.id = this.id + "a-last";
	    img.id = this.id + "img-last";
	    a.appendChild(img);
	}
	if (this.slide >= this.count - 1) {
	    // disable button
	    img.className = 'ss-last-disabled sprite-32';
	    img.src = $ms.STATIC_IMG_COMMON + '/blank.gif';
	    img.alt = 'Last Disabled';
	    a.onclick = function(){return false};
	    a.removeAttribute('onclick');
	} else {
	    //clicking on last page would take the page out of gallery view, scroll the gallery
	    a.title = 'Last Image';
	    a.onclick = function(e){e.stopPropagation();this.loadslide(this.count - 1, "button-last-click")}.bind(this);
	    img.className = 'ss-last sprite-32';
	    img.src = $ms.STATIC_IMG_COMMON + '/blank.gif';
	    img.alt = 'Last';
	    //&nbsp;
	}
	return a;
    }

    Slideshow.prototype.closeLink = function() {
	var a = $ms.$(this.id + "a-close");
	var img = $ms.$(this.id + "img-close");	    
	if (!img){
	    // new = load control
	    var a = document.createElement("a");
	    var img = document.createElement("img");	    
	    a.id = this.id + "a-close";
	    img.id = this.id + "img-close";
	    a.title = 'Exit Slideshow';
	    a.onclick = function(e){this.close(e)}.bind(this);
	    img.className = 'ss-close sprite-32';
	    img.src = $ms.STATIC_IMG_COMMON + '/blank.gif';
	    img.style.width = '44px';
	    img.alt = 'Close';
	    a.appendChild(img);
	}
	return a;
    }

    // doubles as magnifier button in "magnifier" mode and "zoom in" in zoom mode
    Slideshow.prototype.magnifierLink = function() {
	var a = $ms.$(this.id + "a-zoom");
	var img = $ms.$(this.id + "img-zoom");
	if (!img){
	    var a = document.createElement("a");
	    var img = document.createElement("img");
	    a.id = this.id + "a-zoom";
	    img.id = this.id + 'img-zoom';
	    a.title = 'Zoom In (CTRL + Mouse Wheel will also zoom in and out)';
	    if (this.settings.zoomMode == "zoom"){
		// zoom mode
		a.onclick = function(e){e.stopPropagation(); this.zoomImageStart(true)}.bind(this);
	    } else {
		// magnifier mode
		a.onclick = function(e){e.stopPropagation(); this.startMagnifier(e)}.bind(this);
	    }
	    img.src = $ms.STATIC_IMG_COMMON + '/blank.gif';
	    img.alt = 'Zoom In';
	    img.className = 'ss-zoom sprite-32';
	    a.appendChild(img);	    
	}
	return a;
    }

    Slideshow.prototype.zoomOutLink = function() {
	var a = $ms.$(this.id + "a-zoomOut");
	var img = $ms.$(this.id + "img-zoom-out");
	if (!img){
	    var a = document.createElement("a");
	    var img = document.createElement("img");
	    a.id = this.id + "a-zoom-out";
	    img.id = this.id + 'img-zoom-out';
	    a.title = 'Zoom Out (CTRL + Mouse Wheel will also zoom in and out)';
	    a.onclick = function(e){e.stopPropagation(); this.zoomImageStart(false)}.bind(this);
	    img.src = $ms.STATIC_IMG_COMMON + '/blank.gif';
	    img.alt = 'Zoom Out';
	    img.className = 'ss-zoom-out sprite-32';
	    a.appendChild(img);	    
	}
	return a;
    }

    Slideshow.prototype.zoomResetLink = function() {
	var a = $ms.$(this.id + "a-zoom-reset");
	var img = $ms.$(this.id + "img-zoom-reset");
	if (!img){
	    var a = document.createElement("a");
	    var img = document.createElement("img");
	    a.id = this.id + "a-zoom-reset";
	    img.id = this.id + 'img-zoom-reset';
	    a.title = 'Zoom Reset';
	    a.onclick = function(e){e.stopPropagation(); this.resetZoom(this.divLarge[this.slide], this.img[this.slide])}.bind(this);
	    img.src = $ms.STATIC_IMG_COMMON + '/blank.gif';
	    img.alt = 'Zoom Reset';
	    img.className = 'ss-zoom-reset sprite-32';
	    a.appendChild(img);	    
	}
	return a;
    }

    Slideshow.prototype.fullScreenLink = function() {
	var a = $ms.$(this.id + "a-full");
	var img = $ms.$(this.id + "img-full");
	if (!img){
	    var a = document.createElement("a");
	    var img = document.createElement("img");
	    a.id = this.id + "a-full";
	    img.id = this.id + 'img-full';
	    a.title = 'Full Screen';
	    a.onclick = function(e){e.stopPropagation(); this.fullScreen()}.bind(this);
	    img.src = $ms.STATIC_IMG_COMMON + '/blank.gif';
	    img.alt = 'Full Screen';
	    img.className = 'ss-full-screen sprite-32';
	    a.appendChild(img);	    
	}
	return a;
    }

    Slideshow.prototype.downloadLink = function(slide) {
	var a = $ms.$(this.id + "a-download");
	var img = $ms.$(this.id + "img-download");
	if (!img){
	    a = document.createElement("a");
	    img = document.createElement("img");
	    a.id = this.id + "a-download";
	    img.id = this.id + "img-download";
	    img.style.width = '44px';
	    img.src = $ms.STATIC_IMG_COMMON + '/blank.gif';
	    a.appendChild(img);
	}
	// set download properties each time
	if (this.files[slide].downloadLink){
	    a.title = 'Download Image';
	    a.onclick = function(e){e.stopPropagation();
		var settings = {
		    divId: this.id + "download",
		    inputLinkId: this.id + "download-link",
		    iframeId: this.id + "-iframe"
		}		
		$ms.downloadfile(settings)}.bind(this);
	    img.className = 'ss-download sprite-32';
	    img.alt = 'Download';
	} else {
	    a.title = 'Download Disabled';
	    a.onclick = function(){return false};
	    a.removeAttribute('onclick');
	    img.className = 'ss-download-disabled sprite-32';
	    img.alt = 'Download Disabled';
	}
	
	return a;
    }

    Slideshow.prototype.printLink = function(slide) {
	var a = $ms.$(this.id + "a-print");
	var img = $ms.$(this.id + "img-print");	    
	if (!img){
	    a = document.createElement("a");
	    img = document.createElement("img");
	    a.id = this.id + "a-print";
	    img.id = this.id + "img-print";
	    a.title = 'Print Image';
	    img.className = 'ss-print sprite-32';
	    img.style.width = '44px';
	    img.src = $ms.STATIC_IMG_COMMON + '/blank.gif';
	    img.alt = 'Print';
	    a.appendChild(img);
	}
	a.onclick = function(e){
		e.stopPropagation();
		$ms.printDiv(this.divLarge[slide].id);
		if (typeof this.logPrintFn !=="undefined"){
		    this.files[slide].logPrintFn;
		}
		return false}.bind(this);
	return a;
    }

    Slideshow.prototype.locateLink = function(slide) {
	var a = $ms.$(this.id + "a-locate");
	var img = $ms.$(this.id + "img-locate");
	if (!a){
	    a = document.createElement("a");
	    img = document.createElement("img");
	    a.id = this.id + "a-locate";
	    img.id = this.id + "img-locate";
	    img.style.width = '44px';
	    img.src = $ms.STATIC_IMG_COMMON + '/blank.gif';
	    a.appendChild(img);
	}
	// set locate properties each time
	if (this.files[slide].locateLink){
	    a.title = 'Locate Post for Image';
	    a.href = this.files[slide].locateLink;
	    a.onclick = function(e){this.close(e)}.bind(this);
	    img.className = 'ss-locate sprite-32';
	    img.alt = 'Locate Post';
	} else {
	    a.title = 'Locate Post Disabled';
	    a.removeAttribute('href');
	    a.onclick = function(){return false};
	    a.removeAttribute('onclick');
	    img.className = 'ss-locate-disabled sprite-32';
	    img.alt = 'Locate Post Disabled';
	}
	return a;
    }
    Slideshow.prototype.emptylink = function(aid, imgid) {
	var a = $ms.$(aid);
	var img = $ms.$(imgid);	    
	if (!a){
	    var a = document.createElement("a");
	    var img = document.createElement("img");
	    a.id = aid;
	    img.id = imgid;
	    img.className = 'ss-empty sprite-32';
	    img.style.width = '44px';
	    img.src = $ms.STATIC_IMG_COMMON + '/blank.gif';
	    img.alt = 'Empty Button';
	    a.appendChild(img);
	    }
	return a;
    }

    // the next button which appears on the large image
    Slideshow.prototype.nextLinklarge = function(img) {
	var a = $ms.$(this.id + "a-next-large");
	img = $ms.$(this.id + "img-next-large");
	if (!img){
	    // new = load control
	    var a = document.createElement("a");
	    img = document.createElement("img");
	    a.id = this.id + "a-next-large";
	    a.className = "ss-next-large";
	    img.id = this.id + "img-next-large";
	    a.appendChild(img);
	}
	//if clicking on previous page would take the page out of gallery view, scroll the gallery
	a.title='Next Image';
	a.onclick = function(e){e.stopPropagation();this.loadslide(this.slide + 1, "button-next-click")}.bind(this);
	img.className = 'ss-next-large sprite-90';
	img.src = $ms.STATIC_IMG_COMMON + '/blank.gif';
	img.alt = 'Next';
	return {img:img, a:a};
    }

    // the prev button which appears on the large image
    Slideshow.prototype.prevlinklarge = function(img) {
	var a = $ms.$(this.id + "a-prev-large");
	img = $ms.$(this.id + "img-prev-large");
	if (!img){
	    // new = load control
	    var a = document.createElement("a");
	    img = document.createElement("img");
	    a.id = this.id + "a-prev-large";
	    a.className = "ss-prev-large";
	    img.id = this.id + "img-prev-large";
	    a.appendChild(img);
	}
	//if clicking on previous page would take the page out of gallery view, scroll the gallery
	a.title='Next Image';
	a.onclick = function(e){e.stopPropagation();this.loadslide(this.slide - 1, "button-previous-click")}.bind(this);
	img.className = 'ss-prev-large sprite-90';
	img.src = $ms.STATIC_IMG_COMMON + '/blank.gif';
	img.alt = 'Next';
	return {img:img, a:a};
    }
    
    Slideshow.prototype.closeLinklarge = function() {
	var a = $ms.$(this.id + "a-close-large");
	var img = $ms.$(this.id + "img-close-large");	    
	if (!img){
	    // new = load control
	    var a = document.createElement("a");
	    var img = document.createElement("img");	    
	    a.id = this.id + "a-close-large";
	    a.className = 'ss-close-large'
	    img.id = this.id + "img-close-large";
	    img.className = 'ss-close-large';
	    a.title = 'Exit Slideshow';
	    a.onclick = function(e){this.close(e)}.bind(this);
	    img.src = $ms.STATIC_IMG_COMMON + '/blank.gif';
	    img.style.width = '22px';
	    img.alt = 'Close';
	    a.appendChild(img);
	}
	return {img:img, a:a};
    }
    
    Slideshow.prototype.createSpace = function(px, spaceCounter) {
	var a = $ms.$(this.id + "a-space" + spaceCounter);
	var img = $ms.$(this.id + "img-space" + spaceCounter);
	if (!img){
	    var a = document.createElement("a");
	    var img = document.createElement("img");
	    a.id = this.id + "a-space" + spaceCounter;
	    a.title = "";
	    img.id = this.id + "img-space" + spaceCounter;
	    img.style.width = px + 'px';
	    img.style.height = '32px';
	    img.src = $ms.STATIC_IMG_COMMON + '/blank.gif';
	    a.appendChild(img);
	}
	return a;
    }
    
    Slideshow.prototype.otherLink = function(slide) {
	// used for feedback & rating
	var a = $ms.$(this.id + "a-feedback");
	var img = $ms.$(this.id + "img-feedback");	    
	if (!img){
	    var a = document.createElement("a");
	    var img = document.createElement("img");
	    a.id = this.id + "a-feedback";
	    img.id = this.id + "img-feedback";
	    img.style.width = '44px';
	    img.src = $ms.STATIC_IMG_COMMON + '/blank.gif';
	    a.appendChild(img);
	}
	if (this.files[slide].otherLink && this.files[slide].otherLink.length > 0){
	    var href = this.files[slide].otherLink;
	    a.title = "Enter Feedback & Rating";
	    a.onclick = function(e){
		    window.location.href = href;
		    this.close(e);
		    return false;
		    }.bind(this);
	    img.className = 'ss-feedback sprite-32';
	    img.alt = 'Enter Feeback';
	} else {
	    a.removeAttribute('href');
	    a.title = "Feedback & Rating Disabled";
	    a.onclick = function(){return false};
	    a.removeAttribute('onclick');
	    img.className = 'ss-feedback-disabled sprite-32';
	    img.alt = 'Enter Feeback Disabled';
	}
	return a;
    }

    Slideshow.prototype.slidePositionText = function(i) {
	return "(" + (i + 1) + " / " + this.count + ")";
    }
    
    Slideshow.prototype.line1Text = function(slide){
	return (typeof this.files[slide].line1Text == "undefined" ? "" : this.files[slide].line1Text);
    }
    
    Slideshow.prototype.line2Text = function(slide){
	return (typeof this.files[slide].line2Text == "undefined" ? "" : this.files[slide].line2Text);
    }
    
    Slideshow.prototype.scrolldiv = function(divThumb){
	// scroll UL to make li visible
	// li can be the li element or its id
	if (typeof divThumb !== "object"){
	    divThumb = $ms.$(divThumb);
	}
	var fudge = 5;
	// left most position needed for viewing thumbdiv
	var right = (this.divFilmstrip.scrollLeft + (this.divFilmstrip.offsetWidth - fudge) - divThumb.offsetWidth);
	// right most position needed for viewing thumbdiv
	var left = this.divFilmstrip.scrollLeft + fudge;
	if (divThumb.offsetLeft <= left){
	    // move thumb div to left most position if to the left of viewing area
	    // use algebra to solve for scrollLeft
	    this.divFilmstrip.scrollLeft = divThumb.offsetLeft - fudge;
	} else if (divThumb.offsetLeft >= right) {
	    // move thumb div to right most position if to the righ of viewing area
	    // use algebra to solve for scrollLeft
	    this.divFilmstrip.scrollLeft = divThumb.offsetLeft - ((this.divFilmstrip.offsetWidth - fudge) - divThumb.offsetWidth) + 36 ;
	}
    }

    Slideshow.prototype.fullScreen = function(){
	// toggle full screen based on press
	if (this.isFullScreen) {
	    // return to normal
	    $ms.cancelFullScreen()
	    this.isFullScreen = false;
	    // toggle fullscreen buttons
	    $ms.removeClass($ms.$(this.id + "img-full"), "ss-exit-full-screen");
	    $ms.addClass($ms.$(this.id + "img-full"), "ss-full-screen");
	} else {
	    // make full screen
	    // save width
	    $ms.requestFullScreen(this.divWrapper);	//this.settings.container
	    this.isFullScreen = true;
	    
	    // toggle fullscreen buttons
	    $ms.removeClass($ms.$(this.id + "img-full"), "ss-full-screen");
	    $ms.addClass($ms.$(this.id + "img-full"), "ss-exit-full-screen");
	}
	// resize divs and images
	this.resetZoom();
	this.resize();
	this.fitButtons();
	this.centerImage(this.slide);
	this.resetCurrentSlidePosition();
    }
    
    Slideshow.prototype.startMagnifier = function(e){
	var divMagnifier = $ms.$(this.id + "magnifier");
	if (divMagnifier){
	    // close the magnifier if already open    
	    this.closeMagnifier();	    
	} else {
	    var span = $ms.$(this.id + "buttons-large");
	    this.divLarge[this.slide].style.cursor = "pointer";
	    divMagnifier = document.createElement("div");
	    divMagnifier.id = this.id + "magnifier";
	    divMagnifier.className = "ss-magnifier";
	    this.divLarge[this.slide].appendChild(divMagnifier);
	    $ms.addClass(span, "display-none");
	    // capture mousewheel event to zoom in or out
	    this.capturemousewheel(true);
	    
	    // make sure external mag can be seen
	    if (this.settings.divExternalMagnifier){
		this.settings.divExternalMagnifier.style.zIndex = parseInt(getComputedStyle($ms.$(this.id + 'opaque')).getPropertyValue("z-index")) + 1;
	    }
	    // start the magnifier
	    var settings = {
		initMagZoom: this.settings.initMagZoom,
		magnifierStyles: this.settings.magnifierStyles,
		divMagnifier: divMagnifier, 
		container: this.divLarge[this.slide], 
		img: this.img[this.slide], 
		divExternalMagnifier: this.settings.divExternalMagnifier,
		magnifierSize: this.settings.magnifierSize
	    };
	    this.objMagnifier = new $msRoot.Slideshow.Magnifier(settings);
	    this.objMagnifier.initmagnifier()
	    this.objMagnifier.moveMagnifier(e);
	}
    }
    
    Slideshow.prototype.closeMagnifier = function(){
	var divMagnifier = $ms.$(this.id + "magnifier");
	var span = $ms.$(this.id + "buttons-large");
	if (divMagnifier){
	    $ms.removeClass(span, "display-none");
	    divMagnifier.parentNode.removeChild(divMagnifier);
	    this.magZoom = this.settings.initMagZoom;	    
	    this.objMagnifier.removelistener();
	    this.objMagnifier.close();
	    this.objMagnifier = null;
	    this.capturemousewheel(false);
	    // flag magnifier was open
	    return true;
	}
	return false;
    }
    
    Slideshow.prototype.capturemousewheel = function(capture){
	if (typeof this.wheelListener == "undefined"){
	    this.wheelListener = function(e){this.wheel(e)}.bind(this);
	}
	
	if (window.onmousewheel !== undefined) {
	    // chrome
	    // IE/Opera
	    if (capture){
		window.addEventListener('mousewheel', this.wheelListener)
	    } else {
		window.removeEventListener('mousewheel', this.wheelListener);
	    }
	} else if (window.onwheel !== undefined) {
	    // firefox
	    if (capture){
		window.addEventListener('DOMMouseScroll', this.wheelListener, false)
	    } else {
		window.removeEventListener('DOMMouseScroll', this.wheelListener);
	    }
	} else {
	    // unsupported browser
	}
    }
    

    /** Event handler for mouse wheel event.
     */
    Slideshow.prototype.wheel = function(event){
	// with ctrl scroll, zoom
	if (!event.ctrlKey){	    
	    // regular scroll event - scroll window
	    return;
	}
	var delta = 0;
	if (!event) /* For IE. */
		event = window.event;
	if (event.wheelDelta) { /* IE/Opera. */
		delta = event.wheelDelta/120;
	} else if (event.detail) { /** Mozilla case. */
		/** In Mozilla, sign of delta is different than in IE.
		 * Also, delta is multiple of 3.
		 */
		delta = -event.detail/3;
	}
	/** If delta is nonzero, handle it.
	 * Positive Delta = wheel scrolled up,
	 * Negative Delte = wheel scrolled down.
	 */
	if (delta){
	    // will pass 1 to zoom in and -1 to zoom out	    
	    delta = delta / Math.abs(delta)
	    if ($ms.$(this.id + "magnifier")){
		this.zoomMagnifier(event, delta);
	    } else {
		this.zoomImageStart(delta == 1);
	    }
	}
	if (event.preventDefault){
	    event.preventDefault();
	}
	event.returnValue = false;
    }
    
    Slideshow.prototype.zoomMagnifier = function(e, direction){	
	if (this.objMagnifier){
	    this.objMagnifier.zoomMagnifier(e, direction);
	}
    }
    
    Slideshow.prototype.resizeWindow = function(init){
	// this is called when slideshow is initialized
	if (this.isFullScreen){
	    if (!(document.fullscreenElement ||
		    document.webkitFullscreenElement ||
		    document.mozFullScreenElement ||
		    document.msFullscreenElement)){
		// exited fullscreen with method other than click
		// toggle fullscreen off
		this.fullScreen();
	    }
	    this.resize();
	    this.fitButtons();
	    this.centerImage(this.slide);
	    this.resetCurrentSlidePosition();
	} else if (this.isTouch && this.touch.distance > 0){
	    // ignore pinch resize events
	    this.fitButtons();
	} else {
	    this.resize();
	    this.fitButtons();
	    this.centerImage(this.slide);
	    this.resetCurrentSlidePosition();
	}
	this.orientation == screen.orientation;
	if (this.zoom !== 1){
	    this.zoom = 1;
	    this.resetZoom();
	}
	if (!init)
	    // remove wait animation style sheet so when play the animation, position will be recalculated
	    this.stopWait("remove");
    }   
      
    Slideshow.prototype.keypress = function(e){
	if (e.stopPropagation) e.stopPropagation();
	switch(e.keyCode) {
	    case 13:
		// this.keydownEnter(e);
		break;
	    case 27:
		// escape with magnifier open, closes only magnifier
		if (this.closeMagnifier()) return;
		// escape otherwise closes slideshow if allowed
		if (this.settings.escapeKeyCloses) this.close(e);
		break;
	    case 37:    // left
		e.preventDefault();
		this.loadslide(this.slide - 1, "keypress-previous");
		break;
	    case 38:    // up
		break;
	    case 39:    // right
		e.preventDefault();
		this.loadslide(this.slide + 1, "keypress-next");
		break;
	    case 40:    // down
		break;
	}
    }
    
    Slideshow.prototype.zoomImage = function(e) {
	if (this.movedImage){
	    // with moving of image, don't register as click
	    this.movedImage = false;
	    return;
	}
	if (this.settings.zoomMode == "magnifier"){
	    this.zoomMagnifier(e, e.ctrlKey ? -1: 1);
	    return;
	}
	
	if ($ms.hasClass(this.divLarge[this.slide], "move-next-" + this.slide) || $ms.hasClass(this.divLarge[this.slide], "move-prev-" + this.slide)){
	    if (this.zoom !== 1){
		v("zoom !== 1 with zoomImage: ");
		this.zoom = 1;
	    }
	    this.resetCurrentSlidePosition();
	}
	if (this.slideShowRunning){
	    // with click on image or other zoom button - stop the slideshow
	    this.playPause("pause", "click");
	}
	
	var direction = 1;
	if (e.ctrlKey){
	    direction = -1;
	}
	var oldZoom = this.zoom;
	this.zoom += direction * .2;
	// range = 50% => 600%
	this.zoom = $ms.round(Math.min(6, Math.max(1, this.zoom)), 1);

	if (this.zoom == 1){
	    // For a zoom = 1, we reset
	    this.resetZoom(this.divLarge[this.slide], this.img[this.slide]);
	    return;
	}

	// make the position of the mouseclick the center, 
	// or as close as can with keeping maximum image viewable
	// e == divLarge[this.slide]
	// gets the top and left of the divLarge
	var divOffset = $ms.getOffset(this.divLarge[this.slide]);
	var imgStyles = getComputedStyle(this.img[this.slide]);
	var imgOffset = {x: parseInt(imgStyles.left), y: parseInt(imgStyles.top)};

	// where clicked relative in div
	var yTravel = e.pageY - divOffset.y;
	var xTravel = e.pageX - divOffset.x;

	// where clicked
	var xOldImg = -imgOffset.x + xTravel;
	var yOldImg = -imgOffset.y + yTravel;

	// the clicked position relative to the image 0,0
	// clicked position will remain at the cursor position while image zoom changes
	
	// calc the same position at the new zoom level
	var ratio = this.zoom / oldZoom;
	var xNewImg = xOldImg * ratio;
	var yNewImg = yOldImg * ratio;
	
	// calc new top / left
	var xStart = -(xNewImg - xTravel);
	var yStart = -(yNewImg - yTravel);
	
	this.img[this.slide].style.height = parseInt(this.divLarge[this.slide].style.height) * (this.zoom) + "px";
	this.img[this.slide].style.width = parseInt(this.divLarge[this.slide].style.width) * (this.zoom) + "px" ;
	
	this.img[this.slide].style.top = yStart  + "px";
	this.img[this.slide].style.left = xStart + "px";
	this.img[this.slide].style.cursor = "grab";
    }
    
    Slideshow.prototype.resetZoom = function(divLarge, img) {
	if (typeof divLarge == "undefined"){
	    divLarge = this.divLarge[this.slide];
	    img = this.img[this.slide];
	}
	img.style.top = "0px";
	img.style.left = "0px";
	img.style.height = divLarge.style.height;
	img.style.width = divLarge.style.width;
	img.style.cursor = "default";
	this.zoom = 1;
    }
    
    Slideshow.prototype.zoomImageStart = function(zoomIn){
	var e = {};
	// simulate ctrl click if delta is negative
	// ctrlKey = true is zoom out
	e.ctrlKey = !zoomIn;
	// simulate click in the center of the displayed portion of the image
	var divRect = this.divLarge[this.slide].getBoundingClientRect();
	var divOffset = $ms.getOffset(this.divLarge[this.slide]);
	
	e.pageX = divOffset.x + divRect.width / 2;
	e.pageY = divOffset.y + divRect.height / 2;
	this.zoomImage(e);
    }
    
    Slideshow.prototype.mousedown = function(e, div, i){
	if (this.zoom == 1){
	    return;
	}
	e.stopPropagation();
	// prevent default drag behavior
	e.preventDefault();
	this.moveInit = {};
	this.moveInit.pageX = e.pageX;
	this.moveInit.pageY = e.pageY;
	this.moveInit.div = div;
	
	this.moveInit.img = this.img[i];
	this.moveInit.imgOffset = $ms.getOffset(this.img[i]);
	var styles = getComputedStyle(this.img[i]);
	this.moveInit.left = styles.left;
	this.moveInit.top = styles.top ;
	this.moveInit.i = i;
	this.moveInit.divOffset = $ms.getOffset(div);
	this.mousemoveListener = function(e){this.mousemove(e)}.bind(this);
	div.addEventListener('mousemove', this.mousemoveListener, false); 
	this.mouseupListener = function(e){this.mouseup(e, div, i)}.bind(this);
	div.addEventListener('mouseup', this.mouseupListener, false);
    }    
    Slideshow.prototype.mouseup = function(e, div, i){
	if (this.zoom == 1){
	    return;
	}
	e.stopPropagation();
	div.removeEventListener('mousemove', this.mousemoveListener); 
	this.moveInit = {};
	div.removeEventListener('mouseup', this.mouseupListener);
    }    
    Slideshow.prototype.mousemove = function(e){
	if (this.zoom == 1){
	    return;
	}
	if (typeof this.moveInit.pageX == "undefined"){
	    return;
	}
	this.movedImage = true;
	var yTravel = (e.pageY - this.moveInit.pageY);
	var xTravel = (e.pageX - this.moveInit.pageX);
	this.moveInit.img.style.top = (parseInt(this.moveInit.top) + yTravel) + "px";
	this.moveInit.img.style.left = (parseInt(this.moveInit.left) + xTravel) + "px";
    }    
    
    Slideshow.prototype.adjustImageSizeForBorder = function(img){
	var styles = getComputedStyle(img);
	// if image has borders, reduce its size so the border will show in the div
	img.style.height = parseInt(img.style.height) - 
		(Math.ceil(parseFloat(styles.borderTopWidth)) + 
		Math.ceil(parseFloat(styles.borderBottomWidth)))  + "px";
	img.style.width = parseFloat(img.style.width) - 
		(Math.ceil(parseFloat(styles.borderLeftWidth)) + 
		Math.ceil(parseFloat(styles.borderRightWidth)))  + "px";
    }
    
    Slideshow.prototype.startSlideshow = function() {
	var newSlide;
	//var last = +new Date;;
	var last;
	this.slideShowRunning = true;
	function loop(now) {
	    if (!last) last = now;
	    // stop the loop if fn returned false
	    if (this.slideShowRunning) {
		var deltaT = now - last;
		if (deltaT > this.settings.slideshowInterval){
		    if (this.slide < this.count - 1 || this.settings.slideshowWrap){
			newSlide = this.slide + 1;
			this.loadslide(newSlide, "button-playpause-auto");
		    }
		    if (this.slide >= this.count - 1 && !this.settings.slideshowWrap){
			// stop when get to last slide
			this.playPause("pause", "click");
			this.slideShowRunning = false;
			return;
		    }
		    last = now;
		}
		// loop until cancelled
		var boundLoop = loop.bind(this);
		var raf = requestAnimationFrame.bind(window);
		this.ssRafId = raf(function(){boundLoop(Date.now())});
	    }
	}
	var boundLoop = loop.bind(this);
	var raf = requestAnimationFrame.bind(window);
	this.ssRafId = raf(function(){boundLoop(Date.now())});
    }
    
    Slideshow.prototype.stopSlideshow = function() {
	this.slideShowRunning = false;
	var cancelRaf = cancelAnimationFrame.bind(window);
	cancelRaf(this.ssRafId);
	this.ssRafId = undefined;
    }
    
    Slideshow.prototype.calcMarginX = function(largeSize) {
	return (parseFloat(this.divWrapper.style.width) - parseFloat(largeSize.displayWidth)) / 2;
    }
    
    Slideshow.prototype.calcMarginY = function(largeSize) {
	return (parseFloat(this.divMiddle.style.height) - TEXTHEIGHT - parseFloat(largeSize.displayHeight)) / 2;
    }
    
    /* Inspired by Handel Eugene --> (https://dribbble.com/shots/1763719-DNA-GIF) */
    /* CSS by Troshkin Pavel --> troshkin.pavel@yandex.ru --> original css at http://codepen.io/Maseone/pen/rGapf*/
    Slideshow.prototype.wait = function(waitAnimation) {
	if (typeof waitAnimation == "undefined"){
	    // only show wait on first entering or upon request
	    // otherwise it is an annoying flash
	    return;
	} else if (waitAnimation == 2){
	    if (this.settings.waitAnimation !== waitAnimation){
		this.stopWait("remove");
		this.settings.waitAnimation = waitAnimation;
		divWait = document.createElement("div");
		divWait.id = this.id + "wait-gif";
		divWait.className = "ss-wait ss-loading ss-loading-circle";
		this.divMiddle.appendChild(divWait);
	    }
	    return;
	} else if ($ms.$(this.id + "wait-gif")){
	    // remove loading gif
	    $ms.$(this.id + "wait-gif").parentNode.removeChild($ms.$(this.id + "wait-gif"));
	}
	
	var divLine, divDotted, spanCircle, spanDot, divWait;
	var colors = [];
	colors.push({});
	colors.push({line: "rgb(36,16,203)", spanDot: "rgb(212,20,30)" });
	colors.push({line: "rgb(133,45,244)", spanDot: "rgb(252,126,72)" });
	colors.push({line: "rgb(244,45,241)", spanDot: "rgb(237,235,41)" });
	colors.push({line: "rgb(249,19,150)", spanDot: "rgb(172,237,41)" });
	colors.push({line: "rgb(212,20,30)", spanDot: "rgb(78,240,43)" });
	colors.push({line: "rgb(252,126,72)", spanDot: "rgb(56,231,144)" });
	colors.push({line: "rgb(237,235,41)", spanDot: "rgb(37,234,204)" });
	colors.push({line: "rgb(172,237,41)", spanDot: "rgb(48,156,223)" });
	colors.push({line: "rgb(78,240,43)", spanDot: "rgb(37,68,231)" });
	colors.push({line: "rgb(56,231,144)", spanDot: "rgb(133,45,244)" });
	colors.push({line: "rgb(37,234,204)", spanDot: "rgb(244,45,241)" });

	if (typeof waitAnimation == "undefined") {
	    waitAnimation = this.settings.waitAnimation;
	} else if (this.settings.waitAnimation !== waitAnimation){
	    this.stopWait("remove");
	    this.settings.waitAnimation = waitAnimation;
	}
	if ($ms.$(this.id + "waitStyleSheet") && $ms.$(this.id + "wait")){
	    $ms.$(this.id + "wait").style.display = "block";
	    for (var i = 1; i <= 11; i++){
		$ms.removeClass($ms.$(this.id + "line" + i), "ss-wait-animation-paused");
	    }
	    return;
	} else {
	    var style = document.createElement("style");
	    style.id = this.id + "waitStyleSheet";
	    // WebKit hack
	    style.appendChild(document.createTextNode(""));
	    document.head.appendChild(style);
	    var rule =  ".ss-wait-animation-paused {animation-play-state: paused}";
	    style.sheet.insertRule(rule, 0);
	}
	
	divWait = document.createElement("div");
	divWait.id = this.id + "wait";
	divWait.className = "ss-wait";
	divWait.style.width = "350px";
	divWait.style.height = "350px";
	for (var i = 1; i <= 11; i++){
	    divLine = document.createElement("div");
	    divLine.className = "ss-wait-line ss-wait-line" + i;
	    divLine.id = this.id + "line" + i;
	    
	    spanCircle = document.createElement("span");
	    spanCircle.className = "ss-wait-circle ss-wait-circle-top";
	    divLine.appendChild(spanCircle);
	    
	    spanCircle = document.createElement("span");
	    spanCircle.className = "ss-wait-circle ss-wait-circle-bottom";
	    divLine.appendChild(spanCircle);
	    
	    divWait.appendChild(divLine);
	    // build in a .25 second delay
	    var delay = 0;
	    var totalTime;
	    if (waitAnimation == 0){
		totalTime = 5;
	    } else if (waitAnimation == 1){
		// orig
		totalTime = 20;
	    } else {
		return;
	    }
	    var rule =  ".ss-wait-line" + i + "{" + 
		    "margin-left: " + i * 35 + "px;" +
		    "background-color: " + colors[i].line + ";" + 
		    prefix + "animation: ss-wait-line " + totalTime + "s cubic-bezier(0.250, 0, 0.705, 1) " + (((i+1) * .25) + delay) +  "s infinite;" + 
		    "}";
	    style.sheet.insertRule(rule, 0);
	    
	    var rule =  ".ss-wait-line" + i + "::before{content: '" + "PLEASE WAIT".substr(i-1, 1) + "'; line-height: 120px; font-size: 200%; color: " + colors[i].spanDot + "; }";
	    style.sheet.insertRule(rule, 0);
	    
	    rule =  ".ss-wait-line" + i + " > span {" +
		    "background-color: " + colors[i].spanDot + ";" + 
		    "}";
	    style.sheet.insertRule(rule, 0);
	    
	    if (waitAnimation == 0){
		// 180 Please Wait
		var ruleKeyframes = "@" + prefix + "keyframes ss-wait-line{" + 
		    "0%{height: 4px; top: 0px; left: 0px; transform: rotate(-65deg)}" +
		    "10%{height: 220px; top: -110px; left: 15px;}" +
		    "45%{height: 200px; top: -100px; left: 25px;}" +
		    "70%{height: 8px; top: 0px; left: 25px; transform: rotate(0deg);}" +
		    "100%{height: 8px; top: 0px; left: 15px; transform: rotate(0deg);}" +
		"}";
		style.sheet.insertRule(ruleKeyframes, 0);
	    } else if (waitAnimation == 1){
		// 360 Please Wait
		var ruleKeyframes = "@" + prefix + "keyframes ss-wait-line{" + 
		    "0%{height: 4px; top: 0px; left: 0px; transform: rotate(-65deg)}" +
		    "2.5%{height: 220px; top: -110px;}" +
		    "11.25%{height: 200px; top: -100px;}" +
		    "17.5%{height: 8px; top: 0px; left: 15px; transform: rotate(0deg); }" +
		    "24%{height: 8px; top: 0px; left: 25px; transform: rotate(0deg);}" +

		    "26%{height: 4px; top: 0px; left: 25px; transform: rotate(25deg)}" +
		    "27.5%{height: 220px; top: -110px; left: 15px;}" +
		    "36.25%{height: 200px; top: -100px;}" +
		    "42.5%{height: 8px; top: 0px; transform: rotate(90deg);}" +
		    "49%{height: 4px; top: 0px; left: 0px; transform: rotate(90deg);}" +

		    "51%{height: 4px; top: 0px; left: 0px; transform: rotate(115deg)}" +
		    "52.5%{height: 220px; top: -110px;}" +
		    "61.5%{height: 200px; top: -100px;}" +
		    "67.5%{height: 8px; top: 0px; left: 15px; transform: rotate(180deg); }" +
		    "74%{height: 8px; top: 0px; left: 25px; transform: rotate(180deg);}" +

		    "76%{height: 4px; top: 0px; left: 25px; transform: rotate(205deg)}" +
		    "77.5%{height: 220px; top: -110px; left: 15px; }" +
		    "86.25%{height: 200px; top: -100px;}" +
		    "92.5%{height: 8px; top: 0px; left: 0px; transform: rotate(270deg);}" +
		    "100%{height: 8px; top: 0px; left: 0px; transform: rotate(270deg);}" +
		"}";
		style.sheet.insertRule(ruleKeyframes, 0);
	    }
	}
	var containerWidth, containerHeight;
	var waitHeight = parseInt(divWait.style.height);
	var waitWidth = parseInt(divWait.style.width);
	var offset = $ms.getOffset(this.settings.container);
	var containerTop = offset.y - $ms.getScroll().y;
	var containerLeft = offset.x - $ms.getScroll().x;
	var availHeight = Math.min(window.innerHeight, offset.height);
	var availWidth = Math.min(window.innerWidth, offset.width);
	var waitTop = (availHeight- (containerTop + waitHeight)) / 2;
	var waitLeft = (availWidth - (containerLeft + waitWidth)) / 2;
	
	divWait.style.marginLeft = (waitLeft - 65) + "px"; 
	divWait.style.marginTop = Math.max(100, waitTop + 100) + "px";
	this.divMiddle.appendChild(divWait);
    }
    Slideshow.prototype.stopWait = function(show) {
	if ($ms.$(this.id + "waitStyleSheet") && $ms.$(this.id + "wait")){
	    if (show === "remove"){
		$ms.$(this.id + "waitStyleSheet").parentNode.removeChild($ms.$(this.id + "waitStyleSheet"));
		$ms.$(this.id + "wait").parentNode.removeChild($ms.$(this.id + "wait"));
		return;
	    }
	    for (var i = 1; i <= 11; i++){
		$ms.addClass($ms.$(this.id + "line" + i), "ss-wait-animation-paused");
	    }
	    if (!show){
		$ms.$(this.id + "wait").style.display = "none";
	    }
	} else if ($ms.$(this.id + "wait-gif")){
	    // remove loading gif
	    $ms.$(this.id + "wait-gif").parentNode.removeChild($ms.$(this.id + "wait-gif"));
	}
    }

    Slideshow.prototype.resetCurrentSlidePosition = function(show) {
	// remove animation classes and set proper left to center without animation
	this.divLarge[this.slide].style.left = this.calcMarginX(this.largeSize[this.slide]) + "px";
	$ms.removeClass(this.divLarge[this.slide], "move-next-" + this.slide);
	$ms.removeClass(this.divLarge[this.slide], "move-prev-" + this.slide);
	$ms.removeClass(this.divLarge[this.slide], "move-next-old" + this.slide);
	$ms.removeClass(this.divLarge[this.slide], "move-prev-old" + this.slide);
	$ms.removeClass(this.divLarge[this.slide], "ss-size-move-next-old-" + this.slide), 
	$ms.removeClass(this.divLarge[this.slide], "ss-size-move-prev-old-" + this.slide), 
	$ms.removeClass(this.divLarge[this.slide], "ss-size-move-next-" + this.slide), 
	$ms.removeClass(this.divLarge[this.slide], "ss-size-move-prev-" + this.slide)	
    }   

    Slideshow.prototype.shortFilename = function(file){
    // return name part of filename without path or extension
	if (typeof file == "undefined"){
	    return;
	}
	var shortfile = file.substr(file.lastIndexOf('/') + 1); 
	if (shortfile.lastIndexOf(".") != -1){
	    shortfile = shortfile.substring(0, shortfile.lastIndexOf("."));
	}
       return shortfile;
    }	        

return Slideshow;

})();


/************************************
 * Magnifier
 */
$msRoot.Slideshow.Magnifier = (function(settings){
    var instance = [];
    var instanceCounter = 0;
    var defaultSettings = {
	initMagZoom: 4,		// 400%	
	magnifierStyles: undefined,
	magnifierSize: {
	    height: 100,
	    width: 100
	},
	divMagnifier: undefined,
	container: undefined, 
	img: undefined, 
	divExternalMagnifier: undefined
    }
    Magnifier.getInstance = function(instanceId){
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
    
    function Magnifier(settings){
	this.settings = $ms.cloneSettings(defaultSettings, settings);
	this.magZoom = this.settings.initMagZoom;
	this.id = "ms-magnifier" + instanceCounter++ + "-";
	instance.push(this);
	// this.moveMagnifierListener;
    }   
    
    Magnifier.prototype.initmagnifier = function(){
	this.settings.divMagnifier.style.height = parseInt(this.settings.magnifierSize.height) + "px";
	this.settings.divMagnifier.style.width = parseInt(this.settings.magnifierSize.width) + "px";
	this.imgCopy = document.createElement("img");
	this.imgCopy.id = this.id + "imagecopy";
	this.externalState = {created: false, visibilityHidden: false, displayNone: false, displayNoneClass: false};
	if (this.settings.divExternalMagnifier){
	    // use an inner magnifier that we can hide - independent of external
	    if (typeof this.settings.divExternalMagnifier !== "object"){
		this.externalState.created = true;
		this.settings.divExternalMagnifier = document.createElement("div");
		this.settings.divExternalMagnifier.style.border = "1px solid black";
		this.settings.divExternalMagnifier.style.position = "absolute";
		this.settings.divExternalMagnifier.style.overflow = "hidden";
		document.body.appendChild(this.settings.divExternalMagnifier);
		//this.settings.divExternalMagnifier.id = this.id + "external-magnifier;
	    } else {
		// save the state of any external div
		if (getComputedStyle(this.settings.divExternalMagnifier).getPropertyValue("visibility") == "hidden"){
		    this.settings.divExternalMagnifier.style.visibility = "visible";
		    this.externalState.visibilityHidden = true;
		} else if (getComputedStyle(this.settings.divExternalMagnifier).getPropertyValue("display") == "none"){
		    this.settings.divExternalMagnifier.style.display = "block";
		    this.externalState.displayNone = true;
		} else if ($ms.hasClass(this.settings.divExternalMagnifier, "display-none")){
		    $ms.removeClass(this.settings.divExternalMagnifier, "display-none");
		    this.externalState.displayNoneClass = true;
		}
		this.settings.divExternalMagnifier.style.overflow = "hidden";
	    }
	    this.settings.divExternalMagnifier.appendChild(this.imgCopy);
	    if (this.settings.magnifierStyles){
		for (var setting in this.settings.magnifierStyles){
		    if (typeof this.settings.magnifierStyles[setting] !== "undefined"){
			this.settings.divExternalMagnifier.style[setting] = this.settings.magnifierStyles[setting];
		    }
		}
	    }
	    this.imgCopy.style.position = "absolute";
	} else {
	    this.settings.divMagnifier.appendChild(this.imgCopy);
	}
	
	
	this.moveMagnifierListener = function(e){
		this.moveMagnifier(e)
	    }.bind(this);
	this.settings.container.addEventListener("mousemove", this.moveMagnifierListener, false);
	var src = this.settings.img.src;
	this.imgCopy.src = src;
	var src2 = this.imgCopy.src;

	this.imgCopy.height = this.settings.img.height * this.magZoom;
	this.imgCopy.width = this.settings.img.width * this.magZoom ;
    }

    Magnifier.prototype.zoomMagnifier = function(e, direction){	
	if (this.settings.divMagnifier){
	    // only allow zoom range from 1 - 4
	    // scroll zoom in .1 increments
	    this.magZoom += direction * .2;
	    this.magZoom = Math.min(10, Math.max(1.0, this.magZoom));
	    
	    this.imgCopy.height = this.settings.img.height * this.magZoom;
	    this.imgCopy.width = this.settings.img.width * this.magZoom ;
	    this.moveMagnifier(e);
	}
    }

    Magnifier.prototype.moveMagnifier = function(e) {
    //v(this.magZoom);    
	// mouse position (e.pageX / e.pageY) is of the CONTAINER
	// but is relative to browser's top-left corner
	// mouse position is from CONTAINER
	// position needs to be adjusted for WRAPPER & CONTAINER top and left    

	// to get the left & top of the magnifier    
	// global MOUSE position (e.pageX / e.pageY) is subtracted by 
	// CONTAINER's offset and half the width and height of the magnifier
	// This centers the magnifier at the mouse position & stored in xPosition / yPosition

	// e == CONTAINER
	// gets the top and left of the container	
	var containerPosition = this.getPosition(this.settings.container); //e.currentTarget

	// since the MAGNIFIER top / left is relative to the CONTAINER
	// this translates the MOUSE position from the CONTAINER to the MAGNIFIER
	// Does this by adjusting (subtracting) out the CONTAINER's top / left
	// 
	// Then takes 1/2 the hight of the MAGNIFIER and subtracts it from the MOUSE position to center MAGNIFIER around the MOUSE cursor
	var xPosition = e.pageX - containerPosition.x - (this.settings.divMagnifier.clientWidth / 2);
	var yPosition = e.pageY - containerPosition.y - (this.settings.divMagnifier.clientHeight / 2);
	
	this.settings.divMagnifier.style.left = xPosition + "px";
	this.settings.divMagnifier.style.top = yPosition + "px";

	// if we have an external magnifier output div
	// imgCopy will be relative to the external div
	if (!this.settings.divExternalMagnifier){
	    // for magnifier within the image
	    
	    // Adjust for zoom
	    // containerPosition.y & containerPosition.x is the starting point (Top / Left)
	    // At 0,0 they will equal the MOUSE x,y (e.pageX, e.pageY)
	    // As the MOUSE moves, these values increase and give us the travel
	    // For a zoom = 1, we make no adjustment
	    // for zoom > 1, (e.g. 2) the image is now twice as large and 
	    // so we need to adjust the MAGNIFIER's top/left at an equal pace to the zoom amount
	    var yTravel = (e.pageY - containerPosition.y ) * (this.magZoom - 1);
	    var yImgPosition = -(yPosition - this.settings.container.clientTop + yTravel);
	    this.imgCopy.style.top = yImgPosition  + "px";

	    var xTravel = (e.pageX - containerPosition.x) * (this.magZoom - 1);
	    var xImgPosition = -(xPosition + xTravel);
	    this.imgCopy.style.left = xImgPosition + "px";
	} else {
	    // magnifier external to the image
	    // calculate amount magnifiers have to travel
	    var externalMagnifierRect = this.settings.divExternalMagnifier.getBoundingClientRect();
	    var magnifierRect = this.settings.divMagnifier.getBoundingClientRect();
	    var imgCopyRect = this.imgCopy.getBoundingClientRect();
	    var containerRect = this.settings.container.getBoundingClientRect();
	    var externalTravelX100 = imgCopyRect.width - externalMagnifierRect.width;
	    var externalTravelY100 = imgCopyRect.height - externalMagnifierRect.height;
	    var internalTravelY100 = containerRect.height - magnifierRect.height;
	    var internalTravelX100 = containerRect.width - magnifierRect.width;
	    
	    // with external magnifiers, the inner magnifier will be limited to top and left >= 0 
	    // meaning the square box that moves around inside the image is always fully contained in the image
	    // with internal magnifiers, it can move off the edges
	    this.settings.divMagnifier.style.top = Math.min(internalTravelY100,(Math.max(0, yPosition))) + "px";
	    this.settings.divMagnifier.style.left = Math.min(internalTravelX100,(Math.max(0, xPosition))) + "px";

	    if (externalTravelY100 > 0 && internalTravelY100 > 0){
		// if the zoomed img fits within the external magnifier - no need to move
		// if  internalTravelY100 == 0, the inner magnifier the same size as the image
		// otherwise, move the percent necessary		
		var percentTop = parseInt(this.settings.divMagnifier.style.top) / internalTravelY100
		this.imgCopy.style.top = -percentTop * externalTravelY100 + "px";
	    }
	    if (externalTravelX100 > 0 && internalTravelX100 > 0){
		// if the zoomed img fits within the external magnifier - no need to move
		// if  internalTravelY100 == 0, the inner magnifier the same size as the image
		// otherwise, move the percent necessary		
		var percentLeft = parseInt(this.settings.divMagnifier.style.left) / internalTravelX100
		this.imgCopy.style.left = -percentLeft * externalTravelX100 + "px";
	    }
	}
    }

    Magnifier.prototype.getPosition = function(element) {
	var xPosition = 0;
	var yPosition = 0;
	// element is the CONTAINER
	// offsetParent is the WRAPPER - so will recurse
	// clientLeft & clientTop => width of the border (5)
	// scrollLeft & scrollTop => # pixels that an element's content is scrolled to the left = 0
	// offsetLeft & offsetTop => # pixels left / top corner is offset within the Parent 
	// 
	// This calculates the position of the element (CONTAINER) TOP & LEFT relative to ALL parents
	// including accounting for its own border (top & left after borders added)
	while (element) {
	    // if transform: translate in place for x and y,
	    // add it back as it skews the offsetLeft offsetTop values by the translate amount
	    var translate = this.gettranslate(element);
	    xPosition += ((element.offsetLeft + translate.x) - element.scrollLeft);
	    yPosition += ((element.offsetTop + translate.y) - element.scrollTop);
	    element = element.offsetParent;
	}
	return { x: xPosition, y: yPosition };
    }

    Magnifier.prototype.gettranslate = function(e){
	var xTranslate = 0;
	var yTranslate = 0;
	var computedStyle = window.getComputedStyle(e, null); // "null" means this is not a pesudo style.
	var matrixString = computedStyle.getPropertyValue('transform')
	    || computedStyle.getPropertyValue('-moz-transform')
	    || computedStyle.getPropertyValue('-webkit-transform')
	    || computedStyle.getPropertyValue('-ms-transform')
	    || computedStyle.getPropertyValue('-o-transform');
	    try{
		if (typeof matrixString !== "undefined" && matrixString !== "none" ){
		    var matrix = matrixString
				 .split('(')[1]
				 .split(')')[0]
				 .split(',')
				 .map(parseFloat);

		    if (matrix.length >= 6){
			xTranslate = matrix[4];
			yTranslate = matrix[5];
		    }
		}
	    } catch(err){
		console.log("Matrix invalid: " + matrixString);
	    }
	    return ({ x: xTranslate, y: yTranslate });
    }

    // when destroy object, remove listener first
    Magnifier.prototype.removelistener = function(){
	this.settings.container.removeEventListener("mousemove", this.moveMagnifierListener);
    }
    
    Magnifier.prototype.close = function(){
	if (this.settings.divExternalMagnifier){
	    if (this.externalState.created){
		this.settings.divExternalMagnifier.parentNode.removeChild(this.settings.divExternalMagnifier);
		// keep the flag set for next time
		this.settings.divExternalMagnifier = true;
	    } else if (this.externalState.visibilityHidden){
		 this.settings.divExternalMagnifier.style.visibility = "hidden";
	    } else if (this.externalState.displayNone){
		this.settings.divExternalMagnifier.style.display = "none";
	    } else if (this.externalState.displayNoneClass) {
		$ms.addClass(this.settings.divExternalMagnifier, "display-none");
	    }
	}
	this.imgCopy.parentNode.removeChild(this.imgCopy);
	for (var i = 0; i < instance.length; i++){
	    if (instance[i].id == this.id){
		instance.splice(i, 1);
		break;
	    }
	}
    }
    
    return Magnifier;

})();

/******************************
 * End Magnifier
 */

$msRoot.MSTouch = (function(settings){
    var defaultTouchSettings = {
	captureNode: undefined,
	logElement: undefined
    };
    function MSTouch(settings){
	this.tpCache = [];
	this.scaling = false;
	this.distance = 0;
	this.settings = defaultTouchSettings;
	if (typeof settings !== "undefined"){
	    // only overwrite those settings which are set
	    for (var setting in settings){
		if (settings.hasOwnProperty(setting)){
		    this.settings[setting] = settings[setting];
		}
	    }
	}
	if (typeof this.settings.captureNode == "undefined"){
	    this.settings.captureNode = document.body;
	}
	this.settings.captureNode.addEventListener('touchstart', function(e){
	    // alert(e.changedTouches[0].pageX);
	    if (e.touches.length == 2) {
		// if two fingers
		this.scaling = true;
		this.pinchStart(e);
	    }
	}.bind(this));

	this.settings.captureNode.addEventListener('touchmove', function(e){
	    if (this.scaling) {
		this.pinchMove(e);
	    }
	}.bind(this));
	
	this.settings.captureNode.addEventListener('touchend', function(e){
	    if (this.scaling) {
		this.pinchEnd(e);
		this.scaling = false;
	    }
	}.bind(this));
    }

    //https://developer.mozilla.org/en-US/docs/Web/API/Touch_events/Multi-touch_interaction
    MSTouch.prototype.pinchStart = function(e) {
	// with simultaneious touches, browser will fire separate touchstart event for each touch point.
	// e.preventDefault();
	// this.log("touchStart", e);
	if (e.touches.length == 2) {
	    // reset
	    this.distance = 0;
	    this.tpCache = [];
	    // if both touches were in the same node
	    //this.log("==>2", undefined, true);
	    for (var i = 0; i < e.touches.length; i++) {
		// Cache the touch points for later processing of 2-touch pinch/zoom
		this.tpCache.push(e.touches[i]);
	    }
	}
    }

    MSTouch.prototype.pinchMove = function(e) {
	//e.preventDefault();
	// this.log("touchMove:" + e.touches.length + "-" + e.changedTouches.length, undefined, true);
	if (e.touches.length == 2) {
	    // Check if the two target touches are the same ones that started the 2-touch
	    var point1 = -1, point2 = -1;
	    for (var i = 0; i < this.tpCache.length; i++) {
		if (this.tpCache[i].identifier == e.touches[0].identifier) point1 = i;
		if (this.tpCache[i].identifier == e.touches[1].identifier) point2 = i;
	    }
	    if (point1 >= 0 && point2 >= 0) {	
		// Calculate the difference between the start and move coordinates
		var diff1X = Math.abs(this.tpCache[point1].pageX - e.touches[0].pageX);
		var diff2X= Math.abs(this.tpCache[point2].pageX - e.touches[1].pageX);
		var diff1Y = Math.abs(this.tpCache[point1].pageY - e.touches[0].pageY);
		var diff2Y= Math.abs(this.tpCache[point2].pageY - e.touches[1].pageY);

		//this.log(v("X1,X2:", diff1X, diff2X), undefined, true);
		//this.log(v("Y1,Y2:", diff1Y, diff2Y), undefined, true);
		this.distance = Math.max(diff1X, diff2X, diff1Y, diff2Y);
		// this.log("distance: " + this.distance, undefined, true);
	    } else {
		// empty tpCache
		this.tpCache = [];
	    }
	}
    }
    
    MSTouch.prototype.pinchEnd = function(e) {
	this.tpCache = [];
    }
    
    MSTouch.prototype.log = function(name, e, reset) {
	if (typeof this.settings.logElement !== "undefined"){
	    var text = v(name);
	    if (typeof e !== "undefined"){
		text += " ==>t=" + e.touches.length + 
			" ==>tT=" + e.targetTouches.length +
			" ==>cT=" + e.changedTouches.length;
		for (var i = 0; i < e.targetTouches.length; i++) {
		  // text += " ==> id = " + e.targetTouches[i].identifier + "<br>";
		}
	    }
	    if (reset){
		this.settings.logElement.innerHTML = text;
	    } else {
		this.settings.logElement.innerHTML += text;
	    }
	}
    }
    MSTouch.prototype.clearLog = function() {
	if (this.settings.logElement){
	    this.settings.logElement.innerHTML = "";
	}
    }
    return MSTouch;

})();
    
/* End Touch functions */
