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

function nsVirtualForm (aUrl, aTarget, mSearchterms, aMethod, aEncoding) {

	var NS_SPLITSTRING_DEFAULT 	= ';';
	var NS_SPLITSTRING_PREF 	= 'multiFieldSplitter';
	var NS_DEFAULT_ENCODING 	= 'UTF-8';
	var NS_DEFAULT_METHOD		= 'GET';
	
	var aVForm
	
	if (aUrl.length > 0) {
	//Is a searchengine selected?

		if (aTarget == 'newtab'){
			//For a new tab
			var newTab = getBrowser().addTab('about:blank', getReferrer(document));
			getBrowser().selectedTab = newTab
			aVForm = createForm(mSearchterms, aUrl, aMethod, aEncoding, aTarget)
		} else {
			//For a new window and same window
			try {
				aVForm = createForm(mSearchterms, aUrl, aMethod, aEncoding, aTarget)
			} catch(er) {
				//If content is i.e. xml
				window._content.location='about:blank'
				alert(' eelcoerror:' +er)
				//this.wait("this.createForm('" + mSearchterms + "','" + aUrl + "','" + aMethod + "','" + aEncoding + "','" +  aTarget + "')", aTarget)
			}
		}

	} else {
		alert(document.getElementById('needlesearch_properties').getString('ns.no_engine_error'))
		document.getElementById('NeedleSearchMenulist').focus()
	}
    
    //return false;
	
	function createForm () {
		
	    var is_multifieldsearch = false
		//Older NeedleSearch users might not have this in their list   
		dump('encoding used: ' + aEncoding + '\n')
	    if (!aEncoding) {
	    	aEncoding = NS_DEFAULT_ENCODING
	    }
	    
	    if (!aMethod) {
	    	aMethod = NS_DEFAULT_METHOD
	    }
		
		var splitString = getSplitString()
		/**
		*	A search is a multifieldsearch when:
		*	1. The search terms contain the split string (see preferences)
		*   2. The url contains the NeedleSearch1, NeedleSearch2, etc.
		*
		*/
	
		//REm = multifield string
		//REs = single field string
		REm = new RegExp("NeedleSearch[0-9]+", "gi")
		REs = new RegExp("NeedleSearch", "gi")
	
		if (mSearchterms.indexOf(splitString) > -1 && REm.test(aUrl)) {
			is_multifieldsearch = true
		}
		
		//Replace all occurrences
		if (is_multifieldsearch) {
			mSearchterms = mSearchterms.split(splitString)
			for (var i = 0; i < mSearchterms.length; i++) {
				REtemp = new RegExp("needlesearch" + (i+1),"gi")
				aUrl = aUrl.replace(REtemp, mSearchterms[i])
			}
		} else {
			aUrl = aUrl.replace(REs, mSearchterms)
			
		}
	
		//Create a virtual form
		var theDocument = window._content.document
	    var bodyObj = theDocument.body
	    var formObj = theDocument.createElement('form');
	    bodyObj.appendChild(formObj)
		
	    formObj.setAttribute("name", "NeedleSearch_VirtualForm")
	    formObj.setAttribute("id", "NeedleSearch_VirtualForm")
		formObj.setAttribute("accept-charset", aEncoding)
		formObj.setAttribute("method", aMethod)
		if (aTarget == '_blank') {
			formObj.setAttribute("target", aTarget)
		}
	    
	   	var REurl = /&url=(.*)[?]*/;
	   	var action = renderAction(aUrl, mSearchterms, is_multifieldsearch)
		formObj.setAttribute("action", action)
		
		var matches = getElements(aUrl)
		var tmpInput
		for (var i=0; i < matches.length; i++) {
			tmpInput = createInput(matches[i], theDocument, mSearchterms, splitString)
			if (tmpInput) {
				formObj.appendChild(tmpInput)
			}
		}
		//theDocument.close()	
		aForm = formObj;
		//return false;
	}
			
	function getBodyElement(theDocument) {
		var firstChild = theDocument.childNodes.length;
		var firstElement;
		for (var i = 0; i < firstChild; i++) {
			firstElement = theDocument.childNodes[1].childNodes[0];
		}
		return something;
	}

	function getElements(theUrl) {
		var formElements
		var matches = []
		if (theUrl.indexOf('?') > -1) {
			var elmnts = theUrl.substring(theUrl.indexOf('?') + 1, theUrl.length)
			matches = elmnts.split('&')
		}
		return matches		
	}


	function createInput (nameAndValue, theDocument, mSearchterms, splitString) {
			var tmpVal
			var arrNameAndValue = nameAndValue.split('=')
			var inputObj = theDocument.createElement('input');
			inputObj.setAttribute("type", "hidden")
			var name
			if (arrNameAndValue[0] == 'submit') {
				//For some reason a formelement can't be called: submit,
				// otherwise form.submit() gives an error..!
				name = 'submit2'
			} else {
				name = arrNameAndValue[0]
			}
			
			inputObj.setAttribute("name", name)
	
			if (arrNameAndValue.length > 1) {
				//Unfortunately there is no unescape with other decondings then ISO-8859-1
				try {
				//This crashes on special characters
					tmpVal = unescape(arrNameAndValue[1])
					tmpVal = tmpVal.replace(/[+]{1}/g,' ')
				} catch(err) {
					tmpVal = arrNameAndValue[1]
				}
				inputObj.setAttribute("value", tmpVal)
			}
			
			return inputObj
			
	}

	function renderAction(theUrl, mSearchterms, splitString, is_multifieldsearch)	 {
			var newUrl
			var RE = /NeedleSearch[0-9]+/gi
			
			if (theUrl.indexOf('?') > -1) {
				newUrl = theUrl.substring(0,(theUrl.indexOf('?')))	
			} else {
				newUrl = theUrl
			}
			
			return newUrl			
	
	}
	
	
	
	function getSplitString() {
		var splitString;
		splitString = nsPrefs.getCharPref(nsPrefs.NS_SPLITSTRING);
		if (splitString.length == 0) {
			splitString = nsPrefs.NS_SPLITSTRING_DEFAULT;
		}
		
		return splitString;
	}
	
	this.submit = function () {
		aForm.submit();
	}
}