 
   //NeedleSearch preferences
var editor = {
	//Start of setting global variables
	
	//Global dsChecked
	dsChecked : false,
	
	//Reference to the list
	list : null,
	
	//Reference to the datasource
	ds   : null,
	
	//Something changed
	sc	: false,
	
	attributes : new Array('label','searchstring', 'method', 'encoding', 'defaultselected', 'context', 'type'),
	
	//Finish of setting global variables
	
	//Init function for the editor
	init : function ()
	{ 
	  	//Load libraries
		const Include=new Components.Constructor('@mozilla.org/moz/jssubscript-loader;1','mozIJSSubScriptLoader');
		const gInc = new Include();
		gInc.loadSubScript("chrome://cmsfeeder/content/jslib/nsRdfds.js");
		gInc.loadSubScript("chrome://cmsfeeder/content/jslib/nsRdfLocator.js");
		gInc.loadSubScript("chrome://cmsfeeder/content/jslib/nsFile.js");
		gInc.loadSubScript("chrome://cmsfeeder/content/jslib/nsSniffer.js");
		
		//Make a reference to the list
		editor.list = document.getElementById("needlesearch-editor-list");
		
		//And make it the datasource
		var aUri = 'file:///' + nsRdfLocator.getUri(true)
		editor.ds = new nsRdfds.RDFDataSource(aUri)
		editor.list.datasources = aUri
		
		//Something changed?
		editor.sc = false;
		
		//Always select an option
		if (editor.list.getRowCount() > 0) {
			editor.list.selectedIndex=0
		}
		
		editor.redraw()
		
	},
	
	//Just to see if something is selected
	isSomethingSelected : function () {
		return (editor.list.selectedIndex >= 0)
	},
	
	//add a new item
	add	: function (which)
	{
	  
	  var type, label
	  
	  switch (which) {
	    case 'separator':
	        label = '---------'
	        type = 'separator'
	    break
	    default:
	        label = 'New item'
	        type = 'item'
	    break
	  }
	  
		var newIdx = (editor.list.selectedIndex + 1)
		
		var rootNode = editor.ds.getNode(nsRdfds.baseURI) ;
		var newNode = editor.ds.getAnonymousNode();
		
		if (newIdx < 1) {
			//Last of the list, because nothing was selected
			newNode =	rootNode.addChild(newNode)
			newIdx	=	editor.list.getRowCount() + 1
		} else {
			//At insert position
			newNode = rootNode.addChildAt(newNode, newIdx)
		}
		
		newNode.addTarget(nsRdfds.aXMLPath + "label", label);
		newNode.addTarget(nsRdfds.aXMLPath + "type", type);
		editor.ds.save();
		
		//Select it again in the editor
		editor.list.selectedIndex = newIdx-1
		
		editor.redraw();
		
		return false;
	},
	
	//Remove an item
	remove : function () {
		var currentNode, property, removevalue
	    var theItem = editor.list.selectedItem
		var theIndex = editor.list.selectedIndex
		
		//A node can only be removed when it is selected
	    if (editor.isSomethingSelected()) {
	    	aID = editor.list.selectedItem.getAttribute("id")
	    	currentNode = editor.ds.getNode(aID);
			editor.ds.deleteRecursive(aID)
			editor.ds.save()
	
	    }
	    
	    if (editor.list.getRowCount() <= theIndex) {
			editor.list.selectedIndex = (editor.list.getRowCount() - 1)
		} else if (editor.list.getRowCount() > 0) {
			editor.list.selectedIndex = theIndex
		}
		
		editor.redraw();
		
	},
	
	//Disable the properties in the properties window
	redraw : function () {
      
		//Do the up & down buttons
		var curIdx		=	editor.list.selectedIndex + 1
	    
	    if (curIdx >= editor.list.getRowCount() || curIdx <= 0) {
	    	//User selected something at the end of the list
	    	document.getElementById('down').disabled = true
		} else {
			document.getElementById('down').disabled = false
		}

		if (curIdx <= 1) {
	    	//User selected something at the beginning of the list
	    	document.getElementById('up').setAttribute("disabled", "true");
		} else {
			document.getElementById('up').setAttribute("disabled", "false");
		}
		
		if (editor.list.getRowCount() == 0 || editor.list.selectedIndex == -1) {
	    	document.getElementById('delete').setAttribute("disabled", "true")
	    	document.getElementById('properties').setAttribute("disabled", "true")
	    } else {
	    	document.getElementById('delete').setAttribute("disabled", "false")
	    	document.getElementById('properties').setAttribute("disabled", "false")
	    }
	    
		//Make sure the selected option is visible
		editor.list.ensureIndexIsVisible(curIdx)
	    
	    window.sizeToContent()
	    
		return false;
	},
	
	//move items
	move : function (aDirection) {

		var aRootNode	=	editor.ds.getNode(nsRdfds.baseURI) ;
		var aID = editor.list.selectedItem.getAttribute("id")
	  	var aNode = editor.ds.getNode(aID) ;
		
		var curIdx		=	aRootNode.getChildIndex (aNode)
		var newIdx		=	curIdx + aDirection + 0
		
		if (newIdx >= (editor.list.getRowCount() + 1) || newIdx < 1) {
			return false;
		}
		
		//Move the item
		aRootNode.removeChildAt(curIdx)
		aRootNode.addChildAt(aNode, newIdx)
		
		//Select it again in the editor
		editor.list.selectedIndex = newIdx-1
		
		editor.redraw();
		
	},
	
	openProperties : function () {
		var aWin = window.open('chrome://cmsfeeder/content/properties.xul', 'properties', 'chrome,alwaysRaised=yes,centerscreen=yes,dependent=yes,dialog=yes,modal=yes,resizable=yes')
	},
	
	//Close the editor and check for changes
	close : function () {
	    self.close()
	},
	
	f_import : function () {
		var bundle = document.getElementById('needlesearch_properties');
		var isOK = nsFile.pickFileToImport(window, bundle.getString('ed.import_filter'))
		
		if (isOK == 1) {
			editor.ds.refresh(true)
		} else if (isOK == 0) {
			alert(bundle.getString('ed.import_error'))
		}
		
		
	},
	
	f_export : function () {
		if (nsFile.pickFileToExport(window)) {
			var bundle = document.getElementById('needlesearch_properties');
			alert(bundle.getString('ed.export_confirmation'))
		}
	},
	
	//Function editor.selectIndex
	//Selects the index in menulist, and makes sure it is visible
	selectIndex	: function(idx) {
		editor.list.selectedIndex = idx
		editor.list.ensureIndexIsVisible(idx)
	}
}
