/****** BEGIN LICENSE BLOCK *****
   - Version: MPL 1.1/GPL 2.0/LGPL 2.1
   -
   - The contents of this file are subject to the Mozilla Public License Version
   - 1.1 (the "License"); you may not use this file except in compliance with
   - the License. You may obtain a copy of the License at
   - http://www.mozilla.org/MPL/
   -
   - Software distributed under the License is distributed on an "AS IS" basis,
   - WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
   - for the specific language governing rights and limitations under the
   - License.
   -
   - The Initial Developer of the Original Code is Eelco van Kuik.
   -
   - Contributor(s):
   - Several developers
   -
   - Alternatively, the contents of this file may be used under the terms of
   - either the GNU General Public License Version 2 or later (the "GPL"), or
   - the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
   - in which case the provisions of the GPL or the LGPL are applicable instead
   - of those above. If you wish to allow use of your version of this file only
   - under the terms of either the GPL or the LGPL, and not to allow others to
   - use your version of this file under the terms of the MPL, indicate your
   - decision by deleting the provisions above and replace them with the notice
   - and other provisions required by the LGPL or the GPL. If you do not delete
   - the provisions above, a recipient may use your version of this file under
   - the terms of any one of the MPL, the GPL or the LGPL.
   -
   - ***** END LICENSE BLOCK *****/
   
   var nsAutoAdder = {
	/**
	 * AutoAdder()
	 * This class contains all functionality of the Auto-Add option
	 * 
	 * @author Eelco van Kuik
	 */
	RDFDS	: 	null,
	STATUS	:	false,
	PListener : {
	  onProgressChange: function ProgressChange(aWebProgress, aRequest, aCurSelfProgress, aMaxSelfProgress, aCurTotalProgress, aMaxTotalProgress) {},
	  onStateChange: function StateChange(aWebProgress, aRequest, aStateFlags, aStatus) {},
	  onLocationChange: function LocationChange(aWebProgress, aRequest, aLocation) {
	    var domWindow = aWebProgress.DOMWindow;
	    nsAutoAdder.grabURL(aLocation)
	    
	  },
	  onStatusChange: function StatusChange(aWebProgress, aRequest, aStatus, aMessage) {},
	  onSecurityChange: function SecurityChange(aWebProgress, aRequest, aState) {},
	  QueryInterface: function QueryInterface(aIID) {
	    if (aIID.equals(Components.interfaces.nsIWebProgressListener) ||
	        aIID.equals(Components.interfaces.nsISupportsWeakReference) ||
	        aIID.equals(Components.interfaces.nsISupports))
	      return this;
	    throw Components.results.NS_NOINTERFACE;
	  }
	},
	
	/**
	 * public start()
	 * 
	 * This method starts the Auto-adder.
	 * 
	 * @author Eelco van Kuik
	 */
	
	start : function (aWindow) {
		
		var total;
	    nsAutoAdder.changeAction(aWindow);
	    nsAutoAdder.STATUS = true;
	    getBrowser().addProgressListener(nsAutoAdder.PListener);
	    return true;
	},
	
	/**
	 * 
	 * public stop()
	 * 
	 * Stops the AutoAdder
	 * 
	 * @author Eelco van Kuik
	*/
	stop			: function () {
		if (getBrowser()) {
			getBrowser().removeProgressListener(nsAutoAdder.PListener);
		}
	    nsAutoAdder.STATUS = false
	},
	
	/**
	 * 
	 * private changeAction()
	 * 
	 * Changes the action to get. Adds an extra field called: "NeedleSearch_postMethod"
	 * that contains the previous method.
	 * 
	 * @author Eelco van Kuik
	*/
	changeAction	: function (theWindow) {
	    
	    var theForms
	    if (theWindow.document && theWindow.document.forms) {
	        for (var i = 0; i < theWindow.document.forms.length; ++i) {
		        
		        try {
			        //Send old method with it
		            if (theWindow.document.forms[i].method == 'post') {
		            	//It was posted
			            var inputObj = window._content.document.createElement("input")
			        	inputObj.setAttribute("name","NeedleSearch_postMethod")
			        	inputObj.setAttribute("type","hidden")
		            	theWindow.document.forms[i].appendChild(inputObj)            	
		            }
		            theWindow.document.forms[i].method="get";
				} catch(err) {
					//If this failed, let's hope the form is in another window..
				}
	
		    }
		    //Now check if there are more frames in this window
		    if (theWindow.frames) {    
		        for (var j=0; j < theWindow.frames.length; j++) {
		           nsAutoAdder.changeAction(theWindow.frames[j])
		        }
		    }
		}
	},
	
	/**
	 * private grabURL()
	 * 
	 * grabs the URL of the window
	 * @author Eelco van Kuik
	 */
	
	 grabURL	: function(aLocation) {
		
		//Remove the listener
	    getBrowser().removeProgressListener(nsAutoAdder.PListener);
	    
	    var win = window._content.document
	    var newurl = aLocation.prePath + aLocation.path
	    var method = nsAutoAdder.getMethod(newurl)
	    newurl = nsAutoAdder.getStrippedUrl(newurl)
	    var encoding = win.characterSet
	    
	    if (newurl.indexOf('NeedleSearch') > 0) {
	        nsAutoAdder.finish(aLocation.host, newurl, method, encoding)
	    } else {
	        alert(document.getElementById('needlesearch_properties').getString('ns.autoadd_error'))
	    }
	    
	    nsAutoAdder.STATUS = false
	    document.getElementById('ns-autoadd-button').setAttribute("image", "chrome://needlesearch/content/img/red.gif")
	    document.getElementById('ns-autoadd-button').setAttribute("label", NeedleSearch.aBundle.getString('ns.noimage_autoadd'));
	    win.close()
	},
	
	
	/**
	 * private getMethod
	 * 
	 * Gets the method from the url, depending on wether or not it contains the variable
	 * called: "NeedleSearch_postMethod"
	 * 
	 * @author Eelco van Kuik
	 */
	
	getMethod	: function (theSearchstring) {
		var RE = /[&|?]+NeedleSearch_postMethod=/
		var method
		if (RE.test(theSearchstring)) {
			return 'post'
		} else {
			return 'get'
		}
	},
	
	/**
	 * private getStrippedUrl()
	 * 
	 * Strips the URL of the unecessary variable: "NeedleSearch_postMethod"
	 * 
	 * @author Eelco van Kuik
	 */
	
	getStrippedUrl	: function (theSearchstring) {
		var win = window._content.document
		var RE = /[&|?]+NeedleSearch_postMethod=/
		return theSearchstring.replace(RE,'')
	},
	
	/**
	 * private finish()
	 * 
	 * Adds the form to the rdf file
	 * 
	 * @author Eelco van Kuik
	 */

	finish	: function (aHost, searchstring, method, encoding) {   
	    
	    //Get a label for the new entry, let the user fill it in.
	    var label = aHost
	    label = prompt(document.getElementById('needlesearch_properties').getString('ns.autoadd_prompt'), aHost)
	    
	    if (typeof(label) == 'object' || label.replace(/^\s+|\s+$/, '') == '') {
	    	label = aHost
	    }
		
		//Use the rdfds lib to insert the new entry. Do it anonymously (is like sequence)
		var aUri 		=	'file:///' + nsRdfLocator.getUri(true)
		var dsource		= 	new nsRdfds.RDFDataSource(aUri)
		var aRootNode	=	dsource.getNode(nsRdfds.baseURI) ;
		var child		=	dsource.getAnonymousNode();
		child			=	aRootNode.addChild(child);
		child.addTarget(nsRdfds.aXMLPath + 'type', 'item');
		child.addTarget(nsRdfds.aXMLPath + 'label', label);
		child.addTarget(nsRdfds.aXMLPath + 'searchstring', searchstring);
		child.addTarget(nsRdfds.aXMLPath + 'method', method);
		child.addTarget(nsRdfds.aXMLPath + 'encoding', encoding);
		dsource.save();
	    dsource.refresh()
	    
	    alert(document.getElementById('needlesearch_properties').getString('ns.autoadd_succes') + label)
	    return false;
	    
	}
}