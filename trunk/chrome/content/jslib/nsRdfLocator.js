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

var nsRdfLocator = {
	
	getUri : function (doEscape) {
		//Get the location of the rdf file
		var dirService = Components.classes['@mozilla.org/file/directory_service;1'].getService(Components.interfaces.nsIProperties);
	
		const NS_APP_USER_PROFILE_50_DIR = "ProfD";
		profileDir = dirService.get(NS_APP_USER_PROFILE_50_DIR,
				Components.interfaces.nsIFile);
		
		var aUri
		
		// If firefox 0.9 or higher
	    if (nsSniffer.isFF09OrHigher()) {
			if (nsSniffer.isWin()) {
				aUri = profileDir.path + '\\extensions\\{1a106bdc-804e-4bea-a011-689398701943}\\chrome\\cmsfeederSites.rdf'
			} else {
				aUri = profileDir.path + '/extensions/{1a106bdc-804e-4bea-a011-689398701943}/chrome/cmsfeederSites.rdf'
			}
		} else {
			if (nsSniffer.isWin()) {
				aUri = profileDir.path + '\\chrome\\needlesearch\\cmsfeederSites.rdf'
			} else {
				aUri = profileDir.path + '/chrome/needlesearch/cmsfeederSites.rdf'
			}
		}
		
		if (doEscape) {
			aUri = escape(aUri)
		}
		
		return aUri
	}	

}