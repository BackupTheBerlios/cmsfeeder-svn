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
	/*var datasource = monrdf.GetDataSource("file://"+pathRdf);
	sitesBox = document.getElementById("sitesBox");
	sitesBox.database.AddDataSource(datasource);
	sitesBox.builder.rebuild();*/
	loadTree('sitesBox', 'file://'+pathRdf);
}

var message=""; 

function addMessage(mess){
	message+=mess;
}

function showMessage(){
	alert(message);
	message="";
}

var out;
var Observer = {
	onBeginLoad: function(aSink) { alert('Begin refresh');},
	onInterrupt: function(aSink) { alert('Refresh interrupted!');},
	onResume: function(aSink) { alert('Refresh resume!');},
	onEndLoad: function(aSink) { tree.builder.rebuild(); alert('Refresh done'); },
	onError: function(aSink, aStatus, aErrorMsg) { alert('Error! ' + aErrorMsg); }
};

function loadTree(treeId, dsUrl)  {
    try {
      netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
      var RDF = Components.classes["@mozilla.org/rdf/rdf-service;1"].getService(Components.interfaces.nsIRDFService);
      var datasource 
      datasource = RDF.GetDataSource(dsUrl);
      var tree = document.getElementById(treeId);
      var remote = datasource.QueryInterface(Components.interfaces.nsIRDFRemoteDataSource);
      // Mozilla utilise un cache pour les sources de données. Si la source de données
      // est déja chargée (propriété loaded à true), on peut l'ajouter directement
      // à la base de données de notre élément et on lui demande de se reconstruire.
      // Si la source de données n'est pas dans le cache on lui attache d'abord un objet
      // Observer pour reconstruire l'élément quand la source de donnée sera complétement
      // chargée (mode asynchrone).
      if (remote.loaded) {
      alert("charg�");
        tree.database.AddDataSource(datasource);
        tree.builder.rebuild();
	alert(tree);
      }
      else {
        alert('pas charg�');
        var sink = datasource.QueryInterface(Components.interfaces.nsIRDFXMLSink);
        tree.database.AddDataSource(datasource);
	tree.builder.rebuild();
      }
    }
    catch(e) {
      alert(e);
    }
  }

function reloadTree(treeId)  {
    try {
      netscape.security.PrivilegeManager.enablePrivilege('UniversalXPConnect');
      var sink = datasource.QueryInterface(Components.interfaces.nsIRDFXMLSink);
      sink.addXMLSinkObserver(Observer);
      datasource.QueryInterface(Components.interfaces.nsIRDFRemoteDataSource).Refresh(false);
      tree = document.getElementById(treeId);
    }
    catch(e) {
      alert(e);
    }
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
   var list
   list = node.getAllAttributes();
   for(var i=0; i<list.length; i++) {
      addMessage("\t\tattr: [name=" + list[i].name + "][value=" + list[i].value + "]\n");
   }
}