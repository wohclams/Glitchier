

var settings = {};

initialize();

function initialize() {
	chrome.storage.sync.get({settings: DEFAULT_SETTINGS}, function(result) {
		settings = result.settings;
		//migrateSettings(settings.currentVersion);
		chrome.storage.sync.set({settings: settings}, function() {
			
		});
	});
}

var filetreeUl = document.querySelector(".filetree");

var config = { childList: true };
var observer = new MutationObserver(fileListChanged);

observer.observe(filetreeUl, config);

var projectNameSpan = document.querySelector(".project-name");
var projectNameObserver = new MutationObserver(projectChanged);

projectNameObserver.observe(projectNameSpan, {attributes: true, childList: true, characterData: true});

var filesSection = document.querySelector('section .files');
filesSection.addEventListener('click',clickedAFile);

var fT = new FolderTree();
var projectId = getProjectId();

function fileListChanged(mutationsList, observer) {
	//console.log(mutationsList);
	//
	// for (let mutation of mutationsList) {
	// 	let addedNodes = mutation.addedNotes;
	// 	for (let addedNode in addedNodes) {
	// 		if (addedNode.classList.contains('clamz-extension-folder')) {
	// 			console.log("It's one of ours!");
	// 		}
	// 	}
	// }

	updateEverything();

}

function updateEverything() {
	if (settings.enableFolders) {
		loadAllFiles();
		render();
	}
}

function loadAllFiles() {
	let fileLis = Array.from(filetreeUl.querySelectorAll(".file"));
	let newFlatList = [];
	for (let i=0;i<fileLis.length;i++) {
		if (fT.isGoodPath(fileLis[i].title)) {
			newFlatList.push(fileLis[i].title);
		}
	}

	let toBeRemoved = fT.flatList.filter(function(i) {return newFlatList.indexOf(i) < 0;});
	let toBeAdded = newFlatList.filter(function(i) {return fT.flatList.indexOf(i) < 0;});

	// console.log("To be removed: ");
	// console.log(toBeRemoved);
	// console.log("To be added: ");
	// console.log(toBeAdded);

	for (let i=0;i<toBeRemoved.length;i++) {
		fT.deleteFileByPath(toBeRemoved[i]);
	}
	for (let i=0;i<toBeAdded.length;i++) {
		fT.addFileFromPath(toBeAdded[i]);
	}

}

function projectChanged(mutationsList, observer) {
	console.log(mutationsList);

	let newProjectId = getProjectId();
	if (projectId !== newProjectId) {
		//console.log("PROJECT CHANGED ============================= ");
		projectId = newProjectId;
	}

	for (let i=0;i<mutationsList.length;i++) {
		if (mutationsList[i].addedNodes.length>0) {
			loadAllFiles();
			render();
		}
		if (mutationsList[i].removedNodes.length>0) {
			cleanUp();
			fT.folderTree = [];
			fT.flatList = [];
		}
	}

}

function getProjectId() {
	// a hack to get what seems to be a non-changing project guid... from the only place it seems to appears in the page
	var downloadLink = document.querySelector("a[href^='https://api.glitch.com/project/download/']");

	var queryParams = downloadLink.search.split('&');
	for (let i = 0; i < queryParams.length; i++) {
		var pair = queryParams[i].split('=');
		if (pair[0]==="projectId") {
			return decodeURIComponent(pair[1]);
		}
	}

}


function render() {

	observer.disconnect();

	let list = document.querySelector('.filetree');

	let fileTree = fT.folderTree.slice();
	recursiveFolderBuilder(list,fileTree);

	// var sidebar = document.querySelector('#sidebar');
	// sidebar.style.width = "370px";

	// var sidebarFiles = document.querySelector('#sidebar-files');
	// sidebarFiles.style.overflowX = "auto";

	renderVisibleState(fT.folderTree);

	// set the folder paths hidden or not
	let folderPaths = document.querySelectorAll('.folder-path');
	for (let i=0;i<folderPaths.length;i++) {
		if (settings.hideFilePaths) {
			folderPaths[i].classList.add('hidden');
		} else {
			folderPaths[i].classList.remove('hidden');
		}
	}


	observer.observe(filetreeUl, config);

}

function folderClicked(event) {
	event.preventDefault();
	event.stopPropagation();
	toggleFolder(event.target.parentElement);
}

function toggleFolder(target) {
	let path = target.title;
	let node = fT.findFileByPath(path);
	for (let i=0;i<node.children.length;i++) {
		let child = node.children[i];
		child.hidden = !child.hidden;
	}
	renderVisibleState(fT.folderTree);

}

function clickedAFile(event) {
	renderVisibleState(fT.folderTree);
}

function renderVisibleState(folderTree) {

	for (let i=0;i<folderTree.length;i++) {
		let file = folderTree[i];
		let fileElement = document.querySelector('[title="' + file.fullpath + '"]');
		if (file.hidden) {
			//console.log(file);
			fileElement.classList.add('hidden');
		} else {
			fileElement.classList.remove('hidden');
		}
		if (file.type==="folder") {
			renderVisibleState(file.children);
		}
	}

}

function recursiveFolderBuilder(parent, folderTree) {

	for (let i=0; i<folderTree.length; i++) {
		//debugger;
		var file = folderTree[i];
		if (file.type === "folder") {
			var newFolder = document.createElement('li');
			newFolder.classList.add('clamz-extension-folder');
			newFolder.setAttribute('title',file.fullpath);
			//newFolder.onclick = folderClicked;

			var folderImage = document.createElement('img');
			// https://feathericons.com/
			folderImage.src = chrome.extension.getURL("images/folder.svg");
			folderImage.classList.add('clamz-extension-folder-img');
			folderImage.height = "13";
			folderImage.width = "18";
			newFolder.appendChild(folderImage);

			var folderLabel = document.createElement('span');
			folderLabel.innerText = file.name
			folderLabel.classList.add('clamz-extension-folder-label');
			folderLabel.onclick = folderClicked;
			newFolder.appendChild(folderLabel);

			parent.appendChild(newFolder);
			recursiveFolderBuilder(newFolder,file.children);
		} else {
			var listItem = document.querySelector('[title="' + file.fullpath + '"]');
			if (listItem != null) {
				parent.appendChild(listItem);

			}
		}
	}
}

function cleanUp() {
	observer.disconnect();
	let allFiles = document.querySelectorAll('li.file');
	for (let i=0;i<allFiles.length;i++) {
		filetreeUl.append(allFiles[i]);
		allFiles[i].classList.remove('hidden');
		// clean up hidden folder paths
		let thisFilePath = allFiles[i].querySelector('.folder-path');
		if (thisFilePath) {
			thisFilePath.classList.remove('hidden');
		}
	}
	let allFolders = document.querySelectorAll('.clamz-extension-folder');
	for (let i=0;i<allFolders.length;i++) {
		allFolders[i].parentNode.removeChild(allFolders[i]);
	}
	observer.observe(filetreeUl, config);
}


chrome.storage.onChanged.addListener(function(changes, areaName) {
	if ('settings' in changes) {
		settings = changes.settings.newValue;
		cleanUp();
		fT.folderTree = [];
		fT.flatList = [];
		updateEverything();
	}
});
