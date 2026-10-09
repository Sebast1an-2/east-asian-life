// 无第三方依赖的逻辑测试；简易 DOM 用于验证按钮和存档流程。
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
class Element {
  constructor() { this.children = []; this.textContent = ''; }
  append(node) { this.children.push(node); }
  replaceChildren() { this.children = []; }
  setAttribute() {}
}
const nodes = new Map();
const storage = new Map();
function context(beforeApp = '', logger = console) {
  const ctx = vm.createContext({ console: logger, document: {
    getElementById(id) { if (!nodes.has(id)) nodes.set(id, new Element()); return nodes.get(id); },
    createElement() { return new Element(); }
  }, localStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) }, confirm: () => true });
  for (const file of ['player.js', 'events.js', 'engine.js', 'validation.js', 'app.js']) {
    if (file === 'app.js' && beforeApp) vm.runInContext(beforeApp, ctx);
    vm.runInContext(fs.readFileSync(file, 'utf8'), ctx, { filename: file });
  }
  return ctx;
}
let ctx = context();
function run(code) { return vm.runInContext(code, ctx); }
nodes.get('start').onclick();
assert.equal(run('state.player.age'), 0);
assert.equal(nodes.get('grow').disabled, true);
nodes.get('grow').onclick();
assert.equal(run('state.player.age'), 0);
// 待选事件在刷新后保留。
ctx = context();
assert.equal(run('state.currentEventId'), 'birth');
nodes.get('choices').children[0].onclick();
assert.equal(run('state.player.history.length'), 1);
ctx = context();
assert.equal(run('state.resolved'), true);
assert.equal(nodes.get('choices').children.length, 0);
const seen = new Set(['birth']);
while (run('state.player.alive')) {
  nodes.get('grow').onclick();
  const id = run('state.currentEventId');
  if (id) { seen.add(id); nodes.get('choices').children[0].onclick(); }
}
assert.equal(run('state.player.age'), 80);
assert.equal(seen.size, 8);
assert.equal(run('state.player.history.filter(h => h.eventId === "score95").length'), 1);
assert.equal(nodes.get('grow').disabled, true);
assert.match(nodes.get('description').textContent, /95/);
run(`{
  const p = createPlayer(); p.age = 9;
  const weekend = EVENTS.find(e => e.id === 'weekend');
  applyChoice(p, weekend, weekend.choices[0]);
  p.age = 11; if (eligible(weekend, p)) throw Error('cooldown failed');
  p.age = 12; if (!eligible(weekend, p)) throw Error('cooldown expiration failed');
  const effect = {effects: {health: -999, happiness: 999, stress: -999, money: -9999}, addTags: [], removeTags: [], historyText: 'test'};
  applyChoice(p, weekend, effect);
  if (p.health !== 0 || p.happiness !== 100 || p.stress !== 0 || p.money !== -9999 || p.alive) throw Error('bounds failed');
  const q = createPlayer(); q.age = 21;
  const home = EVENTS.find(e => e.id === 'home');
  if (eligible(home, q)) throw Error('causal prerequisite failed');
  q.tags.push('那5分的记忆'); q.history.push({eventId: 'score95'});
  if (!eligible(home, q)) throw Error('causal eligibility failed');
  const r = createPlayer(); r.age = 13;
  if (pickEvent(r).id !== 'interest') throw Error('milestone priority failed');
}`);
nodes.get('restart').onclick();
assert.equal(run('state.player.age'), 0);
assert.equal(run('state.player.history.length'), 0);
storage.set('east-asian-life-v01', '{broken');
ctx = context();
assert.equal(run('state'), null);
assert.match(nodes.get('save-status').textContent, /无法读取/);
console.log('PASS: 8 events, age 0–80, choices, bounds, cooldown, causal history, priority, save/load, restart and corrupt-save recovery.');

