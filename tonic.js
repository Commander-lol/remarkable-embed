const Remarkable = require('remarkable');
const RST = require('remarkably-simple-tags');

const md = new Remarkable('full', {
  codepen: {
    defaultTab: 'result',
    height: 256,
    themeId: '0'
  }
});

const rst = new RST.Plugin();

rst.register(RST.extensions);

md.use(rst.hook);

console.log(md.render(`
### This is remarkably-simple-tags

Haha, this is a super cool video: {@youtube: dQw4w9WgXcQ}

And I guess this is a nice codepen too:

{@codepen: bZzvWQ}
`))
