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


var nsHighlight = {
	//If highlight = on
	hlOn				:	false,
	
	//contains the text
	str					: '',
	
	hl	: function () {
		// Initialize to current document
	    var gTheDocument = window._content.document;
	
	    var termColor = new Array("yellow", "lightpink", "aquamarine", "darkgoldenrod", "darkseagreen", "lightgreen", "rosybrown", "seagreen", "chocolate", "violet");
	    var critBox = document.getElementById("NeedleSearchSearchTerms");
	    var term = critBox.value;
		
	    if (nsHighlight.hlOn)
	    {
	        nsHighlight.hlOn = false;
	        nsHighlight.highlightDoc(null, null);
	        if (nsHighlight.str == term)
	            return;
	    }
	
	    nsHighlight.hlOn = true;
	    nsHighlight.str = term;
	
	    var myTerms = nsHighlight.find(term);
	    for (var i = 0; i < myTerms.length; i++) {
	        nsHighlight.highlightDoc(myTerms[i], termColor[i %10]);
	    }
	
	},
	
	//Find terms
	find	: function (criteria) {
	   // quotes only matter when preceded by a space or a quote.
	   var terms = new Array();
	   
	   var splitStr = nsPrefs.getCharPref(nsPrefs.NS_SPLITSTRING);
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
	},
	
	//Highlight doc
	highlightDoc : function (word, color, win)
	{
	    if (!win)
	        win = window._content;
	
	    for (var i=0; win.frames && i<win.frames.length; i++)
	    {
	        nsHighlight.highlightDoc(word, color, win.frames[i]);
	    }
	
	    var doc = win.document;
	    if(!document)
	        return;
	
	    // Remove highligthing
	    if (!color)
	    {
	        var elem = null;
	        while (elem = doc.getElementById("NeedleSearch-search-id"))
	        {
	            var child = null;
	            var docfrag = doc.createDocumentFragment();
	            var next = elem.nextSibling;
	            var parent = elem.parentNode;
	            while(child = elem.firstChild)
	                docfrag.appendChild(child);
	            parent.removeChild(elem);
	            parent.insertBefore(docfrag, next);
	        }
	        return;
	    }
	
	
	    var body = doc.body;
	    if (!body)
	        return;
	    var count = body.childNodes.length;
	
	    searchRange = doc.createRange();
	    startPt = doc.createRange();
	    endPt = doc.createRange();
	
	    var baseNode = doc.createElement("span");
	    baseNode.setAttribute("style", "background-color: " + color + ";");
	    baseNode.setAttribute("id", "NeedleSearch-search-id");
	
	    searchRange.setStart(body, 0);
	    searchRange.setEnd(body, count);
	
	    startPt.setStart(body, 0);
	    startPt.setEnd(body, 0);
	    endPt.setStart(body, count);
	    endPt.setEnd(body, count);
	    nsHighlight.highlightText(word, baseNode);
	
	},
	
	//hightlight text
	highlightText : function (word, baseNode)
	{
	    var retRange = null;
	    while(retRange = nsFind.rFind(word, searchRange, startPt, endPt))
	    {
	
	        // check that we have a whole word
	        //gSelection.addRange(range);
	
	        // Highlight
	        var nodeSurround = baseNode.cloneNode(true);
	        var node = nsHighlight.highlight(retRange, nodeSurround);
	        startPt = node.ownerDocument.createRange();
	        startPt.setStart(node, node.childNodes.length);
	        startPt.setEnd(node, node.childNodes.length);
	    }
	},
	
	//highlight
	highlight	:	function (range, node)
	{
	    var startContainer = range.startContainer;
	    var startOffset = range.startOffset;
	
	    var endOffset = range.endOffset;
	
	    var docfrag = range.extractContents();
	    var before = startContainer.splitText(startOffset);
	    var parent = before.parentNode;
	    node.appendChild(docfrag);
	    parent.insertBefore(node, before);
	    return node;
	}
		
		
		
		

}




