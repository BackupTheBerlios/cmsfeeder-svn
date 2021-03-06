/* -*- Mode: C++; tab-width: 8; indent-tabs-mode: nil; c-basic-offset: 4 -*-
 * The contents of this file are subject to the Mozilla Public
 * License Version 1.1 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a copy of
 * the License at http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS
 * IS" basis, WITHOUT WARRANTY OF ANY KIND, either express or
 * implied. See the License for the specific language governing
 * rights and limitations under the License.
 *
 * The Original Code is rdfds
 *
 * The Initial Developer of the Original Code is Neil Deakin
 * Portions created by Neil Deakin are Copyright (C) 2002 Neil Deakin.
 * All Rights Reserved.
 *
 * Contributor(s):
 */

/* This is a library for easier access to RDF datasources and resources.
 * It contains four objects, RDFDataSource, RDFNode, RDFLiteral. and
 * RDFEnumerator.
 *
 * An RDF DataSource is a graph of nodes and literals. The constructor
 * for RDFDataSource takes one argument, a URI of an RDF file to use.
 * If the URI exists, the contents of the RDF file are loaded. If it
 * does not exist, resources can be added to it and then written using
 * this save method. If the URL argument is null, a blank datasource
 * is created.
 *
 * This library is designed for convenience not for efficiency.
 *
 * The API is documented at:
 *   http://www.xulplanet.com/tutorials/xultu/rdfds/
 *
 * Example:
 *
 * var ds=new RDFDataSource("file:///main/mozilla/mimtest.rdf");
 * var node=ds.getNode("urn:xpimaker:packlist");
 * var child=ds.getNode("urn:xpimaker:packlist:appinfo");
 * child=node.addChild(child);
 * child.addTarget("http://www.xulplanet.com/rdf/xpimaker#appname","Find Files");
 * ds.save();
 *
 */


/* RDFLoadObserver
 *   this object is necessary to listen to RDF files being loaded. The Init
 *   function should be called to initialize the callback when the RDF file is
 *   loaded.
 */
 
var nsRdfds = {
	//a location to the RDF
	aXMLPath					:   'http://www.personal-searchengines.com/rdf#',
	baseURI						:	'urn:needlesearch:data',
	RDFService					:	Components.classes["@mozilla.org/rdf/rdf-service;1"].getService(),
	RDFContainerUtilsService	:	Components.classes["@mozilla.org/rdf/container-utils;1"].getService(),
	RDFLoadObserver 			: 	function (){},
	RDFDataSource				:	function (uri,callbackFn)
	{
	  if (uri==null) this.datasource=null;
	  else this.load(uri,callbackFn);
	},
	RDFNode						:	function (uri,dsource)
	{
	  if (uri==null) this.source=null;
	  else this.source=nsRdfds.RDFService.GetResource(uri);
	
	  if (dsource==null) this.datasource=null;
	  else this.datasource=dsource.datasource;
	
	  this.container=null;
	},
	RDFLiteral					:	function (val,dsource)
	{
	  if (val==null) this.source=null;
	  else this.source=RDFService.GetLiteral(val);
	
	  if (dsource==null) this.datasource=null;
	  else this.datasource=dsource.datasource;
	},
	RDFEnumerator				:	function (enumeration,dsource)
	{
	  this.enumeration=enumeration;
	  this.datasource=dsource;
	}
	
}

nsRdfds.RDFService = nsRdfds.RDFService.QueryInterface(Components.interfaces.nsIRDFService);
nsRdfds.RDFContainerUtilsService = nsRdfds.RDFContainerUtilsService.QueryInterface(Components.interfaces.nsIRDFContainerUtils);

nsRdfds.RDFLoadObserver.prototype =
{
  callback: null,
  callbackDataSource: null,

  Init: function(c,cDS){
    this.callback=c;
    this.callbackDataSource=cDS;
  },

  QueryInterface: function(iid){
    if (iid.equals(Components.interfaces.nsIRDFXMLSinkObserver)) return this;
    else throw Components.results.NS_ERROR_NO_INTERFACE;
  },

  onBeginLoad : function(sink){},
  onInterrupt : function(sink){},
  onResume : function(sink){},
  onError : function(sink,status,msg){},
 
  onEndLoad : function(sink){
    if (this.callback!=null) this.callback(this.callbackDataSource);
  }
};  
	
