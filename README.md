# remarkable-embed

Provides the `{@plugin: slug}` syntax to remarkable, allowing you to embed rich content in your documents as defined
by any given plugins.

See '[remarkable-embed tonic](https://tonicdev.com/npm/remarkable-embed)' to try it in your browser

By default `remarkable-embed` comes with two plugins: One for [youtube](https://youtube.com) videos and one for [codepen.io](https://codepen.io) pens.

Creating new plugins is also super simple - The Youtube plugin showcases a straight forward embed and the Codepen plugin showcases usage of the `remarkable` options object

## Installation
`npm install --save remarkable-embed`

## Usage - Code

_This module is not built with transpiled/es6, but the examples are simpler with such_

```javascript
import Remarkable from 'remarkable';
import { Plugin as Embed, extensions } from 'remarkable-embed';

const md = new Remarkable()

const embed = new Embed()
embed.register('youtube', extensions.youtube)

md.use(embed.hook)
md.render('This vid is gr8 m8 {@youtube: dQw4w9WgXcQ}')

// Output: '<p>This vid is gr8 m8 </p><iframe type="text/html" src="https://www.youtube.com/embed/dQw4w9WgXcQ" frameborder="0"></iframe>'
```

Plugins can also be registered by passing an object to `Embed#register()`, in which case they will all
be registered by the key in the object.

```javascript
embed.register({
  youtube: extensions.youtube
})
```

The `extensions` object provided alongside `remarkable-embed` can also be passed directly to register to use
all of the built in extensions.

```javascript
embed.register(extensions)
```

## Usage - Markdown
Plugins extend the markdown syntax by adding constructs of the form `{@[name]: [meta]}`, where `[name]` 
is the name used to register the plugin with `remarkable-embed` and `[meta]` is the information that will
be passed to the plugin. The example youtube extension takes either the full embed link or the video id.

## Extensions - Built in

### Youtube
- meta:
 - Video code (e.g. `dQw4w9WgXcQ`)
 - Full embed link (e.g. `https://www.youtube.com/embed/wsQGwDy1lvg`)

## Extensions - Creating
A `remarkable-embed` plugin is a simple function with the signature `plugin(meta[, opts])` where `meta` is the arbitrary
string that doesn't contains whitespace captured by the markdown tag, and options is the options object that was passed to the `Remarkable` parser when it was created
