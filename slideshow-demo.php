<?php ob_start(); ?>
<!DOCTYPE html>
<html>
    <head>
	<style>
	    html, body {
		min-width: 100%;
	    }	    
	    html {
		height: 100% !important;
	    }
	    body {
		min-height: 100%;
		font-size: 62.5%;
		font-family: verdana,arial,sans-serif;
	    }
	    .container{
		height: 600px;
		width: 600px;
	    }
	    .tab-div {
		width: 100%;
		height: 100%;
		background: rgb(200,200,200);
	    }
	    .tab-container {
		margin-top: 20px;
		margin-bottom: 5px;
		width: 400px !important;
		min-height: 400px;
		height: 600px;
		border: 1px solid black;
		display: inline-block;
		vertical-align: top;
	    }
	    .tab-container > ul {
		height:25px;
		background-color: #AAA;
	    }
	    .tab-container table {
		font-size: 120%;
	    }
	    .tab-container tr {
		line-height: 20px; 
	    }
	    .content {
		position: relative;
	    }
	    #ss-pinned-area{
		border: 1px solid black;
		position: absolute;
		width: 400px;
	    }
	    #ss-pinned-area > div{
		background: rgb(200,200,200);
		margin-bottom: 5px
	    }
	    #ss-pinned-area > div:last-of-type{
	       margin-bottom:0;
	    }	    
	    #div-code-content > textarea {
		height: 550px;
		width:98%; 
		max-width:98%;
		min-width:98%
	    }
	    
	    #demo {
		position: relative;
		width:795px;
		height: 900px;
		border: 1px solid black;
		min-width:100%;
		min-height:100%;
		padding: 5px;
		display: inline-block;
		vertical-align: top;
		background-color: rgb(240,240,240);
	    }
	    #settings-wrapper{
		display: flex;
		flex-flow: column wrap;		
		position: absolute;
		top: 30px;
		left: 10px;
		width: 815px;
		padding-bottom:20px;
	    }
	    #magnifier-output {
		visibility: hidden;
		width: 400px;
		height: 600px;
		position: absolute;
		border: 1px solid black;
		left: 620px;
		top: 10px;
	    }
	    #start {
		position: absolute;
		top: 0px;
		left: 10px;
	    }
	    #testme{
		position: absolute;
		top: 625px;
		left: 160px;
	    }
	    #copy-status {
		position: absolute;
		color: red;
		bottom: 0;
		right: 50px		
	    }
	    #btn-slideshow {
		line-height:24px;
	    }
	    input[type=radio], input[type=checkbox] {
		margin-left: 20px;
		margin-right: 5px;
	    }
	    h3{
		margin-left: 5px !important;
	    }
	</style>
	<?php 
	    // common.php 
	    //	    defines php path constants and js path variables
	    //	    creates the js namespace where the paths are stored
	    //	    contains basic error checking code - error.log in the demo directory will contain php errors
	    include "common.php" ;
	?>
	<!-- the css file is in php format so that image path information can be passed to it -->
	<link rel="stylesheet" type="text/css" href="<?php echo realurl(STATIC_CSS_COMMON) . '/mseifert-common.min.css.php?static-img-common=' . realurl(STATIC_IMG_COMMON) . '&static-site-root=' . realurl(STATIC_SITE_ROOT) . '&static-js-common=' . realurl(STATIC_JS_COMMON) ?>">
	<link rel="stylesheet" type="text/css" href="<?php echo realurl(STATIC_CSS_COMMON) . '/slideshow.css.php?static-img-common=' . realurl(STATIC_IMG_COMMON) ?>">
	
	<!-- supporting functions - TODO: remove those that are not used by this demo -->
	<script src="<?php echo STATIC_JS_COMMON ?>/mseifert.js"></script>

	<script>
	    /*  VERSION CHECKING of js files
	     *	To turn on optional javascript file version checking
	     *	1) uncomment the code below => $ms.sourceFiles.doVersionChecking( ...
	     *	    This will make sure the browser cache has the newest js versions
	     *	2)  replace the three js definitions in this file
	     *		src="<?php echo STATIC_JS_COMMON ?>/mseifert.min.js">
	     *		src="<?php echo STATIC_JS_COMMON ?>/slideshow.js"
	     *		src="<?php echo STATIC_JS_COMMON ?>/colorpicker/gradient.js"
	     *	    with
	     *		src="<?php echo version(STATIC_JS_COMMON, "/mseifert.min.js") ?>"
	     *		src="<?php echo version(STATIC_JS_COMMON, "/slideshow.js") ?>"
	     *		src="<?php echo version(STATIC_JS_COMMON, "/colorpicker/gradient.js") ?>"
	     */
		
	    /* check file times to manage js file versions for dynamically loaded files (files not explicitly loaded by php)
	     * requires moddata.php be installed in the root of the project
	     * requires .htacess RewriteRule be added to filter out the timestamp in the filenames (see attached .htaccess file)
	     * see github project for furhter information: https://github.com/mseifert9/Javascript-Dynamic-Loading-and-Version-Control
	     */	    
	    /*
	    $ms.sourceFiles.doVersionChecking([
		// specify url of directories to read file times for
		$ms.STATIC_JS_COMMON,
		$ms.STATIC_JS_COMMON + "/colorpicker"
	    ]);
	    */
	</script>
	
	<!-- The slideshow -->
	<script src="<?php echo STATIC_JS_COMMON ?>/slideshow.js"></script>
	<!--
	These are auto included by slideshow.js
	<script src="<?php echo STATIC_JS_COMMON ?>/resizable.js?v=<?php echo filemtime(FULL_JS_COMMON . "/resizable.min.js") ?>"></script>
	<script src="<?php echo STATIC_JS_COMMON ?>/dragdrop.js?v=<?php echo filemtime(FULL_JS_COMMON . "/dragdrop.min.js") ?>"></script>
	<script src="<?php echo STATIC_JS_COMMON ?>/draggable.min.js?v=<?php echo filemtime(FULL_JS_COMMON . "/draggable.min.js") ?>"></script>
	<script src="<?php echo STATIC_JS_COMMON ?>/droppable.min.js?v=<?php echo filemtime(FULL_JS_COMMON . "/droppable.min.js") ?>"></script>
	-->
	
	
	<!-- OPTIONAL FOR COLORPICKER & GRADIENT GENERATOR -->
	<!-- if you wish to load only the ColorPicker without the gradient generator, substitute colorpicker.js for gradient.js below -->
	<script src="<?php echo STATIC_JS_COMMON ?>/colorpicker/gradient.js"></script>

	<!--
	For use with COLORPICKER & GRADIENT GENERATOR (but dragdrop files are also needed for slideshow)
	These are auto included by gradient.js and colorpicker.js
	<script src="<?php echo STATIC_JS_COMMON ?>/localdata.js"></script>
	<script src="<?php echo STATIC_JS_COMMON ?>/localfile.js"></script>
	<script src="<?php echo STATIC_JS_COMMON ?>/editable-combo.js"></script>
	<script src="<?php echo STATIC_JS_COMMON ?>/custom-dialog.js"></script>
	<script src="<?php echo STATIC_JS_COMMON ?>/dragdrop.js"></script>
	<script src="<?php echo STATIC_JS_COMMON ?>/draggable.js"></script>
	<script src="<?php echo STATIC_JS_COMMON ?>/droppable.js"></script>
	<script src="<?php echo STATIC_JS_COMMON ?>/slider.js"></script>
	<script src="<?php echo STATIC_JS_COMMON ?>/colorpicker/colorlibrary.js"></script>
	<script src="<?php echo STATIC_JS_COMMON ?>/colorpicker/colormethods.js"></script>
	<script src="<?php echo STATIC_JS_COMMON ?>/colorpicker/colorvaluepicker.js"></script>
	<script src="<?php echo STATIC_JS_COMMON ?>/colorpicker/colorpicker.js"></script>
	-->
	<script>
	    /* List of all settings and defaults
	    var defaultSettings = {
		slideshowHeight: undefined,	    // needed for document.body - otherwise resizes existing container
		slideshowWidth: undefined,
		slideshowTop: undefined,	    // positioning for existing container
		slideshowLeft: undefined,
		center: true,			    // true = center in window and keep centered unless move with drag drop
		slideshowInterval: 4000,	    // the interval when slideshow is in auto mode - default to 4 seconds = (3 second pause + 1 second move transition)
		slideshowWrap: false,		    // go back to the beginning when reached the end of the images
		ssTransitionSeconds: 1,		    // seconds for move slide transition
		ssTransitionEffect: 1,		    // index into ["none", "fade", "h-move", "h-move-fade"] or string (e.g. fade)
		paddingTop: 5,			    // minimum padding between image and top of container
		container: undefined,		    // if set, will use to host slide show. if not set, will use document.body
		resizeWithWindow: false,	    // true = slideshow & image will resize with window.resize (will override container)
		playOnEnter: false,		    // true = will start slideshow when loads
		showFilmstrip: true,		    // false = hide filmstrip
		showFilmstripToggle: false,	    // true = auto show button that allows hide of filmstrip
		showButtons: true,		    // false = hide button bar
		showExitButton: true,		    // false = hide exit button on the button bar
		showZoomButtons: true,		    // false = hide the zoom in out reset buttons
		showPlayPauseButton: true,	    // false = hide play / pause button, true = show play / pause button
		showFullScreenButton: true,	    // show fullscreen button
		showDownloadButton: false,	    // requires a link
		showPrintButton: false,
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
		initMagZoom: 4,				// initial zoom level 4 = 200%	
		magnifierSize: {height: 200, width: 200},	// dimensions of magnifier window
		divExternalMagnifier: undefined,		// div to hold imgCopy if magnifier for external viewing
		magnifierStyles: {top: undefined, left: undefined, width: undefined, height: undefined, border: undefined},
		cbCreate: undefined,				// callback when slideshow is created
		cbClose: undefined,				// callback when slideshow closes
		wrapperBackground: "rgb(70,70,70)",		// background of wrapper
		wrapperBorder: "1px solid grey",		// rgb(128,128,128)
		opaquePosition: "absolute",			// fixed = cover entire screen; absolute = only cover container
		opaqueBackground: "rgb(70,70,70,1)",		// background of opque layer
		imageBorder: "2px solid white",			// border of the large slideshow image
		filmstripBackground: "rgb(170,170,170)",	// background of filmstrip (#AAA)
		filmstripImageBorder: "2px solid white",	// border of the filmstrip images
		filmstripImageHeight: 90,
		waitAnimation: 0				// wait animation to play when load
	    };
	    Settings which cannot be set with this interface
	    container		// if set, will use to host slide show. if not set, will use document.body
	    divExternalMagnifier	// div to hold imgCopy if using external magnifier
	    cbCreate: undefined,	// callback when slideshow is created
	    cbClose: undefined,	// callback when slideshow closes
	     */
	    function getSettings(custom){
		// start with defaults
		var defaultSettings = $msRoot.Slideshow.getDefaultSettings();
		//  add presets
		var preset = presetSettings();
		var settings = $ms.cloneSettings(defaultSettings, preset);
		if (typeof custom == "object"){
		    // passed settings from runCode
		} else if (custom) {
		    // add custom settings from inputs
		    custom = customSettings(true);
		    settings = $ms.cloneSettings(settings, custom);
		}
		return settings;
	    }
	    function presetSettings() {
		var settings = {};
		var option = document.querySelector('input[name="preset"]:checked').value;
		settings.container = document.getElementById("container");
		var saveMagnifierStyles = settings.magnifierStyles;
		settings.magnifierStyles = undefined;	//reset
		switch (option) {
		    case "body":
			// all other setting default
			settings.container = document.body;
			break;
		    case "movable":
			settings.resizable = true;	// default = false
			settings.draggable = true;	// default = false
			break;
		    case "floating":
			// remove borders
			settings.imageBorder = "0px solid white";
			settings.center = true;
			// background colors blend in opacity full screen mode
			settings.opaquePosition = "fixed";
			settings.wrapperBackground = "transparent";
			settings.wrapperBorder = "0px solid grey";
			settings.filmstripBackground = "transparent";
			settings.opaqueBackground = "rgba(70,70,70,.98)";
			break;
		    case "fullscreen":
			settings.container = document.body;
			settings.showFilmstripToggle = false;
			settings.resizeWithWindow = true;
			break;
		    case "minimal":
			settings.showFilmstrip = false;
			settings.showButtons = false;
			settings.showText = false;
			settings.showFilmstripToggle = false;
			break;
		    case "magnifier":
			var magnifier = document.getElementById("magnifier-output");
			settings.zoomMode = "magnifier";
			settings.magnifierSize = {height: 100, width: 100};
			break;
		    case "external":
			var magnifier = document.getElementById("magnifier-output");
			settings.zoomMode = "magnifier";
			settings.magnifierSize = {height: 100, width: 100};
			settings.divExternalMagnifier = magnifier;
			settings.magnifierStyles = {top: "10px", left: "625px", width: "600px", height: "600px", border: "1px solid black"};
			settings.slideshowLeft = "10";
			settings.slideshowTop = "10";
			settings.center = false;
			break;
		    case "default":
			settings = $msRoot.Slideshow.getDefaultSettings();			
			break;
		}
		if ($ms.$("ss-preserve-colors").checked){
		    // use existing color
		    if (option !== "floating"){
			settings.wrapperBackground = $ms.$("ss-wrapper-background").value;
			settings.filmstripBackground = $ms.$("ss-filmstrip-background").value;
			settings.wrapperBorder = toNumeric($ms.$("ss-wrapper-border-px").value) + "px solid " + $ms.$("ss-wrapper-border-color").value;
		    }
		    settings.opaqueBackground = $ms.$("ss-opaque-background").value;
		    settings.filmstripImageBorder = toNumeric($ms.$("ss-filmstrip-image-border-px").value) + "px solid " + $ms.$("ss-filmstrip-image-border-color").value;
		    settings.imageBorder = toNumeric($ms.$("ss-image-border-px").value) + "px solid " + $ms.$("ss-image-border-color").value;
		    settings.magnifierStyles = saveMagnifierStyles;
		    // settings.magnifierStyles.border = toNumeric($ms.$("ss-mag-border-px").value) + "px solid " + $ms.$("ss-mag-border-color").value;
		}
		return settings;
	    }
	    function customSettings() {
		var settings = {};
		if ($ms.$("ss-use-body").checked) {
		    settings.container = document.body;
		} else {
		    settings.container = document.getElementById("container");
		}
		settings.resizeWithWindow = $ms.$("ss-resize-with-window").checked;
		settings.center = $ms.$("ss-center").checked;
		// container or wrapper dimensions
		settings.slideshowHeight = emptyStringToUndefined($ms.$("ss-height").value);
		settings.slideshowWidth = emptyStringToUndefined($ms.$("ss-width").value);
		settings.slideshowTop = emptyStringToUndefined($ms.$("ss-top").value);
		settings.slideshowLeft = emptyStringToUndefined($ms.$("ss-left").value);
		settings.zIndex = emptyStringToUndefined($ms.$("ss-zindex").value);
		// show
		settings.showFilmstrip = $ms.$("ss-show-filmstrip").checked;
		settings.showFilmstripToggle = $ms.$("ss-show-filmstrip-toggle").checked;
		settings.showButtons = $ms.$("ss-show-buttons").checked;
		settings.showExitButton = $ms.$("ss-show-exit").checked;
		settings.showFirstLastButtons = $ms.$("ss-show-first").checked;
		settings.showZoomButtons = $ms.$("ss-show-zoom").checked;
		settings.showPlayPauseButton = $ms.$("ss-show-play").checked;
		settings.showFullScreenButton = $ms.$("ss-show-full").checked;
		settings.showDownloadButton = $ms.$("ss-show-download").checked;
		settings.showPrintButton = $ms.$("ss-show-print").checked;
		settings.showLocateButton = $ms.$("ss-show-locate").checked;
		settings.showOtherButton = $ms.$("ss-show-other").checked;
		settings.showText = $ms.$("ss-show-text").checked;
		settings.linesOfText = toNumeric($ms.$("ss-number-lines").value);

		// drag drop / resize / navagation
		settings.draggable = $ms.$("ss-draggable").checked;
		settings.resizable = $ms.$("ss-resizable").checked;
		settings.escapeKeyCloses = $ms.$("ss-escape-key").checked;
		settings.arrowKeysNavigate = $ms.$("ss-arrow-keys").checked;		

		// Zoom
		var zoomMode = document.querySelector('input[name="zoom-mode"]:checked').value;
		switch (zoomMode) {
		    case "zoom-in-place":
			settings.zoomMode = "zoom";
			break;
		    case "magnifier-in-place":
			settings.zoomMode = "magnifier";
			break;
		    case "magnifier-external":
			settings.zoomMode = "magnifier";
			break;
		}
		settings.magnifierSize = magSize();
		var magValueSet = false;
		settings.divExternalMagnifier = $ms.$("magnifier-output");
		var top = emptyStringToUndefined($ms.$("ss-ext-mag-top").value);
		if (typeof top !== "undefined"){
		    magValueSet = true;
		    top += "px";
		}
		var left = emptyStringToUndefined($ms.$("ss-ext-mag-left").value);
		if (typeof left !== "undefined"){
		    magValueSet = true;
		    left += "px";
		}
		var width = emptyStringToUndefined($ms.$("ss-ext-mag-width").value);
		if (typeof width !== "undefined"){
		    magValueSet = true;
		    width += "px";
		}
		var height = emptyStringToUndefined($ms.$("ss-ext-mag-height").value);
		if (typeof height !== "undefined"){
		    magValueSet = true;
		    height += "px";
		}
		var border = emptyStringToUndefined($ms.$("ss-mag-border-px").value);
		if (typeof border !== "undefined"){
		    magValueSet = true;
		    border += "px solid " + $ms.$("ss-mag-border-color").value;
		}
		if (!magValueSet){
		    settings.magnifierStyles = undefined;		    
		} else {
		    settings.magnifierStyles = {
			top:  top,
			left: left,
			width: width,
			height: height,
			border: border
		    }
		}
		function magSize() {
		    return {
			height: $ms.$("ss-int-mag-height").value,
			width: $ms.$("ss-int-mag-width").value
		    }
		}
		settings.initMagZoom = $ms.$("ss-init-mag-zoom").value;

		// styling
		// Wrapper
		settings.wrapperBackground = $ms.$("ss-wrapper-background").value;
		settings.wrapperBorder = toNumeric($ms.$("ss-wrapper-border-px").value) + "px solid " + $ms.$("ss-wrapper-border-color").value;
		// Opaque Layer 
		settings.opaquePosition = document.querySelector('input[name="opaque-position"]:checked').value;
		settings.opaqueBackground = $ms.$("ss-opaque-background").value;
		settings.filmstripBackground = $ms.$("ss-filmstrip-background").value;
		settings.filmstripImageBorder = toNumeric($ms.$("ss-filmstrip-image-border-px").value) + "px solid " + $ms.$("ss-filmstrip-image-border-color").value;
		settings.filmstripImageHeight = toNumeric($ms.$("ss-filmstrip-image-height").value);
		// Image
		settings.imageBorder = toNumeric($ms.$("ss-image-border-px").value) + "px solid " + $ms.$("ss-image-border-color").value;
		settings.paddingTop = toNumeric($ms.$("ss-image-padding-top").value);

		// Slideshow Flow
		settings.playOnEnter = $ms.$("ss-play-on-enter").checked;
		settings.slideshowInterval = toNumeric($ms.$("ss-interval").value);
		settings.slideshowWrap = $ms.$("ss-wrap").checked;
		settings.ssTransitionEffect = toNumeric(document.querySelector('input[name="transition"]:checked').value);
		settings.ssTransitionSeconds = toNumeric($ms.$("ss-transition-seconds").value);
		settings.waitAnimation = toNumeric(document.querySelector('input[name="wait"]:checked').value);
		
		// keep color of background in sync with the text
		updateColor('ss-wrapper-background');
		updateColor('ss-opaque-background');
		updateColor('ss-filmstrip-background');
		updateColor('ss-wrapper-border-color');
		updateColor('ss-filmstrip-image-border-color');
		updateColor('ss-image-border-color');
		updateColor('ss-mag-border-color');
		
		return settings;
	    }

	    // *****************************************
	    /* pass slides as array of objects
	     *	{filename: ,	// link to file including path
	     *	 thumb: ,	// link to thumb file including path (optional)
	     *	 downloadLink: ,// link to download file (optional)
	     *	 locateLink: ,	// link to go to the page with the file (optional)
	     *	 otherLink	// other link for the file (e.g. purchase, comment (optional)
	     *	 }
	     * 
	     * ssSettings
	     *	divImageUniqueId
	     *    				   				
	     */
	    var ss;
	    function slideshow(settings) {
		if (settings.container !== document.body){
		    $ms.removeClass($ms.$("container"), "display-none");
		}
		var files = getFiles();
		ss = new $msRoot.Slideshow(settings);
		// the currentId
		var currentSlide = 0;
		ss.init(files, currentSlide);
	    }
	    function closeSlideshow(slideshowInstance) {
		var container = document.getElementById("container");
		container.style.position = "absolute";
		container.style.left = "10px";
		container.style.top = "10px";
		container.style.height = "600px"
		container.style.width = "600px"
		container.style.margin = "0"
		// in case added for center
		container.style.removeProperty("right");
		container.style.removeProperty("bottom");
		$ms.addClass(container, "display-none");
		ss = undefined;
	    }
	    function applySettings(runCodeSettings){
		var settings = getSettings(runCodeSettings);
		// apply settings to elements
		if (settings.container == document.body){
		    $ms.$("ss-use-body").checked = true;
		} else {
		    $ms.$("ss-use-body").checked = false;
		}
		$ms.$("ss-resize-with-window").checked = settings.resizeWithWindow;
		$ms.$("ss-center").checked = settings.center ;
		// container or wrapper dimensions
		$ms.$("ss-height").value = undefinedToEmptyString(settings.slideshowHeight);
		$ms.$("ss-width").value = undefinedToEmptyString(settings.slideshowWidth);
		$ms.$("ss-top").value = undefinedToEmptyString(settings.slideshowTop);
		$ms.$("ss-left").value = undefinedToEmptyString(settings.slideshowLeft);
		$ms.$("ss-zindex").value = undefinedToEmptyString(settings.zIndex);
		// show
		$ms.$("ss-show-filmstrip").checked = settings.showFilmstrip;
		$ms.$("ss-show-filmstrip-toggle").checked = settings.showFilmstripToggle;
		$ms.$("ss-show-buttons").checked = settings.showButtons;
		$ms.$("ss-show-exit").checked = settings.showExitButton;
		$ms.$("ss-show-first").checked = settings.showFirstLastButtons;
		$ms.$("ss-show-zoom").checked = settings.showZoomButtons;
		$ms.$("ss-show-play").checked = settings.showPlayPauseButton;
		$ms.$("ss-show-full").checked = settings.showFullScreenButton;
		$ms.$("ss-show-download").checked = settings.showDownloadButton;
		$ms.$("ss-show-print").checked = settings.showPrintButton;
		$ms.$("ss-show-locate").checked = settings.showLocateButton;
		$ms.$("ss-show-other").checked = settings.showOtherButton;
		$ms.$("ss-show-text").checked = settings.showText;
		$ms.$("ss-number-lines").value = settings.linesOfText;
		// drag drop / resize / navagation
		$ms.$("ss-draggable").checked = settings.draggable;
		$ms.$("ss-resizable").checked = settings.resizable;		
		$ms.$("ss-escape-key").checked = settings.escapeKeyCloses;
		$ms.$("ss-arrow-keys").checked = settings.arrowKeysNavigate;
		// Zoom
		$ms.$("ss-int-mag-height").value = undefinedToEmptyString(settings.magnifierSize.height);
		$ms.$("ss-int-mag-width").value = undefinedToEmptyString(settings.magnifierSize.width);
		$ms.$("ss-init-mag-zoom").value = settings.initMagZoom;
		// zoom-mode radio
		if (settings.zoomMode == "zoom"){
		    $ms.$("ss-zoom-zoom").checked = true;
		} else if (settings.divExternalMagnifier) {
		    $ms.$("ss-zoom-magnifier-external").checked = true;
		} else {
		    $ms.$("ss-zoom-magnifier-in-place").checked = true;			    
		}
		if (!settings.magnifierStyles){
		    $ms.$("ss-ext-mag-top").value = "";
		    $ms.$("ss-ext-mag-left").value = ""
		    $ms.$("ss-ext-mag-width").value = "";
		    $ms.$("ss-ext-mag-height").value = "";
		    $ms.$("ss-mag-border-px").value = "";
		    $ms.$("ss-mag-border-color").value = "";
		} else {
		    $ms.$("ss-ext-mag-top").value = undefinedToEmptyString(settings.magnifierStyles.top).replace("px", "");
		    $ms.$("ss-ext-mag-left").value = undefinedToEmptyString(settings.magnifierStyles.left).replace("px", "");
		    $ms.$("ss-ext-mag-width").value = undefinedToEmptyString(settings.magnifierStyles.width).replace("px", "");
		    $ms.$("ss-ext-mag-height").value = undefinedToEmptyString(settings.magnifierStyles.height).replace("px", "");
		    var border = getBorder(settings.magnifierStyles.border);
		    $ms.$("ss-mag-border-px").value = border.px;
		    $ms.$("ss-mag-border-color").value = border.color;
		}
		
		// styling
		// Wrapper
		$ms.$("ss-wrapper-background").value = settings.wrapperBackground;
		var border = getBorder(settings.wrapperBorder);
		$ms.$("ss-wrapper-border-px").value = border.px;
		$ms.$("ss-wrapper-border-color").value = border.color;
		// Opaque Layer 
		// opaque position radio
		if (settings.opaquePosition == "fixed"){
		    $ms.$("ss-opaque-fixed").checked = true;
		} else {
		    $ms.$("ss-opaque-absolute").checked = true;
		}
		$ms.$("ss-opaque-background").value = settings.opaqueBackground;
		$ms.$("ss-filmstrip-background").value = settings.filmstripBackground;
		var border = getBorder(settings.filmstripImageBorder);
		$ms.$("ss-filmstrip-image-border-px").value = border.px;
		$ms.$("ss-filmstrip-image-border-color").value = border.color;
		$ms.$("ss-filmstrip-image-height").value = settings.filmstripImageHeight;
		// Image
		var border = getBorder(settings.imageBorder);
		$ms.$("ss-image-border-px").value = border.px;
		$ms.$("ss-image-border-color").value = border.color;
		$ms.$("ss-image-padding-top").value = settings.paddingTop;
		// Slideshow Flow
		$ms.$("ss-play-on-enter").checked = settings.playOnEnter;
		$ms.$("ss-interval").value = settings.slideshowInterval;
		$ms.$("ss-wrap").value = settings.slideshowWrap;
		// transition effect radio
		switch (settings.ssTransitionEffect){
		    case 0:
			$ms.$("ss-transition-none").checked = true;
			break;
		    case 1:
			$ms.$("ss-transition-fade").checked = true
			break;
		    case 2:
			$ms.$("ss-transition-horizontal").checked = true
			break;
		    case 3:
			$ms.$("ss-transition-horizontal-fade").checked = true
			break;
		    case 4:
			$ms.$("ss-transition-size").checked = true
			break;
		    case 5:
			$ms.$("ss-transition-size-fade").checked = true
			break;
		}		
		$ms.$("ss-transition-seconds").value = settings.ssTransitionSeconds;
		// wait animation radio
		switch (settings.waitAnimation){
		    case -1:
			$ms.$("ss-wait-none").checked = true;
			break;
		    case 0:
			$ms.$("ss-wait-dna").checked = true
			break;
		    case 1:
			$ms.$("ss-wait-dna-360").checked = true
			break;
		    case 2:
			$ms.$("ss-wait-gif").checked = true
			break;
		}	
		
		generateCode();
	    }
	    function getBorder(string){
		var border = {px: 0, color: ""};
		if (typeof string == 'undefined'){
		    return border;			
		}
		border.px = string.split("px")[0];		    
		var color = string.split("solid ");
		if (color.length > 1){
		    border.color = color[1];
		}
		return border;
	    }
	    
	    function generateCode() {
		var settings = getSettings(true);
		if ($ms.$("ss-minimal-code").checked){
		    var minimalSettings = {};
		    var defaultSettings = $msRoot.Slideshow.getDefaultSettings();
		    for (var prop in settings){
			if (!settings.hasOwnProperty(prop))
			    continue;
			if (settings[prop] !== defaultSettings[prop]){
			    if (typeof settings[prop] !== "object" || 
				    JSON.stringify(settings[prop]) !== JSON.stringify(defaultSettings[prop])){
				// with objects - compare by value using stringify - works if no nodes as values
				minimalSettings[prop] = settings[prop];
			    }
			}
		    }
		    settings = minimalSettings;
		}
		
		// display text that can be cut and pasted into slideshow calling function
		var text = convertToText(settings, false);
		$ms.$('options-text').value = "var settings = " + text + ";";
		var text = convertToText(settings, true);
		$ms.$('options-text-json').value = text;
	    }
	    function convertToText(value, quoteProperty) {
		// quotedProperty is not used
		// true = format code to be JSON.parse compatible
		var text = [];
		if (typeof value == "undefined") {
		    if (quoteProperty){
			return '"undefined"';
		    } else {
			return "undefined";
		    }
		} else if (value === null) {
		    return "null";
		} else if (value === true) {
		    return "true";
		} else if (value === false) {
		    return "false";
		} else if (value instanceof Element) {
		    // element
		    if (value.id) {
			// return code which will retrieve the element
			if (quoteProperty){
			    return JSON.stringify("document.getElementById('" + value.id + "')");
			} else {
			    return "document.getElementById('" + value.id + "')";
			}
		    } else if (value.nodeName.toLowerCase() == "body") {
			// special case
			if (quoteProperty){
			    return JSON.stringify("document.body");
			} else {
			    return "document.body";
			}
		    } else {
			// will be invalid code to recreate object
			console.log("Warning: Missing id for element - used nodeName");
			return value.nodeName;
		    }
		} else if (typeof (value) == "object" && Array.isArray(value)) {
		    // array
		    for (var prop in value) {
			if (!value.hasOwnProperty(prop))
			    continue;
			text.push(convertToText(value[prop], quoteProperty));
		    }
		    return "[" + text.join(", ") + "]";
		} else if (typeof (value) == "object" && !Array.isArray(value)) {
		    // object
		    for (var prop in value) {
			if (!value.hasOwnProperty(prop))
			    continue;
			if (quoteProperty){
			    text.push('"' + prop + '": ' + convertToText(value[prop], quoteProperty));
			} else {
			    text.push(prop + ': ' + convertToText(value[prop], quoteProperty));
			}
		    }
		    return "{" + text.join(",\n") + "}";
		} else if (typeof (value) == "function") {
		    //function
		    return value.toString();
		    //all other values can be done with JSON.stringify
		} else {
		    if (value == "") {
			return '"undefined"';
		    } else {
			return JSON.stringify(value);
		    }
		}
	    }
	    function undefinedToEmptyString(string){
		if (typeof string == "undefined"){
		    return "";
		} else {
		    return string;
		}
	    }
	    function emptyStringToUndefined(string){
		if (string == ""){
		    return undefined;
		} else {
		    return string;
		}
	    }
	    function toNumeric(string){
		if (string == ""){
		    return 0;
		} else {
		    return parseFloat(string);
		}
	    }
	    function copyCode(){
		//var text = $ms.$().innerHTML.replace(/<[^>]+>/g, "\n").replace(/\n\s*\n/g, '\n');
		var text = $ms.$("options-text").value;
		$ms.copyToClipboard(text);
		$ms.removeClass($ms.$("copy-status"), "display-none");
		setTimeout(function(){
		    $ms.addClass($ms.$("copy-status"), "display-none")}, 1000);
	    }
	    function startSlideshow(){
		var settings = getSettings(true);
		if (typeof ss !== "undefined"){
		    ss.close();
		}
		settings.cbClose = closeSlideshow;
		slideshow(settings);
	    }
	    function runCode(){
		var settings;
		var text = $ms.$('options-text').value;
		if (!text){
		    alert("Click one of the Generate Code buttons before testing");
		    return;
		}
		try {
		    // convert code to object
		    // var settings = {...}
		    eval(text);
		} catch (e) {
		    alert("Invalid code. Check syntax and try again");
		    return;
		}
		if (typeof settings == "undefined"){
		    alert("Invalid code. hint: Code must start with `settings = `");
		    return;
		}
		var defaultSettings = $msRoot.Slideshow.getDefaultSettings();
		var settings = $ms.cloneSettings(defaultSettings, settings);
		applySettings(settings);
		testMe(settings);
	    }
	    
	    function testMe(settings){
		// Paste the generated code below
		// or call testMe with the generated code
		//**************************************
		//**************************************
		if (settings.container !== document.body){
		    $ms.removeClass($ms.$("container"), "display-none");
		}
		var files = getFiles();		
		settings.cbClose = closeSlideshow;
		ss = new $msRoot.Slideshow(settings);
		var currentSlide = 0;
		ss.init(files, currentSlide);
	    }
	    
	    function createInput(inputId) {
		if (!$ms.$(inputId))
		    return;
		var settings = {
		    parentNode: $ms.$(inputId).parentNode,
		    input: $ms.$(inputId),
		    // divClassName: "cp-input",
		};
		var cpInput = $ms.createColorPickerInput(settings);
		cpInput.div.style.display = "inline-block";
	    }
	    function updateColor(inputId){
		var keyboardEvent = document.createEvent("KeyboardEvent");
		var initMethod = typeof keyboardEvent.initKeyboardEvent !== 'undefined' ? "initKeyboardEvent" : "initKeyEvent";
		keyboardEvent[initMethod](
				   "keyup", // event type : keydown, keyup, keypress
				    true, // bubbles
				    true, // cancelable
				    window, // viewArg: should be window
				    false, // ctrlKeyArg
				    false, // altKeyArg
				    false, // shiftKeyArg
				    false, // metaKeyArg
				    40, // keyCodeArg : unsigned long the virtual key code, else 0
				    0 // charCodeArgs : unsigned long the Unicode character associated with the depressed key, else 0
		);
		$ms.$(inputId).dispatchEvent(keyboardEvent);
	    }
	    var tabDivsId = ["div-presets", "div-container", "div-show", "div-zoom", "div-styling", "div-slideshow", "div-code"];
	    var tabDivs = [];
	    var pinned = [];
	    function makeTabs(){
		var divTabContainer = createTabs(["Presets", "Container", "Show", "Zoom", "Styling", "Slideshow", "Code"]);

		$ms.$("demo").appendChild(divTabContainer);
		for (var i = 0; i < tabDivsId.length; i++){
		    // make the divs that go in tabs
		    var div = document.createElement("div");
		    div.id = tabDivsId[i];
		    div.className = "tab-div display-none";		    
		    div.appendChild($ms.$(tabDivsId[i] + "-content"));
		    divTabContainer.appendChild(div);
		    // content is hidden before appended - now can remove class after appending to hidden div
		    $ms.removeClass($ms.$(tabDivsId[i] + "-content"), "display-none");
		    
		    // the pin button
		    var pin = document.createElement("div");
		    pin.id = tabDivsId[i] + "-pin";
		    pin.className = "ms-unpinned-button";
		    pin.addEventListener("click", 
			(function(e){
			    var tab = i;
			    return function(e){
				e.stopPropagation();
				pinTab(tab)
			}})()
		    );	    
		    tabDivs.push(div);
		    $ms.$(tabDivsId[i] + "-content").appendChild(pin);
		}
		$ms.$("settings-wrapper").appendChild(divTabContainer)
		showTab(0);
	    }
	    function createTabs(atabs){
		var tabsDiv = document.createElement("div")
		tabsDiv.id = "ss-demo-tab-container";
		tabsDiv.className = "ms-tabs tab-container";
		tabsDiv.style.position = "relative";
		tabsDiv.backgroundColor = "rgb(230,230,230)";
		var ul = document.createElement("ul");
		ul.id = "ss-demo-tab-ul";
		ul.className = "tab-primary";
		tabsDiv.appendChild(ul);
		for (var i = 0; i < atabs.length; i++){
		    var li = document.createElement("li");
		    li.id = "ss-demo-tab-" + i;
		    li.innerHTML = atabs[i];
		    !function (i){
			li.addEventListener('click', function (e){
			    showTab(i);
			}, false)
		    }(i);

		    if (i == 0){
		      li.className = 'tab-current';
		    }
		    ul.appendChild(li);
		    pinned.push(false);
		}
		return tabsDiv;		
	    }
	    function showTab(tab){
		var tabContainer = $ms.$("ss-demo-tab-container");
		var ul;
		for (var i = 0; i < tabContainer.childNodes.length; i++){
		    if (tabContainer.childNodes[i].nodeName == "UL"){
			ul = tabContainer.childNodes[i];
			break;
		    }
		}

		// highlight current tab
		for (var i = 0; i < ul.childNodes.length; i++){
		    if (i == tab){
			$ms.addClass(ul.childNodes[i], 'tab-current');
		    } else {
			$ms.removeClass(ul.childNodes[i], 'tab-current');
		    }
		}	    
		// hide all tabs
		for (var i = 0; i < tabDivs.length; i++){
		    $ms.addClass(tabDivs[i], "display-none");
		}
		// show the selected
		$ms.removeClass(tabDivs[tab], "display-none");
	    }
	    function pinTab(tab){
		if (pinned[tab]){
		    // is pinned - unpin
		    $ms.removeClass($ms.$(tabDivsId[tab] + "-pin"), "ms-pinned-button")
		    $ms.addClass($ms.$(tabDivsId[tab] + "-pin"), "ms-unpinned-button")
		    // show the tab
		    $ms.removeClass($ms.$("ss-demo-tab-" + tab), "display-none");
		    //restore the contents div to the tab
		    $ms.$(tabDivsId[tab]).appendChild($ms.$(tabDivsId[tab] + "-content"));
		    
		    pinned[tab] = false;
		    // hide the pinned area if no more pins
		    var close = true;
		    for (var i= 0; i < pinned.length; i++){
			if (pinned[i]){
			    close = false;
			    break;
			}
		    }
		    if (close){
			$ms.addClass($ms.$("ss-pinned-area"), "display-none");
		    }
		} else {
		    // pin
		    $ms.addClass($ms.$(tabDivsId[tab] + "-pin"), "ms-pinned-button")
		    $ms.removeClass($ms.$(tabDivsId[tab] + "-pin"), "ms-unpinned-button")
		    // hide the tab
		    $ms.addClass($ms.$("ss-demo-tab-" + tab), "display-none");
		    // show the pinned area
		    if (!$ms.$("ss-pinned-area")){
			// fist time creation
			var ssPinnedArea = document.createElement("div");
			ssPinnedArea.id = "ss-pinned-area";
			ssPinnedArea.style.top = parseInt(getComputedStyle($ms.$("settings-wrapper")).getPropertyValue("top")) + 10 + "px";
			ssPinnedArea.style.left = parseInt(getComputedStyle($ms.$("ss-demo-tab-container")).getPropertyValue("width")) + 5 + "px";
			$ms.$("settings-wrapper").appendChild(ssPinnedArea);
		    }		    
		    //move the contents div to the pinned area
		    $ms.$("ss-pinned-area").appendChild($ms.$(tabDivsId[tab] + "-content"));
		    $ms.removeClass($ms.$("ss-pinned-area"), "display-none");
		    
		    // show the next tab
		    pinned[tab] = true;
		    var found = false
		    for (var i = tab + 1; i < pinned.length; i++){
			if (!pinned[i]){
			    showTab(i);
			    found = true;
			    break;
			}
		    }
		    if (!found){
			for (var i = 0; i < tab; i++){
			    if (!pinned[i]){
				showTab(i);
				break;
			    }
			}
		    }
		    
		}
	    }

	    // ******************************************
	    // Custom for stand-alone demo
	    function getFiles(){
		var path = $ms.sourceFiles.currentDir() + "/img-demo/";
		return [
		    {
			filename: path + "images01.jpg",
			thumb: path + "images01.jpg", // if same file, it is optional to define
			downloadLink: undefined, // a url to start a download - will take place in the background in an iframe
			locateLink: undefined, // a url to go to where the image would be in context
			otherLink: undefined, // a custom url - purchase, feedback, etc... (would require your own image file to replace slideshow-feedback-sprite.png
			logPrintFn: undefined, // a custom function to run after printing (e.g. log activity when a user prints an image)
			line1Text: "Pigmy Owl",
			line2Text: "Copyright 2017 - Michael Seifert"
		    },
		    {filename: path + "images02.jpg"},
		    {filename: path + "images03.jpg"},
		    {filename: path + "images04.jpg"},
		    {filename: path + "images05.jpg"},
		    {filename: path + "images06.jpg"},
		    {filename: path + "images07.jpg"},
		    {filename: path + "images08.jpg"},
		    {filename: path + "images09.jpg"},
		    {filename: path + "images10.jpg"},
		    {filename: path + "images11.jpg"},
		    {filename: path + "images12.jpg"},
		    {filename: path + "images13.jpg"}
		];
	    }
	</script>
    </head>
