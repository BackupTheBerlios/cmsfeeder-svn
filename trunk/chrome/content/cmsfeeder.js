function login(){
	var url="http://www.demo.websiteburo.com/spip/spip_login.php3?var_url=ecrire%2F.%2F";
	
	netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
	
	// create a new XMLHttpRequest object
	var xrequest=new XMLHttpRequest();
	
	// open a connection to the remote site. You can use a GET
	// or a POST. The second argument to the open function should
	// be the URL to open. The third argument should be false for a
	// synchronous connection, which will cause the open method to wait
	// until the response is received. If the third argument is set
	// to true, the open method does not wait. You can assign a script to
	// the XMLHttpRequest's onload property in this case and it will
	// be executed when the response is available.
	xrequest.open("POST",url,false);
	
	// The request is not made until the send function is called. If
	// doing a POST, you can pass a string or a document object which
	// will be sent as the post content.
	//xrequest.send(null);
	xrequest.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
	xrequest.send("var_login=demoadmin&var_url=ecrire/./");
	
	// The response will be returned in both the responseText and
	// responseXML properties. The former holds the plain text version
	// whereas the latter returns the XML parsed as a document, if the
	// content is XML. If it isn't, you can still use responseText to
	// get the content.
	var resultxml=xrequest.responseXML;
	var resulttxt=xrequest.responseText;

	alert(resulttxt);
}