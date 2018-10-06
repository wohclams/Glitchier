

// see if mutation oberserver can be set to exlude our actions
// save open/closed state to localstorage - but then what do we do if it is out of sync when we reload?
// fix pathHiddenStateList, probably by checking as we initially build the list, what it's current state is and setting to match pathHiddenState
// also pathHiddenStateList doesn't even need files in it... remove those, only store folders

var filetreeUl = document.querySelector(".filetree");

var config = { childList: true };
var observer = new MutationObserver(fileListChanged);

observer.observe(filetreeUl, config);

var pathHiddenStateList;

var filesSection = document.querySelector('section .files');
filesSection.addEventListener('click',renderVisibleState);


function fileListChanged(mutationsList, observer) {
	console.log(mutationsList);

	for (let mutation of mutationsList) {
		let addedNodes = mutation.addedNotes;
		for (let addedNode in addedNodes) {
			if (addedNode.classList.contains('clamz-extension-folder')) {
				console.log("It's one of ours!");
			}
		}
	}

	let fileLis = Array.from(filetreeUl.querySelectorAll(".file"));

	let filePaths = []
	for (i=0;i<fileLis.length;i++) {
		filePaths.push(fileLis[i].title)
	}

	let result = fileTreeify(filePaths);
	let fileTree = result.fileTree;
	//pathHiddenStateList = result.pathHiddenStateList;
	pathHiddenStateList = reconcilePathLists(pathHiddenStateList, result.pathHiddenStateList);

	// TODO i think it works but it breaks when we add new file because the folder containing
	// the new file expands but we don't track that state... we need to be aware of that state....


	//console.log(fileTree);
	//console.log(pathHiddenStateList);

	// not sure why... must have to wait for them to be there?
	sleep(100).then(() => {
		render(fileTree);
	});

}


function reconcilePathLists(oldPathList, newPathList) {
	if (typeof oldPathList !== 'undefined') {
		let oldKeys = Object.keys(oldPathList);
		let newKeys = Object.keys(newPathList);

		// take anything in the old one and in the new one and copy status over
		for (let key in oldPathList) {
			if (key in newPathList) {
				newPathList[key] = oldPathList[key];
			}
		}
	}
	return newPathList;
}

function render(fileTree) {

	observer.disconnect();

	let list = document.querySelector('.filetree');

	//console.log(fileTree);
	recursiveFolderBuilder(list,fileTree);

	var sidebar = document.querySelector('#sidebar');
	sidebar.style.width = "370px";

	// var sidebarFiles = document.querySelector('#sidebar-files');
	// sidebarFiles.style.overflowX = "auto";

	observer.observe(filetreeUl, config);

}

function folderClicked(event) {
	event.preventDefault();
	event.stopPropagation();
	toggleFolder(event.target.parentElement);
}

function toggleFolder(target) {

	let pathHiddenState = pathHiddenStateList[target.title];
	pathHiddenStateList[target.title] = !pathHiddenState;

	renderVisibleState();

}

function renderVisibleState() {

	for (let path in pathHiddenStateList) {
		let  pathHiddenState = pathHiddenStateList[path];

		let folderElement = document.querySelector('[title="' + path + '"]');
		if (folderElement===null) {
			continue;
		}

		var cN = folderElement.querySelectorAll('li');

			for (let i=0;i<cN.length;i++) {
				let node = cN[i];
				if (pathHiddenState) {
					node.classList.add('hidden');
				} else {
					node.classList.remove('hidden');
				}
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

function fileTreeify(filePaths) {
	var fileTree = [];
	var pathHiddenStateList = {};

	function parse(fileItem, fullPath, reversePath, fT) {
		var filePath = fileItem.split('/');
		if (filePath.length===1) { // is a file, we're done
			fT.push({type:"file", fullpath: fullPath, name:filePath[0]});
			pathHiddenStateList[fullPath] = false;
		} else {
			var folder;

			for(let i = 0; i < fT.length; i++) {
				if (fT[i].name == filePath[0]) {
					folder = fT[i]
					break;
				}
			}

			let newReversePath = reversePath + filePath[0] + "/";

			if (typeof folder === "undefined") {
				folder = {type:"folder", name:filePath[0], fullpath: newReversePath, children:[]};
				fT.push(folder);
				pathHiddenStateList[newReversePath] = false;


				// if (folderDom != null) {
				// 	console.log("We are here!");
				// 	let li = folderDom.querySelector('li');
				// 	pathHiddenStateList[newReversePath] = li.classList.contains('hidden');
				// }
			}


			fileItem = fileItem.substr(fileItem.indexOf("/") + 1);
			parse(fileItem, fullPath, newReversePath, folder.children)
		}
	}

	for (let i=0;i<filePaths.length;i++) {
		parse(filePaths[i],filePaths[i],"",fileTree);
	}

	return {fileTree: fileTree, pathHiddenStateList: pathHiddenStateList};
}



// sleep time expects milliseconds
function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
