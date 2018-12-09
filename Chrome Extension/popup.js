var settings = {};

chrome.storage.sync.get({settings: DEFAULT_SETTINGS}, function(result) {
	settings = result.settings;
	//migrateSettings(settings.currentVersion);
	chrome.storage.sync.set({settings: settings}, function() {
		renderForm();
	});
});


var formElement = document.querySelector('#prefsForm');
formElement.addEventListener('change', formChanged);

function formChanged(event) {
	readFormToSettings();
	console.log(settings);
	renderForm();
	writeSettings();
}

function writeSettings() {
	chrome.storage.sync.set({settings: settings}, function() {
		console.log("written");
	});
}

function readFormToSettings() {
	settings.enableFolders = document.querySelector('#folder-toggle-checkbox').checked;
	settings.hideFilePaths = !document.querySelector('#fullfilename-toggle-checkbox').checked;

	if (!settings.enableFolders) {
		settings.hideFilePaths = false;
	}

	settings.modifyTabs = document.querySelector('#spacestabs-toggle-checkbox').checked;
	if (document.querySelector('#spaces-radio-button').checked) {
		settings.tabsAreSpaces = true;
	} else {
		settings.tabsAreSpaces = false;
	}
	settings.tabSpaceCount = document.querySelector('#number-of-spaces-textbox').value;
	if (settings.tabSpaceCount == "") {
		settings.tabSpaceCount = 0;
	}
	settings.rememberLineNumbers = document.querySelector('#remember-linenum-checkbox').checked;
}

function renderForm() {
	document.querySelector('#folder-toggle-checkbox').checked = settings.enableFolders;
	document.querySelector('#fullfilename-toggle-checkbox').checked = !settings.hideFilePaths;
	document.querySelector('#spacestabs-toggle-checkbox').checked = settings.modifyTabs;
	if (settings.tabsAreSpaces) {
		document.querySelector('#spaces-radio-button').checked = true;
	} else {
		document.querySelector('#tabs-radio-button').checked = true;
	}
	document.querySelector('#number-of-spaces-textbox').value = settings.tabSpaceCount;
	document.querySelector('#remember-linenum-checkbox').checked = settings.rememberLineNumbers;

	document.querySelector('#spaces-radio-button').disabled = !settings.modifyTabs;
	document.querySelector('#tabs-radio-button').disabled = !settings.modifyTabs;
	document.querySelector('#number-of-spaces-textbox').disabled = !settings.modifyTabs;

	document.querySelector('#fullfilename-toggle-checkbox').disabled = !settings.enableFolders;
}
