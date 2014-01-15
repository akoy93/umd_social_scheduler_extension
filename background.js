// Written by Albert Koy (akoy93@terpmail.umd.edu)

function onInstall() {
	chrome.tabs.create({url: 'http://www.testudo.umd.edu/ssched/index.html'}, function() {
		alert('Thanks for intalling UMD Social Scheduler! Please continue to your current schedule.');
	});
}

function onUpdate(version) {
  chrome.tabs.create({url: 'http://www.testudo.umd.edu/ssched/index.html'}, function() {
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
