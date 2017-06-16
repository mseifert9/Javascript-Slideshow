# Slideshow
**Slideshow** is a full featured and very configurable javascript slideshow.

The demo allows settings of all options and immediately viewing the results as well as generating the code necessary to call the slideshow.

## Overview
### Settings
Settings are all passed in a single object. Below is a table of the setting property name and a description
- Make Draggable
- Make Resizable
- Use document.body as the container
- Center the slideshow
- Resize With Window - automatically adjust the container and image with change in the browser window size

#### Container
Property | Default | Description
--- | --- | ---
resizable | false | Resize the container using a triangle handle (bottom right) or using the right and bottom container edges
draggable | false | Drag the container using a handle div at the top
slideshowHeight | undefined | Dimensions and position of Container
slideshowWidth | undefined | 
slideshowTop | undefined |
slideshowLeft | undefined |
slideshowCenter | false | true = center in window

#### Show / Hide (Boolean: True shows and False hides the feature)
Property | Default | Description
--- | --- | ---
showFilmstrip | true | The thumbnail filmstrip
showFilmstripToggle | false | A triangle shaped button that toggles hiding and showing of the filmstrip
showButtons | true | The button bar
showExitButton | true | An exit button on the button bar
showZoomButtons| true | The zoom in, out, and reset buttons
showPlayPauseButton | true | The play / pause button
showFullScreenButton | true | The fullscreen mode button
showDownloadButton | false | The download button - requires a custom link to the server
showPrintButton | false | Button to print the image (see image files section for custom print behavior)
showOtherButton | false | A custom button (e.g. Purchase, Feedback) which requires a link (see files section) 
showLocateButton | false | A custom button (e.g. Find, Locate, Go to a custom page) which requires a link (see files section)
showFirstLastButtons | true | The first and last buttons on the button bar
showText | true | The text under the image
linesOfText | 2 | Number of lines of text to display for each image (valid range: 0 - 2)

#### Keyboard Shortcuts (Boolean: True enables and False disables)
Property | Default | Description
--- | --- | ---
escapeKeyCloses | false | Escape key closes slideshow
arrowKeysNavigate | false | Left and right arrow keys will navigate previous and next slide

#### Zoom Options
Property | Default | Description
--- | --- | ---
- zoomMode | "zoom" | valid values: "zoom", "magnifier"
|| zoom = Zoom In Place, magnifier = In Place Magnifier OR External Magnifier (if divExternalMagnifier is defined)
divExternalMagnifier | undefined | an optional div to hold a zoomed copy of the image (zoom can be changed by clicking the image, or mouse scroll)
initMagZoom | 4 | initial magnifier zoom level (4 = 400%) if using magnifier mode
magnifierSize | {height: 200, width: 200} | Dimensions of the magnifier window to display when using any zoom mode
magnifierStyles: | {top: undefined, left: undefined, width: undefined, height: undefined, border: undefined} | styles for the external magnifier div (any style can be used)

slideshowInterval: 4000,	    // the interval when slideshow is in auto mode - default to 4 seconds = (3 second pause + 1 second move transition)
- slideshowWrap: false,		      // go back to the beginning when reached the end of the images
- ssTransitionSeconds: 1,		    // seconds for move slide transition
- ssTransitionEffect: 1,		    // index into ["none", "fade", "h-move", "h-move-fade"] or string (e.g. fade)
- ssPaddingTop: 5,		          // minimum padding between image and top of container
- container: undefined,		      // if set, will use to host slide show. if not set, will use document.body
- resizeWithWindow: false,	    // true = slideshow & image will resize with window.resize (will override container)
- playOnEnter: false,		        // true = will start slideshow when loads
- cbCreate: undefined,		    // callback when slideshow is created
- cbClose: undefined,		    // callback when slideshow closes
- wrapperBackground: "rgb(70,70,70)", // background of wrapper
- wrapperBorder: "1px solid grey",    // rgb(128,128,128)
- opaquePosition: "absolute",	    // fixed = cover entire screen; absolute = only cover container
- opaqueBackground: "rgb(70,70,70,1)",	    // background of opque layer
- opaqueEdge: 0,			    // distance around the opaque layer
- imageBorder: "2px solid white",		    // border of the large slideshow image
- filmstripBackground: "rgb(170,170,170)",    // background of filmstrip (#AAA)
- filmstripImageBorder: "2px solid white",    // border of the filmstrip images
- filmstripImageHeight: 90,
- waitAnimation: 0		    // wait animation to play when load

