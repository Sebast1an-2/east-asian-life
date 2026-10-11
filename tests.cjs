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
// 原有回归测试保持仅加载首批 8 个事件，后面单独验证扩充后的完整库。
function context(beforeApp = 'EVENTS.splice(8);', logger = console, includeYoung = false, includeMiddle = false, debug = false) {
  const ctx = vm.createContext({ console: logger, URLSearchParams, location:{search:debug?'?debug=1':''}, document: {
    getElementById(id) { if (!nodes.has(id)) nodes.set(id, new Element()); return nodes.get(id); },
    createElement() { return new Element(); }
  }, localStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) }, confirm: () => true });
  const files = ['player.js', 'life-state.js', 'mortality.js','economy.js','tags.js', 'events.js', ...(includeYoung ? ['events-young.js'] : []), ...(includeMiddle ? ['events-middle.js'] : []), 'engine.js', 'annual.js', 'validation.js','summary.js', 'app.js'];
  for (const file of files) {
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
assert.ok(run('!state.player.alive && state.player.death.deathAge === state.player.age && state.player.age <= MAX_LIFE_AGE'));
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

// Phase 3：局部候选验证概率与隔离边界，不向正式EVENTS添加事件。
run(`{
  const expect = (ok, message) => { if (!ok) throw Error(message); };
  const p = createPlayer(); p.age = 40; p.lifeStage = stageFor(40)[1];
  const h = (age, tags, eventId = 'past') => ({age, eventId, eventTags: tags});
  const candidate = (id, tags, weight = 1) => ({...EVENTS[0], id, category: 'random',
    priority: 0, weight, eventTags: tags, repeatable: true, cooldown: 0,
    conditions: {minAge: 18, maxAge: 110}, isMajorNode: false});
  const a = candidate('theme_work', ['工作'], 8), b = candidate('theme_friend', ['朋友'], 2);
  p.history = [h(37,['过期']),h(38,['工作','晚年','生活']),h(38,['工作']),
    h(39,['工作','健康']),h(39,['金钱'],null),h(40,['健康']),h(41,['未来']),
    {eventId:'missing_age',eventTags:['无年龄']}];
  const before = JSON.stringify(p), candidatesBefore = JSON.stringify([a,b]);
  const themes = recentThemeCounts(p);
  expect(themes.get('工作') === 2 && themes.get('健康') === 2, '主题窗口或同年去重错误');
  for (const tag of ['过期','未来','金钱','晚年','生活','无年龄']) expect(!themes.has(tag), '误计历史 '+tag);
  expect(themeDecay(candidate('both',['工作','健康']),themes) === 1/3, '多标签叠加惩罚');
  p.stress = 80;
  a.weightModifiers = [{stats:{stress:{min:60}},multiplier:3,reason:'当前压力较高'}];
  expect(eventWeight(a,p) === 24, '主题分析覆盖属性基准权重');
  expect(pickEvent(p,()=>.75,[a,b]) === a && pickEvent(p,()=>.85,[a,b]) === b, '软降权未改变实际抽取');
  let decayed = 0, plain = 0;
  const noHistory = {...p, history: []};
  for (let i=0;i<1000;i++) {
    const random = () => (i+.5)/1000;
    if (pickEvent(p,random,[a,b]) === a) decayed++;
    if (pickEvent(noHistory,random,[a,b]) === a) plain++;
  }
  expect(decayed === 800 && plain === 923, '主题权重比例与实际概率不一致');
  p.stress = JSON.parse(before).stress; delete a.weightModifiers;
  expect(JSON.stringify(p) === before && JSON.stringify([a,b]) === candidatesBefore, '分析写入Player或事件');

  p.history.push(h(40,['工作']));
  expect(themeDecay(a,recentThemeCounts(p)) === 1/4, '三年主题降权边界错误');
  p.history = [h(39,['工作'])];
  expect(selectionPool(p,[a,b]).length === 2, '普通random仍硬筛掉重复主题');
  expect(pickEvent(p,()=>0,[a,b]) === a && pickEvent(p,()=>.999,[a,b]) === b, '候选失去正概率');
  const alsoWork = candidate('also_work',['工作','健康']);
  expect(pickEvent(p,()=>0,[a,alsoWork]) === a && pickEvent(p,()=>.999,[a,alsoWork]) === alsoWork, '全部重复主题时丢失候选');
  for (const roll of [0,.5,.999]) {
    let calls = 0;
    expect(pickEvent(p,()=>{calls++;return roll;},[a]) === a && calls === 1, '唯一候选或随机调用改变');
  }
  p.history = [h(38,['工作']),h(39,[],null),h(40,[],null)];
  expect(recentThemeCounts(p).get('工作') === 1, '平静年份扩展或截断真实窗口');
  p.age = 41; expect(!recentThemeCounts(p).has('工作'), '过期主题未恢复'); p.age = 40;

  // 前三类保留原优先级及上一事件避重；Major即使被旧避重移出也不能误启用降权。
  for (const category of ['milestone','followup','conditional']) {
    p.history = [h(38,['朋友']),h(39,['工作'])];
    const x = {...a,category,priority:10}, y = {...b,category,priority:10};
    expect(selectionPool(p,[x,y]).length === 1 && pickEvent(p,()=>0,[x,y]) === y, '受保护类别避重改变 '+category);
    x.priority = 20; expect(pickEvent(p,()=>.999,[x,y,a]) === x, '类别/priority改变 '+category);
    p.history = [h(38,['工作']),h(39,['工作']),h(40,['工作','健康'])];
    const weightedX = {...x,eventTags:['工作','健康']}, weightedY = {...y,priority:20,eventTags:['朋友','健康']};
    expect(pickEvent(p,()=>.75,[weightedX,weightedY]) === weightedX, '受保护类别误降权 '+category);
  }
  p.history = [h(38,['朋友']),h(39,['工作'])];
  const major = {...a,isMajorNode:true}, friend = {...b,weight:1}, interest = candidate('theme_interest',['兴趣']);
  const selection = {};
  expect(selectionPool(p,[major,friend,interest],selection).length === 2 && !selection.softDecay, '含Major的原池误启用降权');
  expect(pickEvent(p,()=>.4,[major,friend,interest]) === friend && pickEvent(p,()=>.6,[major,friend,interest]) === interest, 'Major池权重改变');
  expect(pickEvent(p,()=>.999,[major]) === major, '唯一Major丢失');
  const cooling = {...a,cooldown:3}; p.history = [h(39,['工作'],a.id)];
  expect(!eligible(cooling,p) && pickEvent(p,()=>0,[cooling]) === null, '降权绕过cooldown');
  p.age = 42; expect(eligible(cooling,p) && pickEvent(p,()=>.999,[cooling]) === cooling, 'cooldown到期不可达');
  p.alive = false; expect(pickEvent(p,()=>0,[a,b]) === null, '死后抽取事件');
}`);
console.log('PASS: temporary 3-year themes, quiet-year exclusion, positive soft weights (923/1000 -> 800/1000), sole candidates, unchanged categories/Major/cooldowns and no Player writes.');

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
  assert.ok(run('!state.player.alive && state.player.death.deathAge === state.player.age && state.player.age <= MAX_LIFE_AGE'));
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
run('state.player.health = 0; recordDeath(state.player, "健康严重恶化"); save();');
ctx = context();
assert.equal(run('state.player.alive'), false);

const reported = [];
ctx = context('EVENTS[0].weight = 0;', {error: x => reported.push(x), warn: x => reported.push(x)}, false, false, true);
assert.equal(nodes.get('start').disabled, true);
assert.equal(nodes.get('data-diagnostics').hidden, false);
assert.match(nodes.get('data-diagnostics').textContent, /birth.*weight/);
nodes.get('start').onclick();
assert.equal(run('state'), null);
assert.ok(reported.length);
ctx = context(`EVENTS.push({...EVENTS[0], id: 'other_birth'});`, {error() {}, warn: x => reported.push(x)}, false, false, true);
assert.equal(nodes.get('start').disabled, false);
assert.match(nodes.get('data-diagnostics').textContent, /开发审查提醒（不一定是错误）/);
console.log('PASS: invalid event fields, milestone conflicts, both choice paths, valid old saves, malformed-save recovery, preserved storage and visible startup diagnostics.');

storage.clear();
ctx = context('');
assert.equal(run('EVENTS.length'), 28);
assert.equal(run('checkEvents(EVENTS).errors.length'), 0);
assert.equal(run('checkEvents(EVENTS).warnings.length'), 0);
// 从真实出生开始模拟不同人生，不伪造标签或前置历史。
// 每个事件必须至少有一条被引擎真正选中的路径；每年的状态都验证可存档。
const coverage = run(`(() => {
  const counts = {}, witnesses = {};
  for (let seed = 1; seed <= 160; seed++) {
    let value = seed;
    const random = () => { value = (Math.imul(value, 1664525) + 1013904223) >>> 0; return value / 4294967296; };
    const player = createPlayer(), world = createWorld();
    while (player.alive) {
      const event = pickEvent(player, random);
      const saved = {version: SAVE_VERSION, player, world, annual:createAnnualProgress(player), currentEventId: event?.id || null, resolved: false, result: ''};
      if (!validSave(saved)) throw Error('invalid pending save at ' + player.age);
      if (event) {
        const choice = event.choices[Math.floor(random() * event.choices.length)];
        applyChoice(player, event, choice);
        counts[event.id] = (counts[event.id] || 0) + 1;
        witnesses[event.id] ||= player.history.filter(h => h.eventId).map(h => ({age: h.age, id: h.eventId, choice: h.choiceId}));
        saved.resolved = true; saved.result = choice.resultText; saved.annual=createAnnualProgress(player);
        if (!validSave(saved)) throw Error('invalid resolved save ' + event.id);
      } else player.history.push({age: player.age, year: world.year, eventId: null, eventTags: [], text: '平静的一年。', importance: 0});
      advanceYear(player, world);
    }
    if (!validSave({version: SAVE_VERSION, player, world, annual:createAnnualProgress(player), currentEventId: null, resolved: false, result: ''})) throw Error('invalid end save');
  }
  return {counts, witnesses, missing: EVENTS.filter(e => !counts[e.id]).map(e => e.id)};
})()`);
assert.equal(coverage.missing.length, 0, `无法触发：${coverage.missing.join(', ')}`);
for (const [followup, prerequisites] of Object.entries({
  old_album: ['art_class', 'interest'], boss_message: ['phone_request', 'first_job'],
  relatives_adult: ['relatives_child', 'major'], spring_home: ['red_envelope', 'first_job'], home: ['score95']
})) {
  const path = coverage.witnesses[followup];
  const end = path[path.length - 1];
  assert.equal(end.id, followup);
  for (const prerequisite of prerequisites) assert.ok(path.slice(0, -1).some(h => h.id === prerequisite && h.age < end.age), `${followup} 缺少较早的前置 ${prerequisite}`);
  assert.equal(run(`eligible(EVENTS.find(e => e.id === '${followup}'), {...createPlayer(), age: ${end.age}, lifeStage: stageFor(${end.age})[1]})`), false);
}
// 使用完整事件库再跑一次真实按钮流程，包含选择前后刷新恢复。
nodes.get('start').onclick();
let steps = 0;
while (run('state.player.alive')) {
  if (nodes.get('choices').children.length) {
    ctx = context('');
    nodes.get('choices').children[steps % 2].onclick();
    ctx = context('');
  }
  assert.equal(run('validSave(state)'), true);
  nodes.get('grow').onclick();
  assert.ok(++steps <= 110);
}
assert.ok(run('!state.player.alive && state.player.death.deathAge === state.player.age && state.player.age <= MAX_LIFE_AGE'));
console.log('PASS: 28 events, zero data errors/warnings, 160 seeded lives, all events reachable, cross-age chains, save validation and full UI life with reloads.');

// V0.2 阶段1：测试事件只放在测试环境，不加入正式剧情库。
run(`{
  const expect = (condition, message) => { if (!condition) throw Error(message); };
  const interest = EVENTS.find(e => e.id === 'interest');
  const branches = ['art', 'math'].map(choiceId => ({...EVENTS[0], id: 'test_future_' + choiceId,
    category: 'followup', conditions: {minAge: 35, maxAge: 35,
      historyChoicesAll: [{eventId: 'interest', choiceId}],
      historyChoicesNone: [{eventId: 'interest', choiceId: choiceId === 'art' ? 'math' : 'art'}]}}));
  EVENTS.push(...branches);
  expect(checkEvents(EVENTS).errors.length === 0, '合法历史选择条件被拒绝');
  for (const choiceId of ['art', 'math']) {
    const p = createPlayer(); p.age = 13; p.lifeStage = stageFor(13)[1];
    applyChoice(p, interest, interest.choices.find(c => c.id === choiceId));
    p.age = 35; p.lifeStage = stageFor(35)[1];
    expect(pickEvent(p).id === 'test_future_' + choiceId, '过去选择未改变真实选事件结果');
    expect(!eligible(branches.find(e => e.id !== 'test_future_' + choiceId), p), '错误分支仍然可选');
  }
  const nobody = createPlayer(); nobody.age = 35;
  expect(branches.every(e => !eligible(e, nobody)), '没有历史也触发了后续');
  EVENTS.splice(28);

  const p = createPlayer(); p.age = 23; p.lifeStage = stageFor(23)[1];
  const job = EVENTS.find(e => e.id === 'first_job');
  applyChoice(p, job, job.choices[0]);
  expect(p.work.status === 'employed' && p.work.startYear === 2023 && p.work.workStyle === 'balanced', '工作状态或年份错误');
  expect(p.history[0].stateChanges.work.before.status === 'not_working' && p.history[0].stateChanges.work.after.status === 'employed', '就业历史缺少前后状态');
  let changeNumber = 0; const {monthlyIncome, ...baseStateChoice} = job.choices[0];
  const change = patch => applyChoice(p, {...job, id: 'state_test_' + ++changeNumber}, {...baseStateChoice, effects: {}, addTags: [], removeTags: [], stateChanges: patch});
  const saved = () => ({version: 2, player: p, world: {...createWorld(), year: p.birthYear + p.age}, currentEventId: null, resolved: false, result: ''});
  change({work: {level: 2}});
  expect(p.work.startYear === 2023 && p.work.level === 2, '岗位更新覆盖了就业开始年份');
  change({work: {status: 'unemployed'}});
  expect(p.work.status === 'unemployed' && p.work.startYear === null && p.work.level === 0, '离职没有清理当前岗位');
  p.age = 24;
  change({work: {status: 'employed', workStyle: 'flexible', careerType: 'general', level: 1}});
  expect(p.work.startYear === 2024, '再次就业年份错误');
  change({relationship: {status: 'dating'}});
  expect(p.relationship.startYear === 2024, '恋爱年份错误');
  p.age = 26; p.lifeStage = stageFor(26)[1];
  change({relationship: {status: 'married'}, housing: {status: 'renting'}});
  expect(p.relationship.status === 'married' && p.relationship.startYear === 2026 && p.housing.status === 'renting', '结婚或租房状态错误');
  change({child: {hasChild: true}});
  expect(p.child.birthYear === 2026 && childAge(p) === 0, '出生年份错误');
  p.age = 30;
  change({housing: {status: 'owns_home'}});
  expect(childAge(p) === 4 && p.housing.status === 'owns_home', '孩子年龄或住房状态错误');
  expect(eligible({...job, id: 'state_test', conditions: {states: {work: {status: 'employed'}, child: {hasChild: true}, housing: {status: 'owns_home'}}}}, p), '状态筛选失败');
  expect(!eligible({...job, id: 'state_test', conditions: {states: {relationship: {status: 'single'}}}}, p), '不匹配的状态被放行');
  expect(validSave(saved()), '状态历史无法存档');
  const restored = upgradeSave(JSON.parse(JSON.stringify(saved())));
  expect(restored.player.child.birthYear === 2026 && restored.player.relationship.startYear === 2026, '恢复丢失状态年份');
  change({relationship: {status: 'single'}});
  expect(p.relationship.startYear === null, '单身保留了当前关系年份');
  change({work: {status: 'retired'}});
  expect(p.work.status === 'retired' && validSave(saved()), '退休状态无法保存');

  for (const patch of [{child: {hasChild: true}}, {child: {hasChild: false}}, {housing: {status: 'castle'}},
    {work: {status: 'unemployed', level: 3}}, {work: {level: 2}}, {relationship: {startYear: 2099}},
    {child: {birthYear: 2020}}, {unknown: {status: 'employed'}}, JSON.parse('{"__proto__":{"status":"employed"}}')]) {
    const before = JSON.stringify(p);
    let rejected = false;
    try { applyChoice(p, job, {...job.choices[0], effects: {money: 100}, stateChanges: patch}); } catch { rejected = true; }
    expect(rejected && JSON.stringify(p) === before, '非法修改造成部分属性或历史变化');
  }
  const independent = createPlayer();
  expect(independent.work.status === 'not_working' && independent.child.hasChild === false, '新人物共享了状态对象');
}`);
const newBadEvents = [
  ['e.conditions.historyChoicesAll = "art"', 'historyChoicesAll'],
  ['e.conditions.historyChoicesNone = [null]', 'historyChoicesNone'],
  ['e.conditions.historyChoicesAll = [{eventId: "missing", choiceId: "art"}]', '找不到事件'],
  ['e.conditions.historyChoicesNone = [{eventId: "interest", choiceId: "missing"}]', '找不到选择'],
  ['e.conditions.historyChoicesAll = [{eventId: "interest", choiceId: "art"}]; e.conditions.historyChoicesNone = e.conditions.historyChoicesAll', '同时要求和排除'],
  ['e.conditions.states = {work: {status: "boss"}}', '非法状态值'],
  ['e.choices[0].stateChanges = null', 'stateChanges'],
  ['e.choices[0].stateChanges = {work: {level: -1}}', '非法状态值'],
  ['e.choices[0].stateChanges = {relationship: {status: "partnered"}}', '非法状态值'],
  ['e.choices[0].stateChanges = {child: {birthYear: 2000}}', '年份由引擎'],
  ['e.choices[0].stateChanges = {housing: {statuz: "renting"}}', '未知状态字段'],
  ['e.choices[0].stateChanges = {work: {status: "unemployed", level: 2}}', '非就业状态']
];
for (const [mutation, expected] of newBadEvents) {
  const report = run(`(() => { const e = JSON.parse(JSON.stringify(EVENTS[0])); ${mutation}; return checkEvents([e, ...EVENTS.slice(1)]); })()`);
  assert.ok(report.errors.some(message => message.includes(expected)), mutation);
}

// 模拟真正的 V0.1：没有新增字段，没有状态变更记录，保留既有选择。
const legacyRaw = run(`(() => {
  const p = createPlayer(); p.age = 23; p.lifeStage = stageFor(23)[1]; p.identity = '初入职场';
  const job = EVENTS.find(e => e.id === 'first_job'); applyChoice(p, job, job.choices[0]);
  for (const group of Object.keys(LIFE_STATE_FIELDS)) delete p[group];
  for (const h of p.history) delete h.stateChanges;
  return JSON.stringify({version: 1, player: p, world: {...createWorld(), year: 2023}, currentEventId: job.id, resolved: true, result: job.choices[0].resultText});
})()`);
storage.set('east-asian-life-v01', legacyRaw);
ctx = context('');
assert.equal(run('state.version'), 5);
assert.equal(run('state.player.work.status'), 'not_working');
assert.equal(run('state.player.relationship.status'), 'single');
assert.equal(run('state.player.child.hasChild'), false);
assert.equal(run('state.player.housing.status'), 'with_family');
assert.equal(run('state.player.history[0].choiceId'), 'steady');
assert.equal(storage.get('east-asian-life-v01'), legacyRaw, '升级读取不立即覆盖原存档');
assert.equal(run('validSave(state)'), true);
assert.equal(run('JSON.stringify(upgradeSave(state)) === JSON.stringify(state)'), true, '重复升级应保持一致');
nodes.get('grow').onclick();
assert.equal(JSON.parse(storage.get('east-asian-life-v01')).version, 5);

const version2Raw = storage.get('east-asian-life-v01');
for (const mutation of ['delete data.player.work', 'data.player.relationship = null',
  'data.player.child = {hasChild: true, birthYear: 2099}', 'data.player.child = {hasChild: false, birthYear: 2023}',
  'data.player.work.status = "CEO"', 'data.player.housing.status = "castle"',
  'data.player.relationship = {status: "married", startYear: null}',
  'data.player.history[0].stateChanges = {child: {before: null, after: {hasChild: true, birthYear: 2023}}}']) {
  const raw = run(`(() => { const data = ${version2Raw}; ${mutation}; return JSON.stringify(data); })()`);
  storage.set('east-asian-life-v01', raw); ctx = context('');
  assert.equal(run('state'), null, mutation);
  assert.equal(storage.get('east-asian-life-v01'), raw);
}
// V1 只补缺失项，不能把已经写坏的状态默默重置。
storage.set('east-asian-life-v01', legacyRaw.replace('"player":{', '"player":{"child":null,'));
ctx = context('');
assert.equal(run('state'), null);
storage.set('east-asian-life-v01', version2Raw);
ctx = context('');
assert.equal(run('state.version'), 5);
console.log('PASS: choice-specific branches, exclusion conditions, state filters, employment/relationships/child/housing, atomic rejection, state-change history, V1 migration and V2 restoration.');

// 旧存档的待选、已结束和部分新字段情况同样要可恢复。
const legacyCases = run(`(() => {
  const make = (age, currentEventId) => {
    const player = createPlayer(); player.age = age; player.lifeStage = stageFor(age)[1]; player.alive = age < 80;
    for (const group of Object.keys(LIFE_STATE_FIELDS)) delete player[group];
    return {version: 1, player, world: {...createWorld(), year: player.birthYear + age}, currentEventId, resolved: false, result: ''};
  };
  const pending = make(0, 'birth'), ended = make(80, null), partial = make(0, 'birth');
  partial.player.relationship = {status: 'single'};
  return [pending, ended, partial].map(data => JSON.stringify(data));
})()`);
for (const raw of legacyCases) {
  storage.set('east-asian-life-v01', raw); ctx = context('');
  assert.equal(run('state.version'), 5);
  assert.equal(run('validSave(state)'), true);
  assert.equal(run('state.player.child.birthYear'), null);
  assert.equal(storage.get('east-asian-life-v01'), raw);
}
// 当前版本的新就业记录刷新后仍保持原年份和前后状态。
nodes.get('start').onclick();
while (run('state.player.age < 23')) {
  if (nodes.get('choices').children.length) nodes.get('choices').children[0].onclick();
  nodes.get('grow').onclick();
}
nodes.get('choices').children[1].onclick();
ctx = context('');
assert.equal(run('state.player.work.status'), 'employed');
assert.equal(run('state.player.work.startYear'), 2023);
assert.equal(run('state.player.work.workStyle'), 'high_pressure');
assert.equal(run('state.player.history.at(-1).stateChanges.work.before.status'), 'not_working');
assert.match(nodes.get('life-states').textContent, /在职/);
console.log('PASS: pending/ended/partial V1 save upgrade and first-job state/history persisted through UI reload.');

// 阶段2专用事件只存在于测试环境。通过真实按钮测试年度流程。
const annualBase = JSON.parse(run('JSON.stringify(EVENTS[0])'));
function annualEvent(id, major = false, priority = 10, extra = {}) {
  return {...annualBase, id, title: id, category: 'conditional', isMajorNode: major, priority,
    conditions: {minAge: 28, maxAge: 29}, eventTags: [id],
    choices: [{id: 'go', text: '选择', resultText: '已选择', effects: {}, addTags: [], removeTags: [], historyText: id, importance: 2}], ...extra};
}
let annualSetup = '';
function startAnnualTest(events, playerSetup = '') {
  storage.clear();
  annualSetup = `EVENTS.splice(0, EVENTS.length, ...${JSON.stringify(events)});`;
  ctx = context(annualSetup, {error() {}, warn() {}});
  assert.equal(run('eventReport.errors.length'), 0);
  run(`{
    const player = createPlayer(); player.age = 28; player.lifeStage = stageFor(28)[1]; ${playerSetup}
    state = {version: SAVE_VERSION, player, world: {...createWorld(), year: 2028}, currentEventId: null, resolved: false, result: ''};
    beginYear(state, () => 0); save(); render();
  }`);
  assert.equal(run('validSave(state)'), true);
}
function annualChoose() {
  nodes.get('choices').children[0].onclick();
  assert.equal(run('validSave(state)'), true);
}
function annualNext() {
  nodes.get('grow').onclick();
  assert.equal(run('validSave(state)'), true);
}
function annualReload() {
  ctx = context(annualSetup, {error() {}, warn() {}});
  assert.equal(run('state !== null && validSave(state)'), true);
}

startAnnualTest([annualEvent('ordinary_a', false, 100), annualEvent('ordinary_b', false, 10)]);
assert.equal(run(`(() => {const before = JSON.stringify(state); beginYear(state, () => {throw Error('不应重抽');}); return JSON.stringify(state) === before;})()`), true);
annualChoose();
assert.equal(nodes.get('grow').textContent, '长大一岁 →');
annualNext();
assert.equal(run('state.player.age'), 29);
assert.equal(run('state.player.history.filter(h => h.age === 28 && h.eventId).length'), 1);

startAnnualTest([annualEvent('ordinary', false, 100), annualEvent('node', true, 10)]);
annualChoose();
assert.equal(nodes.get('grow').textContent, '继续这一年 →');
annualReload();
assert.equal(run('state.player.age'), 28);
assert.equal(run('state.annual.processedCount'), 1);
assert.equal(run('state.currentEventId'), 'ordinary');
assert.equal(nodes.get('choices').children.length, 0);
annualNext();
assert.equal(run('state.currentEventId'), 'node');
assert.equal(run('state.player.age'), 28);
annualReload(); // 第二件尚未选择时也恢复原卡片。
assert.equal(run('state.currentEventId'), 'node');
annualChoose(); annualReload();
assert.equal(run('state.annual.processedCount'), 2);
assert.equal(nodes.get('choices').children.length, 0);
annualNext();
assert.equal(run('state.player.age'), 29);
assert.equal(run('state.player.history.filter(h => h.age === 28 && h.eventId).length'), 2);

startAnnualTest([annualEvent('node_a', true, 100), annualEvent('node_b', true, 10)]);
annualChoose(); annualNext(); annualChoose();
assert.equal(run('state.player.age'), 28);
assert.equal(run('JSON.stringify(state.annual.eventIds)'), '["node_a","node_b"]');
console.log('DEMO: age 28 node_a -> continue same year -> node_b; age remains 28, completed=2; next advances to 29.');
annualNext(); assert.equal(run('state.player.age'), 29);

startAnnualTest(['a','b','c','d'].map((id, i) => annualEvent(id, true, 100-i)));
for (let i = 0; i < 3; i++) { annualChoose(); if (i < 2) annualNext(); }
assert.equal(run('state.annual.processedCount'), 3);
assert.equal(run('pendingMajorNodes(state).length'), 1);
assert.equal(nodes.get('grow').textContent, '长大一岁 →');
annualReload(); annualNext();
assert.equal(run('state.player.age'), 29);
assert.equal(run('state.currentEventId'), 'd'); // 年龄窗口内仍有机会。
annualChoose(); annualNext();
assert.equal(run('state.player.age'), 30);

const breakup = annualEvent('breakup', true, 100);
breakup.choices[0].stateChanges = {relationship: {status: 'single'}};
const marriage = annualEvent('marriage', true, 10, {conditions: {minAge: 28, maxAge: 29, states: {relationship: {status: 'dating'}}}});
startAnnualTest([breakup, marriage], 'player.relationship = {status: "dating", startYear: 2026};');
assert.equal(run('eligible(EVENTS[1], state.player)'), true);
annualChoose();
assert.equal(run('state.player.relationship.status'), 'single');
assert.equal(run('pendingMajorNodes(state).length'), 0);
annualReload();
assert.equal(nodes.get('grow').textContent, '长大一岁 →');
annualNext();
assert.equal(run('state.player.age'), 29);
assert.equal(run('state.currentEventId'), null);
console.log('DEMO: age 28 breakup changes dating -> single; marriage node becomes ineligible before display and stays absent after reload.');

const hire = annualEvent('hire', false, 100);
hire.choices[0].stateChanges = {work: {status: 'employed', careerType: 'general', level: 1, workStyle: 'stable'}};
const settle = annualEvent('settle', true, 10, {conditions: {minAge: 28, maxAge: 29, states: {work: {status: 'employed'}}}});
settle.choices[0].stateChanges = {housing: {status: 'renting'}, child: {hasChild: true}};
startAnnualTest([hire, settle]);
assert.equal(run('eligible(EVENTS[1], state.player)'), false);
annualChoose(); annualReload(); annualNext();
assert.equal(run('state.currentEventId'), 'settle');
annualChoose(); annualReload();
assert.equal(run('state.player.work.startYear'), 2028);
assert.equal(run('state.player.child.birthYear'), 2028);
assert.equal(run('state.player.housing.status'), 'renting');
assert.equal(run('state.player.history.at(-1).stateChanges.child.after.birthYear'), 2028);

startAnnualTest([annualEvent('repeat', true, 100, {repeatable: true, cooldown: 0})]);
annualChoose();
assert.equal(nodes.get('grow').textContent, '长大一岁 →');
annualNext();
assert.equal(run('state.player.age'), 29);
assert.equal(run('state.currentEventId'), 'repeat'); // 可以跨年重复，不允许同年重复。
startAnnualTest([annualEvent('cooldown', true, 100, {repeatable: true, cooldown: 2, conditions: {minAge: 28, maxAge: 32}})]);
annualChoose(); annualNext();
assert.equal(run('state.player.age'), 29);
assert.equal(run('state.currentEventId'), null);
annualNext();
assert.equal(run('state.currentEventId'), 'cooldown');
assert.equal(run('state.player.age'), 30);

for (const limit of [0, -1, 4, 1.5, '3', Infinity]) assert.equal(run(`checkEvents(EVENTS, ${JSON.stringify(limit)}).errors.some(e => e.includes('年度上限'))`), true);
assert.equal(run('checkEvents([{...EVENTS[0], isMajorNode: "true"}]).errors.some(e => e.includes("isMajorNode"))'), true);
assert.equal(run('checkEvents([EVENTS[0], {...EVENTS[0], cooldown: 0}]).warnings.some(w => w.includes("同年去重"))'), true);
assert.equal(run(`checkEvents([0,1,2,3].map(i => ({...EVENTS[0], id: 'fixed_'+i, conditions: {minAge:28,maxAge:28}}))).warnings.some(w => w.includes('超过年度上限'))`), true);

// 年度状态被篡改时不能靠刷新恢复出重复事件或更多年度名额。
const annualRaw = storage.get('east-asian-life-v01');
for (const mutation of ['delete data.annual', 'data.annual.year = 2099', 'data.annual.age = 29',
  'data.annual.mainEventDrawn = false', 'data.annual.processedCount = -1', 'data.annual.processedCount = 4',
  'data.annual.eventIds = ["cooldown", "cooldown"]']) {
  const raw = run(`(() => {const data = ${annualRaw}; ${mutation}; return JSON.stringify(data);})()`);
  storage.set('east-asian-life-v01', raw);
  ctx = context(annualSetup, {error() {}, warn() {}});
  assert.equal(run('state'), null, mutation);
  assert.equal(storage.get('east-asian-life-v01'), raw);
}

// 阶段1 version 2 升级，不重抽主要事件，不改变人生状态。
storage.clear(); ctx = context(''); nodes.get('start').onclick(); nodes.get('choices').children[0].onclick();
const v2Raw = run('(() => {const old = JSON.parse(JSON.stringify(state)); old.version = 2; delete old.annual; return JSON.stringify(old);})()');
storage.set('east-asian-life-v01', v2Raw); ctx = context('');
assert.equal(run('state.version'), 5);
assert.equal(run('state.annual.mainEventDrawn'), true);
assert.equal(run('state.annual.processedCount'), 1);
assert.equal(run('state.currentEventId'), 'birth');
assert.equal(nodes.get('choices').children.length, 0);
assert.equal(storage.get('east-asian-life-v01'), v2Raw);
assert.equal(run(`(() => {const before=JSON.parse(${JSON.stringify(v2Raw)}).player, after=JSON.parse(JSON.stringify(state.player)); for(const p of [before,after]) {delete p.lifespan;delete p.death;} return JSON.stringify(before)===JSON.stringify(after);})()`), true);
console.log('PASS: ordinary once, same-year major nodes, 3-event cap, age-window retry, dynamic invalidation/unlock, first/second-event reloads, cooldown, validation and V2->V3 upgrade.');

// 带同年节点的完整人生，年龄仍只从0推进到80。
storage.clear();
const extraNode = annualEvent('same_year_test', true, 1, {category: 'followup', conditions: {minAge: 23, maxAge: 23, historyEventIds: ['first_job']}});
ctx = context(`EVENTS.push(${JSON.stringify(extraNode)});`, {error() {}, warn() {}});
nodes.get('start').onclick();
let fullLifeSteps = 0;
while (run('state.player.alive')) {
  if (nodes.get('choices').children.length) nodes.get('choices').children[0].onclick();
  assert.equal(run('validSave(state)'), true);
  nodes.get('grow').onclick();
  assert.ok(++fullLifeSteps <= 111);
}
assert.ok(run('!state.player.alive && state.player.death.deathAge === state.player.age && state.player.age <= MAX_LIFE_AGE'));
assert.equal(run('state.player.history.filter(h => h.age === 23 && h.eventId).length'), 2);
assert.equal(fullLifeSteps, run('state.player.age') + 1);
assert.equal(run('validSave(state)'), true);
console.log('PASS: complete birth-to-death UI life with an additional same-year node; one extra click and no extra age increment.');
// 完整50个事件的页面绑定、选择前后刷新和年度上限。
storage.clear();
const youthLogger = {error() {}, warn() {}};
ctx = context('', youthLogger, true);
assert.equal(run('EVENTS.length'), 50);
assert.equal(run('eventReport.errors.length'), 0);
nodes.get('start').onclick();
let youthUISteps = 0;
while (run('state.player.alive')) {
  if (nodes.get('choices').children.length) {
    ctx = context('', youthLogger, true);
    nodes.get('choices').children[0].onclick();
    const savedLifeStates = run('JSON.stringify([state.player.work,state.player.relationship,state.player.child,state.player.housing])');
    ctx = context('', youthLogger, true);
    assert.equal(run('JSON.stringify([state.player.work,state.player.relationship,state.player.child,state.player.housing])'), savedLifeStates);
  }
  assert.equal(run('validSave(state)'), true);
  assert.ok(run('state.annual.processedCount <= 3'));
  nodes.get('grow').onclick();
  assert.ok(++youthUISteps <= 240);
}
assert.ok(run('!state.player.alive && state.player.death.deathAge === state.player.age && state.player.age <= MAX_LIFE_AGE'));
// 随机完整人生可以保持单身；这里检查恢复与合法状态，不要求所有人生结婚。
assert.ok(['single', 'dating', 'married'].includes(run('state.player.relationship.status')));
assert.equal(run('state.player.child.hasChild'), false);
console.log('PASS: full 50-event UI life, choice reloads, relationship/work state and annual limit.');
require('./youth-tests.cjs');

// 正式68事件页面：每次选择前后都重载脚本，核对文案、状态与年度进度。
storage.clear(); ctx=context('',youthLogger,true,true);
assert.equal(run('EVENTS.length'),68); assert.equal(run('eventReport.errors.length'),0);
nodes.get('start').onclick();
let middleUISteps=0;
while(run('state.player.alive')) {
  if(nodes.get('choices').children.length) {
    const descriptionBefore=nodes.get('description').textContent;
    ctx=context('',youthLogger,true,true);
    assert.equal(nodes.get('description').textContent,descriptionBefore);
    nodes.get('choices').children[0].onclick();
    const saved=run('JSON.stringify(state)');
    assert.equal(run('state.player.history.at(-1).eventDescription'),descriptionBefore);
    ctx=context('',youthLogger,true,true);
    assert.equal(run('JSON.stringify(state)'),saved);
    assert.equal(nodes.get('description').textContent,descriptionBefore);
  }
  assert.equal(run('validSave(state)'),true);
  nodes.get('grow').onclick(); assert.ok(++middleUISteps<=240);
}
assert.ok(run('!state.player.alive && state.player.death.deathAge === state.player.age && state.player.age <= MAX_LIFE_AGE'));
assert.ok(run('state.player.history.some(h=>h.eventId?.startsWith("mid_"))'));
console.log('PASS: full 68-event UI life, pending/resolved description and choice reloads, current states and annual progress.');
require('./middle-tests.cjs');
require('./late-tests.cjs');

require('./final-tests.cjs');
