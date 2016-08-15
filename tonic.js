const Remarkable = require('remarkable');
const reEmbed = require('remarkable-embed');

const md = new Remarkable('full', {
	codepen: {
		defaultTab: 'result',
		height: 256,
		themeId: '0'
	}
});

const embed = new reEmbed.Plugin;

embed.register(reEmbed.extensions);

md.use(embed.hook);

console.log(md.render(`
### This is remarkable embed

Haha, this is a super cool video: {@youtube: dQw4w9WgXcQ}

And I guess this is a nice codepen too:

{@codepen: bZzvWQ}
`))