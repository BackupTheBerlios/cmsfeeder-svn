const APP_NAME			= "CmsFeeder";
const APP_CHROME_NAME		= "cmsfeeder";
const APP_VERSION		= "0.01";
const APP_FILE 			= "cmsfeeder.jar";
const APP_CONTENTS_PATH		= "content/";
const APP_SKIN_CLASSIC_PATH	= "skin/classic/";
const APP_LOCALE_ENUS_PATH	= "locale/en-US/";
const APP_LOCALE_FRFR_PATH	= "locale/fr-FR/";


initInstall(APP_NAME, APP_CHROME_NAME, APP_VERSION); 

var chromeFolder = getFolder("Current User", "chrome");
setPackageFolder(chromeFolder);
addFile(APP_NAME, "chrome/" + APP_FILE, chromeFolder, "");

var jarFolder = getFolder(chromeFolder, APP_FILE);
registerChrome(CONTENT | PROFILE_CHROME, jarFolder, APP_CONTENTS_PATH);
registerChrome(SKIN | PROFILE_CHROME, jarFolder, APP_SKIN_CLASSIC_PATH);
registerChrome(LOCALE | PROFILE_CHROME, jarFolder, APP_LOCALE_ENUS_PATH);
registerChrome(LOCALE | PROFILE_CHROME, jarFolder, APP_LOCALE_FRFR_PATH);

var result = getLastError(); 
if(result == SUCCESS) {
	performInstall();
} else {
	cancelInstall(result);
}
