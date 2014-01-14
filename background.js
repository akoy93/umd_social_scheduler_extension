// Written by Albert Koy (akoy93@terpmail.umd.edu)

// store general session information
var API_URL = "http://www.texts4terps.com/";

// this function renders a template with handlebars js
function renderHandlebars(templateName, templateData) {
  if (!render.cache) { 
    render.cache = {};
  }

  if (!render.cache[templateName]) {
    var templateDir = chrome.extension.getURL('templates');
    var templateUrl = templateDir + '/' + templateName + '.html';

    var templateString;
    $.ajax({
        url: templateUrl,
        method: 'GET',
        async: false,
        success: function(data) {
            templateString = data;
        }
    });

    render.cache[templateName] = Handlebars.compile(templateString);
  }

  return render.cache[templateName](templateData);
}

// this function appends a javascript file to the end of a node in the dom
function injectScript(scriptName, node) {
  var toInject = document.createElement("script");
  toInject.type = "text/javascript";
  toInject.src = chrome.extension.getURL('js') + ".js";
  document[node].appendChild(toInject);
}

function onInstall() {
	chrome.tabs.create({url: 'https://www.sis.umd.edu/testudo/studentSched'}, function() {
		alert('Thanks for intalling UMD Social Scheduler! Please continue to your current schedule.');
	});
}

function onUpdate(version) {
  chrome.tabs.create({url: 'https://www.sis.umd.edu/testudo/studentSched'}, function() {
    alert('UMD Social Scheduler has updated to version ' + version 
      + '! Please continue to your current schedule.');
  });
}

function getVersion() {
	var details = chrome.app.getDetails();
	return details.version;
}

// Checks if version has changed.
var currVersion = getVersion();
var prevVersion = localStorage['version'];
if (currVersion != prevVersion) {
	if (typeof prevVersion == 'undefined')
		onInstall();
  else
    onUpdate(currVersion);
	localStorage['version'] = currVersion;
}
