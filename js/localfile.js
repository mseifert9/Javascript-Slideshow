/* Copyright © 2017 Michael Seifert (www.mseifert.com) All Rights Reserved */

$msRoot.createNS("LocalFile");
$msRoot.LocalFile = (function(filename){
    var eventFire = function (link, eventName){
	window.requestAnimationFrame(function() {
	    var event = new MouseEvent(eventName);
	    link.dispatchEvent(event);
    });
}

    function LocalFile(filename){
	this.filename = "temp.txt";
	this.href;
	this.text = "";
	this.cbOnFileLoad;
	this.format = "text";
	
	if (this.filename){
	    this.filename = filename;
	}
    }
    
    LocalFile.prototype.saveFile = function(){
	this.create();
	this.download();
    }
    
    LocalFile.prototype.create = function(){
	var data = new Blob([this.text], {type: 'text/plain'});

	// If we are replacing a previously generated file we need to
	// manually revoke the object URL to avoid memory leaks.
	if (this.href !== null) {
	    window.URL.revokeObjectURL(this.href);
	}

	this.href = window.URL.createObjectURL(data);	
    }
    
    LocalFile.prototype.download = function(){
	var link = document.createElement('a');
	link.setAttribute('download', this.filename);
	link.href = this.href;
	document.body.appendChild(link);

	// wait for the link to be added to the document
	window.requestAnimationFrame(
	    function(){ 
		eventFire(link, "click");
		document.body.removeChild(link);
	    }
	    /*function () {
		var event = new MouseEvent('click');
		link.dispatchEvent(event);
		document.body.removeChild(link);
	    }*/
	);
    }    
    
    LocalFile.prototype.loadFile = function(event) {
	var _this = this;
	var files = event.target.files; // FileList object
	var file;
	if (files.length == 1){
	    file = files[0];
	} else {
	    return false;
	}
	var reader = new FileReader();
	reader.onload = (function(_this) {
	    return function(e) {
		_this.text =  e.target.result;
		_this.cbOnFileLoad(_this.text);
	    }	    
	})(_this);

      // Read in the image file as a data URL.
      if (this.format == "binary"){
	reader.readAsBinaryString(file);
      } else if (this.format == "arrayBuffer"){
	  reader.readAsArrayBuffer(file);
      } else {
	reader.readAsText(file);
      }
    }
    
    return LocalFile;
           
})();