<div id="demo">
    <div id="container" class="container display-none"></div>
    <div id="magnifier-output" class="magnifier"></div>
    <div id="start"><input id="btn-slideshow" type="button" value="Start Slideshow" onclick="startSlideshow()"></div>    
    <div id="settings-wrapper">
	<div id="div-presets-content" class="content">
	    <h3>Preset Slideshow</h3>
	    <hr>
	    <table style="width: 100%">
		<colgroup>
		    <col style="width:50%;">
		    <col style="width:50%;">
		</colgroup>
		<tr><td><input id="ss-default" type="radio" name="preset" value="default" checked="checked" onclick="applySettings()"><label for="ss-default">Default</label></td>
		    <td><input id="ss-floating" type="radio" name="preset" value="floating" onclick="applySettings()"><label for="ss-floating">Floating</label></td></tr>
		<tr><td><input id="ss-movable" type="radio" name="preset" value="movable" onclick="applySettings()"><label for="ss-movable">Movable</label></td>
		    <td><input id="ss-body" type="radio" name="preset" value="body" onclick="applySettings()"><label for="ss-body">Document Body</label></td></tr>
		<tr><td><input id="ss-fullscreen" type="radio" name="preset" value="fullscreen" onclick="applySettings()"><label for="ss-fullscreen">Full Screen</label></td>
		    <td><input id="ss-minimal" type="radio" name="preset" value="minimal" onclick="applySettings()"><label for="ss-minimal">Minimal</label></td></tr>
		<tr><td><input id="ss-magnifier" type="radio" name="preset" value="magnifier" onclick="applySettings()"><label for="ss-magnifier">In Place Magnifier</label></td>
		    <td><input id="ss-external" type="radio" name="preset" value="external" onclick="applySettings()"><label for="ss-external">External Magnifier</label></td></tr>
		
		<tr></tr>
		<tr><td colspan="4"><input type="checkbox" id="ss-preserve-colors" checked="checked"><label for="ss-preserve-colors">Preserve Colors</label></td></tr>
	    </table>
	</div>

	<div id="div-container-content" class="content display-none">
	    <h3>Container</h3>
	    <hr>
	    <table style="width: 100%">
		<colgroup>
		    <col style="width:22%;">
		    <col style="width:28%;">
		    <col style="width:22%;">
		    <col style="width:28%;">
		</colgroup>
		<tr>
		    <td colspan="2"><input type="checkbox" id="ss-draggable"><label for="ss-draggable">Make Draggable</label></td>
		    <td colspan="2"><input type="checkbox" id="ss-resizable"><label for="ss-resizable">Make Resizable</label></td>
		</tr>
		<tr>
		    <td colspan="2"><input type="checkbox" id="ss-use-body"><label for="ss-use-body">Use document.body</label></td>
		    <td colspan="2"><input type="checkbox" id="ss-center"><label for="ss-center">Center</label></td>
		</tr>
		<tr><td colspan="4"><input id="ss-resize-with-window" type="checkbox"><label for="ss-resize-with-window">Resize With Window (Fullscreen)</label></td></tr>
		<tr><td colspan="4"></tr>
		<tr>
		    <td>Height</td>
		    <td><input id="ss-height" type="input" size="4" value="600"></td>
		    <td>Width</td>
		    <td><input id="ss-width" type="input" size="4" value="600"></td>
		</tr>
		<tr>
		    <td>Top</td>
		    <td><input id="ss-top" type="input" size="4" value=""></td>
		    <td>Left</td>
		    <td><input id="ss-left" type="input" size="4" value=""></td>
		</tr>
		<tr>
		    <td>z-index</td>
		    <td><input id="ss-zindex" type="input" size="4" value=""></td>
		</tr>
	    </table>
	</div>

	<div id="div-show-content" class="content display-none">
	    <table style="width: 100%">
		<colgroup>
		    <col style="width:22%;">
		    <col style="width:28%;">
		    <col style="width:22%;">
		    <col style="width:28%;">
		</colgroup>
		<h3>Show</h3>
		<hr>
		<tr><td colspan="4"><strong>Filmstrip & Text:</strong></td></tr>	
		<tr><td colspan="2"><input type="checkbox" id="ss-show-filmstrip" checked="checked"><label for="ss-show-filmstrip">Filmstrip (thumbnails)</label></td>
		    <td colspan="2"><input type="checkbox" id="ss-show-filmstrip-toggle" checked="checked"><label for="ss-show-filmstrip-toggle">Filmstrip Toggle ◢)</label></td></tr>
		<tr><td colspan="2"><input type="checkbox" id="ss-show-text" checked="checked"><label for="ss-show-text">Text (up to 2 lines)</label></td>
		    <td># Lines</td>
		    <td><input id="ss-number-lines" type="input" size="4" value="2"></td>
		</tr>
		<tr><td colspan="4"><strong>Buttons:</strong></td></tr>	
		<tr><td colspan="2"><input type="checkbox" id="ss-show-buttons" checked="checked"><label for="ss-show-buttons">Buttons Bar</label></td>
		    <td colspan="2"><input type="checkbox" id="ss-show-first" checked="checked"><label for="ss-show-first">First & Last Buttons</label></td></tr>
		<tr><td colspan="2"><input type="checkbox" id="ss-show-zoom" checked="checked"><label for="ss-show-zoom">Zoom Buttons</label></td>
		    <td colspan="2"><input type="checkbox" id="ss-show-play" checked="checked"><label for="ss-show-play">Play / Pause Button</label></td></tr>
		<tr><td colspan="2"><input type="checkbox" id="ss-show-full" checked="checked"><label for="ss-show-full">Full Screen Button</label></td>
		    <td colspan="2"><input type="checkbox" id="ss-show-download" checked="checked"><label for="ss-show-download">Download Button (link)</label></td></tr>
		<tr><td colspan="2"><input type="checkbox" id="ss-show-print" checked="checked"><label for="ss-show-print">Print Button</label></td>
		    <td colspan="2"><input type="checkbox" id="ss-show-locate"><label for="ss-show-locate">Locate Button (link)</label></td></tr>
		<tr><td colspan="2"><input type="checkbox" id="ss-show-exit" checked="checked"><label for="ss-show-exit">Exit Button</label></td>
		    <td colspan="4"><input type="checkbox" id="ss-show-other"><label for="ss-show-other">Custom Button (link)</label></td></tr>
	    </table>
	</div>

	<div id="div-zoom-content" class="content display-none">
	    <h3>Zoom</h3>
	    <hr>
	    <table style="width: 100%">
		<colgroup>
		    <col style="width:22%;">
		    <col style="width:28%;">
		    <col style="width:22%;">
		    <col style="width:28%;">
		</colgroup>
		<tr><td colspan="4"><strong>Zoom:</strong></td></tr>	
		<tr><td colspan="4"><input id="ss-zoom-zoom" type="radio" name="zoom-mode" value="zoom-in-place" checked="checked"><label for="ss-zoom-zoom">Zoom In Place</label></tr>
		<tr><td colspan="4"><input id="ss-zoom-magnifier-in-place" type="radio" name="zoom-mode" value="magnifier-in-place"><label for="ss-zoom-magnifier-in-place">In Place Magnifier</label></tr>
		<tr><td colspan="4"><input id="ss-zoom-magnifier-external" type="radio" name="zoom-mode" value="magnifier-external"><label for="ss-zoom-magnifier-external">External Magnifier</label></tr>

		<tr><td colspan="4"><strong>Internal Magnifier Box:</strong></td></tr>
		<tr>
		    <td>Height</td>
		    <td><input id="ss-int-mag-height" type="input" size="4" value="200"></td>
		    <td>Width</td>
		    <td><input id="ss-int-mag-width" type="input" size="4" value="200"></td>
		</tr>
		<tr><td colspan="4"><strong>External Magnifier Box:</strong></td></tr>	
		<tr>
		    <td colspan="2">Initial Magnification Level</td>
		    <td><input id="ss-init-mag-zoom" type="input" size="4" value="4"></td>
		    <td>(e.g. 4 = 400%)</td>
		</tr>
		<tr>
		    <td>Height</td>
		    <td><input id="ss-ext-mag-height" type="input" size="4" value="600"></td>
		    <td>Width</td>
		    <td><input id="ss-ext-mag-width" type="input" size="4" value="600"></td>
		</tr>
		<tr>
		    <td>Top</td>
		    <td><input id="ss-ext-mag-top" type="input" size="4" value="0"></td>
		    <td>Left</td>
		    <td><input id="ss-ext-mag-left" type="input" size="4" value="625"></td>
		</tr>
		<tr>
		    <td>Border</td>
		    <td colspan="3"><input id="ss-mag-border-px" type="input" size="2" value="1"> px solid <input id="ss-mag-border-color" type="input" value=""></td>
		</tr>
	    </table>
	</div>
	
	<div id="div-styling-content" class="content display-none">
	    <h3>Styling</h3>
	    <hr>
	    <table style="width: 100%">
		<colgroup>
		    <col style="width:30%;">
		    <col style="width:25%;">
		    <col style="width:25%;">
		    <col style="width:20%;">
		</colgroup>
		<tr><td colspan="4"><strong>Wrapper:</strong></td></tr>	
		<tr>
		    <td>Background Color</td>
		    <td colspan="2"><input id="ss-wrapper-background" type="input" value="rgb(70,70,70)"></td>
		</tr>
		<tr>
		    <td>Border</td>
		    <td colspan="3"><input id="ss-wrapper-border-px" type="input" size="2" value="1"> px solid <input id="ss-wrapper-border-color" type="input" value=""></td>
		</tr>

		<tr><td colspan="4"><hr></td></tr>
		<tr><td colspan="4"><strong>Opaque Layer:</strong></td></tr>	
		<tr><td colspan="4"><strong>Position:</strong></td></tr>
		<tr><td colspan="4"><input id="ss-opaque-fixed" type="radio" name="opaque-position" value="fixed" checked="checked"><label for="ss-opaque-fixed">Fixed (Whole screen)</label></tr>
		<tr><td colspan="4"><input id="ss-opaque-absolute" type="radio" name="opaque-position" value="absolute"><label for="ss-opaque-absolute">Absolute (Container only)</label></tr>
		<tr>
		    <td>Background Color</td>
		    <td colspan="2"><input id="ss-opaque-background" type="input" value="rgb(70,70,70)"></td>
		</tr>
		<tr>
		    <td>Opacity (0 - 1)</td>
		    <td colspan="2"><input id="ss-opaque-opacity" type="input" value="1">%</td>
		</tr>
		<tr>
		    <td>Edge Effect</td>
		    <td colspan="2"><input id="ss-opaque-edge" type="input" size="4" value="0">px</td>
		</tr>

		<tr><td colspan="4"><hr></td></tr>
		<tr><td colspan="4"><strong>Filmstrip:</strong></td></tr>	
		<tr>
		    <td>Background Color</td>
		    <td colspan="2"><input id="ss-filmstrip-background" type="input" value="rgb(170,170,170)"></td>
		</tr>
		<tr><td colspan="4"><strong>Image</strong></td></tr>
		<tr>
		    <td>Border</td>
		    <td colspan="3"><input id="ss-filmstrip-image-border-px" type="input" size="2" value="2"> px <input id="ss-filmstrip-image-border-color" type="input" value="white"></td>
		</tr>
		<tr>
		    <td>Height</td>
		    <td colspan="2"><input id="ss-filmstrip-image-height" type="input" size="2" value="90"> px</td>
		</tr>

		<tr><td colspan="4"><hr></td></tr>
		<tr><td colspan="4"><strong>Main Image:</strong></td></tr>	
		<tr>
		    <td>Border</td>
		    <td colspan="3"><input id="ss-image-border-px" type="input" size="2" value="2"> px <input id="ss-image-border-color" type="input" value="white"></td>
		</tr>
		<tr>
		    <td>Top Padding</td>
		    <td><input id="ss-image-padding-top" type="input" size="2" value="5"> px</td>
		</tr>

	    </table>
	</div>
	
	<div id="div-slideshow-content" class="content display-none">
	    <h3>Slideshow, Slide Transitions, Loading Animation</h3>
	    <hr>
	    <table style="width: 100%">
		<colgroup>
		    <col style="width:22%;">
		    <col style="width:28%;">
		    <col style="width:22%;">
		    <col style="width:28%;">
		</colgroup>

		<tr><td colspan="4"><strong>Slideshow:</strong></td></tr>
		<tr><td colspan="2"><input type="checkbox" id="ss-play-on-enter"><label for="ss-play-on-enter">Play On Enter</label></td>
		    <td colspan="1">Interval</td>
		    <td colspan="1"><input id="ss-interval" type="input" size="2" value="4000"> ms</td>
		</tr>
		<tr><td colspan="4"><input type="checkbox" id="ss-wrap"><label for="ss-wrap">Wrap when at the beginning or end</label></td>
		</tr>
		<tr><td colspan="4"><strong>Transitions:</strong></td></tr>
		<tr>
		    <td colspan="1">Length</td>
		    <td colspan="1"><input id="ss-transition-seconds" type="input" size="2" value="1"> seconds</td>
		</tr>
		<tr><td colspan="4"><strong>Effect:</strong></td></tr>
		<tr>
		    <td colspan="2"><input id="ss-transition-none" type="radio" name="transition" value="0"><label for="ss-transition-none">None</label>
		    <td colspan="2"><input id="ss-transition-fade" type="radio" name="transition" value="1" checked="checked"><label for="ss-transition-fade">Fade</label>
		</tr>
		<tr>
		    <td colspan="2"><input id="ss-transition-horizontal" type="radio" name="transition" value="2"><label for="ss-transition-horizontal">Horizontal</label>
		    <td colspan="2"><input id="ss-transition-horizontal-fade" type="radio" name="transition" value="3"><label for="ss-transition-horizontal-fade">Horizontal & Fade</label>
		</tr>
		<tr>
		    <td colspan="2"><input id="ss-transition-size" type="radio" name="transition" value="4"><label for="ss-transition-size">Size</label>
		    <td colspan="2"><input id="ss-transition-size-fade" type="radio" name="transition" value="5"><label for="ss-transition-size-fade">Size & Fade</label>
		</tr>
		<tr><td colspan="4"><strong>Loading Animation:</strong></td></tr>
		<tr>
		    <td colspan="2"><input id="ss-wait-none" type="radio" name="wait" value="-1"><label for="ss-wait-none">None</label>
		    <td colspan="2"><input id="ss-wait-dna" type="radio" name="wait" value="0" checked="checked"><label for="ss-wait-dna">DNA</label>
		</tr>
		<tr>
		    <td colspan="2"><input id="ss-wait-dna-360" type="radio" name="wait" value="1"><label for="ss-wait-dna-360">DNA 360°</label>
		    <td colspan="2"><input id="ss-wait-gif" type="radio" name="wait" value="2"><label for="ss-wait-gif">Animated Gif</label>
		</tr>

		<tr><td colspan="4"><hr></td></tr>
		<tr><td colspan="4"><strong>Keyboard Shortcuts:</strong></td></tr>	
		<tr>
		    <td colspan="2"><input type="checkbox" id="ss-escape-key"><label for="ss-escape-key">Escape Key Exits</label></td>
		    <td colspan="2"><input type="checkbox" id="ss-arrow-keys"><label for="ss-arrow-keys">Arrow Keys Navigate</label></td>
		</tr>
	    </table>
	</div>
	
	<div id="div-code-content" class="content display-none">
	    <h3 style="display:inline-block">Code</h3>
	    <div style="display:inline-block; padding-left:20px"><input type="button" value="Generate" onclick="generateCode()"></div>
	    <input type="checkbox" id="ss-minimal-code" style="display:inline-block; padding-left:5px" onclick="generateCode()"><label for="ss-minimal-code">Minimal</label>
	    <input type="button" value="Test (eval)" style="display:inline-block; padding-left:5px" onclick="runCode()">
	    <div style="display:inline-block; padding-left:5px"><input type="button" value="Copy" onclick="copyCode()"></div>
	    <textarea id='options-text' placeholder="" rows="2"></textarea>
	    <div id='options-text-json' class="display-none"></div>
	    <div id="copy-status" class="display-none">Copied to Clipboard</div>
	</div>
    </div>
</div>
    <script>
	$ms.setOnLoad($ms.$("container"), function () {	    
	    var interval = setInterval(function() { 
		if (typeof $msRoot["colorMethods"] !== "undefined"){
		    clearInterval(interval);
		    makeTabs();
		    // replace all color inputs with colorpicker input
		    createInput('ss-wrapper-background');
		    createInput('ss-opaque-background');
		    createInput('ss-filmstrip-background');
		    createInput('ss-wrapper-border-color');
		    createInput('ss-filmstrip-image-border-color');
		    createInput('ss-image-border-color');
		    createInput('ss-mag-border-color');
		    applySettings();
		    return;
		}		
	    }, 10)
	});
    </script>
</html>