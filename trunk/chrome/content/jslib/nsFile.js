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


var nsFile = {
	readFile : function (str_Filename)
	{ 
		try{
           var obj_File = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
           obj_File.initWithPath(str_Filename);
 
           var obj_InputStream =  Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
           obj_InputStream.init(obj_File,0x01,0444,null);
 
           var obj_ScriptableIO = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);
           obj_ScriptableIO.init(obj_InputStream);
        } catch (e) { alert(e); }
 
        try {
                var str = obj_ScriptableIO.read(obj_File.fileSize-1);
        } catch (e) { dump(e); }
        obj_ScriptableIO.close();
        obj_InputStream.close();
        return str;
	},
	
	//Checks if file exists
	exists : function (str_Filename) {
		var obj_File = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		obj_File.initWithPath(str_Filename);
		return obj_File.exists()
			
	},
	
	//Write a string to a file
	writeFile : function (str_Buffer, str_Filename)
	{	
		try {
			var obj_File = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
			obj_File.initWithPath(str_Filename);
			
			//Attempt to create it if it doesn't exist
			if (!obj_File.exists()) {
				obj_File.create(0x00,0755);
			}
			
			var obj_OutputStream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance( Components.interfaces.nsIFileOutputStream );
			obj_OutputStream.init( obj_File, 0x04 | 0x08 | 0x20, 420, 0 );
			obj_OutputStream.write(str_Buffer, str_Buffer.length);
			obj_OutputStream.flush()
			obj_OutputStream.close();
		} catch (e) {
			alert(e)
		}
	},
	
	pickFileToImport : function (aWindow, aLabel) {
		var nsIFilePicker = Components.interfaces.nsIFilePicker;
		var fp = Components.classes["@mozilla.org/filepicker;1"]
		        .createInstance(nsIFilePicker);
		fp.init(aWindow, "Select a File", nsIFilePicker.modeOpen);
		fp.appendFilter(aLabel, "NeedleSearchBookmarks.rdf; NeedleSearchData.rdf");
		var res=fp.show();
		if (res==nsIFilePicker.returnOK){
			var aUri = nsRdfLocator.getUri(false)
			var thefile=fp.file;
			var str = nsFile.readFile(thefile.path)
			var rightFormat = nsFile.checkImportedFile(thefile.path)
			if (rightFormat) {
				nsFile.writeFile(str, aUri)
				return 1
			} else {
				return 0
			}
		} else {
			return 2;
		}
	},
	
	pickFileToExport : function (aWindow) {
		   
		   var nsIFilePicker = Components.interfaces.nsIFilePicker;
		   var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
		   fp.init(aWindow, "Export NeedleSearch Bookmarks", nsIFilePicker.modeSave);
		   fp.appendFilters(nsIFilePicker.filterAll);
		   fp.defaultString = "NeedleSearchBookmarks.rdf";
		   var res=fp.show();
		   if (res==nsIFilePicker.returnOK){
		     	var thefile=fp.file;
		     	var aUri = nsRdfLocator.getUri(false)
				var thefile=fp.file;
	
				var str = nsFile.readFile(aUri)
				nsFile.writeFile(str, thefile.path)
				return true
		   } else {
				return false
		   }
				
	},
	
	checkImportedFile : function (aFilepath) {
		fileIsOk = false
		try {
			var dsource		= 	new nsRdfds.RDFDataSource('file:///' + aFilepath)
			var aRootNode	=	dsource.getNode(nsRdfds.baseURI) ;
			if (aRootNode) {
				fileIsOk = true
			} else {
				fileIsOk = false
			}
		} catch (err){
			fileIsOk = false
		}
		
		return fileIsOk
	}
}