<img src="/img/gradient-generator-screenshot.jpg" />
<img src="/img/colorpicker-screenshot.jpg" />

## Demos
**gradient-demo.php** is actually two demos in one and contains most of the commonly used features.
In the following demos, a minimum of two elements are updated by the ColorPicker  and Gradient Generator: The "target" is the "true" destination element. Also included is an optional div (it can be an input or label) to receive a text version of the color or gradient.
1. **Simple Click to Open Demo** creates one div as a "front end." This can be an input, label, or div (as in this demo). This div will contain both the color chosen and the css string of the chosen color (or gradient). The Demo also gives a "target" div which the color is set for. An option is given to add as many additional divs as desired to test performance.
This fully functional demo of the ColorPicker and Gradient Generator is available at http://design.mseifert.com/index.php?topid=1&grade=Gradient&topid=1
2. **Dynamic Color Input Demo** creates a custom input control with a clickable arrow to open the tool. The input is automatically linked to the ColorPicker and Gradient Generator in a two way fashion. If a color is typed into the input, it is reflected immediately in the input as well as in any open tool. Supported formats for typed in text include Hex, RGB, and CSS Color Names.
**gradient-demo-simple.php** includes the minimal features to get going and includes only the Click to Open demo from above.
## Basic Documentation
MS ColorPicker and Gradient Generator run within all major browsers from IE9+. Tested in Firefox, Chrome, Opera, Safari for Windows, Internet Explorer.

### Implementation
The following code is from the simple demo.

	    function openSelectedTool(input, targetId) {
		var source = $ms.$(targetId);
		
		var property = "background";
		var startColor = "";
		var tool = "colorpicker";
		if (input.style.backgroundImage.indexOf("gradient") !== -1) {
		    tool = "gradient";
		    startColor = input.style.backgroundImage;
		} else if (input.style.backgroundColor.length > 0) {
		    startColor = input.style.backgroundColor;
		} else {
		    startColor = input.style.background;
		}
		
		// target can accomodate any number of elements (within reason :)
		var targetElements = [
		    {element: source, property: property},
		    {element: input, property: property, valueAttribute: "innerHTML", textColor: "contrast"}
		];
		var settings = {
		    minimal: false,
		    target: targetElements,
		    startColor: startColor,
		    allowGradient: true	    // show "Add Gradient" option in color picker, If the source has a gradient, will open the gradient tool automatically
		}
		if (tool == "gradient"){
		    new $msRoot.Gradient(settings);
		} else {
		    new $msRoot.ColorPicker(settings);
		}
	    }
The following HTML will open the ColorPicker or Gradient Generator (CSS styling is needed)
```
	<div onclick="openSelectedTool(this, 'target')"></div>
	<div id="target"></div>
```
The following settings are configurable and can be passed to the ColorPicker or Gradient Generator
```
imgPath: 		// defaults to "/js-common/colorpicker/img",
startMode		// defaults to hue (from hsv)
startColor		// colors can be passed in the supported formats. 
//A passed gradient will automatically open the gradient generator
startPos		// starting position on the screen
target			// an array of elements to update when values change
fontSize		// a font size in percent to help adjust to a site's css framework
zIndex			// defaults to 1000,
container		// allows a custom container
cbClose		// callback when closed
cbChange		// callback when color changed
cbCreate		// callback when ColorPicker is created
// for gradient
pin			// default: false, true = show the pin for pinning to the gradient generator
startPinned		// default: false, true = start pinned to the gradient generator when open
allowGradient		// allow switching to the Gradient Generator
gradient		// holds an instance of the Gradient Generator
fromGradient		// flags when opened from the Gradient Generator
minimal		// does nothing – considered having a flag to remove the color library
```
### The Files:
With the exception of gradient.js, all files originated from John Dyer's library. The Gradient Generator was written by me from the ground up except for the regex which parses the gradients. The parsing regex is from Dean Taylor from this StackOverflow post: 
https://stackoverflow.com/questions/20215440/parse-css-gradient-rule-with-javascript-regex
###### colorPicker.js 
 - defines the ColorPicker class
 -     creates the user interface and controls the workflow for the ColorPicker
###### gradient.js
 - defines the Gradientclass
 -      contains all the code for the Gradient Generator.
###### colorvaluepicker.js 
 - defines the ColorValuePicker class
 -     creates and processes events for the data entry inputs and radio buttons.
###### colormethods.js
 - defines the Color class
 -     keeps the values for the current selected color
 - defines the colorMethods class
 -     contains all the calculations and conversion functions
###### colorlibrary.js
 - allows for saving of chosen colors (ColorPicker) or gradients (Gradient Generator)
