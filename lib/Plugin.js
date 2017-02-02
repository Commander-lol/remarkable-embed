function Plugin() {
	this.id = 'at-embed';
	this.reg = /{@(\w+)\s*:\s*([\S]+?)}/;
	this.plugins = {};
	this.hook = (function (self) {
		self.inline.ruler.push(this.id, this.parse.bind(this));
		self.renderer.rules[this.id] = this.render.bind(this);
	}).bind(this)
	return this;
}

Plugin.prototype.register = function (name, plugin) {
	if (typeof(name) === 'string') {
		this.plugins[name] = plugin;
	} else {
		// Name is actually an object of {name: plugin} pairs
		Object.assign(this.plugins, name);
	}
}

Plugin.prototype.parse = function (state) {
	if (state.src.charCodeAt(state.pos) !== 123) {
        	return false
    	}

	var match = this.reg.exec(state.src.slice(state.pos))
	if (!match) return false

	// valid match found, now we need to advance cursor
	state.pos += match[0].length

	var token = {
		type: this.id,
		level: state.level,
		content: {
			plugin: match[1],
			meta: match[2],
			match: match
		},
	};

	state.push(token);
	return true;
}

Plugin.prototype.render = function (tokens, idx, opts) {
	var token = tokens[idx]
	var plugin = token.content.plugin
	var meta = token.content.meta

	if (!this.plugins.hasOwnProperty(plugin)) {
		return meta
	}
	return this.plugins[plugin](meta, opts)
}

module.exports = Plugin;