nsRdfds.RDFDataSource.prototype.load=
  function(uri,callbackFn)
{
  
  if (uri.indexOf(":") == -1){
    var docurl=document.location.href;
    if (document.location.pathname == null) uri=docurl+"/"+uri;
    else uri=docurl.substring(0,docurl.lastIndexOf("/")+1)+uri;
  }

  if (callbackFn == null){
    this.datasource=nsRdfds.RDFService.GetDataSourceBlocking(uri);
  }
  else {
    this.datasource=nsRdfds.RDFService.GetDataSource(uri);
    var ds;
    try {
      var ds=this.datasource.QueryInterface(Components.interfaces.nsIRDFRemoteDataSource);
    }
    catch (ex){
      callbackFn(this);
      return;
    }
    if (ds.loaded){
      callbackFn(this);
      return;
    }

    var packObserver=new nsRdfds.RDFLoadObserver();
    packObserver.Init(callbackFn,this);

    var rawsource=this.datasource;
    rawsource=rawsource.QueryInterface(Components.interfaces.nsIRDFXMLSink);
    rawsource.addXMLSinkObserver(packObserver);
  }
}

nsRdfds.RDFDataSource.prototype.Init=
  function (dsource)
{
  this.datasource=dsource;
}

nsRdfds.RDFDataSource.prototype.parseFromString=
  function (str,baseUri)
{
  if (this.datasource==null) this.makeemptyds();
  var ios=Components.classes["@mozilla.org/network/io-service;1"]
                    .getService(Components.interfaces.nsIIOService);
  baseUri=ios.newURI(baseUri,null,null);
  var xmlParser=Components.classes["@mozilla.org/rdf/xml-parser;1"]
                          .createInstance(Components.interfaces.nsIRDFXMLParser);
  xmlParser.parseString(this.datasource,baseUri,str);
}

nsRdfds.RDFDataSource.prototype.serializeToString=
  function ()
{
  var outputStream = {
    data: "",
    close : function(){},
    flush : function(){},
    write : function (buffer,count){
      this.data += buffer;
      return count;
    },
    writeFrom : function (stream,count){},
    isNonBlocking: false
  }
  this.serializeToStream(outputStream);
  return outputStream.data;
}

nsRdfds.RDFDataSource.prototype.serializeToStream=
  function (outputStream)
{
  var ser=Components.classes["@mozilla.org/rdf/xml-serializer;1"]
                    .createInstance(Components.interfaces.nsIRDFXMLSerializer);
  ser.init(this.datasource);
  ser.QueryInterface(Components.interfaces.nsIRDFXMLSource).Serialize(outputStream);
}

nsRdfds.RDFDataSource.prototype.makeemptyds=
  function (uri)
{
  this.datasource=Components.classes["@mozilla.org/rdf/datasource;1?name=in-memory-datasource"]
                            .createInstance(Components.interfaces.nsIRDFDataSource);
}

nsRdfds.RDFDataSource.prototype.getAllResources=
  function ()
{
  if (this.datasource==null) return null;
  return new nsRdfds.RDFEnumerator(this.datasource.GetAllResources(),this.datasource);
}

nsRdfds.RDFDataSource.prototype.getRawDataSource=
  function ()
{
  if (this.datasource==null) this.makeemptyds();
  return this.datasource;
}

nsRdfds.RDFDataSource.prototype.getNode=
  function (uri)
{
  if (this.datasource==null) this.makeemptyds();
  var node=new nsRdfds.RDFNode(uri,this);
  return node;
}

nsRdfds.RDFDataSource.prototype.getAnonymousNode=
  function ()
{
  if (this.datasource==null) this.makeemptyds();

  var anon=nsRdfds.RDFService.GetAnonymousResource();
  var node=new nsRdfds.RDFNode();
  node.Init(anon,this.datasource);
  return node;
}

nsRdfds.RDFDataSource.prototype.getLiteral=
  function (uri)
{
  if (this.datasource==null) this.makeemptyds();

  return new nsRdfds.RDFLiteral(uri,this);
}

nsRdfds.RDFDataSource.prototype.refresh=
  function (sync)
{
  try {
    var ds=this.datasource.QueryInterface(Components.interfaces.nsIRDFRemoteDataSource);
    ds.Refresh(sync);
    return true;
  }
  catch (ex){
    return false;
  }
}

nsRdfds.RDFDataSource.prototype.save=
  function ()
{
  try {
    var ds=this.datasource.QueryInterface(Components.interfaces.nsIRDFRemoteDataSource);
    ds.Flush();
    return true;
  }
  catch (ex){
  	dump("ERROR in SAVE:" + ex)
    return false;
  }
}

