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


var nsFind = {
	// Search component
	nsFinder 			: Components.classes["@mozilla.org/embedcomp/rangefind;1"].createInstance().QueryInterface(Components.interfaces.nsIFind),
	
	rFind	: function (word, searchRange, startPt, endPt) {
		return nsFind.nsFinder.Find(word, searchRange, startPt, endPt)
	},
	
	find	: function (str, searchRange, startPt, endPt) {
		
	    if (str == "") { return false }
		
		//set focus to window
	    var focusedWindow = document.commandDispatcher.focusedWindow;
		if (!focusedWindow || focusedWindow == window)
		    focusedWindow = window._content;
		
		var findInst = gBrowser.webBrowserFind;
		var findInFrames = findInst.QueryInterface(Components.interfaces.nsIWebBrowserFindInFrames);
		findInFrames.rootSearchFrame = _content;
		findInFrames.currentSearchFrame = focusedWindow;
		
		var findService = Components.classes["@mozilla.org/find/find_service;1"]
		        .getService(Components.interfaces.nsIFindService);
		findInst.searchString  = str;
		findInst.matchCase     = findService.matchCase;
		findInst.wrapFind      = true;
		findInst.entireWord    = findService.entireWord;
		findInst.findBackwards = false;
		
		var searchResult = findInst.findNext();
		
		return searchResult
	},
	/**
	*	Small routine to find all occurences
	*	
	*/
	findAllTerms : function (criteria) {
		// quotes only matter when preceded by a space or a quote.
		var terms = new Array();
		var splitStr

		try {
			splitStr = nsPrefs.getCharPref(nsPrefs.NS_SPLITSTRING);
		} catch (err) {
			splitStr = ';'
		}
		   
		criteria = criteria.replace(splitStr, ' ')
		
		var inQuote = false;
		var haveTerm = false;
		
		var index = 0;       // our current pointer
		var currPtr = 0; // the start of the current term
		var prevChar = ' ';  // the char we last saw
			
		while (index < criteria.length) {
			var currChar = criteria.charAt(index);
		
			switch (currChar) {
				case ' ':
					if (!inQuote && haveTerm) {
						var val = nsStrings.trim(criteria.substring(currPtr, index));
							if (!nsStrings.isIn(terms, val))
								terms.push(val);
				        haveTerm = false;
				     }
				break;
				case '"':
					if (!inQuote) {
						if (haveTerm) {
					       var val = nsStrings.trim(criteria.substring(currPtr, index));
					       if (!nsStrings.isIn(terms, val))
					           terms.push(val);
					       haveTerm = false;
					    }
						if ((prevChar == ' ') || (prevChar == '"')) {
			               inQuote = true;
			            }
			         } else {
			            if (haveTerm) {
			               var val = nsStrings.trim(criteria.substring(currPtr, index));
			               if (!nsStrings.isIn(terms, val))
			                   terms.push(val);
			               haveTerm = false;
			               inQuote = false;
			            }
			         }
				break;
				default:
					if (!haveTerm) {
		            	haveTerm = true;
		            	currPtr = index;
					}
			}
		    prevChar = currChar;
		    index++;
		   }

		   var val = nsStrings.trim(criteria.substring(currPtr, index));
		   if (haveTerm && !nsStrings.isIn(terms, val) ) {
		      terms.push(val);
		   }
		   
		   return terms;
	
	}
}