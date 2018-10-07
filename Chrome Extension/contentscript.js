
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


	//loadAllFiles();

	sleep(100).then(() => {
		render();
	});
}

// function loadAllFiles() {
// 	let fileLis = Array.from(filetreeUl.querySelectorAll(".file"));
//
// 	for (i=0;i<fileLis.length;i++) {
// 		fT.addFileFromNode(fileLis[i]);
// 	}
// }

function projectChanged(mutationsList, observer) {
	console.log("project changed!!!!!!!!!!!!!!!!!!!!!");
	console.log(mutationsList);

	for (let i=0;i<mutationsList.length;i++) {
		if (mutationsList[i].addedNodes.length>0) {
			loadAllFiles();
		}
		if (mutationsList[i].removedNodes.length>0) {
			cleanUp();
			fT.folderTree = [];
		}
	}

	//cleanUp():
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
			folderImage.src = chrome.extension.getURL("folder.svg");
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
	}
	let allFolders = document.querySelectorAll('.clamz-extension-folder');
	for (let i=0;i<allFolders.length;i++) {
		allFolders[i].parentNode.removeChild(allFolders[i]);
	}
	observer.observe(filetreeUl, config);
}


// sleep time expects milliseconds
function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
