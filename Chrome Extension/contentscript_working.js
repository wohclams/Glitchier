// see if mutation oberserver can be set to exlude our actions
// add file icon and nice background to folders
// save open/closed state to localstorage - but then what do we do if it is out of sync when we reload?

var filetreeUl = document.querySelector(".filetree");
var config = { childList: true };
var observer = new MutationObserver(updateFileTree);

observer.observe(filetreeUl, config);

var fileTree;

function updateFileTree() {
	var fileLis = Array.from(filetreeUl.querySelectorAll(".file"));


	var filePaths = []
	for (i=0;i<fileLis.length;i++) {
		filePaths.push(fileLis[i].title)
	}

	fileTree = fileTreeify(filePaths);

	console.log(fileTree);

	// not sure why... must have to wait for them to be there?
	sleep(100).then(() => {
		render();
	});

}

function render() {

	observer.disconnect();

	var list = document.querySelector('.filetree');

	console.log(fileTree);
	recursiveFolderBuilder(list,fileTree);

	var sidebar = document.querySelector('#sidebar');
	sidebar.style.width = "370px";

	// var sidebarFiles = document.querySelector('#sidebar-files');
	// sidebarFiles.style.overflowX = "auto";

	observer.observe(filetreeUl, config);

}

function folderClicked(event) {
	console.log("folderClicked");
	event.preventDefault();
	event.stopPropagation();
	hideFolder(event.target.parentElement);
}

function hideFolder(target) {
	var cN = target.querySelectorAll('li');

	for (i=0;i<cN.length;i++) {
		var node = cN[i];
		node.classList.toggle('hidden');
	}
}

function recursiveFolderBuilder(parent, fT) {
	for (var key in fT) {
		if ((typeof fT[key]) === 'object') {

			// console.log(fT[key]);
			// var listItem = document.querySelector('[title="' + fileTree[key] + '"]')
			// if (listItem != null) {
			// 	console.log(listItem);
			// 	listItem.className += " hidden";
			// }
			var newFolder = document.createElement('li');
			//newFolder.innerText = key;
			var folderLabel = document.createElement('span');
			folderLabel.innerText = key
			folderLabel.classList.add('clamz-extension-folder-label');
			folderLabel.onclick = folderClicked;
			newFolder.appendChild(folderLabel);
			newFolder.classList.add('clamz-extension-folder');
			//newFolder.onclick = folderClicked;
			parent.appendChild(newFolder);
			recursiveFolderBuilder(newFolder,fT[key]);
		} else {
			var listItem = document.querySelector('[title="' + fT[key] + '"]')
			if (listItem != null) {
				// console.log(listItem);
				parent.appendChild(listItem);
			}
		}
	}
}

// sleep time expects milliseconds
function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function fileTreeify(filePaths) {
	var fileTree = {};

	function parse(fileItem, fullPath, fT) {
		//console.log(fileItem.filePath);
		var filePath = fileItem.split('/');
		if (filePath.length===1) { // is a file, we're done
			fT[filePath[0]] = fullPath;
		} else {
			if (!(filePath[0] in fT)) {
				fT[filePath[0]] = {};
			}
			fileItem = fileItem.substr(fileItem.indexOf("/") + 1);
			parse(fileItem,fullPath,fT[filePath[0]])
		}
	}

	for (i=0;i<filePaths.length;i++) {
		parse(filePaths[i],filePaths[i],fileTree);
	}

	return fileTree;
}
