/* Copyright © 2017 Michael Seifert (mseifert.com) All Rights Reserved */

/*
 *to clear localStorage for a single site in chrome
 *	chrome://settings/cookies#cont
 *  localStorage;		// click arrow to view object's properties
 *  localStorage.removeItem("something"); 
 *  localStorage.clear();	// remove all of localStorage's properties
*/

/*
 * store records and properties for "tables"
 *	properties are stored with a key of table.propertyName
 *	properties are returned as a value
 * records are stored with a key of table[id]
 * records are returned as an object with format {key: , value:}
 *	"key" and "value" are customizable e.g. {id: , record:}
 * child records are stored as a property value in the parent record
 *	e.g. Table[id] = {id: 1, value: {name: bess, records: [ {childName: a}, {childName: b} ]}}
 */

$msRoot.createNS("LocalData");
$msRoot.LocalData = (function(settings){
    var defaultSettings = {
	key: "key",		// or id
	value: "value",		// or record
	records: "records",	// for child records
	childKey: "name"	// the child record key	
				// => child is NOT {key: , value: } but an object with any number of properties
				// childKey is the unique property in the child record
    }
    LocalData.version = "1.0";
    
    function LocalData(settings){
	this.settings = $ms.cloneSettings(defaultSettings, settings);
    }
    
    LocalData.prototype.get = function(table, id){
	if(!table || !id){
	    return false;
	}
	var data = window.localStorage.getItem(table + "[" + id + "]");
	return JSON.parse(data);
    }
    
    LocalData.prototype.set = function(table, id, record){
	if(!table){
	    return false;
	}
	if(id == null || typeof id == "undefined"){
	    id = this.nextId(table); 
	}
	window.localStorage.setItem(table + "[" + id + "]", JSON.stringify(record));
	return id;
    }
    
    LocalData.prototype.del = function(table, id){
	if(!table || !id){
	    return false;
	}
	window.localStorage.removeItem(table + "[" + id + "]");
	return true;
    }
    // delete table's records
    LocalData.prototype.zap = function(table){
	if(!table){
	    return false;
	}
	var counter = 0;
	var key = null;
	var type = null;
	var propflag = table + ".";	// delete properties e.g. nextId
	var recordflag = table + "[";	// delete records
	var length = table.length + 1;
	var data = [];
	for(var i = 0; i < window.localStorage.length; i++){ 
	    key = window.localStorage.key(i); 
	    type = key.substr(0, length); 
	    if( type == propflag || type == recordflag){
		data.push(key);
		counter++;
	    }
	}
	for(i = 0; i < data.length; i++){
	    window.localStorage.removeItem(data[i]);
	}
	return counter;
    }
    
    LocalData.prototype.zapAll = function(){
      window.localStorage.clear();
    }
    
    LocalData.prototype.nextId = function(table){
	if(!table){return false;}
	var id = 0;
	id = window.localStorage.getItem(table + ".nextId");
	if(!id){
	    id = 0;
	}
	id++;
	window.localStorage.setItem(table + ".nextId", id);
	return id;
    }
    
    LocalData.prototype.setProperty = function(table, property, value){
	if(!table || !property){
	    return false;
	}
	window.localStorage.setItem(table + "." + property , JSON.stringify(value));
    }
    
    LocalData.prototype.getProperty = function(table, property){
	if(!table || !property){
	    return false;
	}
	var data = window.localStorage.getItem(table + "." + property);
	return JSON.parse(data);
    }   
    
    LocalData.prototype.getRecords = function(table){
	// get all records for a table
	if(!table){
	    return false;
	}	
	var key = null;
	var id , value;
	var data = [];	
	var flag = table + "[";
	for(var i = 0; i < window.localStorage.length; i++){
	    key = window.localStorage.key(i);	    
	    if (flag == key.substr(0, flag.length)){
		// id is the string between the []: as in table[id]
		id = key.substr(flag.length);
		id = id.substr(0, id.length - 1)
		value = window.localStorage.getItem(key);
		// return in key/value object => {key: id, value: JSON.parse(value)}
		var record = {};
		record[this.settings.key] = id;
		record[this.settings.value] = JSON.parse(value);
		data.push(record);
	    }
	}
	return data;
    }
    
    LocalData.prototype.getProperties = function(table){
	// get all properties for a table
	if(!table){
	    return false;
	}	
	var key = null;
	var prop , value;
	var data = [];
	var propflag = table + ".";
	var length = table.length + 1;
	for(var i = 0; i < window.localStorage.length; i++){
	    key = window.localStorage.key(i);	    
	    if (propflag == key.substr(0, length)){
		prop = key.substr(length);
		value = window.localStorage.getItem(key);
		try {
		    data.push({prop: prop, value: JSON.parse(value)});
		} catch (e) {
		    console.log("Could not write property value: " + value);
		}
	    }
	}
	return data;
    }
    
    LocalData.prototype.getTables = function(){
	// get all tables
	var counter = 0;
	var key = null;
	var tables = [];
	var tables2 = [];
	var table;
	var bracket;
	for(var i = 0; i < window.localStorage.length; i++){
	    key = window.localStorage.key(i);
	    bracket = key.indexOf("[");
	    if (bracket !== -1){
		table = key.substr(0, bracket);
		tables[table] = table;
	    }
	}
	for (var key in tables) {
	    if (tables.hasOwnProperty(key)){
		tables2.push(key);
	    }
	}
	//id=s[i].substring(s[i].indexOf("[")+1,s[i].indexOf("]"));
	return tables2;
    }
	

    /*
     * For parent child table relationships
     *	    store multiple records of a child table in parent record's => value.records
     */
    LocalData.prototype.getChild = function(table, id, childId){
	if(!table || !id || !childId){
	    return false;
	}
	var key = this.settings.key;
	var records = this.settings.records;
	var childKey = this.settings.childKey;
	
	var parent = this.get(table, id);
	if (!parent || !parent[records] || !Array.isArray(parent[records])){
	    console.log("LocalData.getChild: Parent record doesn't exist or is in the wrong format: " + id);
	    return false;
	}
	for (var i = 0; i < parent[records].length; i++){
	    if (parent[records][i][childKey] == childId){
		return parent[records][i];
	    }
	}
    }

    LocalData.prototype.setChild = function(table, id, childId, childRecord){
	if(!table || id == null || typeof id == "undefined"){
	    return false;
	}
	if(childId == null || typeof childId == "undefined"){
	    childId = this.nextId(table);
	}
	// get all records
	var key = this.settings.key;
	var value = this.settings.value;
	var records = this.settings.records;
	var childKey = this.settings.childKey;
	
	var parent = this.get(table, id);
	if (!parent || !parent[records] || !Array.isArray(parent[records])){
	    console.log("LocalData.setChild: Parent record doesn't exist or is in the wrong format: " + id);
	    return false;
	}
	// find the one to set
	for (var i = 0; i < parent[records].length; i++){
	    if (parent[records][i][childKey] == childId){
		// verify correct format
		if (childRecord[childKey] !== childId){
		    console.log("LocalData.setChild: Child record key (" + childKey +  ") doesn't exist in the child record being saved");
		    return false;
		}
		// replace the parent record
		parent[records][i] = childRecord;
		this.set(table, id, parent);
		return childId;
	    }
	}
	// not found - add it
	parent[records].push(childRecord);
	this.set(table, id, parent);
	return childId;
    }

    LocalData.prototype.deleteChild = function(table, id, childId){
	if(!table || !id || !childId){
	    return false;
	}
	// get all records
	var key = this.settings.key;
	var value = this.settings.value;
	var records = this.settings.records;
	var childKey = this.settings.childKey;
	var parent = this.get(table, id);
	if (!parent || !parent[records] || !Array.isArray(parent[records])){
	    console.log("LocalData.deleteChild: Parent record doesn't exist or is in the wrong format: " + id);
	    return false;
	}
	// find the parent of child to delete
	for (var i = 0; i < parent[records].length; i++){
	    if (parent[records][i][childKey] == childId){
		// delete the sub parent
		parent[records].splice(i, 1);
		this.set(table, id, parent);
		return true;
	    }
	}
	return false;
    }   
	
    return LocalData;
           
})();
