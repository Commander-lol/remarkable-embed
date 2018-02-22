const test = require('ava');

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
});

test('parse() set pos to character after end of tag and returns true', (t) => {
  const state = [];
  state.src = '{@test: hello}test';
  state.pos = 0;

  const result = t.context.plugin.parse(state);

  t.is(state.src.indexOf('}') + 1, state.pos, 'did not set the pos to the character after the tag');
  t.is(true, result, 'did not return true');
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
