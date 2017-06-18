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
resizeWithWindow | false | If True, then the image will resize when the browser window resizes. If false then the image will keep its size when the browser window resizes.

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
zoomMode | "zoom" | valid values: **"zoom"** = Zoom In Place, **"magnifier"** = In Place Magnifier OR External Magnifier (if divExternalMagnifier is defined)
divExternalMagnifier | undefined | an optional div to hold a zoomed copy of the image (zoom can be changed by clicking the image, or mouse scroll)
initMagZoom | 4 | initial magnifier zoom level (4 = 400%) if using magnifier mode
magnifierSize | {height: 200, width: 200} | Dimensions of the magnifier window to display when using any zoom mode
magnifierStyles: | {top: undefined, left: undefined, width: undefined, height: undefined, border: undefined} | styles for the external magnifier div (any style can be used)

#### Styling Options
Property | Default | Description
--- | --- | ---
**Wrapper**|   |
wrapperBackground | "rgb(70,70,70)" | Background Color of wrapper (note rgba can be used for transparency as well as gradients)
wrapperBorder | "1px solid grey" | Border for the wrapper
**Opaque Layer**|   |
opaquePosition | "absolute" | Valid values: **"fixed"** = cover entire screen, **"absolute"** = only cover container
opaqueBackground | "rgb(70,70,70,1)" | Background of the opque layer (only visible with "fixed" or "absolute" when slideshow doesn't fill the container
opaqueEdge | 0 | An edge effect - The number of pixels on each side of the opaque layer to leave as a an empty border surrounding it. It will also create a 5px border around the layer if available.
**Image**|   |
imageBorder: "2px solid white" | Border of the large slideshow image
ssPaddingTop | 5 | Minimum padding between the image and the top of the container
**Filmstrip**|   |
filmstripBackground | "rgb(170,170,170) | Background of filmstrip
filmstripImageBorder | "2px solid white" | Border of the filmstrip images
filmstripImageHeight | 90 | Height of the thumbnail images

#### Slideshow Options
Property | Default | Description
--- | --- | ---
playOnEnter | false | Start the slideshow when the page loads
slideshowInterval | 4000 | milliseconds between slides (400 milliseconds = 4 seconds)
slideshowWrap | false | Allows wrapping from the last slide to the first or in reverse

#### Transition Options
Property | Default | Description
--- | --- | ---
ssTransitionSeconds | 1 | Number of seconds for the slide animation
ssTransitionEffect | 1 | The transition effect. A string or a zero based index into the array: **0 = "none"** = no transition, **1 ="fade"** = simple fade in and out, **2 = "h-move"** - horizontal movement of slides, ** 3 = "h-move-fade"** - move horizontally and fade, **5 ="size"** = Image Size transitions from old slide's size to new slide's size, **5 ="size-fade"** = Fades while transitioning size. (Best with a border around the slide)

#### Loading Animation Options
Property | Default | Description
--- | --- | ---
waitAnimation | 0 | (integer) Wait animation to play when loading the first image **-1** = None, **0 = DNA** - DNA like moving rods with a 'Pleas Wait' message, **1 = DNA 360°** - Rods move 360 degrees, **2 = Gif** - will use "loading.gif" - any gif animation file can be swapped with it. The stylesheet is set to 100px x 100px.
---|---| Notes: The wait animation only plays when loading the first slide if there is a delay. The current animation can be manually triggered by pressing `ctrl-shift` and clicking on the upper right X close button. Doing the same `ctrl-shift-click` will stop and hide the animation. Pressing `ctrl-alt` and clicking on the upper right X close button will show and advance the animation to the next in the series of 3. The dna-like animation was based off of the CSS by Troshkin Pavel --> troshkin.pavel@yandex.ru --> original css at http://codepen.io/Maseone/pen/rGapf*/ . His animation was Inspired by Handel Eugene --> (https://dribbble.com/shots/1763719-DNA-GIF)


#### Other Options (these cannot be set through the demo interface - except through entering the code directly)
container | undefined | The container element to use for the slideshow. If not set, will use `document.body`
cbCreate | undefined | A callback when the slideshow is created
cbClose | undefined | A callback when slideshow closes
divExternalMagnifier | undefined | Div to hold a copy of the magnified image


### Images - Specifying the files to display
````
	var path = $ms.sourceFiles.currentDir() + "/img-demo/";		// the demo sets the path to the img-demo directory below the current
	var files = [
	    {
		filename: path + "images01.jpg",
		thumb: path + "images01.jpg", 	// optional to define if using the same file as the thumbnail
		downloadLink: undefined, 		// a url to start a customized download - will take place in the background in an iframe
		locateLink: undefined,			// a url to go to where the image would be in context
		otherLink: undefined, 			// a custom url - e.g. purchase, feedback (would require your own image file to replace slideshow-feedback-sprite.png
		logPrintFn: undefined, 			// a custom function to run after printing (e.g. log activity when a user prints an image)
		line1Text: "Pigmy Owl",			// Description text to display below the image
		line2Text: "Copyright 2017 - Michael Seifert"
		},
		{filename: path + "images02.jpg"},
		{filename: path + "images03.jpg"}
	];
````

#### Calling the Slideshow
The slideshow is called in two steps:
````
var files = [{file: http://mysite.com/img/file1.jpg]};	// The array of files to display as slides with options set
var settings = {container: myDiv};	// all the settings above can be set or an empty object {} can be passed to use all defaults
// initialize all the settings
var ss = new $msRoot.Slideshow(settings);
// run the slideshow
var currentSlide = 0;		// set the first slide to be shown
ss.init(files, currentSlide);
````

#### Demo and Settings Code Generator
<a href="/img-demo/screenshot-demo-1.jpg"><img src="/img-demo/screenshot-demo-1.jpg" align="left" height="300"></a>
<a href="/img-demo/screenshot-demo-2.jpg"><img src="/img-demo/screenshot-demo-2.jpg" align="left" height="300"></a>
<a href="/img-demo/screenshot-demo-3.jpg"><img src="/img-demo/screenshot-demo-3.jpg" align="left" height="300"></a>
<a href="/img-demo/screenshot-demo-4.jpg"><img src="/img-demo/screenshot-demo-4.jpg" align="left" height="300"></a>
<a href="/img-demo/screenshot-demo-5.jpg"><img src="/img-demo/screenshot-demo-5.jpg" align="left" height="300"></a>
<a href="/img-demo/screenshot-demo-6.jpg"><img src="/img-demo/screenshot-demo-6.jpg" align="left" height="300"></a>
<a href="/img-demo/screenshot-demo-7.jpg"><img src="/img-demo/screenshot-demo-7.jpg" align="left" height="300"></a>

#### With All Default Settings
-------

<a href="/img-demo/screenshot-slideshow-default.jpg"><img src="/img-demo/screenshot-slideshow-default.jpg" height="500"></a>
<div><div>Wth External Magnifier</div>
<a href="/img-demo/screenshot-slideshow-external-magnifier.jpg"><img src="/img-demo/screenshot-slideshow-external-magnifier.jpg" height="400"></a>
</div>
<div><div>With Floating Option</div>
<a href="/img-demo/screenshot-slideshow-floating.jpg"><img src="/img-demo/screenshot-slideshow-floating.jpg" align="left" height="400"></a>
</div>
<div style="display:inline-block;"><div>Custom Background, 80% Opacity, Draggable, Resizable</div>
<a href="/img-demo/screenshot-slideshow-custom-options.jpg"><img src="/img-demo/screenshot-slideshow-custom-options.jpg" height="400"></a>
</div>

### The Files:
###### slideshow-demo.php
 - Gives an interface for choosing all options (except where noted above in the Other Options section)
 - Will also generate the settings code to pass to the slideshow object
###### slideshow.js
 - the main slideshow library
###### slideshow.css.php
 - the css for the slideshow
###### resize.js
 - defines the Resize class
 -     support for resizing the slideshow
 ###### dragdrop.js
 - defines the DragDrop class
 -     support for drag and drop of the slideshow
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

### For Colorpicker and Gradient Generator only files - Helpful for designing in the demo, but not needed for the Slideshow
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