nsRdfds.RDFDataSource.prototype.copyAllToDataSource=
  function (dsource2)
{
  if (this.datasource==null) this.makeemptyds();
  if (dsource2.datasource==null) dsource2.makeemptyds();

  var dsource1=this.datasource;
  dsource2=dsource2.datasource;

  var sourcelist=dsource1.GetAllResources();
  while(sourcelist.hasMoreElements()){
    var source=sourcelist.getNext();
    var props=dsource1.ArcLabelsOut(source);
    while(props.hasMoreElements()){
      var prop=props.getNext();
      prop=prop.QueryInterface(Components.interfaces.nsIRDFResource);
      var target=dsource1.GetTarget(source,prop,true);
      if (target!=null) dsource2.Assert(source,prop,target,true);
    }
  }
}

nsRdfds.RDFDataSource.prototype.deleteRecursive=
  function (val)
{
  var node;
  var dsource=this.datasource;
  
  if (dsource==null) return;

  if (typeof val == "string") node=nsRdfds.RDFService.GetResource(val);
  else node=val.source;

  this.deleteRecursiveH(dsource,node); // remove descendants

  // remove the node itself
  var props=dsource.ArcLabelsIn(node);
  while(props.hasMoreElements()){
  	var prop=props.getNext();
    var source=dsource.GetSource(prop,node,true);
    dsource.Unassert(source,prop,node);
  }
}

nsRdfds.RDFDataSource.prototype.deleteRecursiveH=
  function (dsource,node)
{
  var props=dsource.ArcLabelsOut(node);
  while(props.hasMoreElements()){
    var prop=props.getNext();
    var target=dsource.GetTarget(node,prop,true);
    try {
      target=target.QueryInterface(Components.interfaces.nsIRDFResource);
      this.deleteRecursiveH(dsource,target);
    }
    catch (e){}
    dsource.Unassert(node,prop,target)
  }
}
	
nsRdfds.RDFNode.prototype.Init=
  function (source,dsource)
{
  this.source=source;
  this.datasource=dsource;
  this.container=null;
}

nsRdfds.RDFNode.prototype.getValue=
  function ()
{
  return this.source.Value;
}

nsRdfds.RDFNode.prototype.rlify=
  function (val)
{
  var res=null;

  if (val!=null){
    try {
      val=val.QueryInterface(Components.interfaces.nsIRDFResource);
      res=new nsRdfds.RDFNode();
      res.Init(val,this.datasource);
    }
    catch (ex){
      try {
        val=val.QueryInterface(Components.interfaces.nsIRDFLiteral);
        res=new nsRdfds.RDFLiteral();
        res.Init(val,this.datasource);
      }
      catch (ex2){
      }
    }
  }
  return res;
}

nsRdfds.RDFNode.prototype.makeres=
  function (val)
{
  if (typeof val == "string") return nsRdfds.RDFService.GetResource(val);
  else return val.source;
}

nsRdfds.RDFNode.prototype.makelit=
  function (val)
{
  if (typeof val == "string") return nsRdfds.RDFService.GetLiteral(val);
  else return val.source;
}

nsRdfds.RDFNode.prototype.makecontain=
  function ()
{
  if (this.container!=null) return true;

  var RDFContainer = '@mozilla.org/rdf/container;1';
  RDFContainer = Components.classes[RDFContainer].createInstance();
  RDFContainer = RDFContainer.QueryInterface(Components.interfaces.nsIRDFContainer);

  try {
    RDFContainer.Init(this.datasource,this.source);
    this.container=RDFContainer;
    return true;
  }
  catch (ex){
    return false;
  }
}

nsRdfds.RDFNode.prototype.addTarget=
  function (prop,target)
{
  prop=this.makeres(prop);
  target=this.makelit(target);
  this.datasource.Assert(this.source,prop,target,true);
}

nsRdfds.RDFNode.prototype.addTargetOnce=
  function (prop,target)
{
  prop=this.makeres(prop);
  target=this.makelit(target);

  var oldtarget=this.datasource.GetTarget(this.source,prop,true);
  if (oldtarget!=null){
    this.datasource.Change(this.source,prop,oldtarget,target);
  }
  else {
    this.datasource.Assert(this.source,prop,target,true);
  }
}

