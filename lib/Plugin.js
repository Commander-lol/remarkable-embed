var util  = require('util')

function Plugin() {
	var self = function (md) {
		self.init(md)
	}

	self.__proto__ = Plugin.prototype
	self.test = /{@(\w+)\s*:\s*([\S]+?)}/
	self.plugins = {}
	self.id = 'at-embed'

	return self
}

util.inherits(Plugin, Function)

Plugin.prototype.init = function (md) {
	md.inline.ruler.push(this.id, this.parse.bind(this))
	md.renderer.rules[this.id] = this.render.bind(this)
}

Plugin.prototype.parse = function (state, silent) {
	var match = this.regexp.exec(state.src.slice(state.pos))
	if (!match) return false

	// valid match found, now we need to advance cursor
	state.pos += match[0].length

	if (silent) return true

	var token = state.push(this.id, '', 0)
	token.meta = { plugin: match[1], meta: match[2], match: match }

	return true
}

Plugin.prototype.render = function (tokens, id) {
	var token = tokens[id]
	var plugin = token.meta.plugin
	var meta = token.meta.meta

	if (!this.plugins.hasOwnProperty(plugin)) {
		return meta
	}
	return this.plugins[plugin](meta)
}

module.exports = Plugin
