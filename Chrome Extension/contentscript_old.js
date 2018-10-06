var filetreeUl = document.querySelector(".filetree");
var config = { childList: true };
var observer = new MutationObserver(updateFileTree);

observer.observe(filetreeUl, config);

var fileTree;

function updateFileTree() {
	//var fileLis = Array.from(filetreeUl.getElementsByClassName("file")); // must be array to use map
	var fileLis = filetreeUl.getElementsByClassName("file"); // must be array to use map
	 // switch to querySelectorAll
	// var filepaths = fileLis.map(function(li){
	// 	return li.title;
	// });

	var fileItems = []
	for (i=0;i<fileLis.length;i++) {
		fileItems.push({filePath: fileLis[i].title, fileItem: fileLis[i]})
	}

	fileTree = fileTreeify(fileItems);

	console.log(fileTree);

	render();
}

function render() {
	//observer.disconnect();

	// var parent = filetreeUl.parentNode;
	// var fancyUl = document.getElementById("glitch-folderview-extension-list");
	// if (fancyUl === null) {
	// 	//fancyUl = document.createElement("ul");
	// 	fancyUl = $(filetreeUl).clone(true, true);
	// 	//fancyUl.setAttribute("id", "glitch-folderview-extension-list");
	// 	fancyUl.attr("id", "glitch-folderview-extension-list");
	// 	//fancyUl.className = filetreeUl.className;
	// 	fancyUl.addClass(filetreeUl.className);
	//
	// 	//filetreeUl.className += " hidden";
	//
	// 	$(parent).append(fancyUl);
	// }
	//
	// while (fancyUl.firstChild) {
	// 	fancyUl.removeChild(fancyUl.firstChild);
	// }
	//
	// for (var key in fileTree) {
	// 	//console.log("obj." + key + " = " + fileTree[key]);
	//
	//
	//
	// 	var fUl = $( fancyUl );
	//
	// 	if (fileTree[key] instanceof HTMLLIElement) {
	// 		//fancyUl.appendChild(testing.clone(true));
	// 		var testing =  $( fileTree[key] );
	// 		var finalListItem = testing.clone(true, true);
	// 		finalListItem.addClass("logic");
	// 		fUl.append(finalListItem);
	// 	}
	//
	// }

	for (var key in fileTree) {

		if (fileTree[key] instanceof HTMLLIElement) {
			console.log(fileTree[key]);
			fileTree[key].className += " hidden";
		}
	}


	//observer.observe(filetreeUl, config);
}


function fileTreeify(fileItems) {
	var fileTree = {};

	function parse(fileItem, fT) {
		//console.log(fileItem.filePath);
		var filePath = fileItem.filePath.split('/');
		if (filePath.length===1) { // is a file, we're done
			fT[filePath[0]] = fileItem.fileItem;
		} else {
			if (!(filePath[0] in fT)) {
				fT[filePath[0]] = {};
			}
			fileItem.filePath = fileItem.filePath.substr(fileItem.filePath.indexOf("/") + 1);
			parse(fileItem,fT[filePath[0]])
		}
	}

	for (i=0;i<fileItems.length;i++) {
		parse(fileItems[i],fileTree);
	}

	return fileTree;
}


// https://joelgriffith.net/array-reduce-is-pretty-neat/