nsRdfds.RDFNode.prototype.modifyTarget=
  function (prop,oldtarget,newtarget)
{
  prop=this.makeres(prop);
  oldtarget=this.makelit(oldtarget);
  newtarget=this.makelit(newtarget);
  this.datasource.Change(this.source,prop,oldtarget,newtarget);
}

nsRdfds.RDFNode.prototype.modifySource=
  function (prop,oldsource,newsource)
{
  prop=this.makeres(prop);
  oldsource=this.makeres(oldsource);
  newsource=this.makeres(newsource);
  this.datasource.Move(oldsource,newsource,prop,this.source);
}

nsRdfds.RDFNode.prototype.targetExists=
  function (prop,target)
{
  prop=this.makeres(prop);
  target=this.makelit(target);
  return this.datasource.HasAssertion(this.source,prop,target,true);
}

nsRdfds.RDFNode.prototype.removeTarget=
  function (prop,target)
{
  prop=this.makeres(prop);
  target=this.makelit(target);
  this.datasource.Unassert(this.source,prop,target);
}

nsRdfds.RDFNode.prototype.getProperties=
  function ()
{
  return new nsRdfds.RDFEnumerator(this.datasource.ArcLabelsOut(this.source),this.datasource);
}

nsRdfds.RDFNode.prototype.getInProperties=
  function ()
{
  return new nsRdfds.RDFEnumerator(this.datasource.ArcLabelsIn(this.source),this.datasource);
}

nsRdfds.RDFNode.prototype.propertyExists=
  function (prop)
{
  prop=this.makeres(prop);
  return this.datasource.hasArcOut(this.source,prop);
}

nsRdfds.RDFNode.prototype.inPropertyExists=
  function (prop)
{
  prop=this.makeres(prop);
  return this.datasource.hasArcIn(this.source,prop);
}

nsRdfds.RDFNode.prototype.getTarget=
  function (prop)
{
  prop=this.makeres(prop);
  return this.rlify(this.datasource.GetTarget(this.source,prop,true));
}

nsRdfds.RDFNode.prototype.getSource=
  function (prop)
{
  prop=this.makeres(prop);
  var src=this.datasource.GetSource(prop,this.source,true);
  if (src==null) return null;
  var res=new nsRdfds.RDFNode();
  res.Init(src,this.datasource);
  return res;
}

nsRdfds.RDFNode.prototype.getTargets=
  function (prop)
{
  prop=this.makeres(prop);
  return new nsRdfds.RDFEnumerator(
    this.datasource.GetTargets(this.source,prop,true),this.datasource);
}

nsRdfds.RDFNode.prototype.getSources=
  function (prop)
{
  prop=this.makeres(prop);
  return new nsRdfds.RDFEnumerator(
    this.datasource.GetSources(prop,this.source,true),this.datasource);
}

nsRdfds.RDFNode.prototype.makeBag=
  function ()
{
  this.container=nsRdfds.RDFContainerUtilsService.MakeBag(this.datasource,this.source);
}

nsRdfds.RDFNode.prototype.makeSeq=
  function ()
{
  this.container=nsRdfds.RDFContainerUtilsService.MakeSeq(this.datasource,this.source);
}

nsRdfds.RDFNode.prototype.makeAlt=
  function ()
{
  this.container=nsRdfds.RDFContainerUtilsService.MakeAlt(this.datasource,this.source);
}

nsRdfds.RDFNode.prototype.isBag=
  function ()
{
  return nsRdfds.RDFContainerUtilsService.isBag(this.datasource,this.source);
}

nsRdfds.RDFNode.prototype.isSeq=
  function ()
{
  return nsRdfds.RDFContainerUtilsService.isSeq(this.datasource,this.source);
}

nsRdfds.RDFNode.prototype.isAlt=
  function ()
{
  return nsRdfds.RDFContainerUtilsService.isAlt(dsource,this.source);
}

nsRdfds.RDFNode.prototype.isContainer=
  function ()
{
  return nsRdfds.RDFContainerUtilsService.IsContainer(this.datasource,this.source);
}

nsRdfds.RDFNode.prototype.getChildCount=
  function ()
{
  if (this.makecontain()){
    return this.container.GetCount();
  }
  return -1;
}

nsRdfds.RDFNode.prototype.getChildren=
  function ()
{
  if (this.makecontain()){
    return new nsRdfds.RDFEnumerator(this.container.GetElements(),this.datasource);
  }
  else return null;
}

