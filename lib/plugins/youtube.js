module.exports = function(code) {
	if (code.startsWith('https://')) {
		return '<iframe type="text/html" src="' + code + '" frameborder="0"></iframe>'

	}
	return '<iframe type="text/html" src="https://www.youtube.com/embed/' + code + '" frameborder="0"></iframe>'
}