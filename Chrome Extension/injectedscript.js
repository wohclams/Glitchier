document.addEventListener('GlitchierCustomEvent', function (e) {
	var settings = e.detail;
	if (settings.modifyTabs) {
		console.log("Modifying tab settings!!!");
		var codemirrordiv = document.querySelector('.CodeMirror');

		codemirrordiv.CodeMirror.options.indentWithTabs = !settings.tabsAreSpaces;
		codemirrordiv.CodeMirror.options.tabSize = Number(settings.tabSpaceCount);
		codemirrordiv.CodeMirror.options.indentUnit = Number(settings.tabSpaceCount);
		console.log(codemirrordiv.CodeMirror.options);
	}
});