nsRdfds.RDFNode.prototype.addChild=
  function (child,exists)
{
  if (this.makecontain()){
    var childres=null;
    if (typeof child == "string"){
      childres=nsRdfds.RDFService.GetResource(child);
      child=new nsRdfds.RDFNode();
      child.Init(childres,this.datasource);
    }
    else childres=child.source;

    if (!exists && this.container.IndexOf(childres)>=0) return child;

    this.container.AppendElement(childres);
    return child;
  }
  else return null;
}

nsRdfds.RDFNode.prototype.addChildAt=
  function (child,idx)
{
  if (this.makecontain()){
    var childres=null;
    if (typeof child == "string"){
      childres=nsRdfds.RDFService.GetResource(child);
      child=new nsRdfds.RDFNode();
      child.Init(childres,this.datasource);
    }
    else childres=child.source;
    this.container.InsertElementAt(childres,idx,true);
    return child;
  }
  else return null;
}

nsRdfds.RDFNode.prototype.removeChild=
  function (child)
{
  if (this.makecontain()){
    var childres=null;
    if (typeof child == "string"){
      childres=nsRdfds.RDFService.GetResource(child);
      child=new nsRdfds.RDFNode();
      child.Init(childres,this.datasource);
    }
    else childres=child.source;
    this.container.RemoveElement(childres,true);
    return child;
  }
  else return null;
}

nsRdfds.RDFNode.prototype.removeChildAt=
  function (idx)
{
  if (this.makecontain()){
    var childres=this.container.RemoveElementAt(idx,true);
    return this.rlify(childres);
  }
  else return null;
}

nsRdfds.RDFNode.prototype.getChildIndex=
  function (child)
{
  if (this.makecontain()){
    return this.container.IndexOf(child.source);
  }
  else return -1;
}

nsRdfds.RDFNode.prototype.type="Node";
	
	
nsRdfds.RDFLiteral.prototype.Init=
  function (source,dsource)
{
  this.source=source;
  this.datasource=dsource;
}

nsRdfds.RDFLiteral.prototype.getValue=
  function ()
{
  return this.source.Value;
}

nsRdfds.RDFLiteral.prototype.makeres=
  function (val)
{
  if (typeof val == "string") return nsRdfds.RDFService.GetResource(val);
  else return val.source;
}

nsRdfds.RDFLiteral.prototype.makelit=
  function (val)
{
  if (typeof val == "string") return nsRdfds.RDFService.GetLiteral(val);
  else return val.source;
}

nsRdfds.RDFLiteral.prototype.modifySource=
  function (prop,oldsource,newsource)
{
  prop=this.makeres(prop);
  oldsource=this.makeres(oldsource);
  newsource=this.makeres(newsource);
  this.datasource.Move(oldsource,newsource,prop,this.source);
}

nsRdfds.RDFLiteral.prototype.getInProperties=
  function (prop)
{
  return new nsRdfds.RDFEnumerator(this.datasource.ArcLabelsIn(this.source),this.datasource);
}

nsRdfds.RDFLiteral.prototype.inPropertyExists=
  function (prop)
{
  prop=this.makeres(prop);
  return this.datasource.hasArcIn(this.source,prop);
}

nsRdfds.RDFLiteral.prototype.getSource=
  function (prop)
{
  prop=this.makeres(prop);
  var src=this.datasource.GetSource(prop,this.source,true);
  if (src==null) return null;
  var res=new nsRdfds.RDFNode();
  res.Init(src,this.datasource);
  return res;
}

nsRdfds.RDFLiteral.prototype.getSources=
  function (prop)
{
  prop=this.makeres(prop);
  return new nsRdfds.RDFEnumerator(
    this.datasource.GetSources(prop,this.source,true),this.datasource);
}

nsRdfds.RDFLiteral.prototype.type="Literal";

	

nsRdfds.RDFEnumerator.prototype.hasMoreElements=
  function ()
{
  return this.enumeration.hasMoreElements();
}

nsRdfds.RDFEnumerator.prototype.getNext=
  function ()
{
  var res=null;
  var val=this.enumeration.getNext();

  if (val!=null){
    try {
      val=val.QueryInterface(Components.interfaces.nsIRDFResource);
      res=new nsRdfds.RDFNode();
      res.Init(val,this.datasource);
    }
    catch (ex){
      try {
        val=val.QueryInterface(Components.interfaces.nsIRDFLiteral);
        res=new nsRdfds.RDFLiteral();
        res.Init(val,this.datasource);
      }
      catch (ex2){
      }
    }
  }
  return res;
}



