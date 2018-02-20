# remarkably-simple-tags

Provides the `{@plugin: parameters}` syntax to remarkable, allowing you to
easily create your own tags including tags to embed rich content in your
documents as defined by any given plugins.

Forked from
[remarkable-embeded](https://github.com/Commander-lol/remarkable-embed).
Credits to [Commander-lol](https://github.com/Commander-lol) for most
of the code

Try in your browser with
[tonic](https://tonicdev.com/npm/remarkably-simple-tags)

By default `remarkably-simple-tags` comes with two plugins: One for
[youtube](https://youtube.com) videos and one for
[codepen.io](https://codepen.io) pens.

Creating new plugins is also super simple - The Youtube plugin showcases a
straight forward embed and the Codepen plugin showcases usage of the
`remarkable` options object

## Installation
`npm install --save remarkably-simple-tags`

## Usage - Code

_This module is not built with transpiled/es6, but the examples are simpler with such_

```javascript
import Remarkable from 'remarkable';
import { Plugin as RST, extensions } from 'remarkably-simple-tags';

const md = new Remarkable()

const rst = new RST()
rst.register('youtube', extensions.youtube)

md.use(rst.hook)
md.render('This vid is gr8 m8 {@youtube: dQw4w9WgXcQ}')

// Output: '<p>This vid is gr8 m8 </p><iframe type="text/html" src="https://www.youtube.com/embed/dQw4w9WgXcQ" frameborder="0"></iframe>'
```

Plugins can also be registered by passing an object to `Embed#register()`,
in which case they will all be registered by the key in the object.

```javascript
rst.register({
  youtube: extensions.youtube
})
```

The `extensions` object provided alongside `remarkably-simple-tags` can also
be passed directly to register to use all of the built in extensions.

```javascript
rst.register(extensions)
```

## Usage - Markdown
Plugins extend the markdown syntax by adding constructs of the form
`{[name: parameter[ parameters...]}`, where `name` is the name used to
register the plugin with `remarkably-simple-tags` and `parameter(s)` is the
space-separated information that will be passed to the plugin. Parameters can
be quoteed to include spaces and quotes and curly braces should be escaped
with \\. The example youtube extension takes either the full embed link or
the video id.

## Extensions - Built in

### Youtube
- meta:
 - Video code (e.g. `dQw4w9WgXcQ`)
 - Full embed link (e.g. `https://www.youtube.com/embed/wsQGwDy1lvg`)

## Extensions - Creating
A `remarkable-embed` plugin is a simple function with the signature
`plugin(parameters[, opts])` where `parameters` is and array of the parameters
separated by whitespace captured by the markdown tag, and options is the
options object that was passed to the `Remarkable` parser when it was created.

If your plugin is built for remarkable-embed, pass `true` as the third
parameter when registering the plugin.
```javascript
const myplugin = (slug, opts) => {
  return 'Something cool: ' + slug;
};

rst.register('mytag', myplugin, true);
```