###### localdata.js
 - defines the LocalData class
 -     support for colorlibrary.js to save libraries to localstorage.
###### localfile.js
 - defines the LocalFile class
 -     support for colorlibrary.js to export and import libraries to text files.
###### slider.js
 - defines the Slider class
 -     creates the sliders for the ColorPicker maps as well as sliders for numerical input fields (e.g. opacity)
###### custom-dialog.js
 - defines the CustomDialog class
 -     handles custom user input prompts
###### editable-combo.js
 - defines the EditableCombo class
 -     a custom editable combox element used by colorlibrary.js
###### dragdrop.js
 - defines the DragDrop class
 -     support for drag and drop of elements
###### draggable.js
 - defines the Draggable class
 -     makes elements draggable
###### droppable.js
 - defines the Droppable class
 -     makes elements drop targets –able to receive draggable elements
###### moddate.php
 - optional file for version checking of dynamically loaded js files
 -     For more information, see my GitHub library for [Javascript-Dynamic-Loading-and-Version-Control for documentation](https://github.com/mseifert9/Javascript-Dynamic-Loading-and-Version-Control)
###### .htaccess
 - optional file for version checking of dynamically loaded js files
 -     Contains a RewriteRule to filter out the timestamp in the filenames

## The Namespace
This project uses the com.mseifert javascript namespace. In addition to the namespace, two global variables are used as shortcuts:
``` 
    $msRoot = com.mseifert
    $ms = $msRoot.common
```
These variables are defined first in `common.php` so that the path variables are immediately available. These variable are defined again  in mseifert-sourcefiles.js. This second definition will keep existing properties and add to them using the nifty `getChildClasses` function.

## The Path Variables
`common.php` contains the definitions for path variables.
```
    /* 
     * javascript: URL paths must be defined
     * php: URL and absolute (FULL) paths must be defined
     * LINK_ paths are the urls for the cookie enabled domains - e.g. http://design.mseifert.com/demo
     * STATIC_ paths are the urls for the cookieless domains (can be the same as LINK_ if there is not a separate cookieless domain) - 
     *    e.g. http://staticdesign.mseifert.com/demo
     * FULL_ paths are the absolute paths which correspond to the urls - e.g. "/home/yourid/public_html/design/demo"
     * FULL_TOP_ROOT and STATIC_TOP_ROOT are the root of the Server in the domain tree (absolute and url respectively)
     * FULL_SITE_ROOT and STATIC_SITE_ROOT are the root of the Site (domain).
     *	  if there is only one domain on the server, 
     *	  SITE_ROOT and TOP_ROOT paths will be the same
     *	  having both SITE_ROOT and TOP_ROOT defined allows pulling files from anywhere on the server for any of its site
     *	  in other words, it allows different sites to share images, js, and css resources
     * STATIC_IMG_COMMON, STATIC_CSS_COMMON, STATIC_JS_COMMON are default url subdirectories - e.g. http://static-design/demo/img
     * 	  FULL_IMG_COMMON, FULL_CSS_COMMON, FULL_JS_COMMON are the absolute equivalents
     * if root paths are left blank and only sub directories are specified for STATIC_JS_COMMON, STATIC_CSS_COMMON, STATIC_IMG_COMMON
     *	  the current directory will be used as the relative root for all paths. This is the default.
     */
<?php     
    define("LINK_TOP_ROOT", "");
    define("LINK_SITE_ROOT", "");
    define("STATIC_TOP_ROOT", "");
    define("STATIC_SITE_ROOT", "");
    define("STATIC_IMG_COMMON", "img");
    define("STATIC_JS_COMMON", "js");
    define("STATIC_CSS_COMMON", "css");
    define("FULL_TOP_ROOT", "");
    define("FULL_SITE_ROOT", "");
    define("FULL_IMG_COMMON", "");
    define("FULL_JS_COMMON", "");
    define("FULL_CSS_COMMON", "");
?>
<script>
    // create the namespace
    var com = com || {};
    com.mseifert = com.mseifert || {common: {}};
    $msRoot = com.mseifert;
    $ms = $msRoot.common;
    // define url paths for javascript
    $ms.LINK_TOP_ROOT = "";
    $ms.LINK_SITE_ROOT = "";
    $ms.STATIC_TOP_ROOT = "";
    $ms.STATIC_SITE_ROOT = "";
    $ms.STATIC_IMG_COMMON = "img";
    $ms.STATIC_JS_COMMON = "js";
    $ms.STATIC_CSS_COMMON = "css";
</script>
```
