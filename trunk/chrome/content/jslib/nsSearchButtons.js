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

var nsSearchButtons = {
	clear	: function (aArea) {
	   var termBox = aArea;
	   for(var numTerms=termBox.childNodes.length; numTerms > 0; numTerms--) {
	      termBox.removeChild(termBox.childNodes[0]);
	   }        
	},
	create	: function (aArea, aTerm) {
	
		var mySearchTermBox = aArea;
		var myTerms = nsFind.findAllTerms(aTerm);     
		var tempNode;
		for(var i=0;i<myTerms.length;i++) {
			tempNode = document.createElement("button");
			mySearchTermBox.appendChild(tempNode);
			tempNode.setAttribute("label", myTerms[i]);
			tempNode.setAttribute("id", "ns-searchinpage-buttons");
			//tempNode.className = "NeedleSearchSearchterms";
			tempNode.setAttribute("oncommand", "NeedleSearch.findInPage('" + myTerms[i] + "')");
			tempNode.setAttribute("tooltiptext", document.getElementById('needlesearch_properties').getString('ns.searchInPage1_tt') + " \"" + myTerms[i] + "\" " + document.getElementById('needlesearch_properties').getString('ns.searchInPage2_tt'));
			tempNode.setAttribute("orient", "horizontal");
			tempNode.setAttribute("crop", "end");
		}
	 
	}
}