const test = require('ava');
const Remarkable = require('remarkable');

const Plugin = require('./Plugin');

test.beforeEach((t) => {
  t.context.plugin = new Plugin();
  t.context.calls = 0;
  t.context.opts = [];

  t.context.plugin.register('test', (parameters, opts) => {
    t.context.calls++;
    t.context.opts.push(opts);
    return 'TEST(' + parameters.join(',') + ')';
  });

  t.context.md = new Remarkable();
});

test('parse() set pos to character after end of tag and returns true', (t) => {
  const state = [];
  state.src = '{@test: hello}test';
  state.pos = 0;

  const result = t.context.plugin.parse(state);

  t.is(state.src.indexOf('}') + 1, state.pos, 'did not set the pos to the character after the tag');
  t.is(true, result, 'did not return true');
  t.is(1, state.length, 'One tag did not get added to the state');
});

test('parse() does not change the position and returns false if it is not a tag', (t) => {
  const state = [];
  state.src = 'this is {a test';
  state.pos = state.src.indexOf('{');

  const result = t.context.plugin.parse(state);

  t.is(state.pos, state.src.indexOf('{'), 'pos has been changed');
  t.is(false, result, 'did not return true');
});

test('parse() handles tags inside tags', (t) => {
  const state = [];
  state.src = '{@test: {@test: hello}}';
  state.pos = 0;

  t.context.plugin.parse(state);

  t.deepEqual(['test', ['', ['test', 'hello'], '']], state[0].content);
});

test('parse() handles tags next to tags inside tags', (t) => {
  const state = [];
  state.src = '{@test: {@test: hello}frog{@test: second}fin end}';
  state.pos = 0;

  t.context.plugin.parse(state);

  t.deepEqual(['test', ['', ['test', 'hello'], 'frog', ['test', 'second'], 'fin'], 'end'], state[0].content);
});

test('parse() handles parameterless tags', (t) => {
  const state = [];
  state.src = '{@test}frog';
  state.pos = 0;

  t.context.plugin.parse(state);

  t.is(7, state.pos, 'did not move state position');
  t.deepEqual(['test'], state[0].content);
});

test('parse() handles escaped quotes a curly braces', (t) => {
  const state = [];
  state.src = '{@test: ok\\{ok ok\\"ok "ok\\"ok\\}"}';
  state.pos = 0;

  t.context.plugin.parse(state);

  t.deepEqual(['test', 'ok{ok', 'ok"ok', 'ok"ok}'], state[0].content);
});

test('parse() handles ignores treats mulitple spaces as a single space between parameters', (t) => {
  const state = [];
  state.src = '{@test: to  this    end}';
  state.pos = 0;

  t.context.plugin.parse(state);

  t.deepEqual(['test', 'to', 'this', 'end'], state[0].content);
});

test('render() calls the correct plugin', (t) => {
  const tokens = [
    {
      type: 'rst',
      level: 1,
      content: [ 'test', 'ok' ]
    }
  ];

  const opts = {};

  const result = t.context.plugin.render(tokens, 0, opts);

  t.is(1, t.context.calls, 'plugin was not called once');
  t.is('TEST(ok)', result, 'rendered string was not as it should be');
  t.is(opts, t.context.opts[0], 'opts was not passed to the plugin');
});

test('render() calls the plugin with an empty array if no parameters', (t) => {
  const tokens = [
    {
      type: 'rst',
      level: 1,
      content: [ 'test' ]
    }
  ];

  const opts = {};

  const result = t.context.plugin.render(tokens, 0, opts);

  t.is(1, t.context.calls, 'plugin was not called once');
  t.is('TEST()', result, 'rendered string was not as it should be');
  t.is(opts, t.context.opts[0], 'opts was not passed to the plugin');
});

test('render() returns the tag if a plugin for the tag does not exist', (t) => {
  const tokens = [
    {
      type: 'rst',
      level: 1,
      content: [ 'blah', 'ok' ]
    }
  ];

  const opts = {};

  const result = t.context.plugin.render(tokens, 0, opts);

  t.is('{@blah: ok}', result, 'rendered string was not as it should be');
});

test('render() calls the plugins in plugins', (t) => {
  const tokens = [
    {
      type: 'rst',
      level: 1,
      content: [ 'test', ['frog', ['test', 'awesome'], 'end'], 'ok' ]
    }
  ];

  const opts = {};

  const result = t.context.plugin.render(tokens, 0, opts);

  t.is(2, t.context.calls, 'plugin was not called once');
  t.is('TEST(frogTEST(awesome)end,ok)', result, 'rendered string was not as it should be');
  t.is(opts, t.context.opts[0], 'opts was not passed to the plugin');
});

test('RST works for old slug plugins when given single option', (t) => {
  let calls = 0;
  const state = [];
  state.src = '{@slug: aslug}';
  state.pos = 0;
  const opts = {};
  let givenOpts;

  t.context.plugin.register('slug', (slug, opts) => {
    calls++;
    givenOpts = opts;
    return 'SLUG(' + slug + ')';
  }, true);

  t.context.plugin.parse(state);

  t.is(1, state.length, 'One tag did not get added to the state');

  const result = t.context.plugin.render(state, 0, opts);

  t.is(1, calls, 'The plugin function was not called');
  t.is(opts, givenOpts, 'The opts were not passed to the plugin');
  t.is('SLUG(aslug)', result, 'Rendered result was not as expected');
});

test('RST works for new parameter plugins', (t) => {
  const state = [];
  state.src = '{@test: this is cool}';
  state.pos = 0;
  const opts = {};

  t.context.plugin.parse(state);

  t.is(1, state.length, 'One tag did not get added to the state');

  const result = t.context.plugin.render(state, 0, opts);

  t.is(1, t.context.calls, 'The plugin function was not called');
  t.is(opts, t.context.opts[0], 'The opts were not passed to the plugin');
  t.is('TEST(this,is,cool)', result, 'Rendered result was not as expected');
});

test ('RST can be used with Remarkable', (t) => {
  t.context.md.use(t.context.plugin.hook);
  t.pass();
});

test('RST works with Remarkable', (t) => {
  t.context.md.use(t.context.plugin.hook);

  const result = t.context.md.render('string{@test}{@test:hello {@test: help  me} "enter\\"tain you"}end');

  t.is('<p>stringTEST()TEST(hello,TEST(help,me),enter"tain you)end</p>\n', result);
});
