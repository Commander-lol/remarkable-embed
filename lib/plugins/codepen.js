module.exports = function (code, opts) {
	var themeId = opts.codepen.themeId;
	var height = opts.codepen.height;
	var defaultTab = opts.codepen.defaultTab;

	return "<iframe " +
		"height='"+height+"' " +
		"scrolling='no' " +
		"src='//codepen.io/Commander-lol/embed/preview/" + code + "/?height="+height+"&theme-id="+themeId+"&default-tab="+defaultTab+"&embed-version=2' " +
		"frameborder='no' " +
		"allowtransparency='true' " +
		"allowfullscreen='true' " +
		"style='width: 100%;'>" +
		"See the Pen" +
		"<a href='http://codepen.io/Commander-lol/pen/" + code + "/'>" +
		"" + code + "" +
		"</a>" +
		"by Louis Capitanchik (<a href='http://codepen.io/Commander-lol'>@Commander-lol</a>)" +
		"on <a href='http://codepen.io'>CodePen</a></iframe>"
}