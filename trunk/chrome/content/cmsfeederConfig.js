include(jslib_dir);
include(jslib_dirutils);
include('chrome://jslib/content/rdf/rdfFile.js');

var sitesBox;
var pathRdf;

function init() {
	//Determination du chemin vers le fichier contenant la liste des sites
	var du = new DirUtils();
	var repPerso=new Dir(du.getPrefsDir());
	repPerso.append("cmsfeederSites.rdf");
	pathRdf=repPerso.path
	
	//Alimentation du template avec les donnees du rdf
	var monrdf = Components.classes['@mozilla.org/rdf/rdf-service;1'].getService().QueryInterface(Components.interfaces.nsIRDFService);
	var datasource = monrdf.GetDataSource("file://"+pathRdf);
	sitesBox = document.getElementById("sitesBox");
	sitesBox.database.AddDataSource(datasource);
	sitesBox.ref="ListeSites";
	sitesBox.builder.rebuild();
}

var message=""; 

function addMessage(mess){
	message+=mess;
}

function showMessage(){
	alert(message);
	message="";
}

function showSiteProperties(){
	walk_rdf(pathRdf);
	showMessage();
}

function walk_rdf(file) {
   var rdf = new RDFFile(file);
   addMessage("Source: " + rdf.getSource() + "\n");
   var conts = rdf.getAllContainers();
   for(var i=0; i<conts.length; i++) {
      walk_container(conts[i]);
   }
}

function walk_container(res) {
   var list;
   addMessage("Container: " + res.getSubject() + "\n");
//   walk_attributes(res);
   list = res.getSubContainers();
   for(var i=0; i<list.length; i++) {
      walk_container(list[i]);
   }
   list = res.getSubNodes();
   for(var i=0; i<list.length; i++) {
      addMessage("\tnode: " + list[i].getSubject() + "\n");
      walk_attributes(list[i]);
   }
}

function walk_attributes(node) {
   list = node.getAllAttributes();
   for(var i=0; i<list.length; i++) {
      addMessage("\t\tattr: [name=" + list[i].name + "][value=" + list[i].value + "]\n");
   }
}