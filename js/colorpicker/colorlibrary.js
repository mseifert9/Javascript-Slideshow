/* Copyright © 2017 Michael Seifert (mseifert.com) All Rights Reserved */

// Hue is a degree on the color wheel (from 0 to 360) - 0 (or 360) is red, 120 is green, 240 is blue. 
// Saturation is a percentage value; 0% is a shade of gray and 100% is the full color. 
// Value = Brightness is the amount of black added 0 = completely black, 100 = pure color
// Lightness (HSL) is a percentage; 0% is black, 100% is white, 50% is pure color (no white no black)
// Saturation (HSL & HSV) - Mixing pure colors with black (shades) leaves saturation unchanged.
// Saturation (HSV) - Tinting with white reduces saturation.
// Saturation (HSL) - Tinting with white leaves saturation unchanged.
//		    Mixtures with both black and white (tones) have saturation less than 1

$msRoot.createNS("ColorPicker.ColorLibrary");
$msRoot.ColorPicker.ColorLibrary = (function (settings) {
  var instance = [];
  var instanceCounter = 0;
  var defaultSettings = {
    fontSize: 75, // percent
    cbSetColor: undefined, // callback when a color is chosen
    saveLabel: "Save",
    valueToSet: "rgbString",
    libSuffix: "", // name to go after __colorlib
    cbResize: undefined	// callback for when expand or contract form
  };

  ColorLibrary.getInstance = function (instanceId) {
    if (typeof instanceId !== "undefined") {
      for (var i = 0; i < instance.length; i++) {
        if (instance[i].id == instanceId) {
          // search by instanceId
          return instance[i];
        }
      }
    } else {
      // with no parameters, return array of all instances
      return instance;
    }
  }

  function ColorLibrary(settings) {
    instance.push(this);
    this.id = "ms-colorLibrary-" + instanceCounter++ + "-";
    ;
    this.library;		// a library object in format {version: (number), name: (name), type: (readonly, user), records: (array of colors)}
    this.selectedColor;	// the color name clicked on
    this.colorSwatches = [];
    this.currentColor;
    this.color;		// the color object - either this.cvp.color from colorpicker or an object with a "gradient" property set from gradient
    this.container;
    this.col
    // set in createForm
    this.colorLibInner;
    this.libraryNameCombo;
    this.colorNameCombo;
    this.colorLibInner;

    this.settings = $ms.cloneSettings(defaultSettings, settings);
    this.table = "__colorlib-" + this.settings.libSuffix;
    this.openDialogs = [];
    this.onLoadFn = this.onLoad.bind(this);
  }

  ColorLibrary.prototype.onLoad = function () {
    var data = new $msRoot.LocalData();
    $ms.removeOnLoad(this.container, this.onLoadFn);
    var lsOpen = data.getProperty("colorlibrary-" + this.settings.valueToSet, "open");
    if (lsOpen) {
      // last state stored in localstorage
      this.modeOpen(false);
      if (this.settings.cbResize) {
        this.settings.cbResize("open");
      }
    }
  }

  ColorLibrary.prototype.createForm = function () {
    var data = new $msRoot.LocalData();
    var lsOpen = data.getProperty("colorlibrary-" + this.settings.valueToSet, "open");
    this.container = document.createElement("div");
    this.container.id = this.id + "container";
    this.container.className = "ms-cp-lib-container";
    this.container.style.fontSize = $ms.targetFontSize(this.settings.fontSize);
    $ms.setOnLoad(this.container, this.onLoadFn);

    this.colorLibHandle = document.createElement("div");
    this.colorLibHandle.className = "ms-cp-lib-handle";
    this.colorLibHandle.title = "Click the vertical bar to expand and contract the library."
    this.container.appendChild(this.colorLibHandle);
    var colorLibHandleImage = document.createElement("div");
    colorLibHandleImage.className = "ms-cp-lib-handle-image";
    this.colorLibHandle.appendChild(colorLibHandleImage);
    this.colorLibHandle.addEventListener("click", function () {
      if (parseInt(getComputedStyle(this.container).getPropertyValue("width")) > 150) {
        // close
        var mode = "close";
        this.modeClose();
        data.setProperty("colorlibrary-" + this.settings.valueToSet, "open", false);
      } else {
        // open
        var mode = "open";
        this.modeOpen(true);
        data.setProperty("colorlibrary-" + this.settings.valueToSet, "open", true);
      }
      if (this.settings.cbResize) {
        this.settings.cbResize(mode);
      }
    }.bind(this));

    this.colorLibInner = document.createElement("div");
    this.colorLibInner.id = this.id + "color-lib-inner";
    this.colorLibInner.className = "ms-cp-lib-inner";
    this.container.appendChild(this.colorLibInner);

    // color name input and buttons
    var divWrapper = document.createElement("div");
    divWrapper.lineHeight = "18px";
    this.container.appendChild(divWrapper);

    var div = document.createElement("div");
    div.innerHTML = "Name";
    div.className = "ms-gradient-label";
    div.style.width = "40px";
    divWrapper.appendChild(div);

    var options = [];
    this.colorNameCombo = $ms.createEditableCombo(options,
            {inputId: this.id + "color-name-input",
              containerId: this.id + "color-name-container",
              width: "85px",
              maxHeight: "300",
              cbChange: this.loadColor.bind(this),
              observeSizeChanges: true,
              listenWindowClick: true
            });
    this.colorNameCombo.container.style.verticalAlign = "text-top";
    this.colorNameCombo.container.style.display = "inline-block";
    divWrapper.appendChild(this.colorNameCombo.container);

    /*	
     var input = document.createElement("input");
     input.id = this.id + "color-name";
     input.style.width = "85px";
     divWrapper.appendChild(input);
     */
    var button = document.createElement("div");
    button.id = this.id + "delete-color-button";
    button.innerHTML = "Delete"
    button.className = "ms-gradient-button ms-cp-button display-none";
    button.style.display = "inline-block";
    button.style.margin = "0 0 0 5px";
    //button.style.verticalAlign = "middle";
    button.style.lineHeight = "14px";
    button.addEventListener("click", function (e) {
      this.deleteColor()
    }.bind(this));
    divWrapper.appendChild(button);

    // library name input and buttons
    var divWrapper = document.createElement("div");
    this.container.appendChild(divWrapper);

    div = document.createElement("div");
    div.innerHTML = "Library";
    div.className = "ms-gradient-label";
    div.style.width = "40px";
    divWrapper.appendChild(div);

    var options = this.loadLibraryNames();
    if (this.settings.valueToSet == "rgbString") {
      options.splice(0, 0, {name: "Color Names", type: "readonly"}, {name: "Gray Colors", type: "readonly"});
    }
    this.libraryNameCombo = $ms.createEditableCombo(options,
            {inputId: this.id + "library-name-input",
              containerId: this.id + "library-name-container",
              width: "85px",
              cbChange: this.loadLibrary.bind(this),
              observeSizeChanges: true,
              listenWindowClick: true
            });
    this.libraryNameCombo.container.style.verticalAlign = "text-top";
    this.libraryNameCombo.container.style.display = "inline-block";
    divWrapper.appendChild(this.libraryNameCombo.container);

    var button = document.createElement("div");
    button.id = this.id + "delete-library-button";
    button.innerHTML = "Delete"
    button.className = "ms-gradient-button ms-cp-button display-none";
    button.style.display = "inline-block";
    button.style.margin = "0 0 0 5px";
    button.style.verticalAlign = "bottom";
    button.style.lineHeight = "14px";
    button.addEventListener("click", function () {
      if (!this.library)
        return;
      this.deleteLibrary(this.library)
    }.bind(this));
    divWrapper.appendChild(button);

    var button = document.createElement("div");
    button.id = this.id + "save-color-button";
    button.innerHTML = this.settings.saveLabel;
    button.className = "ms-gradient-button ms-cp-button";
    button.style.display = "inline-block";
    button.style.marginRight = "5px";
    button.addEventListener("click", function (e) {
      this.saveColor()
    }.bind(this));
    this.container.appendChild(button);

    var button = document.createElement("div");
    button.id = this.id + "export-button";
    button.innerHTML = "Export";
    button.className = "ms-gradient-button ms-cp-button";
    button.style.display = "inline-block";
    button.title = "Export all libraries and colors to a file";
    button.style.marginRight = "5px";
    button.addEventListener("click", function () {
      this.exportLib()
    }.bind(this));
    this.container.appendChild(button);

    var button = document.createElement("div");
    button.id = this.id + "import-button";
    button.innerHTML = "Import";
    button.className = "ms-gradient-button ms-cp-button display-none";
    button.style.display = "inline-block";
    button.title = "Import and replace all libraries and colors from an exported file";
    button.addEventListener("click", function (e) {
      this.importLib(e)
    }.bind(this));
    this.container.appendChild(button);

    return this.container;
  }

  ColorLibrary.prototype.modeOpen = function (animate) {
    var ms = animate ? 250 : 0;
    // expand width
    if (animate) {
      $ms.addClass(this.container, "ms-cp-lib-container-animate-open");
      $ms.removeClass(this.container, "ms-cp-lib-container-animate-close");
      $ms.removeClass(this.container, "ms-cp-lib-container-open");
      // $ms.removeClass(this.container, "ms-cp-lib-container-close");
    } else {
      $ms.removeClass(this.container, "ms-cp-lib-container-animate-open");
      $ms.removeClass(this.container, "ms-cp-lib-container-animate-close");
      $ms.addClass(this.container, "ms-cp-lib-container-open");
      // $ms.removeClass(this.container, "ms-cp-lib-container-close");
    }
    // expand inputs - show buttons
    setTimeout(function () {
      $ms.$(this.id + "library-name-container").style.width = "135px";
      $ms.$(this.id + "color-name-container").style.width = "135px";
      $ms.removeClass($ms.$(this.id + "delete-color-button"), "display-none");
      $ms.removeClass($ms.$(this.id + "delete-library-button"), "display-none");
      $ms.removeClass($ms.$(this.id + "import-button"), "display-none");
      if (this.selectedColor) {
        $ms.scrollIntoView(this.selectedColor.div);
      }
    }.bind(this), ms);
  }

  ColorLibrary.prototype.modeClose = function () {
    // contract inputs - hide buttons
    $ms.$(this.id + "color-name-input").style.width = "85px";
    $ms.addClass($ms.$(this.id + "delete-color-button"), "display-none");
    $ms.addClass($ms.$(this.id + "delete-library-button"), "display-none");
    $ms.addClass($ms.$(this.id + "import-button"), "display-none");
    // contract width
    $ms.$(this.id + "library-name-container").style.width = "85px";
    $ms.$(this.id + "color-name-container").style.width = "85px";
    $ms.addClass(this.container, "ms-cp-lib-container-animate-close");
    $ms.removeClass(this.container, "ms-cp-lib-container-animate-open");
    $ms.removeClass(this.container, "ms-cp-lib-container-open");
    // $ms.removeClass(this.container, "ms-cp-lib-container-close");
    // scroll to the selected div
    setTimeout(function () {
      if (this.selectedColor) {
        $ms.scrollIntoView(this.selectedColor.div);
      }
    }.bind(this), 250);
  }

  ColorLibrary.prototype.loadLibraryNames = function () {
    var data = new $msRoot.LocalData({key: "id", value: "value", records: "records", childKey: "name"});
    var names = [];
    var libraries = data.getRecords(this.table);
    if (Array.isArray(libraries)) {
      for (var i = 0; i < libraries.length; i++) {
        names.push({name: libraries[i].id, type: "user"});
      }
    }
    if (!names) {
      names = [];
    }
    var found = false;
    for (var i = 0; i < names.length; i++) {
      if (names[i].name == "Default") {
        found = true;
        break;
      }
    }
    if (!found) {
      names.splice(0, 0, {name: "Default", type: "user"});
      // save record
      data.set(this.table, "Default", {name: "Default", type: "user", records: [], version: data.version});
    }
    return names;
  }
  //	library format: 
  //		{
  //		value:
  //		    {
  //		    version: (version)
  //		    type: library-type	// (e.g. readonly, user)
  //		    name: library-name
  //		    records: [		// library color records
  //			{1st color record}, 
  //			{2nd record}, etc...
  //			]
  //		    }
  //		}
  ColorLibrary.prototype.loadLibrary = function (option) {
    if (option.value == "Color Names") {
      var colorNameLibrary = $msRoot.colorMethods.colorNameInfo();
      // sorted by hue, lightness, saturation
      var sortedColorNameLibrary = colorNameLibrary.map(function (c, i) {
        // Convert to HSL and keep track of original indices
        var rgb = $msRoot.colorMethods.hexToRgb(c.hex, 1, true);
        var hsv1 = $msRoot.colorMethods.rgbToHsv({r: rgb.r, g: rgb.g, b: rgb.b});
        var hsv = [hsv1.h, hsv1.s, hsv1.v, c.name];
        return {color: hsv, index: i};
      }).sort(function (c1, c2) {
        if (c1.color[0] < c2.color[0])
          return -1;
        if (c1.color[0] > c2.color[0])
          return 1;
        if (c1.color[1] < c2.color[1])
          return -1;
        if (c1.color[1] > c2.color[1])
          return 1;
        if (c1.color[2] < c2.color[2])
          return -1;
        if (c1.color[2] > c2.color[2])
          return 1;
      }).map(function (data) {
        // Retrieve original RGB color
        return colorNameLibrary[data.index];
      });
      this.library = {name: "Color Names", type: "readonly", records: sortedColorNameLibrary};

    } else if (option.value == "Gray Colors") {
      this.library = {name: "Gray", type: "readonly", records: grayInfo("name list")};
    } else {
      var data = new $msRoot.LocalData({key: "id", value: "value", records: "records", childKey: "name"});
      this.library = data.get(this.table, option.value);
      if (!this.library) {
        if (option.value == "Default") {
          // create it
          this.library = {name: "Default", type: "user", records: [], version: data.version};
          data.set(this.table, "Default", this.library);
          return true;
        }
        return false;
      }
    }
    this.showLibrary(this.library);
    this.loadColorNames();
    return true;
  }
  ColorLibrary.prototype.loadColorNames = function () {
    var options = this.libraryColorNames();
    this.colorNameCombo.createOptions(options, true);
  }

  ColorLibrary.prototype.showLibrary = function (library) {
    // reset
    this.reset();
    for (var i = 0; i < library.records.length; i++) {
      this.createColorSwatch(library.records[i]);
    }
    if (library.type == "readonly") {
      $ms.addClass($ms.$(this.id + "delete-color-button"), "ms-disabled");
      $ms.addClass($ms.$(this.id + "delete-library-button"), "ms-disabled");
      $ms.addClass($ms.$(this.id + "save-color-button"), "ms-disabled");
    } else {
      $ms.removeClass($ms.$(this.id + "delete-color-button"), "ms-disabled");
      $ms.removeClass($ms.$(this.id + "delete-library-button"), "ms-disabled");
      $ms.removeClass($ms.$(this.id + "save-color-button"), "ms-disabled");
    }
  }
  ColorLibrary.prototype.createColorSwatch = function (color) {
    var colorDivContainer = document.createElement("div");
    colorDivContainer.className = "ms-cp-lib-color-div ms-cp-transparent-grid";
    $ms.$(this.id + "color-lib-inner").appendChild(colorDivContainer);

    var colorDiv = document.createElement("div");
    var name = color.name.replace(/[^A-Za-z0-9-_:.]/g, '-');
    var encodedName = encodeURIComponent(color.name);
    colorDiv.id = this.id + name;
    colorDiv.className = "ms-cp-lib-color-swatch"
    colorDiv.setAttribute("data-name", encodedName);
    if (this.settings.valueToSet == "gradient") {
      colorDiv.style.background = color.gradient;
    } else {
      colorDiv.style.backgroundColor = color.rgbString;
    }
    colorDiv.title = color.name;
    var bindClick = function (div) {
      colorDiv.addEventListener("click", function () {
        this.selectColor(color, div, true);
      }.bind(this));
    }.bind(this);
    bindClick(colorDiv);

    colorDivContainer.appendChild(colorDiv);
    this.colorSwatches.push(colorDiv);
    return colorDiv;
  }

  ColorLibrary.prototype.deleteLibrary = function (library) {
    if (this.library.type == "readonly")
      return;
    if (!confirm("Are you ABSOLUTELY sure you want to delete the library " + library.name + " and all its swatches?"))
      return;
    var data = new $msRoot.LocalData({key: "id", value: "value", records: "records", childKey: "name"});
    data.del(this.table, library.name);
    // delete current swatches
    this.reset();
    this.libraryNameCombo.deleteOption(library.name);
    this.libraryNameCombo.setValue("Default");
    this.colorNameCombo.setValue("");
  }

  ColorLibrary.prototype.selectColor = function (color, div, setColor) {
    // color is object: {name: , hex: , alpha:}	// alpha is optional
    color.div = div;
    if (setColor) {
      this.settings.cbSetColor(color);
    }
    this.selectedColor = color;
    this.colorNameCombo.setValue(color.name);
    for (var i = 0; i < this.colorSwatches.length; i++) {
      $ms.removeClass(this.colorSwatches[i], "ms-cp-lib-color-selected");
      $ms.removeClass(this.colorSwatches[i], "ms-cp-lib-color-highlighted");
    }
    if (setColor) {
      $ms.addClass(div, "ms-cp-lib-color-selected");
    } else {
      $ms.addClass(div, "ms-cp-lib-color-highlighted");
    }
    $ms.scrollIntoView(div);
  }

  ColorLibrary.prototype.saveColor = function (name, repeat) {
    var data = new $msRoot.LocalData({key: "id", value: "value", records: "records", childKey: "name"});
    if (typeof name == "undefined") {
      name = this.colorNameCombo.value.trim();
    }
    if (!this.library || !this.library.name) {
      // lib is not loaded - will be true if entered a new library name
      var libraryName = this.libraryNameCombo.value.trim();
      if (libraryName == "") {
        // use default and load it
        this.libraryNameCombo.setValue("Default");
        this.libraryNameCombo.settings.cbChange({value: "Default"}, "select");
      } else {
        // load library entered
        if (!this.loadLibrary({value: libraryName})) {
          // create the library if it doesn't exist
          this.library = {name: libraryName, type: "user", records: [], version: data.version};
          data.set(this.table, libraryName, this.library);
          // add to the combo
          this.libraryNameCombo.addOption({label: libraryName, value: libraryName})
          this.reset();
        }
      }
    }

    var type = "";
    var update = false;
    var existingColor = data.getChild(this.table, this.library.name, name);
    if (existingColor) {
      var text = ["'" + name + "' already exists. Do you wish to overwrite it or add a new one?"];
      if (repeat) {
        text.push("<span style='color:red'>Enter a NEW name to 'Add New'</span>");
      }
      var settings = {
        id: this.id,
        dialogTitle: "Confirm Overwrite",
        text: text,
        buttons: [
          {label: "Overwrite",
            title: "Overwrites the selected " + type,
            cb: function (dialog) {
              this.doSave("overwrite", dialog)
            }.bind(this)
          },
          {label: "Add New",
            title: "Add a new " + type,
            cb: function (dialog) {
              this.doSave("add", dialog)
            }.bind(this)
          },
          {label: "Cancel"}
        ],
        input: {label: "Enter a name: ", value: name}
      };
      var dialog = new $msRoot.CustomDialog(settings);
    } else if (name.length == 0) {
      // default the name is its rgb value
      var id = data.nextId(this.table);
      while (id < 1000) {
        if (this.settings.valueToSet == "gradient") {
          name = "Gradient " + id;
        } else {
          name = "Color " + id;
        }
        var existingColor = data.getChild(this.table, this.library.name, name);
        if (!existingColor) {
          this.colorNameCombo.setValue(name);
          break;
        }
        id++;
      }
      this.doSave("add", name);
    } else {
      this.doSave("add", name);
    }
  }

  ColorLibrary.prototype.doSave = function (mode, name) {
    var data = new $msRoot.LocalData({key: "id", value: "value", records: "records", childKey: "name"});
    if (typeof name == "object") {
      // from dialog
      name = name.settings.input.element.value
    }
    var existingColor = data.getChild(this.table, this.library.name, name);
    if (existingColor && mode !== "overwrite") {
      // name exists - start over
      this.saveColor(name, true);
      return;
    }
    // save
    this.color.name = name;
    data.setChild(this.table, this.library.name, name, this.color);
    if (existingColor) {
      // find the existing swatch
      for (var i = 0; i < this.library.records.length; i++) {
        if (this.library.records[i].name == name) {
          // clone the color so won't be tied to this.color object
          for (var prop in this.color) {
            if (!this.color.hasOwnProperty(prop))
              continue;
            this.library.records[i][prop] = this.color[prop];
          }
          if (this.settings.valueToSet == "gradient") {
            this.colorSwatches[i].style.background = this.color.gradient;
          } else {
            this.colorSwatches[i].style.backgroundColor = this.color.rgbString;
          }
          div = this.colorSwatches[i];
          break;
        }
      }
    } else {
      // add to the swatches
      // clone the color so it isn't tied to this.color
      // the color object will stay passed by reference, so updates to it will be reflected in the onClick fn
      this.colorNameCombo.addOption(name);
      // this.colorNameCombo.setValue(name);
      var color = Object.assign({}, this.color);
      this.library.records.push(color);
      var div = this.createColorSwatch(color);
      this.selectColor(this.color, div, false);
    }
    $ms.scrollIntoView(this.selectedColor.div);
    this.colorNameCombo.setValue("");
  }

  ColorLibrary.prototype.deleteColor = function () {
    if (!this.selectedColor)
      return;
    if (this.library.type == "readonly")
      return;
    var data = new $msRoot.LocalData({key: "id", value: "value", records: "records", childKey: "name"});
    data.deleteChild(this.table, this.library.name, this.selectedColor.name);
    this.selectedColor.div.parentNode.parentNode.removeChild(this.selectedColor.div.parentNode);
    this.colorDeselect();
  }

  ColorLibrary.prototype.exportLib = function () {
    var data = new $msRoot.LocalData({key: "id", value: "value", records: "records", childKey: "name"});
    var libraries = data.getRecords(this.table);
    if (!libraries || !Array.isArray(libraries)) {
      console.log("No libraries found");
      return;
    }
    // get nextId - will be the 1st record in the array
    var nextId = data.getProperty(this.table, "nextId");
    libraries.push({nextId: nextId, type: this.settings.valueToSet});
    var currentdate = new Date();
    var repeat = function (str, count) {
      var array = [];
      for (var i = 0; i < count; )
        array[i++] = str;
      return array.join('');
    }
    var padLeft = function (string, padChar, length) {
      string = "" + string;
      padChar = "" + padChar;
      var times = length - string.length;
      if (times < 1)
        return string;   // don't shorten string if longer than length
      var padded = repeat(padChar, times);
      return padded + string;
    }
    var datetime = currentdate.getFullYear() + "-" +
            padLeft((currentdate.getMonth() + 1), "0", 2) + "-" +
            padLeft(currentdate.getDate(), "0", 2) + "-" +
            padLeft(currentdate.getHours(), "0", 2) + "-" +
            padLeft(currentdate.getMinutes(), "0", 2) + "-" +
            padLeft(currentdate.getSeconds(), "0", 2);
    var filename = (this.settings.valueToSet == "gradient" ? "gradient-libraries-" : "color-libraries-") + datetime + ".txt"
    var lf = new $msRoot.LocalFile(filename);
    lf.text = JSON.stringify(libraries);
    lf.saveFile();
  }
  ColorLibrary.prototype.importLib = function (e) {
    var fileList = document.createElement("input");
    fileList.id = this.id + "file-input";
    fileList.type = "file";
    fileList.style.opacity = "0";

    var lf = new $msRoot.LocalFile();
    lf.cbOnFileLoad = this.cbImportFile.bind(this);
    fileList.addEventListener('change', lf.loadFile.bind(lf), false);
    document.body.appendChild(fileList);
    fileList.click();
    /*	
     var label = document.createElement("label");
     document.body.appendChild(label);
     label.for = this.id + "file-input";
     label.click();
     */
  }

  ColorLibrary.prototype.cbImportFile = function (importedJSON) {
    var label = (this.settings.valueToSet == "gradient" ? "Gradient" : "Color")
    var libraries = JSON.parse(importedJSON);
    var nextId = 0;
    var type = "";
    if (typeof libraries !== "object") {
      alert("Invalid file format (1)");
      return;
    }
    if (!Array.isArray(libraries)) {
      alert("Invalid file format (2)");
      return;
    }
    var output = [];
    for (var i = 0; i < libraries.length; i++) {
      if (typeof libraries[i] !== "object") {
        alert("Invalid file format (3)");
        return;
      }
      if (libraries[i].nextId) {
        nextId = libraries[i].nextId;
        type = libraries[i].type;
        output.push("nextId ==> " + libraries[i].nextId);
        output.push("type ==> " + libraries[i].type);
        continue;
      }
      if (!libraries[i].value) {
        alert("Invalid file format (5)");
        return;
      }
      if (!libraries[i].value.records) {
        alert("Invalid file format (6)");
        return;
      }
      output.push("**** Library Name: " + libraries[i].id + " ****");
      if (libraries[i].value.records.length == 0) {
        output.push("Empty Library");
        continue;
      }
      for (var j = 0; j < libraries[i].value.records.length; j++) {
        var prop = (this.settings.valueToSet == "gradient" ? "gradient" : "rgbString");
        var id = libraries[i].value.records[j].name;
        var value = libraries[i].value.records[j][prop];
        value = id + " => " + value.substr(0, 50) + (value.length > 50 ? "..." : "");
        output.push(label + ": " + value);
      }
    }
    if (type !== this.settings.valueToSet) {
      alert("Only libraries of type: " + label + " may be imported.");
      return;
    }
    var settings = {
      id: this.id,
      dialogTitle: "Confirm Import",
      text: ["", "The following libraries and " + label + "s will be imported:", ""].concat(output).concat([""]),
      position: "fixed",
      textAlign: "left",
      buttonClass: "ms-gradient-button",
      buttonsOnTop: true,
      buttons: [
        {label: "Delete Existing",
          title: "Delete all existing libraries and " + label + "s before import.",
          cb: function () {
            this.doImport(libraries, "delete")
          }.bind(this)
        },
        {label: "Overwrite Duplicates",
          title: "Keep existing libraries and " + label + "s and overwrite duplicates from the import.",
          cb: function () {
            this.doImport(libraries, "overwrite")
          }.bind(this)
        },
        {label: "Discard Duplicates",
          title: "Keep existing libraries and " + label + "s and dicard duplicates from the import.",
          cb: function () {
            this.doImport(libraries, "discard")
          }.bind(this)
        },
        {label: "Cancel",
          title: "Cancel the import."}
      ]
    };
    var dialog = new $msRoot.CustomDialog(settings);
  }

  ColorLibrary.prototype.doImport = function (libraries, mode) {
    // mode values: delete, overwrite, discard
    var existingLibrary;
    var label = (this.settings.valueToSet == "gradient" ? "Gradient" : "Color")
    var status = ["Import Status"];
    var data = new $msRoot.LocalData({key: "id", value: "value", records: "records", childKey: "name"});
    var replaced = 0;
    var added = 0;
    var discarded = 0
    var nextId = 0;
    if (mode == "delete") {
      data.zap(this.table);
    } else {
      nextId = data.getProperty(this.table, "nextId");
    }
    for (var i = 0; i < libraries.length; i++) {
      replaced = 0;
      added = 0;
      discarded = 0
      if (libraries[i].nextId) {
        nextId = Math.max(nextId, libraries[i].nextId);
        data.setProperty(this.table, "nextId", nextId);
        status.push("Set nextId: " + nextId);
        continue;
      }
      // get existing library if exists
      // NOTE: when getting a single library (existingLibrary) - the 'value' property is returned containing an object: {name: . records:}
      // whereas when looping through a libraries array, each array element will have object: {id: , value:}
      if (mode !== "delete") {
        existingLibrary = data.get(this.table, libraries[i].id);
      }
      if (mode == "delete" || !existingLibrary || !existingLibrary.records || existingLibrary.records.length == 0) {
        // save new table and all color records without having to check
        status.push("Library: " + libraries[i].id + " => Imported whole library - " + libraries[i].value.records.length + " " + label + " records.");
        data.set(this.table, libraries[i].id, libraries[i].value);
        continue;
      }
      // table already exists
      for (var j = 0; j < libraries[i].value.records.length; j++) {
        var prop = (this.settings.valueToSet == "gradient" ? "gradient" : "rgbString");
        var importId = libraries[i].value.records[j].name;
        // search existing records
        var found = false;
        for (var k = 0; k < existingLibrary.records.length; k++) {
          if (importId == existingLibrary.records[k].name) {
            found = true;
            // duplicate
            if (mode == "discard") {
              discarded++;
            } else {
              replaced++;
              existingLibrary.records[k] = libraries[i].value.records[j];
            }
            break;
          }
        }
        if (!found) {
          // new record
          added++
          existingLibrary.records.push(libraries[i].value.records[j]);
        }
      }
      // save library back
      data.set(this.table, libraries[i].id, existingLibrary);
      status.push("Library: " + libraries[i].id + " => Added: " + added + " Replaced: " + replaced + " Discarded: " + discarded);
    }
    console.log(status.join("\n"));
    // refresh screen
    var loaded = false;
    var current = "";
    if (this.library) {
      current = this.library.name;
    }
    this.reset();
    if (current.length > 0) {
      loaded = this.loadLibrary({value: current});
    }
    if (!loaded) {
      this.loadLibrary({value: "Default"});
    }
  }

  ColorLibrary.prototype.colorDeselect = function () {
    this.selectedColor = undefined;
    this.colorNameCombo.setValue("");
  }

  ColorLibrary.prototype.loadColor = function (option, select) {
    var name, color;
    for (var i = 0; i < this.colorSwatches.length; i++) {
      name = decodeURIComponent(this.colorSwatches[i].getAttribute("data-name"));
      if (name.toLowerCase() == option.value.toLowerCase()) {
        if (this.settings.valueToSet == "gradient") {
          color = $msRoot.colorMethods.colorInfo(this.colorSwatches[i].style.background);
        } else {
          color = $msRoot.colorMethods.colorInfo(this.colorSwatches[i].style.backgroundColor);
        }
        color.name = name;
        this.selectColor(color, this.colorSwatches[i], select);
        break;
      }
    }
  }
  ColorLibrary.prototype.libraryColorNames = function () {
    var names = []
    if (!this.library)
      return;
    for (var i = 0; i < this.library.records.length; i++) {
      names.push(this.library.records[i].name);
    }
    return names;
  }

  ColorLibrary.prototype.reset = function () {
    while (this.colorLibInner.firstChild) {
      this.colorLibInner.removeChild(this.colorLibInner.firstChild);
    }
    this.colorSwatches = [];
  }
  ColorLibrary.prototype.close = function () {
    $msRoot.CustomDialog.closeDialogs(this.id);
    this.libraryNameCombo.close();
    this.colorNameCombo.close();
  }

  function grayInfo() {
    var colorLib = [];
    var val = 255;
    while (val >= 0) {
      var colorValue = "rgb(" + val + "," + val + "," + val + ")";
      var name = $msRoot.colorMethods.colorNameInfo(colorValue, "name");
      if (!name)
        name = colorValue;
      colorLib.push({name: name, rgbString: colorValue, hex: $msRoot.colorMethods.rgbToHex(colorValue)});
      if (val == 255) {
        val -= 31;
        ;
      } else {
        val -= 32;
      }
    }
    return colorLib;
  }

  return ColorLibrary;
})();
