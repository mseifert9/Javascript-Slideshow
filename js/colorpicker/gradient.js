/* Copyright © 2017 Michael Seifert (mseifert.com) All Rights Reserved */

$msRoot.createNS("Gradient");
$msRoot.Gradient = (function (settings) {
  var instance = [];
  var instanceCounter = 0;
  var defaultSettings = {
    startColor: "",
    newGradient: "rgb(255,255,255)", // default new gradient
    newLayer: "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(0,0,0,1) 100%)", // default new gradient layer
    imgPath: $ms.STATIC_JS_COMMON + "/colorpicker/img",
    target: undefined, // an array of elements to update when values change
    top: "100px",
    left: "100px",
    fontSize: 75,
    zIndex: 1000,
    container: undefined,
    cbUpdateColorPicker: undefined, // callback called when gradient changes
    cbClose: undefined,
    cbChange: undefined,
    cbCreate: undefined,
    pinColorPicker: false, // default state of pinned or not
    colorPicker: undefined,
    minimal: false
  };

  var dependants = [
    {file: "localdata.min.js", ns: "LocalData"},
    {file: "localfile.min.js", ns: "LocalFile"},
    {file: "editable-combo.min.js", ns: "EditableCombo"},
    {file: "custom-dialog.min.js", ns: "CustomDialog"},
    {file: "dragdrop.min.js", ns: "DragDrop"},
    {file: "slider.min.js", ns: "Slider"},
    {file: "colorpicker.min.js", ns: "ColorPicker", subDir: "colorpicker"},
    {file: "colorlibrary.min.js", ns: "ColorPicker.ColorLibrary", subDir: "colorpicker"},
  ]
  $ms.sourceFiles.add(dependants);
  $ms.sourceFiles.load();

  Gradient.getInstance = function (instanceId) {
    if (typeof instanceId !== "undefined") {
      for (var i = 0; i < instance.length; i++) {
        if (instance[i].id == instanceId) {
          return instance[i];
        }
      }
    } else {
      // with no parameters, return array of all instances
      return instance;
    }
  }

  function Gradient(settings) {
    instance.push(this);
    this.id = "ms-gradient-" + instanceCounter++ + "-";
    ;
    this.aGradient = [];
    this.gradient;
    this.opacitySlider;
    this.currStop = -1;
    this.barMousedownSet = [];
    this.cs;		    // quick reference to this.gradient.colorStop 
    this.deleteStopListener;    // set with mousedown and removed with mouseup
    this.cpLibrary;
    this.currLayer = -1;
    this.layerCounter = 0;
    this.layerBusy = false;
    this.string;		    // object with CURRENT LAYER's gradient string for each browser {noPrefix: , moz: , webkit: , ie: }
    this.allLayersString;	    // object with complete gradient string for each browser
    this.undoString;	    // allows one layer of undo
    this.tab = 0;
    this.lastDeletedStop = {color: undefined, alpha: undefined};	// serves as the default settings for new stop
    this.cssMode = "rgb";
    this.init = false;
    this.degreesDialogOpen = false;
    this.vendorFunctionPrefix = $ms.vendorFunctionPrefix("background", "linear-gradient", "(to top, black, white)", "(top, black, white)");

    this.settings = $ms.cloneSettings(defaultSettings, settings);

    if (!this.settings.container) {
      this.settings.container = document.body;
    }
    // create the color library form with the controls
    var settings = {
      saveLabel: "Save",
      cbSetColor: function (color) {
        // selected color swatch in library
        // save the color name
        var name = color.name;
        if (this.tab == 2) {
          // when layers showing - give option of how to load
          var settings = {
            id: this.id,
            dialogTitle: "Load Gradient",
            text: "Load a new gradient or add layer(s) to the current one?",
            buttons: [
              {label: "Gradient", title: "Replace the current gradient.",
                cb: function () {
                  this.showGradientFromString(color.gradient)
                }.bind(this)},
              {label: "Layer(s)", title: "Add layer(s) to the existing gradient",
                cb: function () {
                  this.showGradientFromString(color.gradient, true)
                }.bind(this)},
              {label: "Cancel", title: "Do not load the gradient"}
            ],
            position: "fixed",
            textAlign: "left",
            buttonClass: "ms-gradient-button",
            buttonsOnTop: true,
          };
          var dialog = new $msRoot.CustomDialog(settings);
        } else {
          // load the color
          this.setColor(color.gradient);
          // restore the name which was erased with reset
          this.cpLibrary.colorNameCombo.setValue(name);
        }
      }.bind(this),
      libSuffix: "gradient",
      valueToSet: "gradient",
      cbResize: function (mode) {
        this.colorLibResize(mode)
      }.bind(this)
    }
    this.cpLibrary = new $msRoot.ColorPicker.ColorLibrary(settings);

    // create the form
    this.container = this.createForm();
    $ms.draggable(this.container,
            {scope: "default",
              handle: this.id + "title-bar",
              cbDrop: this.drop.bind(this)
            });

    this.opacityInput = $ms.$(this.id + "opacity-stop-input");
    this.opacityLocationInput = $ms.$(this.id + "opacity-stop-location");
    this.colorInput = $ms.$(this.id + "color-stop-input");
    this.colorLocationInput = $ms.$(this.id + "color-stop-location");
    this.opacityDelete = $ms.$(this.id + "opacity-delete-area");
    this.colorDelete = $ms.$(this.id + "color-delete-area");
    this.opacityBar = $ms.$(this.id + "opacity-bar");
    this.colorBar = $ms.$(this.id + "color-bar");
    this.direction = $ms.$(this.id + "gradient-direction");
    this.tabsContainer = $ms.$(this.id + "tab-container");
    this.previewOuter = $ms.$(this.id + "preview-outer");
    this.previewWrapper = $ms.$(this.id + "preview-wrapper");
    this.previewWrapper2 = $ms.$(this.id + "preview-wrapper2");
    this.preview = $ms.$(this.id + "preview");
    this.previewWidth = $ms.$(this.id + "export-width");
    this.previewHeight = $ms.$(this.id + "export-height");
    this.cssOuter = $ms.$(this.id + "css-outer");
    this.cssText = $ms.$(this.id + "css-text");
    this.layersOuter = $ms.$(this.id + "layers-outer");
    this.layersUl = $ms.$(this.id + "layer-ul");
    this.layersPreviewWrapper = $ms.$(this.id + "layers-preview-wrapper");
    this.importOuter = $ms.$(this.id + "import-outer");
    this.importText = $ms.$(this.id + "import-text");

    this.opacityInput.addEventListener('keydown', function (e) {
      this.keydown(e, 0, 100, this.opacityInputKeyup)
    }.bind(this));
    this.opacityLocationInput.addEventListener("keydown", function (e) {
      this.keydown(e, 0, 100, this.opacityLocationKeyup)
    }.bind(this));
    this.colorLocationInput.addEventListener("keydown", function (e) {
      this.keydown(e, 0, 100, this.colorLocationKeyup)
    }.bind(this));

    this.opacityLocationInput.addEventListener('keyup', function (e) {
      this.opacityLocationKeyup(e)
    }.bind(this));
    this.colorLocationInput.addEventListener('keyup', function (e) {
      this.colorLocationKeyup(e)
    }.bind(this));
    this.opacityInput.addEventListener('keyup', function (e) {
      this.opacityInputKeyup(e)
    }.bind(this));

    this.opacityLocationInput.addEventListener('blur', function (e) {
      this.opacityLocationBlur(e)
    }.bind(this));
    this.colorLocationInput.addEventListener('blur', function (e) {
      this.colorLocationBlur(e)
    }.bind(this));
    this.opacityInput.addEventListener('blur', function (e) {
      this.opacityInputBlur(e)
    }.bind(this));

    this.previewWidth.addEventListener('keydown', function (e) {
      this.keydown(e, 0, 5000, this.resizePreview)
    }.bind(this));
    this.previewHeight.addEventListener('keydown', function (e) {
      this.keydown(e, 0, 5000, this.resizePreview)
    }.bind(this));
    this.previewWidth.addEventListener('keyup', function (e) {
      this.resizePreview(e)
    }.bind(this));
    this.previewHeight.addEventListener('keyup', function (e) {
      this.resizePreview(e)
    }.bind(this));

    // load default library
    this.cpLibrary.libraryNameCombo.setValue("Default");
    this.cpLibrary.libraryNameCombo.settings.cbChange({value: "Default"}, true);

    this.showTab(0);
    this.showGradient(this.settings.startColor);
    if (this.settings.cbCreate) {
      if (Array.isArray(this.settings.cbCreate)) {
        for (var i = 0; i < this.settings.cbCreate.length; i++) {
          this.settings.cbCreate[i](this);
        }
      } else {
        this.settings.cbCreate(this);
      }
    }
  }

  Gradient.prototype.onLoad = function () {
    var _this = this;
    if (this.init)
      return;
    this.init = true;
    $ms.removeClass(this.container, "display-none");
    this.drop();
    this.resizePreview();

    this.observer = new $ms.MutationObserver();
    this.observer.observe("#" + this.tabsContainer.id,
            {observe: {attributes: true, attributeOldValue: true, attributeFilter: ['style']},
              querySelectorAll: false,
              cb: function (target, changes) {
                try {
                  _this.resizePreview.call(_this);
                } catch (e) {
                }
              }.bind(this),
              property: ["height", "width"],
            }
    );
  }
  Gradient.prototype.showGradient = function (string) {
    if (string.indexOf("gradient") !== -1) {
      this.showGradientFromString(string);
    } else {
      this.showGradientFromColor(string);
    }
    this.onLoad();
  }

  // start gradient from the existing color and opacity
  Gradient.prototype.showGradientFromColor = function (colorString, add) {
    // unload the existing gradient
    if (colorString.indexOf("gradient") !== -1) {
      this.showGradientFromString(colorString, add);
      return;
    }
    this.resetSliders();
    this.gradient = {};
    this.string = undefined;
    this.currStop = -1;

    // create the first two stops at 0% and 100%
    var rgba, alpha = 1;
    var color = $msRoot.colorMethods.colorInfo(colorString);
    if (color.rgbString == "") {
      rgba = $msRoot.colorMethods.rgbToRgba([255, 255, 255], 1);
    } else {
      // use current color to start
      rgba = color.rgbString;
    }
    this.layerBusy = true;
    this.addStop({position: 0, colorValue: rgba, type: "color", makeActive: true});
    this.addStop({position: 100, colorValue: rgba, type: "color"});
    this.addStop({position: 0, opacityValue: 1, type: "opacity"});
    this.addStop({position: 100, opacityValue: 1, type: "opacity"});
    this.layerBusy = false;

    // start with color active
    this.currStop = 0;
    this.selectStopSlider(this.cs[0].slider);

    // create new gradient in first layer
    if (add) {
      this.aGradient.splice(0, 0, this.gradient);
    } else {
      this.resetLayers();
      this.aGradient = [this.gradient];
    }
    this.currLayer = 0;
    this.createLayerLi(0);
    this.selectLayer(this.aGradient[0].li);

    this.updateVisuals();
    if (this.settings.startColor.length == 0) {
      this.settings.startColor = this.string.noPrefix;
    }
  }

  Gradient.prototype.resetLayers = function () {
    while (this.layersUl.hasChildNodes()) {
      this.layersUl.removeChild(this.layersUl.firstChild);
    }
  }

  Gradient.prototype.createLayerLi = function (pos) {
    var li = document.createElement("li");
    li.id = this.id + "li-" + this.layerCounter++;
    li.className = "li-layer";
    this.aGradient[pos].string = this.getGradientString(this.aGradient[pos]);
    this.aGradient[pos].li = li;
    var selectLayerBind = this.selectLayer.bind(this);
    var divOuter = document.createElement("div");
    divOuter.className = "ms-cp-transparent-grid";
    li.appendChild(divOuter);
    var divInner = document.createElement("div");
    !function (li) {
      li.addEventListener('click', function () {
        selectLayerBind(li, true)
      });
    }(li)

    // add layers li as draggable
    var settings = {
      scope: "layers",
      containment: this.layersUl
    }
    $ms.draggable(li, settings);

    // also allow the li to be a drop target
    var settings = {
      scope: "layers",
      insert: "li.li-layer",
      classes: {active: "ms-highlight-border"},
      cbDrop: this.updateFromDragDrop.bind(this)
    }
    $ms.droppable(li, settings);

    divOuter.appendChild(divInner);
    this.setBackground(divInner, this.aGradient[pos].string);
    if (this.layersUl.childNodes.length < pos + 1) {
      this.layersUl.appendChild(li);
    } else {
      this.layersUl.insertBefore(li, this.layersUl.childNodes[pos]);
    }
  }
  Gradient.prototype.showGradientFromString = function (gradientString, add) {
    // parsed gradient is an object with format or null if empty
    // gradient.direction		(e.g. to bottom)
    // gradient.string
    // gradient.sideCorner	(e.g. bottom)
    // gradient.colorStop		- an array of stop info
    //		.colorStop[i].rgbString	- rgb() or rgba()
    //		.colorStop[i].position  - stop position percentage (including percent sign)
    //		.colorStop[i].alpha	- alpha value
    //		.colorStop[i].hex	- hex value
    //		.colorStop[i].rgb	- array of rgb values

    if (typeof gradientString !== "undefined" && typeof this.settings.startColor == "undefined") {
      this.settings.startColor = gradientString;
    }
    if (gradientString.indexOf("gradient") == -1) {
      this.showGradientFromColor(gradientString);
      return;
    }

    var aGradient = this.getParsedGradient(gradientString);

    if (!aGradient || aGradient.length == 0) {
      this.showGradientFromColor("rgba(255, 255, 255, 1)");
      return;
    }
    // create new gradient in first layer
    if (add) {
      // insert from the top
      for (var i = 0; i < aGradient.length; i++) {
        this.aGradient.splice(i, 0, aGradient[i]);
        this.createLayerLi(i);
      }
    } else {
      this.resetLayers();
      this.aGradient = aGradient
      for (var i = 0; i < aGradient.length; i++) {
        this.createLayerLi(i);
      }
    }
    // unload the existing gradient
    this.resetSliders(add);

    this.selectLayer(this.aGradient[0].li);
    this.currLayer = 0;

    // set the current gradient
    this.gradient = this.aGradient[this.currLayer];
    this.string = this.gradient.string;
    // set the direction
    this.direction.value = this.gradient.direction;
    if (typeof this.gradient.angle !== "undefined") {
      var direction = this.angleToDirection(this.gradient.angle)
      if (direction !== false) {
        // passed as angle - convert to text
        this.gradient.direction = direction;
        this.direction.value = direction;
      } else if (this.gradient.angle.indexOf("deg") !== -1) {
        // degrees
        var angle = parseInt(this.gradient.angle);
        // add a new option in the direction combobox
        this.direction.value = this.addDegreeComboOption(angle);
      }
    }

    // set shorthand notation
    this.cs = this.gradient.colorStop;
    // create sliders from colorStops
    this.colorStopsToSliders();
    // start with color active
    for (var i = 0; i < this.cs.length; i++) {
      if (this.cs[i].type == "color") {
        this.currStop = i;
        this.selectStopSlider(this.cs[i].slider);
        break;
      }
    }

    $ms.removeClass(this.container, "display-none");
    this.positionArrows();

    this.currLayer = 0;
    // this.updateLayers();
  }

  Gradient.prototype.addDegreeComboOption = function (degrees) {
    degrees = parseInt("" + degrees);
    if (isNaN(degrees))
      return "";
    var value = "degrees: " + degrees;
    for (var i = 0; i < this.direction.options.length; i++) {
      if (this.direction.options[i].value.substr(0, 9) == "degrees: ") {
        // remove all custom degrees options so only 1 remains
        this.direction.removeChild(this.direction.options[i])
      }
    }
    // new option
    var option = document.createElement("option");
    option.value = value;
    option.innerHTML = value;
    this.direction.appendChild(option);
    return value;
  }

  Gradient.prototype.bringToFront = function () {
    var max = 0;
    for (var i = 0; i < instance.length; i++) {
      if (instance.id !== this.id) {
        max = Math.max(max, parseInt(instance[i].container.style.zIndex));
      }
    }
    var cp = $msRoot.ColorPicker.getInstance();
    for (var i = 0; i < cp.length; i++) {
      max = Math.max(max, parseInt(cp[i].container.style.zIndex));
    }
    this.container.style.zIndex = Math.max(parseInt(this.container.style.zIndex), max + 1);
  }

  Gradient.prototype.createForm = function () {
    var tr, td, div, input, label;

    var gradientDiv = document.createElement("div");
    gradientDiv.id = this.id + "container";
    gradientDiv.className = "ms-gradient draggable target display-none";
    gradientDiv.style.top = this.settings.top;
    gradientDiv.style.left = this.settings.left;
    gradientDiv.style.zIndex = this.settings.zIndex;

    var divTitleBar = document.createElement("div");
    divTitleBar.id = this.id + "title-bar";
    divTitleBar.className = "ms-title-bar draghandle";
    divTitleBar.draggable = true;
    divTitleBar.innerHTML = "Gradient Generator";
    divTitleBar.addEventListener("mousedown", function () {
      this.bringToFront()
    }.bind(this));
    var div = $ms.createCloseButton(this.id, function () {
      this.cancel()
    }.bind(this));

    divTitleBar.appendChild(div);
    gradientDiv.appendChild(divTitleBar);

    var divLeftOuter = document.createElement("div");
    divLeftOuter.className = "ms-gradient-left-outer";
    gradientDiv.appendChild(divLeftOuter);

    var divDirection = document.createElement("div");
    divDirection.className = "ms-gradient-direction";
    divLeftOuter.appendChild(divDirection);

    // direction
    var lblDirection = document.createElement("div");
    lblDirection.innerHTML = "Direction";
    lblDirection.className = "ms-gradient-label";
    divDirection.appendChild(lblDirection);

    var options = [
      {label: "bottom ↓", value: "to bottom"},
      {label: "right →", value: "to right"},
      {label: "top ↑", value: "to top"},
      {label: "left ←", value: "to left"},
      {label: "top right ↗", value: "45deg"}, // "to top right"
      {label: "bottom right ↘", value: "135deg"}, //"to bottom right"
      {label: "bottom left ↙", value: "225deg"}, //"to bottom left"
      {label: "top left ↖", value: "315deg"}, // to top left
      {label: "radial ○", value: "radial"},
      {label: "degrees", value: "degrees"}
    ];
    var settings = {onchange: function () {
        this.gradient.direction = this.direction.value;
        if (this.direction.value == "degrees") {
          if (!this.degreesDialogOpen) {
            this.degreesDialog();
          }
        } else {
          this.gradient.degrees = this.validateDegrees(this.gradient.direction);
          this.updateVisuals();
        }
      }.bind(this),
      defaultValue: "to bottom"};
    var inputDirection = $ms.createCombo(options, settings);
    inputDirection.id = this.id + "gradient-direction";
    inputDirection.style.marginTop = "5px";
    inputDirection.style.fontSize = "90%";
    divDirection.appendChild(inputDirection);

    var divSliderOuter = document.createElement("div");
    divSliderOuter.className = "ms-gradient-slider-outer";
    divLeftOuter.appendChild(divSliderOuter);

    // opacity stop container
    var divOpacityStopContainer = document.createElement("div");
    divOpacityStopContainer.id = this.id + "opacity-stop-container";
    divOpacityStopContainer.style.width = "100%";
    divOpacityStopContainer.style.position = "relative";
    divSliderOuter.appendChild(divOpacityStopContainer);

    // opacity delete area
    var divOpacityDeleteArea = document.createElement("div");
    divOpacityDeleteArea.id = this.id + "opacity-delete-area";
    divOpacityDeleteArea.style.marginBottom = "5px";
    divOpacityDeleteArea.style.height = "10px";
    divOpacityDeleteArea.style.width = "350px";
    divOpacityStopContainer.appendChild(divOpacityDeleteArea);

    // opacity bar (top)
    var divOpacityBar = document.createElement("div");
    divOpacityBar.id = this.id + "opacity-bar";
    divOpacityBar.className = "ms-gradient-slider-bar ms-gradient-opacity-bar";
    divOpacityBar.style.height = "20px";
    divOpacityBar.style.width = "350px";
    divOpacityStopContainer.appendChild(divOpacityBar);

    // gradient bar (middle)
    var divGradientBarOuter = document.createElement("div");
    divGradientBarOuter.style.height = "20px";
    divGradientBarOuter.style.width = "350px";
    divGradientBarOuter.className = "ms-cp-transparent-grid";
    divSliderOuter.appendChild(divGradientBarOuter);

    var divGradientBar = document.createElement("div");
    divGradientBar.id = this.id + "gradient-bar";
    divGradientBar.style.height = "100%";
    divGradientBar.style.width = "100%";
    divGradientBarOuter.appendChild(divGradientBar);

    // color stop container
    var divColorStopContainer = document.createElement("div");
    divColorStopContainer.id = this.id + "color-stop-container";
    divColorStopContainer.style.position = "relative";
    divColorStopContainer.style.width = "350px";
    divSliderOuter.appendChild(divColorStopContainer);

    // Color bar (bottom)
    var divColorBar = document.createElement("div");
    divColorBar.id = this.id + "color-bar"
    divColorBar.className = "ms-gradient-slider-bar ms-gradient-color-bar";
    divColorBar.style.height = "20px";
    divColorBar.style.width = "350px";
    divColorStopContainer.appendChild(divColorBar);

    // color delete area
    var divColorDeleteArea = document.createElement("div");
    divColorDeleteArea.id = this.id + "color-delete-area";
    divColorDeleteArea.style.marginTop = "5px";
    divColorDeleteArea.style.height = "10px";
    divColorDeleteArea.style.width = "350px";
    divColorStopContainer.appendChild(divColorDeleteArea);

    //
    var resetButton = document.createElement("div");
    resetButton.className = "ms-gradient-reset";
    resetButton.title = "Reset default color stop - will calculate based on position not last deleted stop."
    resetButton.addEventListener('click', function (e) {
      this.lastDeletedStop = {color: undefined, alpha: undefined};
    }.bind(this));
    divSliderOuter.appendChild(resetButton);

    var reverseButton = document.createElement("div");
    reverseButton.className = "ms-gradient-reverse";
    reverseButton.title = "Reverse order of color stops."
    reverseButton.addEventListener('click', function (e) {
      for (var i = 0; i < this.cs.length; i++) {
        this.cs[i].position = 100 - this.cs[i].position;
      }
      this.selectLayer(this.aGradient[this.currLayer].li, true);
      this.updateVisuals();
    }.bind(this));
    divSliderOuter.appendChild(reverseButton);

    // input area
    // stops
    var divTitleStops = document.createElement("div");
    divTitleStops.className = "ms-gradient-title-stops";
    divTitleStops.innerHTML = "Stops";
    divLeftOuter.appendChild(divTitleStops);

    var table = document.createElement("table");
    table.className = "ms-gradient-stop-table";
    var colWidths = [155, 155];
    var colgroup = document.createElement('colgroup');
    table.appendChild(colgroup);
    for (var i = 0; i < colWidths.length; i++) {
      var col = document.createElement('col');
      colgroup.appendChild(col);
      col.style.width = colWidths[i] + "px";
    }
    divLeftOuter.appendChild(table);

    var tr = document.createElement("tr");
    table.appendChild(tr);

    var td = document.createElement("td");
    td.style.verticalAlign = "top";
    tr.appendChild(td);

    var lblOpacity = document.createElement("div");
    lblOpacity.innerHTML = "Opacity";
    lblOpacity.className = "ms-gradient-label";
    lblOpacity.style.width = "50px";
    td.appendChild(lblOpacity);

    var settings = {
      min: 0,
      max: 100,
      snapX: 1,
      sliderWidth: 65,
      inputWidth: 30,
      inputId: this.id + "opacity-stop-input",
      textAfterInput: " %",
      button: false,
      sliderInput: true,
      parentNode: td,
      imgPath: this.settings.imgPath
    }
    this.opacitySlider = new $msRoot.Slider(undefined, settings);
    this.opacitySlider.onValuesChanged = function () {
      this.opacityInput.value = parseInt(this.opacitySlider.xValue);
      this.updateGradientFromInput();
      this.updateVisuals();
    }.bind(this);

    // location second column
    var td = document.createElement("td");
    td.style.verticalAlign = "top";
    tr.appendChild(td);

    var lblLocation = document.createElement("div");
    lblLocation.innerHTML = "Location";
    lblLocation.className = "ms-gradient-label";
    td.appendChild(lblLocation);

    var inputLocation = document.createElement("input");
    inputLocation.id = this.id + "opacity-stop-location";
    inputLocation.size = 3;
    inputLocation.style.display = "inline-block";
    inputLocation.style.width = "35px";
    td.appendChild(inputLocation);

    var lblPercent = document.createElement("div");
    lblPercent.innerText = "%";
    lblPercent.style.display = "inline-block";
    lblPercent.style.marginLeft = "2px";
    lblPercent.style.marginRight = "5px";
    td.appendChild(lblPercent);

    var buttonDeleteOpacityStop = document.createElement("div");
    buttonDeleteOpacityStop.style.display = "inline-block";
    buttonDeleteOpacityStop.style.width = "45px";
    buttonDeleteOpacityStop.innerHTML = "Delete";
    buttonDeleteOpacityStop.className = "ms-gradient-button";
    buttonDeleteOpacityStop.addEventListener('click', function (e) {
      this.deleteOpacityStop(e)
    }.bind(this));
    td.appendChild(buttonDeleteOpacityStop);

    // color
    var tr = document.createElement("tr");
    table.appendChild(tr);
    var td = document.createElement("td");
    td.style.verticalAlign = "top";
    tr.appendChild(td);

    var lblColor = document.createElement("div");
    lblColor.innerText = "Color";
    lblColor.className = "ms-gradient-label";
    lblColor.style.width = "50px";
    td.appendChild(lblColor);

    var inputColor = document.createElement("div");
    inputColor.id = this.id + "color-stop-input";
    inputColor.className = "ms-gradient-color-stop-input";
    inputColor.addEventListener("click", function () {
      if (this.colorInputSelected("color-input")) {
        this.openColorPicker();
      }
    }.bind(this))
    td.appendChild(inputColor);

    var button = document.createElement("div");
    button.className = "ms-gradient-button ms-button-tool ms-gradient-color-stop-button";
    button.innerHTML = "►";   // &#9658
    button.addEventListener("click", function () {
      if (this.colorInputSelected("color-input")) {
        this.openColorPicker();
      }
    }.bind(this))
    td.appendChild(button);

    // location second column
    var td = document.createElement("td");
    td.style.verticalAlign = "top";
    tr.appendChild(td);

    var lblLocation = document.createElement("div");
    lblLocation.innerText = "Location";
    lblLocation.className = "ms-gradient-label";
    td.appendChild(lblLocation);

    var inputLocation = document.createElement("input");
    inputLocation.id = this.id + "color-stop-location";
    inputLocation.size = 3;
    inputLocation.style.display = "inline-block";
    inputLocation.style.width = "35px";
    td.appendChild(inputLocation);

    var lblPercent = document.createElement("div");
    lblPercent.innerText = "%";
    lblPercent.style.display = "inline-block";
    lblPercent.style.marginLeft = "2px";
    lblPercent.style.marginRight = "5px";
    td.appendChild(lblPercent);

    var buttonDeleteColorStop = document.createElement("div");
    buttonDeleteColorStop.style.display = "inline-block";
    buttonDeleteColorStop.style.width = "45px";
    buttonDeleteColorStop.innerHTML = "Delete";
    buttonDeleteColorStop.className = "ms-gradient-button";
    buttonDeleteColorStop.addEventListener('click', function (e) {
      this.deleteColorStop(e)
    }.bind(this));
    td.appendChild(buttonDeleteColorStop);

    var divTabContainer = this.createTabs(["Preview", "CSS", "Layers", "Import"]);
    divTabContainer.id = this.id + "tab-container";
    $ms.addClass(divTabContainer, "ms-gradient-tab-container");
    divLeftOuter.appendChild(divTabContainer);

    // preview && export to png
    var divOuter = document.createElement("div");
    divOuter.id = this.id + "preview-outer";
    divOuter.style.backgroundColor = "rgb(240,240,240)";
    divOuter.className = "ms-gradient-css display-none";
    divTabContainer.appendChild(divOuter);

    var divExport = document.createElement("div");
    divExport.appendChild(document.createTextNode("Enter dimensions."));
    divExport.className = "ms-gradient-export-input"
    divExport.style.padding = "0 5px";
    divOuter.appendChild(divExport);

    var table = document.createElement("table");
    table.width = "100%";
    var tr = document.createElement("tr");
    var td = document.createElement("td");
    td.appendChild(document.createTextNode("Width: "));
    tr.appendChild(td);

    var td = document.createElement("td");
    var inputWidth = document.createElement("input");
    inputWidth.id = this.id + "export-width";
    inputWidth.value = "200";
    inputWidth.size = "8";
    td.appendChild(inputWidth);
    tr.appendChild(td);
    table.appendChild(tr);

    var tr = document.createElement("tr");
    var td = document.createElement("td");
    td.appendChild(document.createTextNode("Height: "));
    tr.appendChild(td);

    var td = document.createElement("td");
    var inputHeight = document.createElement("input");
    inputHeight.id = this.id + "export-height";
    inputHeight.size = "8";
    inputHeight.value = "200";
    td.appendChild(inputHeight);
    tr.appendChild(td);
    table.appendChild(tr);

    var tr = document.createElement("tr");
    var td = document.createElement("td");
    td.colSpan = 2;
    var exportPNGButton = document.createElement("div");
    exportPNGButton.innerHTML = "Download PNG";
    exportPNGButton.className = "ms-gradient-button";
    exportPNGButton.style.marginLeft = "45px";
    //exportPNGButton.style.width =  "40px"
    exportPNGButton.style.display = "inline-block"
    exportPNGButton.addEventListener('click', function (e) {
      this.downloadPNG(this.aGradient, {width: inputWidth.value, height: inputHeight.value})
    }.bind(this));
    td.appendChild(exportPNGButton);
    tr.appendChild(td);
    table.appendChild(tr);

    divExport.appendChild(table);

    // wrapper stays at 100% and give the max boundaries to the preview
    var divPreviewWrapper = document.createElement("div");
    divPreviewWrapper.id = this.id + "preview-wrapper";
    divPreviewWrapper.className = "ms-gradient-preview-wrapper";
    divOuter.appendChild(divPreviewWrapper);

    // wrapper2 holds the transparent background
    var divPreviewWrapper2 = document.createElement("div");
    divPreviewWrapper2.id = this.id + "preview-wrapper2";
    divPreviewWrapper2.className = "ms-cp-transparent-grid ms-gradient-preview-wrapper2";
    divPreviewWrapper.appendChild(divPreviewWrapper2);

    // the actual preview
    var divPreviewInner = document.createElement("div");
    divPreviewInner.id = this.id + "preview";
    divPreviewInner.className = "ms-gradient-preview-inner";
    divPreviewWrapper2.appendChild(divPreviewInner);

    // css
    var divCssOuter = document.createElement("div");
    divCssOuter.id = this.id + "css-outer";
    divCssOuter.className = "ms-gradient-css display-none";
    divTabContainer.appendChild(divCssOuter);

    // shows the value of the current gradient
    var divCssText = document.createElement("div");
    divCssText.id = this.id + "css-text";
    divCssText.className = "ms-gradient-css-text"
    divCssOuter.appendChild(divCssText);

    var buttonCopyCss = document.createElement("div");
    buttonCopyCss.innerHTML = "Copy";
    buttonCopyCss.className = "ms-gradient-button ms-gradient-copy-button";
    buttonCopyCss.style.width = "40px";
    buttonCopyCss.style.right = "40px"
    buttonCopyCss.addEventListener('click', function (e) {
      var text = divCssText.innerHTML.replace(/<\/div><div>/g, "\n").replace(/<[^>]+>/g, "");
      $ms.copyToClipboard(text);
      $ms.removeClass($ms.$(this.id + "copy-status"), "display-none");
      setTimeout(function () {
        $ms.addClass($ms.$(this.id + "copy-status"), "display-none")
      }.bind(this), 1000);
    }.bind(this));
    divCssOuter.appendChild(buttonCopyCss);

    var buttonRgbCss = document.createElement("div");
    buttonRgbCss.innerHTML = "RGB";
    buttonRgbCss.className = "ms-gradient-button ms-gradient-copy-button";
    buttonRgbCss.style.width = "40px";
    buttonRgbCss.style.right = "85px"
    buttonRgbCss.addEventListener('click', function (e) {
      this.cssMode = "rgb";
      this.cssText.innerHTML = this.getCssText(this.cssMode);
    }.bind(this));
    divCssOuter.appendChild(buttonRgbCss);

    var buttonHslCss = document.createElement("div");
    buttonHslCss.innerHTML = "HSL";
    buttonHslCss.className = "ms-gradient-button ms-gradient-copy-button";
    buttonHslCss.style.width = "40px";
    buttonHslCss.style.right = "130px"
    buttonHslCss.addEventListener('click', function (e) {
      this.cssMode = "hsl";
      this.cssText.innerHTML = this.getCssText(this.cssMode);
    }.bind(this));
    divCssOuter.appendChild(buttonHslCss);

    var buttonHexCss = document.createElement("div");
    buttonHexCss.innerHTML = "Hex";
    buttonHexCss.className = "ms-gradient-button ms-gradient-copy-button";
    buttonHexCss.style.width = "45px";
    buttonHexCss.style.right = "175px"
    buttonHexCss.addEventListener('click', function (e) {
      this.cssMode = "hex";
      this.cssText.innerHTML = this.getCssText(this.cssMode);
    }.bind(this));
    divCssOuter.appendChild(buttonHexCss);

    var divCssCopyStatus = document.createElement("div");
    divCssCopyStatus.id = this.id + "copy-status";
    divCssCopyStatus.className = "ms-gradient-copy-status display-none";
    divCssCopyStatus.innerHTML = "Copied to Clipboard"
    divCssOuter.appendChild(divCssCopyStatus);

    divTabContainer.appendChild(divCssOuter);

    // layers
    var divOuter = document.createElement("div");
    divOuter.id = this.id + "layers-outer";
    divOuter.className = "ms-gradient-layers-outer display-none";
    divTabContainer.appendChild(divOuter);

    var divLayersList = document.createElement("div");
    divLayersList.id = this.id + "layers-listbox";
    divLayersList.className = "ms-gradient-layers-listbox"
    divOuter.appendChild(divLayersList);

    var ul = document.createElement("ul");
    ul.id = this.id + "layer-ul";
    divLayersList.appendChild(ul);
    // add ul as a droppable
    var settings = {
      scope: "layers",
      accept: "",
      append: "li.li-layer",
      noPosition: true,
      insert: "",
      classes: {active: ""},
      cbDrop: this.updateFromDragDrop.bind(this)
    }
    $ms.droppable(ul, settings);

    var buttonDivOuter = document.createElement("div");
    buttonDivOuter.className = "ms-gradient-right-outer";
    gradientDiv.appendChild(buttonDivOuter);

    var buttonDiv = document.createElement("div");
    buttonDiv.className = "ms-gradient-layer-button-div";
    divOuter.appendChild(buttonDiv);

    var button = document.createElement("div");
    button.innerHTML = "Add Layer"
    button.className = "ms-gradient-button ms-gradient-layer-button";
    button.style.display = "inline-block";
    button.addEventListener("click", function (e) {
      this.addLayer()
    }.bind(this));
    buttonDiv.appendChild(button);

    var button = document.createElement("div");
    button.innerHTML = "Delete Layer"
    button.className = "ms-gradient-button ms-gradient-layer-button";
    button.style.display = "inline-block";
    button.addEventListener("click", function (e) {
      this.deleteLayer()
    }.bind(this));
    buttonDiv.appendChild(button);

    var divLayersPreview = document.createElement("div");
    divLayersPreview.id = this.id + "layers-preview-wrapper";
    divLayersPreview.className = "ms-cp-transparent-grid ms-gradient-preview-wrapper";
    divOuter.appendChild(divLayersPreview);

    // import
    var divImportOuter = document.createElement("div");
    divImportOuter.id = this.id + "import-outer";
    divImportOuter.style.backgroundColor = "rgb(240,240,240)";
    divImportOuter.className = "ms-gradient-css display-none";
    divTabContainer.appendChild(divImportOuter);

    // text to import
    var divImportText = document.createElement("textarea");
    divImportText.id = this.id + "import-text";
    divImportText.placeholder = "Enter a gradient string to import. Use Mozilla, Webkit, or W3C format: (e.g. linear-gradient(to top, rgb(0,0,0) 0%, rgba(255,0,0,0) 100%)"
    divImportText.className = "ms-gradient-css-text"
    divImportText.style.resize = "none";
    divImportOuter.appendChild(divImportText);

    var buttonImport = document.createElement("div");
    buttonImport.innerHTML = "Import";
    buttonImport.className = "ms-gradient-button ms-gradient-copy-button";
    buttonImport.addEventListener('click', function (e) {
      this.showGradientFromString(divImportText.value);
    }.bind(this));
    divImportOuter.appendChild(buttonImport);

    // buttons and library
    var buttonDivOuter = document.createElement("div");
    buttonDivOuter.className = "ms-gradient-right-outer";
    gradientDiv.appendChild(buttonDivOuter);

    var buttonDivInner = document.createElement("div");
    buttonDivInner.style.height = "110px";
    buttonDivOuter.appendChild(buttonDivInner);

    var button = document.createElement("div");
    button.innerHTML = "Ok"
    button.className = "ms-gradient-button ms-cp-button";
    button.style.display = "block";
    button.style.width = "120px";
    button.addEventListener("click", function (e) {
      this.save()
    }.bind(this));
    buttonDivInner.appendChild(button);

    var button = document.createElement("div");
    button.innerHTML = "Cancel"
    button.className = "ms-gradient-button ms-cp-button";
    button.style.display = "block";
    button.style.width = "120px";
    button.addEventListener("click", function (e) {
      this.cancel()
    }.bind(this));
    buttonDivInner.appendChild(button);

    // new / undo wrapper
    var undoNewDiv = document.createElement("div");
    undoNewDiv.style.display = "inline-block";
    undoNewDiv.style.width = "120px";
    buttonDivInner.appendChild(undoNewDiv);

    // new
    var button = document.createElement("div");
    button.innerHTML = "New"
    button.className = "ms-gradient-button ms-cp-button";
    button.style.display = "inline-block";
    button.style.width = "53px";
    button.style.marginRight = "11px";
    button.addEventListener("click", function (e) {
      this.cpLibrary.colorDeselect();
      this.showGradientFromColor(this.settings.newGradient);
    }.bind(this));
    undoNewDiv.appendChild(button);

    // undo
    var button = document.createElement("div");
    button.innerHTML = "Undo"
    button.className = "ms-gradient-button ms-cp-button";
    button.style.display = "inline-block";
    button.style.width = "53px";
    button.addEventListener("click", function (e) {
      if (this.undoString) {
        this.showGradientFromString(this.undoString);
      }
    }.bind(this));
    undoNewDiv.appendChild(button);

    // remove
    var button = document.createElement("div");
    button.id = this.id + "remove-gradient";
    button.innerHTML = "Remove Gradient"
    button.className = "ms-gradient-button ms-cp-button";
    button.title = "Click to remove the current gradient and revert to a single color";
    button.style.width = "120px";
    button.addEventListener('click', function (e) {
      this.remove(e)
    }.bind(this));
    buttonDivInner.appendChild(button);

    /*
     * color Library form appended to buttonDivOuter
     */
    buttonDivOuter.appendChild(this.cpLibrary.createForm());

    // add to passed container
    this.settings.container.appendChild(gradientDiv);

    // set font size in percent
    gradientDiv.style.fontSize = $ms.targetFontSize(this.settings.fontSize, gradientDiv);
    return gradientDiv;
  }


  Gradient.prototype.deleteOpacityStop = function () {
    if (this.currStop == -1)
      return;
    this.deleteStop(this.cs[this.currStop].slider);
  }
  Gradient.prototype.deleteColorStop = function () {
    if (this.currStop == -1)
      return;
    this.deleteStop(this.cs[this.currStop].slider);
  }

  Gradient.prototype.colorStopsToSliders = function () {
    // gradient is a parsed gradient object with properties:
    //	string		the original color string
    //	direction	e.g. to bottom
    //	sideCorder	e.g. bottom
    //	colorStop
    // colorStop is an array of objects
    //	rgbString: rgba(147,126,232,0.4)
    //	position: 0%	
    var currStop, prevStop, nextStop;
    var colorStop, opacityStop;

    // remove duplicate stops
    for (var c1 = this.cs.length - 1; c1 >= 0; c1--) {
      for (var c2 = c1 - 1; c2 >= 0; c2--) {
        if (this.cs[c1].rgbString === this.cs[c2].rgbString && parseInt(this.cs[c1].position) == parseInt(this.cs[c2].position)) {
          this.cs.splice(c1, 1);
          break;
        }
      }
    }

    // set colors to first stop to be added
    var opacityCounter = 0;
    var colorCounter = 0;
    var toAdd = [];
    this.currStop = 0;
    for (var i = 0; i < this.cs.length; i++) {
      colorStop = false;
      opacityStop = false;
      prevStop = currStop;
      currStop = this.cs[i];
      if (i < this.cs.length - 1) {
        nextStop = this.cs[i + 1]
      }
      if (i == 0 || this.cs.length < 3) {
        // start with both getting first stop or if only 2 stops duplicate both
        colorStop = true;
        opacityStop = true;
      } else if (i > 0 && i < this.cs.length - 1) {
        // look ahead to see if stop is exactly in middle
        var prevPosition = prevStop.position;
        var nextPosition = nextStop.position;
        var diffAlpha = nextStop.alpha - prevStop.alpha;
        var diffR = nextStop.rgb[0] - prevStop.rgb[0];
        var diffG = nextStop.rgb[1] - prevStop.rgb[1];
        var diffB = nextStop.rgb[2] - prevStop.rgb[2];

        var currPosition = this.cs[i].position;
        var currAlpha = currStop.alpha;
        var currR = currStop.rgb[0];
        var currG = currStop.rgb[1];
        var currB = currStop.rgb[2];

        if (nextPosition - prevPosition == 0) {
          var multiplier = 0;
        } else {
          var multiplier = (currPosition - prevPosition) / (nextPosition - prevPosition);
        }
        opacityStop = $ms.round(multiplier * diffAlpha + prevStop.alpha, 2) !== $ms.round(currAlpha, 2);
        colorStop = !($ms.round(multiplier * diffR + prevStop.rgb[0], 0) == currR &&
                $ms.round(multiplier * diffG + prevStop.rgb[1], 0) == currG &&
                $ms.round(multiplier * diffB + prevStop.rgb[2], 0) == currB);
        if (!opacityStop && !colorStop) {
          // when this stop is exactly in the middle
          colorStop = true;
          opacityStop = true;
        }
      } else if (i == this.cs.length - 1) {
        // will end with both
        colorStop = true;
        opacityStop = true;
      }
      if (colorStop || (!colorStop && !opacityStop)) {
        // if neither color nor opacity stop, set a color stop - we can't tell the difference
        colorCounter++;
        this.cs[i].type = "color";
      }
      if (opacityStop) {
        opacityCounter++;
        if (colorStop && opacityStop) {
          // when a stop is both an opacity and color stop - have two entries in the array
          toAdd.push({rgbString: this.cs[i].rgbString, position: this.cs[i].position, rgb: this.cs[i].rgb, alpha: this.cs[i].alpha, hex: this.cs[i].hex, slider: undefined, type: "opacity"});
        } else {
          this.cs[i].type = "opacity";
        }
      }
    }
    for (var i = 0; i < toAdd.length; i++) {
      this.cs.push(toAdd[i]);
    }
    this.cs.sort(function (a, b) {
      return a.position - b.position
    });
    this.layerBusy = true;
    for (var i = 0; i < this.cs.length; i++) {
      this.addStop({position: this.cs[i].position, index: i, type: this.cs[i].type});
    }
    this.layerBusy = false;
    this.updateVisuals();
  }

  Gradient.prototype.addStop = function (settings) {
    var divColorBar = $ms.$(this.id + settings.type + "-bar");
    var cbSliderBarMousedown, cbSliderArrowMousedown;
    if (!this.gradient)
      this.gradient = {};
    if (!this.gradient.colorStop)
      this.gradient.colorStop = [];
    // short hand notation
    this.cs = this.gradient.colorStop;

    if (!this.gradient.direction) {
      this.gradient.direction = "to bottom";
      this.gradient.sideCorner = "bottom";
    }
    if (this.barMousedownSet.indexOf(divColorBar.id) == -1) {
      // only add listener to each bar once
      this.barMousedownSet.push(divColorBar.id);
      cbSliderBarMousedown = function (e, slider) {
        var position = parseFloat(slider.getValuesFromMousePosition(e).x);
        this.addStop({position: position, newFromPosition: true, type: settings.type, makeActive: true});
        return false;
      }.bind(this);
    }

    var cbSliderArrowMousedown = function (e, slider) {
      // select slider clicked on and deselect otherss	    
      e.stopPropagation();
      e.preventDefault();

      // select the stop
      this.selectStopSlider(slider);
      this.deleteStopListener = function () {
        this.deleteStop(slider)
      }.bind(this);
      if (slider.colorStop.type == "color") {
        $ms.addClass(this.colorDelete, "ms-gradient-delete-bar");
        this.colorDelete.addEventListener("mousemove", this.deleteStopListener);
      } else {
        $ms.addClass(this.opacityDelete, "ms-gradient-delete-bar");
        this.opacityDelete.addEventListener("mousemove", this.deleteStopListener);
      }
      $ms.removeClass(slider.bar, "ms-gradient-slider-bar");
      return true;
    }.bind(this);

    var cbSliderMouseup = function (e, slider) {
      e.stopPropagation();
      e.preventDefault();
      $ms.addClass(slider.bar, "ms-gradient-slider-bar");
      if (slider.colorStop.type == "color") {
        $ms.removeClass(this.colorDelete, "ms-gradient-delete-bar");
        if (this.deleteStopListener) {
          this.colorDelete.removeEventListener("mousemove", this.deleteStopListener);
        }
      } else {
        $ms.removeClass(this.opacityDelete, "ms-gradient-delete-bar");
        if (this.deleteStopListener) {
          this.opacityDelete.removeEventListener("mousemove", this.deleteStopListener);
        }
      }
    }.bind(this);
    var cbSliderArrowDblclick = function (e, slider) {
      e.stopPropagation();
      e.preventDefault();
      if (slider.colorStop.type == "color") {
        this.openColorPicker();
      }
    }.bind(this);

    var sliderSettings = {
      xMinValue: 0, xMaxValue: 100,
      yMinValue: 1, yMaxValue: 1,
      imgPath: this.settings.imgPath,
      arrowImage: undefined,
      sliderArrowClass: "ms-slider-arrow-" + (settings.type == "color" ? "bottom" : "top") + "-unselected",
      container: $ms.$(this.id + settings.type + "-bar"),
      direction: "horizontal",
      snapX: 1,
      cbSliderBarMousedown: cbSliderBarMousedown,
      cbSliderArrowMousedown: cbSliderArrowMousedown,
      cbSliderMouseup: cbSliderMouseup,
      cbSliderArrowDblclick: cbSliderArrowDblclick,
      ignoreBarMousedown: (typeof cbSliderBarMousedown == "undefined")
    }
    var slider = new $msRoot.Slider(divColorBar, sliderSettings);

    // create the inner arrow div that holds the stop's color
    var arrowInner = document.createElement("div");
    arrowInner.id = this.id + "arrow-color"
    arrowInner.className = "ms-slider-arrow-inner ms-slider-arrow-inner-" + settings.type;
    slider.arrow.appendChild(arrowInner);
    slider.arrow.title = settings.type.charAt(0).toUpperCase() + settings.type.slice(1) + " Stop";
    slider.arrowInner = arrowInner;

    // gradient is a parsed gradient object with properties:
    //	orignal
    //	direction	e.g. to bottom
    //	sideCorder	e.g. bottom
    //	colorStop
    // colorStop is an array of objects
    //	color: rgba(147,126,232,0.4)
    //	position: 0%	

    // update the array of colorstops
    var color;
    var oppositeType = settings.type == "color" ? "opacity" : "color";
    if (typeof settings.colorValue !== "undefined") {
      // if first two stops, use the color as is
      color = $msRoot.colorMethods.colorInfo(settings.colorValue);
      this.cs.push({rgbString: settings.colorValue, position: settings.position, rgb: color.rgb, alpha: color.alpha, hex: color.hex, slider: slider, type: settings.type});
      settings.index = this.cs.length - 1
    } else if (typeof settings.opacityValue !== "undefined") {
      // if first two stops, use the opacity as is
      // get the color at the position adding opacity stop
      // but use the passed opacity
      color = this.valueFromPosition(settings.position, oppositeType);
      this.cs.push({rgbString: color.rgbString, position: settings.position, rgb: color.rgb, alpha: settings.opacityValue, hex: color.hex, slider: slider, type: settings.type});
      settings.index = this.cs.length - 1
    } else if (typeof settings.index !== "undefined") {
      // existing colorStop - on entering adding each colorstop
      // connect the slider to the colorstop
      this.cs[settings.index].slider = slider;
    } else if (typeof settings.newFromPosition) {
      // get a color from the position clicked on bar
      color = this.valueFromPosition(settings.position, "any");
      if (settings.type == "color" && typeof this.lastDeletedStop.color !== "undefined") {
        // use previously deleted color if any
        var alpha = color.alpha
        color = $msRoot.colorMethods.colorInfo(this.lastDeletedStop.color.rgbString);
        color.alpha = alpha;
      } else if (settings.type == "opacity" && typeof this.lastDeletedStop.opacity !== "undefined") {
        // use previously deleted opacity if any
        color.alpha = this.lastDeletedStop.opacity.alpha;
      }
      this.cs.push({rgbString: color.rgbString, position: settings.position, rgb: color.rgb, alpha: color.alpha, hex: color.hex, slider: slider, type: settings.type});
      settings.index = this.cs.length - 1;
    }
    // set the initial value
    // each slider has a position and colorStop associated with it
    // every slider's position and colorStop info recalculated when any slider moves
    slider.xValue = settings.position;
    slider.setArrowPositionFromValues();
    slider.colorStop = this.cs[settings.index];
    if (settings.type == "color") {
      slider.arrowInner.style.backgroundColor = "rgb(" + slider.colorStop.rgb[0] + "," + slider.colorStop.rgb[1] + "," + slider.colorStop.rgb[2] + ")";
    } else {
      // show the opacity on the inner arrow div 0 = white 100 = black
      var value = slider.colorStop.alpha * 255;
      slider.arrowInner.style.backgroundColor = "rgb(" + value + "," + value + "," + value + ")";
    }

    // save our sliders
    // this.colorStopSliders.push(slider);

    if (settings.makeActive) {
      this.currStop = settings.index;
      this.selectStopSlider(slider);
    }
    this.updateVisuals();

    slider.onValuesChanged = function (slider) {
      // select the slider
      this.gradientValuesChanged(slider);
      this.updateVisuals();
    }.bind(this)
  }

  Gradient.prototype.deleteStop = function (slider) {
    var sliders = this.getFilteredStopType(slider.colorStop.type);
    var bar;
    if (slider.colorStop.type == "color") {
      bar = this.colorDelete;
    } else {
      bar = this.opacityDelete;
    }

    if (sliders.length < 3) {
      $ms.removeClass(bar, "ms-gradient-delete-bar");
      $ms.addClass(bar, "ms-gradient-delete-bar-not-allowed");
      setTimeout(function () {
        $ms.removeClass(bar, "ms-gradient-delete-bar-not-allowed")
      }.bind(this), 1000);
      return;
    }

    setTimeout(function () {
      $ms.removeClass(bar, "ms-gradient-delete-bar")
    }.bind(this), 1000);
    bar.removeEventListener("mousemove", this.deleteStopListener);

    //save last deleted of each type - next one added will use those settings
    this.lastDeletedStop[slider.colorStop.type] = {rgbString: slider.colorStop.rgbString, alpha: slider.colorStop.alpha};
    for (var i = 0; i < this.cs.length; i++) {
      if (this.cs[i].slider.id == slider.id) {
        this.cs.splice(i, 1);
        break;
      }
    }
    // with delete of slider won't have mouse up - restore the cursor
    $ms.addClass(slider.bar, "ms-gradient-slider-bar");
    slider.close();
    // deselect all
    this.selectStopSlider();
    if (slider.colorStop.type == "opacity") {
      // deleted opacity slider
      this.recalcOpacityForColorStops();
    } else if (slider.colorStop.type == "color") {
      // deleted color slider
      this.recalcColorForOpacityStops();
    }
    this.updateVisuals();
  }

  Gradient.prototype.gradientValuesChanged = function (slider) {
    var color;
    if (!slider && this.currStop == -1)
      return;
    if (!slider)
      slider = this.cs[this.currStop].slider;
    var position = parseInt(slider.xValue);

    // update the color stop
    slider.colorStop.position = position;

    if (slider.colorStop.type == "opacity") {
      // opacity change
      var color = this.valueFromPosition(position, "color");
      // the color has to be recalculated
      slider.colorStop.hex = color.hex;
      slider.colorStop.rgb = color.rgb;
      // keeps existing alpha
      slider.colorStop.rgbString = $msRoot.colorMethods.rgbToRgba(color.rgb, slider.colorStop.alpha);
      // update separate opacity slider
      this.opacitySlider.xValue = this.opacityInput.value;
      this.opacitySlider.setArrowPositionFromValues();
      //must also update color stop's opacity
      this.recalcOpacityForColorStops();
    } else if (slider.colorStop.type == "color") {
      // color change
      var color = this.valueFromPosition(position, "opacity");
      // the opacity needs to be recalculated
      slider.colorStop.alpha = color.alpha;
      // keeps existing color
      slider.colorStop.rgbString = $msRoot.colorMethods.rgbToRgba(slider.colorStop.rgb, color.alpha);
      //must also update opacity stop's color
      this.recalcColorForOpacityStops();
    }
  }
  Gradient.prototype.recalcOpacityForColorStops = function () {
    var colorStops = this.getFilteredStopType("color");
    for (var i = 0; i < colorStops.length; i++) {
      var color2 = this.valueFromPosition(colorStops[i].position, "opacity")
      colorStops[i].alpha = color2.alpha;
      // keeps existing color
      colorStops[i].rgbString = $msRoot.colorMethods.rgbToRgba(colorStops[i].rgb, color2.alpha);
    }
  }
  Gradient.prototype.recalcColorForOpacityStops = function () {
    var colorStops = this.getFilteredStopType("opacity");
    for (var i = 0; i < colorStops.length; i++) {
      var color2 = this.valueFromPosition(colorStops[i].position, "color")
      colorStops[i].hex = color2.hex;
      colorStops[i].rgb = color2.rgb;
      // keeps existing alpha
      colorStops[i].rgbString = $msRoot.colorMethods.rgbToRgba(color2.rgb, colorStops[i].alpha);
    }
  }

  Gradient.prototype.getFilteredStopType = function (type) {
    var clone = this.cs.slice();
    clone.sort(function (a, b) {
      return a.position - b.position
    });
    if (type == "any") {
      return clone;
    }
    var stops = [];
    for (var i = 0; i < clone.length; i++) {
      // get list of just opacity or color stops
      if (clone[i].type !== type)
        continue;
      stops.push(clone[i]);
    }
    return stops;
  }
  Gradient.prototype.valueFromPosition = function (position, targetType) {
    if (typeof targetType == "undefined") {
      targetType = "any";
    }
    var clone = this.getFilteredStopType(targetType);
    // take the stops on either side of the position
    var prevPosition = 0, nextPosition = 0,
            nextRgba = {alpha: 1, rgb: [0, 0, 0]},
            prevRgba = {alpha: 1, rgb: [0, 0, 0]};
    for (var i = 0; i < clone.length; i++) {
      if (+clone[i].position == +position) {
        // target position is at an existing location, copy it
        return clone[i];
      } else if (+clone[i].position > +position) {
        // target position before the current stop
        // make sure convert string to number when comparing value (added + before)
        if (i == 0) {
          // target position is before the first stop, return copy of the 1st color
          return clone[i];
        } else {
          // target position is before the current stop
          nextPosition = clone[i].position;
          nextRgba = clone[i];
          break;
        }
      } else {
        // target position after the current stop
        // this may be true for multiple stops, take the last one where it is true
        prevPosition = clone[i].position;
        prevRgba = clone[i];
      }
    }
    var diffAlpha = (parseFloat(prevRgba.alpha) - parseFloat(nextRgba.alpha));
    var diffR = prevRgba.rgb[0] - nextRgba.rgb[0];
    var diffG = prevRgba.rgb[1] - nextRgba.rgb[1];
    var diffB = prevRgba.rgb[2] - nextRgba.rgb[2];

    var multiplier = 0;
    if (nextPosition - prevPosition > 0) {
      multiplier = (position - prevPosition) / (nextPosition - prevPosition);
    }

    // check opacity
    var alpha = $ms.round(prevRgba.alpha - multiplier * diffAlpha, 2);
    var rgb = [$ms.round(prevRgba.rgb[0] - multiplier * diffR, 0),
      $ms.round(prevRgba.rgb[1] - multiplier * diffG, 0),
      $ms.round(prevRgba.rgb[2] - multiplier * diffB, 0)];
    return $msRoot.colorMethods.colorInfo(rgb, alpha);
  }

  Gradient.prototype.updateInputValuesFromStop = function () {
    // redraw the gradient on the bar
    if (this.currStop == -1)
      return;
    if (this.cs[this.currStop].type == "opacity") {
      this.opacityInput.value = parseInt(this.cs[this.currStop].alpha * 100);
      this.opacityLocationInput.value = parseInt(this.cs[this.currStop].position);
      // clear
      this.colorInput.innerHTML = "";
      this.colorInput.style.backgroundColor = "";
      this.colorLocationInput.value = "";
    } else {
      var rgb = this.cs[this.currStop].rgb.slice();
      rgb.length = Math.min(3, this.cs[this.currStop].rgb.length);
      this.colorInput.style.backgroundColor = "rgb(" + rgb.join() + ")";
      this.colorInput.InnerHTML = "rgb(" + rgb.join() + ")";
      this.colorInput.style.color = $msRoot.colorMethods.highlightcolor(this.cs[this.currStop].rgb[0],
              this.cs[this.currStop].rgb[1], this.cs[this.currStop].rgb[2]);
      this.colorLocationInput.value = parseInt(this.cs[this.currStop].position);

      // clear
      this.opacityInput.value = "";
      this.opacityLocationInput.value = "";
    }
  }
  Gradient.prototype.updateStopFromInputValues = function () {
    if (this.currStop == -1)
      return;
    if (this.cs[this.currStop].type == "opacity") {
      this.cs[this.currStop].alpha = this.opacityInput.value;
      this.gradientValuesChanged();
      this.updateVisuals();
    }
  }

  Gradient.prototype.updateStopFromColor = function (color) {
    // redraw the gradient on the bar
    if (this.currStop > -1) {
      this.cs[this.currStop].rgbString = color.rgbString;
      this.cs[this.currStop].hex = color.hex;
      this.cs[this.currStop].rgb = color.rgb;
      // if other stops at same position, update them as well
      for (var i = 0; i < this.cs.length; i++) {
        if (this.cs[i].position == this.cs[this.currStop].position) {
          this.cs[i].rgbString = color.rgbString;
          this.cs[i].hex = color.hex;
          this.cs[i].rgb = color.rgb;
        }
      }
    }
  }

  Gradient.prototype.colorStopType = function (index) {
    if (index == -1)
      return "";
    return this.cs[index].type;
  }

  /*
   * 
   * update all sliders and input values from gradient string
   */
  Gradient.prototype.updateVisuals = function () {
    this.updateArrows();

    if (this.layerBusy || this.currLayer == -1) {
      return;
    }
    // redraw the gradient on the bar
    this.string = this.getGradientString(this.gradient);
    this.aGradient[this.currLayer].string = this.string;
    var gradientString = this.getGradientString(this.gradient, "to right");
    if (!gradientString)
      return;

    // save a backup for undo before setting the new
    if (this.allLayersString) {
      this.undoString = this.allLayersString.noPrefix;
    }
    this.allLayersString = this.getGradientString(this.aGradient);

    this.setBackground($ms.$(this.id + "gradient-bar"), gradientString);
    this.setBackground(this.preview, this.allLayersString)
    this.setBackground(this.aGradient[this.currLayer].li.firstChild.firstChild, gradientString)

    this.cpLibrary.color = {gradient: this.allLayersString.noPrefix};

    if (this.tab == 1) {
      this.cssText.innerHTML = this.getCssText(this.cssMode);
    }
    this.updateTarget();
    if (this.settings.colorPicker && !$ms.hasClass(this.settings.colorPicker.container, "display-none")) {
      this.settings.colorPicker.updateVisuals(true);
    }
  }

  Gradient.prototype.getCssText = function (mode) {
    var moz = "", webkit = "", noPrefix = "", ie = "";
    for (var i = 0; i < this.aGradient.length; i++) {
      if (i > 0) {
        moz += ",";
        webkit += ",";
        noPrefix += ",";
      }
      if (mode == "rgb") {
        moz += this.aGradient[i].string.moz;
        webkit += this.aGradient[i].string.webkit;
        noPrefix += this.aGradient[i].string.noPrefix;
        if (i == 0) {
          ie = this.aGradient[i].string.ie;
        }
      } else {
        var string = this.getGradientString(this.aGradient[i], undefined, mode);
        moz += string.moz;
        webkit += string.webkit;
        noPrefix += string.noPrefix;
        if (i == 0) {
          ie = string.ie;
        }
      }
    }
    return "<div>background: " + moz + ";</div>" +
            "<div>background: " + webkit + ";</div>" +
            "<div>background: " + noPrefix + ";</div>" +
            // "<div>background:" + this.string.ieMs + ";</div>" +
            "<div>background: " + ie + ";</div>";
  }

  Gradient.prototype.updateArrows = function () {
    // draw the color of the current stop on the slider	
    if (this.currStop > -1) {
      var slider = this.cs[this.currStop].slider;
      if (slider.colorStop.type == "color") {
        // show the color on the inner arrow div
        slider.arrowInner.style.backgroundColor = "rgb(" + slider.colorStop.rgb[0] + "," + slider.colorStop.rgb[1] + "," + slider.colorStop.rgb[2] + ")";
      } else {
        // show the opacity on the inner arrow div 0 = white 100 = black
        var value = slider.colorStop.alpha * 255;
        slider.arrowInner.style.backgroundColor = "rgb(" + value + "," + value + "," + value + ")";
      }
      // set opacity and hex from current
      this.updateInputValuesFromStop();
    }
  }

  Gradient.prototype.setBackground = function (element, gradientString) {
    // setting to background so it wipes out all the other properties
    // backgroundImage is what will remain set
    element.style.background = gradientString.vendor;
  }

  Gradient.prototype.getGradientString = function (passedGradient, direction, mode) {
    // background: rgb(30,87,153);			/* Old browsers */
    // background: -moz-linear-gradient(left, ...);	/* FF 3.6 - 15 (2012) */
    // background: -webkit-linear-gradient(left, ...);	/* Chrome 10 - 25 (2013), Safari 5.1 - 6 (2012) */
    // background: -o-linear-gradient(left, ...);	/* opera 11.5 (2011) */
    // background: linear-gradient(to right, ...);	/* W3C, IE10+, FF 16+, Chrome 26+, Opera 12+, Safari 6.1+ */
    // 
    //-ms-filter: "progid:DXImageTransform.Microsoft.gradient (GradientType=0, startColorstr=HEX 1, endColorstr=HEX 2)";  /* IE 8-9 */
    // filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='HEX 1', endColorstr='HEX 2',GradientType=1 ); /* IE 6-8  */
    var aGradient, gradient;
    var radial = false;
    var noPrefixString = "", mozString = "", webkitString = "", ieString = "", ieType, hex1, hex2;
    if (!passedGradient)
      return false;
    if (Array.isArray(passedGradient)) {
      aGradient = passedGradient;
    } else {
      aGradient = [passedGradient];
    }
    for (var j = 0; j < aGradient.length; j++) {
      gradient = aGradient[j];
      if (noPrefixString.length > 0) {
        noPrefixString += ",";
        mozString += ",";
        webkitString += ",";
        ieString += ",";
      }
      if (typeof direction == "undefined" || j > 0) {
        // passed direction - for overriding direction for the gradient bar
        direction = gradient.direction;
      }
      var prefixedDirection = "top";
      switch (direction) {
        case "to bottom":
          prefixedDirection = "top";
          break;
        case "to right":
          prefixedDirection = "left";
          break;
        case "to top":
          prefixedDirection = "bottom";
          break;
        case "to left":
          prefixedDirection = "right";
          break;
        case "135deg":
        case "to top left":
          prefixedDirection = "135deg";
          break;
        case "45deg":
        case "to top right":
          prefixedDirection = "45deg";
          break;
        case "315deg":
        case "to bottom right":
          prefixedDirection = "315deg";
          break;
        case "225deg":
        case "to bottom left":
          prefixedDirection = "225deg";
          break;
        case "radial":
          prefixedDirection = "radial";
          break;
        default:
          if (direction.indexOf("degrees") !== -1) {
            direction = gradient.degrees + "deg";
            prefixedDirection = direction;
          } else if (direction.indexOf("deg") !== -1) {
            prefixedDirection = direction;
          }
          break;
      }
      var clone = gradient.colorStop.slice();
      // remove duplicates before sort
      for (var c1 = clone.length - 1; c1 >= 0; c1--) {
        for (var c2 = c1 - 1; c2 >= 0; c2--) {
          if (clone[c1].rgbString === clone[c2].rgbString && parseInt(clone[c1].position) == parseInt(clone[c2].position)) {
            clone.splice(c1, 1);
            break;
          }
        }
      }
      clone.sort(function (a, b) {
        return a.position - b.position
      });

      var stops = "";
      for (var i = 0; i < clone.length; i++) {
        if (!mode || mode == "rgb") {
          stops += ", " + clone[i].rgbString + " " + parseInt(clone[i].position) + "%";
        } else if (mode == "hsl") {
          var hsl = $msRoot.colorMethods.rgbToHsl(clone[i].rgb);
          stops += ", " + hsl.hslString + " " + parseInt(clone[i].position) + "%";
        } else if (mode == "hex") {
          stops += ", " + clone[i].hex + " " + parseInt(clone[i].position) + "%";
        }
      }
      if (direction == "radial") {
        // limit options
        noPrefixString += "radial-gradient(ellipse at center" + stops + ")";
        mozString += "-moz-radial-gradient(center, ellipse cover" + stops + ")";
        webkitString += "-webkit-radial-gradient(center, ellipse cover" + stops + ")";

        ieType = direction == "to right" ? "1" : "0";
        hex1 = clone[0].hex;
        hex2 = clone[clone.length - 1].hex;
        if (j == 0) {
          //var ieMsString = "-ms-filter: \"progid:DXImageTransform.Microsoft.gradient( startColorstr='" + hex1 + "', endColorstr='" + hex2 + "',GradientType=" + ieType + "\")";
          ieString = "filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='" + hex1 + "', endColorstr='" + hex2 + "',GradientType=" + ieType + ")";
        }
      } else {
        noPrefixString += "linear-gradient(" + direction + stops + ")";
        mozString += "-moz-linear-gradient(" + prefixedDirection + stops + ")";
        webkitString += "-webkit-linear-gradient(" + prefixedDirection + stops + ")";
        // 1 =  Displays a horizontal Gradient., 0 = Default. Displays a vertical Gradient.
        ieType = direction == "to right" ? "1" : "0";
        hex1 = clone[0].hex;
        hex2 = clone[clone.length - 1].hex;
        if (j == 0) {
          // var ieMsString = "-ms-filter: \"progid:DXImageTransform.Microsoft.gradient( startColorstr='" + hex1 + "', endColorstr='" + hex2 + "',GradientType=" + ieType + "\")";
          ieString += "filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='" + hex1 + "', endColorstr='" + hex2 + "',GradientType=" + ieType + ")";
        }
      }
      // shortcut for setting background on controls
      var vendorString = "";
      switch (this.vendorFunctionPrefix) {
        case "":
          vendorString = noPrefixString;
          break;
        case "-webkit-":
          vendorString = webkitString;
          break;
        case "-moz-":
          vendorString = mozString;
          break;
        case null:
          break;
      }
    }
    return {noPrefix: noPrefixString, moz: mozString, webkit: webkitString, ie: ieString, vendor: vendorString};
  }

  Gradient.prototype.selectStopSlider = function (slider) {
    for (var i = 0; i < this.cs.length; i++) {
      // the arrow set to unselected class
      $ms.removeClass(this.cs[i].slider.arrow, "ms-slider-arrow-" + (this.cs[i].slider.colorStop.type == "color" ? "bottom" : "top") + "-selected");
      $ms.addClass(this.cs[i].slider.arrow, "ms-slider-arrow-" + (this.cs[i].slider.colorStop.type == "color" ? "bottom" : "top") + "-unselected");
    }
    if (!slider) {
      this.currStop = -1;
      this.disableAll();
      return;
    }

    // set currentColorStop
    for (var i = 0; i < this.cs.length; i++) {
      if (this.cs[i].slider.id == slider.id) {
        this.currStop = i;
        break;
      }
    }
    // the outer set to selected class
    $ms.addClass(slider.arrow, "ms-slider-arrow-" + (slider.colorStop.type == "color" ? "bottom" : "top") + "-selected");
    // the inner set to either its color or black for selected
    if (slider.colorStop.type == "color") {
      this.colorInputSelected();
    } else if (slider.colorStop.type == "opacity") {
      this.opacityInputSelected();
    } else {
      this.disableAll();
    }
  }

  /*
   * This modified regex orginated from Dean Taylor from this StackOverflow post: 
   * https://stackoverflow.com/questions/20215440/parse-css-gradient-rule-with-javascript-regex
   * 
   * Returns a parsed gradient
   * 
   * color comes in the format
   * background: -moz-linear-gradient(top,  rgba(145,145,145,1) 0%, rgba(145,145,145,0.51) 100%);	- FF3.6-15
   * background: -webkit-linear-gradient(top,  rgba(145,145,145,1) 0%,rgba(145,145,145,0.51) 100%);	- Chrome10-25,Safari5.1-6
   * background: linear-gradient(to bottom,  rgba(145,145,145,1) 0%,rgba(145,145,145,0.51) 100%);	- W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+
   * filter: progid:DXImageTransform.Microsoft.gradient( startGradientstr='#919191', endColorstr='#82919191',GradientType=0 );    - IE6-9 => won't be read in this program but can generate css)
   * 
   */
  Gradient.prototype.getParsedGradient = function (gradientString) {
    var gradient;
    var aGradient = [];
    var aParsed = [];
    if (!gradientString || gradientString.length == 0 || gradientString.indexOf("gradient(") == -1) {
      return [];
    }
    var regex = /(?:\s*)(?:linear|radial)-gradient\s*\(((?:\([^\)]*\)|[^\)\(]*)*)\)/g;

    var match;
    while (match = regex.exec(gradientString)) {
      aGradient.push(match[0]);
    }
    if (aGradient.length == 0) {
      return [];
    }

    for (var j = 0; j < aGradient.length; j++) {
      gradient = aGradient[j];
      if (gradient.length == 0) {
        break;
      }
      if (gradient.indexOf("to ") == -1) {
        gradient = gradient.replace("linear-gradient(", "linear-gradient(to bottom, ");
      }
      var regExpLib = generateRegExp();
      // Captures inside brackets - max one additional inner set.
      var rGradientEnclosedInBrackets = /.*gradient\s*\(((?:\([^\)]*\)|[^\)\(]*)*)\)/;
      var match = rGradientEnclosedInBrackets.exec(gradient);
      if (match !== null) {
        // Get the parameters for the gradient
        // parsed gradient is an object with format
        // gradient.direction		    - (e.g. to bottom)
        // gradient.string			    - gradient in string format
        // gradient.sideCorner		    - (e.g. bottom)
        // gradient.colorStop		    - an array of stop info
        // gradient.colorStop[i].color	    - can contain hex or rgb - deleted after getting value
        // gradient.colorStop[i].position	    - stop position percentage (including percent sign)
        var parsed = parseGradient(regExpLib, match[1]);
        if (parsed) {
          // add extended info for ease of processing
          for (var i = 0; i < parsed.colorStop.length; i++) {
            // note: parsed.colorStop[i].color can be hex or rgbString
            var color = $msRoot.colorMethods.colorInfo(parsed.colorStop[i].color);
            delete parsed.colorStop[i].color;
            if (typeof parsed.colorStop[i].position !== "undefined") {
              parsed.colorStop[i].position = parsed.colorStop[i].position.replace("%", "");
            } else if (parsed.colorStop.length == 1) {
              parsed.colorStop[i].position = "100";
            } else {
              parsed.colorStop[i].position = "" + ((i / (parsed.colorStop.length - 1)) * 100);
            }
            parsed.colorStop[i].hex = color.hex;
            parsed.colorStop[i].rgb = color.rgb;
            parsed.colorStop[i].rgba = color.rga;
            parsed.colorStop[i].alpha = color.alpha;
            parsed.colorStop[i].rgbString = color.rgbString;
          }
          aParsed.push(parsed);
        }
      }
    }
    return aParsed;
  }
  var generateRegExp = function () {
    // Note any variables with "Capture" in name include capturing bracket set(s).
    var searchFlags = 'gi', // ignore case for angles, "rgb" etc
            rAngle = /(?:[+-]?\d*\.?\d+)(?:deg|grad|rad|turn)/, // Angle +ive, -ive and angle types
            rSideCornerCapture = /(?:to\s+)?((?:(?:left|right|top|bottom|ellipse at center|center, ellipse cover|)(?:\s+(?:top|bottom))?))/, // optional 2nd part
            rComma = /\s*,\s*/, // Allow space around comma.
            rColorHex = /\#(?:[A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/, // 3 or 6 character form
            //rDigits3 = /\(\s*(?:[0-9]{1,3}\s*,\s*){2}[0-9]{1,3}\s*\)/,		// "(1, 2, 3)"
            //rDigits4 = /\(\s*(?:[0-9]{1,3}\s*,\s*){3}\s*(?:[0-9]{1,3}(?:[.][0-9]{1,3})?\s*)\)/,
            rDigits3 = /\(\s*(?:[0-9]{1,3}\s*,\s*){1}\s*(?:[0-9]{1,3}(?:%)?\s*,\s*){1}[0-9]{1,3}(?:%)?\s*\)/, // "(1, 2, 3)"
            rDigits4 = /\(\s*(?:[0-9]{1,3}\s*,\s*){1}\s*(?:[0-9]{1,3}(?:%)?\s*,\s*){2}\s*(?:[0-9]{1,3}(?:%)?(?:[.][0-9]{1,3})?\s*)\)/,
            rValue = /(?:[+-]?\d*\.?\d+)(?:%|[a-z]+)?/, // ".9", "-5px", "100%".
            rKeyword = /[_A-Za-z-][_A-Za-z0-9-]*/, // "red", "transparent", "border-collapse".
            rColor = combineRegExp([
              '(?:', rColorHex, '|', '(?:rgb|hsl)', rDigits3, '|', "(?:rgba|hsla)", rDigits4, '|', rKeyword, ')'
            ], ''),
            rColorStop = combineRegExp([rColor, '(?:\\s+', rValue, ')?'], ''), // Single Color Stop, optional value.
            rColorStopList = combineRegExp(['(?:', rColorStop, rComma, ')*', rColorStop], ''), // List of color stops min 1.
            rLineCapture = combineRegExp(['(?:(', rAngle, ')|', rSideCornerCapture, ')'], ''), // Angle or SideCorner
            rGradientSearch = combineRegExp([
              '(', rLineCapture, ')', rComma, '(', rColorStopList, ')'
            ], searchFlags), // Capture 1:"line", 2:"angle" (optional), 3:"side corner" (optional) and 4:"stop list".
            rColorStopSearch = combineRegExp([
              '\\s*(', rColor, ')', '(?:\\s+', '(', rValue, '))?', '(?:', rComma, '\\s*)?'
            ], searchFlags);// Capture 1:"color" and 2:"position" (optional).

    return {
      gradientSearch: rGradientSearch,
      colorStopSearch: rColorStopSearch
    };
  };

  var combineRegExp = function (regexpList, flags) {
    var i,
            source = '';
    for (i = 0; i < regexpList.length; i++) {
      if (typeof regexpList[i] === 'string') {
        source += regexpList[i];
      } else {
        source += regexpList[i].source;
      }
    }
    return new RegExp(source, flags);
  }

  var parseGradient = function (regExpLib, input) {
    var result,
            matchGradient,
            matchColorStop,
            stopResult;

    matchGradient = regExpLib.gradientSearch.exec(input);
    if (matchGradient !== null) {
      result = {
        string: matchGradient[0],
        colorStop: []
      };

      // Line (Angle or Side-Corner).
      if (!!matchGradient[1]) {
        result.direction = matchGradient[1];
        if (result.direction.indexOf("ellipse") !== -1 || result.direction.indexOf("circle") !== -1) {
          result.direction = "radial";
          result.radialDirection = matchGradient[1];
          ;
        }
      }
      // Angle or undefined if side-corner.
      if (!!matchGradient[2]) {
        result.angle = matchGradient[2];
      }
      // Side-corner or undefined if angle.
      if (!!matchGradient[3]) {
        result.sideCorner = matchGradient[3];
      }

      // Loop though all the color-stops.
      matchColorStop = regExpLib.colorStopSearch.exec(matchGradient[4]);
      while (matchColorStop !== null) {

        stopResult = {
          color: matchColorStop[1]
        };

        // Position (optional).
        if (!!matchColorStop[2]) {
          stopResult.position = matchColorStop[2];
        }
        result.colorStop.push(stopResult);

        // Continue searching from previous position.
        matchColorStop = regExpLib.colorStopSearch.exec(matchGradient[4]);
      }
    }
    // Can be undefined if match not found.
    return result;
  };

  // called from gradient when any of the inputs or sliders change
  Gradient.prototype.updateGradientFromInput = function () {
    // when values change
    var modified = false;
    if (this.colorStopType(this.currStop) == "color") {
      var hex = $msRoot.colorMethods.rgbToHex(this.colorInput.innerHTML)
      this.updateCurrentStopFromHex(hex);
    } else if (this.colorStopType(this.currStop) == "opacity") {
      this.cs[this.currStop].alpha = this.opacityInput.value / 100;
    }
    this.gradientValuesChanged();
    this.updateVisuals();
  }

  Gradient.prototype.updateCurrentStopFromHex = function (hex) {
    // redraw the gradient on the bar
    if (this.currStop > -1) {
      var color = $msRoot.colorMethods.colorInfo(hex, this.cs[this.currStop].alpha);
      this.cs[this.currStop].rgbString = color.rgbString;
      this.cs[this.currStop].hex = color.hex;
      this.cs[this.currStop].rgb = color.rgb;
      // if other stops at same position, update them as well
      for (var i = 0; i < this.cs.length; i++) {
        if (this.cs[i].position == this.cs[this.currStop].position) {
          this.cs[i].rgbString = color.rgbString;
          this.cs[i].hex = color.hex;
          this.cs[i].rgb = color.rgb;
        }
      }
    }
  }

  Gradient.prototype.setColor = function (gradientString) {
    // value changed from outside (e.g. library)
    this.showGradientFromString(gradientString);
    if (this.settings.colorPicker && !$ms.hasClass(this.settings.colorPicker.container, "display-none")) {
      // close the colorpicker if open
      this.settings.colorPicker.hide();
    }
  }

  // enable the color inputs
  // open colorpicker
  Gradient.prototype.colorInputSelected = function (source) {
    if (source && source == "color-input" && $ms.hasClass(this.colorInput, "ms-disabled")) {
      // opacity stop is active, ignore color 
      return false;
    }
    $ms.removeClass(this.colorInput, "ms-disabled");
    $ms.removeClass(this.colorLocationInput, "ms-disabled");
    this.colorLocationInput.removeAttribute("disabled");

    $ms.addClass(this.opacityInput, "ms-disabled");
    $ms.addClass(this.opacityLocationInput, "ms-disabled");
    this.opacityInput.disabled = "disabled";
    this.opacityLocationInput.disabled = "disabled";
    this.opacitySlider.disable();

    // update values and colors for inputs
    this.updateInputValuesFromStop();
    if (this.settings.colorPicker) {
      this.updatingColorPicker = true;
      this.settings.cbUpdateColorPicker(this.cs[this.currStop]);
      this.updatingColorPicker = false;
    }
    return true;
  }

  Gradient.prototype.opacityInputSelected = function (source) {
    if (source && source == "opacity-input" && $ms.hasClass(this.opacityInput, "ms-disabled")) {
      // color stop is active, ignore opacity
      return;
    }
    $ms.removeClass(this.opacityInput, "ms-disabled");
    $ms.removeClass(this.opacityLocationInput, "ms-disabled");
    this.opacityLocationInput.removeAttribute("disabled");
    this.opacityInput.removeAttribute("disabled");
    this.opacitySlider.enable();
    this.opacityInput.value = parseInt(this.cs[this.currStop].alpha * 100);
    this.opacitySlider.xValue = parseInt(this.cs[this.currStop].alpha * 100);
    this.opacitySlider.setArrowPositionFromValues();

    $ms.addClass(this.colorInput, "ms-disabled");
    $ms.addClass(this.colorLocationInput, "ms-disabled");
    this.colorLocationInput.disabled = "disabled";

    // update values and colors for inputs
    this.updateInputValuesFromStop()
    if (this.settings.colorPicker) {
      this.settings.colorPicker.close();
      this.settings.colorPicker = undefined;
    }
  }

  Gradient.prototype.disableAll = function () {
    $ms.addClass(this.colorInput, "ms-disabled");
    $ms.addClass(this.colorLocationInput, "ms-disabled");
    this.colorLocationInput.disabled = "disabled";

    $ms.addClass(this.opacityInput, "ms-disabled");
    $ms.addClass(this.opacityLocationInput, "ms-disabled");
    this.opacityLocationInput.disabled = "disabled";
    this.opacitySlider.disable();
    if (this.cbDisable) {
      this.cbDisable();
    }
  }
  Gradient.prototype.opacityInputKeyup = function (e) {
    if (this.currStop == -1)
      return;
    if (this.cs[this.currStop].type == "color")
      return;
    if (e.target.value == '')
      return;
    this.opacityValueChanged(e.target);
    this.opacityInputSelected("opacity-input");
  }
  Gradient.prototype.opacityInputBlur = function (e) {
    if (this.currStop == -1)
      return;
    if (this.cs[this.currStop].type == "color")
      return;
    if (e.target.value == '')
      this.opacityValueChanged(e.target);
  }
  Gradient.prototype.opacityLocationKeyup = function (e) {
    if (this.currStop == -1)
      return;
    if (this.cs[this.currStop].type == "color")
      return;
    this.locationChanged(e.target);
    this.opacityInputSelected("opacity-input");
    if (e.target.value == '')
      return;
  }
  Gradient.prototype.opacityLocationBlur = function (e) {
    if (this.currStop == -1)
      return;
    if (this.cs[this.currStop].type == "color")
      return;
    if (e.target.value == '')
      this.locationChanged(e.target);
  }
  Gradient.prototype.colorLocationKeyup = function (e) {
    if (this.currStop == -1)
      return;
    if (this.cs[this.currStop].type == "opacity")
      return;
    if (this.currStop == -1)
      return;
    this.locationChanged(e.target);
    this.colorInputSelected("color-input");
    if (e.target.value == '')
      return;
  }
  Gradient.prototype.colorLocationBlur = function (e) {
    if (this.currStop == -1)
      return;
    if (this.cs[this.currStop].type == "opacity")
      return;
    if (e.target.value == '')
      this.locationChanged(e.target);
  }

  Gradient.prototype.keydown = function (e, min, max, cb) {
    if (this.currStop == -1)
      return;
    if (e.target.id.indexOf("color") !== -1 && this.cs[this.currStop].type == "opacity")
      return;
    if (e.target.id.indexOf("opacity") !== -1 && this.cs[this.currStop].type == "color")
      return;
    if (e.keyCode == 38) {
      // up
      if (typeof min == "undefined")
        return;
      if (e.target.value == "")
        e.target.value = min;
      e.target.value = Math.min(parseInt(e.target.value) + 1, max);
      if (cb) {
        cb.call(this, e);
      }
      e.stopPropagation();
    } else if (e.keyCode == 40) {
      // down
      if (typeof min == "undefined")
        return;
      if (e.target.value == "")
        e.target.value = min;
      e.target.value = Math.max(parseInt(e.target.value) - 1, min);
      if (cb) {
        cb.call(this, e);
      }
      e.stopPropagation();
    } else if (cb) {
      cb.call(this, e);
    }
  }
  Gradient.prototype.opacityValueChanged = function () {
    var value = parseInt(this.opacityInput.value);
    if (value == 0 && "" + value !== this.opacityInput.value) {
      // invalid entry - don't hide control
      value = 100;
    }
    if (value < 0 || value > 100) {
      value = 100;
    }
    this.opacityInput.value = value;
    this.opacitySlider.xValue = this.opacityInput.value;
    this.opacitySlider.setArrowPositionFromValues();
    this.cs[this.currStop].alpha = value / 100;
    this.gradientValuesChanged();
    this.updateVisuals();
  }
  Gradient.prototype.locationChanged = function (target) {
    var value = parseInt(target.value);
    // invalid entry - don't hide control
    if (value == 0 && "" + value !== target.value)
      return;
    if (value < 0 || value > 100)
      return;
    if (isNaN(value))
      return;
    this.cs[this.currStop].position = value;
    this.cs[this.currStop].slider.xValue = value;
    this.cs[this.currStop].slider.setArrowPositionFromValues();
    this.gradientValuesChanged(this.cs[this.currStop].slider);
    this.updateVisuals();
  }

  Gradient.prototype.positionArrows = function () {
    for (var i = 0; i < this.cs.length; i++) {
      this.cs[i].slider.setPositioningVariables();
    }
    this.opacitySlider.setArrowPositionFromValues();
  }

  /*
   * For drag and drop
   * with drop, recalibrate the positions of sliders
   */
  Gradient.prototype.drop = function (fromColorpicker) {
    for (var i = 0; i < this.cs.length; i++) {
      this.cs[i].slider.setPositioningVariables();
    }
    if (typeof fromColorpicker == "boolean" && fromColorpicker)
      return;
    if (this.settings.colorPicker && !$ms.hasClass(this.settings.colorPicker, "display-none" && this.settings.colorPicker.isPinned)) {
      this.settings.colorPicker.drop(true);
    }
  }
  Gradient.prototype.createTabs = function (atabs) {
    var _this = this;
    var tabsDiv = document.createElement("div")
    tabsDiv.id = this.id + "tab-container";
    tabsDiv.className = "ms-tabs ms-gradient-tabs";
    tabsDiv.style.position = "relative";
    tabsDiv.backgroundColor = "rgb(230,230,230)";
    var ul = document.createElement("ul");
    ul.id = this.id + "tab-ul";
    ul.className = "tab-primary";
    tabsDiv.appendChild(ul);
    for (var i = 0; i < atabs.length; i++) {
      var li = document.createElement("li");
      li.id = this.id + "tab-" + i;
      li.innerHTML = atabs[i];
      !function (i) {
        li.addEventListener('click', function (e) {
          _this.showTab(i);
        }, false)
      }(i);

      if (i == 0) {
        li.className = 'tab-current';
      }
      ul.appendChild(li);
    }
    return tabsDiv;
  }
  Gradient.prototype.showTab = function (tab) {
    var ul;
    for (var i = 0; i < this.tabsContainer.childNodes.length; i++) {
      if (this.tabsContainer.childNodes[i].nodeName == "UL") {
        ul = this.tabsContainer.childNodes[i];
        break;
      }
    }

    // highlight current tab
    for (var i = 0; i < ul.childNodes.length; i++) {
      if (i == tab) {
        $ms.addClass(ul.childNodes[i], 'tab-current');
      } else {
        $ms.removeClass(ul.childNodes[i], 'tab-current');
      }
    }

    $ms.addClass(this.previewOuter, "display-none");
    $ms.addClass(this.cssOuter, "display-none");
    $ms.addClass(this.layersOuter, "display-none");
    $ms.addClass(this.importOuter, "display-none");
    this.tab = tab;
    if (tab == 0) {
      // preview
      $ms.removeClass(this.previewOuter, "display-none");
      this.previewWrapper2.appendChild(this.preview);
      this.resizePreview();
    } else if (tab == 1) {
      // css
      this.cssText.innerHTML = this.getCssText(this.cssMode);
      $ms.removeClass(this.cssOuter, "display-none");
    } else if (tab == 2) {
      // layers + preview
      $ms.removeClass(this.layersOuter, "display-none");
      this.layersPreviewWrapper.appendChild(this.preview);
    } else if (tab == 3) {
      // import
      $ms.removeClass(this.importOuter, "display-none");
      this.layersPreviewWrapper.appendChild(this.preview);
    }
  }

  Gradient.prototype.colorLibResize = function (mode) {
    if (mode == "close") {
      // make tabs larger again
      setTimeout(function () {
        $ms.removeClass(this.tabsContainer, "ms-gradient-tab-container-narrow")
      }.bind(this), 250);
    } else {
      // make tabs smaller with click on color lib handle
      $ms.addClass(this.tabsContainer, "ms-gradient-tab-container-narrow");
    }
  }


  Gradient.prototype.save = function () {
    // target already has modified color
    this.close(true);
  }

  Gradient.prototype.cancel = function (e) {
    if (this.settings.startColor && this.settings.startColor.indexOf("gradient") !== -1) {
      // revert to original gradient
      this.showGradientFromString(this.settings.startColor);
    } else {
      this.string = undefined;
    }
    if (this.settings.target) {
      // revert target
      this.updateTarget(true);
    }
    this.close(true);
  }


  Gradient.prototype.remove = function () {
    // remove gradient
    // switch to colorpicker (color mode)
    if (this.settings.colorPicker) {
      // need to unload before open the colorpicker
      this.settings.colorPicker.close();
      this.settings.colorPicker = undefined;
    }
    if (this.settings.target) {
      // remove the gradient from the targets
      this.string = undefined;
      this.updateTarget();
    }
    this.openColorPicker(true);
    //this.settings.colorPicker.settings.gradient = undefined;
    this.close(false);
  }

  Gradient.prototype.resetSliders = function () {
    // remove gradient - delete all stops
    if (!this.gradient)
      return;
    for (var i = 0; i < this.cs.length; i++) {
      this.cs[i].slider.arrowInner.parentNode.removeChild(this.cs[i].slider.arrowInner);
      this.cs[i].slider.close();
    }
  }
  Gradient.prototype.close = function (closeColorPicker) {
    // remove the gradient form
    document.body.removeEventListener('DOMAttrModified', this.resize);
    if (this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    for (var i = 0; i < instance.length; i++) {
      if (instance[i].id == this.id) {
        instance.splice(i, 1);
        break;
      }
    }
    this.opacitySlider.close();
    this.cpLibrary.close();
    $msRoot.CustomDialog.closeDialogs(this.id);

    if (this.cs) {
      for (var i = 0; i < this.cs.length; i++) {
        this.cs[i].slider.close();
      }
    }
    if (this.settings.colorPicker) {
      this.settings.colorPicker.settings.gradient = undefined;
      if (closeColorPicker) {
        this.settings.colorPicker.close();
      }
    }
    // close mutation observer
    this.observer.disconnect();
    if (this.settings.cbClose) {
      if (Array.isArray(this.settings.cbClose)) {
        for (var i = 0; i < this.settings.cbClose.length; i++) {
          this.settings.cbClose[i](this);
        }
      } else {
        this.settings.cbClose(this);
      }
    }
  }

  Gradient.prototype.openColorPicker = function (transfer) {
    var top, left;
    if (this.currStop == -1) {
      this.currStop = 0;
    }
    // set the colorpicker to the current stop color
    var rgbString = this.cs[this.currStop].rgbString;

    if (!this.settings.colorPicker) {
      var offset = $ms.getOffset(this.container);
      this.settings.colorPicker = new $msRoot.ColorPicker({
        startColor: transfer ? this.settings.startColor : rgbString,
        startMode: 'h',
        startPos: transfer ? {top: offset.top, left: offset.left} : {top: "10px", left: "20px"},
        // pass along the target(s) to be updated and callback when changed
        target: transfer ? this.settings.target : undefined,
        cbChange: transfer ? this.settings.cbChange : undefined,
        cbCreate: transfer ? this.settings.cbCreate : undefined,
        cbClose: transfer ? this.settings.cbClose : undefined,
        imgPath: this.settings.imgPath,
        container: this.settings.container,
        zIndex: this.settings.zIndex + 1,
        pin: true, // allow to colorpicker pin to gradient
        startPinned: transfer ? false : this.settings.pinColorPicker,
        gradient: transfer ? undefined : this,
        fromGradientStartColor: transfer ? rgbString : undefined,
        // with changes to colorpicker, update the gradient
        cbUpdateGradientFromColor: transfer ? undefined : function (color, alpha) {
          this.cbUpdateGradientFromColor(color, alpha)
        }.bind(this)
      });
      // set the callback with changes to gradient, update the colorpicker
      this.settings.cbUpdateColorPicker = this.settings.colorPicker.cbUpdateColorPicker.bind(this.settings.colorPicker);
    }
    // set the current stop color on the colorpicker
    this.settings.cbUpdateColorPicker(this.cs[this.currStop]);
    this.container.style.zIndex = this.settings.zIndex;
    this.settings.colorPicker.show(this.settings.zIndex + 1);
  }

  // called from colorpicker with either a color or opacity change
  Gradient.prototype.cbUpdateGradientFromColor = function (color) {
    if (this.currStop == -1)
      return;
    if (this.updatingColorPicker)
      return;
    if (this.colorStopType(this.currStop) !== "color")
      return;
    this.updateStopFromColor(color);
    this.gradientValuesChanged();
    this.updateVisuals();
  }

  // updates the target(s) with gradient
  // target object contains: 
  //	element = the element object
  //  "valueAttribute" = if set, the property to set the value to
  Gradient.prototype.updateTarget = function (cancel) {
    // update the source element(s)
    if (!this.settings.target)
      return;
    try {
      for (var i = 0; i < this.settings.target.length; i++) {
        var target = this.settings.target[i];
        if (this.string) {
          // display the background on the target
          this.setBackground(target.element, this.allLayersString);
          if (target.valueAttribute) {
            // display text version of color
            target.element[target.valueAttribute] = this.allLayersString.noPrefix;
            var color;
            if (target.textColor == "contrast") {
              color = $msRoot.colorMethods.highlightcolor(this.cs[0].rgb[0], this.cs[0].rgb[1], this.cs[0].rgb[2]);
            } else {
              color = this.cs[0].rgbString;
            }
            target.element.style.color = color;
          }
        } else if (cancel && this.settings.startColor.length > 0) {
          // with cancel revert to simple backgroundColor if was set
          target.element.style.removeProperty("background-image");
          target.element.style.backgroundColor = this.settings.startColor;
          if (target.valueAttribute) {
            target.element[target.valueAttribute] = this.settings.startColor;
          }
        } else {
          // not a gradient
          target.element.style.removeProperty("background-image");
          target.element.style.removeProperty("background-color");
          if (target.valueAttribute) {
            target.element[target.valueAttribute] = "";
          }
        }
      }
      if (typeof this.settings.cbChange !== "undefined") {
        // if a callback function with change
        this.settings.cbChange(this, this.string);
      }
    } catch (e) {
      console.log("Gradient.updateTarget: " + e.message);
    }
  }

  Gradient.prototype.selectLayer = function (li, update) {
    for (var i = 0; i < this.aGradient.length; i++) {
      $ms.removeClass(this.aGradient[i].li, "ms-gradient-layer-selected");
    }
    $ms.addClass(li, "ms-gradient-layer-selected");
    if (!update) {
      return;
    }

    for (var i = 0; i < this.aGradient.length; i++) {
      if (this.aGradient[i].li.id == li.id) {
        this.resetSliders();
        this.currLayer = i;
        this.gradient = this.aGradient[i];
        this.string = this.gradient.string;
        // set the direction
        this.direction.value = this.gradient.direction;

        // set shorthand notation
        this.cs = this.gradient.colorStop;
        // create sliders from colorStops
        this.colorStopsToSliders();
        // start with color active
        for (var j = 0; i < this.cs.length; j++) {
          if (this.cs[j].type == "color") {
            this.currStop = j;
            this.selectStopSlider(this.cs[j].slider);
            break;
          }
        }

        $ms.removeClass(this.container, "display-none");
        this.positionArrows();

        this.currLayer = i;
        break;
      }
    }
  }
  Gradient.prototype.addLayer = function () {
    this.showGradientFromString(this.settings.newLayer, true);
    this.updateVisuals();
  }
  Gradient.prototype.deleteLayer = function () {
    if (this.currLayer == -1)
      return;
    var li = this.aGradient[this.currLayer].li;
    this.layersUl.removeChild(li);
    this.aGradient.splice(this.currLayer, 1)
    if (this.aGradient.length == 0) {
      this.showGradientFromString(this.settings.newLayer, true);
      return;
    }
    if (this.currLayer > this.aGradient.length - 1) {
      this.currLayer = this.aGradient.length - 1;
    }
    this.selectLayer(this.aGradient[this.currLayer].li, true);
    this.updateVisuals();
  }
  Gradient.prototype.degreesDialog = function () {
    if (typeof this.aGradient[this.currLayer].degrees == "undefined") {
      this.aGradient[this.currLayer].degrees == "";
    }
    var settings = {
      id: this.id,
      dialogTitle: "Angle",
      text: "Enter the number of degrees",
      buttons: [
        {label: "Ok",
          enterKey: true,
          cb: function (dialog) {
            this.degreesDialogOpen = false;
            if (dialog) {
              this.degreesChange(dialog.settings.input.element.value);
            }
          }.bind(this)
        },
        {label: "Cancel",
          escapeKey: true,
          title: "Do not load the gradient",
          cb: function (dialog) {
            this.degreesDialogOpen = false;
            this.direction.value = "to bottom";
            this.gradient.direction = this.direction.value;
            this.gradient.degrees = "";
            this.updateVisuals();
          }.bind(this)}
      ],
      input: {label: "Angle: ",
        value: this.aGradient[this.currLayer].degrees,
        onkeydown: function (e) {
          this.keydown(e, 0, 360, this.degreesChange);
        }.bind(this),
        onkeyup: function (e) {
          this.degreesChange(e);
        }.bind(this)
      }
    };
    dialog = new $msRoot.CustomDialog(settings);
    this.degreesDialogOpen = true;
  }

  Gradient.prototype.degreesChange = function (degrees) {
    if (typeof degrees == "object") {
      degrees = degrees.target.value;
    }
    degrees = this.validateDegrees(degrees);
    if (degrees === "") {
      this.direction.value = "to bottom";
      this.gradient.direction = this.direction.value;
      this.gradient.degrees = "";
      this.updateVisuals();
      return;
    }
    this.direction.value = this.addDegreeComboOption(degrees);
    this.gradient.direction = this.direction.value;
    this.gradient.degrees = degrees;
    this.updateVisuals();
  }
  Gradient.prototype.validateDegrees = function (degrees) {
    degrees = parseInt(degrees.replace("degrees: ", "").trim());
    if (isNaN(parseInt(degrees))) {
      return "";
    } else if (degrees > 360 || degrees < 0) {
      return ""
    }
    return degrees;
  }
  Gradient.prototype.updateFromDragDrop = function (element, droppable, draggableSettings, droppableSettings) {
    // order of layers may have changed sync aGradient
    var newUlPosition, existingArrayPosition;
    for (var i = 0; i < this.layersUl.childNodes.length; i++) {
      if (element.id == this.layersUl.childNodes[i].id) {
        newUlPosition = i;
        break
      }
    }
    for (var i = 0; i < this.aGradient.length; i++) {
      if (element.id == this.aGradient[i].li.id) {
        existingArrayPosition = i;
        break
      }
    }
    if (typeof newUlPosition == "undefined" || typeof existingArrayPosition == "undefined") {
      console.log("Gradient drag drop - cannot find element");
      return;
    } else if (newUlPosition == existingArrayPosition) {
      // no change
      return;
    }

    $ms.arrayMove(this.aGradient, existingArrayPosition, newUlPosition);
    this.selectLayer(this.aGradient[newUlPosition].li, true);
    this.updateVisuals();
  }
  Gradient.prototype.resizePreview = function () {
    if (this.tab !== 0)
      return;
    var invalid = false;
    var width = this.previewWidth.value;
    var height = this.previewHeight.value;
    var maxWidth = $ms.getOffset(this.previewWrapper).width - 2;
    var maxHeight = $ms.getOffset(this.previewWrapper).height - 2;
    if (isNaN(width) || isNaN(height)) {
      invalid = true;
    }
    if (invalid) {
      // return to max dimensions
      this.previewWrapper2.style.removeProperty("width");
      this.previewWrapper2.style.removeProperty("height");
    } else {
      var ratioDisplay = maxWidth / maxHeight;
      var ratioImage = width / height;
      if (ratioImage > 0) {
        // imager is wider
        this.previewWrapper2.style.removeProperty("width");
        width = Math.min(maxWidth, width);
        height = width / ratioImage;
        if (height > maxHeight) {
          height = maxHeight;
          width = height * ratioImage
        }
      } else {
        // display area is taller
        this.previewWrapper2.style.removeProperty("height");
        height = Math.min(maxHeight, height);
        width = height * ratioImage;
        if (width > maxWidth) {
          width = maxWidth;
          height = width / ratioImage
        }
      }
      this.previewWrapper2.style.width = width + "px";
      this.previewWrapper2.style.height = height + "px";
    }
  }
  Gradient.prototype.directionToAngle = function (direction) {
    var angle = 90;
    switch (direction) {
      case "to bottom":
        angle = 270;
        break;
      case "to right":
        angle = 0;
        break;
      case "to top":
        angle = 90;
        break;
      case "to left":
        angle = 180;
        break;
      case "135deg":
      case "to top left":
        angle = 135;
        break;
      case "45deg":
      case "to top right":
        angle = 45;
        break;
      case "315deg":
      case "to bottom right":
        angle = 315;
        break;
      case "225deg":
      case "to bottom left":
        angle = 225;
        break;
      case "radial":
        angle = "radial";
        break
      default:
        if (direction.indexOf("deg") !== -1) {
          angle = parseInt(direction);
        }
        break;
    }
    return angle;
  }
  Gradient.prototype.angleToDirection = function (angle) {
    angle = parseInt("" + angle);
    var direction = "to bottom";
    if (isNaN(angle))
      return direction;
    switch (angle) {
      case 270:
        direction = "to bottom";
        break;
      case 0:
        direction = "to right";
        break;
      case 90:
        direction = "to top";
        break;
      case 180:
        direction = "to left";
        break;
      case 135:
        direction = "to top left";
        break;
      case 45:
        direction = "to top right";
        break;
      case 315:
        direction = "to bottom right";
        break;
      case 225:
        direction = "to bottom left";
        break;
      default:
        direction = false;
    }
    return direction;
  }
  Gradient.prototype.downloadPNG = function (passedGradient, size) {
    var parent = document.body;
    var canvasGradient;
    var ctx;
    var gradient, aGradient;
    if (!passedGradient)
      return false;
    if (Array.isArray(passedGradient)) {
      aGradient = passedGradient;
    } else {
      aGradient = [passedGradient];
    }

    size.width = parseInt(size.width);
    if (isNaN(size.width) || size.width == 0) {
      size.width = 200;
    }
    size.height = parseInt(size.height);
    if (isNaN(size.height) || size.height == 0) {
      size.height = 200;
    }
    var canvas = document.createElement("canvas");
    canvas.id = this.id + "canvas";

    var radial = false;
    for (var i = 0; i < aGradient.length; i++) {
      if (this.directionToAngle(aGradient[i].direction) == "radial") {
        radial = true
      } else if (radial) {
        // if any are not radial don't expand
        radial = false;
        break;
      }
    }
    if (radial) {
      var desiredSize = {width: size.width, height: size.height};
      size.width = Math.max(size.width, size.height);
      size.height = Math.max(size.width, size.height);
      // canvas radial gradients are circles
      canvas.width = Math.max(size.width, size.height);
      canvas.height = Math.max(size.width, size.height);
    } else {
      canvas.style.width = size.width + "px";
      canvas.style.height = size.height + "px";
      canvas.width = size.width;
      canvas.height = size.height;
    }

    ctx = canvas.getContext('2d');

    // do gradients layers in reverse order
    for (var j = aGradient.length - 1; j >= 0; j--) {
      gradient = aGradient[j];
      var clone = gradient.colorStop.slice();
      // remove duplicates before sort
      for (var c1 = clone.length - 1; c1 >= 0; c1--) {
        for (var c2 = c1 - 1; c2 >= 0; c2--) {
          if (clone[c1].rgbString === clone[c2].rgbString && parseInt(clone[c1].position) == parseInt(clone[c2].position)) {
            clone.splice(c1, 1);
            break;
          }
        }
      }
      clone.sort(function (a, b) {
        return a.position - b.position
      });

      var angle = this.directionToAngle(gradient.direction);
      if (angle == "radial") {
        // both circles have to share the center of the canvas
        var coords = {x1: 0, y1: 0, x2: 0, y2: 0};
        coords.x1 = (size.width / 2);
        coords.x2 = coords.x1;
        coords.y1 = (size.height / 2);
        coords.y2 = coords.y1;
        // inner circle is just the center - a point
        coords.r1 = 0;
        // outer circle is the edge
        coords.r2 = Math.min(size.height, size.width);
        canvasGradient = ctx.createRadialGradient(coords.x1, coords.y1, coords.r1, coords.x2, coords.y2, coords.r2);
        var ratio = desiredSize.width / desiredSize.height;
        if (ratio > 1) {
          // squish y axis
          ctx.scale(1 / ratio, 1)
        } else if (ratio < 1) {
          // squish x axis
          ctx.scale(ratio, 1)
        }
      } else {
        var coords = this.cssAngleToCanvasCoords(size.width, size.height, angle);
        canvasGradient = ctx.createLinearGradient(coords.x1, coords.y1, coords.x2, coords.y2);
      }
      var position, color;
      for (var i = 0; i < clone.length; i++) {
        color = clone[i].rgbString;
        position = clone[i].position / 100;
        canvasGradient.addColorStop(position, color);
        ctx.fillStyle = canvasGradient;
      }
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    if (radial) {
      var data = ctx.getImageData(0, 0, desiredSize.width, desiredSize.height);
      ctx.canvas.width = desiredSize.width;
      ctx.canvas.height = desiredSize.height;
      ctx.putImageData(data, 0, 0);
    }

    downloadURI(canvas, "gradient.png");
    canvas = undefined;

    function downloadURI(canvas, name) {
      if (navigator.msSaveBlob) { // IE10
        var blob = canvas.msToBlob();
        return navigator.msSaveBlob(blob, name);
      } else {
        var uri = canvas.toDataURL("image/png")
        var link = document.createElement("a");
        link.download = name;
        link.href = uri;
        document.body.appendChild(link);
        if (link.click) {
          link.click();
        } else {
          var event = document.createEvent('MouseEvents');
          event.initMouseEvent('click', true, true, window);
          link.dispatchEvent(event);
        }
        document.body.removeChild(link);
        //delete link;
      }
    }
  }

  Gradient.prototype.cssAngleToCanvasCoords = function (width, height, angle) {
    var radian = 180 / Math.PI
    var angle = angle / radian
    var direction;
    // calculated with center as 0, 0
    var x, y;
    if (angleTestRight(angle, width, height)) {
      direction = "right";
      x = width / 2;
      y = width / 2 * Math.tan(angle);
    } else if (angleTestTop(angle, width, height)) {
      direction = "top";
      x = -height / 2 * Math.tan(angle - Math.PI / 2);
      y = height / 2;
    } else if (angleTestLeft(angle, width, height)) {
      direction = "left";
      x = -width / 2;
      y = -width / 2 * Math.tan(angle - Math.PI);
    } else if (angleTestBottom(angle, width, height)) {
      direction = "bottom";
      x = height / 2 * Math.tan(angle - 3 * Math.PI / 2);
      y = -height / 2;
    }
    // convert to xy in upper left	
    // on a geometrical axis, Y grows larger as it moves up
    // on a canvas axis, Y grows larger as it moves down - so need to subtract
    x += width / 2;
    y -= height / 2;
    // convert y to positive is down
    y *= -1;
    //console.log("(" + Math.round(angle * radian) + ") =>" + Math.round(x) + ", " + Math.round(y));
    var coord = pointToCoord(width, height, direction, {x: x, y: y})
    return coord;

    function angleTestRight(angle, width, height) {
      //$ms.v("RIGHT", "angle: " + angle, "atan: " + atan, angle - 2 * Math.PI);
      var atan = Math.atan2(height, width)	    //  * 180 / Math.PI;
      return angle < atan || Math.abs(angle - 2 * Math.PI) < atan;
    }

    function angleTestTop(angle, width, height) {
      //$ms.v("TOP", "angle: " + angle, "atan: " + atan, angle  - Math.PI / 2);
      var atan = Math.atan2(width, height)	    //  * 180 / Math.PI;
      return Math.abs(angle - Math.PI / 2) < atan;
    }

    function angleTestLeft(angle, width, height) {
      //$ms.v("LEFT", "angle: " + angle, "atan: " + atan, angle  - Math.PI);
      var atan = Math.atan2(height, width)	    //  * 180 / Math.PI;
      return Math.abs(angle - Math.PI) < atan;
    }

    function angleTestBottom(angle, width, height) {
      //$ms.v("BOTTOM", "angle: " + angle, "atan: " + atan, angle - 3 * Math.PI);
      var atan = Math.atan2(width, height)	    //  * 180 / Math.PI;
      return Math.abs(angle - 3 * Math.PI / 2) < atan;
    }
    function pointToCoord(width, height, direction, point) {
      var x1, x2, y1, y2;
      // x2 and y2 will always be the point (destination)
      x2 = point.x;	// same as width
      y2 = point.y
      // calc x2 and y1 from across the rectangle on a line going through the center
      if (direction == "right") {
        x1 = 0;
        y1 = height - point.y;
      } else if (direction == "top") {
        x1 = width - point.x;
        y1 = height;
      } else if (direction == "left") {
        x1 = width;
        y1 = height - point.y;
      } else if (direction == "bottom") {
        x1 = width - point.x;
        y1 = 0;
      }
      return {x1: x1, y1: y1, x2: x2, y2: y2};
    }
  }

  return Gradient;
})();
