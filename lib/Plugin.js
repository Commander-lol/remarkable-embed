function Plugin() {
  this.id = 'at-embed';
  this.reg = /({@(\w+)(\s*:\s*)?)([^}]+?)}/;
  this.plugins = {};
  this.hook = (function (self) {
    self.inline.ruler.push(this.id, this.parse.bind(this));
    self.renderer.rules[this.id] = this.render.bind(this);
  }).bind(this)
  return this;
}

Plugin.prototype.register = function (name, plugin, single) {
  if (typeof(name) === 'string') {
    this.plugins[name] = plugin;
    if (single) {
      this.plugins[name].single = true;
    }
  } else {
    if (single) {
      Object.keys(name).forEach(function (key) {
        name[key].single = true;
      });
    }

    // Name is actually an object of {name: plugin} pairs
    Object.assign(this.plugins, name);
  }
}

Plugin.prototype.extractTags = function (state) {
  var match = this.reg.exec(state.src.slice(state.pos))
  if (!match) return false;

  var parameters = [match[2]];
  var quote = false;
  var tagContainer = null;
  var parameter = '';
  var tag;

  state.pos += match[1].length;

  // Parse parameters
  while(state.pos < state.src.length) {
    switch (state.src[state.pos]) {
      case '\\': // Skip escaped character
        parameter += state.src[state.pos+1];
        state.pos += 2;
      case '{':
        tag = this.extractTags(state);

        if (!tag) {
          parameter += '{';
          state.pos++;
          break;
        } else {
          if (tagContainer) {
            tagContainer.push(parameter, tag);
          } else {
            tagContainer = [
              parameter,
              tag
            ];
          }
          parameter = '';
        }
        break;
      case '}': // Finish tag
        if (tagContainer) {
          tagContainer.push(parameter);
          parameters.push(tagContainer);
        } else {
          parameters.push(parameter);
        }
        state.pos++;
        return parameters;
      case '"':
        quote = !quote;
        state.pos++
        break;
      case ' ':
        if (!quote) {
          if (tagContainer) {
            tagContainer.push(parameter);
            parameters.push(tagContainer);
            tagContainer = null;
          } else {
            parameters.push(parameter);
          }
          parameter = '';
          state.pos++;
          break;
        }
      default:
        parameter += state.src[state.pos];
        state.pos++;
    }
  }

  parameters.push(parameter);
  return parameters;
}



Plugin.prototype.parse = function (state) {
  if (state.src.charCodeAt(state.pos) !== 123) {
    return false
  }

  var parts = this.extractTags(state);

  if (!parts) {
    return false;
  }

  var token = {
    type: this.id,
    level: state.level,
    content: parts,
  };

  state.push(token);
  return true;
}

Plugin.prototype.renderTags = function (parts, opts) {
  var tag = parts.shift();

  // Check for tags inside base tag
  parts = parts.map((part) => {
    if (Array.isArray(part)) {
      var pre = part.shift();
      var post = part.pop();

      part = part.map((subPart) => {
        if (Array.isArray(subPart)) {
          return this.renderTags(subPart, opts);
        }

        return subPart;
      });

      return pre + part.join('') + post;
    }

    return part;
  });

  if (!this.plugins.hasOwnProperty(tag)) {
    return '{@' + tag + ': ' + parts.join(' ') + '}';
  }

  if (this.plugins[tag].single) {
    return this.plugins[tag](parts[0], opts);
  }

  return this.plugins[tag](parts, opts);
}

Plugin.prototype.render = function (tokens, idx, opts) {
  var token = tokens[idx];

  return this.renderTags(token.content, opts);
}

module.exports = Plugin;
