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
function context() {
  const ctx = vm.createContext({ console, document: {
    getElementById(id) { if (!nodes.has(id)) nodes.set(id, new Element()); return nodes.get(id); },
    createElement() { return new Element(); }
  }, localStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) }, confirm: () => true });
  for (const file of ['player.js', 'events.js', 'engine.js', 'app.js']) vm.runInContext(fs.readFileSync(file, 'utf8'), ctx, { filename: file });
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