// 故意构造错误数据：不修改实际的 8 个事件。
assert.equal(run('checkEvents(EVENTS).errors.length'), 0);
assert.equal(run('checkEvents(EVENTS).warnings.length'), 0);
const badEvents = [
  ['e.id = EVENTS[1].id', 'id 重复'],
  ['e.choices[1].id = e.choices[0].id', 'choice id 重复'],
  ['e.choices[0].id = " "', '.id'],
  ['delete e.title', '.title'],
  ['delete e.choices[0].resultText', '.resultText'],
  ['e.weight = 0', '.weight'],
  ['e.weight = Infinity', '.weight'],
  ['e.weight = "2"', '.weight'],
  ['e.priority = NaN', '.priority'],
  ['e.priority = "high"', '.priority'],
  ['e.conditions.minAge = -1', '.minAge'],
  ['e.conditions.maxAge = 1.5', '.maxAge'],
  ['e.conditions = {minAge: 5, maxAge: 2}', 'minAge 不能'],
  ['e.choices[0].effects = {heath: 5}', '.effects'],
  ['e.choices[0].effects = {health: "5"}', '.effects'],
  ['e.choices[0].addTags = "标签"', '.addTags'],
  ['e.choices[0].removeTags = [null]', '.removeTags'],
  ['e.conditions.tagsAll = "标签"', '.tagsAll'],
  ['e.conditions.tagsNone = [1]', '.tagsNone'],
  ['e.conditions.requiredTags = ["标签"]', '请改用 tagsAll'],
  ['e.conditions.lifeStages = ["unknown"]', '.lifeStages'],
  ['e.conditions.historyEventIds = ["missing"]', '找不到事件'],
  ['e.conditions.stats = {health: {min: "low"}}', '.stats.health'],
  ['e.conditions.stats = {health: {min: 70, max: 30}}', 'min 不能'],
  ['e.conditions.stats = {typo: {min: 1}}', '未知属性名'],
  ['e.choices = []', '.choices'],
  ['e.cooldown = -1', '.cooldown'],
  ['e.repeatable = "false"', '.repeatable'],
  ['e.category = "typo"', '.category']
];
for (const [mutation, expected] of badEvents) {
  const report = run(`(() => { const e = JSON.parse(JSON.stringify(EVENTS[0])); ${mutation}; return checkEvents([e, ...EVENTS.slice(1)]); })()`);
  assert.ok(report.errors.some(message => message.includes(expected)), mutation);
}
assert.equal(run('checkEvents([null, 2, {}, {conditions: null, choices: [null]}]).errors.length > 0'), true);
assert.equal(run(`checkEvents([EVENTS[0], {...EVENTS[0], id: 'other_birth'}]).warnings.some(w => w.includes('birth') && w.includes('other_birth') && w.includes('0～0'))`), true);
assert.equal(run(`checkEvents([EVENTS[0], {...EVENTS[0], id: 'later_birth', conditions: {minAge: 1, maxAge: 1}}]).warnings.length`), 0);

// 按钮执行后的每一年存档都必须通过新检查，两组选项覆盖所有事件选择。
for (const choiceIndex of [0, 1]) {
  nodes.get('start').onclick();
  while (run('state.player.alive')) {
    assert.equal(run('validSave(state)'), true);
    if (nodes.get('choices').children.length) nodes.get('choices').children[choiceIndex].onclick();
    assert.equal(run('validSave(state)'), true);
    nodes.get('grow').onclick();
  }
  assert.equal(run('validSave(state)'), true);
  ctx = context();
  assert.equal(run('state.player.age'), 80);
}
nodes.get('restart').onclick();
nodes.get('choices').children[0].onclick();
const healthySave = storage.get('east-asian-life-v01');
const corruptions = [
  'data = null', 'data = []', 'data.version = 99', 'data.player = null',
  'data.player.money = "lots"', 'data.player.health = 101',
  'data.player.age = -1', 'data.player.age = 81', 'data.player.tags = [null]',
  'data.player.history = [null]', 'data.player.history[0].effects = {typo: 5}',
  'data.player.history[0].text = null', 'data.player.history[0].age = 10',
  'data.player.lifeStage = "unknown"', 'data.player.alive = "true"',
  'data.world.year = 1999', 'data.world.npcs = null',
  'data.currentEventId = "missing"', 'data.resolved = "true"',
  'data.result = null', 'data.player.history[0].choiceId = "missing"'
];
for (const mutation of corruptions) {
  const broken = run(`(() => { let data = ${healthySave}; ${mutation}; return JSON.stringify(data); })()`);
  storage.set('east-asian-life-v01', broken);
  ctx = context();
  assert.equal(run('state'), null, mutation);
  assert.match(nodes.get('save-status').textContent, /无法读取/);
  assert.equal(storage.get('east-asian-life-v01'), broken, '不要自动覆盖异常存档');
}
storage.set('east-asian-life-v01', healthySave);
ctx = context();
assert.equal(run('state.resolved'), true);
// 选择使健康归零时，终点存档同样可以恢复。
run('state.player.health = 0; state.player.alive = false; save();');
ctx = context();
assert.equal(run('state.player.alive'), false);

const reported = [];
ctx = context('EVENTS[0].weight = 0;', {error: x => reported.push(x), warn: x => reported.push(x)});
assert.equal(nodes.get('start').disabled, true);
assert.equal(nodes.get('data-diagnostics').hidden, false);
assert.match(nodes.get('data-diagnostics').textContent, /birth.*weight/);
nodes.get('start').onclick();
assert.equal(run('state'), null);
assert.ok(reported.length);
ctx = context(`EVENTS.push({...EVENTS[0], id: 'other_birth'});`, {error() {}, warn: x => reported.push(x)});
assert.equal(nodes.get('start').disabled, false);
assert.match(nodes.get('data-diagnostics').textContent, /可能冲突/);
console.log('PASS: invalid event fields, milestone conflicts, both choice paths, valid old saves, malformed-save recovery, preserved storage and visible startup diagnostics.');
