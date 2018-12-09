class FolderTree {
	constructor() {
		this.folderTree = [];
		this.flatList = [];
		this.projectId = "";
	}

	isGoodPath(path) {
		if (path==="" || path===".glitch-assets") {
			return false;
		} else {
			return true;
		}
	}

	addFileFromNode(node) {
		let filePath = node.title;
		if (this.isGoodPath(filePath)) {
			this.parsePath(filePath);
			this.flatList.push(filePath);
		}
	}

	addFileFromPath(path) {
		if (this.isGoodPath(path)) {
			this.parsePath(path);
			this.flatList.push(path);
		}
	}

	setVisibilityByPath(path, hidden) {
		let folder = this.findFileByPath(path);
		folder.hidden = hidden;
	}

	deleteFileByPath(path) {
		var index = this.flatList.indexOf(path);
		if (index > -1) {
			this.flatList.splice(index, 1);
		}

		let completePathParts = path.split('/');
		if (completePathParts.length===1) {
			// it's in the top level, delete here.
			for (let i=0; i<this.folderTree.length; i++) {
				let file = this.folderTree[i];
				if (file.name === completePathParts[0]) {
					this.folderTree.splice(i,1);
					return;
				}
			}
		} else {
			let fileName = path.substr(path.lastIndexOf("/")+1);
			let partialPath = path.substr(0,path.lastIndexOf("/")+1); //+1

			let node = this.findFileByPath(partialPath);
			for (let i=0;i<node.children.length;i++) {
				let file = node.children[i];

				if (file.name === fileName) {
					node.children.splice(i,1);
				}
			}
			/// need to remove any childless folders now...
			partialPath = partialPath.substr(0,partialPath.lastIndexOf("/")); // remove trailing slash
			// partialPath = partialPath.substr(0,partialPath.lastIndexOf("/"));
			// partialPath = partialPath.substr(0,partialPath.lastIndexOf("/")+1);

			let pathParts = partialPath.split('/');
			while (pathParts.length>0) {
				let tempPath = pathParts.join('/') + "/";
				let node = this.findFileByPath(tempPath);
				if (node.children.length===0) {
					console.log("GOTTA DELETE");
					// gotta delete this node...
					let tempParts = pathParts.slice();
					tempParts.pop();
					let tempParentPath = tempParts.join('/') + "/";
					if (tempParentPath !== "/") {
						let parentNode = this.findFileByPath(tempParentPath);
						console.log(parentNode);
						for (let i=0;i<parentNode.children.length;i++) {
							//console.log("node name: " + node.name + " parentNode.child.name: " + parentNode.children[i].name);
							if (parentNode.children[i].name === node.name) {
								parentNode.children.splice(i,1);
							}
						}
					} else { // is root
						for (let i=0; i<this.folderTree.length; i++) {
							if (this.folderTree[i].name === node.name) {
								this.folderTree.splice(i,1);
								return;
							}
						}
					}

				}
				//console.log(node);
				pathParts.pop();
			}
		}
	}

	deleteinFolder(pathParts, folderTree) {
		let pathPart = pathParts[0];
		for (let i=0; i<folderTree.length; i++) {
			let file = folderTree[i];
			if (file.name === pathPart) {
				if (file.type === "folder") {

				} else {

				}
			}
		}
	}

	findFileByPath(path) {

		if (path === "/") {
			return this.folderTree;
		}

		var stack = [], node, ii;
		stack = this.folderTree.slice();

		while (stack.length > 0) {
			node = stack.pop();
			if (node.fullpath == path) {
				return node;
			} else if (node.children && node.children.length) {
				for (ii = 0; ii < node.children.length; ii += 1) {
					stack.push(node.children[ii]);
				}
			}
		}
		return null;
	}


	parsePath(filePath) {
		this.parse(filePath, filePath, "", this.folderTree);
	}

	parse(currentFilePath, fullFilePath, reversePath, folderTree) {
		let pathParts = currentFilePath.split('/');
		if (pathParts.length===1) { // is a file, we're done
			folderTree.push({type:"file", fullpath: fullFilePath, name:pathParts[0], hidden: false});
		} else {
			let folder;

			for(let i = 0; i < folderTree.length; i++) {
				if (folderTree[i].name == pathParts[0]) {
					folder = folderTree[i]
					break;
				}
			}

			let newReversePath = reversePath + pathParts[0] + "/";

			if (typeof folder === "undefined") {
				folder = {type:"folder", name:pathParts[0], fullpath: newReversePath, children:[], hidden: false};
				folderTree.push(folder);
			} else {
				folder.hidden = false; // as we add a file, unhide everything so we can see the new file
				for (let i=0;i<folder.children.length;i++) {
					folder.children[i].hidden=false;
				}
			}

			let newFilePath = currentFilePath.substr(currentFilePath.indexOf("/") + 1);
			this.parse(newFilePath, fullFilePath, newReversePath, folder.children)
		}

	}

}
