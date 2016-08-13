module.exports = {
	Plugin: require('./lib/Plugin'),
	extensions: {
		youtube: require('./lib/plugins/youtube'),
		codepen: require('./lib/plugins/codepen'),
	},
}